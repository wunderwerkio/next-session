import { defineConfig } from "tsup";

const defaultConfig = {
  outDir: "dist",
  target: "node18",
  format: "esm",
  dts: true,
} as const;

export default defineConfig([
  {
    entry: {
      index: "src/index.ts",
    },
    ...defaultConfig,
  },
  {
    entry: {
      edge: "src/edge/index.ts",
    },
    ...defaultConfig,
  },
]);
