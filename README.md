# webseiten-verkaufen

Monorepo mit allen Webseiten. Jede Webseite liegt in einem eigenen Ordner unter
`sites/<name>/` und ist für sich lauffähig – ein Ordner = eine Webseite = ein
Deployment.

## Struktur

```
sites/
├── davids/                  Davids im Landhaus – Restaurant Neuss
├── eiscafefranco/           Eiscafé de Franco – Eisdiele
├── burger/                  Burger Brothers – Burger-Restaurant Berlin (statisch)
├── burger-brothers-nextjs/  Burger Brothers – dieselbe Seite als Next.js-App
├── handwerker/              Meisterbetrieb Schmidt – Handwerksbetrieb
└── zero-titanium/           ZERO° Titanium – Produkt-Landingpage (Thermosflasche)
```

## Die einzelnen Seiten

| Ordner | Seite | Technik | Einstiegsdatei |
| --- | --- | --- | --- |
| `sites/davids` | Davids im Landhaus (Restaurant, Neuss) | statisches HTML + CSS + JS, eigene Bilder unter `img/` | `index.html` |
| `sites/eiscafefranco` | Eiscafé de Franco | statischer HTML-Export (`*.dc.html`) | `startseite.dc.html` |
| `sites/burger` | Burger Brothers (Berlin) | statisches HTML + CSS, CSS zusätzlich inline | `index.html` |
| `sites/burger-brothers-nextjs` | Burger Brothers | Next.js + TypeScript + Tailwind (`npm install && npm run dev`) | `app/page.tsx` |
| `sites/handwerker` | Meisterbetrieb Schmidt | statisches HTML + CSS + JS, Bilder unter `images/` | `index.html` |
| `sites/zero-titanium` | ZERO° Titanium (Produkt-Landingpage) | eine HTML-Datei, Bilder relativ daneben | `index.html` |

Hinweise:

- `sites/burger` und `sites/burger-brothers-nextjs` sind **dieselbe** Webseite in
  zwei Varianten: einmal rein statisch (kein Build nötig) und einmal als
  Next.js-App. Für ein Deployment reicht eine der beiden.
- `sites/eiscafefranco` hat keine `index.html`; Startseite ist
  `startseite.dc.html`. Beim Hosten also entweder die Datei umbenennen oder im
  Hoster ein Rewrite auf `startseite.dc.html` setzen.

## Vercel-Setup

Für jede Seite ein eigenes Vercel-Projekt:

1. In Vercel **Add New Project** → dieses Repo auswählen
2. **Root Directory** auf den jeweiligen Ordner setzen, z. B.
   Projekt „davids" → Root Directory `sites/davids`
3. **Framework Preset**: `Other` (statisches HTML, kein Build nötig).
   Nur `sites/burger-brothers-nextjs` braucht das Preset `Next.js`.
4. Production Branch: den Branch setzen, auf dem die Seiten liegen

Danach deployed jeder Push auf den Branch alle Projekte parallel. Wenn du mit
**Ignored Build Step** arbeiten willst (damit nur die geänderte Seite neu
gebaut wird), trage pro Projekt in den Vercel-Settings ein:

```bash
git diff HEAD^ HEAD --quiet ./
```

## GitHub Pages

`.github/workflows/pages.yml` deployt aktuell nur `sites/davids` (manuell über
Actions → „Run workflow"). GitHub Pages kann pro Repo nur eine Seite hosten –
für die anderen Seiten den `path` im Workflow umstellen oder Vercel nutzen.

## Lokal testen

```bash
cd sites/davids          # oder burger, handwerker, zero-titanium, eiscafefranco
python3 -m http.server 8000
# http://localhost:8000 öffnen
```

Für die Next.js-Variante:

```bash
cd sites/burger-brothers-nextjs
npm install
npm run dev
```
