import { pathToFileURL } from "node:url";
import { createClient, defineConfig } from "@hey-api/openapi-ts";
import { MCP_CATALOG_API_BASE_URL } from "../consts";

const archestraCatalogConfig = await defineConfig({
  input: `${MCP_CATALOG_API_BASE_URL}/docs`,
  output: {
    path: "./hey-api/clients/archestra-catalog",
    clean: false,
    indexFile: true,
    tsConfigPath: "./tsconfig.json",
    format: "biome",
  },
  plugins: [
    {
      name: "@hey-api/client-fetch",
      runtimeConfigPath: "./custom-client",
    },
  ],
});

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  await createClient(archestraCatalogConfig);
}
