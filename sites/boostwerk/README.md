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
| `fonts/` | Schriften lokal (Archivo, Inter) + Lizenztexte |

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

2. **E-Mail-Adresse und Formular-Versand** → `app.js`, oberhalb von `form()`
   Dort stehen zwei Werte:

   ```js
   var FORM_ENDPOINT = "";                          // URL des Formular-Dienstes
   var KONTAKT_MAIL  = "info@boostwerk-koeln.de";   // ⚠️ geraten, bitte ersetzen
   ```

   - `KONTAKT_MAIL` ist eine **geratene** Adresse. Ohne Korrektur laufen alle
     Anfragen ins Leere. Sie gehört außerdem ins Impressum und in die
     Datenschutzerklärung.
   - `FORM_ENDPOINT` leer heißt: das Formular öffnet ersatzweise das
     E-Mail-Programm des Besuchers. Das klappt nicht überall zuverlässig –
     auf dem Handy oft gar nicht. Sobald hier die URL eines Formular-Dienstes
     steht, wird die Anfrage direkt verschickt, ohne Seitenneuladen, mit
     Erfolgs- und Fehlermeldung im Formular.

   **Anbieter aussuchen:** Es sollte ein Dienst mit Servern in der EU sein, der
   einen Auftragsverarbeitungsvertrag (AVV) anbietet – sonst wird die
   Datenschutzerklärung komplizierter. Der Endpunkt muss ein JSON-`POST`
   entgegennehmen; das Formular schickt die Felder `name`, `telefon`, `email`,
   `fahrzeug`, `leistung`, `nachricht` und `_subject`. Vor der Entscheidung bitte
   beim Anbieter selbst nachlesen, wo tatsächlich gehostet wird und ob ein AVV
   bereitsteht – das ändert sich gelegentlich. Anschließend Name und Anschrift
   des Anbieters in `datenschutz.html`, Abschnitt 8 eintragen.

3. **Impressum** → `impressum.html`
   Alle mit `[…]` markierten Felder (Rechtsform, Inhaber, USt-IdNr., ggf.
   Registereintrag) sind Pflichtangaben nach § 5 DDG. Ein unvollständiges
   Impressum ist abmahnfähig.

4. **Hoster** → `datenschutz.html`, Abschnitt 4
   Name und Anschrift des Hosting-Anbieters eintragen. Der Betreiber muss mit
   dem Hoster außerdem einen Auftragsverarbeitungsvertrag abschließen – bei
   Vercel ist das ein Häkchen im Dashboard, bei deutschen Hostern meist ein PDF.

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

### Fotos austauschen

Alle Fotos liegen doppelt vor: als `.webp` (spart 18–39 %) und als `.jpg` für
den Rückfall. Eingebunden wird beides über `<picture>`. Zum Aufbereiten neuer
Fotos gibt es ein Werkzeug in der Repo-Wurzel:

```bash
# Neue Handyfotos als Galeriebilder aufbereiten (webp + jpg)
python3 tools/bilder.py ~/fotos/boostwerk --ziel sites/boostwerk/img/fotos

# Erst mal nur schauen, was passieren würde
python3 tools/bilder.py ~/fotos --ziel sites/boostwerk/img/fotos --probe

# Ein Bild als breites Foto-Band, mit festem Namen
python3 tools/bilder.py halle.jpg --ziel sites/boostwerk/img \
    --preset band --name halle-aussen
```

Das Werkzeug dreht Handyfotos richtig (EXIF), verkleinert auf die Zielbreite,
passt Kontrast und Sättigung leicht an das dunkle Layout an und schreibt beide
Formate. Presets: `hero` 1800 px, `band` 1600 px, `galerie` 1100 px,
`portraet` 900 px, `logo` 600 px. Mit `--zuschnitt 3:2` lässt sich ein
Seitenverhältnis erzwingen.

Behalten die neuen Dateien die bestehenden Namen, muss im HTML nichts geändert
werden – nur das gelbe `is-placeholder` am `<figure>` bzw. `<div class="band">`
entfernen.

### Wiederverwendung für andere Seiten

