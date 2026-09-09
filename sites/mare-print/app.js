/* =========================================================================
   MARE-Print.de — Interaktionen
   Vanilla JS, keine Abhängigkeiten. Alles progressiv: ohne JS bleibt die
   Seite vollständig lesbar und bedienbar.
   ========================================================================= */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------------- Preloader ---------------- */
  var pl = $('#preloader');
  if (pl) {
    var hide = function () {
      pl.classList.add('done');
      document.body.style.removeProperty('overflow');
      window.setTimeout(function () { pl.remove(); }, 800);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('load', function () { window.setTimeout(hide, reduce ? 0 : 620); });
    window.setTimeout(hide, 2600); // Sicherheitsnetz
  }

  /* ---------------- Navigation ---------------- */
  var nav = $('.nav');
  var ov  = $('#nav-overlay');
  var tog = $('.nav-toggle');

  if (nav) {
    var onScroll = function () { nav.classList.toggle('stuck', window.scrollY > 8); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  function setNav(open) {
    if (!ov) return;
    ov.classList.toggle('open', open);
    ov.setAttribute('aria-hidden', open ? 'false' : 'true');
    if (tog) tog.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.style.overflow = open ? 'hidden' : '';
  }
  if (tog) tog.addEventListener('click', function () { setNav(!ov.classList.contains('open')); });
  var ovClose = $('.ov-close');
  if (ovClose) ovClose.addEventListener('click', function () { setNav(false); });
  if (ov) $$('a', ov).forEach(function (a) { a.addEventListener('click', function () { setNav(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setNav(false); });

  /* ---------------- Scroll-Fortschritt ---------------- */
  var bar = $('.progress i');
  if (bar) {
    var tick = function () {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
    };
    tick();
    window.addEventListener('scroll', tick, { passive: true });
    window.addEventListener('resize', tick);
  }

  /* ---------------- Nach-oben-Button ---------------- */
  var up = $('.up');
  if (up) {
    window.addEventListener('scroll', function () {
      up.classList.toggle('show', window.scrollY > window.innerHeight * 0.9);
    }, { passive: true });
    up.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    });
  }

  /* ---------------- Reveal beim Scrollen ---------------- */
  var rv = $$('[data-rv]');
  if (rv.length) {
    if (!('IntersectionObserver' in window) || reduce) {
      rv.forEach(function (el) { el.classList.add('in'); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          var d = parseInt(en.target.getAttribute('data-rvd') || '0', 10);
          window.setTimeout(function () { en.target.classList.add('in'); }, d);
          io.unobserve(en.target);
        });
      }, { rootMargin: '0px 0px -9% 0px', threshold: 0.08 });
      rv.forEach(function (el) { io.observe(el); });
    }
  }

  /* ---------------- Zahlen hochzählen ---------------- */
  var counters = $$('[data-count]');
  if (counters.length && 'IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        cio.unobserve(el);
        var to = parseFloat(el.getAttribute('data-count'));
        if (reduce) { el.textContent = String(to); return; }
        var t0 = null, dur = 1500;
        var step = function (t) {
          if (t0 === null) t0 = t;
          var p = Math.min((t - t0) / dur, 1);
          var e = 1 - Math.pow(1 - p, 3);
          el.textContent = String(Math.round(to * e));
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  /* ---------------- Laufband klonen ---------------- */
  $$('.marquee').forEach(function (m) {
    var t = $('.mq-track', m);
    if (t && m.children.length === 1) m.appendChild(t.cloneNode(true));
  });

  /* ---------------- Hero: Rasterpunkte auf Canvas ---------------- */
  var cv = $('#dots');
  if (cv && !reduce) {
    var ctx = cv.getContext('2d');
    var pts = [], mx = -999, my = -999, raf = null, vis = true;

    function build() {
      var r = cv.parentElement.getBoundingClientRect();
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = Math.floor(r.width * dpr);
      cv.height = Math.floor(r.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      pts = [];
      var gap = r.width < 700 ? 30 : 24;
      for (var y = gap / 2; y < r.height; y += gap) {
        for (var x = gap / 2; x < r.width; x += gap) {
          pts.push({ x: x, y: y, p: Math.random() * Math.PI * 2 });
        }
      }
    }

    function draw(t) {
      raf = requestAnimationFrame(draw);
      if (!vis) return;
      ctx.clearRect(0, 0, cv.width, cv.height);
      var time = t / 1000;
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i];
        var dx = p.x - mx, dy = p.y - my;
        var d = Math.sqrt(dx * dx + dy * dy);
        var near = Math.max(0, 1 - d / 210);
        var wave = 0.5 + 0.5 * Math.sin(time * 0.6 + p.p + p.x * 0.006);
        var r = 0.5 + wave * 0.85 + near * 2.6;
        var a = 0.05 + wave * 0.07 + near * 0.5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fillStyle = near > 0.45
          ? 'rgba(0,169,224,' + a.toFixed(3) + ')'
          : 'rgba(255,255,255,' + a.toFixed(3) + ')';
        ctx.fill();
      }
    }

    build();
    raf = requestAnimationFrame(draw);
    window.addEventListener('resize', build);
    window.addEventListener('pointermove', function (e) {
      var r = cv.getBoundingClientRect();
      mx = e.clientX - r.left; my = e.clientY - r.top;
    }, { passive: true });
    window.addEventListener('pointerleave', function () { mx = my = -999; });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { vis = en[0].isIntersecting; })
        .observe(cv.parentElement);
    }
  }

  /* ---------------- Hero: Druckbogen-Rotation ---------------- */
  var jobs = $$('.job');
  if (jobs.length > 1 && !reduce) {
    var ji = 0;
    window.setInterval(function () {
      jobs[ji].classList.remove('on');
      ji = (ji + 1) % jobs.length;
      jobs[ji].classList.add('on');
    }, 5200);
  }

  /* ---------------- Material-Explorer ---------------- */
  var mxList = $('.mx-list');
  if (mxList) {
    var items  = $$('.mx-item', mxList);
    var panels = $$('.mx-panel');

    function select(id) {
      items.forEach(function (b) {
        b.setAttribute('aria-selected', b.getAttribute('data-target') === id ? 'true' : 'false');
      });
      panels.forEach(function (p) { p.classList.toggle('on', p.id === id); });
    }

    items.forEach(function (b) {
      b.addEventListener('click', function () {
        var id = b.getAttribute('data-target');
        select(id);
        if (history.replaceState) history.replaceState(null, '', '#' + id);
      });
    });

    $$('.chip').forEach(function (c) {
      c.addEventListener('click', function () {
        var f = c.getAttribute('data-filter');
        $$('.chip').forEach(function (o) { o.setAttribute('aria-pressed', o === c ? 'true' : 'false'); });
        var first = null;
        items.forEach(function (b) {
          var show = f === 'alle' || b.getAttribute('data-cat') === f || b.getAttribute('data-env') === f;
          b.classList.toggle('hide', !show);
          if (show && !first) first = b;
        });
        if (first && first.getAttribute('aria-selected') !== 'true') select(first.getAttribute('data-target'));
      });
    });

    // Direktlink per #anker
    var h = location.hash.replace('#', '');
    if (h && document.getElementById(h) && document.getElementById(h).classList.contains('mx-panel')) {
      select(h);
    } else if (items.length) {
      select(items[0].getAttribute('data-target'));
    }
  }

  /* ---------------- Format-Rechner ---------------- */
  var calc = $('#calc');
  if (calc) {
    var MAT = {
      frontlit:  { name: 'PVC-Frontlit 510',   gsm: 510, maxW: 320, oesen: true,  sw: 't-frontlit'  },
      mesh:      { name: 'Mesh 300',           gsm: 300, maxW: 320, oesen: true,  sw: 't-mesh'      },
      blockout:  { name: 'Blockout 610',       gsm: 610, maxW: 250, oesen: true,  sw: 't-blockout'  },
      fahne:     { name: 'Fahnenstoff 115',    gsm: 115, maxW: 300, oesen: false, sw: 't-fahne'     }
    };

    var iW = $('#c-w'), iH = $('#c-h'), rW = $('#c-wr'), rH = $('#c-hr');
    var oA = $('#o-area'), oO = $('#o-oesen'), oG = $('#o-weight'), oN = $('#o-naht');
    var banner = $('#viz-banner'), bannerTxt = $('#viz-txt'), person = $('#viz-person');
    var dimW = $('#dim-w'), dimH = $('#dim-h'), recList = $('#c-rec');
    var mat = 'frontlit';

    function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
    function nf(n, d) { return n.toLocaleString('de-DE', { minimumFractionDigits: d, maximumFractionDigits: d }); }

    function oesenCount(w, h) {
      var per = function (len) { return Math.max(2, Math.floor(len / 50) + 1); };
      return 2 * per(w) + 2 * per(h) - 4;
    }

    function render() {
      var w = clamp(parseInt(iW.value, 10) || 100, 20, 1200);
      var h = clamp(parseInt(iH.value, 10) || 100, 20, 1200);
      var m = MAT[mat];

      var area = (w / 100) * (h / 100);
      var kg   = area * m.gsm / 1000;
      var nMin = Math.min(w, h);
      var nahte = Math.max(0, Math.ceil(nMin / m.maxW) - 1);

      oA.innerHTML = nf(area, 2) + ' <small>m²</small>';
      oG.innerHTML = nf(kg, kg < 10 ? 2 : 1) + ' <small>kg</small>';
      oO.innerHTML = m.oesen ? oesenCount(w, h) + ' <small>Stk.</small>' : '<small>Saum umlaufend</small>';
      oN.innerHTML = nahte === 0 ? 'ohne Naht' : nahte + ' <small>Naht' + (nahte > 1 ? 'e' : '') + '</small>';

      // Maßstabsgetreue Vorschau: 1,80-m-Silhouette als Referenz
      var stageH = 240, stageW = Math.min(calc.querySelector('.calc-viz').clientWidth - 90, 460);
      var mPerPx = Math.max((h / 100) / stageH, (w / 100) / stageW, 1.9 / stageH);
      var pxW = (w / 100) / mPerPx, pxH = (h / 100) / mPerPx;
      banner.style.width  = Math.max(14, pxW) + 'px';
      banner.style.height = Math.max(10, pxH) + 'px';
      person.style.height = (1.8 / mPerPx) + 'px';
      bannerTxt.style.display = (pxW > 120 && pxH > 34) ? '' : 'none';
      dimW.textContent = nf(w / 100, 2) + ' m';
      dimH.textContent = nf(h / 100, 2) + ' m';

      // Ösen visualisieren (max. 40, damit es ruhig bleibt)
      $$('.viz-oese', banner).forEach(function (e) { e.remove(); });
      if (m.oesen && pxW > 40 && pxH > 26) {
        var cw = Math.min(Math.max(2, Math.floor(w / 50) + 1), 12);
        var ch = Math.min(Math.max(2, Math.floor(h / 50) + 1), 10);
        for (var i = 0; i < cw; i++) {
          for (var j = 0; j < ch; j++) {
            if (i !== 0 && i !== cw - 1 && j !== 0 && j !== ch - 1) continue;
            var d = document.createElement('i');
            d.className = 'viz-oese';
            d.style.left = 'calc(' + (i / (cw - 1)) * 100 + '% - 3.5px)';
            d.style.top  = 'calc(' + (j / (ch - 1)) * 100 + '% - 3.5px)';
            d.style.margin = '4px';
            banner.appendChild(d);
          }
        }
      }

      // Materialempfehlung nach Fläche, Format und gewähltem Material
      var pool = [
        { k:'mesh',     sw:'t-mesh',     t:'Mesh 300 – geringere Windlast',      s: area >= 6 ? 10 : area >= 3 ? 5 : 1 },
        { k:'frontlit', sw:'t-frontlit', t:'Frontlit 510 – robuster Klassiker',  s: 6 },
        { k:'fahne',    sw:'t-fahne',    t:'Fahnenstoff – leicht und faltbar',   s: area < 4 ? 8 : 3 },
        { k:'blockout', sw:'t-blockout', t:'Blockout – beidseitig bedruckbar',   s: (h > w ? 7 : 4) },
        { k:'hohl',     sw:'t-hohlkammer', t:'Hohlkammerplatte – formstabil',    s: area <= 2 ? 7 : 0 },
        { k:'dibond',   sw:'t-dibond',   t:'Alu-Verbund – dauerhaft und wertig', s: area <= 1.5 ? 6 : 0 }
      ].filter(function (r) { return r.k !== mat && r.s > 0; })
       .sort(function (a, b) { return b.s - a.s; });

      recList.innerHTML = pool.slice(0, 3).map(function (r) {
        return '<span><i class="' + r.sw + '"></i>' + r.t + '</span>';
      }).join('');
    }

    function sync(src, dst) { dst.value = src.value; render(); }
    iW.addEventListener('input', function () { sync(iW, rW); });
    iH.addEventListener('input', function () { sync(iH, rH); });
    rW.addEventListener('input', function () { sync(rW, iW); });
    rH.addEventListener('input', function () { sync(rH, iH); });

    $$('.preset').forEach(function (p) {
      p.addEventListener('click', function () {
        iW.value = rW.value = p.getAttribute('data-w');
        iH.value = rH.value = p.getAttribute('data-h');
        render();
      });
    });

    $$('.calc-mat button').forEach(function (b) {
      b.addEventListener('click', function () {
        mat = b.getAttribute('data-mat');
        $$('.calc-mat button').forEach(function (o) {
          o.setAttribute('aria-pressed', o === b ? 'true' : 'false');
        });
        render();
      });
    });

    window.addEventListener('resize', render);
    render();
  }

  /* ---------------- Kontaktformular ---------------- */
  var form = $('#anfrage');
  if (form) {
    var mailTo = form.getAttribute('data-mail') || '';
    form.setAttribute('novalidate', '');

    function fieldOf(el) { return el.closest('.field'); }

    function check(el) {
      var ok = el.checkValidity();
      var f = fieldOf(el);
      if (f) f.classList.toggle('invalid', !ok);
      return ok;
    }

    $$('input,select,textarea', form).forEach(function (el) {
      el.addEventListener('blur', function () { if (el.value) check(el); });
      el.addEventListener('input', function () {
        var f = fieldOf(el);
        if (f && f.classList.contains('invalid')) check(el);
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var valid = true, firstBad = null;
      $$('input,select,textarea', form).forEach(function (el) {
        if (el.type === 'checkbox' ? !el.checkValidity() : !check(el)) {
          valid = false;
          if (!firstBad) firstBad = el;
        }
      });
      if (!valid) { if (firstBad) firstBad.focus(); return; }

      var d = new FormData(form);
      var lines = [];
      [['Firma', 'firma'], ['Name', 'name'], ['E-Mail', 'email'], ['Telefon', 'telefon'],
       ['Produkt', 'produkt'], ['Format', 'format'], ['Menge', 'menge']].forEach(function (p) {
        if (d.get(p[1])) lines.push(p[0] + ': ' + d.get(p[1]));
      });
      lines.push('', String(d.get('nachricht') || ''));

      var subject = 'Anfrage Großformatdruck' + (d.get('produkt') ? ' – ' + d.get('produkt') : '');
      var href = 'mailto:' + mailTo +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(lines.join('\n'));

      var ok = $('.form-ok', form.parentElement) || $('.form-ok');
      if (ok) {
        ok.classList.add('show');
        ok.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
      }
      window.location.href = href;
    });
  }

  /* ---------------- Aktiven Menüpunkt markieren ---------------- */
  var here = location.pathname.split('/').pop() || 'index.html';
  $$('.nav-links a').forEach(function (a) {
    if (a.getAttribute('href') === here) a.classList.add('active');
  });
})();
