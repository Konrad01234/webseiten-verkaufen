/* Geißler Heizungstechnik – Interaktionen & cineastische Animationen */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Preloader */
  var pre = document.getElementById('preloader');
  if (pre) {
    var hidePre = function () {
      pre.classList.add('done');
      setTimeout(function () { if (pre.parentNode) pre.parentNode.removeChild(pre); }, 800);
    };
    if (reduceMotion) hidePre();
    else setTimeout(hidePre, 1400);
  }

  /* Scroll-Fortschritt + Nav-Schatten */
  var prog = document.getElementById('scroll-progress');
  var nav = document.querySelector('.nav');
  var onScroll = function () {
    var el = document.documentElement;
    var max = el.scrollHeight - el.clientHeight;
    if (prog) prog.style.width = (max > 0 ? (el.scrollTop / max) * 100 : 0) + '%';
    if (nav) nav.classList.toggle('scrolled', el.scrollTop > 8);
  };
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Headline: Wort für Wort einblenden */
  var h1 = document.querySelector('.hero h1');
  if (h1 && !reduceMotion) {
    var wordIndex = 0;
    (function wrapWords(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          var frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            var s = document.createElement('span');
            s.className = 'w';
            s.style.setProperty('--d', (0.5 + wordIndex * 0.085).toFixed(3) + 's');
            s.textContent = part;
            wordIndex++;
            frag.appendChild(s);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1) {
          wrapWords(child);
        }
      });
    })(h1);
  }

  /* Mobile-Navigation */
  var burger = document.getElementById('nav-burger');
  var links = document.getElementById('nav-links');
  if (burger && links) {
    burger.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        links.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* Scroll-Reveal mit Stagger */
  var revealEls = document.querySelectorAll('.reveal, .reveal-zoom');
  if ('IntersectionObserver' in window && revealEls.length && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      var visible = entries.filter(function (e) { return e.isIntersecting; });
      visible.forEach(function (entry, i) {
        io.unobserve(entry.target);
        setTimeout(function () { entry.target.classList.add('in'); }, i * 90);
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* Thermostat dreht hoch: 17,0° -> 21,5° samt wachsendem Bogen */
  var thermoTemp = document.getElementById('thermo-temp');
  var thermoArc = document.getElementById('thermo-arc');
  if (thermoTemp && thermoArc) {
    var T_START = 17, T_END = 21.5;
    if (reduceMotion) {
      thermoTemp.textContent = '21,5°';
    } else {
      thermoTemp.textContent = T_START.toFixed(1).replace('.', ',') + '°';
      thermoArc.style.strokeDasharray = '100';
      thermoArc.style.strokeDashoffset = '100';
      setTimeout(function () {
        var t0 = null;
        var stepT = function (t) {
          if (t0 === null) t0 = t;
          var p = Math.min(1, (t - t0) / 2200);
          var eased = 1 - Math.pow(1 - p, 3);
          var val = T_START + (T_END - T_START) * eased;
          thermoTemp.textContent = val.toFixed(1).replace('.', ',') + '°';
          thermoArc.style.strokeDashoffset = String(100 - 100 * eased);
          if (p < 1) requestAnimationFrame(stepT);
        };
        requestAnimationFrame(stepT);
      }, 1700);
    }
  }

  /* Statistiken hochzählen */
  var counters = document.querySelectorAll('[data-count]');
  if (counters.length && 'IntersectionObserver' in window && !reduceMotion) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        cio.unobserve(en.target);
        var el = en.target;
        var target = parseFloat(el.getAttribute('data-count'));
        var dec = parseInt(el.getAttribute('data-decimal') || '0', 10);
        var t0 = null;
        var step = function (t) {
          if (t0 === null) t0 = t;
          var p = Math.min(1, (t - t0) / 1500);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = (target * eased).toFixed(dec).replace('.', ',');
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    }, { threshold: 0.5 });
    counters.forEach(function (c) { cio.observe(c); });
  }

  /* Glut-Partikel im Hero */
  var canvas = document.getElementById('embers');
  if (canvas && canvas.getContext && !reduceMotion) {
    var ctx = canvas.getContext('2d');
    var W = 0, H = 0, parts = [];
    var resize = function () {
      W = canvas.width = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', resize);
    resize();
    var spawn = function (p, randomY) {
      p.x = Math.random() * W;
      p.y = randomY ? Math.random() * H : H + 20;
      p.r = 1 + Math.random() * 2.2;
      p.s = 0.3 + Math.random() * 0.8;
      p.a = 0.1 + Math.random() * 0.35;
      p.w = Math.random() * Math.PI * 2;
      return p;
    };
    var count = Math.max(18, Math.min(46, Math.floor(window.innerWidth / 32)));
    for (var i = 0; i < count; i++) parts.push(spawn({}, true));
    (function tick() {
      ctx.clearRect(0, 0, W, H);
      for (var j = 0; j < parts.length; j++) {
        var p = parts[j];
        p.y -= p.s;
        p.w += 0.02;
        p.x += Math.sin(p.w) * 0.3;
        if (p.y < -14) spawn(p, false);
        var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3);
        g.addColorStop(0, 'rgba(251,146,60,' + p.a.toFixed(3) + ')');
        g.addColorStop(1, 'rgba(251,146,60,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
        ctx.fill();
      }
      requestAnimationFrame(tick);
    })();
  }

  /* 3D-Tilt auf Karten (nur Maus-Geräte) */
  if (!reduceMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('.svc, .step, .quote').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var rx = ((e.clientY - r.top) / r.height - 0.5) * -6;
        var ry = ((e.clientX - r.left) / r.width - 0.5) * 6;
        el.style.transform = 'perspective(750px) translateY(-5px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg)';
      });
      el.addEventListener('mouseleave', function () { el.style.transform = ''; });
    });
  }

  /* Demo-Formular (ohne Backend) */
  var form = document.getElementById('contact-form');
  var ok = document.getElementById('form-ok');
  if (form && ok) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      ok.classList.add('show');
      form.reset();
      setTimeout(function () { ok.classList.remove('show'); }, 6000);
    });
  }

  /* Jahr im Footer */
  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
