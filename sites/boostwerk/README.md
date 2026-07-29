# Boostwerk Köln – Website

Cineastische Einseiten-Website (SaaS-Landingpage-Stil) für die freie Kfz-Werkstatt
**Boostwerk Köln**, Pauline-Christmann-Straße 5, 51107 Köln-Ostheim.

## Dateien

| Datei | Inhalt |
|-------|--------|
| `index.html` | Startseite: Hero, Leistungen, Ablauf, Werkstatt, Rezensions-Wasserfall, Kontakt |
| `impressum.html` | Impressum – **Pflichtangaben noch einzutragen** |
| `datenschutz.html` | Datenschutzerklärung, passend zum tatsächlichen Stand der Seite |
| `styles.css` | Design-System + alle Animationen |
| `app.js` | Preloader, Reveals, Zähler, Tilt, Wasserfall, Formular, Cookie-Hinweis |
| `reviews.js` | **Datenquelle für die Rezensionen** – hier die echten Google-Texte eintragen |
| `img/` | Bilder + Favicon |

## ⚠️ Vor dem Livegang zu erledigen

Die Seite ist fertig gebaut, aber an fünf Stellen fehlen Angaben, die nur der
Betreiber liefern kann:

1. **Echte Google-Rezensionen** → `reviews.js`
   Aktuell stehen dort Platzhalter-Texte. Solange ein Eintrag das Feld
   `platzhalter: true` trägt, blendet die Seite über dem Wasserfall einen gelben
   Warnhinweis ein. Sind alle Einträge echt und das Feld überall entfernt,
   verschwindet der Hinweis automatisch.

2. **E-Mail-Adresse** → `app.js`, Funktion `form()`
   Dort steht `info@boostwerk-koeln.de` als **geratene** Adresse. Ohne Korrektur
   laufen alle Formular-Anfragen ins Leere. Die Adresse gehört außerdem ins
   Impressum und in die Datenschutzerklärung.

3. **Impressum** → `impressum.html`
   Alle mit `[…]` markierten Felder (Rechtsform, Inhaber, USt-IdNr., ggf.
   Registereintrag) sind Pflichtangaben nach § 5 DDG. Ein unvollständiges
   Impressum ist abmahnfähig.

4. **Hoster** → `datenschutz.html`, Abschnitt 4
   Name und Anschrift des Hosting-Anbieters eintragen.

5. **Angaben prüfen** – aus öffentlichen Verzeichnissen übernommen, nicht bestätigt:
   - Telefonnummern `0176 866 643 46` und `0155 633 100 06`
   - Öffnungszeiten Mo–Fr 9–18 Uhr, Sa 9–15 Uhr
     (eine zweite Quelle nannte Mo–Sa 8–18 Uhr – bitte festlegen)
   - Leistungen **Klimaservice**, **Achsvermessung** und **Fahrwerksumbau**
     ließen sich nicht belegen; falls nicht angeboten, die betreffenden Karten
     in `index.html` entfernen.

## Design

- **Stil:** dunkel, cineastisch – Nachtblau/Schwarz mit „Boost-Orange“ (#ff4d1c),
  abgeleitet aus dem Logo und dem Sonnenuntergang auf dem Hallenfoto.
- **Typografie:** Archivo (Überschriften, schwer & leicht kursiv wie das Logo) + Inter (Text).
- **Animationen:** Preloader, Ken-Burns-Hero mit Parallax und Lichtstreifen,
  Scroll-Fortschritt, mitschrumpfende Navbar, gestaffelte Reveals, Count-up-Zähler,
  Marken-Laufband, 3D-Tilt auf den Leistungskarten, wachsende Ablauf-Linie,
  animierte SVG-Hebebühne (Fahrzeug fährt beim Scrollen hoch) und der
  **Rezensions-Wasserfall**: drei Spalten, die unterschiedlich schnell laufen,
  Mitte gegenläufig, Pause bei Hover.
- `prefers-reduced-motion` wird respektiert – alle Bewegungen schalten sich dann ab.

## Bilder

Es lag nur **ein** Foto vor (Screenshot des Google-Profils). Daraus wurden
zugeschnitten und aufbereitet:

| Datei | Verwendung |
|-------|------------|
| `img/hero.jpg` | Hero – Halle im Abendlicht |
| `img/halle.jpg` | Abschnitt „Anfahrt“ |
| `img/logo.jpg` | Leuchtschild der Werkstatt, im Footer |
| `img/schild.jpg`, `img/banner.jpg` | Reserve, aktuell nicht eingebunden |
| `img/favicon.svg` | Browser-Icon (eigens erstellt) |

Weitere Bilder (z. B. Hebebühne, Werkstattinnenraum) konnten **nicht** aus dem
Internet beschafft werden – die Netzwerk-Policy dieser Umgebung blockiert
sämtliche externen Downloads. Statt Stockfotos wurde die Hebebühne deshalb als
animierte SVG-Grafik gebaut. Sobald echte Werkstattfotos vorliegen, lassen sie
sich in den Abschnitt „Werkstatt“ einsetzen und ersetzen die Illustration.

## Technik

- Reines HTML + CSS + Vanilla-JS, **kein Build-Schritt**, keine Abhängigkeiten.
- Responsiv (375 / 768 / 1024 / 1440 px), semantisches Markup, Fokuszustände,
  `AutoRepair`-Structured-Data für Google.
- Das Kontaktformular sendet nichts an einen Server, sondern öffnet eine
  vorausgefüllte E-Mail (`mailto:`). Für ein echtes Backend-Formular müsste die
  Datenschutzerklärung ergänzt werden.
- Karte über OpenStreetMap eingebunden (kein Google-Maps-Tracking).
- Schriften werden von Google Fonts geladen; für maximale Datensparsamkeit
  können sie lokal abgelegt werden (siehe Hinweis in `datenschutz.html`).

## Lokal testen

```bash
cd sites/boostwerk
python3 -m http.server 8000
# http://localhost:8000 öffnen
```

## Vercel

Eigenes Projekt mit **Root Directory** `sites/boostwerk`, Framework-Preset `Other`
(statisch, kein Build).
