// Browser-side bundle: Excalidraw export + Mermaid conversion, run inside headless Chrome.
import { exportToSvg, convertToExcalidrawElements } from "@excalidraw/excalidraw";
import { parseMermaidToExcalidraw } from "@excalidraw/mermaid-to-excalidraw";

window.__api = {
  async mermaidToScene(code, fontSize = 20) {
    const { elements, files } = await parseMermaidToExcalidraw(code, { themeVariables: { fontSize: `${fontSize}px` } });
    return { elements: convertToExcalidrawElements(elements, { regenerateIds: false }), files: files || {} };
  },
  async skeletonToScene(skeleton) {
    return { elements: convertToExcalidrawElements(skeleton), files: {} };
  },
  async toSvg(scene, opts = {}) {
    const svg = await exportToSvg({
      elements: scene.elements,
      files: scene.files || {},
      appState: { exportBackground: true, viewBackgroundColor: "#ffffff", exportWithDarkMode: false, ...(scene.appState || {}) },
      exportPadding: opts.padding ?? 24,
    });
    return svg.outerHTML;
  },
};
