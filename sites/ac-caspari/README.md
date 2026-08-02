# AC Caspari – Website

Mehrseitige Website für den freien Kfz-Meisterbetrieb **AC Caspari**,
Alter Uentroper Weg 189, 59071 Hamm-Werries.

Reines HTML, CSS und Vanilla-JS. **Kein Build-Schritt, keine Abhängigkeiten,
keine externen Requests** im Auslieferungszustand.

## Seiten

| Datei | Inhalt |
|-------|--------|
| `index.html` | Startseite – Hero, Kennzahlen, Marken-Laufband, sechs Leistungen, animierter Fahrzeug-Check, Werkstatt-Einblick, Ablauf, Rezensions-Wasserfall (Kurzfassung), Foto-Band, Öffnungszeiten |
| `leistungen.html` | Alle zehn Leistungen im Detail, Ablauf in drei Schritten, sechs häufige Fragen (Akkordeon) |
| `werkstatt.html` | Selbstverständnis, vier Versprechen, Rundgang, Fahrzeug-Check, Anfahrt mit Zwei-Klick-Karte |
| `rezensionen.html` | Vollständiger Rezensions-Wasserfall, Gesamtnote, Aufruf zur eigenen Rezension |
| `kontakt.html` | Kontaktdaten, Öffnungszeiten, Karte, Anfrageformular |
| `impressum.html` | Impressum – **Pflichtangaben noch einzutragen** |
| `datenschutz.html` | Datenschutzerklärung, passend zum tatsächlichen Stand der Seite |
| `styles.css` | Design-System + alle Animationen (gemeinsam für alle Seiten) |
| `app.js` | Seitenübergang, Reveals, Zähler, Parallax, Wasserfall, FAQ, Karte, Formular, Cookie-Hinweis |
| `reviews.js` | **Datenquelle für die Rezensionen** – hier die echten Google-Texte eintragen |
| `build-shared.py` | Entwicklungswerkzeug: verteilt Kopfleiste, Fußzeile und Icon-Set auf alle Seiten |
| `img/`, `fonts/` | Bilder, Favicon, Schriften |

### Kopfleiste und Fußzeile ändern

Die Seiten sind bewusst reines HTML – ausgeliefert wird genau das, was in den
Dateien steht. Kopfleiste, Fußzeile und Icon-Set stehen deshalb in jeder Datei,
werden aber nicht von Hand gepflegt:

```bash
# 1. index.html anpassen (das ist die Vorlage)
# 2. auf die übrigen Seiten verteilen:
python3 build-shared.py
# vorher nur schauen, was passieren würde:
python3 build-shared.py --probe
```

Das Skript ersetzt ausschließlich, was zwischen den Marker-Paaren
`<!--@NAV:…-->…<!--@/NAV-->`, `<!--@FOOT-->…<!--@/FOOT-->` und
`<!--@SPRITE-->…<!--@/SPRITE-->` steht, und setzt `class="active"` auf den
richtigen Menüpunkt. Der Seiteninhalt dazwischen bleibt unangetastet; zur
Sicherheit bricht das Skript ab, falls eine Seite ihr `<main>` verlieren würde.

---

## ⚠️ Vor dem Livegang zu erledigen

Die Seite ist fertig gebaut. An diesen Stellen fehlen Angaben, die nur der
Betreiber liefern kann – bitte der Reihe nach abarbeiten.

### 1. Echte Rezensionen → `reviews.js`

Aktuell stehen dort **Platzhalter**. Die Google-Maps-Rezensionen ließen sich
technisch nicht auslesen: sämtliche Branchenportale (golocal, gelbeseiten,
11880, GoYellow, Das Örtliche, autoplenum, Yelp) sperren den automatisierten
Abruf mit HTTP 403.

Solange ein Eintrag das Feld `platzhalter: true` trägt, blendet die Seite über
dem Wasserfall einen gelben Warnkasten ein. Sind alle Einträge echt und das
Feld überall entfernt, verschwindet der Hinweis automatisch.

> **Wichtig, nicht übersehen:** In den Verzeichnissen stehen für diesen Betrieb
> **gemischte** Bewertungen, nicht nur Lob:
>
> | Portal | Note |
> |--------|------|
> | golocal | 3,5 / 5 bei 7 Bewertungen |
> | 11880 | 4,0 / 5 bei 4 Bewertungen |
> | autoplenum | 2,4 / 5 |
>
> Positiv genannt wurden „schnell, kompetent, freundlich, günstig“, kurzfristige
> Termine, eine BMW-Inspektion mit bereitliegenden Teilen in zwei Stunden sowie
> „Top Preise und sympathisches Team“. Kritisch genannt wurden „Viel versprochen,
> viel Geld bezahlt, Schaden besteht weiterhin“ und eine abgelehnte
> Drosselklappen-Reparatur.
>
> Die Platzhalter sind deshalb bewusst **nicht** alle fünfsternig. Fünfzehn
> Bestnoten auf der Seite, während Google ein anderes Bild zeigt, fällt auf und
> schadet mehr, als es nützt.

