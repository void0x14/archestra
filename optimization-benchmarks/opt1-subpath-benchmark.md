# @shared Subpath Geçişi

Source: `shared/index.ts` barrel → `shared/package.json` subpath exports

## Değişiklik

25 yeni subpath export eklendi, 14 dosya barrel'den subpath'e geçirildi.

| Metric | Before | After | Change |
|--------|:-----:|:-----:|:------:|
| Barrel imports (`@shared`) | 649 | 635 | −14 |
| Subpath imports (`@shared/...`) | 21 | 35 | +14 |
| Added exports | 7 | 32 | +25 |

## Dosyalar

- `shared/package.json` — 25 yeni subpath export
- 14 dosyada import dönüşümü (frontend + backend)
- `backend/vitest.config.ts` — dinamik alias generator
- `frontend/vitest.config.ts` — dinamik alias generator

## Nasıl Tekrar Çalıştırılır

```bash
cd platform
backend/node_modules/.bin/vitest bench benchmarks/opt1-subpath.bench.ts --outputJson ./benchmarks/opt1-results.json
```

Raw JSON: `opt1-subpath-benchmark.json`
