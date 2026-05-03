// Benchmarks for DataTable client row model optimization
// Measures overhead of getFilteredRowModel on server-paginated data

import { bench, describe } from "vitest";

interface Row {
  id: string;
  name: string;
  value: number;
}

function generateRows(count: number): Row[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `row-${i}`,
    name: `Item ${i}`,
    value: Math.random() * 1000,
  }));
}

describe("DataTable row model: server-paginated (20 rows/page)", () => {
  const pageData = generateRows(20);

  bench("client-side getFilteredRowModel (before opt)", () => {
    // Simulates what getFilteredRowModel does internally
    for (let i = 0; i < 1000; i++) {
      const filtered = pageData.filter(() => true);
      if (filtered.length !== 20) throw new Error("unexpected");
    }
  });

  bench("no client-side filter (after opt — skip)", () => {
    // After optimization, no filtering happens for manualPagination
    for (let i = 0; i < 1000; i++) {
      // Just use data directly — no filter overhead
      const _data = pageData;
    }
  });
});

describe("DataTable row model: client-paginated (200 rows)", () => {
  const allData = generateRows(200);

  bench("client-side getFilteredRowModel (still needed)", () => {
    for (let i = 0; i < 100; i++) {
      const filtered = allData.filter(() => true);
      if (filtered.length !== 200) throw new Error("unexpected");
    }
  });
});
