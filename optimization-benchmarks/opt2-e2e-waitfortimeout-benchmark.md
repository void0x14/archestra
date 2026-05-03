# E2E waitForTimeout Temizliği

## Değişiklik

7 `waitForTimeout` çağrısı → 2 (sadece intentional retry backoff)

| Dosya | Konum | Önce | Sonra |
|-------|:-----:|:----:|:-----:|
| `e2e-tests/utils/tool-assignments.ts` | Escape sonrası | `waitForTimeout(200)` | Kaldırıldı |
| `e2e-tests/utils/dialogs.ts:26` | Escape sonrası | `waitForTimeout(250)` | `expect.not.toBeVisible` |
| `e2e-tests/utils/dialogs.ts:33` | Close sonrası | `waitForTimeout(250)` | `expect.not.toBeVisible` |
| `e2e-tests/utils/auth.ts:66` | Retry loop | `waitForTimeout(delay)` | **Korundu** (backoff) |
| `tests/static-credentials.spec.ts:208` | Escape sonrası | `waitForTimeout(200)` | Kaldırıldı |
| `tests/identity-providers.ee.spec.ts:59` | Retry loop | `waitForTimeout(2000)` | **Korundu** (backoff) |
| `tests/identity-providers.ee.spec.ts:72` | Redirect bekleme | `waitForTimeout(1000)` | `expect.poll` ile auth/page state |

## Kazanç

- %71 `waitForTimeout` azalması
- Runtime benchmark değil, statik sayım.
- Kaldırılan sabit beklemeler toplamda ~1-1.25s teorik bekleme süresini azaltır.
- Dialog/auth beklemeleri condition-based olduğu için flake yüzeyi azalır.
