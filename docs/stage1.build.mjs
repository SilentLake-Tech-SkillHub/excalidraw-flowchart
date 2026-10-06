import { Scene, C } from "../scripts/compose.mjs";
const s = new Scene();
s.text(540, 30, "阶段 ① 环境检查与用户确认", 44, C.gray);
s.text(95, 330, "要画图", 30).arrow(150, 355, 230, 355);

s.title(300, 215, "检查", C.blue);
s.block(250, 280, 300, 150, "Node · Chrome\nExcalidraw 依赖\n离线页面", "blue", { hachure: true });
s.text(330, 445, "check-env.mjs", 24, C.blue);
s.arrow(570, 355, 690, 355);

s.title(850, 215, "有缺项?", C.purple);
s.block(710, 280, 280, 150, "列出缺什么\n问你要不要补充", "purple", { dashed: true });
s.text(850, 445, "只询问，不安装", 22, C.purple);

// ready branch (up/right)
s.arrow(500, 280, 500, 150, { color: C.green });
s.text(560, 100, "全部就绪，直接进入阶段 ②", 24, C.green);

// agree branch
s.arrow(1010, 330, 1130, 270);
s.text(1090, 215, "你同意", 22, C.green);
s.cylinder(1250, 215, "green", 120, 110);
s.text(1250, 335, "npm install\nnpm run build", 22, C.green);

// decline branch
s.arrow(1010, 400, 1130, 500);
s.text(1090, 520, "你不同意", 22, C.orange);
s.title(1290, 480, "停下并说明", C.orange);
s.text(1290, 530, "不退而求其次\n不用在线服务", 22, C.gray);

// loop: install -> re-check
s.path([[1180, 395], [1180, 640], [480, 640], [480, 435]]);
s.text(830, 652, "补充完成，重新检查", 22, C.gray);
s.save(new URL("./stage1.skeleton.json", import.meta.url).href);
