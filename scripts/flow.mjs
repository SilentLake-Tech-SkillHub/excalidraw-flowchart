// Auto-layout for DETAILED flows in the same whiteboard-explainer style as compose.mjs.
// Spec (JSON): { title, stages:[{name,color?,nodes:[{id,label,kind?}]}], edges:[{from,to,label?}] }
//   kind: "block" (default, light-filled box) | "in" (hatched entry) | "gate" (purple dashed: decision / user confirmation)
//         | "end" (orange outline: terminal / stop) | "doc" | "stack" | "db" (icon with caption below)
//   Stages are columns left->right; nodes stack top->bottom inside a rounded frame.
//   Routing (lines never cross nodes):
//     next node in the same column ........ straight down arrow (label to its left)
//     other node in the same column ....... loop in the frame's right padding (label outside the frame, on the right)
//     node in the next column ............. elbow through the gap between frames (label above/below the exit)
//     node further away / earlier column .. dashed route through the gaps and under all frames
//   Gaps between columns widen automatically to fit labels and lanes.
// CLI: node scripts/flow.mjs spec.json [out.skeleton.json]
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { Scene, C, measure } from "./compose.mjs";

const CYCLE = ["blue", "green", "gray"]; // purple is reserved for gates, orange for terminals
const COL_W = 280, X0 = 110, TOP = 215, NODE_W = 232, V_GAP = 66, PAD = 24, LANE = 22, MIN_GAP = 150;

function wrap(label, maxUnits) {
  const out = [];
  for (const raw of String(label).split("\n")) {
    let line = "", w = 0;
    for (const ch of raw) {
      const cw = ch.charCodeAt(0) > 255 ? 1 : 0.55;
      if (w + cw > maxUnits && line) { out.push(line); line = ""; w = 0; }
      line += ch; w += cw;
    }
    out.push(line);
  }
  return out.join("\n");
}
const lw = (t) => (t ? measure(t, 18).w : 0);

function classify(spec) {
  const at = {};
  spec.stages.forEach((st, i) => st.nodes.forEach((n, j) => { at[n.id] = { i, j }; }));
  return spec.edges.map((e) => {
    const a = at[e.from], b = at[e.to];
    if (!a || !b) throw new Error(`edge references unknown node: ${e.from} -> ${e.to}`);
    const type = a.i === b.i ? (b.j === a.j + 1 ? "down" : "side") : b.i === a.i + 1 ? "gap" : "loop";
    return { ...e, sa: a.i, sb: b.i, type };
  });
}

export function layout(spec) {
  const edges = classify(spec);
  const n = spec.stages.length;
  // gap g = space right of column g (g = n-1: right margin). Needs: label area + lanes.
  const labelW = Array(n).fill(0), lanes = Array(n).fill(0); let leftLanes = 0;
  for (const e of edges) {
    if (e.type === "gap") { labelW[e.sa] = Math.max(labelW[e.sa], lw(e.label)); lanes[e.sa]++; }
    if (e.type === "side") labelW[e.sa] = Math.max(labelW[e.sa], lw(e.label));
    if (e.type === "loop") { lanes[e.sa]++; if (e.sb - 1 >= 0) lanes[e.sb - 1]++; else leftLanes++; }
  }
  const gapW = labelW.map((w, g) => Math.max(MIN_GAP, 30 + w + 20 + lanes[g] * LANE + 20));
  const stages = spec.stages.map((st, i) => ({ ...st, color: st.color || CYCLE[i % CYCLE.length], i }));
  let x = X0 + leftLanes * LANE;
  const nodes = {};
  for (const st of stages) {
    st.x = x; x += COL_W + gapW[st.i];
    let y = TOP + 34;
    st.nodes.forEach((m, j) => {
      const kind = m.kind || "block";
      const icon = ["doc", "stack", "db"].includes(kind);
      const text = wrap(m.label, icon ? 11 : 10.8);
      const lines = text.split("\n").length;
      const nd = { ...m, kind, text, stage: st, idx: j, cx: st.x + COL_W / 2 };
      if (icon) { nd.w = 100; nd.h = 110 + 12 + lines * 26; nd.cy = y + 55; }
      else { nd.w = NODE_W; nd.h = Math.max(kind === "gate" ? 104 : 84, lines * 26 + 36); nd.cy = y + nd.h / 2; }
      nd.x = nd.cx - nd.w / 2; nd.y = y; nd.top = y; nd.bottom = y + nd.h; nd.left = nd.x; nd.right = nd.x + nd.w;
      nodes[m.id] = nd; y += nd.h + V_GAP;
    });
    st.frameTop = TOP; st.frameBottom = y - V_GAP + PAD + 6; st.frameLeft = st.x; st.frameRight = st.x + COL_W;
  }
  return { stages, nodes, edges, labelW, gapW, leftLanes };
}

