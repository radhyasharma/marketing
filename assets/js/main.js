/* ============================================================
   LS DRY CLEANERS — ENHANCED MAIN JS
   Skills: Framer Motion spring physics · 21st.dev micro-interactions
   UI/UX Pro Max spatial depth + gesture feedback
   ============================================================ */
(function () {
  'use strict';

  // ===== Cursor Glow (21st.dev) =====
  const glow = document.createElement('div');
  glow.className = 'cursor-glow';
  document.body.appendChild(glow);

  let glowX = 0, glowY = 0, currentX = 0, currentY = 0;
  window.addEventListener('mousemove', e => {
    glowX = e.clientX;
    glowY = e.clientY;
  });
  function animateGlow() {
    currentX += (glowX - currentX) * 0.08;
    currentY += (glowY - currentY) * 0.08;
    glow.style.left = currentX + 'px';
    glow.style.top = currentY + 'px';
    requestAnimationFrame(animateGlow);
  }
  animateGlow();


  // ===== Header scroll =====
  const header = document.querySelector('.site-header');
  const onScroll = () => {
    if (!header) return;
    header.classList.toggle('scrolled', window.scrollY > 20);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ===== Mobile menu =====
  const toggle = document.querySelector('.menu-toggle');
  const menu = document.querySelector('.mobile-menu');
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      menu.classList.toggle('open');
      document.body.style.overflow = menu.classList.contains('open') ? 'hidden' : '';
    });
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      menu.classList.remove('open');
      document.body.style.overflow = '';
    }));
  }

  // ===== Reveal on scroll (Framer Motion stagger style) =====
  const revealSelectors = '.reveal, .reveal-stagger, .reveal-left, .reveal-right, .reveal-scale';
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        revealObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -60px 0px' });
  document.querySelectorAll(revealSelectors).forEach(el => revealObs.observe(el));


  // ===== 3D Tilt on service cards (spring physics) =====
  document.querySelectorAll('.service-card, .glass-card').forEach(card => {
    let bounds;
    const enter = () => { bounds = card.getBoundingClientRect(); };
    const move = (e) => {
      if (!bounds) return;
      const x = e.clientX - bounds.left;
      const y = e.clientY - bounds.top;
      const cx = bounds.width / 2;
      const cy = bounds.height / 2;
      const rx = ((y - cy) / cy) * -7;
      const ry = ((x - cx) / cx) * 7;
      card.style.transform = `translateY(-8px) perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.02)`;
      card.style.setProperty('--mx', `${(x / bounds.width) * 100}%`);
      card.style.setProperty('--my', `${(y / bounds.height) * 100}%`);
    };
    const leave = () => {
      card.style.transform = '';
      card.style.setProperty('--mx', '50%');
      card.style.setProperty('--my', '50%');
    };
    card.addEventListener('mouseenter', enter);
    card.addEventListener('mousemove', move);
    card.addEventListener('mouseleave', leave);
  });

  // ===== Magnetic buttons (Framer Motion gesture) =====
  document.querySelectorAll('.btn-primary, .btn-ghost').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.setProperty('--mx', `${((e.clientX - rect.left) / rect.width) * 100}%`);
      btn.style.setProperty('--my', `${((e.clientY - rect.top) / rect.height) * 100}%`);
      // Subtle magnetic pull
      const pull = 0.2;
      btn.style.transform = `translate(${x * pull}px, ${y * pull}px) translateY(-3px) scale(1.02)`;
    });
    btn.addEventListener('mouseleave', (e) => {
      btn.style.transform = '';
    });
  });


  // ===== Smooth anchor scroll =====
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
      }
    });
  });

  // ===== Stat counter with spring easing =====
  const counters = document.querySelectorAll('.hero-stat .num[data-count]');
  const counterObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.count, 10);
      const suffix = el.dataset.suffix || '';
      const dur = 2000;
      const start = performance.now();
      function step(now) {
        const p = Math.min((now - start) / dur, 1);
        // Spring-like overshoot easing
        const eased = 1 - Math.pow(1 - p, 4) * Math.cos(p * Math.PI * 0.8);
        const val = Math.min(Math.round(target * eased), target);
        el.textContent = val.toLocaleString() + suffix;
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = target.toLocaleString() + suffix;
      }
      requestAnimationFrame(step);
      counterObs.unobserve(el);
    });
  });
  counters.forEach(c => counterObs.observe(c));

  // ===== Parallax depth layers on scroll =====
  const parallaxEls = document.querySelectorAll('[data-parallax]');
  if (parallaxEls.length) {
    window.addEventListener('scroll', () => {
      const sy = window.scrollY;
      parallaxEls.forEach(el => {
        const speed = parseFloat(el.dataset.parallax) || 0.1;
        el.style.transform = `translateY(${sy * speed}px)`;
      });
    }, { passive: true });
  }

  // ===== Noise overlay class =====
  document.body.classList.add('noise-overlay');

})();
