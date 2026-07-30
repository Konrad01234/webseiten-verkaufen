# Boostwerk Köln – Website

Cineastische, mehrseitige Website im SaaS-Landingpage-Stil für die freie Kfz-Werkstatt
**Boostwerk Köln**, Pauline-Christmann-Straße 5, 51107 Köln-Ostheim.

## Seiten

| Datei | Inhalt |
|-------|--------|
| `index.html` | Startseite – Hero, vier Leistungen als Auszug, Werkstatt-Teaser, Ablauf, Rezensions-Wasserfall (Kurzfassung) |
| `leistungen.html` | Alle acht Leistungen im Detail, Ablauf in drei Schritten, häufige Fragen (Akkordeon) |
| `werkstatt.html` | Über die Werkstatt, animierte Hebebühne, vier Versprechen, Anfahrt mit Foto und Karte |
| `rezensionen.html` | Google-Bewertung und der vollständige Rezensions-Wasserfall |
| `kontakt.html` | Kontaktdaten, Öffnungszeiten, Karte und Anfrageformular |
| `impressum.html` | Impressum – **Pflichtangaben noch einzutragen** |
| `datenschutz.html` | Datenschutzerklärung, passend zum tatsächlichen Stand der Seite |
| `styles.css` | Design-System + alle Animationen (gemeinsam für alle Seiten) |
| `app.js` | Preloader, Reveals, Zähler, Tilt, Wasserfall, FAQ, Formular, Cookie-Hinweis |
| `reviews.js` | **Datenquelle für die Rezensionen** – hier die echten Google-Texte eintragen |
| `img/` | Bilder + Favicon |

Alle Seiten teilen sich Kopfleiste, Navigation, Footer und das SVG-Icon-Set. Wird dort
etwas geändert (z. B. eine neue Telefonnummer), muss die Änderung in allen HTML-Dateien
nachgezogen werden – die Seiten sind bewusst reines HTML ohne Build-Schritt.
Der aktive Menüpunkt wird pro Seite über `class="active"` gesetzt.

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

5. **Galerie-Fotos ersetzen oder lizenzieren** → `img/fotos/`
   Die acht Fotos in den Galerien und Bildbändern sind fremde Stockfotos mit
   ungeklärter Lizenz und auf der Seite gelb markiert. Details und Alternativen:
   `assets/fotos/BILDNACHWEIS.md`.

6. **Angaben prüfen** – aus öffentlichen Verzeichnissen übernommen, nicht bestätigt:
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
- **Animationen:** Preloader (nur Startseite), Ken-Burns-Hero mit Parallax und
  Lichtstreifen, Scroll-Fortschritt, mitschrumpfende Navbar, gestaffelte Reveals,
  Count-up-Zähler, Marken-Laufband, 3D-Tilt auf den Leistungskarten, wachsende
  Ablauf-Linie, FAQ-Akkordeon (es bleibt immer nur eine Antwort offen),
  animierte SVG-Hebebühne (Fahrzeug fährt beim Scrollen hoch) und der
  **Rezensions-Wasserfall**: drei Spalten, die unterschiedlich schnell laufen,
  Mitte gegenläufig, Pause bei Hover.
- Die Unterseiten bekommen statt des großen Heros einen kompakten Seitenkopf
  (`.page-hero`) mit Brotkrumen-Navigation.
- `prefers-reduced-motion` wird respektiert – alle Bewegungen schalten sich dann ab.

## Bilder

### Echte Fotos der Werkstatt (Status: in Ordnung)

Aus dem einen vorliegenden Foto (Screenshot des Google-Profils) zugeschnitten:

| Datei | Verwendung |
|-------|------------|
| `img/hero.jpg` | Hero der Startseite + Seitenköpfe der Unterseiten |
| `img/halle.jpg` | Abschnitt „Anfahrt“ auf `werkstatt.html` |
| `img/logo.jpg` | Leuchtschild der Werkstatt, im Footer |
| `img/schild.jpg`, `img/banner.jpg` | Reserve, aktuell nicht eingebunden |
| `img/favicon.svg` | Browser-Icon (eigens erstellt) |

### ⚠️ Galerie-Fotos (Status: Platzhalter, Lizenz ungeklärt)

Unter `img/fotos/` liegen acht Werkstattfotos, die in den Galerien und
Bildbändern verwendet werden. Es sind **fremde Stock- und Pressefotos**, keine
Bilder von Boostwerk Köln – teils waren die Quellen noch im Screenshot sichtbar
(`kerridgecs.com`, `smogtechinstitute.com`, `nzherald.co.nz`).

Sie sind eingebaut, damit das Layout beurteilt werden kann, und tragen auf der
Seite ein gelbes Label **„Platzhalter · Lizenz klären“**. Vor dem Livegang
müssen sie ersetzt oder lizenziert werden. Zum Entfernen des Labels einfach die
CSS-Klasse `is-placeholder` am jeweiligen `<figure class="shot">` bzw.
`<div class="band">` löschen.

Vollständige Herkunftsliste und die Wege zu rechtssicheren Fotos:
**`assets/fotos/BILDNACHWEIS.md`** (Repo-Wurzel).

| Datei in `img/fotos/` | Eingesetzt auf |
|-----------------------|----------------|
| `hebebuehnen-halle.jpg` | `index.html` (Einblick), `werkstatt.html` (Rundgang) |
| `werkzeugwand.jpg` | `index.html`, `werkstatt.html` |
| `motor-arbeit.jpg` | `index.html`, `werkstatt.html` |
| `diagnose-tablet.jpg` | `index.html` |
| `diagnose-station.jpg` | `werkstatt.html` |
| `motorraum.jpg` | `werkstatt.html` |
| `diagnose-laptop.jpg` | `werkstatt.html`, Foto-Band `leistungen.html` |
| `werkzeugwand-detail.jpg` | Foto-Band `werkstatt.html` |

### Wiederverwendung für andere Seiten

Die Originale in bester Auflösung liegen zentral unter
`assets/fotos/kfz-werkstatt/` in der Repo-Wurzel – nicht in diesem Seitenordner.
Für eine weitere Werkstatt-Seite also von dort eine verkleinerte Kopie nach
`sites/<name>/img/` legen (Web-Versionen hier: 1100 px breit, JPEG Q82,
progressiv) und den Eintrag in `BILDNACHWEIS.md` ergänzen.

Achtung: `assets/` liegt außerhalb der Vercel-Root-Directory und wird deshalb
**nicht** mit ausgeliefert – das ist gewollt, die Originale sollen nicht öffentlich
abrufbar sein.

### Hebebühne als SVG

Die animierte Hebebühne auf `index.html` und `werkstatt.html` ist eine eigens
gezeichnete SVG-Grafik (Fahrzeug fährt beim Scrollen hoch). Sie bleibt auch dann
sinnvoll, wenn echte Fotos dazukommen – anders als ein Foto lässt sie sich
animieren und ist rechtlich unbedenklich.

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
