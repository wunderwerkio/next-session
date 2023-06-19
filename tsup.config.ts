import { defineConfig } from "tsup";

const defaultConfig = {
  target: "node18",
  format: "esm",
  dts: true,
} as const;

export default defineConfig([
  {
    entry: ["src/edge/index.ts"],
    outDir: "dist/edge",
    ...defaultConfig,
  },
  {
    entry: ["src/server/index.ts"],
    outDir: "dist/server",
    ...defaultConfig,
  },
  {
    entry: ["src/types/index.ts"],
    outDir: "dist/types",
    ...defaultConfig,
  },
  {
    entry: ["src/utils/index.ts"],
    outDir: "dist/utils",
    ...defaultConfig,
  },
]);
