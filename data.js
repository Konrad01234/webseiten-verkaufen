// ===== MOCK DATA =====

const JOBS = [
  {
    id: 1, title: 'Aushilfe im Einzelhandel', company: 'MediaMarkt', companyLogo: '🛒',
    location: 'Musterstraße 12, 10115 Berlin', city: 'Berlin', distance: 3.2,
    type: 'Minijob', hours: '10-15 Std/Woche', salary: '12,50€/Std',
    category: 'Einzelhandel', posted: '2026-03-22', expires: '2026-04-22',
    views: 342, clicks: 89, applications: 12, promoted: true,
    tags: ['Kundenservice', 'Kasse', 'Warenpflege'],
    description: `<h3>Deine Aufgaben</h3>
      <ul><li>Beratung und Betreuung unserer Kunden</li><li>Kassieren und Warenverräumung</li><li>Unterstützung bei Inventuren</li></ul>
      <h3>Das bringst du mit</h3>
      <ul><li>Freundliches und offenes Auftreten</li><li>Zuverlässigkeit und Teamfähigkeit</li><li>Mindestens 16 Jahre alt</li></ul>
      <h3>Das bieten wir</h3>
      <ul><li>Flexible Arbeitszeiten</li><li>Mitarbeiterrabatte</li><li>Nettes Team und gute Einarbeitung</li></ul>`,
    images: ['Filiale Außenansicht', 'Unser Team', 'Arbeitsplatz'],
    companyInfo: { employees: '45.000+', founded: '1979', industry: 'Elektronik-Einzelhandel', instagram: '@mediamarkt_de', website: 'mediamarkt.de',
      about: 'MediaMarkt ist Europas größter Elektronik-Fachhändler.' },
    reviews: [
      { author: 'Lisa M.', rating: 4, text: 'Tolles Team und flexible Zeiten!', date: '2026-02-15', active: true },
      { author: 'Tom K.', rating: 5, text: 'Super Einarbeitung, kann ich empfehlen.', date: '2026-01-20', active: true }
    ]
  },
  {
    id: 2, title: 'Kellner/in im Café', company: 'Café Sonnenschein', companyLogo: '☕',
    location: 'Hauptstraße 45, 10117 Berlin', city: 'München', distance: 1.8,
    type: 'Minijob', hours: '15-20 Std/Woche', salary: '13€/Std + Trinkgeld',
    category: 'Gastronomie', posted: '2026-03-20', expires: '2026-04-20',
    views: 567, clicks: 134, applications: 23, promoted: false,
    tags: ['Service', 'Gastronomie', 'Teamarbeit'],
    description: `<h3>Deine Aufgaben</h3>
      <ul><li>Bedienung unserer Gäste</li><li>Getränke und Speisen servieren</li><li>Bestellungen aufnehmen</li></ul>
      <h3>Das bringst du mit</h3>
      <ul><li>Freundliches Auftreten</li><li>Teamfähigkeit</li><li>Verfügbar am Wochenende</li></ul>
      <h3>Das bieten wir</h3>
      <ul><li>Kostenloses Essen während der Schicht</li><li>Trinkgeld</li><li>Familiäre Atmosphäre</li></ul>`,
    images: ['Unser Café', 'Terrasse'],
    companyInfo: { employees: '12', founded: '2018', industry: 'Gastronomie', instagram: '@cafe_sonnenschein', website: 'cafe-sonnenschein.de',
      about: 'Gemütliches Café im Herzen Berlins mit hausgemachten Kuchen und Spezialitäten.' },
    reviews: [
      { author: 'Anna S.', rating: 5, text: 'Beste Chefin ever! Sehr verständnisvoll mit Schulzeiten.', date: '2026-03-01', active: true }
    ]
  },
  {
    id: 3, title: 'Lagerhelfer/in', company: 'Amazon Logistik', companyLogo: '📦',
    location: 'Industriepark 5, 12345 Berlin', city: 'Hamburg', distance: 12.5,
    type: 'Ferienjob', hours: '30-40 Std/Woche', salary: '14€/Std',
    category: 'Logistik', posted: '2026-03-18', expires: '2026-05-01',
    views: 892, clicks: 256, applications: 45, promoted: true,
    tags: ['Lager', 'Kommissionierung', 'Verpackung'],
    description: `<h3>Deine Aufgaben</h3>
      <ul><li>Waren kommissionieren und verpacken</li><li>Bestandskontrolle</li><li>Ordnung im Lager halten</li></ul>
      <h3>Das bringst du mit</h3>
      <ul><li>Körperliche Belastbarkeit</li><li>Zuverlässigkeit</li><li>Mindestens 18 Jahre alt</li></ul>
      <h3>Das bieten wir</h3>
      <ul><li>Überdurchschnittliche Bezahlung</li><li>Kostenloser Shuttle-Service</li><li>Verpflegung vor Ort</li></ul>`,
    images: ['Logistikzentrum', 'Arbeitsbereich'],
    companyInfo: { employees: '1.500.000+', founded: '1994', industry: 'E-Commerce / Logistik', instagram: '@amazon', website: 'amazon.jobs',
      about: 'Amazon ist eines der größten Unternehmen weltweit.' },
    reviews: [
      { author: 'Max B.', rating: 3, text: 'Gute Bezahlung, aber anstrengend.', date: '2026-02-10', active: true }
    ]
  },
  {
    id: 4, title: 'Social Media Praktikant/in', company: 'Creative Agency Berlin', companyLogo: '🎨',
    location: 'Kreuzbergstraße 78, 10965 Berlin', city: 'Köln', distance: 4.1,
    type: 'Praktikum', hours: '20 Std/Woche', salary: '11€/Std',
    category: 'Marketing', posted: '2026-03-23', expires: '2026-04-30',
    views: 234, clicks: 67, applications: 8, promoted: false,
    tags: ['Social Media', 'Content Creation', 'Instagram', 'TikTok'],
    description: `<h3>Deine Aufgaben</h3>
      <ul><li>Content für Social Media erstellen</li><li>Community Management</li><li>Reportings erstellen</li></ul>
      <h3>Das bringst du mit</h3>
      <ul><li>Kreativität und Spaß an Social Media</li><li>Grundkenntnisse in Canva oder Photoshop</li><li>Eigeninitiative</li></ul>
      <h3>Das bieten wir</h3>
      <ul><li>Kreatives Arbeitsumfeld</li><li>Homeoffice möglich</li><li>Portfolio-Aufbau</li></ul>`,
    images: ['Unser Büro', 'Team-Event'],
    companyInfo: { employees: '15', founded: '2020', industry: 'Digitalagentur', instagram: '@creative_agency_bln', website: 'creative-agency.de',
      about: 'Junge Digitalagentur spezialisiert auf Social Media Marketing.' },
    reviews: []
  },
  {
    id: 5, title: 'Nachhilfelehrer/in Mathe', company: 'Schülerhilfe', companyLogo: '📚',
    location: 'Schulstraße 3, 10178 Berlin', city: 'Berlin', distance: 2.0,
    type: 'Minijob', hours: '5-10 Std/Woche', salary: '15€/Std',
    category: 'Bildung', posted: '2026-03-21', expires: '2026-05-15',
    views: 178, clicks: 45, applications: 6, promoted: false,
    tags: ['Nachhilfe', 'Mathematik', 'Bildung'],
    description: `<h3>Deine Aufgaben</h3>
      <ul><li>Nachhilfe in kleinen Gruppen (3-5 Schüler)</li><li>Individuelle Förderung</li><li>Vorbereitung auf Klausuren</li></ul>
      <h3>Das bringst du mit</h3>
      <ul><li>Sehr gute Mathekenntnisse (Abi-Niveau)</li><li>Geduld und Einfühlungsvermögen</li><li>Mindestens 17 Jahre alt</li></ul>
      <h3>Das bieten wir</h3>
      <ul><li>Überdurchschnittliche Bezahlung</li><li>Flexible Terminplanung</li><li>Fortbildungen</li></ul>`,
    images: ['Unterrichtsraum'],
    companyInfo: { employees: '10.000+', founded: '1974', industry: 'Bildung', instagram: '@schuelerhilfe', website: 'schuelerhilfe.de',
      about: 'Deutschlands größtes Nachhilfeinstitut.' },
    reviews: [
      { author: 'Sarah L.', rating: 5, text: 'Perfekt neben dem Studium!', date: '2026-03-10', active: true },
      { author: 'David W.', rating: 4, text: 'Gute Bezahlung und flexible Zeiten.', date: '2026-02-25', active: true }
    ]
  },
  {
    id: 6, title: 'Hundesitter/in', company: 'PawCare Berlin', companyLogo: '🐕',
    location: 'Tiergartenstr. 22, 10785 Berlin', city: 'München', distance: 5.5,
    type: 'Minijob', hours: '8-12 Std/Woche', salary: '12€/Std',
    category: 'Tierpflege', posted: '2026-03-19', expires: '2026-04-19',
    views: 445, clicks: 112, applications: 18, promoted: false,
    tags: ['Tiere', 'Gassi gehen', 'Betreuung'],
    description: `<h3>Deine Aufgaben</h3>
      <ul><li>Hunde ausführen und betreuen</li><li>Fütterung und Pflege</li><li>Kommunikation mit Hundebesitzern</li></ul>
      <h3>Das bringst du mit</h3>
      <ul><li>Liebe zu Tieren</li><li>Verantwortungsbewusstsein</li><li>Wetterfest und sportlich</li></ul>
      <h3>Das bieten wir</h3>
      <ul><li>Arbeit an der frischen Luft</li><li>Flexible Einteilung</li><li>Tolle Hunde!</li></ul>`,
    images: ['Unsere Hunde', 'Im Park'],
    companyInfo: { employees: '8', founded: '2022', industry: 'Tierbetreuung', instagram: '@pawcare_berlin', website: 'pawcare-berlin.de',
      about: 'Premium Hundebetreuung in Berlin.' },
    reviews: [
      { author: 'Emma R.', rating: 5, text: 'Traumjob für Tierliebhaber!', date: '2026-03-05', active: true }
    ]
  },
  {
    id: 7, title: 'IT-Support Werkstudent/in', company: 'TechStart GmbH', companyLogo: '💻',
    location: 'Digitale Allee 10, 10999 Berlin', city: 'Hamburg', distance: 6.3,
    type: 'Minijob', hours: '15-20 Std/Woche', salary: '16€/Std',
    category: 'IT', posted: '2026-03-24', expires: '2026-05-24',
    views: 123, clicks: 34, applications: 3, promoted: false,
    tags: ['IT-Support', 'Hardware', 'Software', 'Netzwerk'],
    description: `<h3>Deine Aufgaben</h3>
      <ul><li>First-Level IT-Support</li><li>Hardware-Setup und Wartung</li><li>Nutzer-Betreuung</li></ul>
      <h3>Das bringst du mit</h3>
      <ul><li>IT-Affinität</li><li>Grundkenntnisse Windows/Mac</li><li>Kommunikationsstärke</li></ul>
      <h3>Das bieten wir</h3>
      <ul><li>Moderne Ausstattung</li><li>Homeoffice teilweise möglich</li><li>Weiterbildungsmöglichkeiten</li></ul>`,
    images: ['Office', 'Team'],
    companyInfo: { employees: '35', founded: '2021', industry: 'IT-Dienstleistung', instagram: '@techstart_gmbh', website: 'techstart.de',
      about: 'Junges IT-Startup mit Fokus auf innovative Lösungen.' },
    reviews: []
  },
  {
    id: 8, title: 'Promoter/in für Events', company: 'EventPro Berlin', companyLogo: '🎉',
    location: 'Partystraße 1, 10243 Berlin', city: 'Köln', distance: 7.8,
    type: 'Minijob', hours: 'Flexibel / Eventbasiert', salary: '13€/Std',
    category: 'Events', posted: '2026-03-17', expires: '2026-04-17',
    views: 678, clicks: 189, applications: 31, promoted: false,
    tags: ['Events', 'Promotion', 'Kommunikation', 'Flyer'],
    description: `<h3>Deine Aufgaben</h3>
      <ul><li>Promotion auf Events und in der Stadt</li><li>Flyer verteilen</li><li>Gäste ansprechen und informieren</li></ul>
      <h3>Das bringst du mit</h3>
      <ul><li>Offenes, kontaktfreudiges Auftreten</li><li>Flexibilität (auch abends/Wochenende)</li><li>Mindestens 16 Jahre</li></ul>
      <h3>Das bieten wir</h3>
      <ul><li>Spannende Events</li><li>Nettes Team</li><li>Sofortige Auszahlung möglich</li></ul>`,
    images: ['Event-Impressionen'],
    companyInfo: { employees: '20', founded: '2019', industry: 'Eventmanagement', instagram: '@eventpro_bln', website: 'eventpro-berlin.de',
      about: 'Berlins angesagteste Eventagentur.' },
    reviews: [
      { author: 'Mia P.', rating: 4, text: 'Macht mega Spaß, lernt man viele Leute kennen!', date: '2026-02-28', active: true }
    ]
  }
];

