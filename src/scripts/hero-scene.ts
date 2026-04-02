import * as THREE from "three";
import { LineMaterial } from "three/addons/lines/LineMaterial.js";
import { Wireframe } from "three/addons/lines/Wireframe.js";
import { WireframeGeometry2 } from "three/addons/lines/WireframeGeometry2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { theme } from "../config/theme";

/**
 * Initializes the Three.js hero scene with wireframe polyhedra connected by molecular bonds.
 * Shape count adapts to viewport size (more on wide screens, fewer on narrow).
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
    wireframeLineWidth,
    avoidRadius,
    lerpSpeed,
    tiltBetaOffset,
    tiltMaxAngle,
    connectionRadius,
    connectionOpacity,
    connectionLineWidth,
    shapeDensity,
    shapeRepulsionRadius,
    shapeRepulsionStrength,
    spiralInnerRadius,
    minShapes,
    maxShapes,
  } = theme.heroScene;

  const resolution = new THREE.Vector2(container.clientWidth, container.clientHeight);

  const scene = new THREE.Scene();
  const fov = 50;
  const aspect = container.clientWidth / container.clientHeight;
  const camera = new THREE.PerspectiveCamera(fov, aspect, 0.1, 100);
  camera.position.z = cameraZ;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // Fat line material for wireframe shapes (pixel-width lines, cross-browser)
  const shapeMaterial = new LineMaterial({
    color: new THREE.Color(wireframeColor).getHex(),
    linewidth: wireframeLineWidth,
    transparent: true,
    opacity: wireframeOpacity,
    resolution,
  });

  // --- 7 base polyhedra geometries (4-10 vertices each) ---

  const baseGeometries: THREE.BufferGeometry[] = [
    new THREE.TetrahedronGeometry(0.45, 0), // 4 points
    new THREE.BufferGeometry(), // 5 points (triangular bipyramid)
    new THREE.OctahedronGeometry(0.5, 0), // 6 points
    new THREE.BufferGeometry(), // 7 points (pentagonal bipyramid)
    new THREE.BoxGeometry(0.7, 0.7, 0.7), // 8 points (cube)
    new THREE.BufferGeometry(), // 9 points (elongated prism)
    new THREE.IcosahedronGeometry(0.55, 0), // 10 points
  ];

  // Build 5-point: triangular bipyramid (two tetrahedra sharing a face)
  const v5 = [0, 0.6, 0, 0, -0.6, 0, 0.5, 0, 0.3, -0.5, 0, 0.3, 0, 0, -0.5];
  const i5 = [0, 2, 3, 0, 3, 4, 0, 4, 2, 1, 3, 2, 1, 4, 3, 1, 2, 4];
  baseGeometries[1].setAttribute(
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
    i7.push(0, a, b);
    i7.push(1, b, a);
  }
  baseGeometries[3].setAttribute(
    "position",
    new THREE.Float32BufferAttribute(
      i7.flatMap((idx) => [v7[idx * 3], v7[idx * 3 + 1], v7[idx * 3 + 2]]),
      3,
    ),
  );

  // Build 9-point: elongated triangular prism with caps
  const v9: number[] = [];
  for (let k = 0; k < 3; k++) {
    const angle = (k / 3) * Math.PI * 2 - Math.PI / 6;
    v9.push(Math.cos(angle) * 0.4, -0.5, Math.sin(angle) * 0.4);
  }
  for (let k = 0; k < 3; k++) {
    const angle = (k / 3) * Math.PI * 2 - Math.PI / 6;
    v9.push(Math.cos(angle) * 0.4, 0.5, Math.sin(angle) * 0.4);
  }
  v9.push(0, -0.7, 0, 0, 0.7, 0, 0, 0, 0);
  const i9 = [
    0, 1, 2, 3, 5, 4, 0, 3, 1, 1, 3, 4, 1, 4, 2, 2, 4, 5, 2, 5, 0, 0, 5, 3, 6, 0, 1, 6, 1, 2, 6, 2,
    0, 7, 4, 3, 7, 5, 4, 7, 3, 5,
  ];
  baseGeometries[5].setAttribute(
    "position",
    new THREE.Float32BufferAttribute(
      i9.flatMap((idx) => [v9[idx * 3], v9[idx * 3 + 1], v9[idx * 3 + 2]]),
      3,
    ),
  );

  // --- Responsive shape placement ---

  // Compute visible area at z=0 from camera parameters
  const halfH = cameraZ * Math.tan(((fov / 2) * Math.PI) / 180);
  const halfW = halfH * aspect;

  // Shape count scales with container pixel area
  const pixelArea = container.clientWidth * container.clientHeight;
  const shapeCount = Math.max(minShapes, Math.min(maxShapes, Math.round(pixelArea / shapeDensity)));

  // Fibonacci spiral placement: shapes radiate from center outward
  // with golden-angle spacing, scaled to fill the visible rectangle.
  const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // ~137.5°
  const padding = 0.5;
  const usableHalfW = halfW - padding;
  const usableHalfH = halfH - padding;

  // On small viewports, reduce inner clearance so shapes aren't crammed at edges
  const smallestDim = Math.min(usableHalfW, usableHalfH);
  const effectiveInnerRadius = spiralInnerRadius * Math.min(1, smallestDim / 2);

  const homePositions: THREE.Vector3[] = [];
  for (let i = 0; i < shapeCount; i++) {
    const angle = i * goldenAngle;
    // sqrt distributes points evenly by area; lerp from inner to outer radius
    // so the center (where the name is) stays clear
    const t = Math.sqrt((i + 0.5) / shapeCount);
    const r = effectiveInnerRadius + (1 - effectiveInnerRadius) * t;
    const x = Math.cos(angle) * r * usableHalfW;
    const y = Math.sin(angle) * r * usableHalfH;
    const z = Math.sin(i * 3.1) * 0.3;
    homePositions.push(new THREE.Vector3(x, y, z));
  }

  // Create one WireframeGeometry2 per base type (shared across shapes of same type)
  const wireframeGeos = baseGeometries.map((g) => new WireframeGeometry2(g));

  const shapes = homePositions.map((home, i) => {
    const geoIdx = i % baseGeometries.length;
    const wireframe = new Wireframe(wireframeGeos[geoIdx], shapeMaterial);
    wireframe.position.copy(home);
    wireframe.rotation.set(i * 0.5, i * 0.7, i * 0.3);
    scene.add(wireframe);

    return {
      mesh: wireframe,
      home,
      offset: new THREE.Vector2(0, 0),
      maxDisplacement: 0.5 + geoIdx * 0.08,
    };
  });

  // Connection lines between shapes (molecular bonds) using fat lines
  const connGeo = new LineSegmentsGeometry();
  const connMat = new LineMaterial({
    color: 0xffffff,
    linewidth: connectionLineWidth,
    transparent: true,
    opacity: connectionOpacity,
    vertexColors: true,
    resolution,
  });
  const connLines = new LineSegments2(connGeo, connMat);
  scene.add(connLines);
  const baseColor = new THREE.Color(wireframeColor);

  // Interaction position in world-ish coordinates
  // On desktop: cursor position. On mobile: derived from device tilt.
  let cursorX = 0;
  let cursorY = 0;

  // Desktop: mouse cursor
  document.addEventListener("mousemove", (e) => {
    cursorX = (e.clientX / window.innerWidth - 0.5) * 6;
    cursorY = -(e.clientY / window.innerHeight - 0.5) * 4;
  });

  // Mobile: device tilt (works on Android without permission, silent no-op on iOS)
  if (window.DeviceOrientationEvent) {
    window.addEventListener("deviceorientation", (e) => {
      if (e.gamma === null || e.beta === null) return;
      const gamma = Math.max(-tiltMaxAngle, Math.min(tiltMaxAngle, e.gamma));
      const beta = Math.max(-tiltMaxAngle, Math.min(tiltMaxAngle, e.beta - tiltBetaOffset));
      cursorX = (gamma / tiltMaxAngle) * 3;
      cursorY = -(beta / tiltMaxAngle) * 2;
    });
  }

  // Idle drift: each shape gets its own sine-wave drift.
  // Use geoIdx (0-6) for bounded amplitude, shape index for unique phase offsets.
  const driftConfigs = shapes.map((_, i) => {
    const geoIdx = i % baseGeometries.length;
    return {
      freqX: 0.3 + geoIdx * 0.07,
      freqY: 0.25 + geoIdx * 0.09,
      phaseX: i * 1.7,
      phaseY: i * 2.3,
      amplitude: 0.15 + geoIdx * 0.03,
    };
  });

  let time = 0;

  // Signal to preloader that the 3D scene is ready
  window.dispatchEvent(new CustomEvent("hero-scene-ready"));

  function animate() {
    requestAnimationFrame(animate);
    time += 0.016;

    // Rotate shapes
    if (!prefersReducedMotion) {
      shapes.forEach(({ mesh }, i) => {
        const speed = ((i % baseGeometries.length) + 1) * 0.5;
        mesh.rotation.x += 0.002 * speed;
        mesh.rotation.y += 0.003 * speed;
      });
    }

    // Move each shape: idle drift + cursor avoidance
    shapes.forEach((shape, i) => {
      const drift = driftConfigs[i];

      const driftX = Math.sin(time * drift.freqX + drift.phaseX) * drift.amplitude;
      const driftY = Math.cos(time * drift.freqY + drift.phaseY) * drift.amplitude;

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

      // Inter-shape repulsion (soft anti-gravity based on current positions)
      let repelX = 0;
      let repelY = 0;
      for (let j = 0; j < shapes.length; j++) {
        if (j === i) continue;
        const rdx = shape.mesh.position.x - shapes[j].mesh.position.x;
        const rdy = shape.mesh.position.y - shapes[j].mesh.position.y;
        const rdist = Math.sqrt(rdx * rdx + rdy * rdy);
        if (rdist < shapeRepulsionRadius && rdist > 0.01) {
          const strength = 1 - rdist / shapeRepulsionRadius;
          repelX += (rdx / rdist) * strength * shapeRepulsionStrength;
          repelY += (rdy / rdist) * strength * shapeRepulsionStrength;
        }
      }

      const targetX = driftX + avoidX + repelX;
      const targetY = driftY + avoidY + repelY;

      shape.offset.x += (targetX - shape.offset.x) * lerpSpeed;
      shape.offset.y += (targetY - shape.offset.y) * lerpSpeed;

      shape.mesh.position.x = shape.home.x + shape.offset.x;
      shape.mesh.position.y = shape.home.y + shape.offset.y;
    });

    // Update connection lines: iterate all pairs, draw if within threshold
    const connPositions: number[] = [];
    const connColors: number[] = [];
    for (let a = 0; a < shapes.length; a++) {
      for (let b = a + 1; b < shapes.length; b++) {
        const ax = shapes[a].mesh.position.x;
        const ay = shapes[a].mesh.position.y;
        const az = shapes[a].mesh.position.z;
        const bx = shapes[b].mesh.position.x;
        const by = shapes[b].mesh.position.y;
        const bz = shapes[b].mesh.position.z;
        const dist = Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2 + (az - bz) ** 2);
        if (dist < connectionRadius) {
          const fade = 1 - dist / connectionRadius;
          const r = baseColor.r * fade;
          const g = baseColor.g * fade;
          const bl = baseColor.b * fade;
          connPositions.push(ax, ay, az, bx, by, bz);
          connColors.push(r, g, bl, r, g, bl);
        }
      }
    }
    if (connPositions.length > 0) {
      connGeo.setPositions(connPositions);
      connGeo.setColors(connColors);
      connLines.visible = true;
    } else {
      connLines.visible = false;
    }

    renderer.render(scene, camera);
  }
  animate();

  function onResize() {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
    resolution.set(container.clientWidth, container.clientHeight);
  }
  window.addEventListener("resize", onResize);

  return () => {
    window.removeEventListener("resize", onResize);
    renderer.dispose();
    connGeo.dispose();
    connMat.dispose();
    shapeMaterial.dispose();
    wireframeGeos.forEach((g) => g.dispose());
    baseGeometries.forEach((g) => g.dispose());
  };
}
