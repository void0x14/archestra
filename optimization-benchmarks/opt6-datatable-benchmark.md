# DataTable Client Row Model

Source: `frontend/src/components/ui/data-table.tsx`

## Değişiklik

`getFilteredRowModel` her zaman açık → sadece client-paginated tablolarda açık.

```diff
-    getFilteredRowModel: getFilteredRowModel(),
+    ...(manualPagination ? {} : { getFilteredRowModel: getFilteredRowModel() }),
```

## Benchmark Sonuçları

Bu benchmark synthetic `Array.filter(() => true)` döngüsünü skip ile kıyaslar. Gerçek `@tanstack/react-table` row model veya React render maliyetini ölçmez.

| Case | Mean ms | Hz | Samples | vs Skip |
|:----|:-------:|:--:|:-------:|:-------:|
| client-side filter (BEFORE) | 0.0856 | 11,681 | 5,841 | 1x |
| **skip filter (AFTER)** | **0.0006** | **1,556,153** | **778,077** | **133.22x** |
| client-paginated (still needed) | 0.1164 | 8,589 | 4,295 | N/A |

**Synthetic hız artışı: 133.22x**. Gerçek server-paginated DataTable kazancı için component benchmarkı veya React profiler ölçümü gerekir.

## Etkilenen Component'ler

`manualPagination` kullanan tüm DataTable instance'ları:
- `frontend/src/components/roles/roles-list.tsx`
- `frontend/src/components/roles/roles-list.ee.tsx`
- `frontend/src/app/mcp/tool-guardrails/_parts/assigned-tools-table.tsx`
- Diğer server-paginated tablolar

## Test

Frontend DataTable tests: ✅ 5/5
Full frontend suite: ✅ 148/149 (1194 tests)

## Nasıl Tekrar Çalıştırılır

```bash
cd platform
backend/node_modules/.bin/vitest bench benchmarks/opt6-datatable.bench.ts --outputJson ./benchmarks/opt6-results.json
```

Raw JSON: `opt6-datatable-benchmark.json`
