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

const AI_RESPONSES = {
  'motivationsschreiben': 'Klar, ich helfe dir gerne beim Motivationsschreiben! Für welche Stelle möchtest du dich bewerben? Nenne mir den Jobtitel und das Unternehmen, dann erstelle ich dir einen Entwurf.',
  'lebenslauf': 'Beim Lebenslauf ist es wichtig, dass du folgende Punkte beachtest:\n\n1. Persönliche Daten (Name, Adresse, Kontakt)\n2. Schulbildung mit aktuellstem Abschluss zuerst\n3. Praktische Erfahrungen / Jobs\n4. Besondere Fähigkeiten & Kenntnisse\n5. Hobbys & Interessen\n\nSoll ich dir eine Vorlage erstellen?',
  'bewerbung': 'Für eine gute Bewerbung brauchst du:\n\n1. Anschreiben / Motivationsschreiben\n2. Lebenslauf\n3. Zeugnisse & Zertifikate\n\nTipp: Passe jede Bewerbung individuell an die Stelle an. Zeige, warum genau DU die richtige Person bist!',
  'vorstellungsgespräch': 'Hier sind meine Top-Tipps fürs Vorstellungsgespräch:\n\n1. Informiere dich über das Unternehmen\n2. Bereite Antworten auf typische Fragen vor\n3. Kleide dich angemessen\n4. Sei pünktlich (5 Min vorher da)\n5. Stelle eigene Fragen\n6. Sei authentisch und freundlich\n\nSoll ich typische Fragen mit dir üben?',
  'gehalt': 'Der Mindestlohn in Deutschland liegt aktuell bei 12,82€/Stunde. Für Jugendliche unter 18 ohne Ausbildung kann es Ausnahmen geben.\n\nTypische Stundenlöhne für Jugend-Jobs:\n- Aushilfe Einzelhandel: 12-13€\n- Gastronomie: 12-14€ + Trinkgeld\n- Nachhilfe: 13-18€\n- IT/Büro: 14-17€',
  'default': 'Das ist eine gute Frage! Ich kann dir bei folgenden Themen helfen:\n\n- Motivationsschreiben erstellen\n- Lebenslauf-Tipps\n- Bewerbungstipps\n- Vorstellungsgespräch üben\n- Gehaltsfragen\n- Arbeitsrecht für Jugendliche\n\nWas interessiert dich?'
};

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
