# Café Elisa – Erfurt

Statische Website (HTML + CSS + Vanilla JS) für das **Café Elisa**,
Neuwerkstraße 28, 99084 Erfurt – das pastellrosa Café nahe der Altstadt.

## Seiten

- `index.html` – Start: Hero, Willkommen, Angebot, Event-Teaser, Bewertungen, Öffnungszeiten + Karte
- `speisekarte.html` – Frühstück, Torten, Bubble Waffeln & Crêpes, Eis, Getränke (ohne Preise – Hinweis auf Karte im Café)
- `eventlocation.html` – Geburtstage, Babypartys, Torten auf Bestellung, Catering
- `galerie.html` – 12 Foto-Slots
- `kontakt.html` – Kontakt, Öffnungszeiten, Google-Maps-Karte
- `impressum.html` / `datenschutz.html` – Rechtstexte (offene Angaben sind mit gelben Hinweis-Boxen markiert)

## Vor dem Livegang

1. **Fotos** nach `img/` legen – Dateinamen siehe `img/README.md`. Ohne Fotos zeigt die Seite automatische Platzhalter.
2. **Impressum/Datenschutz**: Inhaber-Name und ggf. USt-IdNr. eintragen (gelbe Boxen entfernen).
3. **Fakten prüfen**: Öffnungszeiten (Mo–Fr 9:15–18, Sa 8:30–18, So 8:45–18, kein Ruhetag), Telefon 0160 8528627, info@cafeelisa.de – Stand Juli 2026, mit dem Café bestätigen.

## Lokal testen

```bash
cd sites/cafe-elisa
python3 -m http.server 8000
# http://localhost:8000 öffnen
```

## Vercel

Eigenes Projekt anlegen, Root Directory `sites/cafe-elisa`, Framework Preset „Other".
