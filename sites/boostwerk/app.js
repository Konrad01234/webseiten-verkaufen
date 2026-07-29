/* =========================================================================
   Boostwerk Köln – Interaktion & Animationen
   Vanilla JS, kein Build-Schritt, keine Abhängigkeiten.
   ========================================================================= */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------------------------------------------------------------------
     Preloader – füllt den Balken und gibt den Hero-Einlauf frei.
     Läuft nur auf der Startseite; die Unterseiten starten direkt.
     --------------------------------------------------------------------- */
  (function preloader() {
    var box  = $("#preloader");
    var fill = $(".pl-fill");
    var hero = $(".hero");

    if (!box) {                       // Unterseite: Hero sofort freigeben
      if (hero) hero.classList.add("ready");
      return;
    }

    var pct = 0;
    var timer = setInterval(function () {
      pct = Math.min(100, pct + 8 + Math.random() * 16);
      if (fill) fill.style.width = pct + "%";
      if (pct >= 100) clearInterval(timer);
    }, 95);

    function finish() {
      if (fill) fill.style.width = "100%";
      setTimeout(function () {
        box.classList.add("done");
        if (hero) hero.classList.add("ready");
      }, reduced ? 0 : 380);
    }

    if (document.readyState === "complete") setTimeout(finish, reduced ? 0 : 480);
    else window.addEventListener("load", function () { setTimeout(finish, reduced ? 0 : 480); });
    // Notbremse, falls ein Bild hängt
    setTimeout(finish, 4200);
  })();

  /* ---------------------------------------------------------------------
     Scroll-Fortschritt, Navbar-Verkleinerung, Zurück-nach-oben
     --------------------------------------------------------------------- */
  (function scrollUi() {
    var bar   = $("#scroll-progress");
    var nav   = $("#nav");
    var toTop = $("#totop");
    var ticking = false;

    function update() {
      var y   = window.scrollY || document.documentElement.scrollTop;
      var max = document.documentElement.scrollHeight - window.innerHeight;
      if (bar) bar.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";
      if (nav) nav.classList.toggle("scrolled", y > 40);
      if (toTop) toTop.classList.toggle("show", y > 700);
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();

    if (toTop) toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
    });
  })();

  /* ---------------------------------------------------------------------
     Mobiles Vollbild-Menü
     --------------------------------------------------------------------- */
  (function menu() {
    var burger  = $("#burger");
    var overlay = $("#nav-overlay");
    if (!burger || !overlay) return;

    function setOpen(open) {
      overlay.classList.toggle("open", open);
      burger.classList.toggle("open", open);
      burger.setAttribute("aria-expanded", String(open));
      overlay.setAttribute("aria-hidden", String(!open));
      burger.setAttribute("aria-label", open ? "Menü schließen" : "Menü öffnen");
      document.body.style.overflow = open ? "hidden" : "";
    }

    burger.addEventListener("click", function () { setOpen(!overlay.classList.contains("open")); });
    $$("a", overlay).forEach(function (a) { a.addEventListener("click", function () { setOpen(false); }); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setOpen(false); });
  })();

  /* ---------------------------------------------------------------------
     Reveal beim Scrollen (gestaffelt über data-delay)
     --------------------------------------------------------------------- */
  (function reveals() {
    var items = $$("[data-reveal]");
    if (!items.length) return;

    if (reduced || !("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) { io.observe(el); });
  })();

  /* ---------------------------------------------------------------------
     Ablauf-Linie und Hebebühne beim Sichtbarwerden starten
     --------------------------------------------------------------------- */
  (function onceInView() {
    var targets = [$("#steps"), $("#lift")].filter(Boolean);
    if (!targets.length) return;

    if (reduced || !("IntersectionObserver" in window)) {
      targets.forEach(function (t) { t.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.35 });
    targets.forEach(function (t) { io.observe(t); });
  })();

  /* ---------------------------------------------------------------------
     Zähler, die hochlaufen (5,0 / 44 / 24)
     --------------------------------------------------------------------- */
  (function counters() {
    var els = $$(".count");
    if (!els.length) return;

    function run(el) {
      var to  = parseFloat(el.getAttribute("data-to")) || 0;
      var dec = parseInt(el.getAttribute("data-dec"), 10) || 0;
      var dur = 1500;
      var t0  = null;

      function fmt(v) { return v.toFixed(dec).replace(".", ","); }
      if (reduced) { el.textContent = fmt(to); return; }

      function frame(ts) {
        if (t0 === null) t0 = ts;
        var p = Math.min(1, (ts - t0) / dur);
        var eased = 1 - Math.pow(1 - p, 3);          // easeOutCubic
        el.textContent = fmt(to * eased);
        if (p < 1) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    }

    if (!("IntersectionObserver" in window)) { els.forEach(run); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { run(e.target); io.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    els.forEach(function (el) { io.observe(el); });
  })();

  /* ---------------------------------------------------------------------
     Hero-Parallax: Foto wandert langsamer als der Rest
     --------------------------------------------------------------------- */
  (function parallax() {
    var img = $(".hero-media img");
    if (!img || reduced) return;
    var ticking = false;

    function move() {
      var y = window.scrollY;
      if (y < window.innerHeight * 1.3) img.style.translate = "0 " + (y * 0.22) + "px";
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(move); }
    }, { passive: true });
  })();

  /* ---------------------------------------------------------------------
     Leistungskarten: Lichtschein folgt der Maus + leichter 3D-Tilt
     --------------------------------------------------------------------- */
  (function tilt() {
    if (reduced || window.matchMedia("(hover: none)").matches) return;

    $$(".tilt").forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        var x = e.clientX - r.left;
        var y = e.clientY - r.top;
        card.style.setProperty("--mx", x + "px");
        card.style.setProperty("--my", y + "px");
        var rx = ((y / r.height) - 0.5) * -5;
        var ry = ((x / r.width) - 0.5) * 5;
        card.style.transform = "translateY(-7px) perspective(900px) rotateX(" + rx + "deg) rotateY(" + ry + "deg)";
      });
      card.addEventListener("mouseleave", function () { card.style.transform = ""; });
    });
  })();

  /* ---------------------------------------------------------------------
     Marken-Laufband (Inhalt doppelt = nahtlose Schleife)
     --------------------------------------------------------------------- */
  (function marquee() {
    var track = $("#mq");
    if (!track) return;
    var brands = ["VW", "Audi", "BMW", "Mercedes-Benz", "Opel", "Ford", "Škoda", "Seat",
                  "Renault", "Peugeot", "Citroën", "Toyota", "Mazda", "Hyundai", "Kia",
                  "Nissan", "Fiat", "Volvo", "Mini", "Smart", "Dacia"];
    var html = brands.map(function (b) { return "<span>" + b + "</span>"; }).join("");
    track.innerHTML = html + html;   // zweimal, damit -50% sauber loopt
  })();

  /* ---------------------------------------------------------------------
     REZENSIONS-WASSERFALL
     Drei Spalten, unterschiedlich schnell, jede Spalte doppelt befüllt,
     damit die CSS-Schleife (-50%) nahtlos läuft.
     --------------------------------------------------------------------- */
  (function waterfall() {
    var wf = $("#waterfall");
    if (!wf || typeof REVIEWS === "undefined" || !REVIEWS.length) return;

    var cols = [$(".c1", wf), $(".c2", wf), $(".c3", wf)].filter(Boolean);

    function esc(s) {
      return String(s).replace(/[&<>"']/g, function (c) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
      });
    }

    function initials(name) {
      return name.trim().split(/\s+/).slice(0, 2)
        .map(function (p) { return p.charAt(0).toUpperCase(); }).join("");
    }

    function starRow(n) {
      var out = "";
      for (var i = 0; i < n; i++) out += '<svg><use href="#i-star"/></svg>';
      return '<span class="stars" aria-hidden="true">' + out + "</span>";
    }

    function cardHtml(r) {
      return '<article class="rev">' +
               '<div class="rev-head">' +
                 '<span class="rev-av" aria-hidden="true">' + esc(initials(r.name)) + "</span>" +
                 "<div><div class='rev-name'>" + esc(r.name) + "</div>" +
                 "<div class='rev-when'>" + esc(r.when || "") + "</div></div>" +
               "</div>" +
               starRow(r.stars || 5) +
               "<p>" + esc(r.text) + "</p>" +
               '<div class="rev-src"><svg><use href="#i-google"/></svg> Google-Rezension</div>' +
             "</article>";
    }

    // Rezensionen reihum auf die Spalten verteilen
    var buckets = cols.map(function () { return []; });
    REVIEWS.forEach(function (r, i) { buckets[i % cols.length].push(r); });

    cols.forEach(function (col, i) {
      var html = buckets[i].map(cardHtml).join("");
      col.innerHTML = html + html;              // verdoppeln für die Endlosschleife
    });

    // Warnhinweis nur, solange irgendwo `platzhalter: true` steht
    var notice = $("#rev-notice");
    if (notice && REVIEWS.some(function (r) { return r.platzhalter; })) notice.hidden = false;

    // Link auf das Google-Profil
    var link = $("#all-reviews");
    if (link && typeof GOOGLE_RATING !== "undefined" && GOOGLE_RATING.url) link.href = GOOGLE_RATING.url;
  })();

  /* ---------------------------------------------------------------------
     Öffnungszeiten: heutigen Tag hervorheben
     --------------------------------------------------------------------- */
  (function today() {
    var table = $("#hours");
    if (!table) return;
    var d = new Date().getDay();               // 0 = Sonntag
    var row = $('tr[data-day="' + d + '"]', table);
    if (row) row.classList.add("today");
  })();

  /* ---------------------------------------------------------------------
     Kontaktformular → vorausgefüllte E-Mail (kein Backend nötig)
     --------------------------------------------------------------------- */
  (function form() {
    var f = $("#form");
    if (!f) return;

    f.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!f.reportValidity()) return;

      var v = function (id) { var el = $(id); return el ? el.value.trim() : ""; };
      var body = [
        "Name: "      + v("#f-name"),
        "Telefon: "   + v("#f-tel"),
        "E-Mail: "    + v("#f-mail"),
        "Fahrzeug: "  + v("#f-car"),
        "Leistung: "  + v("#f-service"),
        "",
        "Nachricht:",
        v("#f-msg")
      ].join("\n");

      // ⚠️ PLATZHALTER – diese Adresse ist geraten und muss durch die echte
      //    E-Mail-Adresse der Werkstatt ersetzt werden, sonst gehen Anfragen ins Leere.
      var to = "info@boostwerk-koeln.de";
      window.location.href = "mailto:" + to +
        "?subject=" + encodeURIComponent("Terminanfrage – " + v("#f-service")) +
        "&body="    + encodeURIComponent(body);
    });
  })();

  /* ---------------------------------------------------------------------
     Cookie-Hinweis
     --------------------------------------------------------------------- */
  (function cookie() {
    var box = $("#cookie");
    var ok  = $("#cookie-ok");
    var re  = $("#cookie-reopen");
    if (!box) return;

    var KEY = "bw-cookie-ok";
    function stored() { try { return localStorage.getItem(KEY); } catch (e) { return "1"; } }
    function save()   { try { localStorage.setItem(KEY, "1"); } catch (e) {} }

    if (!stored()) setTimeout(function () { box.classList.add("show"); }, 1400);
    if (ok) ok.addEventListener("click", function () { box.classList.remove("show"); save(); });
    if (re) re.addEventListener("click", function (e) { e.preventDefault(); box.classList.add("show"); });
  })();

  /* ---------------------------------------------------------------------
     Häufige Fragen: immer nur eine Antwort offen halten
     --------------------------------------------------------------------- */
  (function faq() {
    var items = $$(".faq details");
    if (items.length < 2) return;

    items.forEach(function (d) {
      d.addEventListener("toggle", function () {
        if (!d.open) return;
        items.forEach(function (other) { if (other !== d) other.open = false; });
      });
    });
  })();

  /* ---------------------------------------------------------------------
     Jahreszahl im Footer
     --------------------------------------------------------------------- */
  (function year() {
    var y = $("#year");
    if (y) y.textContent = new Date().getFullYear();
  })();

})();
