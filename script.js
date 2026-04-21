/* ─────────────────────────────────────────
   LENIS SMOOTH SCROLL
───────────────────────────────────────── */
let lenis;
function initLenis() {
  if (typeof Lenis === 'undefined') return;
  lenis = new Lenis({ lerp: 0.08, smooth: true });
  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
  if (typeof ScrollTrigger !== 'undefined') {
    lenis.on('scroll', ScrollTrigger.update);
  }
}

/* ─────────────────────────────────────────
   THREE.JS HERO SCENE
───────────────────────────────────────── */
function initThreeHero() {
  if (typeof THREE === 'undefined') return;

  const canvas = document.getElementById('particles');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 32;

  // Multi-colour particle field
  const COUNT = 220;
  const positions = new Float32Array(COUNT * 3);
  const colors = new Float32Array(COUNT * 3);
  const palette = [
    [0.388, 0.4, 0.945],   // indigo
    [0.545, 0.361, 0.965],  // violet
    [0.133, 0.827, 0.933],  // cyan
    [0.063, 0.725, 0.506],  // emerald
  ];

  for (let i = 0; i < COUNT; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 110;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 110;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 60;
    const c = palette[Math.floor(Math.random() * palette.length)];
    colors[i * 3]     = c[0];
    colors[i * 3 + 1] = c[1];
    colors[i * 3 + 2] = c[2];
  }

  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  pGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const pMat = new THREE.PointsMaterial({
    size: 0.28,
    vertexColors: true,
    transparent: true,
    opacity: 0.75,
    sizeAttenuation: true,
  });
  const points = new THREE.Points(pGeo, pMat);
  scene.add(points);

  // Floating wireframe shapes
  const shapes = [];
  const shapeDefs = [
    { geo: new THREE.IcosahedronGeometry(5, 1),    pos: [-22, 9, -8],   color: 0x8b5cf6 },
    { geo: new THREE.OctahedronGeometry(3.5, 0),   pos: [20, -6, -10],  color: 0x22d3ee },
    { geo: new THREE.TorusGeometry(3.5, 0.5, 8, 24), pos: [10, 14, -12], color: 0x6366f1 },
    { geo: new THREE.TetrahedronGeometry(3.5, 0),  pos: [-16, -10, -6], color: 0xa78bfa },
    { geo: new THREE.IcosahedronGeometry(2.5, 0),  pos: [26, 12, -14],  color: 0x22d3ee },
  ];

  shapeDefs.forEach(def => {
    const mat = new THREE.MeshBasicMaterial({
      color: def.color,
      wireframe: true,
      transparent: true,
      opacity: 0.12,
    });
    const mesh = new THREE.Mesh(def.geo, mat);
    mesh.position.set(...def.pos);
    scene.add(mesh);
    shapes.push(mesh);
  });

  // Mouse tracking
  let mouseX = 0, mouseY = 0;
  let targetX = 0, targetY = 0;
  document.addEventListener('mousemove', e => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    points.rotation.y = t * 0.025;
    points.rotation.x = t * 0.01;

    shapes.forEach((shape, i) => {
      shape.rotation.x = t * (0.18 + i * 0.04);
      shape.rotation.y = t * (0.14 + i * 0.03);
      shape.position.y = shapeDefs[i].pos[1] + Math.sin(t * 0.4 + i * 1.2) * 1.2;
    });

    // Smooth camera parallax
    targetX += (mouseX * 3.5 - targetX) * 0.04;
    targetY += (-mouseY * 2.5 - targetY) * 0.04;
    camera.position.x = targetX;
    camera.position.y = targetY;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  }

  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

/* ─────────────────────────────────────────
   GSAP HERO ENTRANCE
───────────────────────────────────────── */
function initHeroAnimation() {
  if (typeof gsap === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  tl.to('.avatar-wrap', { opacity: 1, scale: 1, duration: 0.9, ease: 'back.out(1.4)' }, 0.3)
    .to('.hero-name',   { opacity: 1, y: 0, duration: 0.8 }, 0.55)
    .to('.hero-role',   { opacity: 1, y: 0, duration: 0.7 }, 0.7)
    .to('.hero-desc',   { opacity: 1, y: 0, duration: 0.7 }, 0.8)
    .to('.hero-stats',  { opacity: 1, y: 0, duration: 0.7 }, 0.9)
    .to('.hero-btns',   { opacity: 1, y: 0, duration: 0.7 }, 1.0)
    .to('.scroll-down', { opacity: 1, duration: 0.6 }, 1.3);

  // set initial states
  gsap.set(['.hero-name', '.hero-role', '.hero-desc', '.hero-stats', '.hero-btns'], { y: 36 });
  gsap.set('.avatar-wrap', { scale: 0.6 });
}

/* ─────────────────────────────────────────
   GSAP SCROLL ANIMATIONS
───────────────────────────────────────── */
function initScrollAnimations() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  // Section tags & titles
  gsap.utils.toArray('.reveal-tag').forEach(el => {
    gsap.from(el, {
      scrollTrigger: { trigger: el, start: 'top 88%' },
      opacity: 0, y: 20, duration: 0.6, ease: 'power3.out',
    });
  });

  gsap.utils.toArray('.reveal-title').forEach(el => {
    gsap.from(el, {
      scrollTrigger: { trigger: el, start: 'top 85%' },
      opacity: 0, y: 30, duration: 0.8, ease: 'power3.out',
    });
  });

  gsap.utils.toArray('.reveal-sub').forEach(el => {
    gsap.from(el, {
      scrollTrigger: { trigger: el, start: 'top 85%' },
      opacity: 0, y: 20, duration: 0.7, delay: 0.1, ease: 'power3.out',
    });
  });

  // Skill cards stagger
  gsap.from('.skill-cat', {
    scrollTrigger: { trigger: '#skills .skills-grid', start: 'top 75%' },
    opacity: 0, y: 70, stagger: 0.15, duration: 0.9, ease: 'power3.out',
  });

  // Skill tags pop
  gsap.from('.tag', {
    scrollTrigger: { trigger: '#skills .tags', start: 'top 72%' },
    opacity: 0, scale: 0.4, stagger: 0.03, duration: 0.4,
    ease: 'back.out(2)', delay: 0.3,
  });

  // Work cards
  gsap.from('.work-card', {
    scrollTrigger: { trigger: '#work .work-grid', start: 'top 75%' },
    opacity: 0, y: 80, rotationX: 12, stagger: 0.15, duration: 1,
    ease: 'power3.out', transformOrigin: 'top center',
  });

  // Cert card
  gsap.from('.cert-card', {
    scrollTrigger: { trigger: '.cert-wrap', start: 'top 78%' },
    opacity: 0, scale: 0.88, y: 40, duration: 1.1, ease: 'power3.out',
  });

  // Contact box
  gsap.from('.contact-box', {
    scrollTrigger: { trigger: '#contact .contact-box', start: 'top 80%' },
    opacity: 0, y: 50, duration: 1, ease: 'power3.out',
  });

  // Parallax on hero glows while scrolling
  gsap.to('.glow-1', {
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1.5 },
    y: -120, x: 40, ease: 'none',
  });
  gsap.to('.glow-2', {
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 2 },
    y: -80, x: -30, ease: 'none',
  });
}

