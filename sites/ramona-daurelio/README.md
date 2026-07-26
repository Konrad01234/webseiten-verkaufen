# Karosserie + Lack D'Aurelio – Website

Mehrseitige statische Website für **Karosserie + Lack D'Aurelio UG (haftungsbeschränkt)** in Potsdam –
Meisterbetrieb für Unfallinstandsetzung, Autolackierung und Fahrzeugaufbereitung.
Inhaberin: **Ramona D'Aurelio**.

## Seiten

| Datei | Inhalt |
|-------|--------|
| `index.html` | Startseite – Foto-Hero, Kennzahlen, Leistungen, Ablauf, Versicherungs-Laufband, Bewertungs-Teaser |
| `leistungen.html` | Sechs Leistungsbereiche im Detail, jeweils mit Bild und Leistungsumfang |
| `unfall-service.html` | Ablauf nach dem Unfall, Versicherungsabwicklung, Ersatzwagen, FAQ |
| `bewertungen.html` | **Der Bewertungs-Wasserfall**: 5-Sterne-Rezensionen im Original inkl. Antworten |
| `umgang-mit-kritik.html` | Warum nichts gelöscht wird, wie mit Kritik gearbeitet wird, was sich geändert hat, Reklamationsweg |
| `ueber-uns.html` | Ramona D'Aurelio, Betrieb, Werte, Kennzahlen |
| `galerie.html` | Bilder aus dem Betrieb und aus der Werkstattarbeit |
| `kontakt.html` | Kontaktformular, Erreichbarkeit, Öffnungszeiten, Anfahrt |
| `impressum.html` | Impressum – **Platzhaltertext** |
| `datenschutz.html` | Datenschutzerklärung – **Platzhaltertext** |
| `styles.css` | Gemeinsames Design-System |
| `fonts.css` + `fonts/` | Lokal gehostete Schriften (Sora, Inter, Yellowtail) |
| `app.js` | Navigation, Scroll-Animationen, Zähler, Seitenübergang, Formular |
| `img/` | Logo + Fotos |
| `vorschau.html` | **Alles-in-einem-Vorschau**: alle 10 Seiten, Schriften und Bilder in einer Datei eingebettet, Navigation clientseitig. Wird generiert – nicht von Hand bearbeiten. |

## Design

- **Stil:** dunkel und cineastisch – Tiefschwarz, Chrom-Verläufe, Rot als Signalfarbe,
  Italien-Trikolore als Marken-Detail (kommt aus dem Original-Logo).
