import {
  Scene, PerspectiveCamera, Group, Mesh, Vector3, Color, Shape, PMREMGenerator,
  SphereGeometry, CylinderGeometry, TorusGeometry, CapsuleGeometry, IcosahedronGeometry, ExtrudeGeometry,
  MeshPhysicalMaterial, AmbientLight, DirectionalLight,
} from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// CTA background: glossy shapes drifting like small planets in the dusk sky,
// bouncing off each other and the frame. Each knock flashes a lime rim.
// They can pass behind the glass card (marked data-scene-avoid), but a gentle
// push keeps them mostly in the open space around it.

const VOLT = new Color('#D4F542');
const PALETTE = {
  night: '#1B1B21', bone: '#ECECE6', volt: '#D4F542', indigo: '#2E3478', violet: '#4A3566',
};

// Seeded so the layout is the same on every load (and in the reduced-motion still).
function random(seed) {
  return () => {
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hexPrism(radius, depth) {
  const shape = new Shape();
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    shape[i ? 'lineTo' : 'moveTo'](Math.cos(a) * radius, Math.sin(a) * radius);
  }
  const geo = new ExtrudeGeometry(shape, {
    depth, bevelEnabled: true, bevelThickness: 0.12, bevelSize: 0.1, bevelSegments: 6, curveSegments: 1,
  });
  geo.center();
  return geo;
}

function material(color, { roughness = 0.32, metalness = 0.1 } = {}) {
  return new MeshPhysicalMaterial({
    color: PALETTE[color], roughness, metalness, clearcoat: 0.6, clearcoatRoughness: 0.25,
    emissive: VOLT, emissiveIntensity: 0,
  });
}

function ringedPlanet(r) {
  const group = new Group();
  const body = new Mesh(new SphereGeometry(r, 48, 32), material('indigo'));
  const ring = new Mesh(new TorusGeometry(r * 1.55, r * 0.07, 12, 96), material('volt', { roughness: 0.4 }));
  ring.rotation.x = Math.PI / 2.4;
  group.add(body, ring);
  return group;
}

// Listed biggest-first; narrow frames keep only the first few. `at` is the
// starting spot as a fraction of the frame, ringed around the card.
const BODIES = [
  { make: () => ringedPlanet(1.0), r: 1.55, at: [0.8, 0.3] },
  { make: () => new Mesh(new RoundedBoxGeometry(1.5, 1.5, 1.5, 5, 0.22), material('bone')), r: 1.1, at: [-0.82, 0.55] },
  { make: () => new Mesh(hexPrism(0.85, 0.6), material('night')), r: 0.95, at: [0.45, -0.85] },
  { make: () => new Mesh(new SphereGeometry(0.62, 40, 28), material('volt', { roughness: 0.38 })), r: 0.62, at: [0.15, 0.88] },
  { make: () => new Mesh(new TorusGeometry(0.55, 0.22, 20, 64), material('violet')), r: 0.78, at: [-0.45, 0.85] },
  { make: () => new Mesh(new RoundedBoxGeometry(0.9, 0.9, 0.9, 4, 0.16), material('indigo')), r: 0.68, at: [0.92, -0.55] },
  { make: () => new Mesh(new SphereGeometry(0.8, 40, 28), material('night', { roughness: 0.22, metalness: 0.35 })), r: 0.8, at: [-0.75, -0.2] },
  { make: () => new Mesh(hexPrism(0.5, 0.4), material('bone')), r: 0.58, at: [-0.3, -0.88] },
  { make: () => new Mesh(new CapsuleGeometry(0.3, 0.6, 8, 24), material('violet')), r: 0.62, at: [0.6, 0.86] },
  { make: () => new Mesh(new IcosahedronGeometry(0.55, 0), material('night', { roughness: 0.28, metalness: 0.4 })), r: 0.55, at: [-0.92, -0.75] },
];

const DEPTH = 0.8;        // bodies stay within ±DEPTH of the z = 0 plane
const RESTITUTION = 0.92;
const AVOID_PUSH = 0.6;   // outward acceleration while behind the card

export function ctaShapes({ renderer, width, height }) {
  const rand = random(7);
  const scene = new Scene();
  const camera = new PerspectiveCamera(32, width / height, 0.1, 100);
  camera.position.set(0, 0, 20);

  const pmrem = new PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.45;
  pmrem.dispose();

  scene.add(new AmbientLight('#8C90C8', 0.35));
  const sun = new DirectionalLight(VOLT, 2.4);   // the horizon sun, low and ahead
  sun.position.set(0, -4, 6);
  const sky = new DirectionalLight('#6F7BFF', 1.1);
  sky.position.set(-6, 8, 4);
  const rim = new DirectionalLight('#FFFFFF', 0.8);
  rim.position.set(6, 4, -6);
  scene.add(sun, sky, rim);

  const bodies = BODIES.map(({ make, r, at }) => {
    const obj = make();
    obj.rotation.set(rand() * 6.3, rand() * 6.3, rand() * 6.3);
    scene.add(obj);
    const angle = rand() * Math.PI * 2;
    const cruise = 0.5 + rand() * 0.35;
    return {
      obj, baseR: r, r, mass: r ** 3, cruise, at,
      p: new Vector3(), v: new Vector3(Math.cos(angle) * cruise, Math.sin(angle) * cruise, (rand() - 0.5) * 0.1),
      spin: new Vector3((rand() - 0.5) * 0.5, (rand() - 0.5) * 0.5, (rand() - 0.5) * 0.3),
      baseSpin: null, glow: 0,
      materials: [],
    };
  });
  for (const b of bodies) {
    b.baseSpin = b.spin.clone();
    b.obj.traverse((o) => o.material && b.materials.push(o.material));
  }

  let halfW = 1, halfH = 1, active = bodies;
  const canvas = renderer.domElement;
  const card = canvas.closest('section')?.querySelector('[data-scene-avoid]');
  const avoid = { x: 0, y: 0, w: 0, h: 0 }; // card centre and half-size, world units

  function measureCard() {
    if (!card) return;
    const c = canvas.getBoundingClientRect(), k = card.getBoundingClientRect();
    avoid.x = ((k.left + k.width / 2 - c.left) / c.width * 2 - 1) * halfW;
    avoid.y = -((k.top + k.height / 2 - c.top) / c.height * 2 - 1) * halfH;
    avoid.w = (k.width / c.width) * halfW;
    avoid.h = (k.height / c.height) * halfH;
  }

  function layout(w, h) {
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    halfH = Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
    halfW = halfH * camera.aspect;
    const scale = Math.min(1, Math.max(0.55, camera.aspect / 1.8));
    const count = camera.aspect > 1.5 ? bodies.length : camera.aspect > 1 ? 7 : 5;
    active = bodies.slice(0, count);
    bodies.forEach((b, i) => {
      b.obj.visible = i < count;
      b.obj.scale.setScalar(scale);
      b.r = b.baseR * scale;
    });
    measureCard();
  }

  function place() {
    for (const b of active) {
      b.p.set(b.at[0] * (halfW - b.r), b.at[1] * (halfH - b.r), (rand() * 2 - 1) * DEPTH);
      b.obj.position.copy(b.p);
    }
  }

  layout(width, height);
  place();

  const n = new Vector3(), rel = new Vector3();

  function collide(a, b) {
    n.subVectors(b.p, a.p);
    const dist = n.length(), min = a.r + b.r;
    if (dist >= min || dist === 0) return;
    n.divideScalar(dist);
    const total = a.mass + b.mass;
    a.p.addScaledVector(n, -(min - dist) * (b.mass / total));
    b.p.addScaledVector(n, (min - dist) * (a.mass / total));
    const closing = rel.subVectors(b.v, a.v).dot(n);
    if (closing >= 0) return;
    const j = (-(1 + RESTITUTION) * closing) / (1 / a.mass + 1 / b.mass);
    a.v.addScaledVector(n, -j / a.mass);
    b.v.addScaledVector(n, j / b.mass);
    const knock = Math.min(1, -closing / 0.8);
    for (const body of [a, b]) {
      body.glow = Math.max(body.glow, knock);
      body.spin.x += (Math.random() - 0.5) * 2 * knock;
      body.spin.y += (Math.random() - 0.5) * 2 * knock;
    }
  }

  return {
    scene,
    camera,
    resize: layout,
    update(elapsed, delta) {
      const dt = Math.min(delta, 1 / 30);
      for (const b of active) {
        // Hold each body near its cruising speed so the system never runs down.
        if (avoid.w) {
          const dx = (b.p.x - avoid.x) / (avoid.w + b.r), dy = (b.p.y - avoid.y) / (avoid.h + b.r);
          const reach = Math.hypot(dx, dy);
          if (reach < 1) {
            b.v.x += (dx / (reach || 1)) * AVOID_PUSH * dt;
            b.v.y += (dy / (reach || 1)) * AVOID_PUSH * dt;
          }
        }
        const speed = b.v.length() || 1e-4;
        b.v.multiplyScalar(1 + ((b.cruise - speed) / speed) * dt * 0.4);
        b.p.addScaledVector(b.v, dt);

        const edgeX = halfW - b.r, edgeY = halfH - b.r;
        if (b.p.x < -edgeX) { b.p.x = -edgeX; b.v.x = Math.abs(b.v.x); }
        if (b.p.x > edgeX) { b.p.x = edgeX; b.v.x = -Math.abs(b.v.x); }
        if (b.p.y < -edgeY) { b.p.y = -edgeY; b.v.y = Math.abs(b.v.y); }
        if (b.p.y > edgeY) { b.p.y = edgeY; b.v.y = -Math.abs(b.v.y); }
        if (Math.abs(b.p.z) > DEPTH) { b.p.z = Math.sign(b.p.z) * DEPTH; b.v.z *= -1; }
      }
      for (let i = 0; i < active.length; i++)
        for (let k = i + 1; k < active.length; k++) collide(active[i], active[k]);

      for (const b of active) {
        b.spin.lerp(b.baseSpin, dt * 0.5);
        b.obj.rotation.x += b.spin.x * dt;
        b.obj.rotation.y += b.spin.y * dt;
        b.obj.rotation.z += b.spin.z * dt;
        b.obj.position.copy(b.p);
        b.glow = Math.max(0, b.glow - dt * 1.4);
        for (const m of b.materials) m.emissiveIntensity = b.glow * 0.55;
      }
    },
  };
}
