# Kfz-Möckl GmbH – Website

Mehrseitige statische Website für die **Kfz-Möckl GmbH**, Kfz-Meisterbetrieb in
Augsburg-Kriegshaber (Ulmer Str. 55).

## Seiten (14)

| Datei | Inhalt |
|-------|--------|
| `index.html` | Startseite – Hero mit Blueprint-Animation, Bewertungs-Laufband, Leistungen, Kennzahlen, Ablauf in 4 Schritten, Kundenstimmen, Gebrauchtwagen-Teaser |
| `leistungen.html` | Übersicht aller Leistungen + „was immer dazugehört" + FAQ |
| `hu-au.html` | HU & AU inkl. Vorabcheck |
| `inspektion.html` | Inspektion & Ölwechsel |
| `bremsen.html` | Bremsanlage |
| `reifen.html` | Reifen & Räder, RDKS, Einlagerung |
| `fahrwerk.html` | Fahrwerk & Lenkung |
| `reparatur.html` | Reparatur & Diagnose |
| `gebrauchtwagen.html` | Fahrzeugverkauf aus eigener Werkstatt |
| `ueber-uns.html` | Betrieb, Werte, Standort |
| `bewertungen.html` | Alle 19 Google-Rezensionen im Original |
| `kontakt.html` | Kontakt, Öffnungszeiten, Anfahrt, Terminanfrage |
| `impressum.html` | Impressum |
| `datenschutz.html` | Datenschutzerklärung |
| `styles.css` | Gemeinsames Design-System |
| `app.js` | Navigation, Animationen, Terminformular, Cookie-Hinweis |
| `build.py` | Seiten-Generator (siehe unten) |

Jede Leistung hat eine eigene Unterseite mit Leistungsumfang, typischen Anzeichen,
FAQ und Querverweisen – kein One-Pager.

## Design

- **Farbwelt:** direkt von der Werkstatt abgeleitet. Die Halle an der Ulmer Straße
  ist blau-gelb bemalt, der Schriftzug „KFZ MÖCKL Meisterbetrieb" ist blau auf weiß.
  Daraus: dunkles Marineblau (`#04101f`–`#1f5c9e`) mit Signalgelb (`#ffc61a`).
- **Typografie:** Archivo (Überschriften, 800/900, technisch) + Inter (Text).
- **Animationen (cineastisch):** Preloader, wandernder Verlauf im Hero mit
  technischem Raster und Lichtstreifen, ein Blueprint-Auto das sich per
  `stroke-dashoffset` selbst zeichnet, Parallax, Scroll-Fortschrittsbalken,
  mitschrumpfende Navbar, gestaffelte Reveals, Zähler, Laufband mit
  Bewertungszitaten, animierte Ablauf-Timeline, Button-Sheen, Karten-Hover.
  Respektiert `prefers-reduced-motion` vollständig.
