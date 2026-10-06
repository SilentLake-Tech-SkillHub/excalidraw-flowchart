#!/usr/bin/env node
// Usage: node scripts/render.mjs <input.mmd|input.json|input.excalidraw> [--out DIR] [--name NAME] [--scale 2] [--chrome PATH]
// Input kinds: Mermaid (.mmd/.md) | Excalidraw element skeleton (JSON array) | full scene (.excalidraw / {elements}).
// Output: <name>.excalidraw (editable), <name>.svg, <name>.png. Fully offline once `npm i && npm run build` has run.
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { chromium } from "playwright-core";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const args = process.argv.slice(2);
const flag = (n, d) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : d; };
const input = args.find((a, i) => !a.startsWith("--") && !(i > 0 && args[i - 1].startsWith("--")));
if (!input) { console.error("usage: render.mjs <input> [--out DIR] [--name NAME] [--scale 2] [--chrome PATH]"); process.exit(2); }
if (!existsSync(path.join(dist, "bundle.js"))) { console.error("dist/ missing: run `npm install && npm run build` first"); process.exit(2); }

const outDir = path.resolve(flag("out", path.dirname(path.resolve(input))));
const name = flag("name", path.basename(input).replace(/\.[^.]+$/, ""));
const scale = Number(flag("scale", "2"));
const chromePath = flag("chrome", process.env.CHROME_PATH ||
  ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/usr/bin/google-chrome", "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"].find(existsSync));
mkdirSync(outDir, { recursive: true });

const raw = readFileSync(input, "utf8");
let kind, payload;
if (/\.(mmd|md|mermaid)$/i.test(input)) {
  kind = "mermaid";
  const m = raw.match(/```mermaid\s*([\s\S]*?)```/);
  payload = (m ? m[1] : raw).trim();
} else {
  const j = JSON.parse(raw);
  if (Array.isArray(j)) { kind = "skeleton"; payload = j; }
  else if (j.elements) { kind = "scene"; payload = j; }
  else throw new Error("JSON must be an element array or a scene with `elements`");
}

const mime = { ".js": "text/javascript", ".html": "text/html", ".woff2": "font/woff2", ".ttf": "font/ttf" };
const server = createServer((req, res) => {
  const f = path.join(dist, decodeURIComponent(req.url.split("?")[0]).replace(/^\/$/, "/index.html"));
  if (!f.startsWith(dist) || !existsSync(f) || !statSync(f).isFile()) { res.writeHead(404).end(); return; }
  res.writeHead(200, { "content-type": mime[path.extname(f)] || "application/octet-stream" }).end(readFileSync(f));
}).listen(0, "127.0.0.1");
await new Promise((r) => server.once("listening", r));
const url = `http://127.0.0.1:${server.address().port}/`;

const browser = await chromium.launch({ executablePath: chromePath, headless: true });
try {
  const page = await browser.newPage({ deviceScaleFactor: scale });
  page.on("pageerror", (e) => console.error("page error:", e.message));
  await page.goto(url);
  await page.waitForFunction(() => window.__api);
  const { scene, svg } = await page.evaluate(async ({ kind, payload }) => {
    const api = window.__api;
    const scene = kind === "mermaid" ? await api.mermaidToScene(payload)
      : kind === "skeleton" ? await api.skeletonToScene(payload)
      : { elements: payload.elements, files: payload.files || {}, appState: payload.appState };
    return { scene, svg: await api.toSvg(scene) };
  }, { kind, payload });

  writeFileSync(path.join(outDir, `${name}.excalidraw`), JSON.stringify({
    type: "excalidraw", version: 2, source: "excalidraw-flowchart-skill",
    elements: scene.elements, appState: { viewBackgroundColor: "#ffffff", gridSize: null }, files: scene.files,
  }, null, 2));
  writeFileSync(path.join(outDir, `${name}.svg`), svg);

  await page.setContent(`<body style="margin:0;background:#fff;display:inline-block">${svg}</body>`);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  await page.locator("svg").first().screenshot({ path: path.join(outDir, `${name}.png`) });
  console.log(`ok: ${scene.elements.length} elements -> ${path.join(outDir, name)}.{excalidraw,svg,png}`);
} finally { await browser.close(); server.close(); }
