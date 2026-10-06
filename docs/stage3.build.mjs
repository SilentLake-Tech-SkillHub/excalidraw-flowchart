import { Scene, C } from "../scripts/compose.mjs";
const s = new Scene();
s.text(540, 30, "阶段 ③ HTML 交付", 44, C.gray);
s.title(210, 190, "上一步的成品", C.blue);
s.stack(210, 270, "blue", 90, 100);
s.text(210, 400, "png · svg · excalidraw", 22, C.blue);
s.arrow(330, 340, 470, 340);

s.title(640, 190, "打包", C.green);
s.doc(640, 260, "green");
s.text(640, 450, "deliver-html.mjs\n图 + 图注 + 下载链接", 22, C.green);
s.arrow(770, 340, 910, 340);

s.title(1100, 190, "一个自包含 HTML", C.purple);
s.block(980, 260, 240, 160, "断网也能看\n浅色 深色自适应\n可直接发给别人", "purple", { dashed: true, size: 20 });
s.text(1100, 440, "--open 自动在浏览器打开", 22, C.purple);
s.arrow(1240, 340, 1380, 340);

s.title(1500, 270, "你确认", C.orange);
s.text(1500, 340, "满意：结束", 22, C.gray);
s.text(1500, 380, "要改：回到阶段 ②", 22, C.gray);

s.path([[1500, 430], [1500, 560], [640, 560], [640, 520]]);
s.text(1070, 572, "你手改过 .excalidraw 时，以你改的为准再导出", 22, C.gray);
s.save(new URL("./stage3.skeleton.json", import.meta.url).href);