/* ─────────────────────────────────────────
   CUSTOM CURSOR
───────────────────────────────────────── */
function initCursor() {
  const dot  = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (!dot || !ring) return;

  let dotX = 0, dotY = 0;
  let ringX = 0, ringY = 0;
  let raf;

  document.addEventListener('mousemove', e => {
    dotX = e.clientX;
    dotY = e.clientY;
    dot.style.left = dotX + 'px';
    dot.style.top  = dotY + 'px';
  });

  function animateRing() {
    ringX += (dotX - ringX) * 0.12;
    ringY += (dotY - ringY) * 0.12;
    ring.style.left = ringX + 'px';
    ring.style.top  = ringY + 'px';
    raf = requestAnimationFrame(animateRing);
  }
  animateRing();

  const hoverEls = document.querySelectorAll('a, button, .tilt-card, .tag, .work-link');
  hoverEls.forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hovering'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hovering'));
  });
}

/* ─────────────────────────────────────────
   MAGNETIC BUTTONS
───────────────────────────────────────── */
function initMagnetic() {
  document.querySelectorAll('.magnetic').forEach(el => {
    el.addEventListener('mousemove', e => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top  + rect.height / 2;
      const dx = (e.clientX - cx) * 0.28;
      const dy = (e.clientY - cy) * 0.28;
      el.style.transform = `translate(${dx}px, ${dy}px)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
    });
  });
}

/* ─────────────────────────────────────────
   VANILLA TILT
───────────────────────────────────────── */
function initTilt() {
  if (typeof VanillaTilt === 'undefined') return;
  VanillaTilt.init(document.querySelectorAll('.tilt-card'), {
    max: 8,
    speed: 600,
    glare: true,
    'max-glare': 0.12,
    perspective: 1000,
    scale: 1.025,
  });
}

/* ─────────────────────────────────────────
   COUNTER ANIMATION
───────────────────────────────────────── */
function initCounters() {
  const nums = document.querySelectorAll('.stat-num');
  let triggered = false;

  function runCounters() {
    nums.forEach(el => {
      const target = parseInt(el.dataset.target, 10);
      const duration = 1400;
      const start = performance.now();

      function step(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target);
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = target;
      }
      requestAnimationFrame(step);
    });
  }

  const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && !triggered) {
      triggered = true;
      setTimeout(runCounters, 1200);
      observer.disconnect();
    }
  }, { threshold: 0.5 });

  const stats = document.querySelector('.hero-stats');
  if (stats) observer.observe(stats);
}

/* ─────────────────────────────────────────
   NAVBAR
───────────────────────────────────────── */
function initNavbar() {
  const navbar    = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('nav-links');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  });

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
  });

  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
    });
  });
}

/* ─────────────────────────────────────────
   TYPING ANIMATION
───────────────────────────────────────── */
function initTyped() {
  const el = document.getElementById('typed');
  if (!el) return;
  const phrases = [
    'AWS Solutions Architect',
    'DevOps Engineer',
    'Cloud Infrastructure Builder',
    'Linux Enthusiast',
  ];
  let phraseIdx = 0, charIdx = 0, deleting = false;

  function type() {
    const current = phrases[phraseIdx];
    el.textContent = deleting
      ? current.slice(0, charIdx--)
      : current.slice(0, charIdx++);

    let delay = deleting ? 55 : 95;

    if (!deleting && charIdx > current.length) {
      deleting = true;
      delay = 1800;
    } else if (deleting && charIdx < 0) {
      deleting  = false;
      phraseIdx = (phraseIdx + 1) % phrases.length;
      charIdx   = 0;
      delay     = 350;
    }
    setTimeout(type, delay);
  }
  type();
}

/* ─────────────────────────────────────────
   INIT ALL
───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('year').textContent = new Date().getFullYear();

  initNavbar();
  initCursor();
  initMagnetic();
  initTyped();
  initCounters();

  // Libraries may load after DOMContentLoaded — wait a tick
  requestAnimationFrame(() => {
    initLenis();
    initThreeHero();
    initHeroAnimation();
    initScrollAnimations();
    initTilt();
  });
});
