#!/usr/bin/env node
// Step 1 of the Skill: report which parts of the local toolchain are present. Installs NOTHING.
// Exit code 0 = ready, 3 = something missing (the agent must ask the user before fixing it).
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const chrome = (process.env.CHROME_PATH && existsSync(process.env.CHROME_PATH) ? process.env.CHROME_PATH : null) || [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/usr/bin/google-chrome",
  "/usr/bin/chromium", "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
].find(existsSync);
const nodeMajor = Number(process.versions.node.split(".")[0]);

const checks = [
  { name: "Node.js 18+", ok: nodeMajor >= 18, found: `v${process.versions.node}`, fix: "需要你先安装 Node.js(https://nodejs.org),我无法代装系统级软件" },
  { name: "Google Chrome(用于导出图片)", ok: !!chrome, found: chrome || "未找到", fix: "安装 Chrome,或设置环境变量 CHROME_PATH 指向浏览器可执行文件" },
  { name: "Excalidraw 及依赖(node_modules)", ok: existsSync(path.join(root, "node_modules/@excalidraw/excalidraw")) && existsSync(path.join(root, "node_modules/playwright-core")), found: "", fix: "在本 Skill 目录运行 npm install(约 370MB,需要联网一次)" },
  { name: "离线渲染页面(dist)", ok: existsSync(path.join(root, "dist/bundle.js")), found: "", fix: "在本 Skill 目录运行 npm run build" },
];
for (const c of checks) console.log(`${c.ok ? "✓" : "✗"} ${c.name}${c.found ? `  ${c.found}` : ""}${c.ok ? "" : `\n    → ${c.fix}`}`);
const missing = checks.filter((c) => !c.ok);
console.log(missing.length ? `\n缺少 ${missing.length} 项:请先询问用户是否补充,得到同意后再执行上面的命令。` : "\n环境就绪。");
process.exit(missing.length ? 3 : 0);
