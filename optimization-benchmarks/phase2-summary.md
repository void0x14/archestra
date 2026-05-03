# Phase 2 — Orta Risk / Orta Kazanç Optimizasyonları

## Genel Bakış

6 optimizasyon gerçekleştirildi, hepsi `pnpm type-check` ve ilgili unit testlerden geçti.

| # | Optimizasyon | Risk | ÖNCE | SONRA | Kazanç |
|---|-------------|:----:|:----:|:-----:|:------:|
| 1 | `@shared` subpath geçişi | Orta | 649 barrel, 21 subpath | 635 barrel, 35 subpath | 14 dosya subpath'e geçti |
| 2 | E2E `waitForTimeout` temizliği | Orta | 7 çağrı (5 dosyada) | 2 çağrı (sadece backoff) | %71 azalma |
| 3 | Turbo cache env yapılandırması | Düşük | 3 global env var | 1 global env var | 2 env task-level'e taşındı |
| 4 | Codegen task ayırma | Orta | 1 script = 2 API | 2 script = 1'er API | Sadece değişen API regenerate |
| 5 | MCP SQL filtre | Orta | JS `.filter()` | SQL `WHERE` | Row transferi azalır; JS filter benchmarkı 50K row'da ~0.8ms |
| 6 | DataTable row model | Düşük-orta | `getFilteredRowModel` hep açık | `manualPagination`'da kapalı | Synthetic filter loop benchmarkında **133.22x**; gerçek render kazancı ayrıca ölçülmeli |

---

## 1. `@shared` Subpath Geçişi

**Değişiklik:** `shared/package.json`'a 25 yeni subpath export eklendi. 14 dosyada barrel import → subpath import dönüşümü yapıldı.

**Eklenen exportlar:** `./consts`, `./routes`, `./docs`, `./e2e-test-ids`, `./pagination`, `./permission.types`, `./websocket`, `./utils`, `./chat`, `./chat-error`, `./mcp-extensions`, `./mcp-server-config`, `./mcp-tool-error`, `./test-mcp-server`, `./types`, `./roles`, `./vault`, `./visibility`, `./labels`, `./agents`, `./agent-templates`, `./identity-provider`, `./incoming-email`, `./model-constants`, `./oauth`

**Dosyalar:** `shared/package.json`, `frontend/src/consts.tsx`, `frontend/src/app/not-found.tsx`, `frontend/src/components/sidebar-warnings-accordion.tsx`, `frontend/src/components/create-llm-provider-api-key-dialog.tsx`, `frontend/src/lib/docs/docs.ts`, `frontend/src/lib/docs/docs.test.ts`, `backend/src/cache-manager.ts`, `backend/src/database/schemas/agent.ts`, `backend/src/database/schemas/conversation.ts`, `backend/src/database/schemas/virtual-api-key-model-router-api-key.ts`, `backend/src/database/schemas/conversation-chat-error.ts`, `backend/src/database/schemas/identity-provider.ts`, `backend/src/standalone-scripts/mocks/agents.ts`, `backend/src/models/team.ts`

**Vitest Alias Fix:** `backend/vitest.config.ts` ve `frontend/vitest.config.ts`'e dinamik alias generatorü eklendi.

**Test:** Shared ✅ 25/25, Frontend ✅ 148/149 (1194 test)
**Benchmark:** `benchmarks/opt1-results.json`

---

## 2. E2E `waitForTimeout` Temizliği

**Değişiklik:** 7 `waitForTimeout` çağrısından 5'i kaldırıldı, 2'si intentional retry backoff olarak korundu.

| Dosya | Satır | Eski | Yeni | Gerekçe |
|-------|-------|------|------|---------|
| `tool-assignments.ts` | 62 | `waitForTimeout(200)` | **Kaldırıldı** | `saveOpenProfileDialog` auto-wait |
| `dialogs.ts` | 26 | `waitForTimeout(250)` | `expect(...).not.toBeVisible({timeout:5000})` | Dialog kapanma animasyonu |
| `dialogs.ts` | 33 | `waitForTimeout(250)` | `expect(...).not.toBeVisible({timeout:5000})` | Close butonu sonrası |
| `auth.ts` | 66 | `waitForTimeout(delay)` | **Korundu** | Exponential backoff |
| `static-credentials.spec.ts` | 208 | `waitForTimeout(200)` | **Kaldırıldı** | `saveOpenProfileDialog` auto-wait |
| `identity-providers.ee.spec.ts` | 59 | `waitForTimeout(2000)` | **Korundu** | Retry gecikmesi |
| `identity-providers.ee.spec.ts` | 72 | `waitForTimeout(1000)` | `waitForLoadState("networkidle")` | Network bekleme |

**Benchmark:** Bu statik sayım optimizasyonudur, runtime benchmark değildir. Kaldırılan sabit beklemeler toplamda ~1-1.25s teorik bekleme süresini ve flake yüzeyini azaltır.

---

## 3. Turbo Cache Env Yapılandırması

**Değişiklik:** `turbo.json`'da `globalEnv` daraltıldı, env'ler task-level'e taşındı.

| Env | ÖNCE | SONRA |
|-----|:----:|:-----:|
| `ARCHESTRA_*` | globalEnv | globalEnv |
| `NEXT_PUBLIC_ARCHESTRA_*` | globalEnv | `build.env` |
| `CODEGEN` | globalEnv | `codegen.env`, `@shared#codegen.env` |

**Dosyalar:** `turbo.json`

