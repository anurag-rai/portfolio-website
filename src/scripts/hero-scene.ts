import * as THREE from "three";
import { theme } from "../config/theme";

/**
 * Initializes the Three.js hero scene with 7 wireframe polyhedra (4-10 vertices each).
 * Shapes drift with sine-wave idle motion and flee from the cursor on desktop
 * or respond to device tilt on mobile (Android only, no permission needed).
 * Dispatches a "hero-scene-ready" event when the scene is initialized.
 * @returns Cleanup function that removes event listeners and disposes the renderer.
 */
export function initHeroScene(container: HTMLElement) {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const {
    cameraZ,
    wireframeOpacity,
    wireframeColor,
    avoidRadius,
    lerpSpeed,
    tiltBetaOffset,
    tiltMaxAngle,
  } = theme.heroScene;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    50,
    container.clientWidth / container.clientHeight,
    0.1,
    100,
  );
  camera.position.z = cameraZ;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  const material = new THREE.MeshBasicMaterial({
    color: new THREE.Color(wireframeColor),
    wireframe: true,
    transparent: true,
    opacity: wireframeOpacity,
  });

  // 4-point through 10-point polyhedra
  const geometries = [
    new THREE.TetrahedronGeometry(0.45, 0), // 4 points
    new THREE.BufferGeometry(), // 5 points (triangular bipyramid)
    new THREE.OctahedronGeometry(0.5, 0), // 6 points
    new THREE.BufferGeometry(), // 7 points (pentagonal bipyramid)
    new THREE.BufferGeometry(), // 8 points (cube)
    new THREE.BufferGeometry(), // 9 points (elongated prism)
    new THREE.IcosahedronGeometry(0.55, 0), // 10 points (pentagonal antiprism subset)
  ];

  // Build 5-point: triangular bipyramid (two tetrahedra sharing a face)
  const v5 = [
    0,
    0.6,
    0, // top
    0,
    -0.6,
    0, // bottom
    0.5,
    0,
    0.3, // equator 1
    -0.5,
    0,
    0.3, // equator 2
    0,
    0,
    -0.5, // equator 3
  ];
  const i5 = [0, 2, 3, 0, 3, 4, 0, 4, 2, 1, 3, 2, 1, 4, 3, 1, 2, 4];
  geometries[1].setAttribute(
    "position",
    new THREE.Float32BufferAttribute(
      i5.flatMap((idx) => [v5[idx * 3], v5[idx * 3 + 1], v5[idx * 3 + 2]]),
      3,
    ),
  );

  // Build 7-point: pentagonal bipyramid
  const v7: number[] = [0, 0.65, 0, 0, -0.65, 0];
  for (let k = 0; k < 5; k++) {
    const angle = (k / 5) * Math.PI * 2;
    v7.push(Math.cos(angle) * 0.45, 0, Math.sin(angle) * 0.45);
  }
  const i7: number[] = [];
  for (let k = 0; k < 5; k++) {
    const a = k + 2,
      b = ((k + 1) % 5) + 2;
    i7.push(0, a, b); // top cap
    i7.push(1, b, a); // bottom cap
  }
  geometries[3].setAttribute(
    "position",
    new THREE.Float32BufferAttribute(
      i7.flatMap((idx) => [v7[idx * 3], v7[idx * 3 + 1], v7[idx * 3 + 2]]),
      3,
    ),
  );

  // Build 8-point: cube
  const cubeGeo = new THREE.BoxGeometry(0.7, 0.7, 0.7);
  geometries[4] = cubeGeo;

  // Build 9-point: elongated triangular prism with caps
  const v9: number[] = [];
  // Bottom triangle
  for (let k = 0; k < 3; k++) {
    const angle = (k / 3) * Math.PI * 2 - Math.PI / 6;
    v9.push(Math.cos(angle) * 0.4, -0.5, Math.sin(angle) * 0.4);
  }
  // Top triangle
  for (let k = 0; k < 3; k++) {
    const angle = (k / 3) * Math.PI * 2 - Math.PI / 6;
    v9.push(Math.cos(angle) * 0.4, 0.5, Math.sin(angle) * 0.4);
  }
  // Apex points
  v9.push(0, -0.7, 0); // bottom apex (6)
  v9.push(0, 0.7, 0); // top apex (7)
  v9.push(0, 0, 0); // center (8)
  const i9 = [
    0,
    1,
    2,
    3,
    5,
    4, // top/bottom faces
    0,
    3,
    1,
    1,
    3,
    4,
    1,
    4,
    2,
    2,
    4,
    5,
    2,
    5,
    0,
    0,
    5,
    3, // sides
    6,
    0,
    1,
    6,
    1,
    2,
    6,
    2,
    0, // bottom apex
    7,
    4,
    3,
    7,
    5,
    4,
    7,
    3,
    5, // top apex
  ];
  geometries[5].setAttribute(
    "position",
    new THREE.Float32BufferAttribute(
      i9.flatMap((idx) => [v9[idx * 3], v9[idx * 3 + 1], v9[idx * 3 + 2]]),
      3,
    ),
  );

  // Smaller shapes (fewer vertices) near center, larger ones at edges
  // Order: 4pt, 5pt, 6pt, 7pt, 8pt, 9pt, 10pt
  const homePositions = [
    new THREE.Vector3(-0.4, -0.3, 0.3), // 4pt — near center
    new THREE.Vector3(0.5, 0.4, 0.1), // 5pt — near center
    new THREE.Vector3(-1.5, 1.0, -0.2), // 6pt — mid ring
    new THREE.Vector3(1.8, -0.8, 0.0), // 7pt — mid ring
    new THREE.Vector3(-3.0, -0.5, -0.4), // 8pt — outer edge
    new THREE.Vector3(3.2, 0.9, -0.3), // 9pt — outer edge
    new THREE.Vector3(-2.2, -1.2, -0.1), // 10pt — outer edge, bottom-left
  ];

  const shapes = geometries.map((geo, i) => {
    const mesh = new THREE.Mesh(geo, material.clone());
    const home = homePositions[i];
    mesh.position.copy(home);
    mesh.rotation.set(i * 0.5, i * 0.7, i * 0.3);
    scene.add(mesh);

    return {
      mesh,
      home,
      offset: new THREE.Vector2(0, 0),
      maxDisplacement: 0.5 + i * 0.08,
    };
  });

  // Interaction position in world-ish coordinates
  // On desktop: cursor position. On mobile: derived from device tilt.
  let cursorX = 0;
  let cursorY = 0;
  // Tracks whether device orientation events are firing (Android)

  // Desktop: mouse cursor
  document.addEventListener("mousemove", (e) => {
    cursorX = (e.clientX / window.innerWidth - 0.5) * 6;
    cursorY = -(e.clientY / window.innerHeight - 0.5) * 4;
  });

  // Mobile: device tilt (works on Android without permission, silent no-op on iOS)
  if (window.DeviceOrientationEvent) {
    // Don't call requestPermission — just listen. Fires on Android, silently ignored on iOS.
    window.addEventListener("deviceorientation", (e) => {
      if (e.gamma === null || e.beta === null) return;
      // Device orientation is active
      // gamma: left/right tilt (-90 to 90), beta: front/back tilt (-180 to 180)
      // Map to world coords: clamp and scale so ~15° tilt = full range
      const gamma = Math.max(-tiltMaxAngle, Math.min(tiltMaxAngle, e.gamma));
      const beta = Math.max(-tiltMaxAngle, Math.min(tiltMaxAngle, e.beta - tiltBetaOffset));
      cursorX = (gamma / tiltMaxAngle) * 3;
      cursorY = -(beta / tiltMaxAngle) * 2;
    });
  }

  // avoidRadius and lerpSpeed are destructured from theme.heroScene above

  // Idle drift: each shape gets its own random drift using sine waves
  const driftConfigs = shapes.map((_, i) => ({
    freqX: 0.3 + i * 0.07, // different frequency per shape
    freqY: 0.25 + i * 0.09,
    phaseX: i * 1.7, // offset so they don't sync
    phaseY: i * 2.3,
    amplitude: 0.15 + i * 0.03, // how far they wander (0.15–0.3 units)
  }));

  let time = 0;

  // Signal to preloader that the 3D scene is ready
  window.dispatchEvent(new CustomEvent("hero-scene-ready"));

  function animate() {
    requestAnimationFrame(animate);
    time += 0.016; // ~60fps increment

    // Rotate shapes
    if (!prefersReducedMotion) {
      shapes.forEach(({ mesh }, i) => {
        mesh.rotation.x += 0.002 * (i + 1) * 0.5;
        mesh.rotation.y += 0.003 * (i + 1) * 0.5;
      });
    }

    // Move each shape: idle drift + cursor avoidance
    shapes.forEach((shape, i) => {
      const drift = driftConfigs[i];

      // Idle drift using sine waves (always active)
      const driftX = Math.sin(time * drift.freqX + drift.phaseX) * drift.amplitude;
      const driftY = Math.cos(time * drift.freqY + drift.phaseY) * drift.amplitude;

      // Cursor avoidance
      const dx = shape.home.x - cursorX;
      const dy = shape.home.y - cursorY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      let avoidX = 0;
      let avoidY = 0;

      if (dist < avoidRadius && dist > 0.01) {
        const strength = 1 - dist / avoidRadius;
        const nx = dx / dist;
        const ny = dy / dist;
        const push = strength * shape.maxDisplacement;
        avoidX = nx * push;
        avoidY = ny * push;
      }

      // Combine: drift + avoidance (avoidance overrides when active)
      const targetX = driftX + avoidX;
      const targetY = driftY + avoidY;

      // Lerp toward combined target
      shape.offset.x += (targetX - shape.offset.x) * lerpSpeed;
      shape.offset.y += (targetY - shape.offset.y) * lerpSpeed;

      // Apply offset to mesh position
      shape.mesh.position.x = shape.home.x + shape.offset.x;
      shape.mesh.position.y = shape.home.y + shape.offset.y;
    });

    renderer.render(scene, camera);
  }
  animate();

  function onResize() {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  }
  window.addEventListener("resize", onResize);

  return () => {
    window.removeEventListener("resize", onResize);
    renderer.dispose();
    geometries.forEach((g) => g.dispose());
  };
}
