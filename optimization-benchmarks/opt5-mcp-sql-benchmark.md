# MCP Server SQL Filtre

Source: `backend/src/routes/mcp-server.ts` + `backend/src/models/mcp-server.ts`

## Değişiklik

`catalogId` filtresi Array.filter (JS) → SQL WHERE seviyesine taşındı.

## Benchmark Sonuçları

Bu benchmark yalnızca eski JS `Array.filter` maliyetini ölçer. SQL `WHERE`, DB index latency, row materialization ve network transfer maliyeti bu dosyada ölçülmez.

| Dataset | Mean (JS filter) | SQL WHERE |
|:-------:|:---------------:|:---------:|
| 1,000 server | 0.0025ms | Ölçülmedi |
| 10,000 server | 0.0408ms | Ölçülmedi |
| 50,000 server | **0.7979ms** | Ölçülmedi |

## Data Transfer Kazancı

ESKİ: Tüm server row'ları DB'den çek → bellekte filtrele (50K server = tüm row'lar network'ten geçer)
YENİ: SQL `WHERE catalog_id = ?` → sadece filtrelenmiş row'lar döner

Gerçek kazanç için DB benchmarkı gerekir: aynı dataset, catalog index durumu, query plan, row materialization ve network dahil ölçülmeli.

## Test

Backend MCP route/model tests: ✅ 61/61

## Nasıl Tekrar Çalıştırılır

```bash
cd platform
backend/node_modules/.bin/vitest bench benchmarks/opt5-mcp-sql.bench.ts --outputJson ./benchmarks/opt5-results.json
```

Raw JSON: `opt5-mcp-sql-benchmark.json`
