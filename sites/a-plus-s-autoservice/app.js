/* A + S Autoservice GmbH – progressive enhancement
   Vanilla JS, no dependencies. Everything degrades gracefully without it. */
(function () {
  "use strict";
  document.documentElement.classList.add("js");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Contact address used by the request form (change to the real inbox anytime) */
  var CONTACT_MAIL = "info@a-s-autoservice.de";

  /* ---------- Preloader ---------- */
  var pl = document.getElementById("preloader");
  if (pl) {
    var hidePl = function () { pl.classList.add("hidden"); };
    window.addEventListener("load", function () { setTimeout(hidePl, 1400); });
    setTimeout(hidePl, 2800); // fallback
  }

  document.addEventListener("DOMContentLoaded", function () {
    /* ---------- Fullscreen overlay navigation ---------- */
    var toggle  = document.querySelector(".nav-toggle");
    var overlay = document.getElementById("nav-overlay");
    var ovClose = overlay ? overlay.querySelector(".ov-close") : null;
    var topbar  = document.querySelector(".topbar");

    function openNav() {
      if (!overlay) return;
      overlay.classList.add("open");
      toggle && toggle.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
      if (topbar) topbar.style.visibility = "hidden";
    }
    function closeNav() {
      if (!overlay) return;
      overlay.classList.remove("open");
      toggle && toggle.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
      if (topbar) topbar.style.visibility = "";
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
      if (e.key === "Escape") closeNav();
    });

    /* ---------- Reveal on scroll ---------- */
    var reveal = document.querySelectorAll(".reveal, .reveal-l, .reveal-r, .reveal-scale");
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

    /* ---------- Nav shrink + scroll progress + parallax (rAF throttled) ---------- */
    var nav      = document.querySelector(".nav");
    var bar      = document.getElementById("scroll-progress");
    var parallax = document.querySelectorAll("[data-parallax]");
    var heroBg   = document.querySelector(".hero-bg.has-photo");
    var ticking  = false;
    function onScroll() {
      var y = window.pageYOffset || document.documentElement.scrollTop || 0;
      if (nav) nav.classList.toggle("scrolled", y > 8);
      if (bar) {
        var h = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.setProperty("--sp", h > 0 ? (y / h).toFixed(4) : 0);
      }
      if (!reduce) {
        if (parallax.length) {
          parallax.forEach(function (el) {
            var s = parseFloat(el.getAttribute("data-parallax")) || 0.12;
            el.style.setProperty("--py", (y * s).toFixed(1) + "px");
          });
        }
        if (heroBg && y < window.innerHeight * 1.3) {
          heroBg.style.setProperty("--py", (y * 0.22).toFixed(1) + "px");
        }
      }
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { window.requestAnimationFrame(onScroll); ticking = true; }
    }, { passive: true });
    onScroll();

    /* ---------- Count-up for stats ---------- */
    function animateCount(el) {
      var to = parseFloat(el.getAttribute("data-to"));
      var suf = el.getAttribute("data-suffix") || "";
      var pre = el.getAttribute("data-prefix") || "";
      var dec = parseInt(el.getAttribute("data-decimals") || "0", 10);
      if (isNaN(to)) return;
      if (reduce) { el.textContent = pre + to.toFixed(dec).replace(".", ",") + suf; return; }
      var dur = 1300, start = null;
      function step(t) {
        if (!start) start = t;
        var p = Math.min((t - start) / dur, 1);
        var eased = to * (1 - Math.pow(1 - p, 3));
        el.textContent = pre + eased.toFixed(dec).replace(".", ",") + suf;
        if (p < 1) window.requestAnimationFrame(step);
        else el.textContent = pre + to.toFixed(dec).replace(".", ",") + suf;
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

    /* ---------- Highlight today's opening hours ---------- */
    var day = new Date().getDay();
    var iso = day === 0 ? 7 : day;
    document.querySelectorAll(".hours-table tr[data-day]").forEach(function (tr) {
      tr.getAttribute("data-day").split(",").forEach(function (d) {
        if (parseInt(d, 10) === iso) tr.classList.add("today");
      });
    });

    /* ---------- Request form -> mailto (no backend needed) ---------- */
    var form = document.getElementById("request-form");
    if (form) {
      form.addEventListener("submit", function (ev) {
        ev.preventDefault();
        var get = function (id) { var el = document.getElementById(id); return el ? el.value.trim() : ""; };
        var name = get("r-name"), phone = get("r-phone"), email = get("r-email"),
            service = get("r-service"), vehicle = get("r-vehicle"), date = get("r-date"), msg = get("r-message");
        var subject = "Terminanfrage – " + (name || "Kunde") + (service ? " (" + service + ")" : "");
        var lines = [
          "Terminanfrage über a-s-autoservice.de",
          "----------------------------------------",
          "Name:        " + name,
          "Telefon:     " + phone,
          "E-Mail:      " + email,
          "Leistung:    " + service,
          "Fahrzeug:    " + vehicle,
          "Wunschtermin:" + date,
          "",
          "Nachricht:",
          msg
        ];
        window.location.href = "mailto:" + CONTACT_MAIL + "?subject=" +
          encodeURIComponent(subject) + "&body=" + encodeURIComponent(lines.join("\n"));
        var status = document.getElementById("form-status");
        if (status) {
          status.textContent = "Vielen Dank, " + (name || "") + "! Ihr E-Mail-Programm öffnet sich mit der vorausgefüllten Anfrage. " +
            "Lieber direkt sprechen? Rufen Sie uns unter 0228 289 34 93 an.";
          status.classList.add("show", "ok");
        }
      });
    }

    /* ---------- Cookie consent ---------- */
    var cookie = document.getElementById("cookie-banner");
    if (cookie) {
      var KEY = "as-autoservice-cookie-consent";
      var store = function (v) { try { localStorage.setItem(KEY, v); } catch (e) {} cookie.classList.remove("show"); };
      var read = function () { try { return localStorage.getItem(KEY); } catch (e) { return "x"; } };
      if (!read()) { setTimeout(function () { cookie.classList.add("show"); }, 900); }
      cookie.querySelectorAll("[data-cookie]").forEach(function (b) {
        b.addEventListener("click", function () { store(b.getAttribute("data-cookie")); });
      });
      document.querySelectorAll("[data-cookie-open]").forEach(function (a) {
        a.addEventListener("click", function (e) { e.preventDefault(); cookie.classList.add("show"); });
      });
    }

    /* ---------- Footer year ---------- */
    var y = document.getElementById("year");
    if (y) y.textContent = new Date().getFullYear();
  });
})();
