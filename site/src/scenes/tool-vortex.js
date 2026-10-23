import {
  Scene, PerspectiveCamera, Mesh, PlaneGeometry, MeshBasicMaterial, ShaderMaterial, CanvasTexture,
  BufferGeometry, BufferAttribute, Vector3, AdditiveBlending, DoubleSide, SRGBColorSpace,
} from 'three';

// "Works with": the tool logos ride a spiral tunnel, turning slowly and
// flying out toward the viewer. Close to the camera each disc smears into a
// rainbow streak. Logos come from the page's SVG sprite, named in the
// canvas's data-logos attribute.

const COUNT = 40;          // discs on the spiral
const TURNS = 1.75;        // turns of the spiral from far end to near end
const TRAVEL = 30;         // seconds for a disc to fly the whole tunnel
const SPIN = 0.12;         // radians per second the whole spiral turns
const RADIUS = 5;          // tunnel radius, world units
const STREAK_EDGE = 0.68;  // how far toward the frame edge (0 centre, 1 edge) streaks begin
const STREAK_LEN = 0.02;   // trail length, in tunnel fraction
const STREAK_STEPS = 18;   // samples along each trail
const TEX = 256;

// The trail behind a fast disc: a ribbon laid flat on the screen along its
// recent path, split into spectral fringes across its width and fading toward
// the tail. Positions are already in clip space.
const streakMaterial = () => new ShaderMaterial({
  uniforms: { strength: { value: 0 } },
  vertexShader: `attribute vec2 st; varying vec2 vSt;
    void main() { vSt = st; gl_Position = vec4(position, 1.0); }`,
  fragmentShader: `uniform float strength; varying vec2 vSt;
    vec3 spectrum(float x) {
      vec3 c = mix(vec3(.24,.36,1.), vec3(.34,.88,1.), smoothstep(-1., -.35, x));
      c = mix(c, vec3(1.,.85,.29), smoothstep(-.35, .05, x));
      c = mix(c, vec3(1.,.54,.12), smoothstep(.05, .45, x));
      return mix(c, vec3(1.,.24,.35), smoothstep(.45, 1., x));
    }
    void main() {
      float t = vSt.x, s = vSt.y;
      float a = pow(1. - t, 1.3) * smoothstep(.04, .2, t) * (1. - s * s) * strength;
      gl_FragColor = vec4(spectrum(s) * a, a); // premultiplied, so the page shows through
    }`,
  transparent: true, depthWrite: false, blending: AdditiveBlending, premultipliedAlpha: true, side: DoubleSide,
});

function streakGeometry() {
  const geo = new BufferGeometry();
  const st = new Float32Array(STREAK_STEPS * 2 * 2), index = [];
  for (let k = 0; k < STREAK_STEPS; k++) {
    const t = k / (STREAK_STEPS - 1);
    st.set([t, -1, t, 1], k * 4);
    if (k) index.push(2 * k - 2, 2 * k - 1, 2 * k, 2 * k - 1, 2 * k + 1, 2 * k);
  }
  geo.setAttribute('position', new BufferAttribute(new Float32Array(STREAK_STEPS * 2 * 3), 3));
  geo.setAttribute('st', new BufferAttribute(st, 2));
  geo.setIndex(index);
  return geo;
}

// One disc: dark glossy face, faint rim, logo in the middle.
function discTexture(symbolId, done) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = TEX;
  const g = canvas.getContext('2d');
  const c = TEX / 2;
  const face = g.createRadialGradient(c * 0.7, c * 0.55, 0, c, c, c);
  face.addColorStop(0, '#2A2A31');
  face.addColorStop(0.6, '#17171C');
  face.addColorStop(1, '#0C0C0F');
  g.fillStyle = face;
  g.beginPath(); g.arc(c, c, c - 2, 0, Math.PI * 2); g.fill();
  g.strokeStyle = 'rgba(255,255,255,.16)';
  g.lineWidth = 3;
  g.beginPath(); g.arc(c, c, c - 3.5, 0, Math.PI * 2); g.stroke();

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;

  const symbol = document.getElementById(symbolId);
  if (symbol) {
    const attrs = { fill: 'currentColor', color: '#F5F5F1', width: TEX, height: TEX };
    for (const a of symbol.attributes) if (a.name !== 'id') attrs[a.name] = a.value;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" ${Object.entries(attrs).map(([k, v]) => `${k}="${v}"`).join(' ')}>${symbol.innerHTML}</svg>`;
    const img = new Image();
    img.onload = () => {
      const size = TEX * 0.46;
      g.drawImage(img, c - size / 2, c - size / 2, size, size);
      texture.needsUpdate = true;
      done();
    };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }
  return texture;
}