const TESTIMONIALS = [
  {
    name: 'Lena Müller', role: 'Schülerin, 17 Jahre – Gymnasium München',
    text: 'Über EasyJobs habe ich meinen ersten Minijob im Café gefunden – die App ist super einfach und ich hatte innerhalb von 3 Tagen eine Zusage!',
    rating: 5, initials: 'LM'
  },
  {
    name: 'Jonas Schneider', role: 'Schüler, 16 Jahre – Realschule Hamburg',
    text: 'Der Lebenslauf-Builder hat mir mega geholfen. Ich hatte keine Ahnung wie ich anfangen soll und jetzt habe ich einen richtig professionellen Lebenslauf.',
    rating: 5, initials: 'JS'
  },
  {
    name: 'Sophie Wagner', role: 'Schülerin, 18 Jahre – BOS Nürnberg',
    text: 'Ich konnte genau einstellen wie weit ich fahren will und in welchen Stunden ich arbeiten kann. So einen passenden Job hätte ich alleine nie gefunden.',
    rating: 5, initials: 'SW'
  },
  {
    name: 'Finn Becker', role: 'Schüler, 17 Jahre – Gesamtschule Köln',
    text: 'Der Chat direkt auf der Plattform ist richtig praktisch. Ich musste keine E-Mails schreiben und konnte alle Fragen direkt klären.',
    rating: 4, initials: 'FB'
  },
  {
    name: 'Mia Hofmann', role: 'Schülerin, 16 Jahre – Gymnasium Berlin',
    text: 'Die KI hat mir bei meinem Motivationsschreiben geholfen. Das hat sich wirklich professionell angehört und ich habe den Job bekommen!',
    rating: 5, initials: 'MH'
  },
  {
    name: 'Noah Fischer', role: 'Schüler, 17 Jahre – Handelschule Stuttgart',
    text: 'Gespeicherte Jobs, Filter nach Umkreis, Zeugnisse hochladen – alles an einem Ort. Ich wünschte, so eine Plattform hätte es schon früher gegeben.',
    rating: 5, initials: 'NF'
  }
];

