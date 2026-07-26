// ===== Mobile Menu =====
function toggleMenu() {
  document.getElementById('mobile-menu').classList.toggle('active');
}

// ===== Page Loader =====
window.addEventListener('load', () => {
  const loader = document.getElementById('page-loader');
  if (loader) {
    setTimeout(() => loader.classList.add('hidden'), 400);
    setTimeout(() => loader.remove(), 1000);
  }
  // Trigger hero animations after load
  setTimeout(() => {
    document.querySelectorAll('.hero-line').forEach((el, i) => {
      setTimeout(() => el.classList.add('visible'), i * 150);
    });
  }, 500);
});

// ===== Throttle helper =====
function throttle(fn, ms) {
  let last = 0, raf;
  return function() {
    const now = performance.now();
    if (now - last >= ms) {
      last = now;
      fn();
    } else {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(fn);
    }
  };
}

// ===== Combined Scroll Handler (throttled) =====
const onScroll = throttle(() => {
  const scrollY = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;

  // Scroll progress bar
  const bar = document.getElementById('scroll-progress');
  if (bar) bar.style.width = (scrollY / docHeight) * 100 + '%';

  // Navbar scroll effect
  document.getElementById('navbar').classList.toggle('scrolled', scrollY > 50);
  document.getElementById('backToTop').classList.toggle('visible', scrollY > 400);

  // Active nav highlight
  let current = '';
  sections.forEach(s => { if (scrollY >= s.offsetTop - 100) current = s.id; });
  document.querySelectorAll('.nav-links a').forEach(a => {
    const isActive = a.getAttribute('href') === `#${current}`;
    a.style.color = isActive ? '#DAA520' : '';
  });

  // Parallax on hero
  if (scrollY < window.innerHeight) {
    const heroBg = document.querySelector('.hero-bg');
    const heroImg = document.querySelector('.hero-img');
    if (heroBg) heroBg.style.transform = `translateY(${scrollY * 0.3}px)`;
    if (heroImg) heroImg.style.transform = `translateY(${scrollY * 0.1}px) scale(1.02)`;
  }
}, 16);

const sections = document.querySelectorAll('section[id]');
window.addEventListener('scroll', onScroll, { passive: true });

// ===== Smooth scroll =====
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const t = document.querySelector(a.getAttribute('href'));
    if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' }); }
    // Close mobile menu if open
    const mm = document.getElementById('mobile-menu');
    if (mm && mm.classList.contains('active')) mm.classList.remove('active');
  });
});

// ===== Scroll Animations (IntersectionObserver) =====
const animObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      animObs.unobserve(e.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.addEventListener('DOMContentLoaded', () => {
  // Auto-assign animation classes to elements
  const assignments = [
    { selector: '.sv-row', anim: 'fade-in', stagger: 0.06 },
    { selector: '.project-card', anim: 'scale-up', stagger: 0.1 },
    { selector: '.testimonial-card', anim: 'fade-in', stagger: 0.12 },
    { selector: '.process-card', anim: 'fade-in', stagger: 0.15 },
    { selector: '.ci-card', anim: 'fade-in', stagger: 0.1 },
    { selector: '.trust-item', anim: 'fade-in', stagger: 0.06 },
    { selector: '.check-item', anim: 'fade-in', stagger: 0.08 },
  ];

  assignments.forEach(({ selector, anim, stagger }) => {
    document.querySelectorAll(selector).forEach((el, i) => {
      el.classList.add(anim);
      el.style.transitionDelay = `${i * stagger}s`;
      animObs.observe(el);
    });
  });

  // Specific directional animations
  document.querySelectorAll('.about-image').forEach(el => {
    el.classList.add('slide-left');
    animObs.observe(el);
  });
  document.querySelectorAll('.about-content').forEach(el => {
    el.classList.add('slide-right');
    animObs.observe(el);
  });

  // Image reveal on hero & about photos
  document.querySelectorAll('.hero-img-wrapper, .about-photo').forEach(el => {
    el.classList.add('img-reveal');
    animObs.observe(el);
  });

  // Process icons
  document.querySelectorAll('.process-icon').forEach((el, i) => {
    el.classList.add('process-icon-anim');
    el.style.transitionDelay = `${i * 0.15}s`;
    animObs.observe(el);
  });

  // Process lines
  document.querySelectorAll('.process-line').forEach(el => {
    animObs.observe(el);
  });

  // Section headers with blur-in
  document.querySelectorAll('.section-header').forEach(el => {
    el.classList.add('blur-in');
    animObs.observe(el);
  });

  // Stagger children: services grid, testimonials grid
  document.querySelectorAll('.testimonials-grid').forEach(el => {
    el.classList.add('stagger-children');
    animObs.observe(el);
  });

  // Contact form slide
  document.querySelectorAll('.contact-form').forEach(el => {
    el.classList.add('slide-left');
    animObs.observe(el);
  });
  document.querySelectorAll('.contact-info').forEach(el => {
    el.classList.add('slide-right');
    animObs.observe(el);
  });
});

// ===== Counter Animation =====
const countObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('[data-count]').forEach(el => {
        const target = +el.dataset.count;
        const duration = 2000;
        const start = performance.now();
        const tick = now => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.floor(eased * target).toLocaleString('de-DE');
          if (progress < 1) {
            requestAnimationFrame(tick);
          } else {
            // Pop effect when done
            el.style.transform = 'scale(1.15)';
            setTimeout(() => el.style.transform = 'scale(1)', 200);
          }
        };
        requestAnimationFrame(tick);
      });
      countObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

