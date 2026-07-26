/* A&F Automobile — interactions & cinematic scroll */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- current year ---------- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- header scroll state ---------- */
  var header = document.querySelector('.header');
  function onScroll() {
    if (header) header.classList.toggle('scrolled', window.scrollY > 30);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- mobile menu ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.querySelector('.mobile-menu');
  function closeMenu() { document.body.classList.remove('menu-open'); }
  if (toggle) {
    toggle.addEventListener('click', function () {
      document.body.classList.toggle('menu-open');
    });
  }
  if (menu) menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeMenu); });
  window.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeMenu(); closeLightbox(); } });

  /* ---------- Lenis smooth scroll ---------- */
  var lenis = null;
  var recordMode = location.search.indexOf('record') !== -1;
  if (window.Lenis && !reduce && !recordMode) {
    lenis = new window.Lenis({ duration: 1.1, smoothWheel: true, wheelMultiplier: 1, lerp: 0.09 });
    function raf(t) { lenis.raf(t); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
  }
  // anchor links
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var t = document.querySelector(id);
      if (!t) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(t, { offset: -90 });
      else t.scrollIntoView({ behavior: 'smooth' });
    });
  });

  /* ---------- reveal on scroll (IO fallback, always on) ---------- */
  var revEls = document.querySelectorAll('.reveal, .line-reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    revEls.forEach(function (el) { io.observe(el); });
  } else {
    revEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- GSAP cinematic bits ---------- */
  if (window.gsap && !reduce) {
    var gsap = window.gsap;
    if (window.ScrollTrigger) gsap.registerPlugin(window.ScrollTrigger);

    // hero parallax + fade
    var heroImg = document.querySelector('.hero__photo img');
    if (heroImg && window.ScrollTrigger) {
      gsap.to(heroImg, {
        yPercent: 16, scale: 1.16, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
      });
    }
    // parallax on any [data-parallax]
    gsap.utils.toArray('[data-parallax]').forEach(function (el) {
      var speed = parseFloat(el.getAttribute('data-parallax')) || 12;
      gsap.to(el, { yPercent: -speed, ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    // hero copy fade-up (headline handled via CSS line-reveal + IO)
    gsap.from('.hero .lead, .hero .btn-row, .hero__meta', { y: 26, opacity: 0, duration: 1, stagger: 0.12, ease: 'power3.out', delay: 0.55 });
  }

  /* ---------- card mouse glow ---------- */
  document.querySelectorAll('.card').forEach(function (c) {
    c.addEventListener('pointermove', function (e) {
      var r = c.getBoundingClientRect();
      c.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
    });
  });

  /* ---------- animated counters ---------- */
  var counters = document.querySelectorAll('[data-count]');
  if (counters.length && 'IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target, target = parseFloat(el.getAttribute('data-count'));
        var suffix = el.getAttribute('data-suffix') || '', dec = (target % 1 !== 0) ? 1 : 0;
        var start = null, dur = 1600;
        function tick(ts) {
          if (!start) start = ts;
          var p = Math.min((ts - start) / dur, 1);
          var e = 1 - Math.pow(1 - p, 3);
          el.textContent = (target * e).toFixed(dec).replace('.', ',') + suffix;
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        cio.unobserve(el);
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  /* ---------- gallery filter ---------- */
  var filterBtns = document.querySelectorAll('.filters button');
  var figs = document.querySelectorAll('.gallery figure');
  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      var f = btn.getAttribute('data-filter');
      figs.forEach(function (fig) {
        var show = f === 'all' || fig.getAttribute('data-cat') === f;
        fig.style.display = show ? '' : 'none';
      });
      if (window.ScrollTrigger) window.ScrollTrigger.refresh();
    });
  });

  /* ---------- lightbox ---------- */
  var lb = document.querySelector('.lightbox');
  var lbImg = lb && lb.querySelector('img');
  var lbCap = lb && lb.querySelector('.lightbox__cap');
  var items = Array.prototype.slice.call(figs);
  var cur = 0;
  function openLightbox(i) {
    if (!lb) return;
    cur = i;
    var fig = items[i];
    var img = fig.querySelector('img');
    var full = fig.getAttribute('data-full') || img.src;
    var cap = fig.getAttribute('data-cap') || (fig.querySelector('figcaption') ? fig.querySelector('figcaption').textContent : '');
    lbImg.src = full; lbCap.textContent = cap;
    lb.classList.add('open');
    if (lenis) lenis.stop(); document.body.style.overflow = 'hidden';
  }
  function closeLightbox() {
    if (!lb || !lb.classList.contains('open')) return;
    lb.classList.remove('open');
    if (lenis) lenis.start(); document.body.style.overflow = '';
  }
  function step(d) {
    var vis = items.filter(function (f) { return f.style.display !== 'none'; });
    var idx = vis.indexOf(items[cur]);
    idx = (idx + d + vis.length) % vis.length;
    openLightbox(items.indexOf(vis[idx]));
  }
  items.forEach(function (fig, i) { fig.addEventListener('click', function () { openLightbox(i); }); });
  if (lb) {
    lb.querySelector('.lightbox__close').addEventListener('click', closeLightbox);
    lb.querySelector('.lightbox__nav.prev').addEventListener('click', function (e) { e.stopPropagation(); step(-1); });
    lb.querySelector('.lightbox__nav.next').addEventListener('click', function (e) { e.stopPropagation(); step(1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) closeLightbox(); });
    window.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'ArrowLeft') step(-1);
      if (e.key === 'ArrowRight') step(1);
    });
  }

  /* ---------- contact form (mailto/whatsapp fallback, no backend) ---------- */
  var form = document.querySelector('form[data-contact]');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = new FormData(form);
      var name = (data.get('name') || '').toString();
      var msg = (data.get('message') || '').toString();
      var svc = (data.get('service') || '').toString();
      var tel = (data.get('phone') || '').toString();
      var text = 'Hallo A&F Automobile,%0A%0AName: ' + encodeURIComponent(name) +
        '%0ATelefon: ' + encodeURIComponent(tel) +
        '%0ALeistung: ' + encodeURIComponent(svc) +
        '%0A%0A' + encodeURIComponent(msg);
      window.open('https://wa.me/491776443019?text=' + text, '_blank');
      var ok = form.querySelector('.form-ok');
      if (ok) ok.hidden = false;
      form.reset();
    });
  }
})();