const CATEGORIES = [
  { name: 'Einzelhandel', icon: '🛒', count: 45 },
  { name: 'Gastronomie', icon: '🍽️', count: 38 },
  { name: 'Logistik', icon: '📦', count: 22 },
  { name: 'Marketing', icon: '📱', count: 18 },
  { name: 'IT', icon: '💻', count: 15 },
  { name: 'Bildung', icon: '📚', count: 12 },
  { name: 'Events', icon: '🎉', count: 28 },
  { name: 'Tierpflege', icon: '🐕', count: 8 },
  { name: 'Büro', icon: '🏢', count: 20 },
  { name: 'Handwerk', icon: '🔧', count: 10 }
];

const JOB_TYPES = ['Minijob', 'Ferienjob', 'Praktikum'];

const SKILLS = [
  'Teamarbeit', 'Kundenservice', 'Kommunikation', 'Zuverlässigkeit', 'Flexibilität',
  'Kreativität', 'Organisationstalent', 'Belastbarkeit', 'Eigeninitiative', 'Pünktlichkeit',
  'MS Office', 'Social Media', 'Fremdsprachen', 'Erste-Hilfe', 'Führerschein Klasse B'
];

// Nachrichten für Arbeitnehmer (Konversationen mit Arbeitgebern)
// Chat-Nachrichten werden per-User in localStorage gespeichert.
// Diese Arrays sind nur noch Laufzeit-Cache — beim Login neu befüllt.
let WORKER_CHAT_MESSAGES = [];
let EMPLOYER_CHAT_MESSAGES = [];
const CHAT_MESSAGES = WORKER_CHAT_MESSAGES;

