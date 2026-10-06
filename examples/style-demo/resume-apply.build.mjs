import { Scene, C } from "../../scripts/compose.mjs";
const s = new Scene();
s.text(560, 30, "简历投递流程", 44, C.gray);
s.text(105, 345, "招聘批次", 30).arrow(170, 365, 250, 365);

s.frame(290, 210, 340, 480, { title: "Query 与授权", color: C.blue });
s.block(370, 250, 180, 120, "范围 · 授权\n默认全部关闭", "blue", { hachure: true });
s.text(460, 385, "授权清单", 24, C.blue);
s.arrow(460, 480, 460, 425);
s.stack(460, 495, "blue");
s.text(460, 630, "私有档案 · 简历", 20, C.blue);

s.arrow(650, 410, 750, 410);
s.title(865, 250, "准备与评审", C.green);
s.doc(865, 320, "green");
s.text(865, 510, "评审包\n岗位清单 · 表单 · 截图", 22, C.green);

s.arrow(980, 410, 1110, 410);
s.title(1235, 250, "提交前门禁", C.purple);
s.block(1140, 320, 190, 190, "公司 · BU\n办公地 · 岗位\n志愿槽位", "purple", { dashed: true });
s.text(1235, 530, "你确认具体目标", 24, C.purple);

s.arrow(1350, 410, 1470, 410);
s.title(1580, 340, "逐个提交 → 回执", C.orange);
s.text(1580, 420, "更新追踪表", 22, C.gray);

s.path([[865, 590], [865, 725], [610, 725], [610, 695]]);
s.text(740, 737, "要修改，回到填写", 22, C.gray);
s.save(new URL("./resume-apply.skeleton.json", import.meta.url).href);
