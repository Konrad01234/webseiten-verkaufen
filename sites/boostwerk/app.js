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
     Parallax: Hero-Foto und die Foto-Bänder wandern langsamer als der Rest
     --------------------------------------------------------------------- */
  (function parallax() {
    if (reduced) return;

    var hero  = $(".hero-media img");
    var bands = $$(".band img");
    if (!hero && !bands.length) return;

    var ticking = false;

    function move() {
      var vh = window.innerHeight;

      if (hero) {
        var y = window.scrollY;
        if (y < vh * 1.3) hero.style.translate = "0 " + (y * 0.22) + "px";
      }

      bands.forEach(function (img) {
        var r = img.parentElement.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) return;
        // -1 … +1, je nachdem wo das Band im Fenster steht
        var p = (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2);
        img.style.translate = "0 " + (p * -6) + "%";
      });

      ticking = false;
    }

    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(move); }
    }, { passive: true });
    window.addEventListener("resize", move, { passive: true });
    move();
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
     Zwei-Klick-Karte
     Der OpenStreetMap-iframe steht nicht im HTML, sondern wird erst nach
     einem Klick eingesetzt. Vorher geht keine IP-Adresse an OSM.
     Die Zustimmung wird lokal gemerkt, damit sie nicht jedes Mal nötig ist.
     --------------------------------------------------------------------- */
  (function mapConsent() {
    var boxes = $$("[data-map]");
    if (!boxes.length) return;

    var KEY = "bw-map-ok";
    function stored() { try { return localStorage.getItem(KEY) === "1"; } catch (e) { return false; } }
    function remember() { try { localStorage.setItem(KEY, "1"); } catch (e) {} }

    function load(box) {
      var src = box.getAttribute("data-map-src");
      if (!src) return;
      var frame = document.createElement("iframe");
      frame.title = "Karte: Boostwerk Köln, Pauline-Christmann-Straße 5, 51107 Köln";
      frame.loading = "lazy";
      frame.referrerPolicy = "no-referrer-when-downgrade";
      frame.src = src;
      box.classList.remove("map-consent");
      box.innerHTML = "";
      box.appendChild(frame);
    }

    boxes.forEach(function (box) {
      if (stored()) { load(box); return; }
      var btn = $("[data-map-load]", box);
      if (btn) btn.addEventListener("click", function () {
        remember();
        boxes.forEach(load);          // auf der Seite ggf. mehrere Karten
      });
    });
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

  /* =====================================================================
     KONTAKTFORMULAR
     =====================================================================

     ⚙️  HIER EINTRAGEN – zwei Werte, dann läuft der echte Versand:

         FORM_ENDPOINT  URL des Formular-Dienstes (EU-Anbieter wählen,
                        siehe README). Solange leer, fällt das Formular
                        automatisch auf mailto zurück.
         KONTAKT_MAIL   echte E-Mail-Adresse der Werkstatt. Wird für den
                        mailto-Rückfall und als Notfall-Link gebraucht.

     Der Versand läuft ohne Seitenneuladen; der Besucher bleibt im Formular
     und bekommt direkt eine Rückmeldung.
     ===================================================================== */
  var FORM_ENDPOINT = "";                              // z. B. "https://…/f/abc123"
  var KONTAKT_MAIL  = "info@boostwerk-koeln.de";       // ⚠️ PLATZHALTER, bitte ersetzen

  (function form() {
    var f = $("#form");
    if (!f) return;

    var status = $("#form-status");
    var submit = $('button[type="submit"]', f);
    var labelOriginal = submit ? submit.innerHTML : "";

    function val(id) { var el = $(id); return el ? el.value.trim() : ""; }

    function say(kind, html) {
      if (!status) return;
      status.className = "form-status " + kind;
      status.innerHTML = html;
      status.hidden = false;
      status.scrollIntoView({ block: "nearest", behavior: reduced ? "auto" : "smooth" });
    }

    function busy(on) {
      if (!submit) return;
      submit.disabled = on;
      submit.style.opacity = on ? ".65" : "";
      submit.innerHTML = on ? "Wird gesendet …" : labelOriginal;
    }

    /* --- eigene Pflichtfeldprüfung, damit die Meldungen zum Design passen --- */
    function check() {
      var ok = true;
      [["#f-name", "Bitte trag deinen Namen ein."],
       ["#f-tel",  "Ohne Telefonnummer können wir dich nicht zurückrufen."]
      ].forEach(function (pair) {
        var el = $(pair[0]);
        if (!el) return;
        var box = el.closest(".field");
        var old = $(".field-error", box);
        if (old) old.remove();
        box.classList.remove("invalid");

        if (!el.value.trim()) {
          box.classList.add("invalid");
          var m = document.createElement("span");
          m.className = "field-error";
          m.textContent = pair[1];
          box.appendChild(m);
          if (ok) el.focus();
          ok = false;
        }
      });

      var mail = $("#f-mail");
      if (mail && mail.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(mail.value.trim())) {
        var mbox = mail.closest(".field");
        mbox.classList.add("invalid");
        var me = document.createElement("span");
        me.className = "field-error";
        me.textContent = "Diese E-Mail-Adresse sieht nicht richtig aus.";
        mbox.appendChild(me);
        ok = false;
      }
      return ok;
    }

    function daten() {
      return {
        name:     val("#f-name"),
        telefon:  val("#f-tel"),
        email:    val("#f-mail"),
        fahrzeug: val("#f-car"),
        leistung: val("#f-service"),
        nachricht: val("#f-msg"),
        _subject: "Terminanfrage über die Website – " + val("#f-service")
      };
    }

    function alsText(d) {
      return [
        "Name: " + d.name,
        "Telefon: " + d.telefon,
        "E-Mail: " + d.email,
        "Fahrzeug: " + d.fahrzeug,
        "Leistung: " + d.leistung,
        "", "Nachricht:", d.nachricht
      ].join("\n");
    }

    /* --- Rückfall ohne Endpunkt: vorausgefüllte E-Mail öffnen --- */
    function perMailProgramm(d) {
      window.location.href = "mailto:" + KONTAKT_MAIL +
        "?subject=" + encodeURIComponent(d._subject) +
        "&body="    + encodeURIComponent(alsText(d));
      say("ok",
        "<strong>Fast geschafft.</strong> Dein E-Mail-Programm sollte sich mit der " +
        "fertigen Nachricht geöffnet haben – bitte dort noch auf Senden klicken. " +
        "Passiert nichts? Ruf uns einfach an: " +
        '<a href="tel:+4917686664346">0176 866 643 46</a>');
    }

    f.addEventListener("submit", function (e) {
      e.preventDefault();

      // Bots füllen das versteckte Feld aus – dann tun wir nur so, als ob
      var hp = $("#f-website");
      if (hp && hp.value) { say("ok", "Danke für deine Anfrage."); f.reset(); return; }

      if (!check()) return;
      var d = daten();

      if (!FORM_ENDPOINT) { perMailProgramm(d); return; }

      busy(true);
      fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(d)
      })
        .then(function (r) {
          if (!r.ok) throw new Error("HTTP " + r.status);
          f.reset();
          say("ok",
            "<strong>Danke, deine Anfrage ist da.</strong> Wir melden uns zurück – " +
            "in der Regel noch am selben Werktag.");
        })
        .catch(function () {
          say("err",
            "<strong>Das hat leider nicht geklappt.</strong> Bitte ruf uns kurz an: " +
            '<a href="tel:+4917686664346">0176 866 643 46</a> – oder schick uns eine ' +
            'E-Mail an <a href="mailto:' + KONTAKT_MAIL + '">' + KONTAKT_MAIL + "</a>.");
        })
        .then(function () { busy(false); });
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
