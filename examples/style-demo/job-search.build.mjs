import { Scene, C } from "../../scripts/compose.mjs";
const s = new Scene();
s.text(600, 30, "工作搜索流程", 44, C.gray);
s.text(105, 345, "一批新的\n校招搜索", 30).arrow(190, 380, 270, 380);

s.frame(290, 210, 340, 480, { title: "范围确认", color: C.blue });
s.block(370, 250, 180, 120, "公司 · 岗位族\n排除项 · 城市", "blue", { hachure: true });
s.text(460, 385, "你确认的范围", 24, C.blue);
s.arrow(460, 480, 460, 425);
s.cylinder(460, 495, "blue", 120, 110);
s.text(460, 630, "求职配置 · 工作簿", 20, C.blue);

s.arrow(650, 410, 750, 410);
s.title(865, 250, "计划盘点", C.green);
s.doc(865, 320, "green");
s.text(865, 510, "五种固定状态\n每个计划各记一条", 22, C.green);

s.arrow(980, 410, 1110, 410);
s.title(1235, 250, "逐公司收集岗位", C.purple);
s.block(1140, 320, 190, 190, "官方入口\n标题 + 完整 JD\n去重写入岗位表", "purple", { dashed: true });
s.text(1235, 530, "写入后读回核对", 24, C.purple);

s.arrow(1350, 410, 1470, 410);
s.title(1585, 340, "汇报覆盖统计", C.orange);
s.text(1585, 420, "你选补查，或交给投递", 22, C.gray);

s.path([[1235, 575], [1235, 725], [865, 725], [865, 575]]);
s.text(1050, 737, "首轮还有没访问的公司，取下一家", 22, C.gray);
s.save(new URL("./job-search.skeleton.json", import.meta.url).href);
