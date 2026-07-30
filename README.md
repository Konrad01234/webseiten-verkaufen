# webseiten-verkaufen

Monorepo mit mehreren eigenständigen Webseiten. Jede Webseite liegt in `sites/<name>/` und wird als eigenes Vercel-Projekt deployed.

## Struktur

```
sites/
├── davids/        Davids im Landhaus – Restaurant Neuss (statisches HTML + CSS + JS)
└── boostwerk/     Boostwerk Köln – Kfz-Werkstatt Köln-Ostheim (statisches HTML + CSS + JS)

assets/
├── fotos/         Gemeinsame Foto-Bibliothek für alle Seiten (Originale)
│   ├── BILDNACHWEIS.md      Lizenzregister – für jedes Bild Herkunft und Status
│   └── kfz-werkstatt/       Werkstattmotive
└── fonts/         Schriften zum lokalen Einbinden (Archivo, Inter) + Lizenzen

tools/
└── bilder.py      Fotos auf Web-Maße bringen und als WebP + JPEG speichern
```

## Werkzeuge

```bash
# Fotos für eine Seite aufbereiten (webp + jpg, EXIF-Drehung, Zielbreite)
python3 tools/bilder.py ~/fotos --ziel sites/boostwerk/img/fotos

# Vorher anschauen, ohne zu schreiben
python3 tools/bilder.py ~/fotos --ziel sites/boostwerk/img/fotos --probe
```

Presets: `hero` 1800 px, `band` 1600 px, `galerie` 1100 px, `portraet` 900 px,
`logo` 600 px. Braucht einmalig `pip install Pillow`.

## Schriften

`assets/fonts/` enthält Archivo und Inter als Variable Fonts im woff2-Format,
dazu die Lizenztexte (SIL Open Font License 1.1). Sie sind dafür gedacht,
**lokal** eingebunden zu werden statt über Google Fonts.

> Das ist kein Detail: Das Einbinden von Google Fonts überträgt die IP-Adresse
> jedes Besuchers an Google. Das LG München hat dafür 2022 Schadenersatz
> zugesprochen, danach gingen reihenweise Abmahnschreiben an kleine Firmenseiten
> raus. Für jede neue Seite gilt deshalb: Schriften aus `assets/fonts/` in den
> Seitenordner kopieren und per `@font-face` einbinden – nicht per `@import` von
> `fonts.googleapis.com`. Ein fertiges Beispiel steht oben in
> `sites/boostwerk/styles.css`.

## Bilder

`assets/fotos/` ist die zentrale Bibliothek für Fotos, die auf mehreren Seiten
verwendet werden können. Dort liegen die **Originale**; für den Einsatz wandert
jeweils eine verkleinerte Kopie in `sites/<name>/img/`.

Der Ordner liegt absichtlich **außerhalb** der Vercel-Root-Directories und wird
daher nicht mit ausgeliefert.

> **Wichtig:** Jedes Bild braucht vor der Veröffentlichung eine geklärte
> Rechtelage – in Deutschland ist die Nutzung fremder Fotos ein häufiger
> Abmahngrund, und es haftet der Website-Betreiber. Deshalb ist zu jedem Bild in
> `assets/fotos/BILDNACHWEIS.md` festgehalten, woher es kommt. Bilder mit dem
> Status `UNGEKLÄRT` tragen auf der Seite ein sichtbares gelbes Platzhalter-Label
> und dürfen nicht live gehen.

## Vercel-Setup

Für jede Seite ein eigenes Vercel-Projekt:

1. In Vercel **Add New Project** → dieses Repo auswählen
2. **Root Directory** auf den jeweiligen Ordner setzen:
   - Projekt „davids" → Root Directory `sites/davids`
   - Projekt „boostwerk" → Root Directory `sites/boostwerk`
3. **Framework Preset**: `Other` (statisches HTML, kein Build nötig)
4. Production Branch: `claude/vercel-deployment-branch-VgNvi` (oder den, den du als Default setzt)

Danach deployed jeder Push auf den Branch alle Projekte parallel. Wenn du mit
**Ignored Build Step** arbeiten willst (damit nur die geänderte Seite neu
gebaut wird), trage pro Projekt in den Vercel-Settings ein:

```bash
git diff HEAD^ HEAD --quiet ./
```

## Lokal testen

```bash
cd sites/davids
python3 -m http.server 8000
# http://localhost:8000 öffnen
```