- **Typografie:** Sora (Überschriften), Inter (Fließtext), Yellowtail (Wortmarke „D'Aurelio").
- **Logo:** Das echte Firmenlogo vom Gebäudeschild – die Medaillon-Marke wurde aus dem Foto
  freigestellt, hochskaliert, geschärft und als transparentes PNG gespeichert
  (`img/logo-mark.png`). Wortmarke und Trikolore-Balken sind als HTML/CSS nachgebaut,
  damit sie in jeder Größe scharf bleiben.
- **Fotos:** echte Aufnahmen des Betriebs (Gebäude, Werkstatthallen, Empfang, Tresen,
  lackierte Teile), aus dem bereitgestellten Bildmaterial ausgeschnitten, entzerrt und
  optimiert. Die Fotos von Kundenfahrzeugen wurden entfernt; an ihrer Stelle stehen
  Platzhalter für Stockfotos aus der Werkstattarbeit – siehe nächster Abschnitt.
- **Animationen:** Ken-Burns-Hero mit Lichtstrahl und Filmkorn, zeilenweise einfahrende
  Überschrift, gestaffelte Scroll-Reveals mit Blur-Auflösung, mitschrumpfende Navigation,
  Scroll-Fortschrittsbalken, hochzählende Kennzahlen, Bewertungsbalken, Karten-Glow unter
  dem Mauszeiger, Partner-Laufband, Kino-Blende beim Seitenwechsel.
  Alles respektiert `prefers-reduced-motion`.

## Stockfotos einsetzen

Fünf Bilder sind aktuell **gestaltete Platzhalter** (dunkles Panel, Strichsymbol,
Beschriftung „Platzhalter · Stockfoto einsetzen"). Sie liegen unter den unten genannten
Dateinamen in `img/`. Zum Austausch reicht es, die Datei zu **überschreiben** – gleicher
Name, gleiches Seitenverhältnis. Am HTML muss nichts geändert werden.

| Datei | Format | Motiv | Wo es erscheint |
|-------|--------|-------|-----------------|
| `img/stock-werkstatt.jpg` | 4:3 quer, ≥ 1600 px | Werkstatthalle, Fahrzeug auf der Hebebühne | Leistungen (Unfallinstandsetzung), Umgang mit Kritik, Galerie |
| `img/stock-lackierkabine.jpg` | 4:3 quer, ≥ 1600 px | Lackierer mit Spritzpistole in der Lackierkabine | Leistungen (Autolackierung), Galerie |
| `img/stock-politur.jpg` | 4:3 quer, ≥ 1600 px | Poliermaschine auf lackierter Fläche, Nahaufnahme | Leistungen (Spot-Repair), Galerie |
| `img/stock-mechanikerin.jpg` | 4:3 quer, ≥ 1600 px | Kfz-Mechanikerin in Arbeitskleidung am Fahrzeug | Leistungen (KFZ-Aufbereitung), Galerie |
| `img/stock-mechanikerin-portrait.jpg` | 4:5 hoch, ≥ 1200 px | Porträt einer Mechanikerin, Werkstatt unscharf dahinter | Über uns (Abschnitt „Das Team") |

Suchbegriffe, die auf Unsplash, Pexels und Pixabay gute Treffer liefern:
`car body shop`, `auto repair shop interior`, `car on lift`, `spray painting car`,
`paint booth automotive`, `female mechanic`, `woman car mechanic workshop`,
`car polishing detail`.

Bitte auf die Lizenz achten – Unsplash- und Pexels-Lizenz erlauben die kommerzielle
Nutzung ohne Namensnennung, bei Pixabay und anderen Quellen im Einzelfall prüfen.
Am stärksten wären natürlich eigene Aufnahmen aus der Werkstatt.

Ist ein Bild eingesetzt, gehört es zusätzlich in den Bildnachweis:
`assets/stock/CREDITS.md` (Quelle und Lizenz) sowie in den Abschnitt
„Bildnachweis" im `impressum.html`. In der Galerie wird jedes Stockfoto
automatisch mit dem Etikett „Stockfoto" an der Bildunterschrift ausgewiesen –
die Kennzeichnung steckt in der Liste `gallery` im Seitengenerator.

Die Originale gehören in die gemeinsame Bibliothek `assets/stock/`, damit sie
auch für andere Webseiten dieses Repos verwendet werden können. Wie das
funktioniert, steht in `assets/stock/README.md`.

> **Hinweis:** Die Stockfotos konnten in dieser Arbeitsumgebung nicht
> heruntergeladen werden – Unsplash, Pexels, Pixabay und Wikimedia sind durch die
> Netzwerk-Policy gesperrt, ebenso das CDN, über das generierte Bilder
> ausgeliefert werden. Deshalb die Platzhalter. Fünf passende, KI-generierte
> Bilder liegen bereits im Higgsfield-Konto bereit, siehe
> `assets/stock/CREDITS.md`.

## Bewertungen

Der Wasserfall auf `bewertungen.html` zeigt **echte 5-Sterne-Rezensionen** aus dem
Google-Profil, inklusive der Original-Antworten von Ramona D'Aurelio. Nachnamen sind auf
den Anfangsbuchstaben gekürzt.

Negative Bewertungen stehen **bewusst nicht** im Wasserfall. Sie bekommen stattdessen die
eigene Seite `umgang-mit-kritik.html`. Deren Kernaussage: **es wird nichts gelöscht.**
96 Menschen haben unterschiedliche Erwartungen – was der eine als gründlich empfindet, ist
dem anderen zu langsam. Erst die kritischen Stimmen machen die guten glaubwürdig. Die Seite
zeigt daher:

- die Haltung dazu (keine Löschanträge, keine gekauften Bewertungen, Antwort auf jede)
- drei Dinge, die bei Kritik immer gleich ablaufen: lesen, antworten, damit arbeiten
- vier Abläufe, die sich durch Kritik tatsächlich geändert haben – ohne Namen
- den Reklamationsweg in vier Schritten
- zwei Originalzitate von Ramona D'Aurelio aus ihren Google-Antworten

## Grundsatz: keine erfundenen Angaben

Auf der Seite stehen ausschließlich Angaben, die belegt sind – aus dem
Google-Unternehmensprofil, den Fotos des Betriebs oder den Original-Bewertungen.
Was nicht vorliegt, wird **nicht erfunden**, sondern sichtbar als „wird ergänzt"
gekennzeichnet. Das betrifft Kontaktdaten, Schließzeiten, Registerangaben,
Umsatzsteuer-ID und Kammer.

Unter dem Wasserfall auf `bewertungen.html` steht der Abschnitt „Uns ist wichtig,
dass Sie alle Bewertungen sehen": daneben eine echte Ein-Sterne-Bewertung als
Screenshot samt Antwort von Ramona D'Aurelio (`img/bewertung-kritik.jpg`, Nachname
unkenntlich gemacht). Im Wasserfall selbst stehen weiterhin nur gute Bewertungen.

## Was noch geändert werden muss

Alle offenen Stellen sind auf den Seiten sichtbar markiert – entweder mit einem
gelben Hinweiskasten oder mit einem kleinen `Platzhalter`-Etikett direkt am Text:

- **Kontaktdaten**: Telefon, E-Mail und Anschrift fehlen. Es steht **nichts
  Erfundenes** auf der Seite – die Felder zeigen „wird ergänzt". Eintragen lassen
  sie sich zentral im Seitengenerator (Konstanten `TEL_TXT`, `TEL_HREF`, `MAIL`,
  `STRASSE`, `ORT`); Footer, Kontaktseite, Impressum und Datenschutz ziehen nach.
  Solange keine E-Mail-Adresse hinterlegt ist, ist der Formularversand deaktiviert
  und sagt das auch.
- **Öffnungszeiten**: Belegt ist nur der Öffnungsbeginn 7:45 Uhr (Mo–Fr) aus dem
  Google-Profil. Die Schließzeiten fehlen und werden nicht geraten.
- **Impressum und Datenschutzerklärung**: Entwürfe, die vor einer Veröffentlichung
  vervollständigt und rechtlich geprüft werden müssen (Register, USt-ID, Kammer,
  Hosting-Anbieter).
- **Versicherungs-Partnerliste**: Im Laufband stehen nur die vier Namen, die auf dem
  Partnerwerkstatt-Aushang im Empfang lesbar sind (HUK-COBURG, VHV, Gothaer, Debeka).
  Bitte bestätigen und ergänzen.
- **Betriebsdaten**: Gründungsjahr, Teamgröße, Meisterbrief-Angaben fehlen.
- **Karte** auf der Kontaktseite: erst einbinden, wenn die Adresse steht.
- **Stockfotos**: fünf Platzhalterbilder ersetzen – siehe Abschnitt „Stockfotos
  einsetzen" weiter oben.
- **Eigenes Bildmaterial**: Vorher-Nachher-Aufnahmen und ein Teamfoto würden Galerie und
  Startseite noch einmal deutlich stärker machen als jedes Stockfoto.
- **Kontaktformular**: erzeugt derzeit ohne Backend eine vorausgefüllte E-Mail
  (`mailto:`). Für ein echtes Formular wäre ein Endpoint nötig.

## Technik

- Reines HTML + CSS + Vanilla-JS, **kein Build-Schritt**, keine Abhängigkeiten.
- Schriften werden lokal ausgeliefert – beim Seitenaufruf geht **keine Verbindung zu
  Google-Servern** raus.
- Responsiv (390 / 768 / 1024 / 1440 px), kein horizontales Scrollen.
- Semantisches Markup, Fokus-Zustände, `aria`-Attribute, Tastaturbedienung im Menü.

## Vorschau ohne Server

`vorschau.html` ist eine eigenständige Kopie der kompletten Website: alle
Unterseiten, Schriften und Bilder sind als Data-URIs eingebettet, die Navigation
läuft clientseitig. Die Datei lässt sich per Doppelklick öffnen, verschicken oder
über einen HTML-Proxy anzeigen:

```
https://htmlpreview.github.io/?https://raw.githubusercontent.com/Konrad01234/webseiten-verkaufen/claude/ramona-brunch-website-t54try/sites/ramona-daurelio/vorschau.html
```

Weil nichts nachgeladen wird, kann dabei auch nichts fehlen. Die Datei ist rund
2,5 MB groß und zeigt unten einen Hinweisbalken. Sie ist **kein** Ersatz für das
echte Deployment – dort werden die Bilder in voller Auflösung ausgeliefert.

## Lokal testen

```bash
cd sites/ramona-daurelio
python3 -m http.server 8000
# http://localhost:8000 öffnen
```

## Vercel

Eigenes Projekt mit **Root Directory** `sites/ramona-daurelio`, Framework-Preset `Other`
(statisch, kein Build).