const AI_RESPONSES = [
  // === JOBSUCHE ===
  { keywords: ['16 jahre', 'mit 16', 'ab 16', 'welche jobs', 'alter'],
    answer: 'Mit 16 Jahren darfst du in vielen Bereichen arbeiten! Auf EasyJobs findest du z.B.:\n\n• Aushilfe im Einzelhandel (z.B. MediaMarkt, Supermärkte)\n• Kellner/in im Café oder Restaurant\n• Nachhilfe geben\n• Hundesitting & Tierpflege\n• Promotion & Flyerverteilen\n\nGeh einfach auf "Jobs finden" und filtere nach deiner Stadt und Kategorie. Viele Arbeitgeber suchen gezielt junge, motivierte Leute!' },

  { keywords: ['in meiner nähe', 'in der nähe', 'umkreis', 'umgebung', 'stadt', 'entfernung'],
    answer: 'Ja! Auf EasyJobs kannst du Jobs in deiner Nähe finden:\n\n1. Geh auf "Jobs finden"\n2. Gib deine Stadt ein oder nutze den Umkreis-Filter\n3. Stelle den Radius ein (z.B. 5 km, 10 km, 20 km)\n\nSo siehst du nur Jobs, die du gut erreichen kannst. In deinem Profil kannst du auch deine Adresse und einen Suchradius hinterlegen.' },

  { keywords: ['ohne erfahrung', 'keine erfahrung', 'erster job', 'erstes mal', 'anfänger', 'passen zu mir'],
    answer: 'Keine Sorge – die meisten Jobs auf EasyJobs brauchen keine Vorerfahrung! Besonders gut geeignet für Einsteiger:\n\n• Aushilfe im Einzelhandel – Kasse, Regale auffüllen\n• Gastronomie – Bedienen, Abräumen\n• Promotion – Flyer verteilen auf Events\n• Nachhilfe – wenn du in einem Fach gut bist\n• Tierpflege – Gassi gehen, Hundesitting\n\nTipp: Hebe in deinem Profil deine Stärken hervor (z.B. Teamarbeit, Zuverlässigkeit, Pünktlichkeit). Das zählt oft mehr als Erfahrung!' },

  { keywords: ['ferienjob', 'ferien', 'sommerferien', 'schulferien', 'bester job'],
    answer: 'Die beliebtesten Ferienjobs für Schüler auf EasyJobs:\n\n1. 📦 Lagerhelfer/in – z.B. bei Amazon, DHL (ca. 14€/Std)\n2. 🛒 Aushilfe im Einzelhandel (ca. 12-13€/Std)\n3. 🎉 Event-Promotion – Festivals, Messen (ca. 13€/Std)\n4. ☕ Gastronomie – Cafés, Restaurants (ca. 13€/Std + Trinkgeld)\n\nFerienjobs bieten meist 30-40 Std/Woche und sind perfekt, um in kurzer Zeit gut zu verdienen. Filter auf EasyJobs einfach nach "Ferienjob"!' },

  // === BEWERBUNG ===
  { keywords: ['wie bewerbe', 'bewerben', 'bewerbung schicken', 'bewerbung abschicken'],
    answer: 'So bewirbst du dich auf EasyJobs:\n\n1. Erstelle dein Profil (Name, Fähigkeiten, Verfügbarkeit)\n2. Suche passende Jobs unter "Jobs finden"\n3. Klicke auf einen Job und dann auf "Jetzt bewerben"\n4. Fertig! Der Arbeitgeber sieht dein Profil und meldet sich per Chat\n\nTipp: Je vollständiger dein Profil ist (Lebenslauf, Fähigkeiten, Foto), desto besser stehen deine Chancen!' },

  { keywords: ['lebenslauf', 'cv', 'brauche ich einen'],
    answer: 'Ein Lebenslauf ist nicht zwingend nötig, hilft aber sehr! Auf EasyJobs gibt es einen kostenlosen Lebenslauf-Builder:\n\n1. Geh auf "Lebenslauf" in deinem Dashboard\n2. Wähle eine Vorlage (Modern, Klassisch oder Kreativ)\n3. Fülle deine Daten aus\n4. Fertig – er wird automatisch deinem Profil hinzugefügt\n\nAuch ohne Berufserfahrung kannst du Schulbildung, Hobbys, Ehrenämter und Stärken angeben.' },

  { keywords: ['erste nachricht', 'anschreiben', 'was schreibe ich', 'nachricht an', 'kontakt aufnehmen'],
    answer: 'Eine gute erste Nachricht an den Arbeitgeber ist kurz und freundlich:\n\n"Hallo, ich bin [Name], [Alter] Jahre alt und interessiere mich für die Stelle als [Jobtitel]. Ich bin [1-2 Stärken, z.B. zuverlässig und teamfähig] und könnte ab [Datum] anfangen. Ich freue mich auf eine Rückmeldung!"\n\nTipps:\n• Sei freundlich und direkt\n• Erwähne, warum dich der Job interessiert\n• Schreibe fehlerfrei\n• Stelle eine Frage (zeigt Interesse)' },

  // === ARBEITSBEDINGUNGEN ===
  { keywords: ['verdienen', 'verdienst', 'gehalt', 'stundenlohn', 'geld', 'mindestlohn', 'lohn'],
    answer: 'Als Schüler/in kannst du auf EasyJobs gut verdienen! Typische Stundenlöhne:\n\n• Einzelhandel: 12-13€/Std\n• Gastronomie: 12-14€/Std + Trinkgeld\n• Nachhilfe: 13-18€/Std\n• IT/Büro: 14-17€/Std\n• Lager/Logistik: 13-15€/Std\n\nDer gesetzliche Mindestlohn (12,82€/Std) gilt ab 18 Jahren. Für Minijobs gilt die 538€-Grenze pro Monat – darüber hinaus fallen Steuern an.' },

  { keywords: ['stunden', 'arbeitszeit', 'wie viel arbeiten', 'wie lange arbeiten', 'arbeiten darf'],
    answer: 'Die Arbeitszeiten für Jugendliche sind gesetzlich geregelt:\n\n👤 Unter 15 Jahren: Max. 2 Std/Tag (mit Erlaubnis der Eltern)\n👤 15-17 Jahre: Max. 8 Std/Tag, 40 Std/Woche\n👤 Ab 18 Jahren: Keine besonderen Einschränkungen\n\nWichtig:\n• Nicht vor 6 Uhr und nicht nach 20 Uhr (unter 18)\n• Mindestens 12 Stunden Ruhezeit zwischen den Schichten\n• An Wochenenden nur in bestimmten Branchen (z.B. Gastronomie)' },

  { keywords: ['schulzeit', 'schule', 'während der schule', 'neben der schule', 'schulpflichtig'],
    answer: 'Ja, du darfst neben der Schule arbeiten! Regeln während der Schulzeit:\n\n• 13-14 Jahre: Max. 2 Std/Tag, nur leichte Arbeiten (z.B. Zeitung austragen)\n• 15-17 Jahre: Max. 2 Std an Schultagen, mehr am Wochenende & in Ferien\n• Schulpflicht geht immer vor – dein Job darf die Schule nicht beeinträchtigen\n\nAuf EasyJobs findest du viele Minijobs mit flexiblen Zeiten, die perfekt neben die Schule passen!' },

  // === SICHERHEIT & VERTRAUEN ===
  { keywords: ['seriös', 'vertrauen', 'sicher', 'betrug'],
    answer: 'Gute Frage! Auf EasyJobs achten wir auf Seriosität:\n\n✅ Arbeitgeber werden überprüft\n✅ Bewertungen von anderen Arbeitnehmern sichtbar\n✅ Direkter Chat auf der Plattform\n✅ Keine Vorab-Zahlungen nötig\n\nAchte selbst auf:\n• Hat das Unternehmen ein vollständiges Profil?\n• Gibt es Bewertungen von anderen?\n• Wird ein normaler Stundenlohn angeboten?\n\nWenn dir etwas komisch vorkommt, melde es uns!' },

  { keywords: ['fake', 'gefälscht', 'falsch', 'erkennen', 'warnung'],
    answer: 'So erkennst du unseriöse Job-Angebote:\n\n🚩 Unrealistisch hoher Lohn (z.B. "500€ am Tag")\n🚩 Du sollst vorher Geld bezahlen\n🚩 Keine klare Jobbeschreibung\n🚩 Kommunikation nur per WhatsApp/Telegram statt über die Plattform\n🚩 Kein Firmenname oder keine Adresse\n🚩 Druck, sofort zuzusagen\n\nAuf EasyJobs kannst du Unternehmen anhand ihrer Bewertungen und ihres Profils einschätzen. Im Zweifel: Finger weg und uns melden!' },

  { keywords: ['antwortet nicht', 'keine antwort', 'nicht gemeldet', 'wartezeit', 'warten'],
    answer: 'Wenn ein Arbeitgeber nicht antwortet:\n\n1. Warte 2-3 Werktage – viele Arbeitgeber sind beschäftigt\n2. Schicke eine freundliche Nachfolge-Nachricht über den Chat\n3. Bewirb dich parallel auf andere Jobs – setze nicht alles auf eine Karte!\n\nTipp: Ein vollständiges Profil mit Lebenslauf und Fähigkeiten erhöht deine Antwortchancen deutlich. Arbeitgeber antworten schneller, wenn sie sehen, dass du motiviert bist.' },

  // === ORGANISATION ===
  { keywords: ['mehrere jobs', 'gleichzeitig', 'zwei jobs', 'verschiedene jobs'],
    answer: 'Ja, du kannst mehrere Jobs gleichzeitig haben! Beachte dabei:\n\n• Die 538€-Grenze gilt für alle Minijobs zusammen\n• Deine Arbeitszeiten dürfen sich nicht überschneiden\n• Unter 18: Max. 40 Std/Woche insgesamt\n• Informiere beide Arbeitgeber\n\nAuf EasyJobs kannst du mehrere Jobs speichern und dich auf verschiedene Stellen gleichzeitig bewerben.' },

  { keywords: ['rückmeldung', 'wie schnell', 'wie lange dauert', 'antwortzeit'],
    answer: 'Die Antwortzeit variiert je nach Arbeitgeber:\n\n• Schnelle Antwort: Innerhalb von 1-2 Tagen\n• Normal: 3-5 Werktage\n• Manchmal dauert es bis zu 1-2 Wochen\n\nTipps für schnellere Rückmeldungen:\n• Vervollständige dein Profil (100%)\n• Lade einen Lebenslauf hoch\n• Schreibe eine persönliche Nachricht zum Job\n• Bewirb dich zeitnah nach Veröffentlichung' },

  { keywords: ['nach der bewerbung', 'was passiert', 'nächste schritte', 'ablauf', 'wie läuft', 'prozess'],
    answer: 'So läuft es nach deiner Bewerbung auf EasyJobs ab:\n\n1. 📩 Bewerbung abgeschickt – der Arbeitgeber wird benachrichtigt\n2. 💬 Chat – der Arbeitgeber kann dir direkt schreiben\n3. 📅 Kennenlernen – ihr vereinbart ein Treffen oder Telefonat\n4. ✅ Zusage – ihr klärt Startdatum und Details\n5. 🎉 Jobstart!\n\nDen Status deiner Bewerbungen siehst du jederzeit in deinem Dashboard unter "Bewerbungen".' },

  // === ARBEITGEBER: EINSTELLUNG ===
  { keywords: ['schüler einstellen', 'ab welchem alter', 'einstellen alter', 'minderjährig einstellen'],
    answer: 'Als Arbeitgeber können Sie Schüler ab folgenden Altersgruppen einstellen:\n\n• Ab 13 Jahren: Leichte Tätigkeiten (z.B. Zeitung austragen) mit Einwilligung der Eltern, max. 2 Std/Tag\n• Ab 15 Jahren: Die meisten Minijobs & Ferienjobs, max. 8 Std/Tag\n• Ab 18 Jahren: Keine besonderen Einschränkungen\n\nAuf EasyJobs finden Sie motivierte junge Talente – erstellen Sie einfach eine Stellenanzeige über "Anzeige schalten"!' },

  { keywords: ['regeln', 'minderjährig', 'jugendarbeitsschutz', 'vorschriften', 'beachten', 'beschäftige'],
    answer: 'Wichtige Regeln bei der Beschäftigung von Minderjährigen:\n\n📋 Jugendarbeitsschutzgesetz (JArbSchG):\n• Max. 8 Std/Tag, 40 Std/Woche (15-17 Jahre)\n• Arbeitszeit: 6-20 Uhr (Ausnahmen in Gastronomie bis 22 Uhr)\n• Mind. 30 Min Pause bei 4,5+ Std Arbeit\n• Kein Alkohol-Ausschank unter 16\n• Schriftliche Einwilligung der Eltern unter 18\n• 12 Std Ruhezeit zwischen Schichten\n\nÜber EasyJobs erreichen Sie Schüler, die aktiv nach Jobs suchen.' },

  // === ARBEITGEBER: PLATTFORM ===
  { keywords: ['jobanzeige', 'anzeige erstellen', 'stelle ausschreiben', 'stellenanzeige'],
    answer: 'So erstellen Sie eine Jobanzeige auf EasyJobs:\n\n1. Registrieren Sie sich als "Arbeitgeber"\n2. Klicken Sie auf "Anzeige schalten"\n3. Füllen Sie den 5-Schritte-Assistenten aus:\n   • Jobtitel & Kategorie\n   • Standort & Arbeitszeiten\n   • Gehalt & Anforderungen\n   • Beschreibung\n   • Vorschau & Veröffentlichung\n\nIhre Anzeige ist sofort sichtbar und Sie erhalten Bewerbungen direkt über die Plattform.' },

  { keywords: ['passende bewerber', 'bewerber finden', 'matching', 'vorgeschlagen'],
    answer: 'EasyJobs hilft Ihnen, passende Bewerber zu finden:\n\n• Bewerber werden nach Standort, Verfügbarkeit und Fähigkeiten gematcht\n• Sie sehen das vollständige Profil jedes Bewerbers\n• Fähigkeiten, Lebenslauf und Verfügbarkeit auf einen Blick\n• Direkter Chat für schnelle Kommunikation\n\nTipp: Je detaillierter Ihre Jobbeschreibung, desto passendere Bewerbungen erhalten Sie!' },

  // === ARBEITGEBER: BEWERTUNG ===
  { keywords: ['zuverlässig', 'zuverlässige bewerber', 'bewerber einschätzen', 'vergleichen'],
    answer: 'So erkennen Sie zuverlässige Bewerber auf EasyJobs:\n\n✅ Vollständiges Profil (100% ausgefüllt)\n✅ Lebenslauf hochgeladen\n✅ Positive Bewertungen von früheren Arbeitgebern\n✅ Schnelle Antwortzeit im Chat\n✅ Fähigkeiten passen zur Stelle\n\nUnter "Bewerber" in Ihrem Dashboard können Sie alle Bewerbungen vergleichen und Profile nebeneinander ansehen.' },

  { keywords: ['nicht erscheint', 'nicht gekommen', 'absage', 'abgesagt', 'kurzfristig'],
    answer: 'Wenn ein Schüler nicht erscheint oder kurzfristig absagt:\n\n1. Kontaktieren Sie den Schüler über den EasyJobs-Chat\n2. Geben Sie eine Bewertung ab – das hilft anderen Arbeitgebern\n3. Suchen Sie über Ihre aktive Anzeige schnell Ersatz\n\nTipp: Stellen Sie mehrere Kandidaten ein oder halten Sie eine Warteliste. Bei wiederholtem Nichterscheinen können Bewerber gemeldet werden.' },

  // === ARBEITGEBER: TEMPO ===
  { keywords: ['wie schnell einstellen', 'schnell jemanden', 'dringend', 'sofort'],
    answer: 'Auf EasyJobs können Sie sehr schnell einstellen:\n\n• Anzeige erstellen: Ca. 5 Minuten\n• Erste Bewerbungen: Oft innerhalb von Stunden\n• Chat & Kennenlernen: Direkt über die Plattform\n• Einstellung: Teilweise am selben Tag möglich\n\nTipp: Nutzen Sie den Boost für Ihre Anzeige, um noch schneller mehr Bewerber zu erreichen!' },

  // === ALLGEMEIN: PLATTFORM ===
  { keywords: ['wie funktioniert', 'plattform', 'easyjobs'],
    answer: 'So funktioniert EasyJobs:\n\n👤 Für Arbeitnehmer (Schüler):\n1. Kostenlos registrieren\n2. Profil ausfüllen (Fähigkeiten, Verfügbarkeit)\n3. Jobs in deiner Nähe finden und bewerben\n4. Per Chat mit Arbeitgebern kommunizieren\n\n🏢 Für Arbeitgeber:\n1. Kostenlos registrieren\n2. Stellenanzeige erstellen\n3. Bewerbungen erhalten und vergleichen\n4. Direkt über die Plattform einstellen\n\nAlles an einem Ort – einfach, schnell und sicher!' },

  { keywords: ['zusage', 'zugesagt', 'job bekommen', 'eingestellt'],
    answer: 'Glückwunsch zur Zusage! So geht es weiter:\n\n1. Kläre im Chat die Details (Startdatum, Arbeitszeiten, Treffpunkt)\n2. Frage nach, ob du etwas mitbringen musst (Ausweis, Kleidung etc.)\n3. Sei am ersten Tag pünktlich und freundlich\n4. Nach dem Job: Gib eine Bewertung ab!\n\nTipp: Speichere die Kontaktdaten deines Ansprechpartners und sei offen für Feedback.' },

  // === PROBLEME ===
  { keywords: ['problem', 'probleme', 'konflikt', 'ärger', 'beschwerde', 'hilfe'],
    answer: 'Bei Problemen im Job oder auf der Plattform:\n\n1. Sprich das Problem zuerst direkt mit dem Arbeitgeber/Arbeitnehmer an (per Chat)\n2. Versucht eine gemeinsame Lösung zu finden\n3. Wenn das nicht hilft: Kontaktiere unser Support-Team\n4. Du kannst den Vorfall auch über die Bewertungsfunktion melden\n\nDeine Sicherheit ist uns wichtig – bei ernsten Problemen (z.B. Belästigung, Betrug) melde dich sofort bei uns!' },

  // === VORSCHLÄGE ===
  { keywords: ['vorschlag', 'vorschläge', 'warum dieser job', 'empfehlung', 'keine vorschläge'],
    answer: 'EasyJobs schlägt dir Jobs basierend auf deinem Profil vor:\n\n• Dein Standort und Suchradius\n• Deine Fähigkeiten und Interessen\n• Deine gewünschten Arbeitszeiten\n• Deine Jobkategorie-Präferenzen\n\nKeine passenden Vorschläge? Dann:\n1. Vervollständige dein Profil\n2. Erweitere deinen Suchradius\n3. Füge mehr Fähigkeiten hinzu\n4. Probiere verschiedene Kategorien aus' },

  // === FALLBACK ===
  { keywords: ['hallo', 'hi', 'hey', 'moin', 'servus', 'guten tag'],
    answer: 'Hallo! 👋 Schön, dass du da bist! Ich bin der EasyJobs-Assistent und helfe dir gerne weiter.\n\nIch kann dir helfen bei:\n• Jobsuche & Bewerbungstipps\n• Lebenslauf erstellen\n• Arbeitszeiten & Verdienst\n• Fragen zur Plattform\n• Sicherheit & Vertrauen\n\nStell mir einfach deine Frage!' }
];

AI_RESPONSES.defaultAnswer = 'Das ist eine gute Frage! Leider habe ich darauf keine spezifische Antwort. Aber ich kann dir bei vielen Themen helfen:\n\n• Jobsuche & Bewerbung\n• Lebenslauf & Anschreiben\n• Arbeitszeiten & Verdienst für Schüler\n• Sicherheit auf der Plattform\n• Fragen für Arbeitgeber\n\nFormuliere deine Frage gerne etwas anders, oder schau dich auf der Plattform um!';

const CV_TEMPLATES = [
  {
    id: 'modern', name: 'Modern',
    preview: { headerColor: '#4f46e5', layout: 'sidebar', font: 'Inter' }
  },
  {
    id: 'classic', name: 'Klassisch',
    preview: { headerColor: '#1f2937', layout: 'traditional', font: 'Times' }
  },
  {
    id: 'creative', name: 'Kreativ',
    preview: { headerColor: '#7c3aed', layout: 'creative', font: 'Inter' }
  }
];
