# webseiten-verkaufen

Monorepo mit mehreren eigenständigen Webseiten. Jede Webseite liegt in `sites/<name>/` und wird als eigenes Vercel-Projekt deployed.

## Struktur

```
sites/
├── davids/        Davids im Landhaus – Restaurant Neuss (statisches HTML + CSS + JS)
└── ac-caspari/    AC Caspari – Kfz-Meisterbetrieb Hamm-Werries (statisches HTML + CSS + JS)

assets/
├── fonts/         Schriften für alle Seiten (lokal, kein Google Fonts)
└── fotos/         zentraler Bildpool + BILDNACHWEIS.md (Lizenzregister)

tools/
└── bilder.py      Fotos für den Web-Einsatz aufbereiten (WebP + JPEG)
```

`assets/` und `tools/` liegen außerhalb der Vercel-Root-Directories und werden
deshalb **nicht** mit ausgeliefert – das ist gewollt.

> **Vor jedem Livegang:** `assets/fotos/BILDNACHWEIS.md` lesen. Dort steht zu
> jedem Bild, ob die Rechtelage geklärt ist. Bilder mit Status `UNGEKLÄRT`
> dürfen nicht online gehen.

## Vercel-Setup

Für jede Seite ein eigenes Vercel-Projekt:

1. In Vercel **Add New Project** → dieses Repo auswählen
2. **Root Directory** auf den jeweiligen Ordner setzen:
   - Projekt „davids" → Root Directory `sites/davids`
   - Projekt „ac-caspari" → Root Directory `sites/ac-caspari`
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
