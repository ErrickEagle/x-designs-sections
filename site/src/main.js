// Entry for the page's 3D sections. Bundled to dist/main.js by `npm run build:js`.
import { mountStage } from './stage.js';
import { ctaShapes } from './scenes/cta-shapes.js';

const scenes = { 'cta-shapes': ctaShapes };

for (const canvas of document.querySelectorAll('canvas[data-scene]')) {
  const setup = scenes[canvas.dataset.scene];
  try {
    if (setup) mountStage(canvas, setup);
  } catch {
    canvas.remove(); // no WebGL: the CSS scene behind it still stands on its own
  }
}