Die Originale in bester Auflösung liegen zentral unter
`assets/fotos/kfz-werkstatt/` in der Repo-Wurzel – nicht in diesem Seitenordner.
Für eine weitere Werkstatt-Seite von dort mit `tools/bilder.py` Kopien nach
`sites/<name>/img/` erzeugen und den Eintrag in `BILDNACHWEIS.md` ergänzen.

Achtung: `assets/` liegt außerhalb der Vercel-Root-Directory und wird deshalb
**nicht** mit ausgeliefert – das ist gewollt, die Originale sollen nicht öffentlich
abrufbar sein.

### Eigene Grafiken statt Fotos

Zwei Elemente sind gezeichnet und deshalb rechtlich unbedenklich sowie in jeder
Größe scharf:

- **Hebebühne** auf `index.html` und `werkstatt.html` – animiertes SVG, das
  Fahrzeug fährt beim Scrollen hoch. Bleibt auch sinnvoll, wenn echte Fotos
  dazukommen: ein Foto lässt sich nicht animieren.
- **Logo** im Footer – SVG-Symbol `#i-logo`, an das Werkstattschild angelehnt
  (Wortmarke in Archivo 900 kursiv, roter Schraubenschlüssel, Zahnrad,
  Fahrzeug-Silhouette). Ersetzt das alte `img/logo.jpg`, das im Footer schon
  sichtbar unscharf war. Die hellen Flächen nehmen `currentColor`, die
  Aussparungen die Variable `--logo-bg` – auf hellem Grund also einfach beides
  tauschen. `img/logo.jpg` bleibt als Referenz auf das echte Schild liegen, ist
  aber nicht mehr eingebunden.

Liegt irgendwann das Original-Logo als Vektordatei vor, kann das Symbol dagegen
ausgetauscht werden.

## Datenschutz-Technik

Drei Punkte, die bewusst so gebaut sind:

- **Schriften lokal.** Archivo und Inter liegen als Variable Fonts in `fonts/`
  und werden vom eigenen Server ausgeliefert – **keine Verbindung zu Google
  Fonts**. Das war der größte Abmahnpunkt (LG München, 2022). Die Seite lädt
  jetzt ohne einen einzigen externen Request. Zwei Dateien pro Familie, aufgeteilt
  nach `latin` und `latin-ext`; letzteres lädt nur, wenn Zeichen wie das „Š" in
  „Škoda" vorkommen. Lizenz: SIL OFL 1.1, Texte liegen in `fonts/` daneben.
- **Karte erst nach Klick.** Der OpenStreetMap-`iframe` steht nicht im HTML,
  sondern wird von `app.js` (`mapConsent()`) erst nach einem Klick auf
  „Karte laden" eingesetzt. Vorher verlässt keine IP-Adresse den Browser. Die
  Zustimmung wird lokal gemerkt (`localStorage`, Schlüssel `bw-map-ok`).
- **Kein Tracking, keine Cookies.** Im `localStorage` stehen nur zwei
  Ja/Nein-Werte: Cookie-Hinweis bestätigt und Karte freigegeben.

Ändert sich an einem dieser Punkte etwas, muss `datenschutz.html` mitgeändert
werden – die Abschnitte 5 bis 8 beschreiben genau diesen Stand.

## Technik

- Reines HTML + CSS + Vanilla-JS, **kein Build-Schritt**, keine Abhängigkeiten.
- Responsiv (375 / 768 / 1024 / 1440 px), semantisches Markup, Fokuszustände,
  `AutoRepair`-Structured-Data für Google.
- **Keine externen Requests** im Auslieferungszustand – geprüft im Browser.
- Kontaktformular: eigene Pflichtfeldprüfung mit Meldungen im Seitendesign,
  Honigtopf-Feld gegen Spam-Bots, Versand per `fetch` ohne Seitenneuladen,
  Erfolgs- und Fehlermeldung direkt im Formular. Ohne `FORM_ENDPOINT` greift der
  `mailto:`-Rückfall.
- Bilder als `<picture>` mit WebP und JPEG-Rückfall, `loading="lazy"`,
  `width`/`height` gesetzt (kein Layout-Springen beim Laden).

## Lokal testen

```bash
cd sites/boostwerk
python3 -m http.server 8000
# http://localhost:8000 öffnen
```

## Vercel

Eigenes Projekt mit **Root Directory** `sites/boostwerk`, Framework-Preset `Other`
(statisch, kein Build).
