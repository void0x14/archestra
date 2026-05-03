# Codegen Task Ayırma

## Değişiklik

Platform API ve Catalog API codegen'i ayrı script'lere bölündü.

| Script | Timing |
|--------|:------:|
| Platform API (solo) | 1.04s |
| Catalog API (solo) | 1.77s |
| Combined (old way) | 2.81s |

## Kazanç

| Senaryo | Tasarruf | Oran |
|---------|:--------:|:----:|
| Sadece platform API değişti | 1.77s | %63 |
| Sadece catalog API değişti | 1.04s | %37 |
| İkisi de değişti | 0s (aynı süre) | %0 |

## Yeni Script'ler

- `shared/hey-api/openapi-ts-api.ts` — Platform API client
- `shared/hey-api/openapi-ts-catalog.ts` — Catalog API client
- `codegen:api-client-api` — `pnpm` script (Turbo task)
- `codegen:api-client-catalog` — `pnpm` script (Turbo task)
- `turbo.json`: 2 yeni task (`@shared#codegen:api-client-api`, `@shared#codegen:api-client-catalog`)
