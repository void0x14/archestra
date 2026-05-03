import { readFileSync } from "node:fs";
import path from "node:path";
import { defineConfig } from "vitest/config";

const isCI = process.env.CI === "true";

const sharedDir = path.resolve(__dirname, "../shared");
const sharedPkg = JSON.parse(
  readFileSync(path.join(sharedDir, "package.json"), "utf-8"),
);
const sharedAliases: Record<string, string> = {};
for (const [key, value] of Object.entries<string>(sharedPkg.exports)) {
  const subpath = key.slice(2);
  if (subpath) {
    sharedAliases[`@shared/${subpath}`] = path.resolve(sharedDir, value);
  }
}
sharedAliases["@shared"] = path.resolve(sharedDir, "index.ts");

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      ...sharedAliases,
    },
  },
  test: {
    globals: true,
    include: ["./src/**/*.test.ts"],
    environment: "node",
    setupFiles: ["./src/test/setup.ts"],

    /**
     * Performance Optimizations
     *
     * Based on:
     * - https://vitest.dev/guide/improving-performance
     * - https://vitest.dev/guide/profiling-test-performance
     *
     * Note: We keep isolation enabled (default) because our database tests
     * use module-level state that needs to be reset between test files.
     * The main performance win comes from the setup.ts optimization:
     * - beforeAll: creates PGlite + runs migrations ONCE per file
     * - beforeEach: truncates tables (fast) instead of recreating DB
     */

    // Use threads pool - faster than forks for Node.js tests
    pool: "threads",

    // Increase concurrency on CI for faster test execution
    maxConcurrency: isCI ? 12 : 6,

    // Sequence settings
    sequence: {
      // Shuffle test files to balance load across workers
      shuffle: true,
    },

    // Increase test timeout for database operations
    testTimeout: 30000,

    // Hook timeout for beforeAll/afterAll (migrations can take time)
    hookTimeout: 60000,
  },
});
