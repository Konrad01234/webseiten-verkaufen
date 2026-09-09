# MARE-Print.de – Großformatdruck Dresden

Statische Website, sieben Seiten, ohne Build-Schritt. Reines HTML, CSS und
Vanilla-JavaScript – kein Framework, keine Abhängigkeiten, keine externen Requests.

## Seiten

| Datei | Inhalt |
|---|---|
| `index.html` | Startseite: Hero mit animiertem Druckbogen, Produktwelten, Kennzahlen, Materialkacheln, Format-Rechner, Anwendungen, Ablauf, FAQ |
| `material.html` | Materialkatalog: 14 Werkstoffe mit Filter, Datenblattangaben und Konfektionsoptionen |
| `technik.html` | Latexdruck-Verfahren, Umwelt-Zertifikate, Farbmanagement, Datenanlieferung |
| `ueber-uns.html` | Unternehmen, Zeitstrahl, Haltung, Zielgruppen |
| `kontakt.html` | Anfrageformular mit Validierung, Kontaktdaten, Lageskizze |
| `impressum.html` | Impressum (Vorlage – gelb markierte Felder ausfüllen) |
| `datenschutz.html` | Datenschutzerklärung (Vorlage – gelb markierte Felder ausfüllen) |

## Besonderheiten

* **Keine externen Requests.** Schriften (Archivo, Inter, JetBrains Mono) liegen als
  woff2 in `fonts/`, alle Grafiken sind Inline-SVG. Kein Google Fonts, kein CDN,
  keine Cookies, kein Tracking – deshalb auch kein Cookie-Banner nötig.
* **Alle Bilder sind Vektorgrafiken.** Illustrationen, Materialtexturen und
  Diagramme sind handgezeichnetes SVG bzw. reines CSS. Nichts wird unscharf,
  nichts muss nachgeladen.
* **Format-Rechner** auf der Startseite: Breite und Höhe eingeben, Ergebnis sind
  Fläche, Ösenanzahl, Transportgewicht, Nahtbedarf und eine maßstabsgetreue
  Vorschau mit 1,80-m-Silhouette als Größenreferenz.
* **Material-Explorer** auf `material.html`: Filter nach Materialgruppe und
  Einsatzort, Direktlinks per `#anker` (z. B. `material.html#mesh`).
* **Progressive Enhancement.** Ohne JavaScript bleibt jede Seite vollständig
  lesbar; der Explorer zeigt dann alle Materialien untereinander.
* **Barrierefreiheit.** Semantisches HTML, sichtbarer Fokus, Skip-Link,
  `aria`-Auszeichnung für Tabs und Overlay-Navigation, `prefers-reduced-motion`
  schaltet sämtliche Animationen ab.

## Vor dem Livegang prüfen

Die Inhalte beruhen auf öffentlich recherchierten Angaben – die Domain selbst war
aus der Entwicklungsumgebung nicht erreichbar. Bitte vor Veröffentlichung abgleichen:

1. **Firmierung, Registerdaten, USt-IdNr.** in `impressum.html` (gelb markiert)
2. **Telefonnummer** – die 0180er-Nummer benötigt nach § 66a TKG eine Preisangabe
3. **E-Mail-Adresse** `info@mare-print.de` bestätigen
4. **Hoster und Löschfristen** in `datenschutz.html` (gelb markiert)
5. **Materialangaben** (Grammaturen, Bahnbreiten, Haltbarkeiten) gegen das
   tatsächliche Sortiment prüfen

## Lokal testen

```bash
cd sites/mare-print
python3 -m http.server 8000
# http://localhost:8000
```

## Vercel

Eigenes Projekt anlegen, **Root Directory** auf `sites/mare-print` setzen,
Framework-Preset `Other`. Kein Build-Command nötig.
