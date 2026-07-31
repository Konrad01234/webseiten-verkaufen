# Typgerechte Ernährung – Website

Mehrseitige statische Website für die Ernährungsberatung **Typgerechte Ernährung**
(Horisan Metabolic Typing®, alternativernaehren.de).

## Seiten

| Datei | Inhalt |
|-------|--------|
| `index.html` | Startseite – Hero, Zahlen, Grundgedanke, Ablauf, Verträglichkeit, Typen, FAQ |
| `methode.html` | Horisan Metabolic Typing®: was es ist, wie getestet wird, Ablauf in 5 Schritten |
| `stoffwechseltypen.html` | Herkunft (Pottenger / Dr. Kelley), die drei Ebenen, alle zehn Typen |
| `vertraeglichkeit.html` | Verträglichkeitstests, Ergebnisse, FAQ |
| `vita.html` | Werdegang, Ausbildungen, Arbeitsweise |
| `kontakt.html` | Kontaktdaten und Anfrageformular |
| `impressum.html` | Impressum (Gerüst – Angaben ergänzen) |
| `datenschutz.html` | Datenschutzerklärung (Gerüst – vor Veröffentlichung prüfen) |
| `styles.css` | Gemeinsames Stylesheet (Design-System) |
| `app.js` | Navigation, Reveals, Zähler, Akkordeon, Formular |

## Design

- **Stil:** hell, natürlich, ruhig – Waldgrün (`#16302a` / `#3a6f57`) mit Salbei- und Sand-Tönen,
  Ton-Akzent (`#bd7549`) für Hinweise.
- **Typografie:** Fraunces (Überschriften) + Inter (Text), über Google Fonts eingebunden.
- **Bilder:** bewusst keine – die Seite arbeitet mit SVG-Illustrationen, weichen Farbverläufen
  und Typografie. Sie ist damit vollständig eigenständig, ohne fremdes Bildmaterial.
- **Animationen:** Scroll-Fortschrittsbalken, mitschrumpfende Navigation, gestaffelte Reveals,
  hochzählende Zahlen, Parallax auf den Blatt-Grafiken, Karten-Hover, Akkordeon.
  Respektiert `prefers-reduced-motion`.
- **Kein Cookie-Banner**, weil die Seite keine Cookies setzt und nicht trackt.

## Technik

- Reines HTML + CSS + Vanilla-JS, **kein Build-Schritt**.
- Responsiv geprüft bei 390 / 768 / 1024 / 1440 px, kein horizontales Scrollen.
- Semantisches Markup, Skip-Link, Fokuszustände, `aria-expanded` an Navigation und Akkordeon.
- Das Kontaktformular sendet **nichts an den Server**: es baut im Browser eine
  vorausgefüllte E-Mail (`mailto:`) und öffnet das E-Mail-Programm.

## Vor der Veröffentlichung ergänzen

Die Live-Seite alternativernaehren.de war beim Erstellen technisch nicht abrufbar (403), die
Inhalte stammen daher aus den öffentlich indexierten Seitentexten. Folgende Angaben fehlen und
sind im Markup als `<span class="placeholder">` (farbig hervorgehoben) markiert:

- [ ] **Name der Beraterin / Firmierung** – Impressum, Datenschutz
- [ ] **Anschrift / Beratungsort** – Impressum, Datenschutz, `kontakt.html`
- [ ] **Telefonnummer** – Impressum, `kontakt.html`, ggf. Topbar
- [ ] **E-Mail-Adresse** – aktuell durchgängig `info@alternativernaehren.de` (bitte prüfen);
      steht in `index.html` (Topbar/Footer), `kontakt.html` (Formular-Attribut `data-mailto`) und
      in beiden Rechtstexten
- [ ] **USt-IdNr. bzw. Kleinunternehmerhinweis** und **Berufsbezeichnung** – Impressum
- [ ] **Hoster** – Datenschutzerklärung
- [ ] Preise / Dauer der Analyse, falls sie genannt werden sollen

Suche nach `placeholder` findet alle Stellen:

```bash
grep -rn 'class="placeholder"' sites/typgerechte-ernaehrung
```

### Empfehlung: Schriften lokal einbinden

`styles.css` lädt Fraunces und Inter per `@import` von Google Fonts. Dabei wird die IP-Adresse der
Besucher an Google übertragen – deshalb ist dafür ein eigener Abschnitt in der Datenschutzerklärung
enthalten. Werden die Schriftdateien stattdessen mitgeliefert und per `@font-face` eingebunden,
kann Abschnitt 6 der Datenschutzerklärung ersatzlos entfallen.

### Rechtstexte

Impressum und Datenschutzerklärung sind ein sauber strukturiertes Gerüst nach aktuellem Muster
(DDG, MStV, DSGVO), **keine Rechtsberatung**. Sie sind zu vervollständigen und vor der
Veröffentlichung zu prüfen.

## Inhaltlicher Hinweis

Auf allen Inhaltsseiten steht der Hinweis, dass Metabolic Typing auf einem alternativmedizinischen
Ansatz beruht, wissenschaftlich nicht belegt ist und keinen Arztbesuch ersetzt – so wie es die
bestehende Seite ebenfalls handhabt. Dieser Hinweis sollte erhalten bleiben.

## Lokal testen

```bash
cd sites/typgerechte-ernaehrung
python3 -m http.server 8000
# http://localhost:8000 öffnen
```

## Vercel

Eigenes Projekt mit **Root Directory** `sites/typgerechte-ernaehrung`, Framework-Preset `Other`
(statisch, kein Build).
