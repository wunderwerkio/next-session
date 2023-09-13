import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import reactUseClient from "esbuild-react18-useclient";
import { build } from "tsup";

await build({
  entry: ["src"],
  clean: true,
  format: "esm",
  outDir: "./dist",
  target: "es2020",
  splitting: true,
  bundle: true,
  dts: true,

  esbuildPlugins: [
    // reactUseClient,
    {
      name: "demo",
      setup(build) {
        build.onEnd(async (result) => {
          for (const file of result.outputFiles) {
            const firstline = file.text.split("\n")[0];
            const origFilePath = firstline.substring(3);

            if (!firstline || !firstline.startsWith("//")) {
              continue;
            }

            const readable = fs.createReadStream(path.resolve(origFilePath));
            const reader = readline.createInterface({ input: readable });

            const line = await new Promise((resolve) => {
              reader.on("line", (line) => {
                reader.close();
                resolve(line);
              });
            });
            readable.close();

            if (line?.includes("use client")) {
              Object.defineProperty(file, "text", {
                value: '"use client";\n' + file.text,
              });
            }
          }
        });
      },
    },
  ],
  esbuildOptions(options) {
    options.chunkNames = "__chunks/[hash]";
  },
});
