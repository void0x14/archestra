import { readFileSync } from "node:fs";
import path from "node:path";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

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
  plugins: [tsconfigPaths()],
  resolve: {
    alias: sharedAliases,
  },
  test: {
    globals: true,
    include: ["./src/**/*.test.{ts,tsx}"],
    environment: "jsdom",
    setupFiles: ["./vitest-setup.ts"],
    testTimeout: 10_000,
    // JSDOM-heavy frontend tests need a larger worker heap on Node 24.
    pool: "forks",
    execArgv: ["--max-old-space-size=8192"],
    // CI runs backend and frontend tests in parallel, so keep jsdom worker pressure low.
    maxConcurrency: 2,
  },
});
