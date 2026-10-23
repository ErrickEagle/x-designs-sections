// Entry for the page's 3D sections. Bundled to dist/main.js by `npm run build:js`.
import { mountStage } from './stage.js';
import { ctaShapes } from './scenes/cta-shapes.js';
import { toolVortex } from './scenes/tool-vortex.js';

const scenes = { 'cta-shapes': ctaShapes, 'tool-vortex': toolVortex };

for (const canvas of document.querySelectorAll('canvas[data-scene]')) {
  const setup = scenes[canvas.dataset.scene];
  if (!setup) continue;
  // Sections can style themselves for 3D (`group-[.is-3d]:`) and fall back without it.
  const section = canvas.closest('section');
  section?.classList.add('is-3d');
  try {
    mountStage(canvas, setup);
  } catch (error) {
    console.warn(`3D scene "${canvas.dataset.scene}" disabled:`, error);
    section?.classList.remove('is-3d');
    canvas.remove(); // no WebGL: the section's plain version stands on its own
  }
}
