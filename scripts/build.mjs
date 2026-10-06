// Bundle the browser entry with local Excalidraw packages into dist/ (offline afterwards).
import { build } from "esbuild";
import { cpSync, mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
mkdirSync(dist, { recursive: true });

await build({
  entryPoints: [path.join(root, "scripts/entry.js")],
  bundle: true, format: "iife", outfile: path.join(dist, "bundle.js"),
  define: { "process.env.NODE_ENV": '"production"', "process.env.IS_PREACT": '"false"' },
  loader: { ".woff2": "file", ".woff": "file", ".ttf": "file", ".png": "file", ".svg": "file" },
  logLevel: "error", minify: true,
});
cpSync(path.join(root, "node_modules/@excalidraw/excalidraw/dist/prod/fonts"), path.join(dist, "fonts"), { recursive: true });
writeFileSync(path.join(dist, "index.html"), `<!doctype html><meta charset="utf-8"><body><script>window.EXCALIDRAW_ASSET_PATH="./";</script><script src="bundle.js"></script></body>`);
console.log("built", dist);
