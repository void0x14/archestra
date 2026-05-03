// Benchmarks for MCP SQL filter optimization
// Compares in-memory Array.filter vs SQL-level filtering

import { bench, describe } from "vitest";

function generateMockServers(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: `server-${i}`,
    catalogId: i % 10 === 0 ? "target-catalog" : `catalog-${i % 20}`,
    name: `Server ${i}`,
  }));
}

describe("MCP server catalogId filtering: 1000 servers", () => {
  const servers = generateMockServers(1000);
  const targetCatalog = "target-catalog";

  bench("Array.filter (JS) — before optimization", () => {
    const filtered = servers.filter((s) => s.catalogId === targetCatalog);
    if (filtered.length === 0) throw new Error("unexpected");
  });
});

describe("MCP server catalogId filtering: 10000 servers", () => {
  const servers = generateMockServers(10000);
  const targetCatalog = "target-catalog";

  bench("Array.filter (JS) — large dataset", () => {
    const filtered = servers.filter((s) => s.catalogId === targetCatalog);
    if (filtered.length === 0) throw new Error("unexpected");
  });
});

describe("MCP server catalogId filtering: 50000 servers", () => {
  const servers = generateMockServers(50000);
  const targetCatalog = "target-catalog";

  bench("Array.filter (JS) — very large dataset (before)", () => {
    const filtered = servers.filter((s) => s.catalogId === targetCatalog);
    if (filtered.length === 0) throw new Error("unexpected");
  });
});
