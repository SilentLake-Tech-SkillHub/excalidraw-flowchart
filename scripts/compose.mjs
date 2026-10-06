// Composition helpers for the whiteboard "explainer" style (colored stage titles, light fills,
// icon-like shapes, one rounded group frame, dashed gate, generous whitespace).
// A build script does:  import { Scene } from "../../scripts/compose.mjs";  ...  s.save("out.skeleton.json")
// then:                 node scripts/render.mjs out.skeleton.json
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

export const C = { blue: "#1971c2", green: "#2f9e44", purple: "#9c36b5", orange: "#e8590c", gray: "#495057", ink: "#1e1e1e" };
export const FILL = { blue: "#a5d8ff", green: "#b2f2bb", purple: "#d0bfff", orange: "#ffd8a8", gray: "#e9ecef" };

// Rough text size so captions can be centered on a point (CJK ~1em, Latin ~0.55em).
export function measure(str, size) {
  const lines = String(str).split("\n");
  const w = Math.max(...lines.map((l) => [...l].reduce((a, ch) => a + (ch.charCodeAt(0) > 255 ? 1 : 0.55), 0))) * size;
  return { w, h: lines.length * size * 1.25 };
}

export class Scene {
  constructor() { this.el = []; }
  /** Text whose horizontal CENTER is cx (top at y). */
  text(cx, y, str, size = 22, color = C.ink) {
    // With textAlign:"center" the skeleton converter treats x as the horizontal center.
    this.el.push({ type: "text", x: Math.round(cx), y, text: str, fontSize: size, strokeColor: color, textAlign: "center" });
    return this;
  }
  /** Big colored stage title centered on cx. */
  title(cx, y, str, color) { return this.text(cx, y, str, 30, color); }
  /** Rounded group frame with an optional colored title above it. */
  frame(x, y, w, h, { title, color = C.ink } = {}) {
    this.el.push({ type: "rectangle", x, y, width: w, height: h, strokeWidth: 2, strokeColor: C.ink, roundness: { type: 3 } });
    if (title) this.title(x + w / 2, y - 55, title, color);
    return this;
  }
  /** Rounded block with a label centered inside (hachure = diagonal-line fill like the reference). */
  block(x, y, w, h, label, color = "blue", { hachure = false, dashed = false, size = 22, labelColor, fill } = {}) {
    this.el.push({
      type: "rectangle", x, y, width: w, height: h, strokeWidth: 2, roundness: { type: 3 },
      backgroundColor: fill === "none" ? "transparent" : FILL[color], fillStyle: hachure ? "hachure" : "solid",
      strokeColor: dashed ? C.ink : C[color], strokeStyle: dashed ? "dashed" : "solid",
      label: label ? { text: label, fontSize: size, strokeColor: labelColor || (dashed ? C.ink : C[color]), textAlign: "center" } : undefined,
    });
    return this;
  }
  /** Document icon (filled sheet with 3 text lines), centered on cx. */
  doc(cx, y, color = "green", w = 130, h = 170) {
    this.el.push({ type: "rectangle", x: cx - w / 2, y, width: w, height: h, strokeWidth: 2, backgroundColor: FILL[color], fillStyle: "solid", strokeColor: C[color] });
    for (const f of [0.22, 0.5, 0.78]) this.el.push({ type: "line", x: cx - w * 0.3, y: y + h * f, points: [[0, 0], [w * 0.6, 0]], strokeWidth: 3, strokeColor: C.ink });
    return this;
  }
  /** Stack of three sheets, centered on cx. */
  stack(cx, y, color = "blue", w = 70, h = 80) {
    for (let i = 0; i < 3; i++) this.el.push({ type: "rectangle", x: cx - w / 2 + i * 10 - 10, y: y - i * 10 + 20, width: w, height: h, strokeWidth: 2, backgroundColor: i === 2 ? FILL[color] : "#ffffff", fillStyle: "solid", strokeColor: C[color] });
    return this;
  }
  /** Database cylinder, centered on cx. */
  cylinder(cx, y, color = "blue", w = 130, h = 150) {
    const e = h * 0.18;
    this.el.push({ type: "rectangle", x: cx - w / 2, y: y + e / 2, width: w, height: h - e, strokeWidth: 2, backgroundColor: FILL[color], fillStyle: "hachure", strokeColor: C[color], strokeStyle: "solid" });
    this.el.push({ type: "ellipse", x: cx - w / 2, y, width: w, height: e, strokeWidth: 2, backgroundColor: FILL[color], fillStyle: "solid", strokeColor: C[color] });
    this.el.push({ type: "ellipse", x: cx - w / 2, y: y + h - e, width: w, height: e, strokeWidth: 2, backgroundColor: FILL[color], fillStyle: "solid", strokeColor: C[color] });
    return this;
  }
  /** Straight arrow from (x1,y1) to (x2,y2). */
  arrow(x1, y1, x2, y2, { dashed = false, color = C.ink } = {}) {
    this.el.push({ type: "arrow", x: x1, y: y1, points: [[0, 0], [x2 - x1, y2 - y1]], strokeWidth: 2, endArrowhead: "arrow", strokeColor: color, strokeStyle: dashed ? "dashed" : "solid" });
    return this;
  }
  /** Multi-segment arrow through absolute points (for revise loops), dashed by default. */
  path(pts, { dashed = true, color = C.gray } = {}) {
    const [x0, y0] = pts[0];
    this.el.push({ type: "arrow", x: x0, y: y0, points: pts.map(([x, y]) => [x - x0, y - y0]), strokeWidth: 2, endArrowhead: "arrow", strokeColor: color, strokeStyle: dashed ? "dashed" : "solid" });
    return this;
  }
  save(file) { if (String(file).startsWith("file:")) file = fileURLToPath(file); writeFileSync(file, JSON.stringify(this.el, null, 1)); return file; }
}
