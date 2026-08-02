/* =========================================================================
   AC Caspari – Interaktion & Animationen
   Vanilla JS, kein Build-Schritt, keine Abhängigkeiten.
   Jeder Block prüft selbst, ob sein Element auf der Seite existiert –
   deshalb kann diese eine Datei auf allen Seiten eingebunden werden.
   ========================================================================= */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------------------------------------------------------------------
     Hero freigeben – startet den gestaffelten Einlauf der Startseite.
     --------------------------------------------------------------------- */
  (function heroReady() {
    var hero = $(".hero");
    if (!hero) return;
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { hero.classList.add("ready"); });
    });
  })();

  /* ---------------------------------------------------------------------
     Seitenübergang
     Interne Links blenden die Seite weich aus, bevor sie navigieren.
     Alles, was kein normaler Seitenwechsel ist (neuer Tab, Anker, Telefon,
     Download, Fremdlink), bleibt unangetastet.
     --------------------------------------------------------------------- */
  (function pageTransition() {
    if (reduced) return;

    document.addEventListener("click", function (e) {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      var a = e.target.closest ? e.target.closest("a") : null;
      if (!a) return;

      var href = a.getAttribute("href");
      if (!href || href.charAt(0) === "#") return;
      if (a.target && a.target !== "_self") return;
      if (a.hasAttribute("download")) return;
      if (a.origin !== window.location.origin) return;          // auch tel:/mailto:
      if (a.pathname === window.location.pathname && a.search === window.location.search) return;

      e.preventDefault();
      document.body.classList.add("leaving");
      setTimeout(function () { window.location.href = a.href; }, 280);
    });

    // Zurück-Taste: der Browser zeigt die Seite aus dem Cache – Klasse lösen,
    // sonst bleibt sie unsichtbar.
    window.addEventListener("pageshow", function (e) {
      if (e.persisted) document.body.classList.remove("leaving");
    });
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
      if (bar)   bar.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";
      if (nav)   nav.classList.toggle("scrolled", y > 40);
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
    }, { threshold: .12, rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) { io.observe(el); });
  })();

  /* ---------------------------------------------------------------------
     Blöcke, die genau einmal starten, sobald sie im Bild sind:
     die wachsende Ablauf-Linie und der gezeichnete Fahrzeug-Check.
     --------------------------------------------------------------------- */
  (function onceInView() {
    var targets = $$("[data-once]");
    if (!targets.length) return;

    if (reduced || !("IntersectionObserver" in window)) {
      targets.forEach(function (t) { t.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: .3 });
    targets.forEach(function (t) { io.observe(t); });
  })();

  /* ---------------------------------------------------------------------
     Zähler, die hochlaufen
     --------------------------------------------------------------------- */
  (function counters() {
    var els = $$(".count");
    if (!els.length) return;

    function run(el) {
      var to  = parseFloat(el.getAttribute("data-to")) || 0;
      var dec = parseInt(el.getAttribute("data-dec"), 10) || 0;
      var suf = el.getAttribute("data-suffix") || "";
      var dur = 1500;
      var t0  = null;

      function fmt(v) { return v.toFixed(dec).replace(".", ",") + suf; }
      if (reduced) { el.textContent = fmt(to); return; }

      function frame(ts) {
        if (t0 === null) t0 = ts;
        var p = Math.min(1, (ts - t0) / dur);
        var eased = 1 - Math.pow(1 - p, 3);            // easeOutCubic
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
    }, { threshold: .6 });
    els.forEach(function (el) { io.observe(el); });
  })();

  /* ---------------------------------------------------------------------
     Parallax für die breiten Foto-Bänder – das Bild wandert langsamer
     als der Rest der Seite.
     --------------------------------------------------------------------- */
  (function parallax() {
    if (reduced) return;
    var bands = $$(".band img");
    if (!bands.length) return;

    var ticking = false;
    function move() {
      var vh = window.innerHeight;
      bands.forEach(function (img) {
        var r = img.parentElement.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) return;
        var p = (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2);   // -1 … +1
        img.style.translate = "0 " + (p * -5) + "%";
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
     Marken-Laufband (Inhalt doppelt = nahtlose Schleife)
     --------------------------------------------------------------------- */
  (function marquee() {
    var track = $("#mq");
    if (!track) return;
    var marken = ["VW", "Audi", "BMW", "Mercedes-Benz", "Opel", "Ford", "Škoda", "Seat",
                  "Renault", "Peugeot", "Citroën", "Toyota", "Mazda", "Hyundai", "Kia",
                  "Nissan", "Fiat", "Volvo", "Mini", "Smart", "Dacia", "Suzuki"];
    var html = marken.map(function (m) { return "<span>" + m + "</span>"; }).join("");
    track.innerHTML = html + html;      // zweimal, damit -50 % sauber loopt
  })();

  /* ---------------------------------------------------------------------
     REZENSIONS-WASSERFALL
     Drei Spalten, unterschiedlich schnell, die mittlere gegenläufig.
     Jede Spalte wird doppelt befüllt, damit die CSS-Schleife (-50 %)
     nahtlos läuft. Bei Hover hält alles an.
     --------------------------------------------------------------------- */
  (function waterfall() {
    var wf = $("#waterfall");
    if (!wf || typeof REVIEWS === "undefined" || !REVIEWS.length) return;

    var cols = [$(".c1", wf), $(".c2", wf), $(".c3", wf)].filter(Boolean);
    if (!cols.length) return;

    function esc(s) {
      return String(s).replace(/[&<>"']/g, function (c) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
      });
    }

    function initialen(name) {
      return name.trim().split(/\s+/).slice(0, 2)
        .map(function (t) { return t.charAt(0).toUpperCase(); }).join("");
    }

    function sterne(n) {
      var out = "";
      for (var i = 0; i < n; i++) out += '<svg><use href="#i-star"/></svg>';
      return '<span class="stars" aria-hidden="true">' + out + "</span>";
    }

    function karte(r) {
      return '<article class="rev">' +
               '<div class="rev-head">' +
                 '<span class="rev-av" aria-hidden="true">' + esc(initialen(r.name)) + "</span>" +
                 '<div><div class="rev-name">' + esc(r.name) + "</div>" +
                 '<div class="rev-when">' + esc(r.when || "") + "</div></div>" +
               "</div>" +
               sterne(r.stars || 5) +
               '<p>' + esc(r.text) + "</p>" +
               '<div class="rev-src"><svg><use href="#i-google"/></svg> Google-Rezension</div>' +
             "</article>";
    }

    // Rezensionen reihum auf die Spalten verteilen
    var eimer = cols.map(function () { return []; });
    REVIEWS.forEach(function (r, i) { eimer[i % cols.length].push(r); });

    cols.forEach(function (col, i) {
      var html = eimer[i].map(karte).join("");
      col.innerHTML = html + html;              // verdoppeln für die Endlosschleife
    });

    // Warnhinweis nur, solange irgendwo `platzhalter: true` steht
    var hinweis = $("#rev-notice");
    if (hinweis && REVIEWS.some(function (r) { return r.platzhalter; })) hinweis.hidden = false;

    // Gesamtnote: nur einblenden, wenn sie bestätigt ist. Solange
    // `unbestaetigt: true` in reviews.js steht, bleibt der Kasten leer –
    // lieber gar keine Zahl als eine erfundene.
    if (typeof GOOGLE_RATING !== "undefined") {
      $$("[data-rating-url]").forEach(function (a) {
        if (GOOGLE_RATING.url) a.href = GOOGLE_RATING.url;
      });

      var box  = $("#rev-score");
      var todo = $("#rev-score-todo");
      var echt = !GOOGLE_RATING.unbestaetigt &&
                 GOOGLE_RATING.score != null && GOOGLE_RATING.count != null;

      if (echt) {
        var wert = $("#rs-score");
        if (wert) wert.setAttribute("data-to", String(GOOGLE_RATING.score));
        var anz = $("#rs-count");
        if (anz) anz.textContent = String(GOOGLE_RATING.count);
        if (box)  box.hidden = false;
        if (todo) todo.hidden = true;
      } else {
        if (box)  box.hidden = true;
        if (todo) todo.hidden = false;
      }
    }
  })();

  /* ---------------------------------------------------------------------
     Zwei-Klick-Karte
     Der OpenStreetMap-iframe steht nicht im HTML, sondern wird erst nach
     einem Klick eingesetzt. Vorher verlässt keine IP-Adresse den Browser.
     Die Zustimmung wird lokal gemerkt, damit sie nicht jedes Mal nötig ist.
     --------------------------------------------------------------------- */
  (function mapConsent() {
    var boxen = $$("[data-map]");
    if (!boxen.length) return;

    var KEY = "acc-map-ok";
    function gemerkt() { try { return localStorage.getItem(KEY) === "1"; } catch (e) { return false; } }
    function merken()  { try { localStorage.setItem(KEY, "1"); } catch (e) {} }

    function laden(box) {
      var src = box.getAttribute("data-map-src");
      if (!src) return;
      var frame = document.createElement("iframe");
      frame.title = "Karte: AC Caspari, Alter Uentroper Weg 189, 59071 Hamm";
      frame.loading = "lazy";
      frame.referrerPolicy = "no-referrer-when-downgrade";
      frame.src = src;
      box.classList.remove("map-consent");
      box.innerHTML = "";
      box.appendChild(frame);
    }

    boxen.forEach(function (box) {
      if (gemerkt()) { laden(box); return; }
      var btn = $("[data-map-load]", box);
      if (btn) btn.addEventListener("click", function () {
        merken();
        boxen.forEach(laden);          // auf der Seite ggf. mehrere Karten
      });
    });
  })();

  /* ---------------------------------------------------------------------
     Öffnungszeiten: heutigen Tag hervorheben
     --------------------------------------------------------------------- */
  (function heute() {
    var tabellen = $$(".hours");
    if (!tabellen.length) return;
    var d = new Date().getDay();               // 0 = Sonntag
    tabellen.forEach(function (t) {
      var row = $('tr[data-day="' + d + '"]', t);
      if (row) row.classList.add("today");
    });
  })();

  /* =====================================================================
     KONTAKTFORMULAR

     ⚙️  HIER EINTRAGEN – zwei Werte, dann läuft der echte Versand:

         FORM_ENDPOINT  URL des Formular-Dienstes (EU-Anbieter wählen,
                        siehe README). Solange leer, fällt das Formular
                        automatisch auf mailto zurück.
         KONTAKT_MAIL   echte E-Mail-Adresse der Werkstatt. Wird für den
                        mailto-Rückfall und als Notfall-Link gebraucht.

     Der Versand läuft ohne Seitenneuladen; der Besucher bleibt im Formular
     und bekommt direkt eine Rückmeldung.
     ===================================================================== */
  var FORM_ENDPOINT = "";                       // z. B. "https://…/f/abc123"
  var KONTAKT_MAIL  = "";                       // ⚠️ noch unbekannt – bitte eintragen
  var TELEFON       = "02381 889017";
  var TELEFON_LINK  = "+492381889017";

  (function form() {
    var f = $("#form");
    if (!f) return;

    var status = $("#form-status");
    var submit = $('button[type="submit"]', f);
    var labelOriginal = submit ? submit.innerHTML : "";

    function val(id) { var el = $(id); return el ? el.value.trim() : ""; }

    function sag(art, html) {
      if (!status) return;
      status.className = "form-status " + art;
      status.innerHTML = html;
      status.hidden = false;
      status.scrollIntoView({ block: "nearest", behavior: reduced ? "auto" : "smooth" });
    }

    function beschaeftigt(an) {
      if (!submit) return;
      submit.disabled = an;
      submit.style.opacity = an ? ".65" : "";
      submit.innerHTML = an ? "Wird gesendet …" : labelOriginal;
    }

    var anruf = '<a href="tel:' + TELEFON_LINK + '">' + TELEFON + "</a>";

    /* --- eigene Pflichtfeldprüfung, damit die Meldungen zum Design passen --- */
    function pruefen() {
      var ok = true;
      [["#f-name", "Bitte tragen Sie Ihren Namen ein."],
       ["#f-tel",  "Ohne Telefonnummer können wir nicht zurückrufen."]
      ].forEach(function (paar) {
        var el = $(paar[0]);
        if (!el) return;
        var box = el.closest(".field");
        var alt = $(".field-error", box);
        if (alt) alt.remove();
        box.classList.remove("invalid");

        if (!el.value.trim()) {
          box.classList.add("invalid");
          var m = document.createElement("span");
          m.className = "field-error";
          m.textContent = paar[1];
          box.appendChild(m);
          if (ok) el.focus();
          ok = false;
        }
      });

      var mail = $("#f-mail");
      if (mail && mail.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(mail.value.trim())) {
        var mbox = mail.closest(".field");
        var altm = $(".field-error", mbox);
        if (altm) altm.remove();
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
        name:      val("#f-name"),
        telefon:   val("#f-tel"),
        email:     val("#f-mail"),
        fahrzeug:  val("#f-car"),
        leistung:  val("#f-service"),
        nachricht: val("#f-msg"),
        _subject:  "Terminanfrage über die Website – " + val("#f-service")
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
      if (!KONTAKT_MAIL) {
        sag("err",
          "<strong>Der Online-Versand ist noch nicht eingerichtet.</strong> " +
          "Bitte rufen Sie uns kurz an: " + anruf + " – wir nehmen den Termin direkt auf.");
        return;
      }
      window.location.href = "mailto:" + KONTAKT_MAIL +
        "?subject=" + encodeURIComponent(d._subject) +
        "&body="    + encodeURIComponent(alsText(d));
      sag("ok",
        "<strong>Fast geschafft.</strong> Ihr E-Mail-Programm sollte sich mit der " +
        "fertigen Nachricht geöffnet haben – bitte dort noch auf Senden klicken. " +
        "Passiert nichts? Rufen Sie uns einfach an: " + anruf);
    }

    f.addEventListener("submit", function (e) {
      e.preventDefault();

      // Bots füllen das versteckte Feld aus – dann tun wir nur so, als ob
      var hp = $("#f-website");
      if (hp && hp.value) { sag("ok", "Danke für Ihre Anfrage."); f.reset(); return; }

      if (!pruefen()) return;
      var d = daten();

      if (!FORM_ENDPOINT) { perMailProgramm(d); return; }

      beschaeftigt(true);
      fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(d)
      })
        .then(function (r) {
          if (!r.ok) throw new Error("HTTP " + r.status);
          f.reset();
          sag("ok",
            "<strong>Danke, Ihre Anfrage ist da.</strong> Wir melden uns zurück – " +
            "in der Regel noch am selben Werktag.");
        })
        .catch(function () {
          sag("err",
            "<strong>Das hat leider nicht geklappt.</strong> Bitte rufen Sie uns kurz an: " +
            anruf + (KONTAKT_MAIL
              ? ' – oder schreiben Sie an <a href="mailto:' + KONTAKT_MAIL + '">' + KONTAKT_MAIL + "</a>."
              : "."));
        })
        .then(function () { beschaeftigt(false); });
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

    var KEY = "acc-cookie-ok";
    function gemerkt() { try { return localStorage.getItem(KEY); } catch (e) { return "1"; } }
    function merken()  { try { localStorage.setItem(KEY, "1"); } catch (e) {} }

    if (!gemerkt()) setTimeout(function () { box.classList.add("show"); }, 1400);
    if (ok) ok.addEventListener("click", function () { box.classList.remove("show"); merken(); });
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
  (function jahr() {
    $$(".year").forEach(function (y) { y.textContent = new Date().getFullYear(); });
  })();

})();