Die Gesamtnote steht in `GOOGLE_RATING`. Solange dort `unbestaetigt: true`
steht, zeigt die Seite **keine Zahl**, sondern einen neutralen Hinweis – lieber
gar keine Note als eine erfundene. Nach dem Eintragen der echten Werte das Feld
löschen, dann erscheint der Kasten mit hochlaufender Zahl.

### 2. E-Mail-Adresse und Formular-Versand → `app.js`

Oberhalb von `form()` stehen zwei Werte:

```js
var FORM_ENDPOINT = "";      // URL des Formular-Dienstes
var KONTAKT_MAIL  = "";      // ⚠️ noch unbekannt
```

- **`KONTAKT_MAIL` ist leer.** Eine E-Mail-Adresse ließ sich nicht belegen; in
  den Verzeichnissen war sie durchgehend maskiert. Sie wurde bewusst **nicht
  geraten** – eine falsche Adresse im Impressum ist schlimmer als gar keine.
  Solange das Feld leer ist, weist das Formular beim Absenden freundlich auf die
  Telefonnummer hin, statt ins Leere zu laufen. Die Adresse gehört außerdem ins
  Impressum und in die Datenschutzerklärung.
- **`FORM_ENDPOINT` leer** heißt: Rückfall auf das E-Mail-Programm des Besuchers
  (`mailto:`), sobald `KONTAKT_MAIL` gesetzt ist. Das klappt auf dem Handy oft
  nicht zuverlässig. Steht hier die URL eines Formular-Dienstes, wird die
  Anfrage direkt verschickt, ohne Seitenneuladen, mit Erfolgs- und Fehlermeldung
  im Formular.

  **Anbieter aussuchen:** möglichst mit Servern in der EU und mit
  Auftragsverarbeitungsvertrag (AVV) – sonst wird die Datenschutzerklärung
  komplizierter. Der Endpunkt muss ein JSON-`POST` entgegennehmen; gesendet
  werden `name`, `telefon`, `email`, `fahrzeug`, `leistung`, `nachricht` und
  `_subject`. Vor der Entscheidung beim Anbieter selbst nachlesen, wo gehostet
  wird und ob ein AVV bereitsteht – das ändert sich gelegentlich. Anschließend
  Name und Anschrift in `datenschutz.html`, Abschnitt 8 eintragen.

### 3. Impressum → `impressum.html`

Alle mit `[…]` markierten Felder sind Pflichtangaben nach § 5 DDG. Ein
unvollständiges Impressum ist abmahnfähig.

**Besonders zu klären ist die Rechtsform.** Die Recherche ergibt zwei parallele
Bilder:

- Die **CASPARI Kfz-Werkstatt UG (haftungsbeschränkt)**, Amtsgericht Hamm
  HRB 8136, Stammkapital 1.000 €, Geschäftsführer seit 14.04.2015 Falk Caspari –
  in öffentlichen Registerauskünften inzwischen als **gelöscht** ausgewiesen
  (Stand der Auskunft: 22.08.2024).
- Parallel wird der Betrieb als **Auto Check Falk Caspari KFZ-Meisterbetrieb**
  geführt, was auf ein Einzelunternehmen hindeutet.

Welche Variante heute zutrifft, weiß nur der Betreiber. Die Zeilen im Impressum
sind entsprechend als Platzhalter angelegt.

### 4. Hoster → `datenschutz.html`, Abschnitt 4

Name und Anschrift des Hosting-Anbieters eintragen und mit ihm einen
Auftragsverarbeitungsvertrag abschließen – bei Vercel ist das ein Häkchen im
Dashboard, bei deutschen Hostern meist ein PDF.

### 5. Fotos ersetzen oder lizenzieren → `img/fotos/`

**Das ist der wichtigste offene Punkt.** Die acht Werkstattfotos stammen aus dem
zentralen Bildpool `assets/fotos/kfz-werkstatt/` in der Repo-Wurzel. Es sind
**fremde Stock- und Pressefotos mit ungeklärter Lizenz** – keine Aufnahmen von
AC Caspari. Teilweise waren die Quellen noch im Ausgangsscreenshot sichtbar
(`kerridgecs.com`, `smogtechinstitute.com`, `nzherald.co.nz`).

Sie sind eingebaut, damit das Layout beurteilt werden kann, und tragen auf der
Seite ein gelbes Label **„Platzhalter · Lizenz klären“**. Vor dem Livegang
müssen sie durch eigene Aufnahmen ersetzt oder lizenziert werden. In Deutschland
haftet für ein ungeklärtes Foto der Betreiber der Website, nicht der Ersteller;
Streitwerte von einigen Hundert bis über tausend Euro pro Bild sind normal.

