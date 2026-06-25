/* ================================================================
   PORTFOLIO — Three.js 3D Background & Interactions
   Mithun Raj S N | Java & AI Backend Developer
   ================================================================ */

// ================================================================
// THREE.JS — Particle Network Background
// ================================================================
(function initThreeBackground() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 55;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  // — Group to hold particles + lines (rotate together) —
  const networkGroup = new THREE.Group();
  scene.add(networkGroup);

  // — Particles —
  const PARTICLE_COUNT = 900;
  const SPREAD = 85;
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const velocities = []; // subtle drift for each particle

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * SPREAD;
    positions[i * 3 + 1] = (Math.random() - 0.5) * SPREAD;
    positions[i * 3 + 2] = (Math.random() - 0.5) * SPREAD;
    velocities.push({
      x: (Math.random() - 0.5) * 0.008,
      y: (Math.random() - 0.5) * 0.008,
      z: (Math.random() - 0.5) * 0.005,
    });
  }

  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const particleMaterial = new THREE.PointsMaterial({
    color: 0x00f2fe,
    size: 0.18,
    transparent: true,
    opacity: 0.75,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
    depthWrite: false,
  });

  const particles = new THREE.Points(particleGeometry, particleMaterial);
  networkGroup.add(particles);

  // — Connection Lines —
  const CONNECTION_DISTANCE = 11;
  const MAX_LINES = 2500;
  const linePositionsArr = [];

  for (let i = 0; i < PARTICLE_COUNT && linePositionsArr.length / 6 < MAX_LINES; i++) {
    for (let j = i + 1; j < PARTICLE_COUNT && linePositionsArr.length / 6 < MAX_LINES; j++) {
      const dx = positions[i * 3]     - positions[j * 3];
      const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
      const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
      const distSq = dx * dx + dy * dy + dz * dz;

      if (distSq < CONNECTION_DISTANCE * CONNECTION_DISTANCE) {
        linePositionsArr.push(
          positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2],
          positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2]
        );
      }
    }
  }

  const lineGeometry = new THREE.BufferGeometry();
  lineGeometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(linePositionsArr, 3)
  );

  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0x00f2fe,
    transparent: true,
    opacity: 0.06,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
  networkGroup.add(lines);

  // — Floating Geometric Shapes —
  const shapeConfigs = [
    { geo: new THREE.IcosahedronGeometry(2, 0), color: 0x4facfe },
    { geo: new THREE.OctahedronGeometry(1.6, 0), color: 0x00f2fe },
    { geo: new THREE.TetrahedronGeometry(1.3, 0), color: 0x4facfe },
    { geo: new THREE.IcosahedronGeometry(1.8, 1), color: 0x00f2fe },
    { geo: new THREE.DodecahedronGeometry(1.4, 0), color: 0x4facfe },
    { geo: new THREE.OctahedronGeometry(2.2, 0), color: 0x00f2fe },
  ];

  const shapeMeshes = [];

  shapeConfigs.forEach((cfg) => {
    const mat = new THREE.MeshBasicMaterial({
      color: cfg.color,
      wireframe: true,
      transparent: true,
      opacity: 0.12,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(cfg.geo, mat);
    mesh.position.set(
      (Math.random() - 0.5) * 70,
      (Math.random() - 0.5) * 70,
      (Math.random() - 0.5) * 35
    );
    mesh.userData = {
      rotSpeed: {
        x: (Math.random() - 0.5) * 0.012,
        y: (Math.random() - 0.5) * 0.012,
        z: (Math.random() - 0.5) * 0.006,
      },
      floatSpeed: Math.random() * 0.4 + 0.25,
      floatAmp: Math.random() * 2.5 + 1,
      floatOffset: Math.random() * Math.PI * 2,
      baseY: mesh.position.y,
    };
    scene.add(mesh);
    shapeMeshes.push(mesh);
  });

  // — Mouse Tracking —
  let targetMX = 0, targetMY = 0;
  let currentMX = 0, currentMY = 0;

  document.addEventListener('mousemove', (e) => {
    targetMX = (e.clientX / window.innerWidth) * 2 - 1;
    targetMY = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  // — Animation Loop —
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();

    // Smooth mouse lerp
    currentMX += (targetMX - currentMX) * 0.04;
    currentMY += (targetMY - currentMY) * 0.04;

    // Rotate the whole network slowly + parallax
    networkGroup.rotation.x = elapsed * 0.025 + currentMY * 0.12;
    networkGroup.rotation.y = elapsed * 0.04  + currentMX * 0.12;

    // Animate individual particles slightly
    const posArr = particleGeometry.attributes.position.array;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      posArr[i * 3]     += velocities[i].x;
      posArr[i * 3 + 1] += velocities[i].y;
      posArr[i * 3 + 2] += velocities[i].z;

      // Soft boundary wrap
      const halfSpread = SPREAD / 2;
      if (Math.abs(posArr[i * 3])     > halfSpread) velocities[i].x *= -1;
      if (Math.abs(posArr[i * 3 + 1]) > halfSpread) velocities[i].y *= -1;
      if (Math.abs(posArr[i * 3 + 2]) > halfSpread) velocities[i].z *= -1;
    }
    particleGeometry.attributes.position.needsUpdate = true;

    // Animate floating shapes
    shapeMeshes.forEach((mesh) => {
      const ud = mesh.userData;
      mesh.rotation.x += ud.rotSpeed.x;
      mesh.rotation.y += ud.rotSpeed.y;
      mesh.rotation.z += ud.rotSpeed.z;
      mesh.position.y =
        ud.baseY +
        Math.sin(elapsed * ud.floatSpeed + ud.floatOffset) * ud.floatAmp;
    });

    renderer.render(scene, camera);
  }

  animate();

  // — Resize Handler —
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  });
})();


// ================================================================
// NAVIGATION — Scroll Behavior & Active Link
// ================================================================
(function initNavigation() {
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-links a');
  const sections = document.querySelectorAll('section[id]');
  const hamburger = document.getElementById('nav-hamburger');
  const navMenu = document.getElementById('nav-links');

  // Shrink navbar on scroll
  let lastScrollY = 0;
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    if (scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Active section detection
    let currentSection = '';
    sections.forEach((section) => {
      const sectionTop = section.offsetTop - 200;
      if (scrollY >= sectionTop) {
        currentSection = section.getAttribute('id');
      }
    });

    // Also check footer/contact (it's not a <section>)
    const footer = document.getElementById('contact');
    if (footer) {
      const footerTop = footer.offsetTop - 200;
      if (scrollY >= footerTop) {
        currentSection = 'contact';
      }
    }

    navLinks.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSection}`) {
        link.classList.add('active');
      }
    });

    lastScrollY = scrollY;
  }, { passive: true });

  // Hamburger toggle
  hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('open');
    hamburger.classList.toggle('open');
  });

  // Close menu on link click (mobile)
  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
      hamburger.classList.remove('open');
    });
  });
})();


// ================================================================
// SCROLL REVEAL — Intersection Observer
// ================================================================
(function initScrollReveal() {
  const fadeElements = document.querySelectorAll('.fade-in');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // Once revealed, stop observing to improve performance
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -60px 0px',
    }
  );

  fadeElements.forEach((el) => observer.observe(el));
})();


// ================================================================
// GLASS CARD — Mouse Spotlight Effect
// ================================================================
(function initCardSpotlight() {
  const cards = document.querySelectorAll('.glass-card');

  cards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--mouse-x', `${x}%`);
      card.style.setProperty('--mouse-y', `${y}%`);
    });
  });
})();
