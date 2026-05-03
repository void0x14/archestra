# Phase 1 — Benchmark Sonuçları

## Cost Chart Dönüşümü (find → Map)

| Case | Mean (ms) | p75 (ms) | p99 (ms) | Samples |
|------|----------|---------|---------|---------|
| Eski `find` transform | 74.82 | 75.87 | 98.83 | 10 |
| Yeni `Map` transform | 4.01 | 4.65 | 6.75 | 127 |

**Hız artışı: 18.66x**

## Nasıl Tekrar Çalıştırılır

```bash
cd platform
pnpm --filter @frontend bench:costs
```

## Dosyalar

- `cost-chart-benchmark.md` — insan okunabilir tablo
- `cost-chart-benchmark.json` — ham JSON (vitest output)
