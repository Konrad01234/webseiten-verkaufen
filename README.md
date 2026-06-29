# webseiten-verkaufen

Monorepo mit mehreren eigenständigen Webseiten. Jede Webseite liegt in `sites/<name>/` und wird als eigenes Vercel-Projekt deployed.

## Struktur

```
sites/
└── davids/        Davids im Landhaus – Restaurant Neuss (statisches HTML + CSS + JS)
```

## Vercel-Setup

Für jede Seite ein eigenes Vercel-Projekt:

1. In Vercel **Add New Project** → dieses Repo auswählen
2. **Root Directory** auf den jeweiligen Ordner setzen:
   - Projekt „davids" → Root Directory `sites/davids`
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
