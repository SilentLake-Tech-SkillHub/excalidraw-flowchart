import { Scene, C } from "../scripts/compose.mjs";
const s = new Scene();
s.text(540, 30, "阶段 ② 按需求出图", 44, C.gray);
s.text(95, 350, "一句话\n描述流程", 30).arrow(185, 385, 265, 385);

s.frame(290, 230, 330, 380, { title: "拆解", color: C.blue });
s.block(360, 270, 190, 120, "步骤 · 判断\n循环 · 执行者", "blue", { hachure: true });
s.text(455, 405, "步骤清单", 24, C.blue);
s.arrow(455, 500, 455, 450);
s.text(455, 515, "有歧义才问\n一次问一个", 22, C.blue);

s.arrow(640, 420, 760, 420);
s.title(930, 230, "选模式", C.green);
s.block(790, 270, 280, 110, "总览 / 讲解用图\n示意图模式 compose.mjs", "green", { size: 20 });
s.block(790, 440, 280, 110, "细节流程 / 分支多\nMermaid 模式 .mmd", "green", { hachure: true, size: 20 });
s.text(900, 570, "不确定：先画总览再补细节", 20, C.gray);

s.arrow(1090, 325, 1230, 400);
s.arrow(1090, 495, 1230, 440);
s.title(1370, 230, "渲染与自检", C.purple);
s.block(1250, 330, 240, 180, "render.mjs\nAI 看图检查\n文字 箭头 对齐", "purple", { dashed: true });
s.text(1370, 530, "输出 png svg\n.excalidraw", 22, C.purple);

s.path([[1370, 600], [1370, 690], [1060, 690], [1060, 555]]);
s.text(1215, 702, "有问题，改源文件重画", 22, C.gray);
s.save(new URL("./stage2.skeleton.json", import.meta.url).href);
