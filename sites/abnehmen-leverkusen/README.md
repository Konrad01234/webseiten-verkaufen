# Abnehmen im Liegen Leverkusen – Website

Mehrseitige statische Website für das Studio **Abnehmen im Liegen Leverkusen**
(Inhaberin: Suzana Durakovic) in Leverkusen-Schlebusch.

## Seiten

| Datei | Inhalt |
|-------|--------|
| `index.html` | Startseite – Foto-Hero, Einstieg, Kennzahlen, Behandlungen, Ablauf, Ergebnis-Teaser, Rezensions-Wasserfall, Studio-Teaser, FAQ |
| `methode.html` | Wie Abnehmen im Liegen funktioniert: Prinzip, Ablauf in 6 Schritten, „was die Methode kann und was nicht", FAQ |
| `behandlungen.html` | MYA pro, EMShapeX, POWERchair, Spray Tanning, Ernährungsbegleitung, duraline, Preis-Info |
| `ergebnisse.html` | Vorher-Nachher-Galerie, Kennzahlen, alle Google-Rezensionen im Wasserfall |
| `studio.html` | Suzana Durakovic, Haltung des Studios, Team, Besuchs-Infos |
| `kontakt.html` | Terminanfrage-Formular, Adresse, Öffnungszeiten, Anfahrt, weitere Standorte |
| `impressum.html` | Impressum (§ 5 DDG) |
| `datenschutz.html` | Datenschutzerklärung |
| `styles.css` | Gemeinsames Stylesheet (Design-System) |
| `fonts.css` + `fonts/` | Lokal gehostete Schriften (Cormorant Garamond, Jost) |
| `app.js` | Navigation, Reveals, Wasserfall, Zähler, Formular, Cookie-Hinweis |
| `img/` | Studio-, Marken- und Vorher-Nachher-Bilder |
| `robots.txt`, `sitemap.xml` | SEO-Basis |

## Design

- **Stil:** hell, klar und ruhig – Off-White mit der Markenfarbe Violett/Lila
  (aus dem Logo abgeleitet: zwei überlappende Kreise). Cineastisch nur in Maßen:
  Foto-Hero mit langsamem Ken-Burns-Zoom und Verlauf, gestaffelte Scroll-Reveals,
  Scroll-Fortschrittsbalken, mitschrumpfende Navbar, sanfte Karten-Hover.
- **Typografie:** Cormorant Garamond (Überschriften) + Jost (Fließtext/UI).
- **Logo:** als Inline-SVG nachgebaut (skalierbar, scharf). Sobald die
  Original-Logodatei vorliegt, kann sie 1:1 ersetzt werden.
- **Responsiv:** geprüft bei 390 / 768 / 1024 / 1440 px, kein horizontaler Überlauf.
- **Barrierefreiheit:** semantisches Markup, sichtbare Fokuszustände,
  `aria`-Beschriftungen, ausreichende Kontraste, `prefers-reduced-motion` respektiert.

### Rezensions-Wasserfall

Der Bewertungsbereich (`.fall`) ist ein Wasserfall: drei Spalten, deren Karten
kontinuierlich **von oben nachfließen und unten ausgeblendet werden**.

- Umgesetzt über `@keyframes fall` (`translateY(-50%)` → `0`) plus eine
  `mask-image`-Blende oben und unten.
- `app.js` klont die Karten jeder Spalte einmal (`aria-hidden`), damit die
  Schleife nahtlos läuft; erst dann wird `.is-loop` gesetzt.
- Jede Spalte hat eine eigene Laufzeit (46 s / 60 s / 52 s), damit die Bewegung
  organisch wirkt.
- **Pause bei Hover und Tastaturfokus.**
- Ohne JavaScript: statische Liste. Bei `prefers-reduced-motion: reduce`:
  ruhiges Raster ohne Bewegung.
- Auf Tablets werden zwei, auf Smartphones eine Spalte angezeigt.

## Datenschutz (DSGVO)

Die Seite ist bewusst datensparsam gebaut:

