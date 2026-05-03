# Turbo Cache Env Yapılandırması

## Değişiklik

`globalEnv` daraltıldı: 3 → 1 env var.

| Env | Önce | Sonra |
|-----|:----:|:-----:|
| `ARCHESTRA_*` | `globalEnv` | `globalEnv` |
| `NEXT_PUBLIC_ARCHESTRA_*` | `globalEnv` | `build.env` |
| `CODEGEN` | `globalEnv` | `codegen.env`, `@shared#codegen.env` |

## Doğrulama

```bash
pnpm turbo build --dry-run=json
# globalCacheInputs.environmentVariables.specified.env = ["ARCHESTRA_*"]
```

## Kazanç

- `CODEGEN` değişikliği build/lint/test/type-check cache'ini bozmaz
- `NEXT_PUBLIC_ARCHESTRA_*` değişikliği sadece `build` cache'ini bozar
- CI'da gereksiz rebuild riski azaldı

Dosya: `turbo.json`