- **Statt Fotos:** Es liegt kein eigenes Bildmaterial vor (siehe „Offene Punkte").
  Als Platzhalter dienen bewusst gestaltete Blueprint-Grafiken (SVG) im
  Konstruktionszeichnungs-Stil – kein „fehlendes Bild"-Eindruck.

## Inhalte / Quellen

Alle Fakten stammen aus dem Google-Unternehmensprofil der Kfz-Möckl GmbH
(Stand Juli 2026), das der Inhaber als Screenshots bereitgestellt hat:

- **Stammdaten:** Ulmer Str. 55, 86156 Augsburg-Kriegshaber · 0821 4444242 ·
  kfz-moeckl@web.de
- **Leistungen laut Google:** Bremsen, Ölwechsel, Reparatur von Lenkungs- und
  Fahrwerksteilen, Reifen. Ergänzt um Leistungen, die in den Rezensionen
  ausdrücklich genannt werden: HU/TÜV, Inspektion, Kupplungswechsel,
  Diagnose/Sensorik, Marderschäden, Gebrauchtwagenverkauf.
- **19 Rezensionen** im Wortlaut übernommen (offensichtliche Tippfehler still
  korrigiert, sehr lange Beiträge gekürzt). 18 davon mit 5 Sternen.
- **Geschäftsführer** Stefan Möckl – aus einer Rezension abgeleitet
  („Ich habe bei Stefan Möckl ein Auto gekauft"), bitte bestätigen.

Alle Aussagen der Website (Kostenklarheit, keine Reparatur ohne Zustimmung,
Termin oft am selben Tag) sind aus diesen Rezensionen belegt – es wurden keine
Auszeichnungen, Zertifikate oder Zahlen erfunden.

## ⚠️ Offene Punkte vor der Veröffentlichung

1. **Öffnungszeiten** sind eine plausible Annahme (`Mo–Do 08:00–17:30`,
   `Fr 08:00–16:00`, `Sa nach Vereinbarung`, `So geschlossen`). Google nennt
   keine Zeiten. Bitte bestätigen bzw. korrigieren → `HOURS` in `build.py`.
2. **Impressum:** `HRB-Nummer`, `USt-IdNr.` und die Angaben zur berufsbezogenen
   Haftpflichtversicherung sind als `[bitte ergänzen]` markiert. Für eine GmbH
   sind Registergericht und Registernummer **gesetzlich verpflichtend**.
3. **Datenschutz:** Name und Anschrift des Hosting-Anbieters ergänzen (Ziffer 4).
4. **Fotos:** Echte Bilder von Werkstatt, Halle, Team und Fahrzeugen fehlen. Die
   blau-gelb bemalte Fassade ist ein starkes Wiedererkennungsmerkmal und sollte
   im Hero verwendet werden. Die vorhandenen Google-Maps-Screenshots sind dafür
   nicht nutzbar (Urheberrecht Dritter, zu geringe Auflösung).
5. **Logo:** Es liegt keine Logodatei vor. Aktuell steht ein selbst gebautes
   Wortmarken-Signet („M" auf blauem Rundquadrat) in Nav, Footer und als Favicon.
6. **Google Fonts** werden von Google-Servern geladen (in der
   Datenschutzerklärung, Ziffer 6, offengelegt). Datenschutzfreundlicher wäre
   lokales Hosting der Schriftdateien – dann Ziffer 6 streichen.

## Technik

- Reines HTML + CSS + Vanilla-JS, **kein Build-Schritt beim Deploy**.
- Responsiv geprüft (390 / 760 / 960 / 1440 px), semantisches Markup,
  Fokus-Zustände, ausreichende Kontraste, `aria`-Attribute an Navigation,
  Dialog und Formular.
- Das Terminformular erzeugt ohne Backend eine vorausgefüllte E-Mail (`mailto:`) –
  es werden keine Daten an Dritte übertragen.
- Kein Tracking, keine Werbe-Cookies, keine eingebetteten Karten oder Videos.
  Der Cookie-Hinweis merkt sich die Auswahl in `localStorage`.

### Seiten-Generator `build.py`

Damit Navigation, Footer, `<head>` und Cookie-Banner über alle 14 Seiten
identisch bleiben, werden die HTML-Dateien generiert:

```bash
cd sites/kfz-moeckl
python3 build.py        # schreibt alle 14 .html-Dateien neu
```

**Inhalte werden in `build.py` bearbeitet, nicht direkt im HTML** – sonst gehen
Änderungen beim nächsten Lauf verloren. `styles.css` und `app.js` werden nicht
generiert und können direkt bearbeitet werden.

## Lokal testen

```bash
cd sites/kfz-moeckl
python3 -m http.server 8000
# http://localhost:8000 öffnen
```

## Vercel

Eigenes Projekt mit **Root Directory** `sites/kfz-moeckl`, Framework-Preset
`Other` (statisch, kein Build).
