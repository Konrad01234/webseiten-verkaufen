# Die Werkstatt – Website

Mehrseitige statische Website für **Die Werkstatt**, KFZ-Meisterbetrieb Dominik Benfer,
Große Brenne 5, 58099 Hagen.

## Seiten

| Datei | Inhalt |
|-------|--------|
| `index.html` | Startseite – Hero mit Halle, sechs Leistungen, Schild an der Halle, Ablauf in vier Schritten, Rezensionen-Wasserfall, Öffnungszeiten |
| `leistungen.html` | Alle 14 Leistungsbereiche als Raster, Diagnose-Abschnitt, Unfallabwicklung, HU- und Garantiehinweise |
| `ueber-uns.html` | Betrieb, Inhaber, Arbeitsweise, Zitat aus einer Rezension |
| `bewertungen.html` | Wasserfall als Kopfbereich + alle sieben Google-Rezensionen im Wortlaut |
| `kontakt.html` | Kontaktdaten, Öffnungszeiten, Anfahrt, Terminanfrage („Werkstattauftrag“) |
| `impressum.html` | Impressum – **enthält Platzhalter, siehe unten** |
| `datenschutz.html` | Datenschutzerklärung – **enthält Platzhalter, siehe unten** |
| `styles.css` | Design-System |
| `fonts.css` + `fonts/` | Selbst gehostete Schriften (Barlow, Barlow Condensed, IBM Plex Mono, OFL 1.1) |
| `app.js` | Navigation, Öffnungsstatus, Reveals, Wasserfall, Formular |
| `img/` | Fotos + Favicon |
| `vorschau.html` | Einzeldatei-Vorschau: alle Unterseiten, Schriften und Bilder eingebettet |
| `build-vorschau.py` | Erzeugt `vorschau.html` neu |

## Design

- **Stil:** Werkstatt-Industrie – Anthrazit `#15181c`, Signalorange `#dd5117`, Betongrau.
  Harte Kanten (3 px Radius), versetzte Schlagschatten statt weicher Verläufe,
  Warnstreifen als Trenner, Schablonen-Nummern, technische Beschriftungen in Monospace.
- **Farbe:** Direkt von der Halle abgenommen – graue Fassade, orangefarbener Logoblock.
  Die Wortmarke „DIE **WERKSTATT**“ ist in CSS nachgebaut, kein Bild.
- **Typografie:** Barlow Condensed (Überschriften, versal), Barlow (Fließtext),
  IBM Plex Mono (Labels, Zahlen, Zeiten).
- **Rezensionen-Wasserfall:** Drei Spalten laufen mit unterschiedlicher Geschwindigkeit
  endlos durch, die mittlere gegenläufig; Maus darüber hält an. `app.js` wiederholt den
  Spalteninhalt so oft, bis er höher als das Fenster ist, und verdoppelt ihn dann –
  dadurch läuft die Schleife nahtlos. Bei `prefers-reduced-motion` wird daraus eine
  ruhende Kachelwand.
- **Öffnungsstatus:** Topbar und Kontaktseite zeigen live „geöffnet / geschlossen“ samt
  nächster Öffnung; die Öffnungszeiten-Tabelle hebt den heutigen Tag hervor.
  Datenbasis sind die `HOURS` in `app.js` – eine Änderung dort reicht.
- **Kontrast:** Auf WCAG 2.1 AA geprüft. Deshalb gibt es zwei Orangetöne:
  `--orange` für Flächen, Linien und Icons, `--orange-text` / `--orange-deep`
  für kleine Schrift auf hellem Grund bzw. weiße Schrift auf Orange.

## Technik

- Reines HTML + CSS + Vanilla-JS, **kein Build-Schritt**.
- Responsiv geprüft bei 390 / 1280 / 1440 px, kein horizontales Scrollen.
- **Keine Drittanbieter:** keine Cookies, kein Tracking, keine eingebettete Karte,
  Schriften liegen im Repo. Beim Seitenaufruf geht keine Anfrage nach außen.
