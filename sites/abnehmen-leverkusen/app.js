/* Abnehmen im Liegen Leverkusen — Interaktion
   Reines Vanilla-JS, kein Build, keine externen Requests. */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Navigation ---------- */
  var nav = document.querySelector(".nav");
  var toggle = document.querySelector(".nav-toggle");
  var links = document.getElementById("nav-links");

  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = document.body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Menü schließen" : "Menü öffnen");
    });
    links.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        document.body.classList.remove("nav-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && document.body.classList.contains("nav-open")) {
        document.body.classList.remove("nav-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.focus();
      }
    });
  }

  /* ---------- Scroll-Fortschritt + kompakte Navbar ---------- */
  var progress = document.querySelector(".progress");
  var ticking = false;

  function onScroll() {
    var y = window.scrollY || document.documentElement.scrollTop;
    if (nav) nav.classList.toggle("is-stuck", y > 20);
    if (progress) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";
    }
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { ticking = true; window.requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* ---------- Reveal beim Scrollen ---------- */
  var revealables = document.querySelectorAll("[data-reveal]");
  if (revealables.length) {
    if (!("IntersectionObserver" in window) || reduced) {
      revealables.forEach(function (el) { el.classList.add("is-in"); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        });
      }, { rootMargin: "0px 0px -12% 0px", threshold: 0.05 });

      revealables.forEach(function (el) {
        // Gestaffelte Verzögerung innerhalb einer Gruppe
        var group = el.parentElement;
        if (group && group.hasAttribute("data-reveal-group")) {
          var i = Array.prototype.indexOf.call(group.children, el);
          el.style.setProperty("--d", Math.min(i, 6) * 90 + "ms");
        }
        io.observe(el);
      });
    }
  }

  /* ---------- Rezensions-Wasserfall ----------
     Jede Spalte wird einmal geklont, damit translateY(-50% → 0) nahtlos
     durchläuft: die Kopie rückt von oben nach, das Original wandert nach unten
     aus dem Bild. Klone sind für Screenreader unsichtbar. */
  document.querySelectorAll(".fall-col").forEach(function (col) {
    if (reduced) return;
    var originals = Array.prototype.slice.call(col.children);
    if (!originals.length) return;
    originals.forEach(function (card) {
      var clone = card.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      col.appendChild(clone);
    });
    col.classList.add("is-loop");
  });

  /* ---------- Zähler ---------- */
  var counters = document.querySelectorAll("[data-count]");
  if (counters.length && "IntersectionObserver" in window && !reduced) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        co.unobserve(el);
        var target = parseFloat(el.getAttribute("data-count"));
        var suffix = el.getAttribute("data-suffix") || "";
        var decimals = parseInt(el.getAttribute("data-decimals"), 10) || 0;
        var start = performance.now();
        var dur = 1500;
        (function tick(now) {
          var p = Math.min((now - start) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = (target * eased).toFixed(decimals).replace(".", ",") + suffix;
          if (p < 1) requestAnimationFrame(tick);
        })(start);
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { co.observe(el); });
  }

  /* ---------- Terminanfrage → vorausgefüllte E-Mail ---------- */
  var form = document.getElementById("anfrage");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var d = new FormData(form);
      var get = function (k) { return (d.get(k) || "").toString().trim(); };

      var lines = [
        "Name: " + get("name"),
        "E-Mail: " + get("email"),
        "Telefon: " + (get("telefon") || "—"),
        "Wunschbehandlung: " + (get("behandlung") || "—"),
        "Wunschtermin: " + (get("termin") || "—"),
        "",
        "Nachricht:",
        get("nachricht") || "—"
      ];

      var subject = "Terminanfrage über die Website – " + (get("name") || "Neue Anfrage");
      window.location.href =
        "mailto:info@abnehmenimliegen-lev.de" +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(lines.join("\n"));

      var hint = document.getElementById("form-hint");
      if (hint) {
        hint.textContent =
          "Dein E-Mail-Programm öffnet sich mit der fertigen Anfrage – bitte nur noch absenden. " +
          "Klappt das nicht? Ruf uns gern direkt an: 0163 2499640.";
        hint.style.color = "var(--violet)";
      }
    });
  }

  /* ---------- Cookie-Hinweis ---------- */
  var cookie = document.querySelector(".cookie");
  if (cookie) {
    var KEY = "ail-lev-cookie";
    var open = function () { cookie.classList.add("is-open"); };
    var close = function () {
      cookie.classList.remove("is-open");
      try { localStorage.setItem(KEY, "1"); } catch (err) { /* Privatmodus */ }
    };

    var known = false;
    try { known = localStorage.getItem(KEY) === "1"; } catch (err) { known = false; }
    if (!known) setTimeout(open, 900);

    cookie.querySelectorAll("[data-cookie-ok]").forEach(function (b) {
      b.addEventListener("click", close);
    });
    document.querySelectorAll("[data-cookie-open]").forEach(function (b) {
      b.addEventListener("click", function (e) { e.preventDefault(); open(); });
    });
  }

  /* ---------- Jahr im Footer ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();
