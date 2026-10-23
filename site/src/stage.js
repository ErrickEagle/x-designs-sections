import { WebGLRenderer, SRGBColorSpace, ACESFilmicToneMapping, Timer } from 'three';

// Shared plumbing for every 3D section: a renderer sized to its canvas,
// capped pixel ratio, paused while off-screen, and a single still frame
// when the visitor prefers reduced motion.
//
//   mountStage(canvas, ({ renderer, width, height }) => ({
//     scene, camera,
//     resize(width, height) {},
//     update(elapsed, delta) {},
//   }))
export function mountStage(canvas, setup) {
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;

  const size = () => [canvas.clientWidth || 1, canvas.clientHeight || 1];
  const [w, h] = size();
  renderer.setSize(w, h, false);
  const stage = setup({ renderer, width: w, height: h });

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const timer = new Timer();
  let visible = false;

  const draw = () => {
    timer.update();
    stage.update?.(timer.getElapsed(), timer.getDelta());
    renderer.render(stage.scene, stage.camera);
  };
  const loop = () => renderer.setAnimationLoop(visible && !reduced.matches ? draw : null);

  new ResizeObserver(() => {
    const [w, h] = size();
    renderer.setSize(w, h, false);
    stage.resize?.(w, h);
    if (!visible || reduced.matches) renderer.render(stage.scene, stage.camera);
  }).observe(canvas);

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    loop();
  }).observe(canvas);

  reduced.addEventListener('change', loop);
  stage.update?.(0, 0);
  renderer.render(stage.scene, stage.camera);
  return stage;
}
