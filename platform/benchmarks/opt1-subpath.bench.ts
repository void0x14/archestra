import { bench, describe } from "vitest";

describe("@shared subpath resolution benchmark", () => {
  bench("barrel import: resolve @shared (all exports)", async () => {
    await import("@shared");
  });

  bench("subpath import: resolve @shared/consts", async () => {
    await import("@shared/consts");
  });

  bench("subpath import: resolve @shared/docs", async () => {
    await import("@shared/docs");
  });

  bench("subpath import: resolve @shared/routes", async () => {
    await import("@shared/routes");
  });

  bench("subpath import: resolve @shared/types", async () => {
    await import("@shared/types");
  });
});