- **Keine** Analyse- oder Tracking-Dienste (kein Google Analytics, kein Meta-Pixel).
- **Keine externen Requests im Betrieb** – die Schriften liegen unter `fonts/`
  lokal auf dem Server, nicht bei Google Fonts.
- **Keine eingebettete Google-Map**; stattdessen ein Textlink, der die Route
  erst nach aktivem Klick in Google Maps öffnet.
- **Keine Social-Media-Plugins**, nur einfache Textlinks.
- Das Terminformular sendet nichts an einen Server, sondern öffnet per `mailto:`
  eine vorausgefüllte E-Mail im Programm des Besuchers.
- Der Cookie-Hinweis ist reiner Informationstext; gespeichert wird nur ein
  `localStorage`-Eintrag, damit der Hinweis nicht erneut erscheint.

## SEO

- Eigene `<title>`- und Description-Texte pro Seite, Canonical-URLs, Open Graph.
- `LocalBusiness`-Markup (`HealthAndBeautyBusiness`) auf der Startseite mit
  Adresse, Telefon, Öffnungszeiten und Einzugsgebiet.
- `FAQPage`-Markup auf `methode.html`.
- Semantische Überschriftenhierarchie, sprechende Alt-Texte, `sitemap.xml`,
  `robots.txt` (Impressum und Datenschutz auf `noindex`).

## ⚠️ Vor dem Livegang zu klären

Die Inhalte wurden aus dem Google-Unternehmensprofil und öffentlichen Quellen
recherchiert. Folgende Punkte muss die Inhaberin bestätigen oder ergänzen:

1. **E-Mail-Adresse** – aktuell überall `info@abnehmenimliegen-lev.de` (angenommen,
   nicht verifiziert). Steht in `kontakt.html`, `impressum.html`, `datenschutz.html`,
   im Footer jeder Seite und in `app.js` (Empfänger der Terminanfrage).
2. **Öffnungszeiten** – hinterlegt sind Mo–Fr 08:30–20:00, Sa nach Vereinbarung.
3. **Umsatzsteuer-Identifikationsnummer** im Impressum (`[bitte ergänzen]`).
4. **Vorher-Nachher-Bilder** – es muss eine schriftliche Einwilligung der
   abgebildeten Personen vorliegen (Art. 6 Abs. 1 lit. a DSGVO, KUG).
   Impressum und Datenschutzerklärung setzen das bereits als gegeben voraus.
5. **Markenmotive** (`marke-team.jpg`, `myapro.jpg`) stammen aus dem Werbematerial
   des Franchisegebers – Freigabe einholen und möglichst die Originaldateien
   verwenden.
6. **Bildqualität** – alle Bilder wurden aus Handy-Screenshots des Google-Profils
   freigestellt. Originalfotos würden die Seite deutlich aufwerten.
7. **Preise** – bewusst keine Zahlen genannt, stattdessen Verweis auf die
   kostenlose Beratung. Falls Festpreise gewünscht sind, ergänzen.
8. **Domain** – Canonical-URLs und `sitemap.xml` zeigen auf
   `https://www.abnehmenimliegen-lev.de/`. Bei anderer Domain anpassen.

Werbeaussagen sind bewusst zurückhaltend formuliert (HWG/UWG): keine
Heilversprechen, keine garantierten Zentimeter-Angaben, überall der Hinweis auf
individuell verschiedene Ergebnisse.

## Lokal testen

```bash
cd sites/abnehmen-leverkusen
python3 -m http.server 8000
# http://localhost:8000 öffnen
```

## Vercel

Eigenes Projekt mit **Root Directory** `sites/abnehmen-leverkusen`,
Framework-Preset `Other` (statisch, kein Build-Schritt).

## Hinweis zur Wartung

Kopf- und Fußbereich sind in jeder HTML-Datei ausgeschrieben (kein Build-Schritt,
wie im Rest des Repos). Änderungen an Navigation, Footer oder Kontaktdaten müssen
daher in **allen acht** HTML-Dateien nachgezogen werden.