Zum Entfernen des Labels die CSS-Klasse `is-placeholder` am jeweiligen
`<figure class="shot">` beziehungsweise `<div class="band">` löschen.
Vollständige Herkunftsliste: **`assets/fotos/BILDNACHWEIS.md`** (Repo-Wurzel).

### 6. Kartenkoordinaten → `werkstatt.html` und `kontakt.html`

Die genaue Position von Hausnummer 189 ließ sich nicht belegen. Der
Kartenausschnitt ist deshalb auf den Alten Uentroper Weg zentriert, die
Markierung sitzt auf einer belegten Position derselben Straße
(51.69150 / 7.86715, entspricht Hausnummer 59).

Richtige Werte auf `openstreetmap.org` nachschlagen und in beiden Dateien
`bbox` und `marker` im Attribut `data-map-src` ersetzen. Der Link „Route planen“
sucht nach der Adresse als Text und stimmt unabhängig davon.

### 7. Angaben prüfen – aus öffentlichen Verzeichnissen, nicht bestätigt

| Angabe | Stand | Anmerkung |
|--------|-------|-----------|
| Telefon `02381 889017` | mehrfach übereinstimmend | vermutlich korrekt |
| Adresse `Alter Uentroper Weg 189, 59071 Hamm` | mehrfach übereinstimmend | vermutlich korrekt |
| Öffnungszeiten **Mo–Do 8–16, Fr 8–13 Uhr** | eingebaut | ⚠️ eine zweite Quellengruppe nannte **Mo–Fr 8–17, Sa 8–14 Uhr**. Bitte festlegen – die Zeiten stehen in `index.html`, `kontakt.html`, `werkstatt.html`, im Footer aller Seiten und im Structured-Data-Block von `index.html`. |
| Leistungen Reparatur, Bremsendienst, Motorinstandsetzung, Ölwechsel, Inspektion, Reifenservice, HU/TÜV | in Verzeichnissen genannt | vermutlich korrekt |
| Leistungen **Klimaservice**, **Urlaubscheck**, **Diagnose/Elektronik**, **Fahrwerk**, **Reifeneinlagerung** | aus dem AC-AUTO-CHECK-Konzept abgeleitet, **für diesen Betrieb nicht belegt** | falls nicht angeboten, die betreffenden Karten in `leistungen.html` und `index.html` entfernen und die Auswahlliste im Formular kürzen |
| Bezeichnung „AC AUTO CHECK“ im Hero-Badge | aus dem Firmennamen „Auto Check Falk Caspari“ geschlossen | falls die Konzeptpartnerschaft nicht (mehr) besteht, Badge in `index.html` ändern |

---

## Design

- **Stil:** hell, technisch, aufgeräumt – Papierweiß und ein kühles Anthrazit,
  dazu Signalrot (`#d0021b`) als einzige Akzentfarbe. Bewusst das Gegenteil der
  dunklen, cineastischen Schwesterseite `sites/boostwerk`, damit die beiden
  Werkstattseiten nicht wie Zwillinge wirken.
- **Typografie:** Archivo (Überschriften, 800) + Inter (Fließtext), beide lokal.
- **Animationen** – „clean“ heißt hier: kurz, gleichmäßig, nie ruckelnd:
  - **Seitenübergang** – beim Klick auf einen internen Link blendet die Seite
    weich aus, die neue läuft von unten ein. Anker, Telefonlinks, neue Tabs und
    Fremdlinks bleiben davon unberührt; die Zurück-Taste wird abgefangen.
  - Scroll-Fortschrittsbalken und mitschrumpfende Kopfleiste
  - gestaffelte Reveals über `data-reveal` / `data-delay`
  - Marken-Laufband, Pause bei Hover
  - **Fahrzeug-Check**: gezeichnetes SVG, die Karosserie wird gestrichelt
    aufgebaut, danach leuchten fünf Prüfpunkte nacheinander auf und pulsieren
  - wachsende Ablauf-Linie mit nacheinander einfärbenden Nummernkreisen
  - Karten heben sich beim Hover, eine rote Linie läuft von links unten ein
  - FAQ-Akkordeon – es bleibt immer nur eine Antwort offen
  - Parallax auf den breiten Foto-Bändern
  - **Rezensions-Wasserfall**: drei Spalten mit unterschiedlichem Tempo, die
    mittlere gegenläufig, Pause bei Hover
- `prefers-reduced-motion` wird respektiert – dann schalten sich sämtliche
  Bewegungen ab, inklusive Seitenübergang und Wasserfall.

## Datenschutz-Technik

Drei Punkte sind bewusst so gebaut:

