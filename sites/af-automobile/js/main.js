/* A&F Automobile — interactions (restrained) */
(function () {
  'use strict';

  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* mobile menu */
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.querySelector('.mobile-menu');
  function closeMenu() { document.body.classList.remove('menu-open'); }
  if (toggle) toggle.addEventListener('click', function () { document.body.classList.toggle('menu-open'); });
  if (menu) menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeMenu); });
  window.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeMenu(); closeLightbox(); } });

  /* smooth anchor scroll (native) */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var t = document.querySelector(id);
      if (!t) return;
      e.preventDefault();
      t.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  /* reveal on scroll (restrained) */
  var revEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revEls.forEach(function (el) { io.observe(el); });
  } else {
    revEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* lightweight parallax */
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var plxEls = Array.prototype.slice.call(document.querySelectorAll('img[data-parallax]'));
  if (plxEls.length && !reduce) {
    var ticking = false;
    function updateParallax() {
      var vh = window.innerHeight;
      plxEls.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        var speed = parseFloat(el.getAttribute('data-parallax')) || 10;
        var progress = (r.top + r.height / 2 - vh / 2) / vh; // -1..1 around center
        el.style.transform = 'translate3d(0,' + (-progress * speed) + '%,0)';
      });
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(updateParallax); }
    }, { passive: true });
    updateParallax();
  }

  /* counters */
  var counters = document.querySelectorAll('[data-count]');
  if (counters.length && 'IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target, target = parseFloat(el.getAttribute('data-count'));
        var suffix = el.getAttribute('data-suffix') || '', dec = (target % 1 !== 0) ? 1 : 0;
        var start = null, dur = 1400;
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

  /* gallery filter */
  var filterBtns = document.querySelectorAll('.filters button');
  var figs = document.querySelectorAll('.gallery figure');
  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      var f = btn.getAttribute('data-filter');
      figs.forEach(function (fig) {
        fig.style.display = (f === 'all' || fig.getAttribute('data-cat') === f) ? '' : 'none';
      });
    });
  });

  /* lightbox */
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
    lbImg.src = fig.getAttribute('data-full') || img.src;
    lbCap.textContent = fig.getAttribute('data-cap') || '';
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox() {
    if (!lb || !lb.classList.contains('open')) return;
    lb.classList.remove('open');
    document.body.style.overflow = '';
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

  /* contact form -> whatsapp */
  var form = document.querySelector('form[data-contact]');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = new FormData(form);
      var text = 'Hallo A&F Automobile,%0A%0AName: ' + encodeURIComponent(data.get('name') || '') +
        '%0ATelefon: ' + encodeURIComponent(data.get('phone') || '') +
        '%0ALeistung: ' + encodeURIComponent(data.get('service') || '') +
        '%0A%0A' + encodeURIComponent(data.get('message') || '');
      window.open('https://wa.me/491776443019?text=' + text, '_blank');
      var ok = form.querySelector('.form-ok');
      if (ok) ok.hidden = false;
      form.reset();
    });
  }
})();