- Die Terminanfrage baut ohne Backend eine vorausgefüllte E-Mail (`mailto:`).
- `AutoRepair`-Auszeichnung (JSON-LD) mit Adresse, Telefon und Öffnungszeiten auf der Startseite.

## Inhalte / Quellen

Adresse, Telefon, Öffnungszeiten, Leistungen und Rezensionen stammen aus dem
Google-Unternehmensprofil und vom Hinweisschild an der Halle. Die sieben Rezensionen
sind im Wortlaut übernommen (nur Emojis entfernt).

## Vor der Veröffentlichung erledigen

1. **Impressum und Datenschutz vervollständigen.** Alle offenen Stellen sind im
   Quelltext und auf der Seite orange markiert (`class="todo"`):
   vollständige Firmierung/Rechtsform, E-Mail-Adresse, USt-IdNr., zuständige
   Handwerkskammer und Handwerksrollen-Nummer, Bestätigung des Hosters.
   `grep -n 'class="todo"' *.html` listet sie auf.
2. **E-Mail-Adresse setzen.** Aktuell steht überall der Platzhalter
   `info@die-werkstatt-hagen.de` (in `parts.py`-Generat: Konstante `MAIL`).
   Er steckt in `kontakt.html` (Formular `data-mail` + Info-Kachel), im Footer
   aller Seiten sowie in Impressum und Datenschutz.
3. **Fotos ersetzen.** `img/halle.jpg` und `img/schild.jpg` sind Ausschnitte aus
   Google Street View, `img/batterietest.jpg` stammt aus einem Beitrag des
   Unternehmensprofils. Für den Dauerbetrieb gehören dort eigene Aufnahmen hin
   (Halle, Hebebühne, Team, Annahme) – gleiche Dateinamen genügen.
4. **Angaben gegenprüfen.** „Freier Meisterbetrieb“ und „markenübergreifend“ sind
   aus dem Profil abgeleitet; Klimaservice für R1234yf, RDKS und Achsvermessung
   bitte bestätigen, sonst die entsprechenden Stichpunkte in `leistungen.html`
   streichen.

## Vorschau ohne Deployment

`vorschau.html` enthält die komplette Website in einer einzigen Datei: alle sieben
Seiten als Vorlagen, Navigation clientseitig über `#leistungen`, `#kontakt` usw.,
Schriften und Fotos als Data-URI. Die Datei lädt nichts nach und läuft deshalb auch
über einen HTML-Proxy:

```
https://htmlpreview.github.io/?https://raw.githubusercontent.com/Konrad01234/webseiten-verkaufen/<branch>/sites/die-werkstatt/vorschau.html
```

**Nach jeder Änderung an den Seiten neu erzeugen**, sonst zeigt die Vorschau einen
alten Stand:

```bash
cd sites/die-werkstatt
python3 build-vorschau.py     # braucht Pillow
```

Die Vorschau trägt ein orangefarbenes Hinweisband und `noindex, nofollow` – sie ist
zum Herumzeigen gedacht, nicht als Veröffentlichung.

## GitHub Pages

Bisher scheitert jeder Pages-Workflow in diesem Repo mit
`Resource not accessible by integration`: Das Actions-Token darf keine Pages-Site
anlegen. Einmalig in **Repo Settings → Pages → Source: „GitHub Actions"** umstellen,
danach lässt sich ein Workflow für diesen Ordner einrichten. Pro Repository ist nur
eine Pages-Seite möglich – mehrere Seiten müssen daher in Unterordnern liegen.

## Lokal testen

```bash
cd sites/die-werkstatt
python3 -m http.server 8000
# http://localhost:8000 öffnen
```

## Vercel

Eigenes Projekt mit **Root Directory** `sites/die-werkstatt`,
Framework-Preset `Other` (statisch, kein Build).
