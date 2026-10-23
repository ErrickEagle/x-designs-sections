import { WebGLRenderer, SRGBColorSpace, ACESFilmicToneMapping, Timer } from 'three';

// Shared plumbing for every 3D section: a renderer sized to its canvas,
// capped pixel ratio, paused while off-screen, and a single still frame
// when the visitor prefers reduced motion.
//
//   mountStage(canvas, ({ renderer, width, height, invalidate }) => ({
//     scene, camera,
//     resize(width, height) {},
//     update(elapsed, delta) {},
//   }))
//
// `invalidate()` redraws once when the loop isn't running, e.g. after a
// texture finishes loading under reduced motion.
export function mountStage(canvas, setup) {
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;

  const size = () => [canvas.clientWidth || 1, canvas.clientHeight || 1];
  const [w, h] = size();
  renderer.setSize(w, h, false);
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const timer = new Timer();
  let visible = false;
  const running = () => visible && !reduced.matches;
  let stage;
  const invalidate = () => { if (stage && !running()) renderer.render(stage.scene, stage.camera); };

  stage = setup({ renderer, width: w, height: h, invalidate });

  const draw = () => {
    timer.update();
    stage.update?.(timer.getElapsed(), timer.getDelta());
    renderer.render(stage.scene, stage.camera);
  };
  const loop = () => renderer.setAnimationLoop(running() ? draw : null);

  new ResizeObserver(() => {
    const [w, h] = size();
    renderer.setSize(w, h, false);
    stage.resize?.(w, h);
    invalidate();
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
