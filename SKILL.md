---
name: excalidraw-flowchart
description: Draw hand-drawn whiteboard-style diagrams locally with Excalidraw from a natural-language process description, in three fixed steps - check the environment and ask the user before installing anything, build the diagram (colored icon-based overview or Mermaid detail flowchart), then deliver it as one self-contained HTML page with downloadable PNG, SVG and editable .excalidraw files. Use when the user asks to 画流程图、手绘风流程图、白板风示意图、架构图、把这段流程画出来、Excalidraw 图、draw a flowchart or hand-drawn diagram from a description.
---

# 手绘流程图(Excalidraw)

把一段自然语言的流程拆成"步骤、判断、循环",画成 Excalidraw 手绘白板风的图,最后以一个 HTML 页面交付。全程在本机完成,不上传用户的流程内容。

调用固定三步,按顺序执行:

| 步骤 | 做什么 | 完成标准 |
|---|---|---|
| ① 环境检查与用户确认 | 运行检查脚本,缺什么就问用户要不要补 | 环境就绪,或用户明确决定不补 |
| ② 按需求出图 | 拆解流程,选模式,构图,渲染,看图自检 | 自检通过的 PNG、SVG、`.excalidraw` |
| ③ HTML 交付 | 把图打包成一个自包含的 HTML 页面并打开 | 用户在浏览器里看到成品 |

## ① 环境检查与用户确认

**先检查,不要直接安装。** 在本 Skill 目录运行:

```bash
node scripts/check-env.mjs
```

它逐项检查 Node.js 18+、Google Chrome、Excalidraw 依赖(`node_modules/`)、离线渲染页面(`dist/`),只报告、不安装。退出码 0 表示就绪,直接进入第②步。

**有缺项时,先向用户确认再动手**:列出缺哪几项、各自要装什么、大约多大、是否需要联网,然后问"是否需要我补充这个工具"。

- 用户同意:Excalidraw 依赖和离线页面由你执行 `npm install && npm run build`(依赖约 370MB,只需联网一次;`~/.npm` 缓存目录有权限问题时用 `--cache <临时目录>`)。Node.js 和 Chrome 属于系统级软件,告诉用户去安装,不代装。
- 用户不同意或暂时不装:停下,说明没有这个工具就无法在本机出图,不要退而求其次改用其他在线服务,也不要把流程内容发到外部网站。
- 同一会话里已确认过环境就绪,后续出图不必重复检查。

## ② 按需求出图

1. **拆解**:从用户描述里列出 起点与终点、按顺序的步骤、判断点及其各分支、回到前面的循环、执行者(人/AI/系统)。有歧义且会改变图的结构时,一次只问一个问题;能合理推断的直接定,并在回复里写明假设。给出简短的步骤清单让用户核对;用户说"直接画"就跳过确认。
2. **选模式并构图**:
   - **总览、README 开头、讲解用图 → 示意图模式**:读 [示意图风格指南](references/style-guide.md),写 `xxx.build.mjs`,用 `scripts/compose.mjs` 的 `Scene` 摆彩色阶段标题、图标、分组框和箭头,输出 `xxx.skeleton.json`。元素不超过 8 个。
   - **逐步骤细节、判断分支多 → Mermaid 模式**:写 `xxx.mmd`(`flowchart TD` 竖长或 `LR` 横宽),写法见 [Mermaid 写法与避坑](references/mermaid-tips.md)。
   - 不确定时,先画一张示意图总览,再按需要给每个阶段补 Mermaid 细节图。
3. **渲染**:
   ```bash
   node scripts/render.mjs xxx.skeleton.json   # 示意图模式
   node scripts/render.mjs xxx.mmd             # Mermaid 模式
   ```
   得到同名的 `.excalidraw`、`.svg`、`.png`;`--out` 指定输出目录,`--scale` 调清晰度。
4. **看图自检**:用 Read 打开 PNG 实际看一遍,检查文字是否被截断或压在框线上、说明是否与图形居中、箭头是否指错、分支标签是否对应、节点是否过挤;示意图模式再对照[自检清单](references/style-guide.md)。有问题改源文件重画,没看过的图不交给用户。

### 输入格式

| 输入 | 适合 | 说明 |
|---|---|---|
| `.skeleton.json`(由 `compose.mjs` 生成) | 总览、示意图 | 手动摆放图标、颜色和分组,风格接近讲解白板 |
| `.mmd` / 含 ```mermaid 的 `.md` | 逐步骤的细节流程 | 自动排版,出错最少 |
| 其他 JSON 数组 | 需要精确控制位置、颜色 | Excalidraw 元素骨架,渲染时自动补齐必需字段 |
| `.excalidraw` 完整场景 | 重新导出用户改过的图 | 原样导出 SVG/PNG |

### 作图原则

- 一张图只讲一件事。示意图模式不超过 8 个元素;Mermaid 模式节点控制在 14 个左右,更长的流程拆成几张。
- 节点文字用动宾短语,不超过约 12 个汉字;判断节点写成问句,分支线标"是/否"或具体条件。
- 先交代主线,再画异常和回路;循环要有明确的退出条件。
- 中文、英文都可以直接写进图里。

## ③ HTML 交付

用交付脚本把本次所有图打包成**一个自包含的 HTML 页面**(图片和下载文件都内嵌,可直接发给别人,断网也能看):

```bash
node scripts/deliver-html.mjs --title "页面标题" --out <输出目录>/index.html --open \
  "a.svg::第一张图的图注" "b.svg::第二张图的图注"
```

页面包含每张图及其图注,并附"下载 PNG / 下载可编辑源文件(.excalidraw) / 下载 SVG"链接(同名的 `.png`、`.excalidraw` 会自动附上),自动适配浅色/深色模式。`--open` 会在默认浏览器打开。

交付时在回复里说明:页面路径、每张图一句话说明、`.excalidraw` 可以拖进 excalidraw.com 手改。用户在 Excalidraw 里手改过 `.excalidraw` 后,以他改过的为准,不要用旧源文件覆盖;需要更新页面时,重新导出再运行交付脚本。

## 边界

- 只画流程:不替用户决定流程本身对不对;信息不足的环节用假设标出,不编造步骤。
- 不联网渲染,不上传用户的流程内容;缺工具时先问用户,不擅自安装或改用在线服务。
- Mermaid 的分组(`subgraph`)转换后会丢失节点,不要使用;需要分组时用示意图模式的 `frame()`。
- 示意图模式靠手动摆放坐标,不适合节点很多的图;这类图用 Mermaid 或拆成多张。