export function toolVortex({ renderer, width, height, invalidate }) {
  const canvas = renderer.domElement;
  const logos = (canvas.dataset.logos || '').split(',').map((s) => s.trim()).filter(Boolean);
  const scene = new Scene();
  const camera = new PerspectiveCamera(45, width / height, 0.1, 400);
  const tan = Math.tan((camera.fov * Math.PI) / 360);

  const textures = logos.map((id) => discTexture(id, invalidate));
  const plane = new PlaneGeometry(1, 1);
  const discs = Array.from({ length: COUNT }, (_, i) => {
    const map = textures[i % textures.length];
    const disc = new Mesh(plane, new MeshBasicMaterial({ map, transparent: true, alphaTest: 0.02 }));
    const streak = new Mesh(streakGeometry(), streakMaterial());
    streak.frustumCulled = false;
    streak.renderOrder = 1; // after the discs, so a nearer disc hides the trail behind it
    scene.add(disc, streak);
    return { disc, streak, offset: i / COUNT };
  });

  // Depth runs geometrically from far to near so the discs look evenly
  // spaced on screen; both ends depend on the frame's shape.
  let far = 60, near = 4, sizeFar = 1;
  function resize(w, h) {
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    const narrow = Math.min(1, camera.aspect);
    far = RADIUS / ((camera.aspect > 1 ? 0.7 : 0.82) * narrow * tan);
    near = RADIUS / (1.3 * Math.max(1, camera.aspect) * tan);
    sizeFar = 0.065 * Math.min(1, camera.aspect * 1.15) * 2 * tan * far;
  }
  resize(width, height);

  const pointer = { x: 0, y: 0 }, look = new Vector3();
  window.addEventListener('pointermove', (e) => {
    pointer.x = e.clientX / window.innerWidth - 0.5;
    pointer.y = e.clientY / window.innerHeight - 0.5;
  }, { passive: true });

  const pos = new Vector3(), toward = new Vector3(), tangent = new Vector3(), target = new Vector3();
  const prev = new Vector3(), along = new Vector3(), side = new Vector3(), screen = new Vector3();

  // Where a disc is at tunnel fraction u (0 = far end, 1 = nearest), given the
  // spiral's current turn. Returns its size; the position lands in `out`.
  function at(u, spin, out) {
    const depth = far * (near / far) ** u;
    const angle = u * TURNS * Math.PI * 2 - spin;
    out.set(Math.cos(angle) * RADIUS, Math.sin(angle) * RADIUS, -depth);
    return sizeFar * (depth / far) ** 0.62;
  }

  function placeDisc(mesh, u, spin) {
    mesh.scale.setScalar(at(u, spin, pos));
    mesh.position.copy(pos);
    // Face the camera, tipped along the direction of travel so discs read as ovals.
    const angle = Math.atan2(pos.y, pos.x);
    toward.subVectors(camera.position, pos).normalize();
    tangent.set(-Math.sin(angle), Math.cos(angle), 0);
    mesh.lookAt(target.copy(pos).add(toward).addScaledVector(tangent, 0.75));
  }

  // Lay the trail along the on-screen path the disc took to get here.
  function placeStreak(mesh, u, spin) {
    const position = mesh.geometry.attributes.position;
    for (let k = 0; k < STREAK_STEPS; k++) {
      const back = (k / (STREAK_STEPS - 1)) * STREAK_LEN;
      const size = at(u - back, spin - back * TRAVEL * SPIN, pos);
      const depth = pos.distanceTo(camera.position);
      pos.project(camera);
      at(u - back - 0.003, spin - (back + 0.003) * TRAVEL * SPIN, prev);
      prev.project(camera);
      // Perpendicular to the path, measured in square screen units.
      along.set((pos.x - prev.x) * camera.aspect, pos.y - prev.y, 0);
      side.set(-along.y, along.x, 0).normalize();
      const half = ((size * 0.5) / (depth * tan)) * (1 - 0.65 * (k / STREAK_STEPS));
      side.multiplyScalar(half);
      side.x /= camera.aspect;
      // Nudged back in depth so the disc itself always sits on top of its trail.
      const z = pos.z + 0.002;
      position.setXYZ(2 * k, pos.x - side.x, pos.y - side.y, z);
      position.setXYZ(2 * k + 1, pos.x + side.x, pos.y + side.y, z);
    }
    position.needsUpdate = true;
  }

  return {
    scene,
    camera,
    resize,
    update(elapsed, delta) {
      camera.position.x += (pointer.x * 1.2 - camera.position.x) * Math.min(1, delta * 3);
      camera.position.y += (-pointer.y * 0.8 - camera.position.y) * Math.min(1, delta * 3);
      camera.lookAt(look.set(0, 0, -far * 0.5));

      const spin = elapsed * SPIN;
      for (const { disc, streak, offset } of discs) {
        const u = (offset + elapsed / TRAVEL) % 1;
        placeDisc(disc, u, spin);
        disc.material.opacity = Math.min(1, u / 0.08);
        // Discs streak as they race out past the edge of the frame.
        screen.copy(disc.position).project(camera);
        const edge = Math.max(Math.abs(screen.x), Math.abs(screen.y));
        const strength = Math.min(1, Math.max(0, (edge - STREAK_EDGE) / (1 - STREAK_EDGE))) ** 1.3;
        streak.visible = strength > 0;
        if (streak.visible) {
          placeStreak(streak, u, spin);
          streak.material.uniforms.strength.value = strength * 2.2;
        }
      }
    },
  };
}
