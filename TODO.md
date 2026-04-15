# EasyJobs — Offene Aufgaben & Roadmap

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
- [ ] **AGB an Realität anpassen** — erwähnt „Boost-Pakete" (nicht implementiert) → entfernen
  - Datei: `app.js` → `renderAGB()`
- [ ] **Admin-E-Mails anpassen** in `app.js` (aktuell `kwg.range@web.de`, `jojo102009@icloud.com`)

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
- [ ] **Employer-Approval-Workflow UI fertigstellen**
  - Admin-Panel: Liste ausstehender Arbeitgeber + Freischalten-Button
  - Status-Badge im Employer-Dashboard („wartet auf Freischaltung")
- [ ] **Geofilter / Suchradius** vervollständigen (aktuell teilweise implementiert)

### SEO
- [x] **JSON-LD JobPosting** für Google for Jobs — *Commit f393f91*
- [x] **Dynamische sitemap.xml** via Cloudflare Pages Function (`functions/sitemap.xml.js`) + `robots.txt` verweist darauf
- [ ] **`<link rel="canonical">` pro Job** dynamisch setzen (aktuell immer `/`)
- [ ] **Meta-Title & -Description pro Seite** dynamisch (aktuell statisch)
- [ ] Google Search Console einrichten + Sitemap einreichen (nach Go-Live)

### Accessibility
- [x] `aria-label` auf icon-only Buttons (Save-Heart, Menü-Toggle, Mobile-Profil, Modal-Close, Social-Icons)
- [x] Fokus-Sichtbarkeit (`:focus-visible` Outlines global in style.css)
- [x] Chat-Input mit Label verknüpft (sr-only Label)
- [x] Modal mit `role="dialog"` + `aria-modal` + `aria-labelledby`
- [x] Nutzer-Avatar als keyboard-bedienbarer Button (Enter/Space)
- [ ] `alt`-Attribute auf Company-Logo-Bildern und Job-Images (aktuell Hintergrundbilder, kein `<img>`)
- [ ] Heading-Hierarchie durchgehend prüfen (h1→h2→h3 ohne Sprünge)
- [ ] Farbkontrast (graue Texte auf weiß — z. T. unter WCAG AA)
- [ ] Vollständiger Screen-Reader-Durchlauf (NVDA / VoiceOver)

---

## 🟢 NICE TO HAVE (Polish)

### Design
- [ ] Dark Mode
- [ ] Admin-Panel responsive optimieren (Tabellen/Charts auf Mobile)
- [ ] Ladeanimationen/Skeleton-Screens einheitlich

### Features
- [ ] Stripe-Integration für Boost-Pakete (falls Monetarisierung kommt)
- [ ] Push-Notifications für Chat (PWA Service Worker)
- [ ] Mehrsprachigkeit (hreflang, Englisch als zweite Sprache)
- [ ] Job-Alerts per E-Mail (tägliche/wöchentliche Zusammenfassung)
- [ ] Job-Sharing per WhatsApp/Instagram

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