export function drawFlow(spec) {
  const { stages, nodes, edges, labelW, leftLanes } = layout(spec);
  const s = new Scene();
  const maxBottom = Math.max(...stages.map((st) => st.frameBottom));
  const last = stages.at(-1);
  s.text((stages[0].frameLeft + last.frameRight) / 2, 30, spec.title, 44, C.gray);

  for (const st of stages) {
    s.frame(st.frameLeft, st.frameTop, COL_W, st.frameBottom - st.frameTop, { title: st.name, color: C[st.color] });
    for (const m of st.nodes) {
      const nd = nodes[m.id], col = st.color;
      if (nd.kind === "block") s.block(nd.x, nd.y, nd.w, nd.h, nd.text, col, { size: 20 });
      else if (nd.kind === "in") s.block(nd.x, nd.y, nd.w, nd.h, nd.text, col, { size: 20, hachure: true });
      else if (nd.kind === "gate") s.block(nd.x, nd.y, nd.w, nd.h, nd.text, "purple", { size: 20, dashed: true });
      else if (nd.kind === "end") s.block(nd.x, nd.y, nd.w, nd.h, nd.text, "orange", { size: 20, fill: "none" });
      else {
        if (nd.kind === "doc") s.doc(nd.cx, nd.y, col, 90, 110);
        if (nd.kind === "stack") s.stack(nd.cx, nd.y - 10, col, 62, 70);
        if (nd.kind === "db") s.cylinder(nd.cx, nd.y, col, 100, 110);
        s.text(nd.cx, nd.y + 122, nd.text, 20, C[col]);
      }
    }
  }

  for (const e of edges) { e.A = nodes[e.from]; e.B = nodes[e.to]; }
  // ports: spread several edges leaving / entering the same side of a node
  const outs = {}, ins = {};
  for (const e of edges) if (e.type === "gap" || e.type === "loop") { (outs[e.from] ||= []).push(e); (ins[e.to] ||= []).push(e); }
  const spread = (list, key, by) => { list.sort((a, b) => by(a) - by(b)); list.forEach((e, k) => { e[key] = (k - (list.length - 1) / 2) * 20; }); };
  Object.values(outs).forEach((l) => spread(l, "outDy", (e) => e.B.cy + e.sb * 10000));
  Object.values(ins).forEach((l) => spread(l, "inDy", (e) => e.A.cy));

  // lanes: right of each column's label area; left margin for loops back into column 0
  const used = {}, usedLeft = { k: 0 };
  const laneRight = (g, e) => {
    const k = (used[g] = (used[g] || 0));
    used[g]++;
    return stages[g].frameRight + 12 + labelW[g] + 16 + k * LANE;
  };
  const laneLeftOf = (sb) => (sb - 1 >= 0 ? laneRight(sb - 1) : stages[0].frameLeft - 18 - LANE * (usedLeft.k++));
  const edgesByY = [...edges].sort((a, b) => a.A.cy - b.A.cy);
  for (const e of edgesByY) {
    if (e.type === "gap") e.laneX = laneRight(e.sa);
    if (e.type === "loop") { e.laneR = laneRight(e.sa); e.laneL = laneLeftOf(e.sb); }
  }

  const dashed = { dashed: true, color: C.gray }, solid = { dashed: false, color: C.ink };
  const label = (x, y, t) => t && s.text(x, y, t, 18, C.gray);
  const sideN = {}; let loopK = 0;
  for (const e of edges) {
    const { A, B } = e;
    if (e.type === "down") {
      s.arrow(A.cx, A.bottom, B.cx, B.top);
      label(A.cx - 12 - lw(e.label) / 2, (A.bottom + B.top) / 2 - 12, e.label);
    } else if (e.type === "side") {
      const k = (sideN[A.stage.i] = (sideN[A.stage.i] || 0) + 1);
      const x = Math.max(A.right, B.right) + 4 + k * 7;
      const y1 = A.cy + (outs[e.from] ? 24 : 0); // keep clear of edges that leave the same node towards the next column
      s.path([[A.right, y1], [x, y1], [x, B.cy], [B.right, B.cy]], B.idx < A.idx ? dashed : solid);
      label(A.stage.frameRight + 10 + lw(e.label) / 2, (y1 + B.cy) / 2 - 12, e.label);
    } else if (e.type === "gap") {
      const y1 = A.cy + (e.outDy || 0), y2 = B.cy + (e.inDy || 0);
      const pts = [[A.right, y1], [e.laneX, y1]];
      if (Math.abs(y1 - y2) > 1) pts.push([e.laneX, y2]);
      pts.push([B.left, y2]);
      s.path(pts, solid);
      label(A.stage.frameRight + 10 + lw(e.label) / 2, (e.outDy || 0) > 0 ? y1 + 4 : y1 - 26, e.label);
    } else {
      const y1 = A.cy + (e.outDy || 0), y2 = B.cy + (e.inDy || 0);
      const ly = maxBottom + 40 + loopK * 30; loopK++;
      s.path([[A.right, y1], [e.laneR, y1], [e.laneR, ly], [e.laneL, ly], [e.laneL, y2], [B.left, y2]], dashed);
      label((e.laneR + e.laneL) / 2, ly + 6, e.label);
    }
  }
  return s;
}

const self = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === self) {
  const [specFile, out] = process.argv.slice(2);
  if (!specFile) { console.error("usage: node scripts/flow.mjs spec.json [out.skeleton.json]"); process.exit(2); }
  const spec = JSON.parse(readFileSync(specFile, "utf8"));
  const dest = out || specFile.replace(/\.flow\.json$|\.json$/i, "") + ".skeleton.json";
  drawFlow(spec).save(dest);
  console.log(`flow: ${spec.stages.reduce((a, s) => a + s.nodes.length, 0)} nodes, ${spec.edges.length} edges -> ${dest}`);
}
