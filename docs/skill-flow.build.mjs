import { Scene, C } from "../scripts/compose.mjs";
const s = new Scene();
s.text(560, 30, "excalidraw-flowchart 的三步调用", 44, C.gray);
s.text(105, 345, "一句话\n描述流程", 30).arrow(190, 380, 270, 380);

s.frame(290, 210, 340, 400, { title: "① 环境检查与确认", color: C.blue });
s.block(370, 250, 180, 120, "检查 Node\nChrome · 依赖", "blue", { hachure: true });
s.text(460, 385, "check-env.mjs", 24, C.blue);
s.arrow(460, 480, 460, 425);
s.text(460, 495, "缺了就先问你\n同意才安装", 22, C.blue);

s.arrow(650, 410, 750, 410);
s.title(865, 250, "② 按需求出图", C.green);
s.doc(865, 320, "green");
s.text(865, 510, "拆步骤 · 选模式 · 构图\n渲染后看图自检", 22, C.green);

s.arrow(980, 410, 1110, 410);
s.title(1235, 250, "③ HTML 交付", C.purple);
s.block(1140, 320, 190, 190, "一个页面\n图 + 图注\n可下载源文件", "purple", { dashed: true });
s.text(1235, 530, "浏览器直接打开", 24, C.purple);

s.arrow(1350, 410, 1470, 410);
s.title(1585, 340, "你确认", C.orange);
s.text(1585, 420, "要改就回到②", 22, C.gray);

s.path([[1235, 575], [1235, 700], [865, 700], [865, 575]]);
s.text(1050, 712, "有问题，回到②重画", 22, C.gray);
s.save(new URL("./skill-flow.skeleton.json", import.meta.url).href);