document.querySelectorAll('.hero-stats').forEach(el => countObs.observe(el));

// ===== 3D Tilt Effect on Cards =====
function initTilt() {
  document.querySelectorAll('.testimonial-card').forEach(card => {
    card.classList.add('tilt-card');
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -4;
      const rotateY = ((x - centerX) / centerX) * 4;
      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}
document.addEventListener('DOMContentLoaded', initTilt);

// ===== Cursor Glow Effect =====
function initCursorGlow() {
  const glow = document.getElementById('cursor-glow');
  if (!glow || window.innerWidth < 768) return;

  document.addEventListener('mousemove', e => {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
    glow.classList.add('active');
  });
  document.addEventListener('mouseleave', () => {
    glow.classList.remove('active');
  });
}
document.addEventListener('DOMContentLoaded', initCursorGlow);

// ===== Service Row Hover Image =====
function initServiceHover() {
  const img = document.getElementById('sv-hover-img');
  if (!img || window.innerWidth < 768) return;

  document.querySelectorAll('.sv-row').forEach(row => {
    row.addEventListener('mouseenter', () => {
      const src = row.dataset.img;
      if (src) {
        img.style.backgroundImage = `url(${src})`;
        img.style.opacity = '1';
        img.style.transform = 'scale(1) rotate(-1deg)';
      }
    });
    row.addEventListener('mousemove', e => {
      img.style.left = e.clientX + 20 + 'px';
      img.style.top = e.clientY - 80 + 'px';
    });
    row.addEventListener('mouseleave', () => {
      img.style.opacity = '0';
      img.style.transform = 'scale(.8) rotate(-2deg)';
    });
  });
}
document.addEventListener('DOMContentLoaded', initServiceHover);

// ===== Magnetic Buttons =====
function initMagneticButtons() {
  document.querySelectorAll('.btn-primary, .btn-white').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
}
document.addEventListener('DOMContentLoaded', initMagneticButtons);

// ===== Form =====
function submitForm() {
  const btn = document.getElementById('submit-btn');
  const form = document.querySelector('.contact-form');
  const nameVal = document.getElementById('name').value;
  btn.textContent = 'Wird gesendet...';
  btn.disabled = true;
  btn.style.opacity = '.7';
  setTimeout(() => {
    // Safe: use textContent for user input to prevent XSS
    const div = document.createElement('div');
    div.className = 'form-success';
    div.style.animation = 'successPop .5s cubic-bezier(.34,1.56,.64,1)';
    div.innerHTML = '<svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#B8860B" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="9 12 11.5 14.5 15.5 9.5"/></svg><h3></h3><p>Wir melden uns innerhalb von 24 Stunden.</p>';
    div.querySelector('h3').textContent = 'Danke, ' + nameVal + '!';
    form.innerHTML = '';
    form.appendChild(div);
  }, 1200);
}
