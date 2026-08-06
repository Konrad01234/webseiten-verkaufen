/* =========================================================================
   KFZ-Service Filius – Interaktion & Animationen
   Vanilla JS, kein Build-Schritt.
   ========================================================================= */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ── Preloader ─────────────────────────────────────────────────────── */
  var pre = $("#preloader");
  if (pre) {
    var hide = function () { pre.classList.add("hidden"); };
    window.addEventListener("load", function () { setTimeout(hide, reduced ? 0 : 900); });
    setTimeout(hide, 3000); // Sicherheitsnetz
  }

  /* ── Navigation: Overlay + Scroll-Zustand ──────────────────────────── */
  var nav = $(".nav");
  var toggle = $(".nav-toggle");
  var overlay = $("#nav-overlay");

  if (toggle) {
    toggle.addEventListener("click", function () {
      var open = document.body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Menü schließen" : "Menü öffnen");
      document.body.style.overflow = open ? "hidden" : "";
    });
  }
  if (overlay) {
    $$("a", overlay).forEach(function (a) {
      a.addEventListener("click", function () {
        document.body.classList.remove("nav-open");
        document.body.style.overflow = "";
        if (toggle) toggle.setAttribute("aria-expanded", "false");
      });
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && document.body.classList.contains("nav-open")) {
      document.body.classList.remove("nav-open");
      document.body.style.overflow = "";
      if (toggle) toggle.setAttribute("aria-expanded", "false");
    }
  });

  /* ── Scroll: Fortschritt, Navbar, Back-to-top ──────────────────────── */
  var bar = $("#scroll-progress");
  var toTop = $(".to-top");
  var ticking = false;

  function onScroll() {
    var y = window.scrollY || document.documentElement.scrollTop;
    var h = document.documentElement.scrollHeight - window.innerHeight;
    if (bar) bar.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
    if (nav) nav.classList.toggle("scrolled", y > 20);
    if (toTop) toTop.classList.toggle("show", y > 620);
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { window.requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
    });
  }

  /* ── Reveal beim Scrollen (gestaffelt) ─────────────────────────────── */
  var revealables = $$("[data-reveal]");
  if (revealables.length) {
    if (!("IntersectionObserver" in window) || reduced) {
      revealables.forEach(function (el) { el.classList.add("in"); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          var delay = parseInt(el.getAttribute("data-delay") || "0", 10);
          setTimeout(function () { el.classList.add("in"); }, delay);
          io.unobserve(el);
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -60px 0px" });
      revealables.forEach(function (el) { io.observe(el); });
    }
  }

  /* Kinder eines Containers automatisch staffeln */
  $$("[data-stagger]").forEach(function (box) {
    var step = parseInt(box.getAttribute("data-stagger") || "90", 10);
    $$("[data-reveal]", box).forEach(function (el, i) {
      if (!el.hasAttribute("data-delay")) el.setAttribute("data-delay", String(i * step));
    });
  });

  /* ── Count-up-Zähler ───────────────────────────────────────────────── */
  var counters = $$("[data-count]");
  if (counters.length && "IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        cio.unobserve(el);
        var target = parseFloat(el.getAttribute("data-count"));
        var dec = parseInt(el.getAttribute("data-decimals") || "0", 10);
        var suffix = el.getAttribute("data-suffix") || "";
        if (reduced) { el.textContent = target.toFixed(dec).replace(".", ",") + suffix; return; }
        var start = performance.now(), dur = 1500;
        (function tick(now) {
          var p = Math.min((now - start) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = (target * eased).toFixed(dec).replace(".", ",") + suffix;
          if (p < 1) requestAnimationFrame(tick);
        })(start);
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { cio.observe(el); });
  } else {
    counters.forEach(function (el) {
      var d = parseInt(el.getAttribute("data-decimals") || "0", 10);
      el.textContent = parseFloat(el.getAttribute("data-count")).toFixed(d).replace(".", ",") + (el.getAttribute("data-suffix") || "");
    });
  }

  /* ── Bewertungs-Balken füllen ──────────────────────────────────────── */
  var barsBox = $(".hc-bars");
  if (barsBox && "IntersectionObserver" in window) {
    var bio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        bio.unobserve(entry.target);
        $$(".fill", entry.target).forEach(function (f, i) {
          setTimeout(function () { f.style.width = f.getAttribute("data-w") + "%"; }, i * 120);
        });
      });
    }, { threshold: 0.4 });
    bio.observe(barsBox);
  }

  /* ── Karten-Spotlight (Maus folgt) ─────────────────────────────────── */
  if (!reduced && window.matchMedia("(hover: hover)").matches) {
    $$(".card").forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty("--mx", (e.clientX - r.left) + "px");
        card.style.setProperty("--my", (e.clientY - r.top) + "px");
      });
    });
  }

  /* ── Hero-Karte: sanfter 3D-Tilt ───────────────────────────────────── */
  var tiltCard = $("[data-tilt]");
  if (tiltCard && !reduced && window.matchMedia("(hover: hover)").matches) {
    var wrapEl = tiltCard.parentElement;
    wrapEl.addEventListener("mousemove", function (e) {
      var r = wrapEl.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - 0.5;
      var py = (e.clientY - r.top) / r.height - 0.5;
      tiltCard.style.transform = "perspective(1000px) rotateY(" + (px * 7).toFixed(2) + "deg) rotateX(" + (-py * 7).toFixed(2) + "deg)";
    });
    wrapEl.addEventListener("mouseleave", function () {
      tiltCard.style.transform = "perspective(1000px) rotateY(0) rotateX(0)";
    });
  }

  /* ── FAQ-Accordion ─────────────────────────────────────────────────── */
  $$(".faq-item").forEach(function (item) {
    var q = $(".faq-q", item);
    var a = $(".faq-a", item);
    if (!q || !a) return;
    q.setAttribute("aria-expanded", "false");
    q.addEventListener("click", function () {
      var open = item.classList.contains("open");
      $$(".faq-item.open").forEach(function (other) {
        other.classList.remove("open");
        $(".faq-a", other).style.maxHeight = null;
        $(".faq-q", other).setAttribute("aria-expanded", "false");
      });
      if (!open) {
        item.classList.add("open");
        a.style.maxHeight = a.scrollHeight + "px";
        q.setAttribute("aria-expanded", "true");
      }
    });
  });

  /* ── Öffnungszeiten: heutigen Tag markieren ────────────────────────── */
  var todayIdx = new Date().getDay(); // 0 = Sonntag
  $$("[data-day]").forEach(function (row) {
    if (parseInt(row.getAttribute("data-day"), 10) === todayIdx) row.classList.add("today");
  });

  /* Geöffnet / geschlossen live anzeigen */
  (function () {
    var el = $("[data-open-state]");
    if (!el) return;
    var now = new Date();
    var day = now.getDay();
    var mins = now.getHours() * 60 + now.getMinutes();
    var werktag = day >= 1 && day <= 5;
    var offen = werktag && mins >= 8 * 60 && mins < 17 * 60;
    el.textContent = offen ? "Jetzt geöffnet · bis 17:00 Uhr" : (werktag && mins < 8 * 60 ? "Öffnet heute um 08:00 Uhr" : "Aktuell geschlossen · Mo–Fr 08–17 Uhr");
  })();

  /* =======================================================================
     Rezensions-Wasserfall
     ===================================================================== */
  function starSvg() {
    return '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/></svg>';
  }
  function googleSvg() {
    return '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21.6 12.2c0-.7-.1-1.3-.2-1.9H12v3.7h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3z"/><path d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.7-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22z"/><path d="M6.4 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.4H3.1a10 10 0 0 0 0 9.2L6.4 14z"/><path d="M12 6c1.5 0 2.8.5 3.8 1.5l2.8-2.8A10 10 0 0 0 3.1 7.4L6.4 10c.8-2.4 3-4 5.6-4z"/></svg>';
  }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function initials(name) {
    var parts = String(name).trim().split(/\s+/);
    return ((parts[0] || "")[0] || "?").toUpperCase() + ((parts[1] || "")[0] || "").toUpperCase();
  }
  function reviewHtml(r) {
    var stars = "";
    for (var i = 0; i < (r.stars || 5); i++) stars += starSvg();
    return (
      '<article class="rev" data-quelle="' + escapeHtml(r.quelle || "") + '">' +
        '<div class="rev-top">' +
          '<div class="rev-av" aria-hidden="true">' + escapeHtml(initials(r.name)) + "</div>" +
          '<div class="rev-meta">' +
            '<div class="rev-name">' + escapeHtml(r.name) + "</div>" +
            '<div class="rev-date">' + escapeHtml(r.date) + "</div>" +
          "</div>" +
        "</div>" +
        '<div class="stars" role="img" aria-label="' + (r.stars || 5) + ' von 5 Sternen">' + stars + "</div>" +
        "<p>„" + escapeHtml(r.text) + "“</p>" +
        '<span class="rev-src">' + googleSvg() + " Google Rezension</span>" +
      "</article>"
    );
  }

  var data = window.FILIUS_REVIEWS || [];

  /* Wasserfall: mehrere Spalten, abwechselnd auf/ab, endlos */
  var wf = $("#waterfall");
  if (wf && data.length) {
    var cols = parseInt(wf.getAttribute("data-cols") || "3", 10);
    var buckets = [];
    for (var c = 0; c < cols; c++) buckets.push([]);
    data.forEach(function (r, i) { buckets[i % cols].push(r); });

    wf.innerHTML = buckets.map(function (items, i) {
      var inner = items.map(reviewHtml).join("");
      var dir = i % 2 === 0 ? "up" : "down";
      var dur = 46 + i * 9; // leicht versetzte Geschwindigkeiten
      // Inhalt verdoppeln → nahtlose Endlosschleife
      return '<div class="wf-col ' + dir + '" style="--dur:' + dur + 's" aria-hidden="' + (i > 0 ? "true" : "false") + '">' + inner + inner + "</div>";
    }).join("");

    if (reduced) $$(".wf-col", wf).forEach(function (col) { col.style.animation = "none"; });
  }

  /* Statisches Raster auf der Rezensionsseite */
  var grid = $("#review-grid");
  if (grid && data.length) {
    grid.innerHTML = data.map(reviewHtml).join("");
  }

  /* Anzahl-Ausgabe */
  $$("[data-review-count]").forEach(function (el) { el.textContent = String(data.length); });

  /* =======================================================================
     Terminanfrage → vorausgefüllte E-Mail (ohne Backend)
     ===================================================================== */
  var form = $("#termin-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var get = function (n) { var f = form.elements[n]; return f ? f.value.trim() : ""; };

      var body = [
        "Terminanfrage über die Website",
        "",
        "Name:        " + get("name"),
        "Telefon:     " + get("telefon"),
        "E-Mail:      " + get("email"),
        "Fahrzeug:    " + get("fahrzeug"),
        "Leistung:    " + get("leistung"),
        "Wunschtermin: " + (get("datum") || "flexibel"),
        "",
        "Nachricht:",
        get("nachricht") || "—",
      ].join("\n");

      var mail = form.getAttribute("data-mailto") || "info@kfz-service-filius.de";
      var href = "mailto:" + mail +
        "?subject=" + encodeURIComponent("Terminanfrage: " + (get("leistung") || "Werkstatttermin")) +
        "&body=" + encodeURIComponent(body);

      window.location.href = href;

      var msg = $("#form-msg");
      if (msg) {
        msg.classList.add("show");
        msg.textContent = "Ihr E-Mail-Programm öffnet sich mit der vorausgefüllten Anfrage. Falls nicht: rufen Sie uns einfach unter 0202 2839611 an.";
      }
    });
  }

  /* =======================================================================
     Cookie-Hinweis
     ===================================================================== */
  var cookie = $("#cookie");
  if (cookie) {
    var KEY = "filius-cookie-consent";
    var stored = null;
    try { stored = localStorage.getItem(KEY); } catch (err) { stored = null; }

    if (!stored) setTimeout(function () { cookie.classList.add("show"); }, 1400);

    $$("[data-consent]", cookie).forEach(function (btn) {
      btn.addEventListener("click", function () {
        try { localStorage.setItem(KEY, btn.getAttribute("data-consent")); } catch (err) { /* ignorieren */ }
        cookie.classList.remove("show");
      });
    });

    $$("[data-cookie-open]").forEach(function (link) {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        cookie.classList.add("show");
      });
    });
  }

  /* ── Jahr im Footer ────────────────────────────────────────────────── */
  $$("[data-year]").forEach(function (el) { el.textContent = String(new Date().getFullYear()); });
})();
