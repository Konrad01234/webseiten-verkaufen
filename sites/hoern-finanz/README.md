# Hörn Finanz Vermittlung GmbH – Website

Mehrseitige statische Website für die **Hörn Finanz Vermittlung GmbH** in
Sinsheim-Hilsbach und Angelbachtal (Finanzierung, Vermögensaufbau, Altersvorsorge,
Risikoabsicherung). Neugestaltung als Ersatz für die bisherige Seite hoern-finanz.de.

## Seiten

| Datei | Inhalt |
|-------|--------|
| `index.html` | Startseite – Hero, Kennzahlen, Geschäftsfelder, Warum-wir, Ablauf, Bewertung, Standorte, FAQ, CTA |
| `leistungen.html` | Die vier Geschäftsfelder im Detail + Zielgruppen |
| `ueber-uns.html` | Reinhard Hörn, Haltung, Unternehmen, Ablauf eines Mandats |
| `kontakt.html` | Anfrageformular, Direktkontakt, beide Standorte |
| `impressum.html` | Impressum inkl. berufsrechtlicher Angaben (**Entwurf, siehe unten**) |
| `datenschutz.html` | Datenschutzerklärung (**Entwurf, siehe unten**) |
| `styles.css` | Design-System (Tokens, Komponenten, Responsive, Print) |
| `fonts.css` + `fonts/` | Lokal gehostete Schriftarten |
| `app.js` | Navigation, Scroll-Reveals, Zähler, Akkordeon, Formular, Hinweisbox |

## Design

- **Stil:** „Trust & Authority“ – hell, editorial, ruhig. Tiefes Marineblau (`#0f2b45`)
  und Messing-Gold (`#a97c34`) auf warmem Bone-Weiß (`#f7f4ef`).
- **Typografie:** Newsreader (Überschriften, editorialer Serif) + Inter (Fließtext/UI).
- **Bildsprache:** bewusst **ohne Fotos** – die Hero-Grafik ist ein reines Inline-SVG.
  Sobald echte Fotos (Büro, Reinhard Hörn, Team) vorliegen, lassen sie sich im Hero und
  auf `ueber-uns.html` (Element `.portrait`) direkt einsetzen.
- **Animationen:** Scroll-Fortschritt, mitschrumpfende Navigation, gestaffelte Reveals,
  Count-up-Kennzahlen, Button-Sheen, Karten-Hover. Respektiert `prefers-reduced-motion`.
- **Barrierefreiheit:** Skip-Link, sichtbare Fokuszustände, ARIA für Menü/Akkordeon,
  Label-Verknüpfung im Formular, Kontraste ≥ 4,5:1 für Text (geprüft).

## Technik

- Reines HTML + CSS + Vanilla-JS, **kein Build-Schritt**.
- **Keine externen Requests zur Laufzeit:** Schriftarten liegen lokal in `fonts/`,
  keine Karte eingebettet, kein Analyse- oder Marketing-Tracking, keine Cookies.
  Die Hinweisbox merkt sich ihre Bestätigung nur im `localStorage`.
- Das Kontaktformular hat **kein Backend**: Es setzt die Eingaben im Browser zu einer
  E-Mail zusammen und öffnet das E-Mail-Programm (`mailto:`). Für echten Serverversand
  wäre ein Formular-Endpunkt nötig (z. B. Vercel Function) – dann muss die
  Datenschutzerklärung entsprechend ergänzt werden.
- Geprüft bei 375 / 390 / 768 / 1024 / 1440 px, kein horizontales Scrollen,
  keine Konsolenfehler.

## Inhalte / Quellen

Die bisherige Website **hoern-finanz.de war aus dieser Arbeitsumgebung nicht abrufbar**
(Egress-Policy). Die Stammdaten stammen daher aus öffentlich zugänglichen Verzeichnissen
(Das Örtliche, Gelbe Seiten, 11880, meinestadt.de, kennstdueinen.de, ImmoScout24):

| Angabe | Wert |
|--------|------|
| Hauptsitz | Hungerbergstr. 7b, 74889 Sinsheim |
| Zweigstelle | Schloßstr. 22, 74918 Angelbachtal |
| Telefon / Fax | 07265 91 70 96-0 / -19 |
| E-Mail | info@hoern-finanz.de |
| Geschäftsführer | Reinhard Hörn |
| § 34d GewO | D-XFKI-VIA4U-00, IHK Rhein-Neckar |
| § 34f GewO | D-F-153-DX7L-14 |
| Öffnungszeiten | Mo–Fr 9:00–16:00 Uhr |
| Bewertung | Ø 4,88 aus 8 Bewertungen (kennstdueinen.de) |

### Vor dem Livegang mit dem Kunden klären

1. **Impressum vervollständigen** – alle mit *[zu ergänzen]* markierten Felder:
   Registergericht und HRB-Nummer, USt-IdNr., Berufshaftpflichtversicherer,
   Registerstelle § 34f, Angaben zu Beteiligungen, Formulierung zur Verbraucherschlichtung.
2. **Datenschutzerklärung vervollständigen** – Hosting-Anbieter, Speicherdauer der
   Logfiles, Datenschutzbeauftragter. Anschließend anwaltlich prüfen lassen.
3. **„seit über 20 Jahren“** – stützt sich auf einen RNZ-Advertorial-Titel „20 Jahre
   Hörn Finanz“; exaktes Gründungsjahr bestätigen lassen.
4. **Bewertung 4,88** – Quelle und Stand bestätigen; idealerweise durch echte,
   freigegebene Kundenstimmen ergänzen (aktuell bewusst **keine erfundenen Zitate**).
5. **Fotos** – Büro, Porträt Reinhard Hörn, ggf. Team.
6. **Formulierungen zu Beratungsablauf, FAQ und Erreichbarkeit** gegenlesen lassen.
7. Ob „Mehrfachgeneralagent“ weiterhin korrekt ist (nicht „Makler“ – die Texte sind
   bewusst entsprechend formuliert).

## Lokal testen

```bash
cd sites/hoern-finanz
python3 -m http.server 8000
# http://localhost:8000 öffnen
```

## Vercel

Eigenes Projekt mit **Root Directory** `sites/hoern-finanz`, Framework-Preset `Other`
(statisch, kein Build).

## Schriftlizenz

Newsreader und Inter stehen unter der SIL Open Font License 1.1 und dürfen lokal
gehostet werden. Für das Repository genügt dieser Hinweis; beim Ausliefern kann die
Lizenzdatei zusätzlich unter `fonts/OFL.txt` abgelegt werden.