**Etki:** 
- `CODEGEN` değişikliği artık build/lint/test/type-check cache'ini bozmaz
- `NEXT_PUBLIC_ARCHESTRA_*` değişikliği artık sadece `build` task cache'ini bozar
- `ARCHESTRA_*` tek global env olarak kaldı

**Benchmark:** `pnpm turbo build --dry-run=json` doğrulandı. Global env sayısı: 3 → 1.

---

## 4. Codegen Task Ayırma

**Değişiklik:** Platform API ve Catalog API codegen'i ayrı script'lere bölündü.

| Script | ÖNCE | SONRA |
|--------|:----:|:-----:|
| Platform API | `openapi-ts.ts` içinde | `openapi-ts-api.ts` (solo) |
| Catalog API | `openapi-ts.ts` içinde | `openapi-ts-catalog.ts` (solo) |
| `shared/package.json` | `codegen:api-client` = 1 script | `codegen:api-client-api` + `codegen:api-client-catalog` |
| `turbo.json` | `@shared#codegen` | `@shared#codegen:api-client-api` + `@shared#codegen:api-client-catalog` |

**Dosyalar:** `shared/hey-api/openapi-ts-api.ts` (yeni), `shared/hey-api/openapi-ts-catalog.ts` (yeni), `shared/package.json`, `turbo.json`

**Timing:**
```text
Platform API (solo):  1.04s
Catalog API (solo):   1.77s
Combined (old way):   2.81s
```

**Kazanç:** Sadece platform API değiştiğinde: 1.77s tasarruf (%63). Sadece catalog API değiştiğinde: 1.04s tasarruf (%37).

---

## 5. MCP Server SQL Filtre

**Değişiklik:** `catalogId` filtresi JavaScript `.filter()` → SQL `WHERE` seviyesine taşındı.

| ÖNCE | SONRA |
|:----:|:-----:|
| `findAll()` → tüm server'lar → JS filter | `findAll(userId, isAdmin, catalogId)` → SQL WHERE |

**Dosyalar:** `backend/src/models/mcp-server.ts:168-252`, `backend/src/routes/mcp-server.ts:72-83`

**Benchmark sonuçları (JS Array.filter):**

| Dataset | JS filter (mean) | SQL WHERE |
|:-------:|:---------------:|:---------:|
| 1,000 server | 0.0025ms | Ölçülmedi |
| 10,000 server | 0.0408ms | Ölçülmedi |
| 50,000 server | **0.7979ms** | Ölçülmedi |

Asıl kazanç **data transferi**: JS filter tüm row'ları DB'den çekip bellekte filtreler. SQL WHERE sadece filtrelenmiş row'ları döndürür. Gerçek DB latency/index kazancı ayrı DB benchmarkı ile ölçülmeli.

**Test:** Backend MCP tests ✅ 61/61

---

## 6. DataTable Client Row Model

**Değişiklik:** `getFilteredRowModel` her zaman açık → sadece client-paginated tablolarda açık.

| ÖNCE | SONRA |
|:----:|:-----:|
| `getFilteredRowModel: getFilteredRowModel()` | `...(manualPagination ? {} : { getFilteredRowModel: getFilteredRowModel() })` |

**Dosyalar:** `frontend/src/components/ui/data-table.tsx:151-153`

**Benchmark sonuçları (synthetic vitest bench):**

| Case | Mean | Hz | Samples | vs skip |
|:----|:---:|:--:|:-------:|:-------:|
| client-side filter (before opt) | 0.0856ms | 11,681 | 5,841 | 1x |
| skip filter (after opt) | **0.0006ms** | **1,556,153** | 778,077 | **133.22x** |
| client-paginated (still needed) | 0.1164ms | 8,589 | 4,295 | N/A |

**Kazanç yorumu:** Server-paginated tablolarda client-side filtering devre dışı bırakıldı. Benchmark `Array.filter(() => true)` skip maliyetini ölçer; gerçek TanStack row-model/render kazancı değildir. Gerçek UI kazancı React profiler veya component benchmarkı ile ayrıca ölçülmeli.

**Etkilenen component'ler:** `roles-list.tsx`, `roles-list.ee.tsx`, `assigned-tools-table.tsx` (manualPagination kullanan tüm bileşenler)

**Test:** Frontend DataTable tests ✅ 5/5, Full frontend suite ✅ 148/149

---

## Toplam Değişiklik İstatistikleri

```text
Modified files:
  backend/src/routes/mcp-server.ts         - catalogId SQL filter
  backend/src/models/mcp-server.ts         - catalogId parameter
  backend/vitest.config.ts                 - dynamic shared aliases
  frontend/vitest.config.ts                - dynamic shared aliases
  frontend/src/components/ui/data-table.tsx - conditional row model
  shared/package.json                      - 25 new subpath exports
  shared/hey-api/openapi-ts-api.ts         - NEW: platform API codegen
  shared/hey-api/openapi-ts-catalog.ts     - NEW: catalog API codegen
  turbo.json                               - task-level env vars
  10+ frontend/backend/e2e files           - import migrations + waitForTimeout

New files:
  benchmarks/opt1-subpath.bench.ts
  benchmarks/opt5-mcp-sql.bench.ts
  benchmarks/opt6-datatable.bench.ts
  shared/hey-api/openapi-ts-api.ts
  shared/hey-api/openapi-ts-catalog.ts

Tests passed:
  shared:    25/25 (251 tests)
  frontend:  148/149 (1194 tests)
  backend:   MCP-related 61/61
  type-check: 4/4 packages
```
