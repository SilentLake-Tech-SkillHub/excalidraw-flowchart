#!/usr/bin/env node
// Step 3 of the Skill: pack rendered diagrams into ONE self-contained HTML page and (optionally) open it.
// Usage: node scripts/deliver-html.mjs --title "标题" [--out page.html] [--open] a.svg[::图注] b.svg[::图注] ...
// Sibling <name>.excalidraw / <name>.png (same basename) are attached as download links when present.
import { readFileSync, writeFileSync, existsSync, statSync } from "node:fs";
import { execFile } from "node:child_process";
import path from "node:path";

const args = process.argv.slice(2);
const flag = (n, d) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : d; };
const open = args.includes("--open");
const skip = new Set(); ["--title", "--out"].forEach((f) => { const i = args.indexOf(f); if (i >= 0) { skip.add(i); skip.add(i + 1); } });
const inputs = args.filter((a, i) => !skip.has(i) && !a.startsWith("--"));
if (!inputs.length) { console.error('usage: deliver-html.mjs --title "标题" [--out page.html] [--open] a.svg[::图注] ...'); process.exit(2); }

const title = flag("title", "流程图");
const out = path.resolve(flag("out", path.join(path.dirname(path.resolve(inputs[0].split("::")[0])), "index.html")));
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const b64 = (buf) => Buffer.from(buf).toString("base64");

const figures = inputs.map((spec) => {
  const [file, caption] = spec.split("::");
  const svgPath = path.resolve(file);
  const base = svgPath.replace(/\.svg$/i, "");
  const svg = readFileSync(svgPath);
  const links = [];
  const add = (ext, mime, label) => { const f = `${base}${ext}`; if (existsSync(f) && statSync(f).size < 8e6) links.push(`<a download="${esc(path.basename(f))}" href="data:${mime};base64,${b64(readFileSync(f))}">${label}</a>`); };
  add(".png", "image/png", "下载 PNG"); add(".excalidraw", "application/json", "下载可编辑源文件(.excalidraw)");
  links.push(`<a download="${esc(path.basename(svgPath))}" href="data:image/svg+xml;base64,${b64(svg)}">下载 SVG</a>`);
  return `<figure><figcaption>${esc(caption || path.basename(base))}</figcaption>
<img alt="${esc(caption || path.basename(base))}" src="data:image/svg+xml;base64,${b64(svg)}">
<p class="dl">${links.join(" · ")}</p></figure>`;
});

writeFileSync(out, `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<style>
:root{--bg:#fafafa;--fg:#1e1e1e;--muted:#6b7280;--card:#fff;--line:#e5e7eb;--link:#1971c2}
@media (prefers-color-scheme:dark){:root{--bg:#16181d;--fg:#e8e8e8;--muted:#9aa0a6;--card:#fff;--line:#30343b;--link:#74c0fc}}
body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.6 -apple-system,"PingFang SC","Segoe UI",sans-serif}
main{max-width:1180px;margin:0 auto;padding:28px 16px 64px}
h1{font-size:26px;margin:0 0 24px}
figure{margin:0 0 36px}
figcaption{font-weight:600;margin-bottom:8px}
img{display:block;max-width:100%;height:auto;background:var(--card);border:1px solid var(--line);border-radius:10px}
.dl{margin:8px 0 0;color:var(--muted);font-size:14px}
.dl a{color:var(--link)}
</style></head><body><main><h1>${esc(title)}</h1>
${figures.join("\n")}
</main></body></html>`);
console.log(`ok: ${figures.length} 张图 -> ${out}`);
if (open) execFile(process.platform === "darwin" ? "open" : process.platform === "win32" ? "cmd" : "xdg-open", process.platform === "win32" ? ["/c", "start", "", out] : [out]);
