# WorkPilot — Offene Aufgaben & Roadmap

> **Single Source of Truth** für alles, was noch gemacht werden muss.
> Diese Datei wird bei jeder Änderung aktualisiert — nach „erledigt" oder „neu dazu".
> Stand: 2026-04-15

---

## 🚦 Legende

- 🔴 **Blocker** — muss VOR Go-Live erledigt sein (rechtlich/kritisch)
- 🟡 **Wichtig** — sollte bald erledigt werden (Funktionalität/SEO)
- 🟢 **Nice to have** — kann später kommen (Polish)
- ✅ Erledigt

---

## 🔴 BLOCKER (vor Launch zwingend)

### Legal & Compliance
- [ ] **Impressum mit echten Daten füllen** — aktuell Dummy („Max Mustermann", „Musterstraße 1", „HRB 123456")
  - Betreiber-Name, Adresse, Handelsregister-Nummer, USt-ID, Geschäftsführer
  - Datei: `app.js` → `renderImpressum()`
- [ ] **Datenschutzerklärung personalisieren** — aktuell Vorlagentext
  - Namentliche Nennung Betreiber, Supabase als Auftragsverarbeiter, hCaptcha, Cookies
  - Datei: `app.js` → `renderDatenschutz()`
- [x] **AGB: „Boost-Pakete"-Erwähnung entfernt**, durch „Kostenfreiheit"-Abschnitt ersetzt — `app.js` → `renderAGB()` + Datenschutz § 8 mitgefixt
- [x] **Admin-E-Mails bestätigt** — `kwg.range@web.de` und `jojo102009@icloud.com` sind die echten Admin-Adressen (kein Platzhalter). Genutzt in `app.js:497`, `supabase-security-hardening.sql`, `supabase-add-approval.sql`.

### Datenbank-Migrations
- [x] Im Supabase SQL Editor eingespielt (von User bestätigt 2026-04-15):
  1. `supabase-schema.sql` ✅
  2. `supabase-security-hardening.sql` ✅
  3. `supabase-add-approval.sql` (Arbeitgeber-Freischaltung) ✅
  4. `supabase-add-worker-fields.sql` (CV, Skills) ✅
  5. `supabase-add-storage.sql` (Bilder-Bucket + RLS) ✅
  6. `supabase-add-cron.sql` (Auto-Archivierung alter Jobs) ✅
- [x] In Supabase Storage public bucket „images" angelegt ✅
- [ ] RLS-Policies nach Einspielen prüfen (Smoke-Test: Jobs posten, Bewerbung senden)
- [ ] **`supabase-hardening-v2.sql` einspielen** — schliesst 6 Security-Luecken aus dem Code-Audit (Email-Spoofing → Admin, Storage-Pfad-Hijacking, Worker-Status-Escalation, UPDATE-ohne-WITH-CHECK, Review-Dedup, atomic Job-Metric-Increment). **Pflicht vor Go-Live.**

### Deployment
- [ ] Eigene Domain einrichten (aktuell vermutlich nur `*.pages.dev`)
- [ ] HTTPS / HSTS bestätigen (ist via `_headers` schon konfiguriert)
- [ ] Cloudflare Pages Build-Settings prüfen (Branch `main` → Deployment)

---

## 🟡 WICHTIG (kurzfristig)

### Funktionalität
- [ ] **E-Mail-Benachrichtigungen** implementieren (aktuell komplett fehlend)
  - Neue Bewerbung → Mail an Arbeitgeber
  - Neue Chat-Nachricht → Mail an Empfänger
  - Bewerbung angenommen/abgelehnt → Mail an Bewerber
  - Umsetzung: Supabase Edge Function + Resend/SendGrid oder Supabase SMTP
- [x] **Employer-Approval-Workflow UI fertiggestellt** — prominente „Wartet auf Freischaltung"-Karte oben im Admin-Panel (gelber Alarm-Banner, Freischalten-/Ablehnen-Buttons). Status-Badge im Employer-Dashboard war schon da.
- [x] **Geofilter / Suchradius** vervollständigt — `updateJobDistances()` jetzt async, geocoded User-Adresse UND alle Job-Städte via Nominatim (OSM) mit localStorage-Cache + Rate-Limit (1 req/s). KNOWN_LOCATIONS auf ~70 deutsche Städte erweitert (Fast-Path ohne API-Call). UI-Feedback via Spinner + „Entfernungen werden berechnet…" beim Tippen. Ersetzt die hart-kodierte Düsseldorf/Neuss-PLZ-Logik.

### SEO
- [x] **JSON-LD JobPosting** für Google for Jobs — *Commit f393f91*
- [x] **Dynamische sitemap.xml** via Cloudflare Pages Function (`functions/sitemap.xml.js`) + `robots.txt` verweist darauf
- [x] **Dynamische `<link rel="canonical">`, `<title>`, `<meta description>`, `og:*`, `twitter:*`** pro Seite via `updatePageMeta()`
- [ ] Google Search Console einrichten + Sitemap einreichen (nach Go-Live)

### Accessibility
- [x] `aria-label` auf icon-only Buttons (Save-Heart, Menü-Toggle, Mobile-Profil, Modal-Close, Social-Icons)
- [x] Fokus-Sichtbarkeit (`:focus-visible` Outlines global in style.css)
- [x] Chat-Input mit Label verknüpft (sr-only Label)
- [x] Modal mit `role="dialog"` + `aria-modal` + `aria-labelledby`
- [x] Nutzer-Avatar als keyboard-bedienbarer Button (Enter/Space)
- [x] `alt`-Attribute auf CV-Profilbildern (3 Templates)
- [x] Heading-Hierarchie auf Job-Detailseite gefixt (h1 → h2 statt h1 → h3-Sprung)
- [x] **Company-Logos auf `<img alt="">`** — neue `companyLogoHtml()`-Helfer ersetzt das inline-background-image-Pattern. Data-URL-Logos rendern als `<img alt="Logo von FIRMA">`, Fallback bleibt dekorativer `<div aria-hidden="true">` mit Initial. Auch Company-Images (Profil-Galerie, Job-Image-Picker) und Job-Detail-Bilder auf `<img alt="">` umgebaut. Upload-Target für Firmenlogo ist jetzt ein `<button>` mit `aria-label="Firmenlogo hochladen"`.
- [x] **Farbkontrast** — alle `color: var(--gray-400)` Vorkommen in `style.css` und `app.js` (30+ Stellen) auf `var(--gray-500)` upgegradet → 4.83:1 auf Weiß statt 2.85:1. Footer-Text von `--gray-400` auf `--gray-300` (deutlich über AA auf Dark). Alle graue Texte erfüllen jetzt WCAG AA.
- [x] **Screen-Reader-Verbesserungen** — `<h1 class="sr-only">` auf Jobs-Seite, Suchfeld hat `<label>`+`aria-label`, Adressfeld via `aria-labelledby` mit dem h4 verknüpft, Ergebnis-Counter als `aria-live="polite"`. Job-Images mit individuellen Alt-Texten („Eindruck vom Arbeitsplatz N von M"). Image-Picker im Post-Job-Wizard umgebaut auf `<button aria-pressed>` statt klickbarem Div.

---

## 🟢 NICE TO HAVE (Polish)

### Design
- [ ] Dark Mode
- [x] **Mobile-Overhaul v2** — globaler `@media (max-width: 640px)`-Block in `style.css` schließt die Lücke zwischen den 768px/480px-Queries. Gefixt: Nav (Desktop-Links auf Mobile versteckt, nur Hamburger), iOS-Input-Zoom (16px erzwungen), Job-Suche Sidebar stacked, Job-Detail stacked, Admin-Panel KPI/Tabellen scrollable, Chat-/Messages-Layout stacked, Touch-Targets ≥ 40px, Hero/Headings kleiner, Footer 2-spaltig.
- [x] **Mobile-Filter-Drawer** auf Jobs-Seite — Filter sind auf Mobile eingeklappt, Toggle-Button oben zeigt Anzahl aktiver Filter. Spart Scroll-Weg bis zum ersten Job-Ergebnis.
- [x] **Register-Seite Mobile** — Inline `max-width:500px` entfernt, Role-Selector-Karten kompakter, hCaptcha-Widget skaliert, Paddings reduziert.
- [x] **Skeleton-Screens** — Shimmer-Platzhalter in Job-Suche, Bewerbungen, Nachrichten-Liste und Chat-Detail. CSS-Utilities (`skeleton`, `skeleton-job-card`, `skeleton-chat-row`, `skeleton-msg-bubble`) in `style.css` + Template-Funktionen `skeletonJobCard/Grid/ChatRow/ChatList/ChatMessages` in `app.js`. Berücksichtigt `prefers-reduced-motion`. Neue State-Flag `state.chatsLoaded` + `state._activeChatLoading` für Chat-Detail.

### Features
- [ ] Stripe-Integration für Boost-Pakete (falls Monetarisierung kommt)
- [ ] Push-Notifications für Chat (PWA Service Worker)
- [ ] Mehrsprachigkeit (hreflang, Englisch als zweite Sprache)
- [ ] Job-Alerts per E-Mail (tägliche/wöchentliche Zusammenfassung)
- [x] **Job-Sharing** via Web-Share-API (mobil nativ) + WhatsApp/E-Mail/X/Link-kopieren Fallback-Menü. Share-Button auf Job-Detailseite.

### Code-Qualität
- [ ] `app.js` modularisieren (aktuell 5800+ Zeilen in einer Datei)
- [ ] Unit-Tests für kritische DB-Funktionen
- [ ] TypeScript-Migration (optional)

---

## ✅ BEREITS ERLEDIGT

- Supabase Auth + RLS
- Job-Posting / Suche / Bewerbungen (DB-gestützt)
- Realtime-Chat
- CV-Builder mit 3 Vorlagen
- Support-Tickets
- Admin-Panel (Basis)
- Bewertungssystem
- Cookie-Banner (DSGVO)
- hCaptcha Bot-Schutz
- Responsive Design (Breakpoints 768/640/480/380)
- Security Headers (`_headers` mit CSP/HSTS/…)
- **JSON-LD JobPosting strukturierte Daten** ← Commit f393f91
- **Dynamische sitemap.xml** via Cloudflare Pages Function
- **Accessibility-Grundlagen** (aria-label, focus-visible, dialog-roles, sr-only)

---

## 📌 Kommandos für Claude

Wenn du der nächsten Claude-Session sagst:

- **„live"** → Checkliste aus 🔴 BLOCKER abarbeiten/prüfen
- **„weiter mit N"** → Nummer aus der obigen Liste angehen
- **„was fehlt noch"** → diese Datei als Antwort zusammenfassen
- **„alles alles"** → diese komplette Liste vorlesen

Claude soll diese Datei nach jeder abgeschlossenen Aufgabe **aktualisieren**
(erledigte Punkte abhaken, neue Erkenntnisse ergänzen).
