# Stockfoto-Bibliothek

Gemeinsamer Ablageort für Stockfotos, die in **mehreren** Webseiten dieses Repos
verwendet werden können. Liegt bewusst außerhalb von `sites/`, damit die Bilder
nicht an eine einzelne Seite gebunden sind.

## Warum hier und nicht nur in `sites/<name>/img/`

Vercel deployt jede Seite mit einem eigenen **Root Directory** (`sites/<name>`).
Dateien außerhalb dieses Ordners landen nicht im Deployment. Dieser Ordner ist
deshalb das **Original-Archiv**; in die einzelnen Seiten wird jeweils eine Kopie
gelegt.

```bash
# Bild in eine Seite übernehmen
cp assets/stock/kfz/werkstatt-hebebuehne.webp sites/ramona-daurelio/img/stock-werkstatt.jpg
```

Der Dateiname im Zielordner darf abweichen – entscheidend ist, dass er zu dem
passt, was das HTML der jeweiligen Seite erwartet.

## Ordnerstruktur

```
assets/stock/
├── README.md      diese Datei
├── CREDITS.md     Quelle und Lizenz je Bild – IMMER mitpflegen
└── kfz/           Kfz-Handwerk: Werkstatt, Lackiererei, Aufbereitung, Personen
```

## Regeln

1. **Jedes Bild bekommt einen Eintrag in `CREDITS.md`.** Ohne Lizenzangabe wird
   kein Bild eingecheckt – sonst weiß später niemand mehr, ob es verwendet werden
   darf.
2. **Nur Bilder mit klarer kommerzieller Nutzungslizenz.** Geeignet sind
   Unsplash, Pexels (beide erlauben kommerzielle Nutzung ohne Namensnennung),
   Pixabay (Einzelfall prüfen) oder gekaufte Lizenzen. **Nicht** geeignet sind
   Bilder aus der Google-Bildersuche, Vorschaubilder von Shutterstock, iStock,
   Adobe Stock, Alamy oder Freepik/Magnific – die sind lizenzpflichtig, tragen
   meist ein Wasserzeichen und dürfen nicht auf eine Kundenseite.
3. **Dateiformat:** WebP oder JPEG, längste Kante mindestens 1600 px.
   Sprechende Dateinamen in Kleinschreibung mit Bindestrich.
4. **Kennzeichnung auf der Website:** Stockfotos zeigen nicht den echten Betrieb.
   Sie werden deshalb auf der Seite als Stockfoto gekennzeichnet (in der Galerie
   direkt an der Bildunterschrift) und im Bildnachweis des Impressums aufgeführt.

## Benötigte Motive für `sites/ramona-daurelio`

| Zieldatei in der Seite | Format | Motiv |
|---|---|---|
| `img/stock-werkstatt.jpg` | 4:3 quer | Werkstatthalle, Fahrzeug auf der Hebebühne |
| `img/stock-lackierkabine.jpg` | 4:3 quer | Lackierer mit Spritzpistole in der Lackierkabine |
| `img/stock-politur.jpg` | 4:3 quer | Poliermaschine auf lackierter Fläche, Nahaufnahme |
| `img/stock-mechanikerin.jpg` | 4:3 quer | Kfz-Mechanikerin in Arbeitskleidung am Fahrzeug |
| `img/stock-mechanikerin-portrait.jpg` | 4:5 hoch | Porträt einer Mechanikerin, Werkstatt dahinter |

Suchbegriffe: `car body shop`, `auto repair shop interior`, `car on lift`,
`spray painting car`, `paint booth automotive`, `female mechanic`,
`woman car mechanic workshop`, `car polishing detail`.