- **Schriften lokal.** Archivo und Inter liegen als Variable Fonts in `fonts/`
  und kommen vom eigenen Server – **keine Verbindung zu Google Fonts**. Das war
  der größte Abmahnpunkt (LG München, 2022). Zwei Dateien pro Familie, getrennt
  nach `latin` und `latin-ext`; letzteres lädt nur, wenn Zeichen wie das „Š“ in
  „Škoda“ vorkommen. Lizenz: SIL OFL 1.1, Texte liegen in `fonts/` daneben.
- **Karte erst nach Klick.** Der OpenStreetMap-`iframe` steht nicht im HTML,
  sondern wird von `app.js` (`mapConsent()`) erst nach einem Klick auf
  „Karte laden“ eingesetzt. Vorher verlässt keine IP-Adresse den Browser.
- **Kein Tracking, keine Cookies.** Im `localStorage` stehen nur zwei
  Ja-/Nein-Werte: `acc-cookie-ok` und `acc-map-ok`.

Ändert sich an einem dieser Punkte etwas, muss `datenschutz.html` mitgeändert
werden – die Abschnitte 3 bis 8 beschreiben genau diesen Stand.

## Technik

- Responsiv geprüft bei 390 px und 1440 px; Umbrüche bei 640 / 900 / 1080 px.
  Auf schmalen Geräten wird aus dem Text-Knopf „Termin anfragen“ ein reiner
  Anruf-Knopf, damit die Kopfleiste nicht überläuft.
- Semantisches Markup, Sprungmarke, sichtbare Fokuszustände,
  `AutoRepair`-Structured-Data auf der Startseite.
- Bilder als `<picture>` mit WebP und JPEG-Rückfall, `loading="lazy"`,
  `width`/`height` gesetzt (kein Layout-Springen beim Laden).
- Kontaktformular mit eigener Pflichtfeldprüfung, Honigtopf-Feld gegen Bots,
  Versand per `fetch` ohne Seitenneuladen.
- **Keine externen Requests** im Auslieferungszustand – im Browser nachgemessen.

## Bilder aufbereiten

Alle Fotos liegen doppelt vor: als `.webp` und als `.jpg` für den Rückfall.
Zum Aufbereiten neuer Fotos gibt es ein Werkzeug in der Repo-Wurzel:

```bash
# Handyfotos der Werkstatt als Galeriebilder aufbereiten
python3 tools/bilder.py ~/fotos/caspari --ziel sites/ac-caspari/img/fotos

# Kopfbild, auf 16:9 zugeschnitten
python3 tools/bilder.py halle.jpg --ziel sites/ac-caspari/img \
    --preset hero --zuschnitt 16:9 --name hero
```

Behalten die neuen Dateien die bestehenden Namen, muss im HTML nichts geändert
werden – nur das gelbe `is-placeholder` am `<figure>` beziehungsweise
`<div class="band">` entfernen.

## Lokal testen

```bash
cd sites/ac-caspari
python3 -m http.server 8000
# http://localhost:8000 öffnen
```

## Vercel

Eigenes Projekt mit **Root Directory** `sites/ac-caspari`, Framework-Preset
`Other` (statisch, kein Build).

## Quellen der Recherche

Alle Angaben stammen aus öffentlich zugänglichen Verzeichnissen und wurden
**nicht** beim Betrieb selbst bestätigt:

- [nochoffen.de](https://www.nochoffen.de/braam-ostwennemar-ac-caspari) ·
  [finde-offen.de](https://finde-offen.de/hamm/auto-check-falk-caspari-309473) ·
  [auto-werkstatt.de](https://www.auto-werkstatt.de/hamm/falk-caspari-ac-autocheck-caspari-aUM1qt)
- [golocal](https://www.golocal.de/hamm/autowerkstaetten/auto-check-falk-caspari-kfz-meisterbetrieb-1Od3c/) ·
  [11880](https://www.11880.com/branchenbuch/hamm-westfalen/012010409B37671237/auto-check-falk-caspari-kfz-meisterbetrieb.html) ·
  [autoplenum](https://www.autoplenum.de/kfz-werkstatt/hamm/auto-check-falk-caspari-115462) ·
  [GoYellow](https://www.goyellow.de/home/autowerkstatt-auto-check-falk-caspari-hamm--b10nk2.html)
- [openregister.de, HRB 8136](https://openregister.de/company/DE-HRB-R2404-8136) ·
  [Creditreform](https://firmeneintrag.creditreform.de/59071/4150122432/CASPARI_KFZ_WERKSTATT_UG_HAFTUNGSBESCHRAENKT) ·
  [North Data](https://www.northdata.de/Caspari,+Falk,+Hamm/hv)
- [AC AUTO CHECK, Konzeptleistungen](https://ac-autocheck.de/ac-autocheck-partner-werden)
