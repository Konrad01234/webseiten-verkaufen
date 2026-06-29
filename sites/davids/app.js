/* Davids im Landhaus – progressive enhancement
   Vanilla JS, no dependencies. Everything degrades gracefully without it. */
(function () {
  "use strict";
  document.documentElement.classList.add("js");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Preloader ---------- */
  var pl = document.getElementById("preloader");
  if (pl) {
    var hidePl = function () { pl.classList.add("hidden"); };
    window.addEventListener("load", function () { setTimeout(hidePl, 1800); });
    setTimeout(hidePl, 3200); // fallback
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
      toggle && toggle.querySelector(".ic-open")  && (toggle.querySelector(".ic-open").style.display  = "none");
      toggle && toggle.querySelector(".ic-close") && (toggle.querySelector(".ic-close").style.display = "block");
      document.body.style.overflow = "hidden";
      if (topbar) topbar.style.visibility = "hidden";
    }
    function closeNav() {
      if (!overlay) return;
      overlay.classList.remove("open");
      toggle && toggle.setAttribute("aria-expanded", "false");
      toggle && toggle.querySelector(".ic-open")  && (toggle.querySelector(".ic-open").style.display  = "");
      toggle && toggle.querySelector(".ic-close") && (toggle.querySelector(".ic-close").style.display = "");
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
      overlay.querySelectorAll("a").forEach(function (a) {
        a.addEventListener("click", closeNav);
      });
    }

    /* Legacy dropdown nav (desktop uses this directly) – kept for non-JS fallback */
    var links = document.getElementById("nav-links");
    if (links) {
      /* desktop: links visible normally – no JS needed */
    }

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
        /* SVG deco parallax */
        if (parallax.length) {
          parallax.forEach(function (el) {
            var s = parseFloat(el.getAttribute("data-parallax")) || 0.12;
            el.style.setProperty("--py", (y * s).toFixed(1) + "px");
          });
        }
        /* Hero background parallax */
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
      if (isNaN(to)) return;
      if (reduce) { el.textContent = pre + to + suf; return; }
      var dur = 1300, start = null;
      function step(t) {
        if (!start) start = t;
        var p = Math.min((t - start) / dur, 1);
        var eased = Math.round(to * (1 - Math.pow(1 - p, 3)));
        el.textContent = pre + eased + suf;
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

    /* ---------- Highlight today's opening hours ---------- */
    var day = new Date().getDay();
    var iso = day === 0 ? 7 : day;
    document.querySelectorAll(".hours-table tr[data-day]").forEach(function (tr) {
      tr.getAttribute("data-day").split(",").forEach(function (d) {
        if (parseInt(d, 10) === iso) tr.classList.add("today");
      });
    });

    /* ---------- Reservation form -> mailto (no backend needed) ---------- */
    var form = document.getElementById("reservation-form");
    if (form) {
      form.addEventListener("submit", function (ev) {
        ev.preventDefault();
        var get = function (id) { var el = document.getElementById(id); return el ? el.value.trim() : ""; };
        var name = get("r-name"), date = get("r-date"), time = get("r-time"),
            guests = get("r-guests"), phone = get("r-phone"), email = get("r-email"), msg = get("r-message");
        var subject = "Reservierungsanfrage – " + (name || "Gast");
        var lines = [
          "Reservierungsanfrage über davids.nrw",
          "----------------------------------------",
          "Name:        " + name,
          "Datum:       " + date,
          "Uhrzeit:     " + time,
          "Personen:    " + guests,
          "Telefon:     " + phone,
          "E-Mail:      " + email,
          "",
          "Nachricht:",
          msg
        ];
        window.location.href = "mailto:esser-davids@web.de?subject=" +
          encodeURIComponent(subject) + "&body=" + encodeURIComponent(lines.join("\n"));
        var status = document.getElementById("form-status");
        if (status) {
          status.textContent = "Vielen Dank, " + (name || "") + "! Ihr E-Mail-Programm öffnet sich mit der vorausgefüllten Anfrage. " +
            "Lieber telefonisch? Rufen Sie uns unter +49 1575 4791998 an.";
          status.classList.add("show", "ok");
        }
      });
    }

    /* ---------- Cookie consent ---------- */
    var cookie = document.getElementById("cookie-banner");
    if (cookie) {
      var KEY = "davids-cookie-consent";
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

    /* ---------- Gallery slideshow (impressionen.html) ---------- */
    var slSlides = document.querySelectorAll(".sl-slide");
    if (slSlides.length) {
      var slIdx = 0, slCount = slSlides.length, slTimer;
      var slCurEl   = document.getElementById("sl-cur");
      var slTotalEl = document.getElementById("sl-total");
      if (slTotalEl) slTotalEl.textContent = slCount;

      function slGoTo(n) {
        slSlides[slIdx].classList.remove("active");
        slIdx = (n + slCount) % slCount;
        var el = slSlides[slIdx];
        el.style.animation = "none";
        void el.offsetWidth;          /* force reflow to restart Ken Burns */
        el.style.animation = "";
        el.classList.add("active");
        if (slCurEl) slCurEl.textContent = slIdx + 1;
      }
      function slNext() { slGoTo(slIdx + 1); }
      function slPrev() { slGoTo(slIdx - 1); }
      function slStart() { slTimer = setInterval(slNext, 5800); }
      function slReset() { clearInterval(slTimer); slStart(); }

      slSlides[0].classList.add("active");
      slStart();

      var slWrap    = document.querySelector(".sl-wrap");
      var slPrevBtn = document.querySelector(".sl-prev");
      var slNextBtn = document.querySelector(".sl-next");
      if (slPrevBtn) slPrevBtn.addEventListener("click", function() { slPrev(); slReset(); });
      if (slNextBtn) slNextBtn.addEventListener("click", function() { slNext(); slReset(); });

      if (slWrap) {
        slWrap.addEventListener("mouseenter", function() { clearInterval(slTimer); });
        slWrap.addEventListener("mouseleave", slStart);
        var slTouchX = null;
        slWrap.addEventListener("touchstart", function(e) { slTouchX = e.changedTouches[0].clientX; }, { passive: true });
        slWrap.addEventListener("touchend", function(e) {
          if (slTouchX === null) return;
          var dx = e.changedTouches[0].clientX - slTouchX;
          if (Math.abs(dx) > 44) { (dx < 0 ? slNext : slPrev)(); slReset(); }
          slTouchX = null;
        });
      }
      document.addEventListener("keydown", function(e) {
        if (!document.querySelector(".sl-wrap")) return;
        if (e.key === "ArrowLeft")  { slPrev(); slReset(); }
        if (e.key === "ArrowRight") { slNext(); slReset(); }
      });
    }
  });
})();
