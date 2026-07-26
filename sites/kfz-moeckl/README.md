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
- **Fotos:** sieben generische Werkstatt-Stockfotos (siehe „Bildnachweis").
  Sie stehen im Hero (Ken-Burns-Zoom hinter blauer Abdunklung), als Panel auf fünf
  Leistungsseiten, auf der Gebrauchtwagenseite und im Foto-Laufband „Aus der
  Werkstatt" auf der Startseite. Wo kein passendes Foto vorliegt (HU/AU, Über uns),
  stehen weiterhin gestaltete Blueprint-Grafiken (SVG) im
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

## Bildnachweis

Die sieben Fotos in `img/` sind generische Werkstatt-Stockfotos und wurden aus
`sites/a-plus-s-autoservice/img/` übernommen (Branch `claude/session-5zxhau`):

| Datei | Quelle | Motiv | Auflösung |
|-------|--------|-------|-----------|
| `motor.jpg` | `stock_engine.jpg` | Zylinderkopf mit Ventilfedern | 1600 × 1063 |
| `bremse.jpg` | `work_brake.jpg` | Bremssattel und Bremsscheibe | 554 × 307 |
| `reifen.jpg` | `work_tyre.jpg` | Reifen und Radhaus von unten | 559 × 608 |
| `fahrwerk.jpg` | `work_strut.jpg` | Federbein / Stoßdämpfer | 554 × 626 |
| `diagnose.jpg` | `work_module.jpg` | Elektronisches Steuermodul | 554 × 690 |
| `politur.jpg` | `gal_detail.jpg` | Eingeschäumte Heckpartie | 497 × 480 |
| `felge.jpg` | `gal_wheels.jpg` | Eingeschäumte Felge | 318 × 480 |

Alle sieben zeigen **keine Firmenschilder, keine Kennzeichen und keine
erkennbaren Personen** – deshalb sind sie hier unbedenklich einsetzbar.

**Bewusst NICHT übernommen** wurden Fotos, die fremde Betriebe zeigen: die
Aufnahmen von `sites/ramona-daurelio/` (Fassade, Halle, Empfang, Tresen – das
Schild „Karosserie + Lack D'Aurelio" ist lesbar), von `sites/mamand-motors/`
(Werkstattschild und Kennzeichen erkennbar), von `sites/af-automobile/` sowie
`a-plus-s-autoservice/img/building.jpg`. Sie würden Kunden eine fremde Werkstatt
als die von Kfz-Möckl präsentieren.

Ebenfalls nicht verwendbar: die fünf Dateien `sites/ramona-daurelio/img/stock-*.jpg`.
Das sind **keine Fotos**, sondern gestaltete Platzhalterbilder mit der Aufschrift
„Platzhalter · Stockfoto einsetzen" – dort wurden die Stockfotos nie beschafft.

## ⚠️ Offene Punkte vor der Veröffentlichung

1. **Öffnungszeiten** sind eine plausible Annahme (`Mo–Do 08:00–17:30`,
   `Fr 08:00–16:00`, `Sa nach Vereinbarung`, `So geschlossen`). Google nennt
   keine Zeiten. Bitte bestätigen bzw. korrigieren → `HOURS` in `build.py`.
2. **Impressum:** `HRB-Nummer`, `USt-IdNr.` und die Angaben zur berufsbezogenen
   Haftpflichtversicherung sind als `[bitte ergänzen]` markiert. Für eine GmbH
   sind Registergericht und Registernummer **gesetzlich verpflichtend**.
3. **Datenschutz:** Name und Anschrift des Hosting-Anbieters ergänzen (Ziffer 4).
4. **Eigene Fotos** wären trotz der Stockfotos deutlich besser. Zwei Punkte:
   - Die **blau-gelb bemalte Fassade** an der Ulmer Straße ist ein starkes
     Wiedererkennungsmerkmal und gehört eigentlich in den Hero. Die vorhandenen
     Google-Maps-Screenshots sind dafür nicht nutzbar (Urheberrecht Dritter,
     zu geringe Auflösung).
   - Sechs der sieben Stockfotos haben nur **300–690 px Kantenlänge**. Auf
     Retina-Displays wirken sie leicht unscharf. Zum Austauschen genügt es, die
     Dateien in `img/` unter gleichem Namen zu überschreiben – am HTML muss
     nichts geändert werden. Die `width`/`height`-Angaben liegen in `build.py`
     im Dict `PHOTOS` und sollten mitgepflegt werden.
   - Es fehlen noch Team- und Hallenaufnahmen sowie Fotos für HU/AU.
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
