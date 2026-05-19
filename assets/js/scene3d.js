/* ============================================================
   LACHMAN SONS DRYCLEANERS — HERO 3D PARTICLE EFFECT
   Confined to top-right corner of the hero banner only.
   Subtle, elegant floating particles — not full-screen.
   ============================================================ */
(function () {
  if (typeof THREE === 'undefined') {
    console.warn('[scene3d] THREE not loaded');
    return;
  }
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 80);
  camera.position.set(0, 0, 20);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  // ----- Lights (subtle, positioned to top-right) -----
  scene.add(new THREE.AmbientLight(0xffffff, 0.3));

  const goldLight = new THREE.PointLight(0xd4a574, 1.5, 30);
  goldLight.position.set(8, 6, 5);
  scene.add(goldLight);

  const cyanLight = new THREE.PointLight(0x5fc9d4, 0.8, 20);
  cyanLight.position.set(4, 8, 3);
  scene.add(cyanLight);

  // ===== Particle cluster — top-right corner only =====
  // All particles are positioned in the positive-X, positive-Y quadrant
  // which maps to the top-right of the viewport.

  const particleCount = 180;
  const pPositions = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    // Cluster in top-right: X from +2 to +12, Y from +1 to +10, Z scattered behind
    pPositions[i * 3]     = 2 + Math.random() * 10;        // right side
    pPositions[i * 3 + 1] = 1 + Math.random() * 9;         // upper area
    pPositions[i * 3 + 2] = -2 + (Math.random() - 0.5) * 8; // depth scatter
  }

  const particlesGeo = new THREE.BufferGeometry();
  particlesGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));

  const particles = new THREE.Points(
    particlesGeo,
    new THREE.PointsMaterial({
      color: 0xd4a574,
      size: 0.06,
      transparent: true,
      opacity: 0.7,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending
    })
  );
  scene.add(particles);

  // Second layer — smaller cyan particles, same corner
  const p2Count = 80;
  const p2Pos = new Float32Array(p2Count * 3);
  for (let i = 0; i < p2Count; i++) {
    p2Pos[i * 3]     = 3 + Math.random() * 9;
    p2Pos[i * 3 + 1] = 2 + Math.random() * 7;
    p2Pos[i * 3 + 2] = -1 + (Math.random() - 0.5) * 6;
  }
  const p2Geo = new THREE.BufferGeometry();
  p2Geo.setAttribute('position', new THREE.BufferAttribute(p2Pos, 3));

  const particles2 = new THREE.Points(
    p2Geo,
    new THREE.PointsMaterial({
      color: 0x5fc9d4,
      size: 0.04,
      transparent: true,
      opacity: 0.5,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending
    })
  );
  scene.add(particles2);

  // ===== Small iridescent bubbles — top-right corner only (6 bubbles) =====
  const bubbleGeo = new THREE.SphereGeometry(1, 32, 32);
  const bubbles = [];

  for (let i = 0; i < 6; i++) {
    const mat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0.05,
      roughness: 0.03,
      transmission: 0.95,
      thickness: 0.4,
      ior: 1.4,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      transparent: true,
      opacity: 0.4,
      iridescence: 1.0,
      iridescenceIOR: 1.3,
      iridescenceThicknessRange: [100, 500]
    });

    const mesh = new THREE.Mesh(bubbleGeo, mat);
    const radius = 0.2 + Math.random() * 0.5;
    mesh.scale.setScalar(radius);

    // Position in top-right area
    mesh.position.set(
      4 + Math.random() * 7,
      2 + Math.random() * 6,
      -1 + (Math.random() - 0.5) * 4
    );

    bubbles.push({
      mesh,
      baseX: mesh.position.x,
      baseY: mesh.position.y,
      speed: 0.15 + Math.random() * 0.3,
      driftAmp: 0.3 + Math.random() * 0.5,
      phase: Math.random() * Math.PI * 2
    });
    scene.add(mesh);
  }

  // ===== Resize =====
  function resize() {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }
  window.addEventListener('resize', resize);
  resize();

  // ===== Animate =====
  const clock = new THREE.Clock();

  function animate() {
    if (prefersReduced) return;
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    // Gentle particle rotation (confined cluster just drifts slightly)
    particles.rotation.y = Math.sin(t * 0.08) * 0.05;
    particles.rotation.x = Math.cos(t * 0.06) * 0.03;
    particles2.rotation.y = -Math.sin(t * 0.05) * 0.04;

    // Bubbles float gently
    for (const b of bubbles) {
      b.mesh.position.y = b.baseY + Math.sin(t * b.speed + b.phase) * b.driftAmp;
      b.mesh.position.x = b.baseX + Math.cos(t * b.speed * 0.5 + b.phase) * 0.3;
    }

    // Subtle light drift
    goldLight.position.x = 8 + Math.sin(t * 0.2) * 1.5;
    cyanLight.position.y = 8 + Math.cos(t * 0.15) * 1;

    renderer.render(scene, camera);
  }

  animate();
  if (prefersReduced) renderer.render(scene, camera);
})();
