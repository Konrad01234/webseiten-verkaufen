# MARE-Print · Verkaufsunterlage

Neunseitiges Verkaufs-PDF zur Website in `sites/mare-print/`. Gleiche Gestaltung
wie die Website selbst: Passermarken, Farbkontrollstreifen, CMYK, Papierton,
dieselben Schriften.

| Datei | Inhalt |
|---|---|
| `MARE-Print-Entwurf-und-Angebot.pdf` | Das fertige Dokument (A4, 9 Seiten, ~2,7 MB) |
| `verkaufsunterlage.html` | Quelle – hier werden Texte und Platzhalter bearbeitet |
| `bilder/` | Screenshots der Website, automatisch erzeugt |
| `screenshots.js` | Nimmt die Screenshots neu auf |
| `pdf.js` | Rendert das HTML nach PDF und prüft auf Seitenüberlauf |

## Vor dem Versenden ausfüllen

Alle offenen Felder sind im PDF **gelb hinterlegt**:

* Seite 1 – Absender (Name, Firma, Telefon, E-Mail), Gültigkeitsdatum
* Seite 2 – Unterschrift
* Seite 8 – Einmalbetrag, laufende Kosten, Fertigstellungszeitraum
* Seite 9 – Vorschau-Adresse der Website, Kontaktdaten

Bearbeitet werden sie in `verkaufsunterlage.html` (Suche nach `class="ph"`),
danach das PDF neu erzeugen.

## Neu erzeugen

```bash
# 1 · Website lokal bereitstellen (nur nötig, wenn Screenshots neu sollen)
cd sites/mare-print && python3 -m http.server 8123 &

# 2 · Screenshots neu aufnehmen
node verkauf/mare-print/screenshots.js

# 3 · PDF rendern
node verkauf/mare-print/pdf.js
```

Die Screenshots werden mit `reducedMotion: 'reduce'` aufgenommen, damit
Zähler und Animationen ihren Endzustand zeigen statt einen Zwischenstand.

## Hinweis zur Dateigröße

Der Papierkorn-Effekt liegt bewusst in einem `@media screen`-Block. Im Druck
erzwingt `mix-blend-mode` sonst die Rasterung ganzer Seiten – das PDF wächst
dadurch von 2,7 MB auf über 14 MB.
