// Browser-side bundle: Excalidraw skeleton conversion + SVG export, run inside headless Chrome.
import { exportToSvg, convertToExcalidrawElements } from "@excalidraw/excalidraw";

window.__api = {
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
