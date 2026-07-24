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
| `umgang-mit-kritik.html` | Wie mit Kritik umgegangen wird: Kritikpunkte ↔ geänderte Abläufe, Reklamationsweg |
| `ueber-uns.html` | Ramona D'Aurelio, Betrieb, Werte, Kennzahlen |
| `galerie.html` | Alle Fotos aus dem Betrieb |
| `kontakt.html` | Kontaktformular, Erreichbarkeit, Öffnungszeiten, Anfahrt |
| `impressum.html` | Impressum – **Platzhaltertext** |
| `datenschutz.html` | Datenschutzerklärung – **Platzhaltertext** |
| `styles.css` | Gemeinsames Design-System |
| `fonts.css` + `fonts/` | Lokal gehostete Schriften (Sora, Inter, Yellowtail) |
| `app.js` | Navigation, Scroll-Animationen, Zähler, Seitenübergang, Formular |
| `img/` | Logo + Fotos |

## Design

- **Stil:** dunkel und cineastisch – Tiefschwarz, Chrom-Verläufe, Rot als Signalfarbe,
  Italien-Trikolore als Marken-Detail (kommt aus dem Original-Logo).
- **Typografie:** Sora (Überschriften), Inter (Fließtext), Yellowtail (Wortmarke „D'Aurelio").
- **Logo:** Das echte Firmenlogo vom Gebäudeschild – die Medaillon-Marke wurde aus dem Foto
  freigestellt, hochskaliert, geschärft und als transparentes PNG gespeichert
  (`img/logo-mark.png`). Wortmarke und Trikolore-Balken sind als HTML/CSS nachgebaut,
  damit sie in jeder Größe scharf bleiben.
- **Fotos:** echte Aufnahmen des Betriebs (Gebäude, Werkstatthallen, Empfang, Fahrzeuge,
  lackierte Teile), aus dem bereitgestellten Bildmaterial ausgeschnitten, entzerrt und
  optimiert. Keine Stockfotos.
- **Animationen:** Ken-Burns-Hero mit Lichtstrahl und Filmkorn, zeilenweise einfahrende
  Überschrift, gestaffelte Scroll-Reveals mit Blur-Auflösung, mitschrumpfende Navigation,
  Scroll-Fortschrittsbalken, hochzählende Kennzahlen, Bewertungsbalken, Karten-Glow unter
  dem Mauszeiger, Partner-Laufband, Kino-Blende beim Seitenwechsel.
  Alles respektiert `prefers-reduced-motion`.

## Bewertungen

Der Wasserfall auf `bewertungen.html` zeigt **echte 5-Sterne-Rezensionen** aus dem
Google-Profil, inklusive der Original-Antworten von Ramona D'Aurelio. Nachnamen sind auf
den Anfangsbuchstaben gekürzt.

Negative Bewertungen stehen **bewusst nicht** im Wasserfall. Stattdessen gibt es die eigene
Seite `umgang-mit-kritik.html`: Dort stehen die Kritikpunkte sinngemäß und ohne Namen –
jeweils daneben, was daraus geändert wurde. Dazu der Reklamationsweg und ein
Transparenz-Abschnitt, der offen erklärt, warum auf der Bewertungsseite nur gute
Bewertungen stehen.

## Was noch geändert werden muss

Alle offenen Stellen sind auf den Seiten sichtbar markiert – entweder mit einem
gelben Hinweiskasten oder mit einem kleinen `Platzhalter`-Etikett direkt am Text:

- **Kontaktdaten**: Telefon, E-Mail und Anschrift sind erfunden (`0331 000 00 00`,
  `info@daurelio-potsdam.de`, `Musterstraße 00`). Betrifft Footer, Kontaktseite,
  Impressum und Datenschutz.
- **Öffnungszeiten**: „Mo–Do 7:45–17:00, Fr 7:45–15:00" ist geschätzt. Aus dem
  Google-Profil belegt ist nur der Öffnungsbeginn 7:45 Uhr.
- **Impressum und Datenschutzerklärung**: Entwürfe, die vor einer Veröffentlichung
  vervollständigt und rechtlich geprüft werden müssen (Register, USt-ID, Kammer,
  Hosting-Anbieter).
- **Versicherungs-Partnerliste**: Die Namen im Laufband stammen teils vom
  Partnerwerkstatt-Aushang im Empfang (HUK-COBURG, VHV, Gothaer, Debeka), teils sind
  sie ergänzt. Bitte bestätigen und kürzen.
- **Betriebsdaten**: Gründungsjahr, Teamgröße, Meisterbrief-Angaben fehlen.
- **Karte** auf der Kontaktseite: erst einbinden, wenn die Adresse steht.
- **Bildmaterial**: Vorher-Nachher-Aufnahmen und ein Teamfoto würden Galerie und
  Startseite deutlich stärker machen.
- **Kontaktformular**: erzeugt derzeit ohne Backend eine vorausgefüllte E-Mail
  (`mailto:`). Für ein echtes Formular wäre ein Endpoint nötig.

## Technik

- Reines HTML + CSS + Vanilla-JS, **kein Build-Schritt**, keine Abhängigkeiten.
- Schriften werden lokal ausgeliefert – beim Seitenaufruf geht **keine Verbindung zu
  Google-Servern** raus.
- Responsiv (390 / 768 / 1024 / 1440 px), kein horizontales Scrollen.
- Semantisches Markup, Fokus-Zustände, `aria`-Attribute, Tastaturbedienung im Menü.

## Lokal testen

```bash
cd sites/ramona-daurelio
python3 -m http.server 8000
# http://localhost:8000 öffnen
```

## Vercel

Eigenes Projekt mit **Root Directory** `sites/ramona-daurelio`, Framework-Preset `Other`
(statisch, kein Build).
