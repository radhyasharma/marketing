/* ============================================================
   LS DRY CLEANERS — HERO 3D SCENE
   Three.js — floating soap-bubble field with garment hanger silhouette
   ============================================================ */

(function () {
  if (typeof THREE === 'undefined') {
    console.warn('[scene3d] THREE not loaded');
    return;
  }

  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  // Respect reduced-motion preference
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0a0e1a, 0.04);

  const camera = new THREE.PerspectiveCamera(
    55,
    canvas.clientWidth / canvas.clientHeight || 1,
    0.1,
    100
  );
  camera.position.set(0, 0, 12);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace || renderer.outputColorSpace;

  // ----- Lights -----
  const ambient = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambient);

  const goldLight = new THREE.PointLight(0xd4a574, 1.4, 30);
  goldLight.position.set(5, 4, 6);
  scene.add(goldLight);

  const cyanLight = new THREE.PointLight(0x5fc9d4, 1.0, 30);
  cyanLight.position.set(-6, -3, 4);
  scene.add(cyanLight);

  const rim = new THREE.DirectionalLight(0xffffff, 0.6);
  rim.position.set(-2, 4, -3);
  scene.add(rim);

  // ===== Bubbles =====
  const bubbleGroup = new THREE.Group();
  scene.add(bubbleGroup);

  const bubbleCount = 28;
  const bubbles = [];

  const bubbleGeo = new THREE.SphereGeometry(1, 32, 32);

  for (let i = 0; i < bubbleCount; i++) {
    // Iridescent translucent bubble material
    const mat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0.1,
      roughness: 0.05,
      transmission: 0.95,
      thickness: 0.5,
      ior: 1.4,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      transparent: true,
      opacity: 0.6,
      iridescence: 1.0,
      iridescenceIOR: 1.3,
      iridescenceThicknessRange: [100, 800]
    });

    const mesh = new THREE.Mesh(bubbleGeo, mat);

    const radius = 0.18 + Math.random() * 0.55;
    mesh.scale.setScalar(radius);

    mesh.position.set(
      (Math.random() - 0.5) * 14,
      (Math.random() - 0.5) * 10 - 1,
      (Math.random() - 0.5) * 8 - 2
    );

    bubbles.push({
      mesh,
      baseY: mesh.position.y,
      baseX: mesh.position.x,
      speed: 0.15 + Math.random() * 0.4,
      driftAmp: 0.3 + Math.random() * 0.7,
      driftFreq: 0.3 + Math.random() * 0.6,
      phase: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.005
    });

    bubbleGroup.add(mesh);
  }

  // ===== Central Hanger ring (abstract garment hanger as torus + line) =====
  const ringGroup = new THREE.Group();
  scene.add(ringGroup);
  ringGroup.position.set(0, 0, -1);

  const torusGeo = new THREE.TorusGeometry(2.2, 0.022, 16, 200);
  const torusMat = new THREE.MeshStandardMaterial({
    color: 0xd4a574,
    metalness: 0.95,
    roughness: 0.18,
    emissive: 0xd4a574,
    emissiveIntensity: 0.15
  });
  const torus = new THREE.Mesh(torusGeo, torusMat);
  ringGroup.add(torus);

  // Inner accent ring
  const innerTorus = new THREE.Mesh(
    new THREE.TorusGeometry(1.5, 0.012, 12, 160),
    new THREE.MeshStandardMaterial({
      color: 0x5fc9d4,
      metalness: 0.6,
      roughness: 0.3,
      emissive: 0x5fc9d4,
      emissiveIntensity: 0.2,
      transparent: true,
      opacity: 0.7
    })
  );
  innerTorus.rotation.x = Math.PI / 3;
  ringGroup.add(innerTorus);

  // Outer thin ring
  const outerRing = new THREE.Mesh(
    new THREE.TorusGeometry(3.2, 0.005, 8, 240),
    new THREE.MeshBasicMaterial({
      color: 0xd4a574,
      transparent: true,
      opacity: 0.25
    })
  );
  outerRing.rotation.x = Math.PI / 2.5;
  ringGroup.add(outerRing);

  // ===== Particle dust =====
  const particlesGeo = new THREE.BufferGeometry();
  const particleCount = 240;
  const pPositions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    pPositions[i * 3]     = (Math.random() - 0.5) * 30;
    pPositions[i * 3 + 1] = (Math.random() - 0.5) * 20;
    pPositions[i * 3 + 2] = (Math.random() - 0.5) * 15 - 4;
  }
  particlesGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
  const particles = new THREE.Points(
    particlesGeo,
    new THREE.PointsMaterial({
      color: 0xd4a574,
      size: 0.025,
      transparent: true,
      opacity: 0.5,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending
    })
  );
  scene.add(particles);

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
  let frame = 0;

  function animate() {
    if (prefersReduced) return;
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    // Smooth mouse
    mouse.x += (mouse.tx - mouse.x) * 0.04;
    mouse.y += (mouse.ty - mouse.y) * 0.04;

    // Rotate central rings
    torus.rotation.x = t * 0.18;
    torus.rotation.y = t * 0.12;
    innerTorus.rotation.x = Math.PI / 3 + t * 0.25;
    innerTorus.rotation.y = t * -0.18;
    outerRing.rotation.z = t * 0.06;

    ringGroup.rotation.y = mouse.x * 0.4;
    ringGroup.rotation.x = -mouse.y * 0.25;

    // Bubbles
    for (let i = 0; i < bubbles.length; i++) {
      const b = bubbles[i];
      b.mesh.position.y = b.baseY + Math.sin(t * b.speed + b.phase) * b.driftAmp;
      b.mesh.position.x = b.baseX + Math.cos(t * b.speed * 0.7 + b.phase) * 0.4;
      b.mesh.rotation.x += b.rotSpeed;
      b.mesh.rotation.y += b.rotSpeed * 0.7;
    }
    bubbleGroup.rotation.y = mouse.x * 0.15;
    bubbleGroup.rotation.x = -mouse.y * 0.08;

    // Particles drift
    particles.rotation.y = t * 0.02;

    // Subtle camera dolly
    camera.position.x = mouse.x * 0.4;
    camera.position.y = mouse.y * 0.25;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
    frame++;
  }

  // Pause when offscreen for perf
  let visible = true;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      visible = e.isIntersecting;
    });
  });
  io.observe(canvas);

  animate();

  // For prefers-reduced-motion: render single frame
  if (prefersReduced) renderer.render(scene, camera);
})();
