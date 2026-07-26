/* Kfz-Möckl GmbH – progressive enhancement
   Vanilla JS, keine Abhängigkeiten. Die Seite funktioniert auch ohne JS. */
(function () {
  "use strict";
  document.documentElement.classList.add("js");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var MAIL = "kfz-moeckl@web.de";
  var TEL_DISPLAY = "0821 4444242";

  /* ---------- Preloader ---------- */
  var pl = document.getElementById("preloader");
  if (pl) {
    var hidePl = function () { pl.classList.add("hidden"); };
    window.addEventListener("load", function () { setTimeout(hidePl, 1500); });
    setTimeout(hidePl, 3000); // Fallback, falls "load" ausbleibt
  }

  document.addEventListener("DOMContentLoaded", function () {

    /* ---------- Blueprint-Linien: Länge für die Zeichen-Animation ---------- */
    document.querySelectorAll("[data-draw]").forEach(function (p) {
      try {
        var len = Math.ceil(p.getTotalLength());
        if (len) p.style.setProperty("--len", len);
      } catch (e) { /* getTotalLength nicht verfügbar – CSS-Fallback greift */ }
    });

    /* ---------- Vollbild-Navigation ---------- */
    var toggle  = document.querySelector(".nav-toggle");
    var overlay = document.getElementById("nav-overlay");
    var ovClose = overlay ? overlay.querySelector(".ov-close") : null;

    function openNav() {
      if (!overlay) return;
      overlay.classList.add("open");
      overlay.setAttribute("aria-hidden", "false");
      if (toggle) toggle.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
    }
    function closeNav() {
      if (!overlay) return;
      overlay.classList.remove("open");
      overlay.setAttribute("aria-hidden", "true");
      if (toggle) toggle.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    }
    if (toggle) {
      toggle.addEventListener("click", function () {
        overlay && overlay.classList.contains("open") ? closeNav() : openNav();
      });
    }
    if (ovClose) ovClose.addEventListener("click", closeNav);
    if (overlay) {
      overlay.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", closeNav); });
    }
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && overlay && overlay.classList.contains("open")) closeNav();
    });

    /* ---------- Leistungs-Dropdown per Tastatur/Touch ---------- */
    document.querySelectorAll(".nav-drop > button").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        var drop = btn.parentElement;
        var open = drop.classList.toggle("open");
        btn.setAttribute("aria-expanded", open ? "true" : "false");
        var menu = drop.querySelector(".nav-drop-menu");
        if (menu) {
          menu.style.opacity    = open ? "1" : "";
          menu.style.visibility = open ? "visible" : "";
          menu.style.transform  = open ? "none" : "";
        }
      });
    });

    /* ---------- Reveal beim Scrollen ---------- */
    var reveal = document.querySelectorAll(".reveal, .reveal-l, .reveal-r, .reveal-scale, .steps");
    if ("IntersectionObserver" in window && reveal.length && !reduce) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
      reveal.forEach(function (el) { io.observe(el); });
    } else {
      reveal.forEach(function (el) { el.classList.add("in"); });
    }

    /* ---------- Navbar, Scroll-Fortschritt, Parallax ---------- */
    var nav     = document.querySelector(".nav");
    var bar     = document.getElementById("scroll-progress");
    var pxEls   = document.querySelectorAll("[data-parallax]");
    var ticking = false;

    function onScroll() {
      var y = window.pageYOffset || document.documentElement.scrollTop || 0;
      if (nav) nav.classList.toggle("scrolled", y > 8);
      if (bar) {
        var h = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.setProperty("--sp", h > 0 ? (y / h).toFixed(4) : 0);
      }
      if (!reduce && pxEls.length && y < window.innerHeight * 1.6) {
        pxEls.forEach(function (el) {
          var s = parseFloat(el.getAttribute("data-parallax")) || 0.15;
          el.style.setProperty("--py", (y * s).toFixed(1) + "px");
        });
      }
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { window.requestAnimationFrame(onScroll); ticking = true; }
    }, { passive: true });
    onScroll();

    /* ---------- Zähler ---------- */
    function animateCount(el) {
      var to  = parseFloat(el.getAttribute("data-to"));
      var suf = el.getAttribute("data-suffix") || "";
      var pre = el.getAttribute("data-prefix") || "";
      if (isNaN(to)) return;
      if (reduce) { el.textContent = pre + to + suf; return; }
      var dur = 1300, start = null;
      function step(t) {
        if (!start) start = t;
        var p = Math.min((t - start) / dur, 1);
        el.textContent = pre + Math.round(to * (1 - Math.pow(1 - p, 3))) + suf;
        if (p < 1) window.requestAnimationFrame(step);
        else el.textContent = pre + to + suf;
      }
      window.requestAnimationFrame(step);
    }
    var counts = document.querySelectorAll("[data-to]");
    if ("IntersectionObserver" in window && counts.length) {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { animateCount(e.target); cio.unobserve(e.target); }
        });
      }, { threshold: 0.5 });
      counts.forEach(function (el) { cio.observe(el); });
    } else {
      counts.forEach(animateCount);
    }

    /* ---------- Heutigen Öffnungstag hervorheben ---------- */
    var d = new Date().getDay();
    var iso = d === 0 ? 7 : d;
    document.querySelectorAll(".hours-table tr[data-day]").forEach(function (tr) {
      tr.getAttribute("data-day").split(",").forEach(function (x) {
        if (parseInt(x, 10) === iso) tr.classList.add("today");
      });
    });

    /* ---------- Terminanfrage -> vorbefüllte E-Mail (kein Backend) ---------- */
    var form = document.getElementById("termin-form");
    if (form) {
      form.addEventListener("submit", function (ev) {
        ev.preventDefault();
        var get = function (id) { var el = document.getElementById(id); return el ? el.value.trim() : ""; };
        var name = get("t-name"), fahrzeug = get("t-fahrzeug"), kennzeichen = get("t-kennzeichen"),
            leistung = get("t-leistung"), datum = get("t-datum"), phone = get("t-phone"),
            email = get("t-email"), msg = get("t-message");

        var lines = [
          "Terminanfrage über die Website",
          "----------------------------------------",
          "Name:          " + name,
          "Fahrzeug:      " + fahrzeug,
          "Kennzeichen:   " + kennzeichen,
          "Leistung:      " + leistung,
          "Wunschtermin:  " + datum,
          "Telefon:       " + phone,
          "E-Mail:        " + email,
          "",
          "Nachricht:",
          msg
        ];
        window.location.href = "mailto:" + MAIL +
          "?subject=" + encodeURIComponent("Terminanfrage – " + (name || "Kunde") + (fahrzeug ? " (" + fahrzeug + ")" : "")) +
          "&body="    + encodeURIComponent(lines.join("\n"));

        var status = document.getElementById("form-status");
        if (status) {
          status.textContent = "Danke" + (name ? ", " + name : "") + "! Ihr E-Mail-Programm öffnet sich mit der " +
            "vorausgefüllten Anfrage. Schneller geht’s telefonisch: " + TEL_DISPLAY + ".";
          status.classList.add("show", "ok");
        }
      });
    }

    /* ---------- Cookie-Hinweis ---------- */
    var cookie = document.getElementById("cookie-banner");
    if (cookie) {
      var KEY = "moeckl-cookie-consent";
      var store = function (v) { try { localStorage.setItem(KEY, v); } catch (e) {} cookie.classList.remove("show"); };
      var read  = function () { try { return localStorage.getItem(KEY); } catch (e) { return "x"; } };
      if (!read()) setTimeout(function () { cookie.classList.add("show"); }, 900);
      cookie.querySelectorAll("[data-cookie]").forEach(function (b) {
        b.addEventListener("click", function () { store(b.getAttribute("data-cookie")); });
      });
      document.querySelectorAll("[data-cookie-open]").forEach(function (a) {
        a.addEventListener("click", function (e) { e.preventDefault(); cookie.classList.add("show"); });
      });
    }

    /* ---------- Jahr im Footer ---------- */
    var y = document.getElementById("year");
    if (y) y.textContent = new Date().getFullYear();
  });
})();
