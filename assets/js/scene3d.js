/* ============================================================
   LS DRY CLEANERS — ENHANCED HERO 3D SCENE
   Three.js — Iridescent bubble field with morphing hanger ring,
   bloom-like glow, and particle constellations
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
  scene.fog = new THREE.FogExp2(0x06090f, 0.035);

  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 120);
  camera.position.set(0, 0, 14);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;

  // ----- Lights -----
  scene.add(new THREE.AmbientLight(0xffffff, 0.35));

  const goldLight = new THREE.PointLight(0xd4a574, 2.0, 35);
  goldLight.position.set(6, 5, 7);
  scene.add(goldLight);

  const cyanLight = new THREE.PointLight(0x5fc9d4, 1.5, 30);
  cyanLight.position.set(-7, -4, 5);
  scene.add(cyanLight);

  const purpleLight = new THREE.PointLight(0xa78bfa, 0.8, 25);
  purpleLight.position.set(0, 6, -3);
  scene.add(purpleLight);

  const rim = new THREE.DirectionalLight(0xffffff, 0.4);
  rim.position.set(-3, 5, -4);
  scene.add(rim);


  // ===== Bubbles =====
  const bubbleGroup = new THREE.Group();
  scene.add(bubbleGroup);
  const bubbleCount = 35;
  const bubbles = [];
  const bubbleGeo = new THREE.SphereGeometry(1, 48, 48);

  for (let i = 0; i < bubbleCount; i++) {
    const mat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0.05,
      roughness: 0.02,
      transmission: 0.96,
      thickness: 0.6,
      ior: 1.45,
      clearcoat: 1.0,
      clearcoatRoughness: 0.03,
      transparent: true,
      opacity: 0.55,
      iridescence: 1.0,
      iridescenceIOR: 1.35,
      iridescenceThicknessRange: [80, 600],
      envMapIntensity: 1.5,
      sheen: 1.0,
      sheenColor: new THREE.Color(0xd4a574),
      sheenRoughness: 0.2
    });

    const mesh = new THREE.Mesh(bubbleGeo, mat);
    const radius = 0.15 + Math.random() * 0.6;
    mesh.scale.setScalar(radius);
    mesh.position.set(
      (Math.random() - 0.5) * 16,
      (Math.random() - 0.5) * 11 - 1,
      (Math.random() - 0.5) * 10 - 3
    );

    bubbles.push({
      mesh,
      baseY: mesh.position.y,
      baseX: mesh.position.x,
      baseZ: mesh.position.z,
      speed: 0.12 + Math.random() * 0.35,
      driftAmp: 0.35 + Math.random() * 0.8,
      phase: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.004
    });
    bubbleGroup.add(mesh);
  }


  // ===== Central ring system (garment hanger abstraction) =====
  const ringGroup = new THREE.Group();
  scene.add(ringGroup);
  ringGroup.position.set(0, 0, -1.5);

  // Main torus
  const mainTorus = new THREE.Mesh(
    new THREE.TorusGeometry(2.4, 0.025, 20, 220),
    new THREE.MeshStandardMaterial({
      color: 0xd4a574,
      metalness: 0.95,
      roughness: 0.12,
      emissive: 0xd4a574,
      emissiveIntensity: 0.2
    })
  );
  ringGroup.add(mainTorus);

  // Inner cyan ring
  const innerRing = new THREE.Mesh(
    new THREE.TorusGeometry(1.6, 0.015, 16, 180),
    new THREE.MeshStandardMaterial({
      color: 0x5fc9d4,
      metalness: 0.7,
      roughness: 0.2,
      emissive: 0x5fc9d4,
      emissiveIntensity: 0.25,
      transparent: true,
      opacity: 0.8
    })
  );
  innerRing.rotation.x = Math.PI / 3;
  ringGroup.add(innerRing);

  // Outer thin accent
  const outerRing = new THREE.Mesh(
    new THREE.TorusGeometry(3.4, 0.006, 8, 260),
    new THREE.MeshBasicMaterial({
      color: 0xa78bfa,
      transparent: true,
      opacity: 0.2
    })
  );
  outerRing.rotation.x = Math.PI / 2.5;
  ringGroup.add(outerRing);

  // Extra accent ring
  const accentRing = new THREE.Mesh(
    new THREE.TorusGeometry(2.9, 0.008, 8, 200),
    new THREE.MeshBasicMaterial({
      color: 0xd4a574,
      transparent: true,
      opacity: 0.12
    })
  );
  accentRing.rotation.x = Math.PI / 1.8;
  accentRing.rotation.z = Math.PI / 4;
  ringGroup.add(accentRing);


  // ===== Particle constellation =====
  const particleCount = 350;
  const pPositions = new Float32Array(particleCount * 3);
  const pSizes = new Float32Array(particleCount);
  for (let i = 0; i < particleCount; i++) {
    pPositions[i * 3]     = (Math.random() - 0.5) * 35;
    pPositions[i * 3 + 1] = (Math.random() - 0.5) * 25;
    pPositions[i * 3 + 2] = (Math.random() - 0.5) * 18 - 5;
    pSizes[i] = Math.random() * 2 + 0.5;
  }
  const particlesGeo = new THREE.BufferGeometry();
  particlesGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
  particlesGeo.setAttribute('size', new THREE.BufferAttribute(pSizes, 1));

  const particles = new THREE.Points(
    particlesGeo,
    new THREE.PointsMaterial({
      color: 0xd4a574,
      size: 0.03,
      transparent: true,
      opacity: 0.6,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending
    })
  );
  scene.add(particles);

  // Second particle layer (cyan, slower)
  const p2Geo = new THREE.BufferGeometry();
  const p2Pos = new Float32Array(120 * 3);
  for (let i = 0; i < 120; i++) {
    p2Pos[i * 3]     = (Math.random() - 0.5) * 28;
    p2Pos[i * 3 + 1] = (Math.random() - 0.5) * 18;
    p2Pos[i * 3 + 2] = (Math.random() - 0.5) * 12 - 3;
  }
  p2Geo.setAttribute('position', new THREE.BufferAttribute(p2Pos, 3));
  const particles2 = new THREE.Points(
    p2Geo,
    new THREE.PointsMaterial({
      color: 0x5fc9d4,
      size: 0.02,
      transparent: true,
      opacity: 0.4,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending
    })
  );
  scene.add(particles2);


  // ===== Mouse parallax =====
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  window.addEventListener('mousemove', (e) => {
    mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.ty = -((e.clientY / window.innerHeight) * 2 - 1);
  });
  window.addEventListener('touchmove', (e) => {
    if (e.touches[0]) {
      mouse.tx = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
      mouse.ty = -((e.touches[0].clientY / window.innerHeight) * 2 - 1);
    }
  }, { passive: true });

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

    // Smooth mouse with lerp
    mouse.x += (mouse.tx - mouse.x) * 0.035;
    mouse.y += (mouse.ty - mouse.y) * 0.035;

    // Rings rotation (morphing feel)
    mainTorus.rotation.x = t * 0.15 + Math.sin(t * 0.3) * 0.1;
    mainTorus.rotation.y = t * 0.1;
    innerRing.rotation.x = Math.PI / 3 + t * 0.22;
    innerRing.rotation.y = t * -0.15 + Math.cos(t * 0.2) * 0.15;
    outerRing.rotation.z = t * 0.05;
    accentRing.rotation.y = t * 0.08;
    accentRing.rotation.x = Math.PI / 1.8 + Math.sin(t * 0.15) * 0.2;

    ringGroup.rotation.y = mouse.x * 0.45;
    ringGroup.rotation.x = -mouse.y * 0.3;

    // Scale pulsation (breathing)
    const breathe = 1 + Math.sin(t * 0.6) * 0.03;
    ringGroup.scale.setScalar(breathe);

    // Bubbles
    for (let i = 0; i < bubbles.length; i++) {
      const b = bubbles[i];
      b.mesh.position.y = b.baseY + Math.sin(t * b.speed + b.phase) * b.driftAmp;
      b.mesh.position.x = b.baseX + Math.cos(t * b.speed * 0.6 + b.phase) * 0.5;
      b.mesh.position.z = b.baseZ + Math.sin(t * b.speed * 0.4 + b.phase * 2) * 0.3;
      b.mesh.rotation.x += b.rotSpeed;
      b.mesh.rotation.y += b.rotSpeed * 0.7;
    }
    bubbleGroup.rotation.y = mouse.x * 0.12;
    bubbleGroup.rotation.x = -mouse.y * 0.06;

    // Particles
    particles.rotation.y = t * 0.015;
    particles.rotation.x = t * 0.005;
    particles2.rotation.y = -t * 0.01;

    // Light animation
    goldLight.position.x = 6 + Math.sin(t * 0.3) * 2;
    cyanLight.position.y = -4 + Math.cos(t * 0.25) * 1.5;
    purpleLight.position.z = -3 + Math.sin(t * 0.2) * 2;

    // Camera
    camera.position.x = mouse.x * 0.5;
    camera.position.y = mouse.y * 0.3;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }

  animate();
  if (prefersReduced) renderer.render(scene, camera);
})();
