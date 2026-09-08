/* baufinanzierung.biz – progressive enhancement
   Vanilla JS, keine Abhängigkeiten. Ohne JS bleiben alle Inhalte les- und bedienbar. */
(function () {
  "use strict";
  document.documentElement.classList.add("js");

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Angenommener Sollzins für alle Beispielrechnungen (in % p. a.).
     Muss regelmäßig an das aktuelle Zinsniveau angepasst werden. */
  var ZINS_BEISPIEL = 3.6;
  /* Notar & Grundbuch pauschal, in % vom Kaufpreis. */
  var NOTAR_GRUNDBUCH = 2.0;

  var eur0 = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0 });
  var num1 = new Intl.NumberFormat("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

  function fmtEur(n) { return eur0.format(Math.round(n || 0)) + " €"; }
  function fmtPct(n) { return num1.format(n || 0).replace(".", ",") + " %"; }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  /* =========================================================================
     Finanzmathematik
     ========================================================================= */

  /* Kaufnebenkosten in % vom Kaufpreis: Grunderwerbsteuer + Notar/Grundbuch + Makler */
  function nebenkostenSatz(grunderwerb, makler) {
    return (grunderwerb || 0) + NOTAR_GRUNDBUCH + (makler || 0);
  }

  /* Darlehensbedarf. Wird auf Mitfinanzierung verzichtet, deckt das Eigenkapital
     zuerst die Nebenkosten und mindert erst danach den Kaufpreis. */
  function darlehensbedarf(kaufpreis, eigenkapital, nebenkosten, mitfinanzieren) {
    var bedarf = mitfinanzieren
      ? kaufpreis + nebenkosten - eigenkapital
      : kaufpreis - Math.max(0, eigenkapital - nebenkosten);
    return Math.max(0, bedarf);
  }

  /* Annuität: monatliche Rate aus Sollzins und anfänglicher Tilgung */
  function monatsrate(darlehen, zins, tilgung) {
    return (darlehen * (zins + tilgung)) / 100 / 12;
  }

  /* Restschuld nach n Monaten bei konstanter Rate */
  function restschuld(darlehen, zins, rate, monate) {
    var i = zins / 100 / 12;
    if (i <= 0) return Math.max(0, darlehen - rate * monate);
    var q = Math.pow(1 + i, monate);
    return Math.max(0, darlehen * q - rate * ((q - 1) / i));
  }

  /* Gesamtlaufzeit bis zur vollständigen Tilgung, in Jahren */
  function laufzeitJahre(darlehen, zins, rate) {
    var i = zins / 100 / 12;
    if (darlehen <= 0 || rate <= 0) return 0;
    if (i <= 0) return darlehen / rate / 12;
    if (rate <= darlehen * i) return Infinity; // Rate deckt nicht einmal die Zinsen
    return -Math.log(1 - (darlehen * i) / rate) / Math.log(1 + i) / 12;
  }

  /* =========================================================================
     Navigation, Scroll, Reveal
     ========================================================================= */
  function initChrome() {
    var toggle  = $(".nav-toggle");
    var overlay = $("#nav-overlay");

    function setNav(open) {
      if (!overlay || !toggle) return;
      overlay.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Menü schließen" : "Menü öffnen");
      document.body.style.overflow = open ? "hidden" : "";
    }
    if (toggle && overlay) {
      toggle.addEventListener("click", function () { setNav(!overlay.classList.contains("open")); });
      $$("a", overlay).forEach(function (a) { a.addEventListener("click", function () { setNav(false); }); });
      document.addEventListener("keydown", function (e) { if (e.key === "Escape") setNav(false); });
      window.addEventListener("resize", function () { if (window.innerWidth > 880) setNav(false); });
    }

    var nav = $("#nav");
    var bar = $("#scroll-progress");
    var ticking = false;
    function onScroll() {
      var y = window.pageYOffset || document.documentElement.scrollTop || 0;
      if (nav) nav.classList.toggle("scrolled", y > 8);
      if (bar) {
        var max = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";
      }
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(onScroll); }
    }, { passive: true });
    onScroll();

    var year = $("#year");
    if (year) year.textContent = String(new Date().getFullYear());
  }

  function initReveal() {
    var els = $$(".reveal");
    if (!els.length) return;
    if (!("IntersectionObserver" in window) || reduce) {
      els.forEach(function (el) { el.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    els.forEach(function (el) { io.observe(el); });
  }

  /* Hochzählende Kennzahlen */
  function initCounters() {
    var els = $$("[data-count]");
    if (!els.length) return;
    if (!("IntersectionObserver" in window) || reduce) {
      els.forEach(function (el) { el.textContent = el.getAttribute("data-count"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        var el = e.target;
        var target = parseFloat(el.getAttribute("data-count")) || 0;
        var suffix = el.getAttribute("data-suffix") || "";
        var start = performance.now();
        (function tick(now) {
          var p = Math.min(1, (now - start) / 1400);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = eur0.format(Math.round(target * eased)) + suffix;
          if (p < 1) window.requestAnimationFrame(tick);
        })(start);
      });
    }, { threshold: 0.4 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* =========================================================================
     Rechner auf der Startseite
     ========================================================================= */
  function initRechner() {
    var form = $("#rechner-form");
    if (!form) return;

    var f = {
      kaufpreis:    $("#r-kaufpreis"),
      eigenkapital: $("#r-eigenkapital"),
      zins:         $("#r-zins"),
      tilgung:      $("#r-tilgung"),
      bindung:      $("#r-bindung"),
      bundesland:   $("#r-bundesland")
    };

    function update() {
      var kaufpreis = +f.kaufpreis.value;
      var ek        = Math.min(+f.eigenkapital.value, kaufpreis * 1.2);
      var zins      = +f.zins.value;
      var tilgung   = +f.tilgung.value;
      var bindung   = +f.bindung.value;
      var grOpt     = f.bundesland.options[f.bundesland.selectedIndex];
      var gr        = parseFloat(grOpt.getAttribute("data-gr")) || 0;

      var satz    = nebenkostenSatz(gr, 3.57);
      var nk      = (kaufpreis * satz) / 100;
      var darl    = darlehensbedarf(kaufpreis, ek, nk, true);
      var rate    = monatsrate(darl, zins, tilgung);
      var rest    = restschuld(darl, zins, rate, bindung * 12);
      var jahre   = laufzeitJahre(darl, zins, rate);
      var auslauf = kaufpreis > 0 ? (darl / kaufpreis) * 100 : 0;

      $("#r-out-kaufpreis").textContent    = fmtEur(kaufpreis);
      $("#r-out-eigenkapital").textContent = fmtEur(ek);
      $("#r-out-zins").textContent         = fmtPct(zins);
      $("#r-out-tilgung").textContent      = fmtPct(tilgung);

      $("#r-rate").firstChild.nodeValue = eur0.format(Math.round(rate)) + " ";
      $("#r-darlehen").textContent      = fmtEur(darl);
      $("#r-nebenkosten").textContent   = fmtEur(nk) + " (" + fmtPct(satz) + ")";
      $("#r-restschuld").textContent    = fmtEur(rest);
      $("#r-laufzeit").textContent      = isFinite(jahre)
        ? num1.format(jahre).replace(".", ",") + " Jahre"
        : "Rate zu niedrig";
      $("#r-auslauf").textContent       = fmtPct(auslauf);

      // Eingaben in die Anfrage übernehmen
      var link = $("#r-uebernehmen");
      if (link) {
        link.href = "anfrage.html?kaufpreis=" + kaufpreis + "&eigenkapital=" + Math.round(ek) +
          "&tilgung=" + tilgung + "&zinsbindung=" + bindung +
          "&bundesland=" + encodeURIComponent(f.bundesland.value);
      }
    }

    form.addEventListener("input", update);
    form.addEventListener("change", update);
    form.addEventListener("submit", function (e) { e.preventDefault(); });
    update();
  }

  /* =========================================================================
     Anfrage-Assistent
     ========================================================================= */
  function initWizard() {
    var form = $("#anfrage");
    if (!form) return;

    var steps    = $$(".wstep", form);
    var dots     = $$("#progress-dots li");
    var fill     = $("#progress-fill");
    var bar      = $("#progress-bar");
    var titleEl  = $("#step-title");
    var nowEl    = $("#step-now");
    var doneEl   = $("#wizard-done");
    var card     = form.closest(".form-card");
    var current  = 0;
    var mailBody = "";

    var STORE_KEY = "bfz-anfrage-entwurf";

    /* ---------- Schritt-Steuerung ---------- */
    function show(index, scroll) {
      current = Math.max(0, Math.min(steps.length - 1, index));
      steps.forEach(function (s, i) { s.classList.toggle("active", i === current); });
      dots.forEach(function (d, i) {
        d.classList.toggle("done", i < current);
        d.classList.toggle("current", i === current);
      });
      if (fill) fill.style.width = ((current + 1) / steps.length) * 100 + "%";
      if (bar) bar.setAttribute("aria-valuenow", String(current + 1));
      if (nowEl) nowEl.textContent = String(current + 1);
      // Kurzbezeichnung des Schritts (die Langfassung steht als <h2> im Schritt selbst)
      if (titleEl && dots[current]) titleEl.textContent = dots[current].textContent;
      if (current === steps.length - 1) buildSummary();
      if (scroll && card) {
        var top = card.getBoundingClientRect().top + window.pageYOffset - 96;
        window.scrollTo({ top: top, behavior: reduce ? "auto" : "smooth" });
      }
      // Fokus auf den ersten sinnvollen Bedienpunkt des Schritts
      var focusable = steps[current] && $("input:not([type=hidden]), select, textarea", steps[current]);
      if (scroll && focusable) { try { focusable.focus({ preventScroll: true }); } catch (err) { /* egal */ } }
    }

    /* ---------- Validierung ---------- */
    function setError(el, on) {
      var field = el.closest(".field") || el.closest(".check");
      if (field) field.classList.toggle("has-error", !!on);
      el.classList.toggle("invalid", !!on);
      if (on) el.setAttribute("aria-invalid", "true"); else el.removeAttribute("aria-invalid");
    }

    function validField(el) {
      var v = (el.value || "").trim();
      if (el.type === "checkbox") return !el.required || el.checked;
      if (el.required && !v) return false;
      if (!v) return true; // optionale, leere Felder sind in Ordnung
      if (el.type === "email") return /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(v);
      if (el.type === "tel") return v.replace(/[^0-9]/g, "").length >= 6;
      if (el.id === "plz") return /^[0-9]{5}$/.test(v);
      return true;
    }

    function validateStep(index) {
      var ok = true, first = null;
      $$("input, select, textarea", steps[index]).forEach(function (el) {
        if (el.type === "radio" || el.disabled) return;
        var good = validField(el);
        setError(el, !good);
        if (!good && !first) first = el;
        ok = ok && good;
      });
      if (first) {
        try { first.focus({ preventScroll: true }); } catch (err) { /* egal */ }
        first.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" });
      }
      return ok;
    }

    form.addEventListener("input", function (e) {
      if (e.target.matches("input, select, textarea") && validField(e.target)) setError(e.target, false);
    });

    $$("[data-next]", form).forEach(function (btn) {
      btn.addEventListener("click", function () { if (validateStep(current)) show(current + 1, true); });
    });
    $$("[data-prev]", form).forEach(function (btn) {
      btn.addEventListener("click", function () { show(current - 1, true); });
    });
    // Enter im Textfeld springt weiter statt abzusenden
    form.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && e.target.tagName === "INPUT" && current < steps.length - 1) {
        e.preventDefault();
        if (validateStep(current)) show(current + 1, true);
      }
    });
    // Direktsprung über die Fortschrittsanzeige – nur zurück
    dots.forEach(function (d, i) {
      d.addEventListener("click", function () { if (i < current) show(i, true); });
    });

    /* ---------- Berechnung & Live-Rate ---------- */
    function werte() {
      var el = form.elements;
      var kaufpreis = +el.kaufpreis.value;
      var ek        = +el.eigenkapital.value;
      var tilgung   = +el.tilgung.value;
      var bindung   = +el.zinsbindung.value;
      var makler    = parseFloat(el.makler.value) || 0;
      var blOpt     = el.bundesland.options[el.bundesland.selectedIndex];
      var gr        = blOpt ? parseFloat(blOpt.getAttribute("data-gr")) || 0 : 0;
      var satz      = nebenkostenSatz(gr, makler);
      var nk        = (kaufpreis * satz) / 100;
      var mitfin    = el.nebenkosten.checked;
      var darl      = darlehensbedarf(kaufpreis, ek, nk, mitfin);
      var rate      = monatsrate(darl, ZINS_BEISPIEL, tilgung);
      return {
        kaufpreis: kaufpreis, eigenkapital: ek, tilgung: tilgung, bindung: bindung,
        satz: satz, nebenkosten: nk, mitfinanziert: mitfin, darlehen: darl, rate: rate,
        restschuld: restschuld(darl, ZINS_BEISPIEL, rate, bindung * 12),
        laufzeit: laufzeitJahre(darl, ZINS_BEISPIEL, rate),
        auslauf: kaufpreis > 0 ? (darl / kaufpreis) * 100 : 0
      };
    }

    function updateFinanzierung() {
      var w = werte();
      $("#out-kaufpreis").textContent    = fmtEur(w.kaufpreis);
      $("#out-eigenkapital").textContent = fmtEur(w.eigenkapital);
      $("#out-tilgung").textContent      = fmtPct(w.tilgung);
      $("#hint-ekquote").textContent = w.kaufpreis > 0
        ? "Eigenkapitalquote: " + fmtPct((w.eigenkapital / w.kaufpreis) * 100) + " des Kaufpreises"
        : "Eigenkapitalquote: –";

      var rateEl = $("#live-rate");
      var detail = $("#live-detail");
      if (rateEl) rateEl.textContent = fmtEur(w.rate);
      if (detail) {
        detail.textContent = "Darlehen " + fmtEur(w.darlehen) + " · " + fmtPct(ZINS_BEISPIEL) +
          " Beispielzins · " + fmtPct(w.tilgung) + " Tilgung";
      }
    }

    ["kaufpreis", "eigenkapital", "tilgung", "zinsbindung", "makler", "bundesland", "nebenkosten"].forEach(function (name) {
      var el = form.elements[name];
      if (el) { el.addEventListener("input", updateFinanzierung); el.addEventListener("change", updateFinanzierung); }
    });

    /* ---------- Zusammenfassung ---------- */
    function radioValue(name) {
      var el = form.elements[name];
      return el ? el.value : "";
    }
    function textValue(name) {
      var el = form.elements[name];
      return el && el.value ? String(el.value).trim() : "";
    }

    function zeilen() {
      var w = werte();
      var rows = [
        ["Vorhaben", radioValue("vorhaben")],
        ["Stand", textValue("stand")],
        ["Objektart", radioValue("objektart")],
        ["Lage", [textValue("plz"), textValue("ort")].filter(Boolean).join(" ") + (textValue("bundesland") ? " (" + textValue("bundesland") + ")" : "")],
        ["Nutzung", textValue("nutzung")],
        ["Wohnfläche", textValue("wohnflaeche") ? textValue("wohnflaeche") + " m²" : ""],
        ["Baujahr", textValue("baujahr")],
        ["Kaufpreis / Gesamtkosten", fmtEur(w.kaufpreis)],
        ["Eigenkapital", fmtEur(w.eigenkapital) + " (" + fmtPct(w.kaufpreis > 0 ? (w.eigenkapital / w.kaufpreis) * 100 : 0) + ")"],
        ["Kaufnebenkosten", fmtEur(w.nebenkosten) + " · " + (w.mitfinanziert ? "mitfinanziert" : "aus Eigenkapital")],
        ["Darlehensbedarf", fmtEur(w.darlehen)],
        ["Zinsbindung", w.bindung + " Jahre"],
        ["Anfängliche Tilgung", fmtPct(w.tilgung)],
        ["Beispielrate", fmtEur(w.rate) + " mtl. (bei " + fmtPct(ZINS_BEISPIEL) + " Sollzins)"],
        ["Finanzierung benötigt", textValue("zeitpunkt")],
        ["Berufsgruppe", radioValue("beruf")],
        ["Kreditnehmer", textValue("kreditnehmer") + (textValue("kreditnehmer") === "1" ? " Person" : " Personen")],
        ["Haushaltsnetto", textValue("einkommen") ? fmtEur(+textValue("einkommen")) + " mtl." : ""],
        ["Geburtsjahr", textValue("geburtsjahr")],
        ["Laufende Raten", textValue("verbindlichkeiten") ? fmtEur(+textValue("verbindlichkeiten")) + " mtl." : ""]
      ];
      return rows.filter(function (r) { return r[1] && String(r[1]).trim() && String(r[1]).trim() !== "()"; });
    }

    function buildSummary() {
      var dl = $("#summary");
      if (!dl) return;
      dl.innerHTML = "";
      zeilen().forEach(function (row) {
        var wrapEl = document.createElement("div");
        var dt = document.createElement("dt");
        var dd = document.createElement("dd");
        dt.textContent = row[0];
        dd.textContent = row[1];
        wrapEl.appendChild(dt);
        wrapEl.appendChild(dd);
        dl.appendChild(wrapEl);
      });
    }

    /* ---------- Absenden ---------- */
    function buildMail() {
      var lines = ["Finanzierungsanfrage über baufinanzierung.biz", ""];
      lines.push("— Vorhaben & Objekt —");
      zeilen().forEach(function (r) { lines.push(r[0] + ": " + r[1]); });
      lines.push("", "— Kontakt —");
      lines.push("Name: " + [textValue("anrede"), textValue("vorname"), textValue("nachname")].filter(Boolean).join(" "));
      lines.push("E-Mail: " + textValue("email"));
      lines.push("Telefon: " + textValue("telefon"));
      lines.push("Erreichbar: " + textValue("erreichbar"));
      lines.push("Rückruf gewünscht: " + (form.elements.rueckruf.checked ? "ja" : "nein"));
      if (textValue("nachricht")) lines.push("", "— Nachricht —", textValue("nachricht"));
      lines.push("", "Die Beispielrate ist unverbindlich und mit einem angenommenen Sollzins von " +
        fmtPct(ZINS_BEISPIEL) + " gerechnet.");
      return lines.join("\n");
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validateStep(current)) return;

      mailBody = buildMail();
      var betreff = "Finanzierungsanfrage: " + radioValue("vorhaben") + " – " +
        [textValue("vorname"), textValue("nachname")].filter(Boolean).join(" ");

      // Ohne Backend: vorbereitete E-Mail öffnen. Für den Live-Betrieb hier
      // stattdessen den Endpunkt des Formulardienstes bzw. PHP-Skripts ansprechen.
      window.location.href = "mailto:info@baufinanzierung.biz?subject=" +
        encodeURIComponent(betreff) + "&body=" + encodeURIComponent(mailBody);

      form.style.display = "none";
      var head = $(".progress-head");
      if (head) head.style.display = "none";
      if (doneEl) doneEl.classList.add("active");
      clearDraft();
      if (card) {
        var top = card.getBoundingClientRect().top + window.pageYOffset - 96;
        window.scrollTo({ top: top, behavior: reduce ? "auto" : "smooth" });
      }
    });

    var copyBtn = $("#copy-summary");
    if (copyBtn) {
      copyBtn.addEventListener("click", function () {
        var text = mailBody || buildMail();
        var done = function () {
          var label = copyBtn.lastChild;
          copyBtn.disabled = true;
          if (label) label.nodeValue = " Kopiert!";
          setTimeout(function () {
            copyBtn.disabled = false;
            if (label) label.nodeValue = " Angaben kopieren";
          }, 2200);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done, fallback);
        } else { fallback(); }
        function fallback() {
          var ta = document.createElement("textarea");
          ta.value = text;
          ta.setAttribute("readonly", "");
          ta.style.position = "fixed";
          ta.style.opacity = "0";
          document.body.appendChild(ta);
          ta.select();
          try { document.execCommand("copy"); done(); } catch (err) { /* stillschweigend */ }
          document.body.removeChild(ta);
        }
      });
    }

    /* ---------- Entwurf im Browser sichern ---------- */
    var note = $("#draft-note");

    function saveDraft() {
      try {
        var data = {};
        $$("input, select, textarea", form).forEach(function (el) {
          if (!el.name) return;
          if (el.type === "checkbox") { data[el.name] = el.checked; }
          else if (el.type === "radio") { if (el.checked) data[el.name] = el.value; }
          else { data[el.name] = el.value; }
        });
        delete data.datenschutz; // Einwilligung wird bewusst nicht gespeichert
        window.localStorage.setItem(STORE_KEY, JSON.stringify(data));
        if (note) note.hidden = false;
      } catch (err) { /* z. B. privater Modus – ohne Speicherung weiterarbeiten */ }
    }

    function loadDraft() {
      try {
        var raw = window.localStorage.getItem(STORE_KEY);
        if (!raw) return false;
        var data = JSON.parse(raw);
        Object.keys(data).forEach(function (name) {
          var el = form.elements[name];
          if (!el) return;
          if (el.length && el[0] && el[0].type === "radio") {
            $$('input[name="' + name + '"]', form).forEach(function (r) { r.checked = r.value === data[name]; });
          } else if (el.type === "checkbox") {
            el.checked = !!data[name];
          } else {
            el.value = data[name];
          }
        });
        if (note) note.hidden = false;
        return true;
      } catch (err) { return false; }
    }

    function clearDraft() {
      try { window.localStorage.removeItem(STORE_KEY); } catch (err) { /* egal */ }
      if (note) note.hidden = true;
    }

    var saveTimer;
    form.addEventListener("input", function () {
      clearTimeout(saveTimer);
      saveTimer = setTimeout(saveDraft, 600);
    });
    var clearBtn = $("#clear-draft");
    if (clearBtn) {
      clearBtn.addEventListener("click", function () {
        clearDraft();
        form.reset();
        updateFinanzierung();
        show(0, true);
      });
    }

    /* ---------- Vorbelegung aus der URL (?vorhaben=…&kaufpreis=…) ---------- */
    function applyParams() {
      if (!window.URLSearchParams) return;
      var p = new URLSearchParams(window.location.search);
      var alias = {
        kauf: "Immobilienkauf", neubau: "Neubau", anschluss: "Anschlussfinanzierung",
        modernisierung: "Modernisierung", kapitalanlage: "Kapitalanlage", umschuldung: "Umschuldung / Kapitalbeschaffung"
      };
      var v = p.get("vorhaben");
      if (v) {
        var wanted = alias[v.toLowerCase()] || v;
        $$('input[name="vorhaben"]', form).forEach(function (r) { r.checked = r.value === wanted; });
      }
      ["kaufpreis", "eigenkapital", "tilgung", "zinsbindung", "bundesland"].forEach(function (name) {
        var val = p.get(name);
        var el = form.elements[name];
        if (val && el) el.value = val;
      });
    }

    /* ---------- Start ---------- */
    loadDraft();
    applyParams();
    updateFinanzierung();
    show(0, false);
  }

  /* ========================================================================= */
  document.addEventListener("DOMContentLoaded", function () {
    initChrome();
    initReveal();
    initCounters();
    initRechner();
    initWizard();
  });
})();
