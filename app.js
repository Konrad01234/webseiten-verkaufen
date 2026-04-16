// ===== MOCK DATA =====

// JOBS starts empty — loadJobsFromDB() in bootstrap populates it
// with real Supabase data. The old hardcoded demo jobs (MediaMarkt,
// Starbucks, etc.) were removed because applying to a mock job
// would crash DB.applyToJob (foreign key violation: the mock IDs
// don't exist in the Supabase jobs table).
const JOBS = [];

const TESTIMONIALS = [
  {
    name: 'Lena Müller', role: 'Schülerin, 17 Jahre – Gymnasium München',
    text: 'Über WorkPilot habe ich meinen ersten Minijob im Café gefunden – die App ist super einfach und ich hatte innerhalb von 3 Tagen eine Zusage!',
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


// ===== APP STATE =====
let state = {
  currentPage: 'landing',
  user: null, // populated asynchronously by bootstrap() at startup
  _savedJobs: [],
  get savedJobs() { return this._savedJobs || []; },
  filters: { search: '', category: '', type: '', radius: 50, hours: [], city: '', sort: 'date', address: '' },
  chatOpen: false,
  activeChat: null,
  wizardStep: 0,
  newJob: {},
  dropdownOpen: false,
  adminTab: 'besucher',
  adminRevenuePeriod: 'daily',
  jobsLoaded: false,
  chatsLoaded: false,
  applicationsLoaded: false,
  geoLoading: false,
  sessionLoaded: false
};

// Clear old broken chat data (one-time reset)
if (!localStorage.getItem('jj_chat_reset_v2')) {
  Object.keys(localStorage).filter(k => k.startsWith('jj_chats_')).forEach(k => localStorage.removeItem(k));
  localStorage.setItem('jj_chat_reset_v2', '1');
}

// ===== SUPABASE BOOTSTRAP =====
// Convert a Supabase `jobs` row into the camelCase shape the existing
// renderers expect.
function dbJobToFrontend(row) {
  if (!row) return null;
  return {
    id: row.id,
    employerId: row.employer_id,
    title: row.title || '',
    company: row.company || '',
    city: row.city || '',
    location: row.location || row.city || '',
    distance: 0,
    category: row.category || '',
    type: row.type || '',
    hours: row.hours || '',
    salary: row.salary || '',
    salaryNum: row.salary_num || 0,
    description: row.description || '',
    tags: row.tags || [],
    images: row.images || [],
    companyLogo: row.company_logo || '',
    companyInfo: { about: '', industry: '', employees: '', founded: '', website: '' },
    promoted: !!row.promoted,
    views: row.views || 0,
    clicks: row.clicks || 0,
    applications: row.applications_count || 0,
    saves: row.saves || 0,
    reviews: [],
    date: row.created_at,
    // Alias fuer Legacy-Renderer/Sortierung (renderJobCard, Job-Detail,
    // getFilteredJobs sort='date'). Ohne diesen Alias waren alle Daten
    // auf den Jobkarten "Invalid Date" und die Sortierung hat NaN
    // verglichen.
    posted: row.created_at,
    active: row.active !== false
  };
}

// Convert a frontend job draft into a DB row. Strips control characters
// and caps lengths to prevent abuse.
function dbSanitizeText(v, max) {
  if (v == null) return '';
  let s = String(v).replace(/[\u0000-\u001F\u007F]/g, '').replace(/[<>]/g, '').trim();
  if (typeof max === 'number' && s.length > max) s = s.slice(0, max);
  return s;
}
function frontendJobToDb(j, employerId) {
  return {
    employer_id: employerId,
    title: dbSanitizeText(j.title, 200),
    company: dbSanitizeText(j.company, 200),
    city: dbSanitizeText(j.city, 120),
    location: dbSanitizeText(j.location || j.city, 200),
    category: dbSanitizeText(j.category, 80),
    type: dbSanitizeText(j.type, 80),
    hours: dbSanitizeText(j.hours, 80),
    salary: dbSanitizeText(j.salary, 80),
    salary_num: typeof j.salaryNum === 'number' ? j.salaryNum : null,
    description: dbSanitizeText(j.description, 5000),
    tags: Array.isArray(j.tags) ? j.tags.slice(0, 20).map(t => dbSanitizeText(t, 40)) : [],
    images: Array.isArray(j.images) ? j.images.slice(0, 6) : [],
    company_logo: j.companyLogo || null,
    promoted: !!j.promoted,
    active: true
  };
}

// Replace the in-memory JOBS array with fresh rows from Supabase.
async function loadJobsFromDB() {
  if (!window.DB) return;
  try {
    const rows = await DB.listJobs({ limit: 200 });
    JOBS.length = 0;
    rows.forEach(r => JOBS.push(dbJobToFrontend(r)));
    state.jobsLoaded = true;
    // Tote Refs in savedJobs aufraeumen (Job wurde geloescht oder
    // per Cron inaktiv gesetzt). Sonst zeigt der "Gespeicherte Jobs"-
    // Zaehler weiter die alte Zahl obwohl die Jobs weg sind.
    if (Array.isArray(state._savedJobs) && state._savedJobs.length) {
      const valid = new Set(JOBS.map(j => j.id));
      const cleaned = state._savedJobs.filter(id => valid.has(id));
      if (cleaned.length !== state._savedJobs.length) {
        state._savedJobs = cleaned;
      }
    }
  } catch (e) {
    console.error('[loadJobsFromDB]', e);
  }
}

// Read the current session from Supabase (if any) and hydrate state.user
// into the shape the rest of the app expects (id, email, name, role,
// company). Called on bootstrap and after login/register.
async function loadUserSession() {
  if (!window.DB) { state.sessionLoaded = true; return; }
  const session = await DB.getSession();
  if (!session || !session.user) { state.user = null; state.sessionLoaded = true; return; }
  try {
    const profile = await DB.getProfile(session.user.id);
    if (profile) {
      state.user = {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: profile.role,
        company: profile.company || null,
        // Everyone is approved by default. The admin can BLOCK an
        // employer by setting approved=false — only then is the
        // account restricted.
        approved: profile.approved !== false,
        profileComplete: profile.profile_complete || 20,
        about: profile.about || '',
        address: profile.address || '',
        city: profile.city || '',
        phone: profile.phone || '',
        logo: profile.logo || profile.company_logo || null,
        companyLogo: profile.company_logo || null,
        companyImages: profile.company_images || [],
        images: profile.images || [],
        industry: profile.industry || '',
        website: profile.website || '',
        founded: profile.founded || '',
        employees: profile.employees || '',
        description: profile.description || '',
        // Worker-specific fields (require supabase-add-worker-fields.sql)
        skills: profile.skills || [],
        weeklyHours: profile.weekly_hours || 0,
        refs: profile.refs || [],
        cvUploaded: !!profile.cv_uploaded,
        cvFileName: profile.cv_file_name || '',
        cvData: profile.cv_data || null,
        docsUploaded: !!profile.docs_uploaded,
        activeJob: profile.active_job || null,
        completedJobs: profile.completed_jobs || [],
        createdAt: profile.created_at
      };
    } else {
      // Fallback: profile row missing, build minimum from auth user_metadata.
      const md = session.user.user_metadata || {};
      state.user = {
        id: session.user.id,
        email: session.user.email,
        name: md.name || '',
        role: md.role || 'worker',
        company: md.company || null,
        approved: true,
        profileComplete: 20
      };
    }
  } catch (e) {
    console.error('[loadUserSession]', e);
    state.user = null;
  } finally {
    state.sessionLoaded = true;
  }
}

async function loadSavedJobsForUser() {
  if (!state.user || !window.DB) { state._savedJobs = []; return; }
  try {
    state._savedJobs = await DB.listSavedJobIds(state.user.id);
  } catch (e) {
    console.error('[loadSavedJobsForUser]', e);
    state._savedJobs = [];
  }
}

// ===== PHASE 2: APPLICATIONS + CHATS CACHE =====
// Supabase application row -> legacy frontend shape that the renderers
// already know how to draw. Fills in sensible defaults for the fields
// that don't exist in the DB schema yet (skills, weeklyHours, refs...).
function dbAppToFrontend(row) {
  if (!row) return null;
  const p = row.profiles || {};
  const j = row.jobs || {};
  const name = p.name || '';
  const initials = (name || '?').split(' ').map(n => n[0]).join('').toUpperCase();
  const statusTexts = { new: 'Neu', reviewing: 'In Prüfung', accepted: 'Eingeladen', rejected: 'Abgelehnt' };
  return {
    id: row.id,
    userId: row.worker_id,
    jobId: row.job_id,
    jobTitle: j.title || '',
    jobCompany: j.company || '',
    name: name,
    initials: initials,
    email: p.email || '',
    city: '',
    skills: [],
    weeklyHours: 0,
    refs: [],
    cvUploaded: false,
    docsUploaded: false,
    about: '',
    status: row.status || 'new',
    statusText: statusTexts[row.status] || 'Neu',
    date: (row.created_at || '').slice(0, 10),
    motivation: row.message || null,
    motivationFileName: null,
    cvMethod: null,
    cvFileName: null
  };
}

// Load all applications the current user cares about (their own as
// a worker, or the ones for their jobs as an employer) into a local
// cache so the synchronous renderers can keep working.
async function loadApplicationsForUser() {
  if (!state.user || !window.DB) { state._appsCache = []; state.applicationsLoaded = true; return; }
  try {
    const rows = state.user.role === 'employer'
      ? await DB.getApplicationsForEmployer(state.user.id)
      : await DB.getApplicationsForWorker(state.user.id);
    state._appsCache = (rows || []).map(dbAppToFrontend).filter(Boolean);
  } catch (e) {
    console.error('[loadApplicationsForUser]', e);
    state._appsCache = [];
  } finally {
    state.applicationsLoaded = true;
  }
}

// Convert a Supabase chats row into the legacy shape used by the
// WORKER_CHAT_MESSAGES / EMPLOYER_CHAT_MESSAGES renderers.
function dbChatToFrontend(row) {
  if (!row || !state.user) return null;
  const isEmployer = row.employer_id === state.user.id;
  const partnerProfile = isEmployer ? row.worker : row.employer;
  const partnerName = (partnerProfile && (partnerProfile.company || partnerProfile.name)) || '';
  const partnerInitials = (partnerName || '?').split(' ').map(n => n[0]).join('').toUpperCase();
  const partnerId = partnerProfile ? partnerProfile.id : '';
  return {
    id: row.id,
    partnerId: (isEmployer ? 'worker-' : 'employer-') + partnerId,
    partnerUserId: partnerId,
    partnerName: partnerName,
    partnerInitials: partnerInitials,
    jobTitle: row.job_title || '',
    jobId: row.job_id || null,
    lastMessage: row.last_message || '',
    time: row.last_message_at
      ? new Date(row.last_message_at).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
      : '',
    unread: false,
    messages: []  // lazily filled by openChat
  };
}

// Admin: load every profile in the database into a cache so the
// admin panel's user list + employer-approval table can show real
// users instead of the legacy localStorage 'jj_users' array.
async function loadAllProfilesForAdmin() {
  if (!window.DB || !DB.sb) { state._allProfilesCache = []; return; }
  try {
    const res = await DB.sb.from('profiles').select('*').order('created_at', { ascending: false });
    if (res.error) throw res.error;
    state._allProfilesCache = (res.data || []).map(p => ({
      id: p.id,
      email: p.email,
      name: p.name || '',
      role: p.role || 'worker',
      company: p.company || null,
      approved: p.approved === true,
      createdAt: p.created_at
    }));
  } catch (e) {
    console.error('[loadAllProfilesForAdmin]', e);
    state._allProfilesCache = [];
  }
}

// Serialize loadChatsForUser so concurrent callers (realtime events
// fire in bursts) share the same in-flight promise and always see
// the latest state when their await resolves.
let _loadChatsInFlight = null;
let _loadChatsAgain = false;
async function loadChatsForUser() {
  if (!state.user || !window.DB) return;
  if (_loadChatsInFlight) {
    // A load is already running — mark that we want another pass,
    // and return the same promise so our caller waits for it.
    _loadChatsAgain = true;
    return _loadChatsInFlight;
  }
  const promise = (async () => {
    try {
      do {
        _loadChatsAgain = false;
        try {
          const rows = await DB.listChatsForUser(state.user.id);
          const list = (rows || []).map(dbChatToFrontend).filter(Boolean);
          const container = state.user.role === 'employer' ? EMPLOYER_CHAT_MESSAGES : WORKER_CHAT_MESSAGES;
          // Preserve `.messages` arrays already loaded via openChatById
          const existing = new Map(container.map(c => [c.id, c]));
          container.length = 0;
          list.forEach(c => {
            const old = existing.get(c.id);
            if (old && Array.isArray(old.messages) && old.messages.length > 0) {
              c.messages = old.messages;
            }
            container.push(c);
          });
          state.chatsLoaded = true;
          // Badge fuer ungelesene Nachrichten am mobilen Profil-Icon aktualisieren
          if (typeof updateNav === 'function') updateNav();
        } catch (e) {
          console.error('[loadChatsForUser]', e);
        }
      } while (_loadChatsAgain);
    } finally {
      _loadChatsInFlight = null;
    }
  })();
  _loadChatsInFlight = promise;
  return promise;
}

// Subscribe to INSERTs on the chats table for this user so new chats
// and new messages show up in the chat list without a manual refresh.
function subscribeToChatList() {
  if (!state.user || !window.DB || !DB.subscribeToChatList) return;
  if (state._chatListSub) {
    try { DB.sb.removeChannel(state._chatListSub); } catch (_) {}
    state._chatListSub = null;
  }
  const ownerId = state.user.id;
  state._chatListSub = DB.subscribeToChatList(ownerId, async () => {
    // Guard: session may have been swapped (logout → login as another
    // user) before this callback fires.
    if (!state.user || state.user.id !== ownerId) return;
    await loadChatsForUser();
    try { render(); } catch (_) {}
  });
}

// Realtime: auto-refresh JOBS when any row in the jobs table changes
// (another employer posts/edits/deletes a job → every connected
// browser sees the update within 1-2 seconds).
function subscribeToJobUpdates() {
  if (!window.DB || !DB.sb) return;
  if (state._jobsSub) { try { DB.sb.removeChannel(state._jobsSub); } catch (_) {} state._jobsSub = null; }
  state._jobsSub = DB.sb.channel('jobs-realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'jobs' }, () => {
      loadJobsFromDB().then(() => { try { render(); } catch (_) {} }).catch(e => console.error('[realtime] jobs', e));
    })
    .subscribe();
}

// Realtime: auto-refresh applications cache when any application
// changes (a worker applies → employer sees it live; employer
// accepts/rejects → worker sees updated status).
function subscribeToApplicationUpdates() {
  if (!window.DB || !DB.sb || !state.user) return;
  if (state._appsSub) { try { DB.sb.removeChannel(state._appsSub); } catch (_) {} state._appsSub = null; }
  state._appsSub = DB.sb.channel('apps-realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'applications' }, () => {
      loadApplicationsForUser().then(() => { try { render(); } catch (_) {} }).catch(e => console.error('[realtime] apps', e));
    })
    .subscribe();
}

// Hilfs-Utility: Nutzer-spezifische Daten im Hintergrund laden, jeweils
// mit einem re-render wenn sie da sind. Dadurch sieht der Nutzer sofort
// die Seite (mit Skeletons) statt auf Daten zu warten.
function _loadUserDataInBackground() {
  if (!state.user) return;
  loadSavedJobsForUser().then(() => { try { render(); } catch (_) {} }).catch(e => console.error('[bg] savedJobs', e));
  loadApplicationsForUser().then(() => { try { render(); } catch (_) {} }).catch(e => console.error('[bg] apps', e));
  loadChatsForUser().then(() => { try { render(); } catch (_) {} }).catch(e => console.error('[bg] chats', e));
  try { subscribeToChatList(); } catch (e) { console.error('[bg] chatSub', e); }
  try { subscribeToApplicationUpdates(); } catch (e) { console.error('[bg] appsSub', e); }
}

// Bootstrap: restore session + jobs, then render. Runs once on page
// load and again whenever Supabase fires SIGNED_IN / SIGNED_OUT.
// Wichtig: wir awaiten NICHT die Daten-Loads vor dem ersten render(),
// sondern lassen sie im Hintergrund laufen. Der Nutzer sieht sofort
// die Seite (mit Skeleton-Platzhaltern wo nötig) statt einer weißen
// Fläche oder einem blockierten Spinner.
async function bootstrap() {
  if (window.DB) {
    try {
      // Session ist synchron billig (aus Cookie/localStorage), awaiten
      // damit nav/avatar sofort stimmen.
      await loadUserSession();
      _loadUserDataInBackground();
      try { subscribeToJobUpdates(); } catch (e) { console.error('[bootstrap] jobsSub', e); }
    } catch (e) { console.error('[bootstrap] session', e); }
    DB.onAuthChange(async (event) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        await loadUserSession();
        _loadUserDataInBackground();
        try { subscribeToJobUpdates(); } catch (e) { console.error('[auth] jobsSub', e); }
      } else if (event === 'SIGNED_OUT') {
        state.user = null;
        state._savedJobs = [];
        state._appsCache = [];
        state.chatsLoaded = false;
        state.applicationsLoaded = false;
        state.sessionLoaded = true;  // Session IST bekannt — eben leer
        WORKER_CHAT_MESSAGES.length = 0;
        EMPLOYER_CHAT_MESSAGES.length = 0;
        if (state._chatListSub) { try { DB.sb.removeChannel(state._chatListSub); } catch (_) {} state._chatListSub = null; }
        if (state._chatSub)     { try { DB.sb.removeChannel(state._chatSub); }     catch (_) {} state._chatSub = null; }
        if (state._jobsSub)     { try { DB.sb.removeChannel(state._jobsSub); }     catch (_) {} state._jobsSub = null; }
        if (state._appsSub)     { try { DB.sb.removeChannel(state._appsSub); }     catch (_) {} state._appsSub = null; }
      }
      try { render(); } catch (_) {}
    });
  } else {
    console.warn('[bootstrap] window.DB not loaded - running in offline mode');
  }
  // Jobs im Hintergrund laden — kein await, damit das erste render()
  // sofort passiert und die Skeleton-Platzhalter sichtbar werden.
  loadJobsFromDB().then(() => { try { render(); } catch (_) {} }).catch(e => console.error('[bootstrap] jobs', e));
  try { render(); } catch (e) { console.error('[bootstrap] render', e); }
}

// ===== ADMIN CONFIG =====
const ADMIN_EMAILS = ['kwg.range@web.de', 'jojo102009@icloud.com'];
// Admin access is granted by Supabase Auth — only users logged in
// with one of the ADMIN_EMAILS can access the admin panel. The server
// enforces this through the profiles_admin_update_approval RLS policy
// from supabase-add-approval.sql, so a client-side bypass is useless:
// even if someone flips state.adminLoggedIn manually, the DB will
// reject their writes.
function isCurrentUserAdmin() {
  return !!(state.user && state.user.email && ADMIN_EMAILS.includes(state.user.email.toLowerCase()));
}

// ===== ANALYTICS TRACKING =====
function trackVisit() {
  const visits = JSON.parse(localStorage.getItem('jj_analytics_visits') || '[]');
  const now = new Date().toISOString();
  const userRole = state.user ? state.user.role : 'guest';
  const userId = state.user ? state.user.id : 'anon_' + (sessionStorage.getItem('jj_anon_id') || (() => { const id = Date.now(); sessionStorage.setItem('jj_anon_id', id); return id; })());
  const recent = visits.find(v => v.userId === userId && (new Date(now) - new Date(v.timestamp)) < 300000);
  if (!recent) {
    visits.push({ userId, role: userRole, timestamp: now, page: state.currentPage });
    if (visits.length > 10000) visits.splice(0, visits.length - 10000);
    localStorage.setItem('jj_analytics_visits', JSON.stringify(visits));
  }
}

// trackPurchase entfernt — war nur für Boost-Features die ebenfalls weg sind.

function getAnalyticsData() {
  const visits = JSON.parse(localStorage.getItem('jj_analytics_visits') || '[]');
  // Purchases bleibt localStorage — tote Feature-Spalte (kein Bezahl-Modus).
  const purchases = JSON.parse(localStorage.getItem('jj_analytics_purchases') || '[]');
  // ECHTE Daten aus Supabase: User aus profiles-Cache, Jobs aus JOBS-Array,
  // Bewerbungen aus apps-Cache.
  const allUsers = state._allProfilesCache || [];
  state._adminTotalJobs = (typeof JOBS !== 'undefined' && JOBS) ? JOBS.length : 0;
  state._adminTotalApps = (state._appsCache || []).length;
  const now = new Date();
  const onlineThreshold = 15 * 60 * 1000;
  const recentVisits = visits.filter(v => (now - new Date(v.timestamp)) < onlineThreshold);
  const uniqueOnline = [...new Set(recentVisits.map(v => v.userId))];
  const onlineByRole = {
    employer: [...new Set(recentVisits.filter(v => v.role === 'employer').map(v => v.userId))].length,
    worker: [...new Set(recentVisits.filter(v => v.role === 'worker').map(v => v.userId))].length,
    guest: [...new Set(recentVisits.filter(v => v.role === 'guest').map(v => v.userId))].length
  };
  const totalUsers = allUsers.length;
  const employers = allUsers.filter(u => u.role === 'employer').length;
  const workers = allUsers.filter(u => u.role === 'worker').length;
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const visitsToday = [...new Set(visits.filter(v => new Date(v.timestamp) >= todayStart).map(v => v.userId))].length;
  const weekStart = new Date(todayStart); weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
  const visitsThisWeek = [...new Set(visits.filter(v => new Date(v.timestamp) >= weekStart).map(v => v.userId))].length;
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const visitsThisMonth = [...new Set(visits.filter(v => new Date(v.timestamp) >= monthStart).map(v => v.userId))].length;
  const revenue = {}; let totalRevenue = 0;
  purchases.forEach(p => {
    if (!revenue[p.product]) revenue[p.product] = { count: 0, total: 0 };
    revenue[p.product].count++; revenue[p.product].total += p.price; totalRevenue += p.price;
  });
  const purchasesToday = purchases.filter(p => new Date(p.timestamp) >= todayStart);
  const revenueToday = purchasesToday.reduce((sum, p) => sum + p.price, 0);
  const purchasesThisMonth = purchases.filter(p => new Date(p.timestamp) >= monthStart);
  const revenueThisMonth = purchasesThisMonth.reduce((sum, p) => sum + p.price, 0);
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const day = new Date(todayStart); day.setDate(day.getDate() - i);
    const nextDay = new Date(day); nextDay.setDate(nextDay.getDate() + 1);
    const count = [...new Set(visits.filter(v => { const d = new Date(v.timestamp); return d >= day && d < nextDay; }).map(v => v.userId))].length;
    last7Days.push({ date: day.toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short' }), count });
  }
  return {
    online: { total: uniqueOnline.length, ...onlineByRole },
    users: { total: totalUsers, employers, workers },
    visits: { today: visitsToday, thisWeek: visitsThisWeek, thisMonth: visitsThisMonth, last7Days },
    revenue: { byProduct: revenue, total: totalRevenue, today: revenueToday, thisMonth: revenueThisMonth },
    purchases: { total: purchases.length, today: purchasesToday.length },
    jobs: { total: state._adminTotalJobs || 0 },
    applications: { total: state._adminTotalApps || 0 }
  };
}

function getRevenueTimeline(period) {
  const purchases = JSON.parse(localStorage.getItem('jj_analytics_purchases') || '[]');
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const bars = [];
  if (period === 'daily') {
    for (let i = 13; i >= 0; i--) {
      const day = new Date(todayStart); day.setDate(day.getDate() - i);
      const nextDay = new Date(day); nextDay.setDate(nextDay.getDate() + 1);
      const dayP = purchases.filter(p => { const d = new Date(p.timestamp); return d >= day && d < nextDay; });
      bars.push({ label: day.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' }), total: dayP.reduce((s, p) => s + p.price, 0), count: dayP.length });
    }
  } else if (period === 'monthly') {
    for (let i = 11; i >= 0; i--) {
      const m = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextM = new Date(m.getFullYear(), m.getMonth() + 1, 1);
      const mP = purchases.filter(p => { const d = new Date(p.timestamp); return d >= m && d < nextM; });
      bars.push({ label: m.toLocaleDateString('de-DE', { month: 'short', year: '2-digit' }), total: mP.reduce((s, p) => s + p.price, 0), count: mP.length });
    }
  } else if (period === 'yearly') {
    for (let i = 4; i >= 0; i--) {
      const y = now.getFullYear() - i;
      const yStart = new Date(y, 0, 1); const yEnd = new Date(y + 1, 0, 1);
      const yP = purchases.filter(p => { const d = new Date(p.timestamp); return d >= yStart && d < yEnd; });
      bars.push({ label: '' + y, total: yP.reduce((s, p) => s + p.price, 0), count: yP.length });
    }
  } else {
    const byMonth = {};
    purchases.forEach(p => { const d = new Date(p.timestamp); const key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'); if (!byMonth[key]) byMonth[key] = { total: 0, count: 0 }; byMonth[key].total += p.price; byMonth[key].count++; });
    const sortedKeys = Object.keys(byMonth).sort();
    if (sortedKeys.length === 0) { for (let i = 5; i >= 0; i--) { const m = new Date(now.getFullYear(), now.getMonth() - i, 1); bars.push({ label: m.toLocaleDateString('de-DE', { month: 'short', year: '2-digit' }), total: 0, count: 0 }); } }
    else { sortedKeys.forEach(key => { const [y, m] = key.split('-'); const d = new Date(parseInt(y), parseInt(m) - 1, 1); bars.push({ label: d.toLocaleDateString('de-DE', { month: 'short', year: '2-digit' }), total: byMonth[key].total, count: byMonth[key].count }); }); }
  }
  return bars;
}

function switchAdminTab(tab) {
  state.adminTab = tab;
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.remove('active'));
  document.querySelector('.admin-tab[onclick*="' + tab + '"]').classList.add('active');
  const content = document.getElementById('admin-tab-' + tab);
  if (content) content.classList.add('active');
}

function switchRevenueView(period) {
  state.adminRevenuePeriod = period;
  const container = document.getElementById('admin-revenue-timeline');
  if (!container) return;
  const bars = getRevenueTimeline(period);
  const maxVal = Math.max(...bars.map(b => b.total), 1);
  const formatEuro = (n) => n.toFixed(2).replace('.', ',') + ' EUR';
  const periodTotal = bars.reduce((s, b) => s + b.total, 0);
  const periodCount = bars.reduce((s, b) => s + b.count, 0);
  const gradients = ['#2563eb','#3b82f6','#60a5fa','#93c5fd','#1d4ed8','#1e40af','#1e40af','#1e3a8a','#0d9488','#2563eb','#3b82f6','#60a5fa','#93c5fd','#1d4ed8'];
  document.querySelectorAll('.admin-rev-tab').forEach(btn => { btn.classList.toggle('active', btn.dataset.period === period); });
  const sumEl = document.getElementById('admin-revenue-period-sum');
  if (sumEl) sumEl.textContent = formatEuro(periodTotal);
  const countEl = document.getElementById('admin-revenue-period-count');
  if (countEl) countEl.textContent = periodCount + ' Bestellungen';
  const chart = document.getElementById('admin-revenue-bars');
  if (chart) {
    chart.innerHTML = bars.map((b, i) => {
      const pct = Math.max((b.total / maxVal) * 100, 3); const color = gradients[i % gradients.length];
      return '<div class="admin-bar-col"><div class="admin-bar-value" style="color:#1d4ed8">' + (b.total > 0 ? b.total.toFixed(0) + ' EUR' : '-') + '</div><div class="admin-bar-track"><div class="admin-bar-fill" style="height:' + pct + '%;background:' + color + ';animation-delay:' + (i * 0.05) + 's"></div></div><div class="admin-bar-label">' + b.label + '</div></div>';
    }).join('');
  }
}

// ===== NAVIGATION =====
function navigate(page, data) {
  // Chat-Realtime-Subscription aufraeumen wenn wir den Chat-Detail
  // verlassen. Ohne diesen Cleanup haengt der Subscription-Callback
  // weiter an einem `chatId` das der Nutzer nicht mehr sieht, mutiert
  // `chat.messages` im Hintergrund und triggert render()-Calls fuer
  // Seiten auf denen der Chat gar nicht mehr angezeigt wird.
  const leavingChat = state.currentPage === 'chat' && page !== 'chat';
  if (leavingChat && window.DB && window.DB.sb && state._chatSub) {
    try { window.DB.sb.removeChannel(state._chatSub); } catch (_) {}
    state._chatSub = null;
    state.activeChat = null;
  }
  state.currentPage = page;
  state.pageData = data;
  // Jobs-Seite: Filter-Adresse automatisch aus dem User-Profil
  // vorbelegen, damit der Nutzer seine Adresse nicht zweimal eingeben
  // muss. Greift nur wenn das Filterfeld noch leer ist (nicht explizit
  // geleert vom User).
  if (page === 'jobs' && state.user && state.user.address && !state.filters.address) {
    state.filters.address = state.user.address;
    // Distanzen fuer existierende Jobs sofort berechnen im Hintergrund
    if (JOBS && JOBS.length) {
      setTimeout(function(){ if (typeof recomputeDistancesAndRender === 'function') recomputeDistancesAndRender(); }, 0);
    }
  }
  render();
  window.scrollTo(0, 0);
  // Auto-refresh relevant data when navigating to key pages.
  // This ensures the user always sees the latest DB state without
  // needing a manual page reload.
  if (window.DB) {
    if (page === 'jobs' || page === 'job-detail' || page === 'employer-dashboard') {
      loadJobsFromDB().then(() => {
        try { render(); } catch (_) {}
        // Wenn der Nutzer schon eine Adresse eingegeben hat, Distanzen
        // fuer die neu geladenen Jobs berechnen (sonst wuerde der
        // Umkreis-Filter nach jedem Reload nicht mehr greifen).
        if (state.filters.address) { recomputeDistancesAndRender(); }
      }).catch(e => console.error('[navigate] jobs refresh', e));
    }
    if (page === 'employer-dashboard' || page === 'applicants' || page === 'worker-dashboard') {
      loadApplicationsForUser().then(() => { try { render(); } catch (_) {} }).catch(e => console.error('[navigate] apps refresh', e));
    }
    if (page === 'messages' || page === 'chat') {
      loadChatsForUser().then(() => { try { render(); } catch (_) {} }).catch(e => console.error('[navigate] chats refresh', e));
    }
    // When opening a specific chat, load its messages from the DB
    if (page === 'chat' && data && data.chatId) {
      state._activeChatLoading = data.chatId;
      openChatById(data.chatId)
        .then(() => {
          if (state._activeChatLoading === data.chatId) state._activeChatLoading = null;
          try { render(); } catch (_) {}
        })
        .catch(e => {
          if (state._activeChatLoading === data.chatId) state._activeChatLoading = null;
          console.error('[navigate] chat open', e);
        });
    }
    // Reload the user profile on dashboard/profile/post pages so
    // changes made by the admin (e.g. employer approval) oder
    // externe Edits ankommen — ohne full page reload. Waehrend des
    // Refreshs zeigen die Seiten Skeletons (state._profileRefreshing).
    if (
      page === 'employer-dashboard' || page === 'worker-dashboard' ||
      page === 'post-job' ||
      page === 'worker-profile' || page === 'worker-profile-view' ||
      page === 'employer-profile'
    ) {
      state._profileRefreshing = true;
      loadUserSession().then(() => {
        state._profileRefreshing = false;
        try { render(); } catch (_) {}
      }).catch(e => {
        state._profileRefreshing = false;
        console.error('[navigate] session refresh', e);
      });
    }
    if (page === 'support' || page === 'admin-panel') {
      loadSupportTicketsForUser().then(() => { try { render(); } catch (_) {} }).catch(e => console.error('[navigate] tickets refresh', e));
    }
  }
}

function navigateToSection(page, sectionId) {
  // Richtigen Schritt für die Profilseite setzen
  if (page === 'worker-profile' && sectionId) {
    const idx = PROFILE_STEPS.findIndex(s => s.id === sectionId);
    if (idx >= 0) state.profileStep = idx;
  }
  state.currentPage = page;
  state.pageData = {};
  render();
  window.scrollTo(0, 0);
}

// Splash-Screen (aus index.html) nach dem ersten erfolgreichen
// render()-Durchlauf ausblenden. Setzt die .splash-hide-Klasse
// (opacity:0 + pointer-events:none), nach Abschluss der Transition
// wird der Node aus dem DOM entfernt.
function hidePageSplash() {
  // Status ueber window.__splashHidden statt Modul-lokaler Variable,
  // damit auch die 8s-Failsafe in index.html denselben Zustand lesen/
  // setzen kann. Sonst fehlt Synchronisation wenn Failsafe den Splash
  // bereits entfernt hat und render() danach nochmal laeuft.
  if (window.__splashHidden) return;
  const splash = document.getElementById('page-splash');
  if (!splash) { window.__splashHidden = true; return; }
  window.__splashHidden = true;
  // Minimale Sichtdauer, damit der Splash nicht nur aufblitzt, wenn
  // der erste render() super schnell kommt (z.B. gecacht).
  const MIN_VISIBLE_MS = 350;
  const shownAt = window.__splashShownAt || performance.now();
  const wait = Math.max(0, MIN_VISIBLE_MS - (performance.now() - shownAt));
  setTimeout(() => {
    splash.classList.add('splash-hide');
    setTimeout(() => { try { splash.remove(); } catch (_) {} }, 500);
  }, wait);
}

// Merkt sich vor einem re-render welches Input-/Textarea-Element den
// Fokus hatte und wo der Cursor steht — nach dem innerHTML-Wipe wird
// der Fokus auf das gleich-IDed Element wiederhergestellt. Ohne das
// verliert der Nutzer beim Tippen ins Adress-Filterfeld bei jedem
// async-Render (z.B. Geocoding fertig) seinen Fokus und muss neu
// klicken. Funktioniert fuer alle Felder, nicht nur das Adressfeld.
function _captureFocusState() {
  const el = document.activeElement;
  if (!el || !el.id) return null;
  const tag = el.tagName;
  if (tag !== 'INPUT' && tag !== 'TEXTAREA') return null;
  return {
    id: el.id,
    start: typeof el.selectionStart === 'number' ? el.selectionStart : null,
    end:   typeof el.selectionEnd   === 'number' ? el.selectionEnd   : null
  };
}
function _restoreFocusState(snap) {
  if (!snap) return;
  const el = document.getElementById(snap.id);
  if (!el) return;
  try {
    el.focus({ preventScroll: true });
    if (snap.start != null && typeof el.setSelectionRange === 'function') {
      el.setSelectionRange(snap.start, snap.end != null ? snap.end : snap.start);
    }
  } catch (_) { /* setSelectionRange kann bei type="number" werfen */ }
}

function render() {
  const app = document.getElementById('app');
  const _focusSnap = _captureFocusState();
  updateNav();

  const pages = {
    'landing': renderLanding,
    'jobs': renderJobSearch,
    'job-detail': renderJobDetail,
    'login': renderLogin,
    'register': renderRegister,
    'worker-dashboard': renderWorkerDashboard,
    'worker-profile': renderWorkerProfile,
    'worker-profile-view': renderWorkerProfileView,
    'saved-jobs': renderSavedJobs,
    'applications': renderApplications,
    'cv-builder': renderCVBuilder,
    'employer-landing': renderEmployerLanding,
    'employer-dashboard': renderEmployerDashboard,
    'post-job': renderPostJob,
    'employer-profile': renderEmployerProfile,
    'applicants': renderApplicants,
    'applicant-profile': renderApplicantProfile,

    'messages': renderMessages,
    'chat': renderChatDetail,
    'reviews': renderReviews,
    'support': renderSupport,
    'admin-panel': renderAdminPanel,
    'impressum': renderImpressum,
    'datenschutz': renderDatenschutz,
    'agb': renderAGB
  };

  // Admin-Panel Zugangsschutz: nur Admin-E-Mails dürfen rein.
  // Server-side RLS erzwingt das zusätzlich — Client-Bypass ist sinnlos.
  if (state.currentPage === 'admin-panel' && !isCurrentUserAdmin()) {
    state.currentPage = state.user ? 'landing' : 'login';
  }

  const renderFn = pages[state.currentPage] || renderLanding;
  app.innerHTML = renderFn();

  // Splash-Screen beim ersten Render ausblenden. Der Splash liegt
  // ausserhalb von #app und wird daher nicht durch app.innerHTML
  // ueberschrieben - wir muessen ihn aktiv ausblenden sobald die
  // erste echte Seite gezeichnet ist.
  hidePageSplash();

  // JSON-LD (schema.org/JobPosting) für Google for Jobs pflegen:
  // auf der Job-Detailseite einfügen, auf allen anderen Seiten entfernen.
  if (state.currentPage === 'job-detail') {
    const _jobId = state.pageData && state.pageData.jobId;
    const _job = typeof JOBS !== 'undefined' ? JOBS.find(j => j.id === _jobId) : null;
    injectJobPostingSchema(_job);
  } else {
    injectJobPostingSchema(null);
  }

  // Dynamische Meta-Tags pro Seite (Title, Description, Canonical, OG).
  // Wichtig für SEO — Google rankt Seiten mit eindeutigen Meta-Tags
  // deutlich besser als solche mit einem globalen Default.
  updatePageMeta();

  // Analytics tracking
  trackVisit();

  // Auto-scroll chat to bottom
  if (state.currentPage === 'chat') {
    setTimeout(() => {
      const el = document.getElementById('chat-messages-page');
      if (el) el.scrollTop = el.scrollHeight;
    }, 50);
  }

  // Re-attach event listeners
  attachEventListeners();

  // Admin-Link im Footer nur fuer echte Admins einblenden
  updateFooterAdminLink();

  // Fokus wiederherstellen (siehe _captureFocusState weiter oben)
  _restoreFocusState(_focusSnap);
}

// Blendet den "Admin"-Link im Footer ein/aus basierend auf dem
// eingeloggten User. Die Admin-Rechte werden serverseitig durch RLS
// erzwungen (siehe supabase-add-approval.sql), das hier ist nur
// kosmetisches Verstecken — ein Nicht-Admin der den Link manuell
// oeffnet bekommt vom Server eh nur Fehlermeldungen.
function updateFooterAdminLink() {
  const el = document.getElementById('footer-admin-link');
  if (!el) return;
  const show = typeof isCurrentUserAdmin === 'function' && isCurrentUserAdmin();
  el.style.display = show ? '' : 'none';
}

function updateNav() {
  const actions = document.getElementById('nav-actions');
  if (state.user) {
    const isEmployer = state.user.role === 'employer';
    actions.innerHTML = `
      <div class="user-menu">

        <div class="user-avatar" onclick="toggleDropdown()" role="button" tabindex="0" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();toggleDropdown();}" aria-label="Nutzermenü" aria-haspopup="true" aria-expanded="${state.dropdownOpen}" aria-controls="user-dropdown">${(state.user.name||'').split(' ').map(n=>n[0]).join('')}</div>
        <div class="user-dropdown ${state.dropdownOpen ? '' : 'hidden'}" id="user-dropdown" role="menu">
          <a href="#" onclick="navigate('${isEmployer ? 'employer-dashboard' : 'worker-dashboard'}'); toggleDropdown()">Dashboard</a>
          <a href="#" onclick="navigate('${isEmployer ? 'employer-profile' : 'worker-profile'}'); toggleDropdown()">Profil</a>
          ${!isEmployer ? '<a href="#" onclick="navigate(\'saved-jobs\'); toggleDropdown()">Gespeicherte Jobs</a>' : ''}
          ${!isEmployer ? '<a href="#" onclick="navigate(\'cv-builder\'); toggleDropdown()">Lebenslauf</a>' : ''}
          ${isEmployer ? '<a href="#" onclick="goPostJob(); toggleDropdown()">Anzeige schalten</a>' : ''}
          <a href="#" onclick="navigate('messages'); toggleDropdown()">Nachrichten</a>
          <div class="divider"></div>
          <button onclick="logout()">Abmelden</button>
        </div>
      </div>`;
  } else {
    actions.innerHTML = `
      <button class="btn btn-outline" onclick="navigate('login')">Anmelden</button>
      <button class="btn btn-primary" onclick="navigate('register')">Registrieren</button>`;
  }

  // Show/hide mobile profile icon button + Badge fuer ungelesene Nachrichten
  const mobileProfileBtn = document.getElementById('mobile-profile-btn');
  if (mobileProfileBtn) {
    mobileProfileBtn.style.display = state.user ? 'flex' : 'none';
  }
  const mobileBadge = document.getElementById('mobile-profile-badge');
  if (mobileBadge) {
    let unread = 0;
    if (state.user) {
      const list = state.user.role === 'employer' ? EMPLOYER_CHAT_MESSAGES : WORKER_CHAT_MESSAGES;
      unread = (list || []).filter(c => c && c.unread).length;
    }
    if (unread > 0) {
      mobileBadge.textContent = unread > 9 ? '9+' : String(unread);
      mobileBadge.hidden = false;
    } else {
      mobileBadge.textContent = '';
      mobileBadge.hidden = true;
    }
  }

  // Mobile-Menue (Hamburger) je nach Login-Status anpassen.
  // Eingeloggt:  Jobs, Fuer Arbeitgeber, Abmelden (Rest laeuft ueber das
  //              Profil-Icon rechts oben)
  // Ausgeloggt:  Jobs, Fuer Arbeitgeber, Anmelden, Registrieren
  const mobileMenu = document.getElementById('mobile-menu');
  if (mobileMenu) {
    if (state.user) {
      mobileMenu.innerHTML = `
        <a href="#" onclick="navigate('jobs'); toggleMobileMenu()">Jobs finden</a>
        <a href="#" onclick="navigate('employer-landing'); toggleMobileMenu()">Für Arbeitgeber</a>
        <a href="#" onclick="logout(); toggleMobileMenu()" style="color:var(--gray-500)">Abmelden</a>`;
    } else {
      mobileMenu.innerHTML = `
        <a href="#" onclick="navigate('jobs'); toggleMobileMenu()">Jobs finden</a>
        <a href="#" onclick="navigate('employer-landing'); toggleMobileMenu()">Für Arbeitgeber</a>
        <a href="#" onclick="navigate('login'); toggleMobileMenu()">Anmelden</a>
        <a href="#" onclick="navigate('register'); toggleMobileMenu()">Registrieren</a>`;
    }
  }
}

function mobileProfileNav() {
  if (!state.user) { navigate('login'); return; }
  navigate(state.user.role === 'employer' ? 'employer-dashboard' : 'worker-dashboard');
}

function toggleDropdown() {
  state.dropdownOpen = !state.dropdownOpen;
  const dd = document.getElementById('user-dropdown');
  if (dd) dd.classList.toggle('hidden');
}

function toggleMobileMenu() {
  document.getElementById('mobile-menu').classList.toggle('open');
}

// ===== AUTH =====
// Note: the older sync `loadUserSession(user)` helper was removed when
// the app was migrated to Supabase. The async version defined further
// up reads the session from Supabase instead of localStorage.

// Client-side rate limiting for failed logins. This is NOT a security
// boundary — an attacker can trivially clear localStorage — it's a UX
// guardrail + a slowdown for casual password-guessing. Supabase has
// its own server-side rate limits that are the actual defense.
//
// Backoff schedule (failures → cooldown before next attempt):
//   0-2 fails  → no wait
//   3-4 fails  → 10 s
//   5-6 fails  → 30 s
//   7-9 fails  → 2 min
//   10+ fails  → 10 min
// Counter resets on successful login.
const LOGIN_LOCK_KEY = 'ej_login_throttle_v1';

function _loadLoginThrottle() {
  try { return JSON.parse(localStorage.getItem(LOGIN_LOCK_KEY) || '{}'); }
  catch (_) { return {}; }
}
function _saveLoginThrottle(data) {
  try { localStorage.setItem(LOGIN_LOCK_KEY, JSON.stringify(data)); }
  catch (_) { /* quota exceeded → ignore, UX only */ }
}
function _lockoutSecondsForCount(n) {
  if (n < 3)  return 0;
  if (n < 5)  return 10;
  if (n < 7)  return 30;
  if (n < 10) return 120;
  return 600;
}
function loginLockoutRemaining(email) {
  const s = _loadLoginThrottle();
  const entry = s[email];
  if (!entry) return 0;
  const need = _lockoutSecondsForCount(entry.fails) * 1000;
  const elapsed = Date.now() - (entry.last || 0);
  const remain = need - elapsed;
  return remain > 0 ? Math.ceil(remain / 1000) : 0;
}
function recordFailedLogin(email) {
  const s = _loadLoginThrottle();
  const entry = s[email] || { fails: 0, last: 0 };
  entry.fails += 1;
  entry.last = Date.now();
  s[email] = entry;
  _saveLoginThrottle(s);
}
function clearFailedLogins(email) {
  const s = _loadLoginThrottle();
  if (s[email]) { delete s[email]; _saveLoginThrottle(s); }
}

async function login(email, password) {
  const errEl = document.getElementById('login-error');
  const showErr = (msg) => { if (errEl) { errEl.textContent = msg; errEl.style.display='block'; } };
  if (errEl) errEl.style.display = 'none';
  if (!window.DB) { showErr('Backend nicht geladen - bitte Seite neu laden.'); return; }
  const cleanEmail = (email || '').trim().toLowerCase();
  if (!cleanEmail || !password) { showErr('Bitte E-Mail und Passwort eingeben.'); return; }
  // Rate-limit repeated failures for this email.
  const wait = loginLockoutRemaining(cleanEmail);
  if (wait > 0) {
    showErr('Zu viele fehlgeschlagene Versuche. Bitte ' + wait + ' Sek. warten.');
    return;
  }
  // Step 1: Authenticate with Supabase
  try {
    await DB.signIn({ email: cleanEmail, password });
  } catch (e) {
    const msg = (e && e.message) || '';
    // Record the failure before returning so the backoff ramps up.
    recordFailedLogin(cleanEmail);
    const newWait = loginLockoutRemaining(cleanEmail);
    const tail = newWait > 0 ? ' (nächster Versuch in ' + newWait + ' Sek.)' : '';
    if (/email not confirmed/i.test(msg)) showErr('E-Mail noch nicht bestätigt. Bitte Link in der Mail klicken.');
    else if (/invalid login/i.test(msg) || /invalid/i.test(msg)) showErr('E-Mail oder Passwort falsch. Noch kein Konto? Jetzt registrieren.' + tail);
    else showErr('Login fehlgeschlagen: ' + msg + tail);
    console.error('[login] signIn failed', e);
    return;
  }
  // Success → reset the failure counter for this email.
  clearFailedLogins(cleanEmail);
  // Step 2: Load session synchron (billig — nur Cookie-Lookup).
  // Alle anderen Loads laufen im Hintergrund, damit das Dashboard
  // sofort gerendert wird (mit Skeletons wo nötig).
  try { await loadUserSession(); } catch (e) { console.error('[login] loadUserSession', e); }
  if (state.user) {
    _loadUserDataInBackground();
  }
  try { subscribeToJobUpdates(); } catch (e) { console.error('[login] jobsSub', e); }
  // Step 3: Navigate to the dashboard
  if (state.user) {
    navigate(state.user.role === 'employer' ? 'employer-dashboard' : 'worker-dashboard');
  } else {
    showErr('Login erfolgreich, aber Profil konnte nicht geladen werden. Bitte Seite neu laden.');
  }
}

async function register(data) {
  const errEl = document.getElementById('register-error');
  const showErr = (msg) => { if (errEl) { errEl.textContent = msg; errEl.style.display='block'; } };
  if (errEl) errEl.style.display = 'none';
  if (!window.DB) { showErr('Backend nicht geladen - bitte Seite neu laden.'); return; }
  const cleanEmail = (data.email || '').trim().toLowerCase();
  if (!cleanEmail || !data.password) { showErr('E-Mail und Passwort sind erforderlich.'); return; }
  if (data.password.length < 6) { showErr('Passwort muss mindestens 6 Zeichen lang sein.'); return; }
  // Step 1: Create account
  try {
    await DB.signUp({
      email: cleanEmail,
      password: data.password,
      name: data.name || '',
      role: data.role || 'worker',
      company: data.company || null,
      captchaToken: data.captchaToken || null
    });
  } catch (e) {
    const msg = (e && e.message) || '';
    if (/already registered|already exists|duplicate/i.test(msg)) showErr('Diese E-Mail ist bereits registriert. Bitte melde dich an.');
    else if (/password/i.test(msg)) showErr('Passwort ungültig: ' + msg);
    else showErr('Registrierung fehlgeschlagen: ' + msg);
    console.error('[register]', e);
    return;
  }
  // Step 2: signUp also signs in immediately (when email confirmation is off).
  // Session synchron laden, Rest im Hintergrund (Skeletons übernehmen).
  try { await loadUserSession(); } catch (e) { console.error('[register] loadUserSession', e); }
  if (state.user) {
    _loadUserDataInBackground();
  }
  try { subscribeToJobUpdates(); } catch (e) { console.error('[register] jobsSub', e); }
  if (state.user) {
    navigate(state.user.role === 'employer' ? 'employer-dashboard' : 'worker-dashboard');
  } else {
    showErr('Registrierung erfolgreich, aber Profil konnte nicht geladen werden. Bitte Seite neu laden.');
  }
}

async function logout() {
  state.dropdownOpen = false;
  // ALLES synchron leeren BEVOR navigate/render lauft, damit der
  // naechste render() keinen Mix aus "User null" + "Chat/Apps noch
  // vom alten User" sieht. Der SIGNED_OUT-Auth-Handler macht hinterher
  // das Gleiche nochmal — das ist idempotent und nicht schaedlich.
  try { await DB.signOut(); } catch (e) { console.error('[logout]', e); }
  state.user = null;
  state._savedJobs = [];
  state._appsCache = [];
  state.chatsLoaded = false;
  state.applicationsLoaded = false;
  if (typeof WORKER_CHAT_MESSAGES !== 'undefined') WORKER_CHAT_MESSAGES.length = 0;
  if (typeof EMPLOYER_CHAT_MESSAGES !== 'undefined') EMPLOYER_CHAT_MESSAGES.length = 0;
  // Geocoding-Cache behalten (adressen sind nicht user-spezifisch),
  // Filter-State aber resetten damit User B nicht Adresse von A sieht.
  state.filters = { search: '', category: '', type: '', radius: 50, hours: [], city: '', sort: 'date', address: '' };
  navigate('landing');
}

// ===== TOAST =====
function showToast(msg, type='success') {
  const existing = document.getElementById('jj-toast');
  if (existing) existing.remove();
  const t = document.createElement('div');
  t.id = 'jj-toast';
  t.textContent = msg;
  t.style.cssText = `position:fixed;bottom:2rem;left:50%;transform:translateX(-50%);
    background:${type==='success'?'var(--success)':type==='error'?'var(--danger)':'var(--primary)'};
    color:#fff;padding:0.75rem 1.5rem;border-radius:100px;font-size:0.9rem;font-weight:600;
    z-index:9999;box-shadow:0 4px 16px rgba(0,0,0,0.15);animation:fadeIn 0.2s ease`;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

// ===== BEWERBUNG =====
// applications loaded per-user via getUserApps()

// Returns the list of job IDs the current worker has applied to.
// Reads from the Supabase-backed cache filled by loadApplicationsForUser().
function getUserApps() {
  if (!state.user) return [];
  const cache = state._appsCache || [];
  return cache
    .filter(a => a.userId === state.user.id)
    .map(a => a.jobId);
}
// Legacy no-op: applications are now persisted via DB.applyToJob and
// refreshed via loadApplicationsForUser(). Kept so older call sites don't
// crash if they still reference it.
function saveUserApps(_apps) { /* no-op */ }

// ===== AKTIVER JOB SYSTEM =====
// Derived from the worker's accepted applications so no extra DB writes
// are needed — when the employer accepts a worker, the application row
// flips to status='accepted' and getActiveJob() picks that up.
function getActiveJob() {
  if (!state.user || state.user.role !== 'worker') return null;
  const accepted = (state._appsCache || []).find(
    a => a.userId === state.user.id && a.status === 'accepted'
  );
  if (!accepted) return null;
  // Employer-ID fuer die spaetere Bewertung aus dem Job-Datensatz
  // ziehen — die application-Zeile fuehrt nur job_id, nicht employer_id.
  const job = (typeof JOBS !== 'undefined') ? JOBS.find(j => j.id === accepted.jobId) : null;
  return {
    appId:       accepted.id,
    jobId:       accepted.jobId,
    jobTitle:    accepted.jobTitle,
    jobCompany:  accepted.jobCompany,
    acceptedAt:  accepted.date,
    employerId:  job ? job.employerId : null
  };
}
// clearActiveJob + completed_jobs are stored in profiles so a worker can
// finish a job and rate the employer even after the application is gone.
// Wichtig: zusaetzlich den application-Row auf 'withdrawn' setzen, sonst
// findet getActiveJob() denselben Job beim naechsten Aufruf wieder und
// das Dashboard zeigt weiter "aktiven Job".
async function clearActiveJob() {
  if (!state.user || !window.DB) return;
  const activeJob = getActiveJob();
  const completed = Array.isArray(state.user.completedJobs) ? state.user.completedJobs.slice() : [];
  if (activeJob) {
    activeJob.completedAt = new Date().toISOString();
    completed.push(activeJob);
  }
  state.user.completedJobs = completed;
  try {
    await DB.updateProfile(state.user.id, { completed_jobs: completed });
    if (activeJob && activeJob.appId && DB.updateApplicationStatus) {
      await DB.updateApplicationStatus(activeJob.appId, 'withdrawn');
      // Cache lokal mitziehen damit getActiveJob() sofort null liefert.
      const cached = (state._appsCache || []).find(a => a.id === activeJob.appId);
      if (cached) cached.status = 'withdrawn';
    }
  } catch (e) { console.error('[clearActiveJob]', e); }
}
function getCompletedJobs() {
  if (!state.user) return [];
  return Array.isArray(state.user.completedJobs) ? state.user.completedJobs : [];
}
async function endActiveJob() {
  await clearActiveJob();
  showToast('Job abgeschlossen! Du kannst jetzt eine Bewertung abgeben.');
  render();
}
function getPendingAppCount() {
  const allApps = getAllApplications();
  // 'withdrawn' darf NICHT mitzaehlen — sonst wird ein Worker nach 3x
  // zurueckgezogenen Bewerbungen permanent blockiert.
  return allApps.filter(a =>
    a.userId === state.user?.id &&
    a.status !== 'rejected' &&
    a.status !== 'accepted' &&
    a.status !== 'withdrawn'
  ).length;
}

function submitApplication(jobId) {
  if (!state.user) { navigate('login'); return; }
  // Kein Bewerben auf eigenen Job. Admins + Employer haben keine
  // Worker-Rolle, aber sicherheitshalber auch ausschliessen.
  if (state.user.role !== 'worker') {
    showToast('Nur Arbeitnehmer können sich bewerben.', 'error');
    return;
  }
  const job = JOBS.find(j => j.id === jobId);
  if (job && job.employerId === state.user.id) {
    showToast('Du kannst dich nicht auf deinen eigenen Job bewerben.', 'error');
    return;
  }
  if (job && job.active === false) {
    showToast('Dieser Job ist nicht mehr aktiv.', 'error');
    return;
  }
  const apps = getUserApps();
  if (apps.includes(jobId)) { showToast('Du hast dich bereits beworben!', 'info'); return; }
  if (getActiveJob()) { showToast('Du hast bereits einen aktiven Job. Beende ihn zuerst, bevor du dich neu bewirbst.', 'error'); return; }
  const pendingCount = getPendingAppCount();
  if (pendingCount >= 3) { showToast('Du kannst maximal 3 Bewerbungen gleichzeitig haben. Warte auf eine Antwort oder ziehe eine zurück.', 'error'); return; }
  state.applyJobId = jobId; state.applyStep = 1; state.applyMotivation = ''; state.applyMotivationFile = null; state.applyCVFile = null; state.applyCVMethod = null; state.applyMotivationMethod = null;
  openApplyModal();
}
function openApplyModal() { var m = document.getElementById('apply-modal'); if (m) m.classList.add('open'); renderApplyStep(); }
function closeApplyModal() { var m = document.getElementById('apply-modal'); if (m) m.classList.remove('open'); }
function renderApplyStep() {
  var body = document.getElementById('apply-modal-body'), footer = document.getElementById('apply-modal-footer'), si = document.getElementById('apply-step-indicator');
  if (!body) return;
  var job = JOBS.find(function(j){return j.id===state.applyJobId;}); var jobTitle = job ? job.title : 'Job'; var company = job ? job.company : '';
  if (si) { si.innerHTML = [1,2,3].map(function(s){ return '<div style="display:flex;align-items:center;gap:0.4rem"><div style="width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:0.8rem;font-weight:700;' + (s<state.applyStep?'background:#2563eb;color:#fff':s===state.applyStep?'background:var(--primary);color:#fff':'background:var(--gray-200);color:var(--gray-500)') + '">' + (s<state.applyStep?'✓':s) + '</div><span style="font-size:0.75rem;color:' + (s===state.applyStep?'var(--primary)':'var(--gray-400)') + ';font-weight:' + (s===state.applyStep?'600':'400') + '">' + (s===1?'Anschreiben':s===2?'Lebenslauf':'Vorschau') + '</span></div>' + (s<3?'<div style="flex:1;height:2px;background:var(--gray-200);margin:0 0.25rem"><div style="height:100%;background:var(--primary);width:' + (s<state.applyStep?'100%':'0%') + '"></div></div>':''); }).join(''); }
  if (state.applyStep === 1) {
    body.innerHTML = '<h4 style="margin-bottom:0.25rem">Motivationsschreiben</h4><p style="font-size:0.85rem;color:var(--gray-500);margin-bottom:1.25rem">für <strong>' + jobTitle + '</strong> bei <strong>' + company + '</strong></p><div style="display:flex;flex-direction:column;gap:0.75rem;margin-bottom:1.25rem"><div class="card apply-option ' + (state.applyMotivationMethod==='generate'?'apply-option-active':'') + '" onclick="selectMotivationMethod(\'generate\')" style="cursor:pointer"><div class="card-body" style="display:flex;align-items:center;gap:1rem;padding:1rem"><div style="width:40px;height:40px;border-radius:10px;background:rgba(37,99,235,0.1);display:flex;align-items:center;justify-content:center;flex-shrink:0"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M9 9h.01M15 9h.01M9 15h6"/></svg></div><div style="flex:1"><strong style="font-size:0.9rem">Automatisch erstellen lassen</strong><div style="font-size:0.8rem;color:var(--gray-500)">Basierend auf deinem Profil</div></div><input type="radio" name="mm" ' + (state.applyMotivationMethod==='generate'?'checked':'') + '></div></div><div class="card apply-option ' + (state.applyMotivationMethod==='upload'?'apply-option-active':'') + '" onclick="selectMotivationMethod(\'upload\')" style="cursor:pointer"><div class="card-body" style="display:flex;align-items:center;gap:1rem;padding:1rem"><div style="width:40px;height:40px;border-radius:10px;background:rgba(99,102,241,0.1);display:flex;align-items:center;justify-content:center;flex-shrink:0"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg></div><div style="flex:1"><strong style="font-size:0.9rem">Eigene Datei hochladen</strong><div style="font-size:0.8rem;color:var(--gray-500)">PDF, DOC oder TXT</div></div><input type="radio" name="mm" ' + (state.applyMotivationMethod==='upload'?'checked':'') + '></div></div><div class="card apply-option ' + (state.applyMotivationMethod==='skip'?'apply-option-active':'') + '" onclick="selectMotivationMethod(\'skip\')" style="cursor:pointer"><div class="card-body" style="display:flex;align-items:center;gap:1rem;padding:1rem"><div style="width:40px;height:40px;border-radius:10px;background:rgba(156,163,175,0.1);display:flex;align-items:center;justify-content:center;flex-shrink:0"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2"><path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"/><polyline points="13 2 13 9 20 9"/></svg></div><div style="flex:1"><strong style="font-size:0.9rem">Ohne Motivationsschreiben</strong><div style="font-size:0.8rem;color:var(--gray-500)">Direkt mit Lebenslauf bewerben</div></div><input type="radio" name="mm" ' + (state.applyMotivationMethod==='skip'?'checked':'') + '></div></div></div><div id="motivation-detail"></div>';
    if (state.applyMotivationMethod) renderMotivationDetail();
    footer.innerHTML = '<button class="btn btn-outline" onclick="closeApplyModal()">Abbrechen</button><button class="btn btn-primary" id="apply-next-1" ' + (!state.applyMotivationMethod?'disabled':'') + ' onclick="applyNextStep()">Weiter</button>';
  } else if (state.applyStep === 2) {
    var hasCV = state.user && state.user.cvUploaded;
    body.innerHTML = '<h4 style="margin-bottom:0.25rem">Lebenslauf</h4><p style="font-size:0.85rem;color:var(--gray-500);margin-bottom:1.25rem">Füge deinen Lebenslauf hinzu</p><div style="display:flex;flex-direction:column;gap:0.75rem">' + (hasCV ? '<div class="card apply-option ' + (state.applyCVMethod==='existing'?'apply-option-active':'') + '" onclick="selectCVMethod(\'existing\')" style="cursor:pointer"><div class="card-body" style="display:flex;align-items:center;gap:1rem;padding:1rem"><div style="width:40px;height:40px;border-radius:10px;background:rgba(37,99,235,0.1);display:flex;align-items:center;justify-content:center;flex-shrink:0"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div><div style="flex:1"><strong style="font-size:0.9rem">Vorhandenen Lebenslauf verwenden</strong><div style="font-size:0.8rem;color:var(--gray-500)">' + (state.user.cvFileName||'Lebenslauf (Builder)') + '</div></div><input type="radio" name="cm" ' + (state.applyCVMethod==='existing'?'checked':'') + '></div></div>' : '') + '<div class="card apply-option ' + (state.applyCVMethod==='upload'?'apply-option-active':'') + '" onclick="selectCVMethod(\'upload\')" style="cursor:pointer"><div class="card-body" style="display:flex;align-items:center;gap:1rem;padding:1rem"><div style="width:40px;height:40px;border-radius:10px;background:rgba(99,102,241,0.1);display:flex;align-items:center;justify-content:center;flex-shrink:0"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg></div><div style="flex:1"><strong style="font-size:0.9rem">Datei hochladen</strong><div style="font-size:0.8rem;color:var(--gray-500)">PDF, DOC oder Bild</div></div><input type="radio" name="cm" ' + (state.applyCVMethod==='upload'?'checked':'') + '></div></div><div class="card apply-option ' + (state.applyCVMethod==='create'?'apply-option-active':'') + '" onclick="selectCVMethod(\'create\')" style="cursor:pointer"><div class="card-body" style="display:flex;align-items:center;gap:1rem;padding:1rem"><div style="width:40px;height:40px;border-radius:10px;background:rgba(249,115,22,0.1);display:flex;align-items:center;justify-content:center;flex-shrink:0"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f97316" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg></div><div style="flex:1"><strong style="font-size:0.9rem">Jetzt einen erstellen</strong><div style="font-size:0.8rem;color:var(--gray-500)">Mit unserem Lebenslauf-Builder</div></div><input type="radio" name="cm" ' + (state.applyCVMethod==='create'?'checked':'') + '></div></div></div><div id="cv-detail" style="margin-top:1rem"></div>';
    if (state.applyCVMethod === 'upload') { document.getElementById('cv-detail').innerHTML = '<div style="border:2px dashed var(--gray-300);border-radius:var(--radius);padding:1.5rem;text-align:center;cursor:pointer" onclick="document.getElementById(\'apply-cv-file\').click()"><input type="file" id="apply-cv-file" accept=".pdf,.doc,.docx,.jpg,.png" style="display:none" onchange="handleApplyCVFile(this)">' + (state.applyCVFile ? '<div style="color:var(--success);font-weight:600">✓ ' + state.applyCVFile.name + '</div>' : '<div style="font-size:0.85rem;color:var(--gray-500)">Klicke hier um eine Datei hochzuladen</div>') + '</div>'; }
    footer.innerHTML = '<button class="btn btn-outline" onclick="state.applyStep=1;renderApplyStep()">Zurück</button><button class="btn btn-primary" ' + (!state.applyCVMethod||(state.applyCVMethod==='upload'&&!state.applyCVFile)?'disabled':'') + ' onclick="applyNextStep()">Weiter zur Vorschau</button>';
  } else if (state.applyStep === 3) {
    var u = state.user || {}; var initials = u.name ? u.name.split(' ').map(function(n){return n[0];}).join('') : '?';
    body.innerHTML = '<h4 style="margin-bottom:0.25rem">Vorschau deiner Bewerbung</h4><p style="font-size:0.85rem;color:var(--gray-500);margin-bottom:1.25rem">So sieht es für den Arbeitgeber aus</p><div class="card" style="border-color:var(--primary);background:linear-gradient(135deg,rgba(37,99,235,0.02),rgba(99,102,241,0.02))"><div class="card-body" style="padding:1.25rem"><div style="display:flex;align-items:center;gap:1rem;margin-bottom:1.25rem;padding-bottom:1rem;border-bottom:1px solid var(--gray-200)"><div style="width:48px;height:48px;border-radius:50%;background:var(--primary);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:1rem">' + initials + '</div><div style="flex:1"><div style="font-weight:700;font-size:1rem">' + (u.name||'') + '</div><div style="font-size:0.8rem;color:var(--gray-500)">' + (u.email||'') + '</div></div><span class="badge" style="background:#ecfdf5;color:#1d4ed8;padding:0.3rem 0.75rem;border-radius:100px;font-size:0.75rem;font-weight:600">Neue Bewerbung</span></div><div style="font-size:0.8rem;color:var(--gray-500);margin-bottom:0.15rem">Bewerbung für</div><div style="font-weight:600;margin-bottom:1rem">' + jobTitle + ' bei ' + company + '</div><div style="margin-bottom:1rem"><div style="font-size:0.8rem;color:var(--gray-500);margin-bottom:0.35rem;font-weight:600">Motivationsschreiben</div>' + (state.applyMotivationMethod==='generate'?'<div style="background:var(--gray-50);border-radius:var(--radius-sm);padding:0.75rem;font-size:0.85rem;color:var(--gray-700);border:1px solid var(--gray-200);white-space:pre-line;max-height:150px;overflow-y:auto">' + state.applyMotivation + '</div>':state.applyMotivationMethod==='upload'&&state.applyMotivationFile?'<div style="display:flex;align-items:center;gap:0.5rem;padding:0.6rem 0.75rem;background:var(--gray-50);border-radius:var(--radius-sm);border:1px solid var(--gray-200);font-size:0.85rem">📄 ' + state.applyMotivationFile.name + '</div>':'<div style="font-size:0.85rem;color:var(--gray-500);font-style:italic">Nicht beigefügt</div>') + '</div><div><div style="font-size:0.8rem;color:var(--gray-500);margin-bottom:0.35rem;font-weight:600">Lebenslauf</div>' + (state.applyCVMethod==='existing'?'<div style="display:flex;align-items:center;gap:0.5rem;padding:0.6rem 0.75rem;background:var(--gray-50);border-radius:var(--radius-sm);border:1px solid var(--gray-200);font-size:0.85rem">✓ ' + (u.cvFileName||'Lebenslauf') + '</div>':state.applyCVMethod==='upload'&&state.applyCVFile?'<div style="display:flex;align-items:center;gap:0.5rem;padding:0.6rem 0.75rem;background:var(--gray-50);border-radius:var(--radius-sm);border:1px solid var(--gray-200);font-size:0.85rem">📄 ' + state.applyCVFile.name + '</div>':'<div style="font-size:0.85rem;color:var(--gray-500);font-style:italic">Über Builder erstellt</div>') + '</div></div></div>';
    footer.innerHTML = '<button class="btn btn-outline" onclick="state.applyStep=2;renderApplyStep()">Zurück</button><button class="btn btn-primary" onclick="finalSubmitApplication()">Bewerbung absenden</button>';
  }
}
function selectMotivationMethod(m) { state.applyMotivationMethod = m; renderApplyStep(); if (m === 'generate' || m === 'upload') renderMotivationDetail(); }
function generateMotivationText() {
  var job = JOBS.find(function(j){return j.id===state.applyJobId;});
  var name = document.getElementById('motiv-name')?.value?.trim() || state.user?.name || 'Max Mustermann';
  var alter = document.getElementById('motiv-alter')?.value?.trim() || '';
  var schule = document.getElementById('motiv-schule')?.value?.trim() || '';
  var staerken = document.getElementById('motiv-staerken')?.value?.trim() || '';
  var motivation = document.getElementById('motiv-warum')?.value?.trim() || '';
  var verfuegbar = document.getElementById('motiv-verfuegbar')?.value?.trim() || '';
  var erfahrung = document.getElementById('motiv-erfahrung')?.value?.trim() || '';
  var jobTitle = job ? job.title : 'die ausgeschriebene Stelle';
  var firma = job ? job.company : 'Ihr Unternehmen';
  var branche = job ? (job.category || '') : '';
  var ort = job ? (job.city || '') : '';

  var text = name + '\n' + (ort || 'Musterstadt') + '\n\n';
  text += 'An\n' + firma + '\n' + (ort ? ort : '') + '\n\n';
  text += 'Bewerbung als ' + jobTitle + '\n\n';
  text += 'Sehr geehrte Damen und Herren,\n\n';

  // Einleitung - ausgeschmückt
  text += 'mit großer Begeisterung habe ich Ihre Stellenanzeige als ' + jobTitle + ' bei ' + firma + ' gelesen. ';
  if (branche) {
    text += 'Der Bereich ' + branche + ' fasziniert mich schon seit längerer Zeit, und ich bin überzeugt, dass ' + firma + ' genau das richtige Unternehmen ist, um erste wertvolle Berufserfahrungen zu sammeln. ';
  }
  text += 'Hiermit möchte ich mich bei Ihnen um diese Stelle bewerben und Ihnen zeigen, warum ich die richtige Wahl für Ihr Team bin.\n\n';

  // Persönliche Vorstellung - ausgeschmückt
  text += 'Zu meiner Person: Mein Name ist ' + name;
  if (alter) text += ' und ich bin ' + alter + ' Jahre alt';
  text += '. ';
  if (schule) {
    text += 'Derzeit besuche ich ' + schule + ', wo ich neben meiner schulischen Ausbildung großen Wert darauf lege, praktische Erfahrungen zu sammeln und mich persönlich weiterzuentwickeln. ';
  }
  text += 'Ich bin eine aufgeschlossene und lernbereite Person, die sich schnell in neue Aufgabenbereiche einarbeiten kann.\n\n';

  // Motivation - ausgeschmückt
  if (motivation) {
    text += 'Was mich besonders an dieser Stelle begeistert: ' + motivation + '. ';
    text += 'Ich sehe in dieser Tätigkeit nicht nur eine Möglichkeit, Geld zu verdienen, sondern vor allem die Chance, mich in einem professionellen Umfeld weiterzuentwickeln und einen echten Beitrag zu Ihrem Team zu leisten. ';
    if (branche) {
      text += 'Die Arbeit im Bereich ' + branche + ' reizt mich, weil ich hier meine Interessen mit praktischer Berufserfahrung verbinden kann.';
    }
    text += '\n\n';
  }

  // Erfahrungen - ausgeschmückt
  if (erfahrung) {
    text += 'Bereits in der Vergangenheit konnte ich wertvolle Erfahrungen sammeln: ' + erfahrung + '. ';
    text += 'Diese Erfahrungen haben mir gezeigt, wie wichtig Verantwortungsbewusstsein, Teamarbeit und eine zuverlässige Arbeitsweise sind. Ich bin sicher, dass ich diese Qualitäten auch bei Ihnen erfolgreich einbringen kann.\n\n';
  }

  // Stärken - ausgeschmückt
  if (staerken) {
    var staerkenArr = staerken.split(',').map(function(s){return s.trim();}).filter(Boolean);
    text += 'Meine persönlichen Stärken liegen insbesondere in den Bereichen ';
    if (staerkenArr.length === 1) {
      text += staerkenArr[0];
    } else if (staerkenArr.length === 2) {
      text += staerkenArr[0] + ' und ' + staerkenArr[1];
    } else {
      text += staerkenArr.slice(0, -1).join(', ') + ' sowie ' + staerkenArr[staerkenArr.length - 1];
    }
    text += '. ';
    text += 'Ich bin davon überzeugt, dass diese Eigenschaften für die Position als ' + jobTitle + ' von großem Vorteil sind. ';
    text += 'Darüber hinaus zeichne ich mich durch eine schnelle Auffassungsgabe und die Bereitschaft aus, auch über die gewohnten Aufgaben hinaus Verantwortung zu übernehmen.\n\n';
  }

  // Verfügbarkeit und Schluss - ausgeschmückt
  text += 'Was meine zeitliche Verfügbarkeit betrifft: Ich bin ' + (verfuegbar ? 'ab ' + verfuegbar + ' einsatzbereit' : 'zeitlich flexibel einsetzbar') + ' und kann mich gut an verschiedene Arbeitszeiten anpassen. ';
  text += 'Zuverlässigkeit und Pünktlichkeit sind für mich selbstverständlich.\n\n';

  text += 'Ich würde mich sehr freuen, wenn Sie mir die Gelegenheit geben würden, mich in einem persönlichen Gespräch bei Ihnen vorzustellen. ';
  text += 'Gerne möchte ich Sie davon überzeugen, dass ich mit meiner Motivation, meinem Engagement und meiner Lernbereitschaft eine Bereicherung für Ihr Team sein werde.\n\n';

  text += 'Über eine positive Rückmeldung würde ich mich sehr freuen.\n\n';
  text += 'Mit freundlichen Grüßen\n' + name;

  state.applyMotivation = text;
  var ta = document.getElementById('motiv-result');
  if (ta) { ta.value = text; ta.style.display = 'block'; }
  var btn = document.getElementById('apply-next-1'); if (btn) btn.disabled = false;
}
function renderMotivationDetail() {
  var d = document.getElementById('motivation-detail'); if (!d) return;
  if (state.applyMotivationMethod === 'generate') {
    var job = JOBS.find(function(j){return j.id===state.applyJobId;});
    d.innerHTML = '<div style="margin-top:0.75rem;display:flex;flex-direction:column;gap:0.75rem">' +
      '<p style="font-size:0.8rem;color:var(--gray-500);margin:0">Fülle die Felder aus – wir erstellen daraus ein ausführliches, professionelles Motivationsschreiben:</p>' +
      '<div class="form-row" style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem">' +
        '<div class="form-group" style="margin:0"><label class="form-label" style="font-size:0.8rem">Dein vollständiger Name</label><input type="text" id="motiv-name" class="form-input" value="' + (state.user?.name||'') + '" placeholder="Vor- und Nachname"></div>' +
        '<div class="form-group" style="margin:0"><label class="form-label" style="font-size:0.8rem">Dein Alter</label><input type="text" id="motiv-alter" class="form-input" placeholder="z.B. 16"></div>' +
      '</div>' +
      '<div class="form-group" style="margin:0"><label class="form-label" style="font-size:0.8rem">Schule / Ausbildung</label><input type="text" id="motiv-schule" class="form-input" placeholder="z.B. Gymnasium München, 10. Klasse"></div>' +
      '<div class="form-group" style="margin:0"><label class="form-label" style="font-size:0.8rem">Warum möchtest du diesen Job? Was interessiert dich daran?</label><textarea id="motiv-warum" class="form-textarea" rows="2" style="font-size:0.85rem" placeholder="z.B. Ich finde den Kontakt mit Kunden spannend und möchte lernen, wie ein Geschäft funktioniert"></textarea></div>' +
      '<div class="form-group" style="margin:0"><label class="form-label" style="font-size:0.8rem">Hast du schon Erfahrungen gesammelt? (Praktika, Jobs, Ehrenamt)</label><textarea id="motiv-erfahrung" class="form-textarea" rows="2" style="font-size:0.85rem" placeholder="z.B. Ich habe ein Schulpraktikum bei einem Bäcker gemacht und helfe ehrenamtlich im Sportverein"></textarea></div>' +
      '<div class="form-group" style="margin:0"><label class="form-label" style="font-size:0.8rem">Deine Stärken (mit Komma trennen)</label><input type="text" id="motiv-staerken" class="form-input" placeholder="z.B. Teamfähigkeit, Zuverlässigkeit, Freundlichkeit, Pünktlichkeit"></div>' +
      '<div class="form-group" style="margin:0"><label class="form-label" style="font-size:0.8rem">Ab wann bist du verfügbar?</label><input type="text" id="motiv-verfuegbar" class="form-input" placeholder="z.B. sofort, ab 01.05.2026, nachmittags ab 14 Uhr"></div>' +
      '<button class="btn btn-primary" onclick="generateMotivationText()" style="align-self:flex-start">Motivationsschreiben erstellen</button>' +
      '<textarea id="motiv-result" class="form-textarea" rows="18" style="font-size:0.85rem;' + (state.applyMotivation ? '' : 'display:none') + '" onchange="state.applyMotivation=this.value">' + (state.applyMotivation||'') + '</textarea>' +
    '</div>';
    var btn = document.getElementById('apply-next-1'); if (btn) btn.disabled = !state.applyMotivation;
  } else if (state.applyMotivationMethod === 'upload') {
    d.innerHTML = '<div style="margin-top:0.75rem;border:2px dashed var(--gray-300);border-radius:var(--radius);padding:1.5rem;text-align:center;cursor:pointer" onclick="document.getElementById(\'apply-motivation-file\').click()"><input type="file" id="apply-motivation-file" accept=".pdf,.doc,.docx,.txt" style="display:none" onchange="handleApplyMotivationFile(this)">' + (state.applyMotivationFile ? '<div style="color:var(--success);font-weight:600">✓ ' + state.applyMotivationFile.name + '</div>' : '<div style="font-size:0.85rem;color:var(--gray-500)">Klicke hier um hochzuladen</div>') + '</div>';
    var btn = document.getElementById('apply-next-1'); if (btn) btn.disabled = !state.applyMotivationFile;
  } else { d.innerHTML = ''; }
}
function handleApplyMotivationFile(input) { if (input.files && input.files[0]) { state.applyMotivationFile = { name: input.files[0].name }; renderMotivationDetail(); } }
function handleApplyCVFile(input) { if (input.files && input.files[0]) { state.applyCVFile = { name: input.files[0].name }; renderApplyStep(); } }
function selectCVMethod(m) { state.applyCVMethod = m; if (m === 'create') { closeApplyModal(); navigate('cv-builder'); showToast('Erstelle deinen Lebenslauf und bewirb dich danach erneut!', 'info'); return; } renderApplyStep(); }
function applyNextStep() { state.applyStep++; renderApplyStep(); }
async function finalSubmitApplication() {
  if (!state.user) { showToast('Bitte erst einloggen.', 'error'); return; }
  if (!window.DB)  { showToast('Backend nicht geladen.', 'error'); return; }
  const jobId = state.applyJobId;
  if (!jobId)      { showToast('Kein Job ausgewählt.', 'error'); return; }

  // Prevent double-submit: if already applied, just close the modal.
  if (getUserApps().includes(jobId)) {
    closeApplyModal();
    showToast('Du hast dich bereits beworben.', 'info');
    return;
  }

  try {
    await DB.applyToJob(jobId, state.user.id, state.applyMotivation || null);
    // Refresh the cache so the worker dashboard / getUserApps pick it up
    await loadApplicationsForUser();
    closeApplyModal();
    showToast('Bewerbung erfolgreich gesendet!');
    render();
  } catch (e) {
    console.error('[finalSubmitApplication]', e);
    const msg = (e && e.message) || '';
    if (/duplicate/i.test(msg)) {
      showToast('Du hast dich bereits für diesen Job beworben.', 'info');
      await loadApplicationsForUser();
      closeApplyModal();
      render();
    } else {
      showToast('Bewerbung konnte nicht gesendet werden: ' + msg, 'error');
    }
  }
}

function openApplicationDoc(appId, docType) {
  // Read from the Supabase-backed apps cache (loaded by
  // loadApplicationsForUser). Falls back to a string-equality lookup
  // because UUIDs and integers can both legitimately appear here.
  var allApps = state._appsCache || [];
  var app = allApps.find(function(a) { return a.id === appId || String(a.id) === String(appId); });
  if (!app) { showToast('Bewerbung nicht gefunden', 'error'); return; }

  var win = window.open('', '_blank');
  if (!win) { showToast('Popup wurde blockiert. Bitte erlaube Popups für diese Seite.', 'error'); return; }
  var html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>' + (docType === 'motivation' ? 'Motivationsschreiben' : 'Lebenslauf') + ' - ' + escapeHtml(app.name) + '</title>';
  html += '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">';
  html += '<style>body{font-family:Inter,Arial,sans-serif;margin:0;padding:2rem;background:#f3f4f6;color:#1a1a2e;} .doc{max-width:700px;margin:0 auto;background:#fff;padding:3rem;box-shadow:0 2px 20px rgba(0,0,0,0.08);border-radius:4px;min-height:800px;} h1{font-size:1.5rem;margin:0 0 0.5rem;} .meta{color:#666;font-size:0.85rem;margin-bottom:2rem;padding-bottom:1rem;border-bottom:2px solid #eee;} .section-title{font-size:0.85rem;text-transform:uppercase;letter-spacing:0.1em;color:#1e3a5f;font-weight:700;margin:1.5rem 0 0.5rem;padding-bottom:0.3rem;border-bottom:1px solid #e5e7eb;} .content{font-size:0.95rem;line-height:1.7;white-space:pre-line;} .info-row{display:flex;gap:0.5rem;font-size:0.9rem;margin-bottom:0.3rem;} .info-label{color:#666;min-width:120px;} .skills-list{display:flex;flex-wrap:wrap;gap:0.4rem;} .skill-tag{padding:0.25rem 0.7rem;background:#eff6ff;color:#1e40af;border-radius:100px;font-size:0.8rem;font-weight:600;} @media print{body{padding:0;background:#fff;} .doc{box-shadow:none;padding:2rem;}}</style></head><body>';

  if (docType === 'motivation') {
    // All user-controlled fields below are rendered into a brand new
    // window via document.write, so they MUST be escaped — otherwise
    // a malicious applicant could inject an SCRIPT tag and
    // have it run in the employer's browser when they open the doc.
    html += '<div class="doc">';
    html += '<h1>Motivationsschreiben</h1>';
    html += '<div class="meta">' + escapeHtml(app.name) + ' — Bewerbung als ' + escapeHtml(app.jobTitle) + ' bei ' + escapeHtml(app.jobCompany) + '</div>';
    if (app.motivation) {
      html += '<div class="content">' + escapeHtml(app.motivation) + '</div>';
    } else if (app.motivationFileName) {
      html += '<div class="content" style="text-align:center;padding:3rem;color:#666"><p style="font-size:3rem;margin-bottom:1rem">📎</p><p>Hochgeladene Datei: <strong>' + escapeHtml(app.motivationFileName) + '</strong></p><p style="font-size:0.85rem;color:#999">Die Datei wurde vom Bewerber als Upload eingereicht</p></div>';
    } else {
      html += '<div class="content" style="color:#999;text-align:center;padding:3rem">Kein Motivationsschreiben eingereicht</div>';
    }
    html += '</div>';
  } else {
    html += '<div class="doc">';
    html += '<h1>Lebenslauf</h1>';
    html += '<div class="meta">' + escapeHtml(app.name) + '</div>';
    html += '<div class="section-title">Persönliche Daten</div>';
    html += '<div class="info-row"><span class="info-label">Name:</span><span>' + escapeHtml(app.name) + '</span></div>';
    if (app.email) html += '<div class="info-row"><span class="info-label">E-Mail:</span><span>' + escapeHtml(app.email) + '</span></div>';
    if (app.city) html += '<div class="info-row"><span class="info-label">Ort:</span><span>' + escapeHtml(app.city) + '</span></div>';
    if (app.weeklyHours) html += '<div class="info-row"><span class="info-label">Verfügbar:</span><span>' + escapeHtml(String(app.weeklyHours)) + ' Std/Woche</span></div>';

    if (app.skills && app.skills.length > 0) {
      html += '<div class="section-title">Kenntnisse & Fähigkeiten</div>';
      html += '<div class="skills-list">' + app.skills.map(function(s){return '<span class="skill-tag">' + escapeHtml(s) + '</span>';}).join('') + '</div>';
    }
    if (app.refs && app.refs.length > 0) {
      html += '<div class="section-title">Erfahrungen</div>';
      app.refs.forEach(function(r) { html += '<div class="info-row">' + (typeof r === 'string' ? escapeHtml(r) : escapeHtml(r.company) + ' (' + escapeHtml(r.duration) + ')') + '</div>'; });
    }
    if (app.about) {
      html += '<div class="section-title">Über mich</div>';
      html += '<div class="content">' + escapeHtml(app.about) + '</div>';
    }
    if (app.cvFileName) {
      html += '<div class="section-title">Zusätzliche Datei</div>';
      html += '<div class="info-row">📎 ' + escapeHtml(app.cvFileName) + ' (vom Bewerber hochgeladen)</div>';
    }
    html += '</div>';
  }

  html += '</body></html>';
  win.document.write(html);
  win.document.close();
}

// Returns all applications known to the current user (from the
// Supabase-backed cache). For a worker this is their own applications;
// for an employer it's every applicant on any of their jobs.
function getAllApplications() {
  return state._appsCache || [];
}

// For employers: the applicants on the jobs this employer owns. Since
// the cache is already scoped server-side (RLS + getApplicationsForEmployer),
// we can just return it as-is.
function getEmployerApplicants() {
  if (!state.user) return [];
  return state._appsCache || [];
}

// ===== PROFIL SPEICHERN =====

async function saveEmployerProfile(btn) {
  if (!state.user || !window.DB) return;
  const page = btn.closest('.dashboard-content');
  const inputs = page ? page.querySelectorAll('input[type=text],input[type=number],input[type=tel],input[type=url],input[type=email],textarea,select') : [];
  // Whitelist der DB-Spalten der profiles-Tabelle (siehe
  // supabase-schema.sql). Nur diese Felder werden persistiert —
  // alles andere landet nur in state.user fuer die Session.
  const dbFields = new Set([
    'name', 'company', 'about', 'phone', 'address', 'logo',
    'industry', 'description', 'website', 'founded', 'employees'
  ]);
  const dbPatch = {};
  inputs.forEach(inp => {
    if (!inp.name) return;
    let val = inp.value;
    // `founded` ist INT in der DB — leer-String faengt Postgres nicht
    // ab, also null oder Zahl setzen.
    if (inp.name === 'founded') {
      val = val === '' ? null : parseInt(val, 10);
      if (Number.isNaN(val)) val = null;
    }
    state.user[inp.name] = val;
    if (dbFields.has(inp.name)) dbPatch[inp.name] = val;
  });
  try {
    if (Object.keys(dbPatch).length) {
      await DB.updateProfile(state.user.id, dbPatch);
    }
    showToast('Profil gespeichert!');
  } catch (e) {
    console.error('[saveEmployerProfile]', e);
    showToast('Konnte Profil nicht speichern: ' + (e.message || ''), 'error');
  }
  render();
}

// ===== STELLENANZEIGE VERÖFFENTLICHEN =====
async function publishJob() {
  if (!state.user) { showToast('Bitte erst einloggen.', 'error'); return; }
  if (!window.DB) { showToast('Backend nicht geladen.', 'error'); return; }
  // Read from state.newJob (persisted by validateWizardStep) instead
  // of querying the DOM, because by the time publishJob runs on Step 4
  // the Step-0 input elements are gone.
  const nj = state.newJob || {};
  const draft = {
    title: nj.title || 'Neue Stelle',
    company: state.user.company || state.user.name || 'Unternehmen',
    companyLogo: state.user.companyLogo || null,
    location: nj.location || 'Berlin',
    // Stadt: bevorzugt das explizite Feld, fallback auf split auf Komma
    city: nj.city || (nj.location || 'Berlin').split(',').pop().replace(/^\d{5}\s*/, '').trim(),
    salary: nj.salary || 'Nach Vereinbarung',
    hours: nj.hours || 'Flexible',
    category: nj.category || 'Sonstiges',
    type: nj.type || 'Minijob',
    description: nj.description || '',
    tags: [],
    images: (state.selectedJobImages || []).map(i => (state.user.companyImages || [])[i]).filter(Boolean),
    promoted: false
  };
  try {
    const inserted = await DB.createJob(frontendJobToDb(draft, state.user.id));
    JOBS.unshift(dbJobToFrontend(inserted));
    state.wizardStep = 0;
    state.selectedJobImages = [];
    showToast('Stellenanzeige veröffentlicht!');
    navigate('employer-dashboard');
  } catch (e) {
    console.error('[publishJob]', e);
    showToast('Veröffentlichen fehlgeschlagen: ' + (e.message || 'Unbekannter Fehler'), 'error');
  }
}

// ===== KI GENERIEREN =====
function aiGenerateJob(btn) {
  btn.textContent = 'Wird generiert…';
  btn.disabled = true;
  const examples = [
    { tasks: 'Kundenberatung und Kassentätigkeit\nWareneinräumen und Regalpflege\nSauberhalten des Verkaufsbereichs', req: 'Freundliches Auftreten\nZuverlässigkeit und Pünktlichkeit', benefits: 'Flexible Arbeitszeiten\nFahrgeld\nMitarbeiterrabatte' },
    { tasks: 'Unterstützung des Teams im Tagesgeschäft\nBearbeitung von Kundenanfragen\nAllgemeine Bürotätigkeiten', req: 'Gute Kommunikationsfähigkeit\nMS-Office Grundkenntnisse', benefits: 'Moderne Arbeitsumgebung\nJobticket\nSocial Events' },
  ];
  const ex = examples[Math.floor(Math.random() * examples.length)];
  setTimeout(() => {
    const textareas = document.querySelectorAll('.wizard-content textarea');
    if (textareas[0]) textareas[0].value = ex.tasks;
    if (textareas[1]) textareas[1].value = ex.req;
    if (textareas[2]) textareas[2].value = ex.benefits;
    btn.textContent = '✓ Generiert';
    btn.disabled = false;
    showToast('KI hat die Stellenanzeige vorgeneriert!');
  }, 1200);
}

// ===== BEWERTUNG ABSENDEN =====
async function submitReview(btn) {
  if (!state.user || !window.DB) { showToast('Bitte erst einloggen.', 'error'); return; }
  const card = btn.closest('.card-body');
  const stars = card.querySelectorAll('.star.filled').length;
  const text = card.querySelector('textarea')?.value?.trim();
  const completedJobs = getCompletedJobs();
  const activeJob = getActiveJob();
  if (!completedJobs.length && !activeJob) { showToast('Du musst zuerst einen Job abschließen, bevor du bewerten kannst.', 'error'); return; }
  if (!stars) { showToast('Bitte wähle eine Bewertung (1-5 Sterne).', 'error'); return; }
  if (!text) { showToast('Bitte schreibe einen kurzen Text.', 'error'); return; }

  // Determine reviewed employer: prefer the most recent COMPLETED job.
  // Aktive Jobs sollten nicht bewertet werden (Retourkutschen-Risiko);
  // die DB-Policy aus supabase-hardening-v2.sql laesst INSERT nur
  // wenn die Bewerbung status='accepted' ODER 'withdrawn' hat.
  const referenceJob = completedJobs[completedJobs.length - 1] || activeJob;
  const reviewedEmployerId = referenceJob && referenceJob.employerId;
  if (!reviewedEmployerId) {
    showToast('Konnte den Arbeitgeber der Bewertung nicht ermitteln.', 'error');
    return;
  }
  // Self-Review verhindern (clientseitig; DB-Constraint
  // reviews_no_self faengt es zusaetzlich ab, falls hier umgangen).
  if (reviewedEmployerId === state.user.id) {
    showToast('Du kannst dich nicht selbst bewerten.', 'error');
    return;
  }
  // Dedup clientseitig: hat dieser Worker diesen Employer fuer diesen
  // Job schon bewertet? Der DB-Unique-Index verhindert es auch
  // serverseitig, aber hier kriegt der User eine freundliche Meldung
  // statt eines Postgres-23505-Errors.
  try {
    if (DB.sb && referenceJob.jobId) {
      const existing = await DB.sb.from('reviews')
        .select('id')
        .eq('reviewer_id', state.user.id)
        .eq('reviewed_id', reviewedEmployerId)
        .eq('job_id', referenceJob.jobId)
        .limit(1);
      if (!existing.error && existing.data && existing.data.length > 0) {
        showToast('Du hast diesen Arbeitgeber für diesen Job bereits bewertet.', 'info');
        return;
      }
    }
  } catch (_) { /* Check ist optional, falls er failt gehen wir weiter und lassen die DB entscheiden. */ }
  try {
    await DB.createReview({
      reviewerId: state.user.id,
      reviewedId: reviewedEmployerId,
      jobId: referenceJob.jobId || null,
      rating: stars,
      text: text
    });
    showToast('Bewertung abgegeben! Danke für dein Feedback.');
  } catch (e) {
    console.error('[submitReview]', e);
    // Unique-Violation freundlich formulieren
    const msg = (e && e.message) || '';
    if (/duplicate|23505|unique/i.test(msg)) {
      showToast('Du hast diesen Arbeitgeber für diesen Job bereits bewertet.', 'info');
    } else {
      showToast('Bewertung konnte nicht gespeichert werden: ' + msg, 'error');
    }
    return;
  }
  card.querySelector('textarea').value = '';
  card.querySelectorAll('.star').forEach(s => s.classList.remove('filled'));
}

// ===== SKILLS MAX 3 =====
function limitSkills(cb, max) {
  const all = [...document.querySelectorAll('.checkbox-group input[type=checkbox]')];
  const checked = all.filter(c => c.checked);
  if (checked.length > max) {
    cb.checked = false;
    showToast(`Maximal ${max} Skills wählbar.`, 'error');
  }
}

// ===== LEBENSLAUF ZUM PROFIL HINZUFÜGEN =====
async function addCVToProfile() {
  if (!state.user) { navigate('login'); return; }
  if (!window.DB) { showToast('Backend nicht geladen.', 'error'); return; }
  const cvData = getCVData();
  state.user.cvData = cvData;
  state.user.cvUploaded = true;
  state.user.cvFileName = 'Lebenslauf (Builder)';
  try {
    await DB.updateProfile(state.user.id, {
      cv_data: cvData,
      cv_uploaded: true,
      cv_file_name: 'Lebenslauf (Builder)'
    });
    showToast('Lebenslauf wurde deinem Profil hinzugefügt!');
  } catch (e) {
    console.error('[addCVToProfile]', e);
    showToast('Lebenslauf konnte nicht gespeichert werden.', 'error');
  }
}

function getCVData() {
  return {
    photo: state.cvPhoto || '',
    vorname: document.getElementById('cv-vorname')?.value || '',
    nachname: document.getElementById('cv-nachname')?.value || '',
    email: document.getElementById('cv-email')?.value || '',
    telefon: document.getElementById('cv-telefon')?.value || '',
    adresse: document.getElementById('cv-adresse')?.value || '',
    geburtsdatum: document.getElementById('cv-geburtsdatum')?.value || '',
    schule: document.getElementById('cv-schule')?.value || '',
    schulZeitraum: document.getElementById('cv-schul-zeitraum')?.value || '',
    erfahrungen: document.getElementById('cv-erfahrungen')?.value || '',
    skills: [...document.querySelectorAll('#cv-skills input:checked')].map(cb => cb.parentElement.textContent.trim()),
    hobbys: document.getElementById('cv-hobbys')?.value || ''
  };
}

// Shared upload guard. Rejects anything that isn't a real image, anything
// over MAX_IMAGE_BYTES, and (belt & braces) anything whose data: URL
// doesn't start with image/ — that last check stops a FileReader result
// from being injected into a CSS url() context with an arbitrary scheme.
const MAX_IMAGE_BYTES = 3 * 1024 * 1024;  // 3 MB — base64 roughly 4 MB in DB
const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];

function validateImageFile(file) {
  if (!file) return 'Keine Datei ausgewählt.';
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return 'Nur PNG, JPG, WEBP oder GIF erlaubt.';
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return 'Bild ist zu groß (max. 3 MB).';
  }
  return null;
}

function readImageFileAsDataURL(file, cb) {
  const err = validateImageFile(file);
  if (err) { showToast(err, 'error'); return; }
  const reader = new FileReader();
  reader.onload = function(e) {
    const result = e.target.result;
    // Second fence: result must be a data:image/... URL. FileReader
    // always produces this for readAsDataURL, but verifying it means
    // callers can safely embed `result` in CSS url() contexts.
    if (typeof result !== 'string' || !/^data:image\//.test(result)) {
      showToast('Bild konnte nicht verarbeitet werden.', 'error');
      return;
    }
    cb(result);
  };
  reader.onerror = function() {
    showToast('Bild konnte nicht gelesen werden.', 'error');
  };
  reader.readAsDataURL(file);
}

// Set a preview element's background image safely. We assign the CSS
// properties one at a time rather than via a template literal so a
// malformed data URL can't break out of url(...) into adjacent
// properties.
function setPreviewBackground(preview, dataUrl) {
  if (!preview) return;
  // Nur sichere Schemes erlauben (data:image/, https://, http://).
  // Verhindert dass manipulierter state.cvPhoto (z.B. javascript:)
  // ins CSS injiziert wird wo er als url() ausgewertet werden koennte.
  const url = String(dataUrl || '');
  const safe = /^(data:image\/(png|jpeg|jpg|gif|webp|svg\+xml);|https?:\/\/)/i.test(url);
  if (!safe) {
    console.warn('[setPreviewBackground] unsafe URL blocked:', url.slice(0, 40));
    return;
  }
  preview.style.backgroundImage = 'url("' + url.replace(/"/g, '%22') + '")';
  preview.style.backgroundSize = 'cover';
  preview.style.backgroundPosition = 'center';
  preview.innerHTML = '';
}

// Versucht Storage-Upload, fällt bei Fehler auf base64 zurück. Liefert
// in beiden Fällen eine Browser-anzeigbare URL (entweder data: oder https:).
async function uploadImageWithFallback(file) {
  if (window.IMAGE_BUCKET && window.DB && DB.uploadImage) {
    try {
      const { url } = await DB.uploadImage(file);
      if (url) return url;
    } catch (e) { console.error('[uploadImage] storage failed, falling back to base64', e); }
  }
  // Base64-Fallback (alte Logik)
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function handleCVPhoto(input) {
  if (!input.files || !input.files[0]) return;
  try {
    const url = await uploadImageWithFallback(input.files[0]);
    state.cvPhoto = url;
    setPreviewBackground(document.getElementById('cv-photo-preview'), url);
  } catch (e) { console.error('[handleCVPhoto]', e); showToast('Foto konnte nicht geladen werden.', 'error'); }
}

async function handleCompanyLogo(input) {
  if (!input.files || !input.files[0]) return;
  try {
    const url = await uploadImageWithFallback(input.files[0]);
    state.user.companyLogo = url;
    setPreviewBackground(document.getElementById('company-logo-preview'), url);
    if (window.DB && DB.updateProfile) {
      try { await DB.updateProfile(state.user.id, { company_logo: url }); }
      catch (err) { console.error('[handleCompanyLogo] persist', err); }
    }
    showToast('Logo hochgeladen!');
  } catch (e) { console.error('[handleCompanyLogo]', e); showToast('Logo-Upload fehlgeschlagen.', 'error'); }
}

async function handleCompanyImage(input) {
  if (!input.files || !input.files[0]) return;
  if (!state.user.companyImages) state.user.companyImages = [];
  if (state.user.companyImages.length >= 6) { showToast('Maximal 6 Bilder erlaubt.', 'error'); return; }
  try {
    const url = await uploadImageWithFallback(input.files[0]);
    state.user.companyImages.push(url);
    if (window.DB && DB.updateProfile) {
      try { await DB.updateProfile(state.user.id, { company_images: state.user.companyImages }); }
      catch (err) { console.error('[handleCompanyImage] persist', err); }
    }
    showToast('Bild hochgeladen!');
    render();
  } catch (e) { console.error('[handleCompanyImage]', e); showToast('Bild-Upload fehlgeschlagen.', 'error'); }
}

function removeCompanyImage(index) {
  if (!state.user.companyImages) return;
  state.user.companyImages.splice(index, 1);
  render();
}

function toggleJobImage(index) {
  if (!state.selectedJobImages) state.selectedJobImages = [];
  const idx = state.selectedJobImages.indexOf(index);
  if (idx > -1) state.selectedJobImages.splice(idx, 1);
  else state.selectedJobImages.push(index);
  render();
}

function getSelectedTemplate() {
  const sel = document.querySelector('.cv-template.selected');
  return sel ? sel.dataset.template : 'modern';
}

function buildCVHTML(data, template) {
  // Escape ALL user-controlled fields up front — this HTML is written
  // into a fresh window via document.write, so unescaped content would
  // be a cross-user XSS (e.g. a malicious applicant injecting <script>
  // into their CV which then runs in the employer's browser).
  // data.photo is a data: URL so no escape needed (used in src= which
  // won't interpret tags anyway).
  data = {
    photo:        data.photo || '',
    vorname:      escapeHtml(data.vorname || ''),
    nachname:     escapeHtml(data.nachname || ''),
    email:        escapeHtml(data.email || ''),
    telefon:      escapeHtml(data.telefon || ''),
    adresse:      escapeHtml(data.adresse || ''),
    geburtsdatum: escapeHtml(data.geburtsdatum || ''),
    schule:       escapeHtml(data.schule || ''),
    schulZeitraum: escapeHtml(data.schulZeitraum || ''),
    erfahrungen:  escapeHtml(data.erfahrungen || ''),
    hobbys:       escapeHtml(data.hobbys || ''),
    skills:       (data.skills || []).map(escapeHtml)
  };
  const name = `${data.vorname} ${data.nachname}`.trim();
  const kontakt = [data.adresse, data.telefon, data.email, data.geburtsdatum ? 'Geb. ' + data.geburtsdatum : ''].filter(Boolean);
  const hasSchule = data.schule || data.schulZeitraum;
  const hasErf = data.erfahrungen;
  const hasSkills = data.skills.length > 0;
  const hasHobbys = data.hobbys;

  if (template === 'modern') {
    // MODERN: Dunkelblaue Sidebar + weißer Inhalt (passend zur Preview)
    const photoHTML = data.photo ? `<img src="${data.photo}" alt="Profilbild ${escapeHtml(data.name || '')}" style="width:110px;height:110px;border-radius:50%;object-fit:cover;border:3px solid rgba(255,255,255,0.3)">` : '';
    const skillBars = data.skills.map(s => `<div style="margin-bottom:0.5rem"><div style="font-size:0.85rem;margin-bottom:0.2rem">${s}</div><div style="height:5px;background:rgba(255,255,255,0.15);border-radius:3px"><div style="height:100%;width:${60+Math.random()*35}%;background:rgba(255,255,255,0.6);border-radius:3px"></div></div></div>`).join('');
    return `<div style="font-family:Inter,Helvetica,Arial,sans-serif;max-width:750px;margin:0 auto;display:flex;min-height:1000px;box-shadow:0 2px 20px rgba(0,0,0,0.08)">
      <div style="width:240px;background:#1e3a5f;color:#fff;padding:2rem 1.5rem;display:flex;flex-direction:column;gap:1.25rem">
        ${data.photo ? '<div style="text-align:center">' + photoHTML + '</div>' : ''}
        ${name ? '<div style="text-align:center"><h2 style="margin:0;font-size:1.15rem;font-weight:700">' + name + '</h2></div>' : ''}
        ${kontakt.length ? '<div><h4 style="font-size:0.7rem;text-transform:uppercase;letter-spacing:0.1em;opacity:0.5;margin-bottom:0.5rem">Kontakt</h4>' + kontakt.map(k => '<div style="font-size:0.82rem;margin-bottom:0.3rem;opacity:0.85">' + k + '</div>').join('') + '</div>' : ''}
        ${hasSkills ? '<div><h4 style="font-size:0.7rem;text-transform:uppercase;letter-spacing:0.1em;opacity:0.5;margin-bottom:0.5rem">Kenntnisse</h4>' + skillBars + '</div>' : ''}
        ${hasHobbys ? '<div><h4 style="font-size:0.7rem;text-transform:uppercase;letter-spacing:0.1em;opacity:0.5;margin-bottom:0.5rem">Interessen</h4><div style="font-size:0.85rem;opacity:0.85;white-space:pre-line">' + data.hobbys + '</div></div>' : ''}
      </div>
      <div style="flex:1;padding:2rem 2.5rem;background:#fff">
        ${name ? '<h1 style="margin:0 0 0.2rem;font-size:1.7rem;color:#1e3a5f;font-weight:800">' + name + '</h1><div style="height:3px;width:50px;background:#1e3a5f;margin-bottom:1.75rem"></div>' : ''}
        ${hasSchule ? '<div style="margin-bottom:1.5rem"><h3 style="font-size:0.8rem;text-transform:uppercase;letter-spacing:0.1em;color:#1e3a5f;margin-bottom:0.6rem;font-weight:700">Ausbildung</h3><div style="padding-left:1rem;border-left:2px solid #e2e8f0"><div style="font-weight:600;font-size:0.95rem;color:#1f2937">' + data.schule + '</div>' + (data.schulZeitraum ? '<div style="font-size:0.82rem;color:#64748b;margin-top:0.15rem">' + data.schulZeitraum + '</div>' : '') + '</div></div>' : ''}
        ${hasErf ? '<div style="margin-bottom:1.5rem"><h3 style="font-size:0.8rem;text-transform:uppercase;letter-spacing:0.1em;color:#1e3a5f;margin-bottom:0.6rem;font-weight:700">Berufserfahrung</h3><div style="padding-left:1rem;border-left:2px solid #e2e8f0;font-size:0.9rem;color:#374151;white-space:pre-line">' + data.erfahrungen + '</div></div>' : ''}
      </div>
    </div>`;
  } else if (template === 'classic') {
    // KLASSISCH: Serifen, traditionell, doppelte Linie (passend zur Preview)
    const photoClassic = data.photo ? `<img src="${data.photo}" alt="Profilbild ${escapeHtml(data.name || '')}" style="width:100px;height:100px;border-radius:4px;object-fit:cover">` : '';
    return `<div style="font-family:Georgia,'Times New Roman',serif;max-width:750px;margin:0 auto;background:#fff;padding:2.5rem;box-shadow:0 2px 20px rgba(0,0,0,0.08);min-height:1000px">
      <div style="display:flex;align-items:flex-start;gap:1.5rem;padding-bottom:1rem;border-bottom:2px double #111;margin-bottom:1.5rem">
        ${photoClassic}
        <div style="flex:1">
          ${name ? '<h1 style="margin:0;font-size:1.8rem;color:#111;font-weight:400;letter-spacing:0.03em">' + name.toUpperCase() + '</h1>' : ''}
          ${kontakt.length ? '<div style="display:flex;flex-wrap:wrap;gap:0.5rem 1.5rem;margin-top:0.4rem;font-size:0.85rem;color:#555">' + kontakt.map(k => '<span>' + k + '</span>').join('') + '</div>' : ''}
        </div>
      </div>
      ${hasSchule ? '<div style="margin-bottom:1.25rem"><h3 style="font-size:0.9rem;text-transform:uppercase;letter-spacing:0.12em;color:#111;border-bottom:1px solid #ccc;padding-bottom:0.25rem;margin-bottom:0.6rem">Ausbildung</h3><div style="display:flex;gap:1.5rem"><div style="width:120px;font-size:0.82rem;color:#888;flex-shrink:0">' + (data.schulZeitraum || '') + '</div><div style="font-size:0.9rem;color:#333"><strong>' + data.schule + '</strong></div></div></div>' : ''}
      ${hasErf ? '<div style="margin-bottom:1.25rem"><h3 style="font-size:0.9rem;text-transform:uppercase;letter-spacing:0.12em;color:#111;border-bottom:1px solid #ccc;padding-bottom:0.25rem;margin-bottom:0.6rem">Berufserfahrung</h3><div style="font-size:0.9rem;color:#333;white-space:pre-line">' + data.erfahrungen + '</div></div>' : ''}
      ${hasSkills ? '<div style="margin-bottom:1.25rem"><h3 style="font-size:0.9rem;text-transform:uppercase;letter-spacing:0.12em;color:#111;border-bottom:1px solid #ccc;padding-bottom:0.25rem;margin-bottom:0.6rem">Kenntnisse & Fähigkeiten</h3><div style="font-size:0.9rem;color:#333">' + data.skills.join(' · ') + '</div></div>' : ''}
      ${hasHobbys ? '<div><h3 style="font-size:0.9rem;text-transform:uppercase;letter-spacing:0.12em;color:#111;border-bottom:1px solid #ccc;padding-bottom:0.25rem;margin-bottom:0.6rem">Hobbys & Interessen</h3><div style="font-size:0.9rem;color:#333;white-space:pre-line">' + data.hobbys + '</div></div>' : ''}
    </div>`;
  } else {
    // KREATIV: Blauer Gradient Header + rechte Sidebar (passend zur Preview)
    const photoCreative = data.photo ? `<img src="${data.photo}" alt="Profilbild ${escapeHtml(data.name || '')}" style="width:110px;height:110px;border-radius:50%;object-fit:cover;border:4px solid rgba(255,255,255,0.4)">` : '';
    const skillPills = data.skills.map(s => `<span style="display:inline-block;padding:0.25rem 0.7rem;background:#eff6ff;color:#1e40af;border-radius:100px;font-size:0.8rem;font-weight:600;margin:0.15rem">${s}</span>`).join('');
    return `<div style="font-family:Inter,Helvetica,Arial,sans-serif;max-width:750px;margin:0 auto;background:#fff;box-shadow:0 2px 20px rgba(0,0,0,0.08);min-height:1000px">
      <div style="background:linear-gradient(135deg,#3b82f6,#93c5fd);padding:2rem 2.5rem;display:flex;align-items:center;gap:1.5rem;color:#fff">
        ${photoCreative}
        <div style="flex:1">
          ${name ? '<h1 style="margin:0;font-size:1.6rem;font-weight:800">' + name + '</h1>' : ''}
          ${kontakt.length ? '<div style="display:flex;flex-wrap:wrap;gap:0.5rem 1.25rem;margin-top:0.4rem;font-size:0.82rem;opacity:0.9">' + kontakt.map(k => '<span>' + k + '</span>').join('') + '</div>' : ''}
        </div>
      </div>
      <div style="display:flex">
        <div style="flex:1;padding:2rem 2.5rem">
          ${hasSchule ? '<div style="margin-bottom:1.75rem"><h3 style="font-size:0.78rem;text-transform:uppercase;letter-spacing:0.1em;color:#2563eb;margin-bottom:0.6rem;font-weight:700;display:flex;align-items:center;gap:0.5rem"><span style="width:20px;height:2px;background:#2563eb;display:inline-block"></span>Ausbildung</h3><div style="font-weight:600;font-size:0.95rem;color:#1f2937">' + data.schule + '</div>' + (data.schulZeitraum ? '<div style="font-size:0.82rem;color:#64748b;margin-top:0.15rem">' + data.schulZeitraum + '</div>' : '') + '</div>' : ''}
          ${hasErf ? '<div style="margin-bottom:1.75rem"><h3 style="font-size:0.78rem;text-transform:uppercase;letter-spacing:0.1em;color:#2563eb;margin-bottom:0.6rem;font-weight:700;display:flex;align-items:center;gap:0.5rem"><span style="width:20px;height:2px;background:#2563eb;display:inline-block"></span>Berufserfahrung</h3><div style="font-size:0.9rem;color:#374151;white-space:pre-line">' + data.erfahrungen + '</div></div>' : ''}
        </div>
        <div style="width:220px;padding:2rem 1.5rem;background:#f8fafc;border-left:1px solid #e2e8f0">
          ${hasSkills ? '<div style="margin-bottom:1.5rem"><h4 style="font-size:0.7rem;text-transform:uppercase;letter-spacing:0.1em;color:#2563eb;margin-bottom:0.5rem;font-weight:700">Kenntnisse</h4><div style="display:flex;flex-wrap:wrap;gap:0.3rem">' + skillPills + '</div></div>' : ''}
          ${hasHobbys ? '<div><h4 style="font-size:0.7rem;text-transform:uppercase;letter-spacing:0.1em;color:#2563eb;margin-bottom:0.5rem;font-weight:700">Interessen</h4><div style="font-size:0.85rem;color:#475569;white-space:pre-line">' + data.hobbys + '</div></div>' : ''}
        </div>
      </div>
    </div>`;
  }
}

function previewCV() {
  const data = getCVData();
  const template = getSelectedTemplate();
  const html = buildCVHTML(data, template);
  const win = window.open('', '_blank');
  if (!win) { showToast('Popup wurde blockiert. Bitte erlaube Popups für diese Seite.', 'error'); return; }
  win.document.write(`<!DOCTYPE html><html><head><title>Lebenslauf - ${escapeHtml(data.vorname)} ${escapeHtml(data.nachname)}</title><link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet"><style>body{margin:0;padding:2rem;background:#f3f4f6;}</style></head><body>${html}</body></html>`);
  win.document.close();
}

function downloadCV() {
  const data = getCVData();
  const template = getSelectedTemplate();
  const html = buildCVHTML(data, template);
  const fullHTML = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Lebenslauf - ${escapeHtml(data.vorname || '')} ${escapeHtml(data.nachname || '')}</title><link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet"><style>body{margin:0;padding:2rem;background:#fff;}@media print{body{padding:0;}}</style></head><body>${html}</body></html>`;
  const blob = new Blob([fullHTML], { type: 'text/html' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `lebenslauf-${(data.vorname||'mein').toLowerCase()}-${(data.nachname||'cv').toLowerCase()}.html`;
  a.click();
  showToast('Lebenslauf wird heruntergeladen! Öffne die Datei im Browser und drücke Strg+P zum Drucken als PDF.');
}

// ===== DOKUMENT GESCANNT =====
async function docScanned(input) {
  if (!input.files.length || !state.user || !window.DB) return;
  state.user.docsUploaded = true;
  try {
    await DB.updateProfile(state.user.id, { docs_uploaded: true });
    showToast('Dokument erfolgreich hochgeladen!');
  } catch (e) {
    console.error('[docScanned]', e);
    showToast('Upload konnte nicht gespeichert werden.', 'error');
  }
  render();
}

// ===== SAVE JOB =====
async function toggleSaveJob(jobId, e) {
  if (e) e.stopPropagation();
  if (!state.user) { navigate('register'); return; }
  if (!window.DB) return;
  // Optimistic UI: update the cache first, then write to DB.
  const saved = state._savedJobs || [];
  const idx = saved.indexOf(jobId);
  const wasSaved = idx > -1;
  if (wasSaved) saved.splice(idx, 1); else saved.push(jobId);
  state._savedJobs = saved;
  render();
  try {
    if (wasSaved) await DB.unsaveJob(state.user.id, jobId);
    else await DB.saveJob(state.user.id, jobId);
  } catch (err) {
    console.error('[toggleSaveJob]', err);
    // Revert the optimistic update on failure
    if (wasSaved) saved.push(jobId); else { const i = saved.indexOf(jobId); if (i > -1) saved.splice(i, 1); }
    state._savedJobs = saved;
    showToast('Konnte nicht gespeichert werden.', 'error');
    render();
  }
}

// ===== Job-Sharing =====
// WhatsApp, E-Mail und "Link kopieren" auf der Job-Detailseite. Bei
// Geräten die die native Web-Share-API unterstützen (fast alle Mobiles)
// wird stattdessen der native Share-Dialog geöffnet.
function shareJob(jobId) {
  const job = JOBS.find(j => j.id === jobId);
  if (!job) return;
  const url = `${window.location.origin}${window.location.pathname}#job-${job.id}`;
  const title = `${job.title}${job.company ? ' bei ' + job.company : ''}`;
  const text = `${title}${job.location ? ' in ' + job.location : ''}${job.salary ? ' — ' + job.salary : ''}. Jetzt bewerben auf WorkPilot:`;

  // Native Web-Share-API (Mobile + manche Desktop-Browser)
  if (navigator.share) {
    navigator.share({ title, text, url }).catch(err => {
      // AbortError = User hat abgebrochen → kein Toast
      if (err && err.name !== 'AbortError') console.warn('[shareJob] native', err);
    });
    return;
  }
  // Fallback: eigenes kleines Menü
  showShareMenu(url, text);
}

function showShareMenu(url, text) {
  const existing = document.getElementById('share-menu');
  if (existing) existing.remove();
  const encoded = encodeURIComponent(text + ' ' + url);
  const encodedUrl = encodeURIComponent(url);
  const html = `
    <div id="share-menu" role="dialog" aria-modal="true" aria-label="Job teilen" style="position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9998;display:flex;align-items:center;justify-content:center;padding:1rem" onclick="if(event.target===this)this.remove()">
      <div style="background:#fff;border-radius:12px;padding:1.25rem;max-width:360px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,0.25)">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">
          <strong style="font-size:1.05rem">Job teilen</strong>
          <button class="close-btn" onclick="document.getElementById('share-menu').remove()" aria-label="Schließen">&times;</button>
        </div>
        <div style="display:flex;flex-direction:column;gap:0.5rem">
          <a href="https://wa.me/?text=${encoded}" target="_blank" rel="noopener noreferrer" class="btn btn-block" style="background:#25D366;color:#fff;text-align:center;justify-content:center;display:flex;align-items:center;gap:0.5rem">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1s-.8 1-.9 1.2c-.2.2-.3.2-.6.1-.3-.1-1.2-.4-2.2-1.4-.8-.7-1.4-1.6-1.6-1.9-.2-.3 0-.4.1-.6.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5 0-.2 0-.4-.1-.5-.1-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.7.3-.3.3-1 1-1 2.4s1 2.8 1.1 3c.1.2 2 3.1 5 4.4 2.4 1.1 2.9.9 3.4.8.5-.1 1.7-.7 1.9-1.3.2-.6.2-1.2.2-1.3-.1-.2-.3-.2-.4-.3zM12 2a10 10 0 00-8.7 15l-1 4 4.1-1A10 10 0 1012 2z"/></svg>
            WhatsApp
          </a>
          <a href="mailto:?subject=${encodeURIComponent(text)}&body=${encoded}" class="btn btn-block btn-outline" style="text-align:center;justify-content:center;display:flex;align-items:center;gap:0.5rem">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" focusable="false"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            E-Mail
          </a>
          <a href="https://twitter.com/intent/tweet?text=${encoded}" target="_blank" rel="noopener noreferrer" class="btn btn-block btn-outline" style="text-align:center;justify-content:center;display:flex;align-items:center;gap:0.5rem">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/></svg>
            X / Twitter
          </a>
          <button class="btn btn-block btn-outline" onclick="copyJobLink('${url.replace(/'/g,"\\'")}')" style="display:flex;align-items:center;justify-content:center;gap:0.5rem">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" focusable="false"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
            Link kopieren
          </button>
        </div>
      </div>
    </div>`;
  document.body.insertAdjacentHTML('beforeend', html);
}

async function copyJobLink(url) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(url);
    } else {
      // Legacy fallback
      const ta = document.createElement('textarea');
      ta.value = url; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    showToast('Link kopiert!');
    const menu = document.getElementById('share-menu');
    if (menu) menu.remove();
  } catch (e) {
    console.warn('[copyJobLink]', e);
    showToast('Kopieren fehlgeschlagen.', 'error');
  }
}

// ===== GUARDS =====
function requireEmployerLogin(then) {
  if (!state.user) { navigate('login'); return; }
  if (state.user.role !== 'employer') { navigate('login'); return; }
  if (!state.user.approved) { showToast('Dein Account muss erst vom Admin freigeschaltet werden.', 'error'); return; }
  if (then) then();
}

function isFreemailDomain(email) {
  const freemails = ['gmail.com','googlemail.com','web.de','gmx.de','gmx.net','yahoo.de','yahoo.com','hotmail.com','hotmail.de','outlook.com','outlook.de','t-online.de','freenet.de','arcor.de','aol.com','icloud.com','me.com','mail.de','posteo.de','protonmail.com','proton.me','live.de','live.com','msn.com'];
  const domain = email.split('@')[1]?.toLowerCase();
  return freemails.includes(domain);
}

async function deletePostedJob(jobId) {
  if (!window.DB) { showToast('Backend nicht geladen.', 'error'); return; }
  if (!confirm('Diese Stellenanzeige wirklich löschen?')) return;
  try {
    await DB.deleteJob(jobId);
    await loadJobsFromDB();
    showToast('Stellenanzeige gelöscht.');
    render();
  } catch (e) {
    console.error('[deletePostedJob]', e);
    showToast('Konnte Anzeige nicht löschen: ' + (e.message || ''), 'error');
  }
}

function goPostJob() {
  requireEmployerLogin(() => navigate('post-job'));
}

// ===== CHAT =====
function toggleChat() {
  if (!state.user) { navigate('login'); return; }
  if (state.user.role === 'employer') return; // Arbeitgeber kommen nicht auf Worker-Nachrichten
  navigate('messages');
}

// Legacy helpers kept as thin wrappers. The real chat data now comes
// from Supabase via loadChatsForUser() and is pushed into the existing
// WORKER_CHAT_MESSAGES / EMPLOYER_CHAT_MESSAGES arrays so the existing
// renderers don't have to change.
function chatKey() { return state.user ? 'jj_chats_' + state.user.id : null; }
function loadUserChats() {
  // Kick off an async reload but don't await — callers expect this
  // to be synchronous. Results land when render() is called again.
  if (window.DB) { loadChatsForUser(); }
}
function saveUserChats() { /* no-op: chats are persisted server-side */ }
function getChatList() {
  if (!state.user) return [];
  return state.user.role === 'employer' ? EMPLOYER_CHAT_MESSAGES : WORKER_CHAT_MESSAGES;
}

function findChat(id) {
  return [...WORKER_CHAT_MESSAGES, ...EMPLOYER_CHAT_MESSAGES].find(c => c.id === id);
}

function renderChatWidget() {
  const content = document.getElementById('chat-content');
  if (!content) return;
  const chatList = getChatList();
  if (!state.activeChat) {
    content.innerHTML = `
      <div class="chat-list">
        ${chatList.map(c => `
          <div class="chat-list-item" onclick="openChat(${c.id})">
            <div class="user-avatar" style="width:36px;height:36px;font-size:0.75rem">${c.partnerInitials}</div>
            <div style="flex:1;min-width:0">
              <div style="font-weight:600;font-size:0.85rem">${escapeHtml(c.partnerName)}</div>
              <div style="font-size:0.75rem;color:var(--gray-500);margin-bottom:0.1rem">${escapeHtml(c.jobTitle)}</div>
              <div style="font-size:0.8rem;color:var(--gray-500);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escapeHtml(c.lastMessage)}</div>
            </div>
            <div style="text-align:right">
              <div style="font-size:0.7rem;color:var(--gray-500)">${c.time}</div>
              ${c.unread ? '<div class="unread" style="margin-left:auto;margin-top:4px"></div>' : ''}
            </div>
          </div>
        `).join('')}
        ${chatList.length === 0 ? '<div style="padding:1.5rem;text-align:center;color:var(--gray-500);font-size:0.85rem">Noch keine Nachrichten</div>' : ''}
      </div>`;
  } else {
    const chat = findChat(state.activeChat);
    if (!chat) { state.activeChat = null; return renderChatWidget(); }
    content.innerHTML = `
      <div style="padding:0.5rem;border-bottom:1px solid var(--gray-200);display:flex;align-items:center;gap:0.5rem">
        <button onclick="state.activeChat=null;renderChatWidget()" style="background:none;border:none;cursor:pointer;font-size:1.1rem">&#8592;</button>
        <strong style="font-size:0.85rem">${escapeHtml(chat.partnerName)}</strong>
      </div>
      <div class="chat-messages" style="flex:1;overflow-y:auto;padding:0.75rem">
        ${chat.messages.map(m => `
          <div class="chat-msg ${m.sent ? 'sent' : 'received'}">
            ${escapeHtml(m.text)}
            <div class="msg-time">${m.time}</div>
          </div>
        `).join('')}
      </div>
      <div class="chat-input-area">
        <label for="chat-input" class="sr-only">Nachricht schreiben</label>
        <input type="text" placeholder="Nachricht..." id="chat-input" onkeydown="if(event.key==='Enter')sendChatMessage()" aria-label="Nachricht schreiben">
        <button onclick="sendChatMessage()">→</button>
      </div>`;
  }
}

async function openChat(id) {
  state.activeChat = id;
  // If this chat is backed by Supabase, load its messages + subscribe
  if (window.DB && state.user) {
    await openChatById(id);
  }
  renderChatWidget();
}

async function updateApplicantStatus(applicantId, newStatus) {
  // Check the real cache first, fall back to the mock fixtures
  const realApps = getAllApplications();
  let a = realApps.find(x => x.id === applicantId);
  const isReal = !!a;
  if (!a) a = MOCK_APPLICANTS.find(x => x.id === applicantId);
  if (!a) return;

  const statusTexts = { new: 'Neu', reviewing: 'In Prüfung', accepted: 'Eingeladen', rejected: 'Abgelehnt' };
  const jobTitle = a.jobTitle || a.job;

  // Richtungs-Validierung: endgueltige Entscheidungen (accepted/rejected)
  // nicht rueckwaerts abwickeln, sonst verwirrt das Worker und die
  // Invariants (activeJob, completedJobs) kippen.
  const oldStatus = a.status;
  const TERMINAL = new Set(['accepted', 'rejected']);
  if (TERMINAL.has(oldStatus) && newStatus !== oldStatus) {
    if (!confirm('Dieser Status wurde bereits endgueltig entschieden ('
      + (statusTexts[oldStatus] || oldStatus)
      + '). Wirklich auf "'
      + (statusTexts[newStatus] || newStatus)
      + '" zuruecksetzen?')) {
      render();  // select-Element zurueck auf alten Wert
      return;
    }
  }

  if (isReal && window.DB) {
    try {
      await DB.updateApplicationStatus(applicantId, newStatus);
      await loadApplicationsForUser();
    } catch (e) {
      console.error('[updateApplicantStatus]', e);
      showToast('Status konnte nicht aktualisiert werden: ' + (e.message || ''), 'error');
      return;
    }
  } else {
    // Mock-only code path: mutate in place so the dashboard updates
    a.status = newStatus;
    a.statusText = statusTexts[newStatus];
  }

  // On accept or reject, send an automated chat message to the worker
  // via the real DB so they see the decision in their inbox across
  // browsers. For mock applicants (fake seed data), fall back to the
  // legacy in-memory push.
  if (newStatus === 'rejected' || newStatus === 'accepted') {
    const msg = newStatus === 'rejected'
      ? `Hallo ${(a.name || '').split(' ')[0]}, vielen Dank für deine Bewerbung auf die Stelle "${jobTitle}". Leider müssen wir dir mitteilen, dass wir uns für einen anderen Bewerber entschieden haben. Wir wünschen dir alles Gute!`
      : `Hallo ${(a.name || '').split(' ')[0]}, wir freuen uns dir mitzuteilen, dass deine Bewerbung auf die Stelle "${jobTitle}" erfolgreich war! Wir würden dich gerne zu einem Gespräch einladen. Melde dich gerne zurück, damit wir einen Termin vereinbaren können.`;

    if (isReal && a.userId && window.DB) {
      try {
        const chat = await DB.getOrCreateChat({
          workerId: a.userId,
          employerId: state.user.id,
          jobId: a.jobId,
          jobTitle: jobTitle
        });
        await DB.sendMessage(chat.id, state.user.id, msg);
        await loadChatsForUser();
      } catch (e) {
        // Auto-Nachricht fehlgeschlagen, aber der Status-Update war
        // erfolgreich. Vorher: stumm geschluckt → Employer denkt alles
        // geschickt, Worker bekommt nichts. Jetzt: sichtbarer Toast
        // mit Hinweis dass er manuell nachfassen muss.
        console.error('[updateApplicantStatus] chat', e);
        const statusLabel = statusTexts[newStatus] || newStatus;
        showToast('Status auf "' + statusLabel + '" gesetzt, aber die Automatik-Nachricht konnte nicht gesendet werden. Bitte manuell im Chat.', 'error');
      }
    } else {
      // Mock fallback: keep old local push so the seed demo still works
      const workerUserId = a.userId || applicantId;
      let chat = EMPLOYER_CHAT_MESSAGES.find(c => c.partnerId === 'worker-' + workerUserId);
      if (!chat) {
        chat = { id: 100 + workerUserId, partnerId: 'worker-' + workerUserId, partnerName: a.name, partnerInitials: a.initials, jobTitle: jobTitle, lastMessage: '', time: '', unread: false, messages: [] };
        EMPLOYER_CHAT_MESSAGES.push(chat);
      }
      const now = new Date();
      const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2,'0')}`;
      chat.messages.push({ text: msg, sent: true, time: time });
      chat.lastMessage = msg;
      chat.time = time;
    }
  }
  render();
}

async function openApplicantChat(applicantId) {
  const allApplicants = [...getEmployerApplicants(), ...MOCK_APPLICANTS];
  const a = allApplicants.find(x => x.id === applicantId);
  if (!a) { navigate('messages'); return; }

  // Real applicant + we have a backend -> create/find the DB chat row
  if (a.userId && window.DB) {
    try {
      const row = await DB.getOrCreateChat({
        workerId: a.userId,
        employerId: state.user.id,
        jobId: a.jobId || null,
        jobTitle: a.jobTitle || a.job || ''
      });
      await loadChatsForUser();
      await openChatById(row.id);
      navigate('chat', { chatId: row.id });
      return;
    } catch (e) {
      console.error('[openApplicantChat]', e);
      showToast('Chat konnte nicht geöffnet werden.', 'error');
      return;
    }
  }

  // Mock applicant fallback (kept for the seed demo)
  const workerUserId = a.userId || applicantId;
  let chat = EMPLOYER_CHAT_MESSAGES.find(c => c.partnerId === 'worker-' + workerUserId);
  if (!chat) {
    chat = {
      id: 100 + workerUserId,
      partnerId: 'worker-' + workerUserId,
      partnerName: a.name,
      partnerInitials: a.initials,
      jobTitle: a.jobTitle || a.job,
      lastMessage: '',
      time: '',
      unread: false,
      messages: []
    };
    EMPLOYER_CHAT_MESSAGES.push(chat);
  }
  state.activeChat = chat.id;
  navigate('chat', { chatId: chat.id });
}

// Loads messages for a DB-backed chat, hydrates the in-memory chat
// object with them and installs a Realtime subscription so new
// messages push in live.
async function openChatById(chatId) {
  if (!window.DB || !state.user) return;
  const list = state.user.role === 'employer' ? EMPLOYER_CHAT_MESSAGES : WORKER_CHAT_MESSAGES;
  const chat = list.find(c => c.id === chatId);
  if (!chat) return;
  try {
    const msgs = await DB.getMessages(chatId);
    chat.messages = (msgs || []).map(m => ({
      id: m.id,
      text: m.text || '',
      sent: m.sender_id === state.user.id,
      time: m.created_at
        ? new Date(m.created_at).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
        : ''
    }));
    chat.unread = false;
    state.activeChat = chatId;

    // Swap the live subscription to this chat
    if (state._chatSub) {
      try { DB.sb.removeChannel(state._chatSub); } catch (_) {}
      state._chatSub = null;
    }
    state._chatSub = DB.subscribeToMessages(chatId, (newMsg) => {
      // Guard: the user may have navigated away (or opened a different
      // chat) between the time this subscription was created and this
      // callback firing. Without the guard we'd mutate chat.messages
      // and call render() for a view that isn't on screen any more,
      // which leaks memory and can flash stale data.
      if (state.activeChat !== chatId) return;
      if (!state.user) return;
      const now = chat.messages.find(m => m.id === newMsg.id);
      if (now) return;
      chat.messages.push({
        id: newMsg.id,
        text: newMsg.text || '',
        sent: newMsg.sender_id === state.user.id,
        time: newMsg.created_at
          ? new Date(newMsg.created_at).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
          : ''
      });
      chat.lastMessage = newMsg.text || '';
      chat.time = chat.messages[chat.messages.length - 1].time;
      try { render(); } catch (_) {}
      setTimeout(() => {
        const el = document.getElementById('chat-messages-page');
        if (el) el.scrollTop = el.scrollHeight;
      }, 50);
    });
  } catch (e) {
    console.error('[openChatById]', e);
  }
}

async function sendChatMessage() {
  const input = document.getElementById('chat-input');
  if (!input || !input.value.trim()) return;
  const chat = findChat(state.activeChat);
  if (!chat) return;

  const msgText = censorContactInfo(input.value);
  input.value = '';

  // Real DB-backed chat: hand off to Supabase. The realtime subscription
  // installed by openChatById() appends the message to chat.messages and
  // re-renders automatically — no optimistic local push (it caused
  // duplicates because the realtime dedupe check keys on message id
  // and the optimistic push has no id).
  if (window.DB && state.user && chat.id) {
    try {
      await DB.sendMessage(chat.id, state.user.id, msgText);
    } catch (e) {
      console.error('[sendChatMessage]', e);
      showToast('Nachricht konnte nicht gesendet werden.', 'error');
      // Put the text back in the input so the user can retry
      input.value = msgText;
      return;
    }
    return;
  }

  // Mock fallback (seed demo, no DB): local push only
  const now = new Date();
  const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2,'0')}`;
  chat.messages.push({ text: msgText, sent: true, time: time });
  chat.lastMessage = msgText;
  chat.time = time;
  if (state.currentPage === 'chat') {
    render();
    setTimeout(() => {
      const el = document.getElementById('chat-messages-page');
      if (el) el.scrollTop = el.scrollHeight;
    }, 50);
  } else {
    renderChatWidget();
  }
}

// ===== HELPER =====
function escapeHtml(text) {
  if (text == null) return '';
  const d = document.createElement('div');
  d.textContent = String(text);
  return d.innerHTML;
}
function escapeAttr(text) {
  if (text == null) return '';
  return String(text).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// Erzeugt barrierefreies Markup fuers Firmenlogo. Wenn ein Data-URL-
// Bild hinterlegt ist → echtes <img> mit alt-Text. Sonst → dekorativer
// <div> mit Initial, der per aria-hidden vom Screen-Reader ignoriert
// wird (der Firmenname steht in der Regel direkt daneben als Text).
// Ersetzt das frueher ueberall inline wiederholte background-image-
// CSS-Trickserei-Pattern.
function companyLogoHtml(logo, company, opts) {
  opts = opts || {};
  const cls = opts.className || 'job-company-logo';
  const extraStyle = opts.style || '';
  const altName = (company == null ? '' : String(company)).trim() || 'Unternehmen';
  if (logo && typeof logo === 'string' && logo.startsWith('data:')) {
    return `<img src="${logo}" alt="Logo von ${escapeAttr(altName)}" class="${cls}" style="object-fit:cover;${extraStyle}" loading="lazy">`;
  }
  const initial = (altName || '?').charAt(0).toUpperCase();
  return `<div class="${cls}" aria-hidden="true"${extraStyle ? ` style="${extraStyle}"` : ''}>${escapeHtml(initial)}</div>`;
}

function censorContactInfo(text) {
  // E-Mail-Adressen schwärzen
  text = text.replace(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g, '●●●●●●');
  // Telefonnummern schwärzen (verschiedene Formate: +49..., 0170..., 0170/..., 0170-..., etc.)
  text = text.replace(/(\+?\d[\d\s\/\-\(\)]{6,}\d)/g, '●●●●●●');
  return text;
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - d) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'Heute';
  if (diff === 1) return 'Gestern';
  if (diff < 7) return `Vor ${diff} Tagen`;
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// Bekannte deutsche Orte mit Koordinaten. Dient als schneller Fast-Path
// fuer die Entfernungsberechnung — fuer unbekannte Orte greift der
// Nominatim-Fallback (siehe geocodeAddress weiter unten).
const KNOWN_LOCATIONS = {
  // NRW — Rhein/Ruhr + Umland (Haupt-Markt)
  'neuss': { lat: 51.1986, lng: 6.6920 },
  'meerbusch': { lat: 51.2583, lng: 6.6917 },
  'düsseldorf': { lat: 51.2277, lng: 6.7735 },
  'duesseldorf': { lat: 51.2277, lng: 6.7735 },
  'dormagen': { lat: 51.0970, lng: 6.8317 },
  'kaarst': { lat: 51.2292, lng: 6.6205 },
  'grevenbroich': { lat: 51.0883, lng: 6.5883 },
  'korschenbroich': { lat: 51.1900, lng: 6.5167 },
  'jüchen': { lat: 51.1017, lng: 6.5017 },
  'juechen': { lat: 51.1017, lng: 6.5017 },
  'willich': { lat: 51.2633, lng: 6.5467 },
  'krefeld': { lat: 51.3388, lng: 6.5853 },
  'köln': { lat: 50.9375, lng: 6.9603 },
  'koeln': { lat: 50.9375, lng: 6.9603 },
  'duisburg': { lat: 51.4344, lng: 6.7623 },
  'essen': { lat: 51.4556, lng: 7.0116 },
  'ratingen': { lat: 51.2970, lng: 6.8493 },
  'hilden': { lat: 51.1693, lng: 6.9333 },
  'langenfeld': { lat: 51.1084, lng: 6.9488 },
  'monheim': { lat: 51.0911, lng: 6.8913 },
  'erkrath': { lat: 51.2237, lng: 6.9107 },
  'mettmann': { lat: 51.2510, lng: 6.9740 },
  'haan': { lat: 51.1930, lng: 7.0130 },
  'wuppertal': { lat: 51.2562, lng: 7.1508 },
  'solingen': { lat: 51.1725, lng: 7.0849 },
  'remscheid': { lat: 51.1789, lng: 7.1934 },
  'leverkusen': { lat: 51.0459, lng: 6.9884 },
  'bonn': { lat: 50.7374, lng: 7.0982 },
  'bochum': { lat: 51.4818, lng: 7.2162 },
  'dortmund': { lat: 51.5136, lng: 7.4653 },
  'mülheim': { lat: 51.4267, lng: 6.8825 },
  'muelheim': { lat: 51.4267, lng: 6.8825 },
  'oberhausen': { lat: 51.4963, lng: 6.8629 },
  'gelsenkirchen': { lat: 51.5177, lng: 7.0857 },
  'mönchengladbach': { lat: 51.1805, lng: 6.4428 },
  'moenchengladbach': { lat: 51.1805, lng: 6.4428 },
  'aachen': { lat: 50.7753, lng: 6.0839 },
  'münster': { lat: 51.9607, lng: 7.6261 },
  'muenster': { lat: 51.9607, lng: 7.6261 },
  'bielefeld': { lat: 52.0302, lng: 8.5325 },
  'paderborn': { lat: 51.7189, lng: 8.7544 },
  'osnabrück': { lat: 52.2799, lng: 8.0472 },
  'osnabrueck': { lat: 52.2799, lng: 8.0472 },
  // Andere deutsche Grossstaedte
  'berlin': { lat: 52.5200, lng: 13.4050 },
  'hamburg': { lat: 53.5511, lng: 9.9937 },
  'münchen': { lat: 48.1351, lng: 11.5820 },
  'muenchen': { lat: 48.1351, lng: 11.5820 },
  'frankfurt': { lat: 50.1109, lng: 8.6821 },
  'stuttgart': { lat: 48.7758, lng: 9.1829 },
  'leipzig': { lat: 51.3397, lng: 12.3731 },
  'dresden': { lat: 51.0504, lng: 13.7373 },
  'hannover': { lat: 52.3759, lng: 9.7320 },
  'nürnberg': { lat: 49.4521, lng: 11.0767 },
  'nuernberg': { lat: 49.4521, lng: 11.0767 },
  'bremen': { lat: 53.0793, lng: 8.8017 },
  'karlsruhe': { lat: 49.0069, lng: 8.4037 },
  'mannheim': { lat: 49.4875, lng: 8.4660 },
  'augsburg': { lat: 48.3705, lng: 10.8978 },
  'wiesbaden': { lat: 50.0782, lng: 8.2398 },
  'kiel': { lat: 54.3233, lng: 10.1228 },
  'rostock': { lat: 54.0887, lng: 12.1434 },
  'erfurt': { lat: 50.9848, lng: 11.0299 },
  'freiburg': { lat: 47.9990, lng: 7.8421 },
  'heidelberg': { lat: 49.3988, lng: 8.6724 },
  'mainz': { lat: 49.9929, lng: 8.2473 },
  'saarbrücken': { lat: 49.2402, lng: 6.9969 },
  'saarbruecken': { lat: 49.2402, lng: 6.9969 },
  'kassel': { lat: 51.3127, lng: 9.4797 },
  'magdeburg': { lat: 52.1205, lng: 11.6276 },
  'chemnitz': { lat: 50.8278, lng: 12.9214 },
  'lübeck': { lat: 53.8655, lng: 10.6866 },
  'luebeck': { lat: 53.8655, lng: 10.6866 },
  'oldenburg': { lat: 53.1435, lng: 8.2146 },
  'göttingen': { lat: 51.5413, lng: 9.9158 },
  'goettingen': { lat: 51.5413, lng: 9.9158 },
  'potsdam': { lat: 52.3906, lng: 13.0645 },
  'koblenz': { lat: 50.3569, lng: 7.5890 },
  'trier': { lat: 49.7490, lng: 6.6371 },
  'ulm': { lat: 48.4011, lng: 9.9876 },
  'regensburg': { lat: 49.0134, lng: 12.1016 },
  'würzburg': { lat: 49.7913, lng: 9.9534 },
  'wuerzburg': { lat: 49.7913, lng: 9.9534 },
};

// ===== GEOCODING =====
// Wandelt eine Adresseingabe in {lat, lng}. Erst KNOWN_LOCATIONS
// (Substring-Match), dann localStorage-Cache, dann Nominatim (OSM).
// Nominatim-Policy: max 1 Request/Sekunde + Referer/User-Agent.
// Cache-Hits sind synchron schnell (Promise resolved sofort).
const GEO_CACHE_KEY = 'jj_geocode_cache_v1';
let _geoCache = null;
function _loadGeoCache() {
  if (_geoCache) return _geoCache;
  try { _geoCache = JSON.parse(localStorage.getItem(GEO_CACHE_KEY) || '{}'); }
  catch { _geoCache = {}; }
  return _geoCache;
}
function _saveGeoCache() {
  try { localStorage.setItem(GEO_CACHE_KEY, JSON.stringify(_geoCache || {})); }
  catch (_) { /* quota or private mode — ignore */ }
}
function _normalizeAddress(addr) {
  return String(addr || '').toLowerCase().trim().replace(/\s+/g, ' ');
}

let _lastNominatimCall = 0;
const _inflightGeo = new Map();
async function _nominatimGeocode(addr) {
  // Rate-limit (1 Request pro 1100 ms gemaess Nominatim usage policy)
  const wait = Math.max(0, 1100 - (Date.now() - _lastNominatimCall));
  if (wait > 0) await new Promise(r => setTimeout(r, wait));
  _lastNominatimCall = Date.now();
  // Wenn die Adresse keine Stadt/Land enthaelt, bisschen aufhuebschen
  const q = /deutschland|germany/i.test(addr) ? addr : addr + ', Deutschland';
  const url = 'https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=de&q=' + encodeURIComponent(q);
  try {
    const res = await fetch(url, { headers: { 'Accept-Language': 'de' } });
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data) || !data.length) return null;
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  } catch (_) {
    return null;
  }
}

async function geocodeAddress(addr) {
  const key = _normalizeAddress(addr);
  if (!key) return null;
  const cache = _loadGeoCache();
  // Cache-Hit (inkl. negative cache fuer nicht-findbar)
  if (key in cache) return cache[key];
  // Fast-Path: bekannter Ort in Substring
  for (const city in KNOWN_LOCATIONS) {
    if (key.includes(city)) {
      cache[key] = KNOWN_LOCATIONS[city];
      _saveGeoCache();
      return cache[key];
    }
  }
  // Deduplizieren: parallele Calls fuer die gleiche Adresse teilen sich
  // einen einzigen Nominatim-Request.
  if (_inflightGeo.has(key)) return _inflightGeo.get(key);
  const p = _nominatimGeocode(key).then(coords => {
    cache[key] = coords;  // coords kann null sein → negatives Caching
    _saveGeoCache();
    _inflightGeo.delete(key);
    return coords;
  });
  _inflightGeo.set(key, p);
  return p;
}

function haversineDistance(lat1, lng1, lat2, lng2) {
  var R = 6371;
  var dLat = (lat2 - lat1) * Math.PI / 180;
  var dLng = (lng2 - lng1) * Math.PI / 180;
  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// Async: Wandelt die User-Adresse UND alle eindeutigen Job-Staedte
// in Koordinaten um und berechnet die Entfernung fuer jeden Job.
// Dadurch funktioniert der Umkreis-Filter jetzt fuer beliebige
// deutsche Adressen, nicht nur die hart-kodierten aus KNOWN_LOCATIONS.
// Cache (localStorage) sorgt dafuer, dass bekannte Adressen ohne
// API-Call aufgeloest werden.
async function updateJobDistances() {
  var addr = (state.filters.address || '').trim();
  if (!addr) {
    JOBS.forEach(function(j) { j.distance = 0; });
    return;
  }
  // User-Koordinaten holen (Cache/KNOWN_LOCATIONS/Nominatim)
  const userCoords = await geocodeAddress(addr);
  if (!userCoords) {
    // Adresse nicht aufloesbar → distance = 0, Filter greift nicht
    JOBS.forEach(function(j) { j.distance = 0; });
    return;
  }
  // Pro Job die praeziseste verfuegbare Adresse nehmen: j.location
  // enthaelt idealerweise Strasse + PLZ + Stadt (wenn der Arbeitgeber
  // alles ausgefuellt hat). Faellt zurueck auf j.city wenn nicht.
  // Dedupliziert wird auf dem Key-String, nicht auf der Stadt — so
  // bekommt jede einzigartige Firmenadresse eigene Koordinaten.
  const jobKeys = JOBS.map(function(j){
    return (j.location && j.location.trim()) ? j.location.trim() : (j.city || '');
  });
  const uniqueKeys = Array.from(new Set(jobKeys.filter(Boolean)));
  const pairs = await Promise.all(uniqueKeys.map(async function(key) {
    return [key, await geocodeAddress(key)];
  }));
  const keyCoords = Object.fromEntries(pairs);
  JOBS.forEach(function(j, idx) {
    const jc = keyCoords[jobKeys[idx]];
    if (jc) {
      j.lat = jc.lat;
      j.lng = jc.lng;
      j.distance = Math.round(haversineDistance(userCoords.lat, userCoords.lng, jc.lat, jc.lng) * 10) / 10;
    } else {
      j.distance = 0;
    }
  });
}

// Wrapper fuer UI-Handler: setzt ein Loading-Flag, ruft render() fuer
// sofortiges Feedback, triggert geocoding und rendert am Ende neu.
// Deduplication: bei schnellem Tippen koennen mehrere Laeufe parallel
// laufen. Wir merken uns den "run-token" und ignorieren ueberholte
// Ergebnisse. Letzter-Start-gewinnt.
let _geoRunToken = 0;
function recomputeDistancesAndRender() {
  const myToken = ++_geoRunToken;
  state.geoLoading = true;
  try { render(); } catch (_) {}
  updateJobDistances().finally(function() {
    // Wenn inzwischen ein neuer Lauf gestartet wurde: nichts tun,
    // der neuere gewinnt. Das verhindert, dass nach Adress-Wechsel
    // kurz die Distanzen der vorherigen Adresse erscheinen.
    if (myToken !== _geoRunToken) return;
    state.geoLoading = false;
    try { render(); } catch (_) {}
  });
}

function toggleHoursFilter(h) {
  const idx = state.filters.hours.indexOf(h);
  if (idx > -1) state.filters.hours.splice(idx, 1);
  else state.filters.hours.push(h);
  render();
}

function getFilteredJobs() {
  // Inaktive Jobs (active=false) gar nicht erst anzeigen — die
  // Auto-Archivierung via Cron setzt active=false nach X Tagen,
  // wir wollen keine Leichen in der Suche.
  let jobs = JOBS.filter(j => j.active !== false);
  const f = state.filters;
  if (f.search) {
    const s = f.search.toLowerCase();
    jobs = jobs.filter(j => j.title.toLowerCase().includes(s) || j.company.toLowerCase().includes(s) || j.tags.some(t => t.toLowerCase().includes(s)));
  }
  if (f.category) jobs = jobs.filter(j => j.category === f.category);
  if (f.type) jobs = jobs.filter(j => j.type === f.type);
  if (f.radius < 50 && f.address) jobs = jobs.filter(j => j.distance > 0 && j.distance <= f.radius);
  if (f.city) jobs = jobs.filter(j => j.city === f.city);
  if (f.hours.length > 0) {
    jobs = jobs.filter(j => {
      const nums = j.hours.match(/\d+/g);
      if (!nums) return false;
      const lo = parseInt(nums[0]);
      const hi = nums[1] ? parseInt(nums[1]) : lo;
      return f.hours.some(h => h >= lo && h <= hi);
    });
  }
  if (f.sort === 'date') jobs.sort((a, b) => new Date(b.posted) - new Date(a.posted));
  if (f.sort === 'views') jobs.sort((a, b) => b.views - a.views);
  if (f.sort === 'distance') jobs.sort((a, b) => a.distance - b.distance);
  // Promoted jobs first
  jobs.sort((a, b) => (b.promoted ? 1 : 0) - (a.promoted ? 1 : 0));
  return jobs;
}

// ===== PAGE RENDERERS =====

function renderLanding() {
  return `
    <!-- Hero -->
    <div class="employer-hero" style="min-height:560px">
      <div class="employer-hero-bg">
        <img src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1400&q=80" alt="">
      </div>
      <div class="employer-hero-content slide-up" style="max-width:700px;padding:4rem 2rem">
        <div style="display:inline-block;background:rgba(255,255,255,0.15);backdrop-filter:blur(4px);padding:0.4rem 1rem;border-radius:100px;font-size:0.8rem;font-weight:600;margin-bottom:1.25rem;letter-spacing:0.05em">DEIN WEG ZUM ERSTEN JOB</div>
        <h1 style="font-size:3.2rem;line-height:1.12;font-family:'Playfair Display',serif">Dein erster Job.<br>Ohne Stress.</h1>
        <p style="font-size:1.15rem;opacity:0.92;margin-bottom:2rem;line-height:1.7;max-width:550px">Minijobs, Ferienjobs und Praktika in deiner Nähe. Bewirb dich mit einem Klick.</p>
        <div style="display:flex;gap:1rem;flex-wrap:wrap">
          <button class="btn btn-lg" style="background:#fff;color:#1d4ed8;font-size:1rem;padding:0.875rem 2.5rem" onclick="navigate('jobs')">Jobs entdecken</button>
          <button class="btn btn-lg" style="background:transparent;border:2px solid rgba(255,255,255,0.4);color:#fff;font-size:1rem;padding:0.875rem 2rem" onclick="navigate('employer-landing')">Für Arbeitgeber</button>
        </div>
      </div>
    </div>

    <!-- Stats + Logo Ticker vorübergehend entfernt -->
    <!--
    <div class="emp-stats-row">
      <div class="emp-stat-card"><div class="emp-stat-number">2.500+</div><div class="emp-stat-label">Stellenangebote</div></div>
      <div class="emp-stat-card"><div class="emp-stat-number">15.000+</div><div class="emp-stat-label">Registrierte Nutzer</div></div>
      <div class="emp-stat-card"><div class="emp-stat-number">800+</div><div class="emp-stat-label">Partnerfirmen</div></div>
      <div class="emp-stat-card"><div class="emp-stat-number">95%</div><div class="emp-stat-label">Weiterempfehlung</div></div>
    </div>

    <div style="padding:2rem 1.5rem 2.5rem;text-align:center;background:#fff">
      <p style="color:var(--gray-500);font-size:0.8rem;text-transform:uppercase;letter-spacing:0.12em;font-weight:600;margin-bottom:1.25rem">Vertrauen von über 800 Unternehmen</p>
      <div class="employer-ticker-wrap">
        <div class="employer-ticker-fade-left"></div>
        <div class="employer-ticker-fade-right"></div>
        <div class="employer-ticker">
          <div class="employer-ticker-track">
            <div class="employer-ticker-item"><img src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" alt="Amazon"></div>
            <div class="employer-ticker-item"><img src="https://upload.wikimedia.org/wikipedia/commons/5/57/Logo_REWE_alt.svg" alt="REWE"></div>
            <div class="employer-ticker-item"><img src="https://upload.wikimedia.org/wikipedia/en/3/35/Starbucks_Coffee_Logo.svg" alt="Starbucks"></div>
            <div class="employer-ticker-item"><img src="https://upload.wikimedia.org/wikipedia/de/f/f7/Logo_Deichmann.svg" alt="Deichmann"></div>
            <div class="employer-ticker-item"><img src="https://upload.wikimedia.org/wikipedia/commons/5/5c/Subway_2016_logo.svg" alt="Subway"></div>
            <div class="employer-ticker-item"><img src="https://upload.wikimedia.org/wikipedia/commons/c/c5/Ikea_logo.svg" alt="IKEA"></div>
            <div class="employer-ticker-item"><img src="https://upload.wikimedia.org/wikipedia/en/c/cc/Vodafone_2017_logo.svg" alt="Vodafone"></div>
            <div class="employer-ticker-item"><img src="https://upload.wikimedia.org/wikipedia/commons/e/e7/Logo_Edeka.svg" alt="EDEKA"></div>
            <div class="employer-ticker-item"><img src="https://upload.wikimedia.org/wikipedia/commons/3/36/McDonald%27s_Golden_Arches.svg" alt="McDonald's"></div>
            <div class="employer-ticker-item"><img src="https://upload.wikimedia.org/wikipedia/commons/f/f0/Media_Markt_logo.svg" alt="MediaMarkt"></div>
            <div class="employer-ticker-item"><img src="https://upload.wikimedia.org/wikipedia/commons/9/91/Lidl-Logo.svg" alt="Lidl"></div>
            <div class="employer-ticker-item"><img src="https://upload.wikimedia.org/wikipedia/commons/7/74/Dominos_pizza_logo.svg" alt="Domino's"></div>
            <div class="employer-ticker-item"><img src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" alt="Amazon"></div>
            <div class="employer-ticker-item"><img src="https://upload.wikimedia.org/wikipedia/commons/5/57/Logo_REWE_alt.svg" alt="REWE"></div>
            <div class="employer-ticker-item"><img src="https://upload.wikimedia.org/wikipedia/en/3/35/Starbucks_Coffee_Logo.svg" alt="Starbucks"></div>
            <div class="employer-ticker-item"><img src="https://upload.wikimedia.org/wikipedia/de/f/f7/Logo_Deichmann.svg" alt="Deichmann"></div>
            <div class="employer-ticker-item"><img src="https://upload.wikimedia.org/wikipedia/commons/5/5c/Subway_2016_logo.svg" alt="Subway"></div>
            <div class="employer-ticker-item"><img src="https://upload.wikimedia.org/wikipedia/commons/c/c5/Ikea_logo.svg" alt="IKEA"></div>
            <div class="employer-ticker-item"><img src="https://upload.wikimedia.org/wikipedia/en/c/cc/Vodafone_2017_logo.svg" alt="Vodafone"></div>
            <div class="employer-ticker-item"><img src="https://upload.wikimedia.org/wikipedia/commons/e/e7/Logo_Edeka.svg" alt="EDEKA"></div>
            <div class="employer-ticker-item"><img src="https://upload.wikimedia.org/wikipedia/commons/3/36/McDonald%27s_Golden_Arches.svg" alt="McDonald's"></div>
            <div class="employer-ticker-item"><img src="https://upload.wikimedia.org/wikipedia/commons/f/f0/Media_Markt_logo.svg" alt="MediaMarkt"></div>
            <div class="employer-ticker-item"><img src="https://upload.wikimedia.org/wikipedia/commons/9/91/Lidl-Logo.svg" alt="Lidl"></div>
            <div class="employer-ticker-item"><img src="https://upload.wikimedia.org/wikipedia/commons/7/74/Dominos_pizza_logo.svg" alt="Domino's"></div>
          </div>
        </div>
      </div>
    </div>
    -->

    <!-- So einfach gehts - Schritte erscheinen nacheinander -->
    <div style="background:var(--gray-50);padding:4rem 0">
      <div style="text-align:center;margin-bottom:2.5rem;padding:0 1.5rem">
        <h2 style="font-size:1.8rem;font-weight:800;font-family:'Playfair Display',serif;margin-bottom:0.5rem">So einfach geht's</h2>
        <p style="color:var(--gray-500);font-size:0.95rem">In 3 Schritten zum neuen Job</p>
      </div>

      <div class="steps-cascade" id="steps-cascade">
        <div class="sc-step" data-i="0">
          <div class="sc-step-circle">1</div>
          <div class="sc-step-text">
            <h3>Profil anlegen</h3>
            <p>Sag uns wer du bist, was du kannst und wann du Zeit hast. Dauert keine 2 Minuten.</p>
          </div>
        </div>
        <div class="sc-step" data-i="1">
          <div class="sc-step-circle">2</div>
          <div class="sc-step-text">
            <h3>Jobs entdecken</h3>
            <p>Stöbere durch Angebote in deiner Nähe. Filter nach Entfernung, Branche und Arbeitszeiten.</p>
          </div>
        </div>
        <div class="sc-step" data-i="2">
          <div class="sc-step-circle">3</div>
          <div class="sc-step-text">
            <h3>Bewerben & starten</h3>
            <p>Ein Klick, fertig. Dein Motivationsschreiben wird automatisch erstellt. Der Rest läuft über den Chat.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Darum WorkPilot - Slideshow (sticky-Stack, naechste Seite schiebt sich drueber) -->
    <section class="sp-wrap">
      <div class="sp-wrap-head">
        <h2>Was WorkPilot <em>anders</em> macht</h2>
        <p class="sp-wrap-sub">Drei Dinge, die uns von anderen Jobportalen unterscheiden.</p>
      </div>

      <article class="sp-slide" data-i="1">
        <div class="sp-slide-inner">
          <div class="sp-slide-media">
            <img src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1100&auto=format&fit=crop" alt="" loading="lazy">
            <div class="sp-slide-badge">
              <span class="sp-slide-badge-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M20 10c0 7-8 13-8 13s-8-6-8-13a8 8 0 0116 0z"/><circle cx="12" cy="10" r="3"/></svg>
              </span>
              <div class="sp-slide-badge-text">
                <strong>2.400+ Jobs</strong>
                <span>in deiner Stadt heute</span>
              </div>
            </div>
          </div>
          <div class="sp-slide-body">
            <span class="sp-slide-num">eins.</span>
            <h3>Jobs, die du zu Fuß erreichst.</h3>
            <p>Nur Stellen bei Unternehmen in deiner Stadt &mdash; mit Umkreis-Filter und Kartenansicht.</p>
            <div class="sp-slide-features">
              <div class="sp-slide-feature"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>Kartenansicht mit Pins</div>
              <div class="sp-slide-feature"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>Radius-Filter (2 / 5 / 10 km)</div>
              <div class="sp-slide-feature"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>Push bei neuen Jobs in der Nähe</div>
            </div>
          </div>
        </div>
      </article>

      <article class="sp-slide sp-slide-reverse" data-i="2">
        <div class="sp-slide-inner">
          <div class="sp-slide-media">
            <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1100&auto=format&fit=crop" alt="" loading="lazy">
            <div class="sp-slide-badge">
              <span class="sp-slide-badge-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
              </span>
              <div class="sp-slide-badge-text">
                <strong>10 Sekunden</strong>
                <span>pro Bewerbung</span>
              </div>
            </div>
          </div>
          <div class="sp-slide-body">
            <span class="sp-slide-num">zwei.</span>
            <h3>Bewerben in einem Wisch.</h3>
            <p>Kein Anschreiben, kein Foto-Upload. Profil einmal ausfüllen &mdash; dann ein Klick pro Job.</p>
            <div class="sp-slide-features">
              <div class="sp-slide-feature"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>Auto-Motivationsschreiben</div>
              <div class="sp-slide-feature"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>Lebenslauf-Builder inklusive</div>
              <div class="sp-slide-feature"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>Status jederzeit im Dashboard</div>
            </div>
          </div>
        </div>
      </article>

      <article class="sp-slide" data-i="3">
        <div class="sp-slide-inner">
          <div class="sp-slide-media">
            <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1100&auto=format&fit=crop" alt="" loading="lazy">
            <div class="sp-slide-badge">
              <span class="sp-slide-badge-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
              </span>
              <div class="sp-slide-badge-text">
                <strong>Direkt im Chat</strong>
                <span>keine Telefonate</span>
              </div>
            </div>
          </div>
          <div class="sp-slide-body">
            <span class="sp-slide-num">drei.</span>
            <h3>Schreib den Chef direkt an.</h3>
            <p>Alle Fragen, Termine und Zusagen im Chat. Läuft wie Messenger &mdash; nur dass's ums Arbeiten geht.</p>
            <div class="sp-slide-features">
              <div class="sp-slide-feature"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>Antwort meist in unter 24h</div>
              <div class="sp-slide-feature"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>Keine E-Mail-Kette</div>
              <div class="sp-slide-feature"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>Nummer bleibt privat</div>
            </div>
          </div>
        </div>
      </article>

      <!-- Spacer, damit Slide 3 100vh Pin-Zeit bekommt -->
      <div class="sp-end"></div>
    </section>

    <!-- Testimonials - scrollender Ticker -->
    <div style="background:var(--gray-50);padding:4rem 0;overflow:hidden">
      <div style="text-align:center;margin-bottom:2.5rem;padding:0 1.5rem">
        <h2 style="font-size:1.8rem;font-weight:800;font-family:'Playfair Display',serif;margin-bottom:0.5rem"><span style="color:var(--primary)">Echte</span> Geschichten, <span style="color:var(--primary)">echte</span> Jobs</h2>
        <p style="color:var(--gray-500);font-size:0.95rem">Das sagen unsere Nutzer</p>
      </div>
      <div class="testi-ticker-wrap">
        <div class="testi-ticker-fade testi-ticker-fade-left"></div>
        <div class="testi-ticker-fade testi-ticker-fade-right"></div>
        <div class="testi-ticker">
          <div class="testi-ticker-track">
            ${(() => {
              var list = [
                { name:'Lena M., 17', role:'Schülerin aus Düsseldorf', photo:'https://randomuser.me/api/portraits/women/68.jpg', text:'„Ich hab meinen ersten Ferienjob innerhalb von 2 Tagen gefunden. Die Bewerbung war super einfach!"', rating:5 },
                { name:'Tim K., 19', role:'Student aus Köln', photo:'https://randomuser.me/api/portraits/men/22.jpg', text:'„Endlich eine Plattform für junge Leute. Keine komplizierten Formulare, alles läuft über den Chat."', rating:4.5 },
                { name:'Sara H., 16', role:'Schülerin aus Essen', photo:'https://randomuser.me/api/portraits/women/44.jpg', text:'„Der Lebenslauf-Builder hat mir sehr geholfen. Mein erster richtiger Lebenslauf — richtig professionell!"', rating:5 },
                { name:'Jonas P., 18', role:'Schüler aus München', photo:'https://randomuser.me/api/portraits/men/45.jpg', text:'„Mein Chef hat sich innerhalb von ein paar Stunden gemeldet. Super schnell und unkompliziert."', rating:4 },
                { name:'Mia A., 15', role:'Schülerin aus Berlin', photo:'https://randomuser.me/api/portraits/women/79.jpg', text:'„Ich wollte neben der Schule was verdienen — nach 3 Tagen hatte ich meinen ersten Nachhilfejob."', rating:5 },
                { name:'Niklas R., 20', role:'Student aus Hamburg', photo:'https://randomuser.me/api/portraits/men/32.jpg', text:'„Perfekt für meinen Sommerjob. Alles läuft über die App, keine E-Mail-Hölle mehr."', rating:4.5 },
                { name:'Lina K., 17', role:'Schülerin aus Stuttgart', photo:'https://randomuser.me/api/portraits/women/90.jpg', text:"„Ich fand's mega, dass man ohne Anschreiben direkt zusagen konnte. Das spart so viel Zeit.\"", rating:5 },
                { name:'David H., 16', role:'Schüler aus Frankfurt', photo:'https://randomuser.me/api/portraits/men/11.jpg', text:'„Endlich Jobs in meiner Nähe ohne lange Anfahrt. Die Standort-Suche ist richtig praktisch."', rating:4 }
              ];
              var render = function(t) {
                var pct = (t.rating / 5) * 100;
                return '<div class="testi-card">' +
                  '<span class="testi-stars"><span class="testi-stars-bg">★★★★★</span><span class="testi-stars-fill" style="--rating:' + pct + '%">★★★★★</span></span>' +
                  '<p>' + t.text + '</p>' +
                  '<div class="testi-author"><div class="testi-avatar"><img src="' + t.photo + '" alt="" loading="lazy"></div><div><div class="testi-name">' + t.name + '</div><div class="testi-role">' + t.role + '</div></div></div>' +
                '</div>';
              };
              // Einmal die Liste + Duplikat für nahtlosen Loop
              return list.map(render).join('') + list.map(render).join('');
            })()}
          </div>
        </div>
      </div>
    </div>

    <!-- Finaler CTA - full-width Block -->
    <section class="cta-fullblock">
      <div class="cta-fullblock-inner">
        <span class="cta-fullblock-kicker">Bereit?</span>
        <h2>Worauf wartest du?</h2>
        <p>Tausende Schüler haben hier ihren ersten Job gefunden. Du bist als Nächstes dran.</p>
        <div class="cta-fullblock-buttons">
          <button class="btn btn-lg cta-btn-primary" onclick="navigate('jobs')">Jobs entdecken <span class="cta-arrow">→</span></button>
          <button class="btn btn-lg cta-btn-outline" onclick="navigate('employer-landing')">Für Arbeitgeber</button>
        </div>
      </div>
    </section>`;
}

// ===== Feature Spotlight ("Darum WorkPilot") - Slideshow =====
// Komplett CSS-getrieben (position:sticky + z-index). Kein JS auf
// scroll - das hielt den Main-Thread beim Scrollen unnoetig auf.

// ===== Kaskaden-Slideshow ("So einfach geht's") =====
// Schritte erscheinen nacheinander wenn die Sektion sichtbar wird.
// Beim nächsten Rerender (z.B. Seitenwechsel und zurück) wird neu gespielt.
var SC_STEP_DELAY = 350; // ms zwischen den Schritten
var scLastContainer = null;
var scTimers = [];
var scIo = null;

function scPlay(container) {
  // Timer zurücksetzen, dann Schritt 2 und 3 nacheinander einblenden.
  // Schritt 1 ist per CSS schon sichtbar.
  scTimers.forEach(function(t) { clearTimeout(t); });
  scTimers = [];
  var steps = container.querySelectorAll('.sc-step');
  steps.forEach(function(el, i) {
    if (i === 0) { el.classList.add('show'); return; } // Schritt 1 sofort
    scTimers.push(setTimeout(function() {
      el.classList.add('show');
    }, SC_STEP_DELAY * i));
  });
}

function scSetup() {
  var container = document.getElementById('steps-cascade');
  if (!container) return;
  // Gleicher Container wie letztes Mal? Dann nichts tun.
  if (container === scLastContainer) return;
  scLastContainer = container;

  // Alten Observer aufräumen
  if (scIo) { scIo.disconnect(); scIo = null; }

  // Fallback: keine IntersectionObserver-Unterstützung → direkt spielen
  if (!('IntersectionObserver' in window)) {
    scPlay(container);
    return;
  }

  // Observer: abspielen sobald Sektion sichtbar wird
  scIo = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        scPlay(container);
        scIo.disconnect();
        scIo = null;
      }
    });
  }, { threshold: 0.5 });
  scIo.observe(container);
}

// Prüft regelmäßig ob der Container da ist (z.B. nach render())
var scDomObserver = new MutationObserver(scSetup);
scDomObserver.observe(document.getElementById('app'), { childList: true, subtree: true });
// Initial auch direkt prüfen
scSetup();

// ===== SKELETON SCREENS =====
// Erzeugen Lade-Platzhalter in der Form der späteren Inhalte. Werden
// in render-Funktionen eingeblendet solange der asynchrone DB-Call
// noch läuft. Markup ist rein CSS-basiert (siehe style.css → SKELETON).

function skeletonJobCard() {
  return `
    <div class="skeleton-job-card" aria-hidden="true">
      <div class="skeleton skeleton-avatar"></div>
      <div class="skeleton-job-body">
        <div class="skeleton skeleton-title"></div>
        <div class="skeleton skeleton-text" style="width:40%"></div>
        <div class="skeleton-job-meta">
          <div class="skeleton skeleton-text" style="width:55%"></div>
          <div class="skeleton skeleton-text" style="width:35%"></div>
          <div class="skeleton skeleton-text" style="width:45%"></div>
        </div>
        <div class="skeleton-job-tags">
          <div class="skeleton skeleton-tag"></div>
          <div class="skeleton skeleton-tag" style="width:80px"></div>
        </div>
      </div>
    </div>`;
}

function skeletonJobGrid(count) {
  const n = count || 5;
  return `<div class="jobs-grid" role="status" aria-label="Jobs werden geladen" aria-live="polite">`
    + Array.from({ length: n }, skeletonJobCard).join('')
    + `</div>`;
}

function skeletonChatRow() {
  return `
    <div class="skeleton-chat-row" aria-hidden="true">
      <div class="skeleton skeleton-avatar-round"></div>
      <div class="skeleton-chat-body">
        <div class="skeleton skeleton-text" style="width:30%;height:0.8rem"></div>
        <div class="skeleton skeleton-text" style="width:50%"></div>
        <div class="skeleton skeleton-text" style="width:70%"></div>
      </div>
    </div>`;
}

function skeletonChatList(count) {
  const n = count || 4;
  return `<div class="card" style="max-width:620px" role="status" aria-label="Nachrichten werden geladen" aria-live="polite">`
    + Array.from({ length: n }, skeletonChatRow).join('')
    + `</div>`;
}

function skeletonChatMessages() {
  return `
    <div role="status" aria-label="Nachrichten werden geladen" aria-live="polite" style="display:flex;flex-direction:column;gap:0.625rem;max-width:620px">
      <div class="skeleton skeleton-msg-bubble left"></div>
      <div class="skeleton skeleton-msg-bubble right"></div>
      <div class="skeleton skeleton-msg-bubble left" style="width:65%"></div>
      <div class="skeleton skeleton-msg-bubble right" style="width:40%"></div>
    </div>`;
}

function skeletonTableRows(count) {
  const n = count || 5;
  const row = `
    <div class="skeleton-table-row" aria-hidden="true">
      <div class="skeleton skeleton-text" style="margin:0"></div>
      <div class="skeleton skeleton-text" style="margin:0;width:70%"></div>
      <div class="skeleton skeleton-text" style="margin:0;width:50%"></div>
      <div class="skeleton skeleton-tag" style="width:70px"></div>
    </div>`;
  return `<div role="status" aria-label="Wird geladen" aria-live="polite">${row.repeat(n)}</div>`;
}

// Skeleton fuer Profil-Ansichten (Worker-ProfileView / Employer-Profile).
// Bildet grob die spaetere Struktur nach: Header-Karte mit Avatar und
// Name/Meta-Zeilen, dann 2-3 Inhalts-Karten.
function skeletonProfilePage() {
  return `
    <div role="status" aria-label="Profil wird geladen" aria-live="polite" style="max-width:900px;margin:0 auto">
      <div style="background:#fff;border:1px solid var(--gray-200);border-radius:var(--radius);padding:1.5rem;margin-bottom:1rem">
        <div style="display:flex;gap:1rem;align-items:flex-start">
          <div class="skeleton" style="width:80px;height:80px;border-radius:50%;flex-shrink:0"></div>
          <div style="flex:1">
            <div class="skeleton skeleton-title" style="width:45%;height:1.3rem"></div>
            <div class="skeleton skeleton-text" style="width:60%"></div>
            <div class="skeleton skeleton-text" style="width:40%"></div>
            <div class="skeleton skeleton-text" style="width:55%"></div>
          </div>
        </div>
      </div>
      <div style="background:#fff;border:1px solid var(--gray-200);border-radius:var(--radius);padding:1.5rem;margin-bottom:1rem">
        <div class="skeleton skeleton-title" style="width:25%"></div>
        <div class="skeleton skeleton-text" style="width:90%"></div>
        <div class="skeleton skeleton-text" style="width:80%"></div>
        <div class="skeleton skeleton-text" style="width:70%"></div>
        <div style="display:flex;gap:0.4rem;margin-top:0.8rem;flex-wrap:wrap">
          <div class="skeleton skeleton-tag"></div>
          <div class="skeleton skeleton-tag" style="width:80px"></div>
          <div class="skeleton skeleton-tag" style="width:50px"></div>
          <div class="skeleton skeleton-tag" style="width:70px"></div>
        </div>
      </div>
      <div style="background:#fff;border:1px solid var(--gray-200);border-radius:var(--radius);padding:1.5rem">
        <div class="skeleton skeleton-title" style="width:30%"></div>
        <div class="skeleton skeleton-text" style="width:85%"></div>
        <div class="skeleton skeleton-text" style="width:75%"></div>
      </div>
    </div>`;
}

// Hilfs-Check: laufen wir gerade in einer Phase, wo Profil-Daten
// nicht vertrauenswuerdig sind (Session unbekannt oder Refresh laeuft)?
function isProfileLoading() {
  return !state.sessionLoaded || !!state._profileRefreshing;
}

function renderJobSearch() {
  const loading = !state.jobsLoaded;
  const jobs = loading ? [] : getFilteredJobs();
  return `
    <div class="page page-wide">
      <h1 class="sr-only">Jobs finden</h1>
      <div class="search-header">
        <div class="search-bar">
          <label for="job-search-input" class="sr-only">Job-Suche</label>
          <input type="text" id="job-search-input" placeholder="Job, Unternehmen oder Stichwort..." value="${state.filters.search}" oninput="state.filters.search=this.value;render()" aria-label="Nach Jobs suchen">
          <button class="btn btn-primary" onclick="render()">Suchen</button>
        </div>
        <div style="display:flex;align-items:center;gap:1rem">
          <span class="search-results-count" aria-live="polite">${loading ? 'Jobs werden geladen…' : jobs.length + ' Jobs gefunden'}</span>
        </div>
      </div>
      <!-- Mobile: Filter-Toggle-Button mit Counter -->
      ${(() => {
        const f = state.filters || {};
        const activeCount =
          (f.category ? 1 : 0) +
          (f.city ? 1 : 0) +
          (f.address ? 1 : 0) +
          ((f.hours || []).length > 0 ? 1 : 0) +
          (f.radius < 50 ? 1 : 0) +
          (f.type ? 1 : 0);
        const isOpen = !!state.mobileFiltersOpen;
        return `
        <button class="mobile-filter-toggle" onclick="state.mobileFiltersOpen=!state.mobileFiltersOpen;render()" aria-expanded="${isOpen}" aria-controls="search-sidebar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
          <span>Filter${activeCount > 0 ? ` <span class="mobile-filter-count">${activeCount}</span>` : ''}</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false" style="margin-left:auto;transition:transform 0.2s;transform:rotate(${isOpen ? '180deg' : '0deg'})"><polyline points="6 9 12 15 18 9"/></svg>
        </button>`;
      })()}

      <div class="search-layout ${state.mobileFiltersOpen ? 'show-mobile-filters' : ''}">
        <aside class="search-sidebar" id="search-sidebar">
          <h3 style="font-size:1rem;margin-bottom:1rem">Filter</h3>

          <div class="filter-section">
            <h4 id="addr-filter-heading">Deine Adresse</h4>
            <input type="text" class="form-input" id="address-filter-input" placeholder="Straße + PLZ + Stadt (z.B. Hauptstr. 1, 40213 Düsseldorf)" value="${state.filters.address || ''}" aria-labelledby="addr-filter-heading" oninput="state.filters.address=this.value;clearTimeout(window._addrTimer);window._addrTimer=setTimeout(recomputeDistancesAndRender,800)" onkeydown="if(event.key==='Enter'){event.preventDefault();clearTimeout(window._addrTimer);recomputeDistancesAndRender();}">
            <p style="font-size:0.7rem;color:${state.geoLoading ? 'var(--primary)' : 'var(--gray-400)'};margin-top:0.3rem;display:flex;align-items:center;gap:0.35rem">
              ${state.geoLoading
                ? '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" style="animation:initial-spin 0.8s linear infinite"><path d="M21 12a9 9 0 11-6.22-8.56"/></svg> Entfernungen werden berechnet…'
                : (state.filters.address ? 'Entfernungen berechnet ✓' : 'Gib deinen Ort ein für genaue Entfernungen')}
            </p>
          </div>

          <div class="filter-section">
            <h4>Kategorie</h4>
            <select class="form-select" onchange="state.filters.category=this.value;render()">
              <option value="">Alle Kategorien</option>
              ${CATEGORIES.map(c => `<option value="${c.name}" ${state.filters.category===c.name?'selected':''}>${c.icon} ${c.name} (${c.count})</option>`).join('')}
            </select>
          </div>

          <div class="filter-section">
            <h4>Stadt</h4>
            <select class="form-select" onchange="state.filters.city=this.value;render()">
              <option value="">Alle Städte</option>
              ${[...new Set(JOBS.map(j => j.city).filter(Boolean))].sort().map(c => `<option value="${escapeAttr(c)}" ${state.filters.city===c?'selected':''}>${escapeHtml(c)}</option>`).join('')}
            </select>
          </div>

          <div class="filter-section">
            <h4>Stunden pro Woche</h4>
            <div style="display:flex;flex-wrap:wrap;gap:0.4rem">
              ${[6,7,8,9,10,11,12].map(h => `<label style="display:flex;align-items:center;gap:0.3rem;font-size:0.85rem;cursor:pointer">
                <input type="checkbox" ${state.filters.hours.includes(h)?'checked':''} onchange="toggleHoursFilter(${h})"> ${h}
              </label>`).join('')}
            </div>
          </div>

          <div class="filter-section">
            <h4>Umkreis: ${state.filters.radius >= 50 ? '50+ km' : state.filters.radius + ' km'}</h4>
            <input type="range" class="range-slider" min="5" max="50" step="5" value="${state.filters.radius}" oninput="state.filters.radius=parseInt(this.value);render()">
            <div style="display:flex;justify-content:space-between;font-size:0.75rem;color:var(--gray-500)">
              <span>5 km</span><span>25 km</span><span>50+ km</span>
            </div>
          </div>

          <button class="btn btn-primary btn-block" onclick="recomputeDistancesAndRender()">Filter anwenden</button>
          <button class="btn btn-ghost btn-block" style="font-size:0.8rem;color:var(--gray-500);margin-top:0.25rem" onclick="state.filters={search:'',category:'',type:'',radius:50,hours:[],city:'',sort:'date',address:''};recomputeDistancesAndRender()">Filter zurücksetzen</button>
        </aside>

        ${loading ? skeletonJobGrid(6) : `
        <div class="jobs-grid">
          ${jobs.map(j => renderJobCard(j)).join('')}
          ${jobs.length === 0 ? `
            <div class="empty-state">
              <div class="empty-state-icon"></div>
              <h3>Keine Jobs gefunden</h3>
              <p>Versuche andere Filter oder erweitere deinen Suchradius.</p>
            </div>` : ''}
        </div>`}
      </div>
    </div>`;
}

function renderJobCard(j) {
  const saved = state.savedJobs.includes(j.id);
  return `
    <div class="job-card ${j.promoted ? 'promoted' : ''}" onclick="navigate('job-detail', {jobId: ${j.id}})">
      ${j.promoted ? '<div class="promoted-badge">&#9733; Hervorgehoben</div>' : ''}
      <div class="job-card-left">
        <div class="job-card-header">
          ${companyLogoHtml(j.companyLogo, j.company)}
          <div class="job-card-info">
            <h3>${escapeHtml(j.title)}</h3>
            <div class="job-company-name">${escapeHtml(j.company)}</div>
          </div>
        </div>
        <div class="job-card-meta">
          <span class="job-meta-item">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            ${escapeHtml(j.city)}${j.distance > 0 ? ' (' + j.distance + ' km)' : ''}
          </span>
          <span class="job-meta-item">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            ${escapeHtml(j.hours)}
          </span>
          <span class="job-meta-item">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
            ${escapeHtml(j.salary)}
          </span>
        </div>
        <div class="job-card-tags">
          <span class="badge badge-primary">${escapeHtml(j.type)}</span>
          ${j.tags.slice(0,3).map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('')}
        </div>
        <div class="job-card-date">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          ${formatDate(j.posted)}
        </div>
      </div>
      <div class="job-card-actions">
        <div class="job-stats">
          <div class="job-stat-row" title="Gespeicherte Jobs">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
            ${j.saves || 0}
          </div>
          <div class="job-stat-row" title="Aufrufe">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            ${j.views || 0}
          </div>
        </div>
        <button class="save-btn ${saved ? 'saved' : ''}" onclick="toggleSaveJob(${j.id}, event)" title="${saved ? 'Gespeichert' : 'Speichern'}" aria-label="${saved ? 'Job entfernen' : 'Job speichern'}" aria-pressed="${saved}">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="${saved ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
        </button>
      </div>
    </div>`;
}

// ===== JSON-LD (schema.org/JobPosting) für Google for Jobs =====
// Erzeugt strukturierte Daten speziell für Minijobs, Schülerjobs,
// Ferienjobs und Praktika. Ohne diese Auszeichnung erscheinen
// Stellenanzeigen NICHT in der Google-Jobs-Box.
function buildJobPostingSchema(job) {
  if (!job) return null;

  // Schema.org employmentType Mapping (Google-konform)
  // Minijob = geringfügige Beschäftigung → PART_TIME
  // Ferienjob = kurzfristige Beschäftigung → TEMPORARY
  // Praktikum → INTERN
  const employmentTypeMap = {
    'Minijob': ['PART_TIME'],
    'Ferienjob': ['TEMPORARY', 'PART_TIME'],
    'Praktikum': ['INTERN']
  };
  const employmentType = employmentTypeMap[job.type] || ['PART_TIME', 'CONTRACTOR'];

  // Datum: Google verlangt ISO-8601 für datePosted & validThrough
  const posted = job.date ? new Date(job.date) : new Date();
  const validThrough = job.expires
    ? new Date(job.expires)
    : new Date(posted.getTime() + 30 * 24 * 60 * 60 * 1000);

  // Minijob/Schülerjob-spezifischer Kontext für bessere Auffindbarkeit
  // (Google indexiert den Description-Text — diese Zusätze bringen
  //  Rankings für „Schülerjob", „Studentenjob", „Nebenjob" etc.)
  const typeContext = {
    'Minijob': 'Minijob / geringfügige Beschäftigung — bis 556 €/Monat steuerfrei. Perfekt als Schülerjob, Studentenjob oder Nebenjob mit flexiblen Arbeitszeiten.',
    'Ferienjob': 'Ferienjob / kurzfristige Beschäftigung — ideal für Schüler und Studenten in den Schulferien. Flexible Einsatzzeiten.',
    'Praktikum': 'Praktikumsstelle — ideal für Schüler, Studenten und Berufseinsteiger. Erste Berufserfahrung sammeln.'
  };
  const ctx = typeContext[job.type] || '';
  const rawDesc = (job.description || '').toString();
  const description = (rawDesc ? `<p>${rawDesc}</p>` : '') + (ctx ? `<p><em>${ctx}</em></p>` : '');

  // Ort: primär city, sonst erstes Segment der location
  const city = (job.city && job.city.trim())
    || ((job.location || '').split(',')[0] || '').trim()
    || 'Deutschland';

  const schema = {
    '@context': 'https://schema.org/',
    '@type': 'JobPosting',
    'title': job.title || `${job.type || 'Minijob'}${job.company ? ' bei ' + job.company : ''}`,
    'description': description || `<p>${job.type || 'Minijob'} bei ${job.company || 'einem Arbeitgeber'} in ${city}.</p>`,
    'identifier': {
      '@type': 'PropertyValue',
      'name': job.company || 'WorkPilot',
      'value': String(job.id)
    },
    'datePosted': posted.toISOString().slice(0, 10),
    'validThrough': validThrough.toISOString(),
    'employmentType': employmentType,
    'hiringOrganization': {
      '@type': 'Organization',
      'name': job.company || 'WorkPilot Partner'
    },
    'jobLocation': {
      '@type': 'Place',
      'address': {
        '@type': 'PostalAddress',
        'addressLocality': city,
        'addressCountry': 'DE'
      }
    },
    'directApply': true
  };

  if (job.companyInfo && job.companyInfo.website) {
    schema.hiringOrganization.sameAs = job.companyInfo.website;
  }
  if (job.category) {
    schema.industry = job.category;
    schema.occupationalCategory = job.category;
  }

  // Gehalt: job.salaryNum ist numerisch; Heuristik Stunden- vs. Monatslohn
  if (typeof job.salaryNum === 'number' && job.salaryNum > 0) {
    // < 50 → Stundenlohn (z. B. 13,50 €/h)
    // >= 50 → Monatslohn (z. B. 520 €/Monat)
    const unitText = job.salaryNum < 50 ? 'HOUR' : 'MONTH';
    schema.baseSalary = {
      '@type': 'MonetaryAmount',
      'currency': 'EUR',
      'value': {
        '@type': 'QuantitativeValue',
        'value': job.salaryNum,
        'unitText': unitText
      }
    };
  }

  // Jobvorteile — besonders relevant für Schüler/Studenten-Zielgruppe
  const benefits = [];
  if (job.type === 'Minijob') {
    benefits.push('Steuerfrei bis 556 €/Monat', 'Flexible Arbeitszeiten neben Schule/Studium', 'Ideal als Nebenjob');
  } else if (job.type === 'Ferienjob') {
    benefits.push('Ideal für die Schulferien', 'Kurzfristige Beschäftigung', 'Schnelle Einarbeitung');
  } else if (job.type === 'Praktikum') {
    benefits.push('Erste Berufserfahrung', 'Praxiseinblick', 'Netzwerk aufbauen');
  }
  if (benefits.length) schema.jobBenefits = benefits.join(', ');

  // URL der Stellenanzeige (Hash-Route, da SPA)
  if (typeof window !== 'undefined' && window.location) {
    schema.url = `${window.location.origin}${window.location.pathname}#job-${job.id}`;
  }

  return schema;
}

// Fügt das JSON-LD Script-Tag in den <head> ein (und entfernt ein
// vorhandenes zuerst). Wird `job` null übergeben, wird nur aufgeräumt.
function injectJobPostingSchema(job) {
  try {
    const prev = document.getElementById('jobposting-jsonld');
    if (prev) prev.remove();
    if (!job) return;
    const schema = buildJobPostingSchema(job);
    if (!schema) return;
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'jobposting-jsonld';
    // JSON.stringify escapt Anführungszeichen. Zusätzlich </ escapen,
    // damit kein Script-Tag im JSON den Parser bricht.
    script.textContent = JSON.stringify(schema).replace(/<\//g, '<\\/');
    document.head.appendChild(script);
  } catch (e) {
    console.warn('[injectJobPostingSchema]', e);
  }
}

// ===== Dynamische Meta-Tags pro Seite =====
// Google, Bing, Social-Media-Crawler lesen <title>, <meta description>,
// <link rel=canonical> und og:*-Tags. Wenn jede Seite die gleichen
// Werte hat, kann Google keine Unterseiten unterscheiden → schlechtes
// Ranking. Diese Funktion aktualisiert die Tags bei jedem render().
function _setMeta(selector, attr, value) {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement(selector.startsWith('link') ? 'link' : 'meta');
    // Attribut-Selektor "meta[name=foo]" → name="foo"
    const m = selector.match(/\[([^=]+)="([^"]+)"\]/);
    if (m) el.setAttribute(m[1], m[2]);
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
}

function updatePageMeta() {
  try {
    const page = state.currentPage;
    const origin = (typeof window !== 'undefined' && window.location) ? window.location.origin : '';
    const brand = 'WorkPilot';

    // Default-Werte (Landing)
    let title = `${brand} — Minijobs für Schüler & Studenten in deiner Nähe`;
    let description = 'WorkPilot verbindet junge Talente mit den besten Arbeitgebern. Finde deinen Minijob, Ferienjob oder Nebenjob in deiner Nähe — schnell, einfach, kostenlos.';
    let canonical = `${origin}/`;

    // Seite-spezifisch anpassen
    switch (page) {
      case 'jobs': {
        const f = state.filters || {};
        const parts = [];
        if (f.category) parts.push(f.category);
        if (f.type) parts.push(f.type);
        if (f.city || f.address) parts.push(`in ${f.city || f.address}`);
        const suffix = parts.length ? parts.join(' ') + ' — ' : '';
        title = `${suffix}Jobs finden | ${brand}`;
        description = `Finde ${f.type || 'Minijobs, Ferienjobs und Nebenjobs'}${f.category ? ' im Bereich ' + f.category : ''}${f.city || f.address ? ' in ' + (f.city || f.address) : ' in deiner Nähe'} — schnell, einfach, kostenlos.`;
        canonical = `${origin}/#jobs`;
        break;
      }
      case 'job-detail': {
        const jobId = state.pageData && state.pageData.jobId;
        const job = typeof JOBS !== 'undefined' ? JOBS.find(j => j.id === jobId) : null;
        if (job) {
          title = `${job.title} ${job.company ? 'bei ' + job.company : ''} ${job.location ? 'in ' + job.location : ''} | ${brand}`.replace(/\s+/g, ' ').trim();
          const descRaw = (job.description || '').replace(/\s+/g, ' ').trim();
          description = `${job.type || 'Minijob'}${job.company ? ' bei ' + job.company : ''}${job.location ? ' in ' + job.location : ''}${job.salary ? ' — ' + job.salary : ''}. ${descRaw.slice(0, 120)}${descRaw.length > 120 ? '…' : ''}`.trim();
          canonical = `${origin}/#job-${job.id}`;
        }
        break;
      }
      case 'employer-landing':
        title = `Für Arbeitgeber — Stellenanzeige kostenlos schalten | ${brand}`;
        description = 'Schalte kostenlos deine Stellenanzeige und finde motivierte Schüler, Studenten und Aushilfen in deiner Nähe.';
        canonical = `${origin}/#employer-landing`;
        break;
      case 'login':
        title = `Anmelden | ${brand}`;
        description = 'Melde dich bei WorkPilot an und entdecke Minijobs, Ferienjobs und Nebenjobs in deiner Nähe.';
        canonical = `${origin}/#login`;
        break;
      case 'register':
        title = `Kostenlos registrieren | ${brand}`;
        description = 'Erstelle kostenlos dein WorkPilot-Profil — als Schüler, Student oder Arbeitgeber. In 60 Sekunden startklar.';
        canonical = `${origin}/#register`;
        break;
      case 'cv-builder':
        title = `Lebenslauf-Builder | ${brand}`;
        description = 'Erstelle in wenigen Minuten einen professionellen Lebenslauf für deinen nächsten Schülerjob oder Nebenjob.';
        canonical = `${origin}/#cv-builder`;
        break;
      case 'impressum':
        title = `Impressum | ${brand}`;
        description = 'Impressum und Anbieterkennzeichnung von WorkPilot.';
        canonical = `${origin}/#impressum`;
        break;
      case 'datenschutz':
        title = `Datenschutz | ${brand}`;
        description = 'Datenschutzerklärung gemäß DSGVO von WorkPilot.';
        canonical = `${origin}/#datenschutz`;
        break;
      case 'agb':
        title = `AGB | ${brand}`;
        description = 'Allgemeine Geschäftsbedingungen für die Nutzung von WorkPilot.';
        canonical = `${origin}/#agb`;
        break;
    }

    // In Länge kappen (Google zeigt ~60/160 Zeichen)
    if (title.length > 65) title = title.slice(0, 62).trim() + '…';
    if (description.length > 160) description = description.slice(0, 157).trim() + '…';

    document.title = title;
    _setMeta('meta[name="description"]', 'content', description);
    _setMeta('link[rel="canonical"]', 'href', canonical);
    _setMeta('meta[property="og:title"]', 'content', title);
    _setMeta('meta[property="og:description"]', 'content', description);
    _setMeta('meta[property="og:url"]', 'content', canonical);
    _setMeta('meta[name="twitter:title"]', 'content', title);
    _setMeta('meta[name="twitter:description"]', 'content', description);
  } catch (e) {
    console.warn('[updatePageMeta]', e);
  }
}

function renderJobDetail() {
  const jobId = state.pageData?.jobId;
  const job = JOBS.find(j => j.id === jobId);
  if (!job) return '<div class="page"><p>Job nicht gefunden.</p></div>';

  const saved = state.savedJobs.includes(job.id);
  return `
    <div class="page">
      <button class="btn btn-ghost mb-2" onclick="navigate('jobs')">&#8592; Zurück zur Suche</button>
      <div class="job-detail-layout">
        <div class="job-detail-main">
          <div class="job-detail-header">
            <div style="display:flex;justify-content:space-between;align-items:start">
              <div>
                <h1>${escapeHtml(job.title)}</h1>
                <div class="job-detail-company">
                  ${companyLogoHtml(job.companyLogo, job.company, { style: 'width:40px;height:40px;' })}
                  <span style="font-weight:600">${escapeHtml(job.company)}</span>
                </div>
              </div>
              <div style="display:flex;gap:0.5rem;align-items:center">
                <button class="save-btn" onclick="shareJob(${job.id})" style="font-size:1.25rem;background:none;border:none;cursor:pointer;padding:0.35rem" aria-label="Job teilen" title="Job teilen">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                </button>
                <button class="save-btn ${saved ? 'saved' : ''}" onclick="toggleSaveJob(${job.id})" style="font-size:1.5rem" aria-label="${saved ? 'Job entfernen' : 'Job speichern'}" aria-pressed="${saved}"><span aria-hidden="true">${saved ? '♥' : '♡'}</span></button>
              </div>
            </div>
            <div class="job-detail-badges">
              <span class="badge badge-primary">${escapeHtml(job.type)}</span>
              <span class="badge badge-gray">${escapeHtml(job.location)}</span>
              <span class="badge badge-gray">${escapeHtml(job.hours)}</span>
              <span class="badge badge-success">${escapeHtml(job.salary)}</span>
            </div>
            <div style="margin-top:1rem;display:flex;gap:1.5rem;font-size:0.8rem;color:var(--gray-500)">
              <span>Hochgeladen: ${formatDate(job.posted)}</span>
              <span>${job.views} Aufrufe</span>
              <span>${job.clicks} Klicks</span>
              <span>${job.applications} Bewerbungen</span>
            </div>
          </div>
          <div class="job-detail-body">
            ${escapeHtml(job.description)}
          </div>
          ${job.images.length > 0 ? `
            <div style="padding:0 2rem 2rem">
              <h2 style="font-size:1.05rem;margin-bottom:0.75rem;font-weight:600">Bilder</h2>
              <div class="job-images">
                ${job.images.map((img, i) => `<img src="${img}" alt="Eindruck vom Arbeitsplatz (${i+1} von ${job.images.length})" class="job-image-placeholder" style="object-fit:cover;width:100%;height:auto" loading="lazy">`).join('')}
              </div>
            </div>` : ''}
          <div style="padding:0 2rem 2rem">
            <h2 style="font-size:1.05rem;margin-bottom:0.75rem;font-weight:600"><span aria-hidden="true">★</span> Bewertungen</h2>
            ${job.reviews.length > 0 ? job.reviews.map(r => `
              <div class="review-card">
                <div class="review-header">
                  <div class="review-author">
                    <div class="user-avatar" style="width:32px;height:32px;font-size:0.7rem">${r.author.split(' ').map(n=>n[0]).join('')}</div>
                    <div>
                      <strong style="font-size:0.85rem">${escapeHtml(r.author)}</strong>
                      ${r.active ? '<span class="badge badge-success" style="margin-left:0.5rem;font-size:0.7rem">Aktiv beschäftigt</span>' : ''}
                    </div>
                  </div>
                  <div class="stars">${'<span class="star filled">&#9733;</span>'.repeat(r.rating)}${'<span class="star">&#9734;</span>'.repeat(5-r.rating)}</div>
                </div>
                <div class="review-text">${escapeHtml(r.text)}</div>
                <div class="review-date">${formatDate(r.date)}</div>
              </div>
            `).join('') : '<p style="font-size:0.85rem;color:var(--gray-500);margin-bottom:1rem">Noch keine Bewertungen.</p>'}
          </div>
        </div>

        <div class="job-detail-sidebar">
          <div class="card">
            <div class="card-body">
              ${(() => {
                // Nur echte Worker duerfen bewerben (nicht Admin/Employer).
                const isWorker = state.user && state.user.role === 'worker';
                const isOwnJob = state.user && job.employerId === state.user.id;
                const jobInactive = job.active === false;
                const alreadyApplied = isWorker && getUserApps().includes(job.id);
                const hasActiveJob = isWorker && getActiveJob();
                const maxApps = isWorker && !alreadyApplied && getPendingAppCount() >= 3;
                const disabled = isOwnJob || jobInactive || alreadyApplied || hasActiveJob || maxApps;
                const label =
                  isOwnJob ? 'Eigene Stelle' :
                  jobInactive ? 'Nicht mehr aktiv' :
                  !state.user ? 'Anmelden zum Bewerben' :
                  !isWorker ? 'Nur für Arbeitnehmer' :
                  alreadyApplied ? '✓ Beworben' :
                  hasActiveJob ? 'Du hast bereits einen aktiven Job' :
                  maxApps ? 'Max. 3 Bewerbungen erreicht' :
                  'Jetzt bewerben';
                const action = !state.user ? `navigate('login')` : `submitApplication(${job.id})`;
                return `<button class="btn btn-primary btn-block btn-lg" id="apply-btn-${job.id}" onclick="${action}" ${disabled ? 'disabled style="opacity:0.6;cursor:not-allowed"' : ''}>${label}</button>`;
              })()}

              <div style="margin-top:1.5rem">
                <h2 style="font-size:1rem;margin-bottom:1rem;font-weight:600">Über ${escapeHtml(job.company)}</h2>
                <p style="font-size:0.85rem;color:var(--gray-600);margin-bottom:1rem">${escapeHtml(job.companyInfo.about)}</p>
                <div style="display:flex;flex-direction:column;gap:0.5rem">
                  <div class="company-info-row"><span class="label">Branche:</span> <span>${escapeHtml(job.companyInfo.industry)}</span></div>
                  <div class="company-info-row"><span class="label">Mitarbeiter:</span> <span>${escapeHtml(job.companyInfo.employees)}</span></div>
                  <div class="company-info-row"><span class="label">Gegründet:</span> <span>${escapeHtml(job.companyInfo.founded)}</span></div>
                  <div class="company-info-row"><span class="label">Website:</span> <span style="color:var(--primary)">${escapeHtml(job.companyInfo.website)}</span></div>
                  <div class="company-info-row"><span class="label">Adresse:</span> <span>${escapeHtml(job.location)}</span></div>
                </div>
              </div>

              <div style="margin-top:1.5rem;padding-top:1rem;border-top:1px solid var(--gray-200)">
                <div style="font-size:0.8rem;color:var(--gray-500)">
                  <div>Anzeige läuft bis: ${new Date(job.expires).toLocaleDateString('de-DE')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>`;
}

function renderLogin() {
  return `
    <div class="auth-page">
      <div class="auth-card fade-in">
        <h2>Willkommen zurück!</h2>
        <p class="subtitle">Melde dich an, um fortzufahren.</p>
        <form onsubmit="event.preventDefault(); login(this.email.value, this.password.value)">
          <div class="form-group">
            <label class="form-label">E-Mail</label>
            <input type="email" name="email" class="form-input" placeholder="deine@email.de" required>
          </div>
          <div class="form-group">
            <label class="form-label">Passwort</label>
            <input type="password" name="password" class="form-input" placeholder="Dein Passwort" required>
          </div>
          <div id="login-error" style="display:none;background:#fef2f2;border:1px solid #fca5a5;color:#dc2626;border-radius:8px;padding:0.6rem 0.9rem;font-size:0.85rem;margin-bottom:0.75rem"></div>
          <button type="submit" class="btn btn-primary btn-block btn-lg">Anmelden</button>
        </form>
        <p style="text-align:center;font-size:0.85rem;margin-top:0.75rem">
          <a href="#" onclick="event.preventDefault();showForgotPassword()" style="color:var(--gray-600)">Passwort vergessen?</a>
        </p>
        <div class="auth-divider">oder</div>
        <p style="text-align:center;font-size:0.9rem">Noch kein Konto? <a href="#" onclick="navigate('register')" style="color:var(--primary);font-weight:600">Jetzt registrieren</a></p>
      </div>
    </div>`;
}

function renderRegister() {
  return `
    <div class="auth-page">
      <div class="auth-card fade-in">
        <h2>Konto erstellen</h2>
        <p class="subtitle">Registriere dich kostenlos und leg los.</p>
        <form onsubmit="event.preventDefault(); submitRegister(this)">
          <div class="form-group">
            <label class="form-label">Ich bin...</label>
            <div class="role-selector">
              <div class="role-option selected" onclick="selectRole(this, 'worker')" data-role="worker">
                <div class="role-icon">&#9786;</div>
                <div class="role-name">Arbeitnehmer</div>
                <div style="font-size:0.75rem;color:var(--gray-500)">Ich suche einen Job</div>
              </div>
              <div class="role-option" onclick="selectRole(this, 'employer')" data-role="employer">
                <div class="role-icon">&#9962;</div>
                <div class="role-name">Arbeitgeber</div>
                <div style="font-size:0.75rem;color:var(--gray-500)">Ich suche Mitarbeiter</div>
              </div>
            </div>
            <input type="hidden" name="role" value="worker">
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Vorname</label>
              <input type="text" name="firstName" class="form-input" placeholder="Max" required>
            </div>
            <div class="form-group">
              <label class="form-label">Nachname</label>
              <input type="text" name="lastName" class="form-input" placeholder="Mustermann" required>
            </div>
          </div>
          <div class="form-group employer-field" style="display:none">
            <label class="form-label">Firmenname</label>
            <input type="text" name="company" class="form-input" placeholder="z.B. MediaMarkt GmbH">
          </div>
          <div class="form-group">
            <label class="form-label">E-Mail</label>
            <input type="email" name="email" class="form-input" placeholder="deine@email.de" required>
          </div>
          <div class="form-group">
            <label class="form-label">Passwort</label>
            <input type="password" name="password" class="form-input" placeholder="Min. 8 Zeichen" required minlength="8">
          </div>
          <div id="register-error" style="display:none;color:var(--danger);font-size:0.85rem;margin-bottom:0.75rem"></div>
          ${window.HCAPTCHA_SITE_KEY ? `<div class="h-captcha" data-sitekey="${escapeAttr(window.HCAPTCHA_SITE_KEY)}" style="margin-bottom:1rem;display:flex;justify-content:center"></div>` : ''}
          <button type="submit" class="btn btn-primary btn-block btn-lg">Kostenlos registrieren</button>
        </form>
        <p style="text-align:center;font-size:0.85rem;margin-top:1rem;color:var(--gray-500)">Bereits registriert? <a href="#" onclick="navigate('login')" style="color:var(--primary);font-weight:600">Anmelden</a></p>
      </div>
    </div>`;
}

function selectRole(el, role) {
  document.querySelectorAll('.role-option').forEach(o => o.classList.remove('selected'));
  el.classList.add('selected');
  document.querySelector('input[name="role"]').value = role;
  const companyField = document.querySelector('.employer-field');
  if (companyField) {
    companyField.style.display = role === 'employer' ? 'block' : 'none';
    companyField.querySelector('input').required = role === 'employer';
  }
}

function submitRegister(form) {
  const data = {
    role: form.role.value,
    name: form.firstName.value + ' ' + form.lastName.value,
    email: form.email.value,
    password: form.password.value
  };
  if (data.role === 'employer') {
    data.company = form.company.value;
  }
  // Wenn hCaptcha aktiviert ist, Token vom Widget abholen
  if (window.HCAPTCHA_SITE_KEY && window.hcaptcha) {
    try {
      const token = window.hcaptcha.getResponse();
      if (!token) {
        const err = document.getElementById('register-error');
        if (err) { err.textContent = 'Bitte löse das CAPTCHA.'; err.style.display = 'block'; }
        return;
      }
      data.captchaToken = token;
    } catch (e) { console.error('[hcaptcha]', e); }
  }
  register(data);
}

// ===== WORKER PAGES =====

function getProfileSteps() {
  const u = state.user || {};
  return [
    { key: 'registered', label: 'Konto erstellt',          done: true,                           pct: 10, page: null,             section: null },
    { key: 'address',    label: 'Adresse & Umkreis',        done: !!u.address,                    pct: 15, page: 'worker-profile',  section: 'section-address' },
    { key: 'cv',         label: 'Lebenslauf hochladen',     done: !!u.cvUploaded,                 pct: 20, page: 'worker-profile',  section: 'section-cv' },
    { key: 'documents',  label: 'Zeugnis hochladen',        done: !!u.docsUploaded,               pct: 15, page: 'worker-profile',  section: 'section-docs' },
    { key: 'skills',     label: 'Stärken auswählen',        done: !!(u.skills && u.skills.length),pct: 15, page: 'worker-profile',  section: 'section-skills' },
    { key: 'refs',       label: 'Berufserfahrung angeben',  done: !!(u.refs   && u.refs.length),  pct: 15, page: 'worker-profile',  section: 'section-skills' },
    { key: 'hours',      label: 'Wochenstunden angeben',    done: !!u.weeklyHours,                pct: 10, page: 'worker-profile',  section: 'section-skills' },
  ];
}

function calcProfilePct() {
  return getProfileSteps().filter(s => s.done).reduce((sum, s) => sum + s.pct, 0);
}

function renderWorkerDashboard() {
  if (!state.user) return renderLogin();
  const steps   = getProfileSteps();
  const pct     = calcProfilePct();
  const todo    = steps.filter(s => !s.done);
  const msgs    = WORKER_CHAT_MESSAGES.slice(0, 3);
  const saved   = JOBS.filter(j => state.savedJobs.includes(j.id)).slice(0, 3);

  const pctColor = pct < 40 ? 'var(--danger)' : pct < 75 ? '#f59e0b' : 'var(--success)';
  const pctLabel = pct === 100 ? '🎉 Perfektes Profil!' : pct >= 75 ? 'Fast fertig!' : pct >= 40 ? 'Gut unterwegs' : 'Gerade gestartet';

  return `
    <div class="page">
      <div class="dashboard-layout">
        ${renderWorkerSidebar('dashboard')}
        <div class="dashboard-content">

          <h2 class="dashboard-title">Hallo, ${escapeHtml(state.user.name?.split(' ')[0])}!</h2>

          <!-- ── Aktiver Job Banner ── -->
          ${(() => {
            const activeJob = getActiveJob();
            if (!activeJob) return '';
            const job = JOBS.find(j => j.id === activeJob.jobId);
            const daysSince = Math.floor((Date.now() - new Date(activeJob.acceptedAt).getTime()) / 86400000);
            return `
            <div class="card" style="margin-bottom:1.5rem;border:2px solid var(--success);background:linear-gradient(135deg,#f0fdf4,#dcfce7)">
              <div class="card-body" style="display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap">
                <div style="display:flex;align-items:center;gap:1rem">
                  <div style="width:48px;height:48px;border-radius:12px;background:var(--success);color:#fff;display:flex;align-items:center;justify-content:center;font-size:1.5rem;flex-shrink:0">
                    ${job?.companyLogo && !job.companyLogo.startsWith('data:') ? job.companyLogo : '💼'}
                  </div>
                  <div>
                    <div style="font-size:0.75rem;font-weight:600;color:var(--success);text-transform:uppercase;letter-spacing:0.05em">Aktiver Job</div>
                    <div style="font-size:1.1rem;font-weight:700;color:var(--gray-900)">${escapeHtml(activeJob.jobTitle)}</div>
                    <div style="font-size:0.85rem;color:var(--gray-500)">${escapeHtml(activeJob.jobCompany)} · Seit ${daysSince} ${daysSince === 1 ? 'Tag' : 'Tagen'}</div>
                  </div>
                </div>
                <div style="display:flex;gap:0.5rem;flex-shrink:0">
                  ${job ? `<button class="btn btn-sm btn-outline" onclick="navigate('job-detail',{jobId:${job.id}})">Details</button>` : ''}
                  <button class="btn btn-sm btn-primary" style="background:var(--danger);border-color:var(--danger)" onclick="if(confirm('Möchtest du diesen Job wirklich beenden?')) endActiveJob()">Job beenden</button>
                </div>
              </div>
            </div>`;
          })()}

          <!-- ── 3 Schnell-Kacheln ── -->
          <div class="worker-dash-grid">

            <!-- Nachrichten -->
            <div class="worker-dash-tile" onclick="navigate('messages')">
              <div class="wdt-header">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                <span>Nachrichten</span>
                <span class="wdt-badge">${msgs.length}</span>
              </div>
              ${msgs.length > 0 ? msgs.map(m => `
                <div class="wdt-msg-row">
                  <div class="wdt-msg-avatar">${m.partnerInitials}</div>
                  <div class="wdt-msg-info">
                    <div class="wdt-msg-name">${escapeHtml(m.partnerName)}</div>
                    <div class="wdt-msg-preview">${escapeHtml(m.messages[m.messages.length-1]?.text?.slice(0,45) || '')}…</div>
                  </div>
                </div>`).join('') : `<p class="wdt-empty">Noch keine Nachrichten</p>`}
              <div class="wdt-link">Alle Nachrichten →</div>
            </div>

            <!-- Gespeicherte Jobs -->
            <div class="worker-dash-tile" onclick="navigate('saved-jobs')">
              <div class="wdt-header">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                <span>Gespeicherte Jobs</span>
                <span class="wdt-badge">${state.savedJobs.length}</span>
              </div>
              ${saved.length > 0 ? saved.map(j => `
                <div class="wdt-job-row" onclick="event.stopPropagation();navigate('job-detail',{jobId:${j.id}})">
                  <div class="wdt-job-logo">${escapeHtml(j.company?.[0])}</div>
                  <div class="wdt-job-info">
                    <div class="wdt-job-title">${escapeHtml(j.title)}</div>
                    <div class="wdt-job-company">${escapeHtml(j.company)} · ${escapeHtml(j.city)}</div>
                  </div>
                </div>`).join('') : `<p class="wdt-empty">Noch keine Jobs gespeichert</p>`}
              <div class="wdt-link">Alle gespeicherten Jobs →</div>
            </div>

            <!-- Lebenslauf -->
            <div class="worker-dash-tile">
              <div class="wdt-header">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                <span>Lebenslauf</span>
                ${state.user.cvUploaded ? '<span class="wdt-badge wdt-badge-green">Hochgeladen</span>' : '<span class="wdt-badge wdt-badge-warn">Fehlt noch</span>'}
              </div>
              <p class="wdt-cv-hint">${state.user.cvUploaded ? 'Dein Lebenslauf ist für Arbeitgeber sichtbar.' : 'Lade deinen Lebenslauf hoch damit Arbeitgeber dich finden.'}</p>
              <div style="display:flex;gap:0.5rem;flex-direction:column;margin-top:0.75rem">
                <button class="btn btn-primary btn-sm" onclick="event.stopPropagation();navigate('cv-builder')">
                  ${state.user.cvUploaded ? 'Lebenslauf bearbeiten' : 'Lebenslauf erstellen'}
                </button>
                <label class="btn btn-outline btn-sm" style="cursor:pointer;text-align:center">
                  PDF hochladen
                  <input type="file" accept=".pdf,.doc,.docx" style="display:none" onchange="uploadCV(this)">
                </label>
              </div>
            </div>

          </div>

          <!-- ── Profil-Fortschritt (unten, dezent) ── -->
          ${todo.length > 0 ? `
          <div class="profile-progress-card">
            <div class="pprogress-bar-row" style="margin-bottom:0.75rem">
              <div class="pprogress-title" style="flex:1">Profil vervollständigen</div>
              <span class="pprogress-pct-small" style="color:${pctColor}">${pct}%</span>
            </div>
            <div class="progress-bar" style="height:5px;margin-bottom:0.85rem">
              <div class="progress-fill" style="width:${pct}%;background:${pctColor};transition:width 0.5s"></div>
            </div>
            <div class="pprogress-steps-row">
              ${todo.map(s => `
                <div class="pprogress-step-pill" onclick="${s.page ? `navigateToSection('${s.page}','${s.section||''}')` : ''}">
                  <span class="pprogress-step-dot"></span>
                  <span>${s.label}</span>
                  <span class="pprogress-step-pct">+${s.pct}%</span>
                </div>`).join('')}
            </div>
          </div>` : `
          <div class="profile-progress-card" style="display:flex;align-items:center;gap:0.75rem">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--success)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            <span style="font-size:0.85rem;color:var(--success);font-weight:600">Perfektes Profil – du bekommst die besten Jobangebote!</span>
            <span class="pprogress-pct-small" style="color:${pctColor};margin-left:auto">${pct}%</span>
          </div>`}

        </div>
      </div>
    </div>`;
}

async function uploadCV(input) {
  if (!input.files.length || !state.user || !window.DB) return;
  const fileName = input.files[0].name;
  state.user.cvUploaded = true;
  state.user.cvFileName = fileName;
  try {
    await DB.updateProfile(state.user.id, { cv_uploaded: true, cv_file_name: fileName });
    showToast('Lebenslauf erfolgreich hochgeladen!');
  } catch (e) {
    console.error('[uploadCV]', e);
    showToast('Upload konnte nicht gespeichert werden.', 'error');
  }
  render();
}

function addRef() {
  const name = prompt('Arbeitgeber & Position (z.B. Rewe – Kassierer/in):');
  if (!name || !name.trim()) return;
  if (!state.user.refs) state.user.refs = [];
  state.user.refs.push(name.trim());
  state.user.hasRefs = true;
  render();
  setTimeout(() => navigateToSection('worker-profile', 'section-skills'), 10);
}

function removeRef(i) {
  state.user.refs.splice(i, 1);
  if (!state.user.refs.length) state.user.hasRefs = false;
  render();
  setTimeout(() => navigateToSection('worker-profile', 'section-skills'), 10);
}

function renderWorkerSidebar(active) {
  return `
    <div class="dashboard-sidebar">
      <nav class="sidebar-nav">
        <a href="#" class="${active==='dashboard'?'active':''}" onclick="navigate('worker-dashboard')">Dashboard</a>
        <a href="#" class="${active==='profile-view'?'active':''}" onclick="navigate('worker-profile-view')">Mein Profil</a>
        <a href="#" class="${active==='saved'?'active':''}" onclick="navigate('saved-jobs')">Gespeicherte Jobs</a>
        <a href="#" class="${active==='applications'?'active':''}" onclick="navigate('applications')">Bewerbungen</a>
        <a href="#" class="${active==='cv'?'active':''}" onclick="navigate('cv-builder')">Lebenslauf</a>
        <div class="divider"></div>
        <a href="#" class="${active==='messages'?'active':''}" onclick="navigate('messages')">Nachrichten</a>
        <a href="#" class="${active==='reviews'?'active':''}" onclick="navigate('reviews')">Bewertungen</a>
      </nav>
      <div class="divider" style="margin:0.25rem 0"></div>
      <nav class="sidebar-nav">
        <a href="#" class="${active==='support'?'active':''}" onclick="navigate('support')" style="font-size:0.82rem;opacity:0.6">Support</a>
      </nav>
    </div>`;
}

function renderWorkerProfileView() {
  if (!state.sessionLoaded) {
    // Sidebar-Platzhalter + Profil-Skeleton
    return `
      <div class="page">
        <div class="dashboard-layout">
          ${renderWorkerSidebar('profile-view')}
          <div class="dashboard-content">${skeletonProfilePage()}</div>
        </div>
      </div>`;
  }
  if (!state.user) return renderLogin();
  if (state._profileRefreshing) {
    return `
      <div class="page">
        <div class="dashboard-layout">
          ${renderWorkerSidebar('profile-view')}
          <div class="dashboard-content">${skeletonProfilePage()}</div>
        </div>
      </div>`;
  }
  const u = state.user;
  const pct = calcProfilePct();
  const pctColor = pct < 40 ? 'var(--danger)' : pct < 75 ? '#f59e0b' : 'var(--success)';

  // Platzhalter-Daten wenn noch nicht ausgefüllt
  const address   = u.address    || null;
  const radius    = u.radius     || 15;
  const hours     = u.weeklyHours|| null;
  const skills    = u.skills     || [];
  const refs      = u.refs       || [];

  const missingTag = (label, step) =>
    `<span class="pv-missing-chip" onclick="state.profileStep=${step};navigate('worker-profile')">+ ${label} hinzufügen</span>`;

  return `
    <div class="page">
      <div class="dashboard-layout">
        ${renderWorkerSidebar('profile-view')}
        <div class="dashboard-content">

          <!-- Hinweis-Banner -->
          <div class="pv-banner">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            So sieht dein Profil für Arbeitgeber aus
            <button class="btn btn-sm btn-outline" style="margin-left:auto" onclick="state.profileStep=0;navigate('worker-profile')">
              Profil bearbeiten
            </button>
          </div>

          <!-- Arbeitgeber-Ansicht: Profil-Karte -->
          <div class="employer-profile-card">

            <!-- Kopfbereich -->
            <div class="epc-header">
              <div class="epc-avatar">${escapeHtml(u.name?.split(' ').map(n=>n[0]).join(''))}</div>
              <div class="epc-info">
                <h2 class="epc-name">${escapeHtml(u.name)}</h2>
                <div class="epc-meta-row">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  ${escapeHtml(u.email)}
                </div>
                ${address ? `
                <div class="epc-meta-row">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  ${escapeHtml(address)}
                </div>
                <div class="epc-meta-row">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                  Arbeitsumkreis: ${radius} km
                </div>` : missingTag('Adresse & Umkreis', 0)}
                ${hours ? `
                <div class="epc-meta-row">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  Verfügbar: ${hours}
                </div>` : missingTag('Wochenstunden', 3)}
              </div>
              <!-- Vollständigkeit -->
              <div class="epc-completeness">
                <div class="epc-pct" style="color:${pctColor}">${pct}%</div>
                <div class="progress-bar" style="height:4px;width:64px">
                  <div class="progress-fill" style="width:${pct}%;background:${pctColor}"></div>
                </div>
                <div style="font-size:0.68rem;color:var(--gray-500);margin-top:0.2rem">vollständig</div>
              </div>
            </div>

            <div class="epc-divider"></div>

            <!-- Skills -->
            <div class="epc-section">
              <div class="epc-section-title">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                Stärken
              </div>
              <div class="epc-skills">
                ${skills.length
                  ? skills.map(s => `<span class="epc-skill-tag">${s}</span>`).join('')
                  : missingTag('Skills', 3)}
              </div>
            </div>

            <div class="epc-divider"></div>

            <!-- Berufserfahrung -->
            <div class="epc-section">
              <div class="epc-section-title">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-4 0v2"/><path d="M8 7V5a2 2 0 0 1 4 0v2"/></svg>
                Berufserfahrung
              </div>
              ${refs.length ? `
              <div class="epc-refs">
                ${refs.map(r => `
                  <div class="epc-ref-item">
                    <div class="epc-ref-dot"></div>
                    <span>${escapeHtml(r)}</span>
                  </div>`).join('')}
              </div>` : missingTag('Referenzen', 3)}
            </div>

            <div class="epc-divider"></div>

            <!-- Dokumente -->
            <div class="epc-section">
              <div class="epc-section-title">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                Dokumente
              </div>
              <div class="epc-docs">
                <div class="epc-doc-row ${u.cvUploaded ? 'ok' : 'missing'}">
                  ${u.cvUploaded
                    ? `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--success)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                       <span>${escapeHtml(u.cvFileName || 'Lebenslauf')}</span>`
                    : `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--gray-300)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                       <span>Kein Lebenslauf</span>
                       <button class="pv-edit-btn" onclick="state.profileStep=1;navigate('worker-profile')">Hochladen</button>`}
                </div>
                <div class="epc-doc-row ${u.docsUploaded ? 'ok' : 'missing'}">
                  ${u.docsUploaded
                    ? `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--success)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                       <span>Zeugnis hochgeladen</span>`
                    : `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--gray-300)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                       <span>Kein Zeugnis</span>
                       <button class="pv-edit-btn" onclick="state.profileStep=2;navigate('worker-profile')">Hochladen</button>`}
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>`;
}

const PROFILE_STEPS = [
  { id: 'section-address', label: 'Adresse' },
  { id: 'section-cv',      label: 'Lebenslauf' },
  { id: 'section-docs',    label: 'Zeugnisse' },
  { id: 'section-skills',  label: 'Skills' },
];

function renderWorkerProfile() {
  if (!state.user) return renderLogin();
  if (state.profileStep === undefined) state.profileStep = 0;
  const step = state.profileStep;
  const total = PROFILE_STEPS.length;
  const u = state.user;

  // Bestehende Freitext-Adresse heuristisch zerlegen, damit User die
  // ihre Adresse schon mal gespeichert haben die 3 Felder vorbelegt sehen.
  const parsedAddr = parseAddressParts(u.address || '');
  const streetInit = u.street || parsedAddr.street;
  const plzInit    = u.plz    || parsedAddr.plz;
  const cityInit   = u.city   || parsedAddr.city;

  const stepContent = [
    // ── Schritt 0: Adresse ──
    `<h3 class="profile-step-title">Adresse & Umkreis</h3>
    <p class="profile-step-hint">Damit wir dir passende Jobs in deiner Nähe zeigen können. Straße und PLZ sind <strong>Pflicht</strong> für genaue Entfernungsberechnung.</p>
    <div class="form-group">
      <label class="form-label" for="ps-street">Straße & Hausnummer *</label>
      <input type="text" id="ps-street" class="form-input" placeholder="Musterstraße 1" value="${escapeAttr(streetInit)}" required>
    </div>
    <div style="display:grid;grid-template-columns:120px 1fr;gap:0.75rem">
      <div class="form-group">
        <label class="form-label" for="ps-plz">PLZ *</label>
        <input type="text" id="ps-plz" class="form-input" placeholder="12345" inputmode="numeric" pattern="\\d{5}" maxlength="5" value="${escapeAttr(plzInit)}" required>
      </div>
      <div class="form-group">
        <label class="form-label" for="ps-city">Stadt *</label>
        <input type="text" id="ps-city" class="form-input" placeholder="Berlin" value="${escapeAttr(cityInit)}" required>
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Suchradius: <strong id="radius-label">${u.radius || 15} km</strong></label>
      <input type="range" class="range-slider" min="5" max="50" step="5" value="${u.radius || 15}"
        oninput="document.getElementById('radius-label').textContent=this.value+' km'">
      <div style="display:flex;justify-content:space-between;font-size:0.75rem;color:var(--gray-500);margin-top:0.25rem">
        <span>5 km</span><span>25 km</span><span>50 km</span>
      </div>
    </div>`,

    // ── Schritt 1: Lebenslauf ──
    `<h3 class="profile-step-title">Lebenslauf</h3>
    <p class="profile-step-hint">Arbeitgeber sehen deinen Lebenslauf direkt bei deiner Bewerbung.</p>
    ${u.cvUploaded ? `
      <div class="upload-success-bar">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--success)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        <span>${escapeHtml(u.cvFileName || 'Lebenslauf hochgeladen')}</span>
        <button class="btn btn-sm btn-outline" style="margin-left:auto" onclick="state.user.cvUploaded=false;render()">Entfernen</button>
      </div>
      <p style="margin-top:1rem;font-size:0.85rem;color:var(--gray-500);text-align:center">
        <a href="#" onclick="navigate('cv-builder')" style="color:var(--primary);font-weight:600">Mit dem Builder bearbeiten</a>
      </p>` : `
      <div class="cv-upload-area">
        <div class="cv-upload-option">
          <label class="cv-upload-btn" style="cursor:pointer">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            <span>PDF hochladen</span>
            <small>PDF oder DOC, max. 5 MB</small>
            <input type="file" accept=".pdf,.doc,.docx" style="display:none" onchange="uploadCV(this)">
          </label>
        </div>
        <div class="cv-upload-divider">oder</div>
        <div class="cv-upload-option">
          <button class="cv-upload-btn" onclick="navigate('cv-builder')">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            <span>Mit Builder erstellen</span>
            <small>Vorlage ausfüllen & fertig</small>
          </button>
        </div>
      </div>`}`,

    // ── Schritt 2: Zeugnisse ──
    `<h3 class="profile-step-title">Zeugnisse & Zertifikate</h3>
    <p class="profile-step-hint">Lade Schulzeugnisse oder andere Nachweise hoch.</p>
    ${u.docsUploaded ? `
      <div class="upload-success-bar">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--success)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        <span>Dokument hochgeladen</span>
        <button class="btn btn-sm btn-outline" style="margin-left:auto" onclick="state.user.docsUploaded=false;render()">Entfernen</button>
      </div>` : `
      <div class="cv-upload-area">
        <div class="cv-upload-option">
          <label class="cv-upload-btn" style="cursor:pointer">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            <span>Datei hochladen</span>
            <small>PDF, JPG oder PNG</small>
            <input type="file" accept=".pdf,.jpg,.jpeg,.png" multiple style="display:none" onchange="docScanned(this)">
          </label>
        </div>
        <div class="cv-upload-divider">oder</div>
        <div class="cv-upload-option">
          <label class="cv-upload-btn" style="cursor:pointer">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            <span>Mit Kamera scannen</span>
            <small>Direkt fotografieren</small>
            <input type="file" accept="image/*" capture="environment" style="display:none" onchange="docScanned(this)">
          </label>
        </div>
      </div>`}`,

    // ── Schritt 3: Skills ──
    `<h3 class="profile-step-title">Skills & Referenzen</h3>
    <p class="profile-step-hint">Zeig Arbeitgebern deine Stärken und bisherigen Erfahrungen.</p>
    <div class="form-group">
      <label class="form-label">Deine Top-3 Stärken <span style="color:var(--gray-500);font-weight:400;font-size:0.8rem">(max. 3 wählbar)</span></label>
      <div class="checkbox-group">
        ${SKILLS.map(s => `<label class="checkbox-label"><input type="checkbox" ${u.skills?.includes(s)?'checked':''} onchange="limitSkills(this,3)"> <span>${s}</span></label>`).join('')}
      </div>
    </div>
    <div class="form-group" style="margin-top:1.25rem">
      <label class="form-label">Bisherige Jobs / Referenzen</label>
      <div id="refs-list">
        ${(u.refs||[]).map((r,i) => `
          <div style="display:flex;align-items:center;gap:0.5rem;padding:0.55rem 0.75rem;background:var(--gray-50);border-radius:8px;margin-bottom:0.4rem;font-size:0.88rem">
            <span style="flex:1">${escapeHtml(r)}</span>
            <button class="btn btn-sm btn-ghost" onclick="removeRef(${i})">✕</button>
          </div>`).join('')}
      </div>
      <button class="btn btn-outline btn-sm" onclick="addRef()">+ Referenz hinzufügen</button>
    </div>
    <div class="form-group" style="margin-top:1.25rem">
      <label class="form-label">Wochenstunden</label>
      <select class="form-select" id="ps-hours">
        ${['5–10 Std', '10–15 Std', '15–20 Std', '20+ Std'].map(h => `<option ${u.weeklyHours===h?'selected':''}>${h}</option>`).join('')}
      </select>
    </div>`
  ][step];

  return `
    <div class="page">
      <div class="dashboard-layout">
        ${renderWorkerSidebar('profile')}
        <div class="dashboard-content">

          <div class="profile-header-card">
            <div class="profile-avatar">${escapeHtml((u.name||'').split(' ').map(n=>n[0]).join(''))}</div>
            <div class="profile-info">
              <h2>${escapeHtml(u.name)}</h2>
              <p>${escapeHtml(u.email)}</p>
            </div>
          </div>

          <!-- Schritt-Indikatoren -->
          <div class="profile-step-indicators">
            ${PROFILE_STEPS.map((s,i) => `
              <div class="psi-item ${i===step?'active':''} ${i<step?'done':''}" onclick="gotoProfileStep(${i})">
                <div class="psi-dot">
                  ${i < step
                    ? `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`
                    : i+1}
                </div>
                <span class="psi-label">${s.label}</span>
              </div>
              ${i < PROFILE_STEPS.length-1 ? '<div class="psi-line '+(i<step?'done':'')+'"></div>' : ''}`
            ).join('')}
          </div>

          <!-- Aktiver Schritt -->
          <div class="profile-step-card">
            ${stepContent}
          </div>

          <!-- Navigation -->
          <div class="profile-step-nav">
            ${step > 0
              ? `<button class="btn btn-outline" onclick="gotoProfileStep(Math.max(0,state.profileStep-1))">← Zurück</button>`
              : `<button class="btn btn-outline" onclick="navigate('worker-dashboard')">← Dashboard</button>`}
            ${step < total-1
              ? `<button class="btn btn-primary" onclick="nextProfileStep()">Weiter →</button>`
              : `<button class="btn btn-primary" onclick="finishProfileSetup()">✓ Profil speichern</button>`}
          </div>

        </div>
      </div>
    </div>`;
}

// Zerlegt einen Freitext wie "Musterstr. 1, 12345 Berlin" in
// { street, plz, city } nach der Regel: PLZ = erste 5-stellige Zahl,
// street = alles davor, city = alles danach (ohne die PLZ selbst).
// Funktioniert gut fuer deutsche Standard-Formate, schlaegt bei
// exotischen Eingaben (z.B. "Berlin 12345 Hauptstr.") leer fehl.
function parseAddressParts(str) {
  const out = { street: '', plz: '', city: '' };
  if (!str) return out;
  const plzMatch = String(str).match(/\b(\d{5})\b/);
  if (plzMatch) {
    out.plz = plzMatch[1];
    out.street = String(str).slice(0, plzMatch.index).replace(/[,\s]+$/, '').trim();
    out.city = String(str).slice(plzMatch.index + 5).replace(/^[,\s]+/, '').trim();
  } else {
    // Kein PLZ → best-effort split am letzten Komma
    const parts = String(str).split(',').map(function(s){ return s.trim(); });
    if (parts.length > 1) {
      out.street = parts.slice(0, -1).join(', ');
      out.city = parts[parts.length - 1];
    } else {
      out.street = String(str).trim();
    }
  }
  return out;
}

// Prueft VOR dem Save ob alle Pflichtfelder des aktuellen Schritts
// gueltig sind. Gibt true zurueck wenn ja, zeigt sonst einen Fehler-
// Toast und gibt false zurueck.
function validateProfileStep() {
  const step = state.profileStep;
  if (step === 0) {
    const street = (document.getElementById('ps-street') || {}).value;
    const plz    = (document.getElementById('ps-plz')    || {}).value;
    const city   = (document.getElementById('ps-city')   || {}).value;
    const vStreet = (street || '').trim();
    const vPlz    = (plz    || '').trim();
    const vCity   = (city   || '').trim();
    if (!vStreet || !vPlz || !vCity) {
      showToast('Bitte Straße, PLZ und Stadt ausfüllen.', 'error');
      return false;
    }
    if (!/^\d{5}$/.test(vPlz)) {
      showToast('PLZ muss 5-stellig sein (z.B. 12345).', 'error');
      return false;
    }
  }
  return true;
}

// Wrapper: saveProfileStep + advance nur wenn validate ok.
// WICHTIG: saveProfileStep ist async und liest den aktuellen Step-DOM.
// Wenn wir nicht awaiten, kann der Nutzer parallel weiterklicken und
// saveProfileStep liest dann das DOM eines anderen Schritts → partial/
// vertauschte Daten in der DB.
async function nextProfileStep() {
  if (!validateProfileStep()) return;
  await saveProfileStep();
  const total = (typeof PROFILE_STEPS !== 'undefined' ? PROFILE_STEPS.length : 8);
  state.profileStep = Math.min(total - 1, state.profileStep + 1);
  render();
}

async function finishProfileSetup() {
  if (!validateProfileStep()) return;
  await saveProfileStep();
  showToast('Profil gespeichert!');
  navigate('worker-dashboard');
}

// Gleicher Race-Fix fuer die Sidebar-/Zurueck-Buttons: beide awaiten
// jetzt saveProfileStep bevor sie den Step wechseln. Aus dem onclick
// rufen wir die Wrapper statt inline "saveProfileStep();render()".
async function gotoProfileStep(targetStep) {
  // Beim Springen zu einem anderen Step ist der aktuelle Step u.U.
  // noch nicht valide (User klickt seitwaerts). Trotzdem speichern
  // was da ist — saveProfileStep schreibt nur Felder die nicht leer
  // sind, keine Uebertragung nach validate noetig fuer Zurueck-Pfad.
  await saveProfileStep();
  state.profileStep = targetStep;
  render();
}

async function saveProfileStep() {
  if (!state.user || !window.DB) return;
  const u = state.user;
  const step = state.profileStep;
  const patch = {};
  if (step === 0) {
    const street = document.getElementById('ps-street');
    const plz    = document.getElementById('ps-plz');
    const city   = document.getElementById('ps-city');
    const radius = document.querySelector('.range-slider');
    const vStreet = street ? street.value.trim() : '';
    const vPlz    = plz    ? plz.value.trim()    : '';
    const vCity   = city   ? city.value.trim()   : '';
    // Nur zusammensetzen wenn Street + PLZ + City vorhanden sind;
    // sonst stuermt Nominatim mit Teildaten ab auf Stadtebene.
    if (vStreet && /^\d{5}$/.test(vPlz) && vCity) {
      const full = vStreet + ', ' + vPlz + ' ' + vCity;
      u.street = vStreet; u.plz = vPlz; u.city = vCity;
      u.address = full;
      patch.address = full;
    }
    if (radius) u.radius = parseInt(radius.value);
  }
  if (step === 3) {
    const hours = document.getElementById('ps-hours');
    if (hours) { u.weeklyHours = parseInt(hours.value) || 0; patch.weekly_hours = u.weeklyHours; }
    const checked = [...document.querySelectorAll('.checkbox-group input:checked')]
      .map(c => c.nextElementSibling.textContent.trim());
    if (checked.length) { u.skills = checked; patch.skills = checked; }
  }
  if (Object.keys(patch).length) {
    try { await DB.updateProfile(u.id, patch); }
    catch (e) { console.error('[saveProfileStep]', e); showToast('Konnte Profil nicht speichern.', 'error'); }
  }
}

// Add a work reference to the current user's profile and persist it.
async function addRefToProfile(ref) {
  if (!state.user || !window.DB) return;
  const refs = Array.isArray(state.user.refs) ? state.user.refs.slice() : [];
  const previousRefs = refs.slice();
  refs.push(ref);
  state.user.refs = refs;
  try {
    await DB.updateProfile(state.user.id, { refs });
  } catch (e) {
    // Rollback the optimistic update so the UI doesn't pretend we saved.
    state.user.refs = previousRefs;
    console.error('[addRefToProfile]', e);
    showToast('Referenz konnte nicht gespeichert werden: ' + (e.message || ''), 'error');
  }
}

function renderSavedJobs() {
  if (!state.user) return renderLogin();
  const jobs = JOBS.filter(j => state.savedJobs.includes(j.id));
  return `
    <div class="page">
      <div class="dashboard-layout">
        ${renderWorkerSidebar('saved')}
        <div class="dashboard-content">
          <h2 class="dashboard-title">Gespeicherte Jobs</h2>
          ${jobs.length > 0 ? `
            <div class="jobs-grid">${jobs.map(j => renderJobCard(j)).join('')}</div>
          ` : `
            <div class="empty-state">
              <div class="empty-state-icon"></div>
              <h3>Keine gespeicherten Jobs</h3>
              <p>Speichere interessante Jobs, um sie später wiederzufinden.</p>
              <button class="btn btn-primary" onclick="navigate('jobs')">Jobs entdecken</button>
            </div>
          `}
        </div>
      </div>
    </div>`;
}

function renderApplications() {
  if (!state.user) return renderLogin();
  const loading = !state.jobsLoaded || !state.applicationsLoaded;
  const appJobIds = loading ? [] : getUserApps();
  const allApps = loading ? [] : getAllApplications();
  const myApps = appJobIds.map(jobId => {
    const job = JOBS.find(j => j.id === jobId);
    const appData = allApps.find(a => a.userId === state.user.id && a.jobId === jobId);
    return { job, status: appData?.status || 'new', statusText: appData?.statusText || 'Gesendet', date: appData?.date || new Date().toISOString().split('T')[0] };
  }).filter(a => a.job);
  if (loading) {
    return `
      <div class="page">
        <div class="dashboard-layout">
          ${renderWorkerSidebar('applications')}
          <div class="dashboard-content">
            <h2 class="dashboard-title">Meine Bewerbungen</h2>
            ${skeletonJobGrid(3)}
          </div>
        </div>
      </div>`;
  }
  return `
    <div class="page">
      <div class="dashboard-layout">
        ${renderWorkerSidebar('applications')}
        <div class="dashboard-content">
          <h2 class="dashboard-title">Meine Bewerbungen</h2>
          ${(() => {
            const activeJob = getActiveJob();
            const pending = myApps.filter(a => a.status !== 'rejected' && a.status !== 'accepted');
            return activeJob ? `
            <div style="padding:0.75rem 1rem;border-radius:var(--radius);background:#f0fdf4;border:1px solid #bbf7d0;margin-bottom:1rem;font-size:0.85rem;color:#166534;display:flex;align-items:center;gap:0.5rem">
              <span style="font-size:1.1rem">💼</span> Du hast einen aktiven Job: <strong>${escapeHtml(activeJob.jobTitle)}</strong> – Neue Bewerbungen sind gesperrt.
            </div>` : `
            <div style="padding:0.75rem 1rem;border-radius:var(--radius);background:#eff6ff;border:1px solid #bfdbfe;margin-bottom:1rem;font-size:0.85rem;color:#1e40af;display:flex;align-items:center;gap:0.5rem">
              <span style="font-size:1.1rem">📋</span> Offene Bewerbungen: <strong>${pending.length}/3</strong>
            </div>`;
          })()}
          ${myApps.length > 0 ? `
          <div class="jobs-grid">
            ${myApps.map(a => `
              <div class="card" style="cursor:pointer" onclick="navigate('job-detail', {jobId: ${a.job.id}})">
                <div class="card-body" style="display:flex;justify-content:space-between;align-items:center">
                  <div style="display:flex;align-items:center;gap:1rem">
                    ${companyLogoHtml(a.job.companyLogo, a.job.company)}
                    <div>
                      <h3 style="font-size:1rem;margin-bottom:0.25rem">${escapeHtml(a.job.title)}</h3>
                      <div style="font-size:0.85rem;color:var(--gray-500)">${escapeHtml(a.job.company)}</div>
                    </div>
                  </div>
                  <div style="text-align:right">
                    <div class="badge ${a.status==='accepted'?'badge-success':a.status==='reviewing'?'badge-secondary':a.status==='rejected'?'badge-danger':'badge-primary'}">${a.statusText}</div>
                    <div style="font-size:0.8rem;color:var(--gray-500);margin-top:0.25rem">${formatDate(a.date)}</div>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>` : `
          <div class="empty-state" style="margin-top:2rem">
            <div style="font-size:3rem;margin-bottom:1rem">&#128196;</div>
            <h3>Noch keine Bewerbungen</h3>
            <p style="color:var(--gray-500);margin-bottom:1.5rem">Finde passende Jobs und bewirb dich mit einem Klick.</p>
            <button class="btn btn-primary" onclick="navigate('jobs')">Jobs finden</button>
          </div>`}
        </div>
      </div>
    </div>`;
}

function renderCVBuilder() {
  if (!state.user) return renderLogin();
  return `
    <div class="page">
      <div class="dashboard-layout">
        ${renderWorkerSidebar('cv')}
        <div class="dashboard-content">
          <h2 class="dashboard-title">Lebenslauf Builder</h2>

          <div style="margin-bottom:1.5rem">
            <h3 style="font-size:1.05rem;margin-bottom:0.75rem">Vorlage wählen</h3>
            <div class="cv-templates">
              <div class="cv-template selected" data-template="modern" onclick="document.querySelectorAll('.cv-template').forEach(el=>el.classList.remove('selected'));this.classList.add('selected')">
                <div class="cv-preview" style="overflow:hidden;font-family:Inter,sans-serif;padding:0">
                  <div style="display:flex;height:100%">
                    <div style="width:34%;background:#1e3a5f;color:#fff;padding:4% 4%;display:flex;flex-direction:column">
                      <div style="width:26%;aspect-ratio:1;border-radius:50%;background:rgba(255,255,255,0.15);margin:0 auto 2%;border:1px dashed rgba(255,255,255,0.3)"></div>
                      <div style="font-size:0.3rem;font-weight:700;text-align:center;margin-bottom:3%">Vorname Name</div>
                      <div style="font-size:0.24rem;text-transform:uppercase;opacity:0.5;margin-bottom:1.5%">Kontakt</div>
                      <div style="height:2px;background:rgba(255,255,255,0.12);width:85%;margin-bottom:1%"></div>
                      <div style="height:2px;background:rgba(255,255,255,0.12);width:65%;margin-bottom:1%"></div>
                      <div style="height:2px;background:rgba(255,255,255,0.12);width:75%;margin-bottom:1%"></div>
                      <div style="height:2px;background:rgba(255,255,255,0.12);width:55%;margin-bottom:2.5%"></div>
                      <div style="font-size:0.24rem;text-transform:uppercase;opacity:0.5;margin-bottom:1.5%">Kenntnisse</div>
                      <div style="height:2px;background:rgba(255,255,255,0.12);width:80%;margin-bottom:1%"></div>
                      <div style="height:2px;background:rgba(255,255,255,0.12);width:55%;margin-bottom:1%"></div>
                      <div style="height:2px;background:rgba(255,255,255,0.12);width:70%;margin-bottom:2.5%"></div>
                      <div style="font-size:0.24rem;text-transform:uppercase;opacity:0.5;margin-bottom:1.5%">Sprachen</div>
                      <div style="height:2px;background:rgba(255,255,255,0.12);width:60%;margin-bottom:1%"></div>
                      <div style="height:2px;background:rgba(255,255,255,0.12);width:45%;margin-bottom:2.5%"></div>
                      <div style="font-size:0.24rem;text-transform:uppercase;opacity:0.5;margin-bottom:1.5%">Interessen</div>
                      <div style="height:2px;background:rgba(255,255,255,0.12);width:70%;margin-bottom:1%"></div>
                      <div style="height:2px;background:rgba(255,255,255,0.12);width:50%"></div>
                    </div>
                    <div style="flex:1;padding:4% 5%;background:#fff">
                      <div style="height:3px;background:#1e3a5f;width:60%;margin-bottom:1%"></div>
                      <div style="height:1.5px;width:12%;background:#1e3a5f;margin-bottom:3%"></div>
                      <div style="font-size:0.26rem;text-transform:uppercase;color:#1e3a5f;font-weight:700;margin-bottom:1.5%">Persönliche Daten</div>
                      <div style="height:2px;background:#e5e7eb;width:90%;margin-bottom:1%"></div>
                      <div style="height:2px;background:#e5e7eb;width:70%;margin-bottom:1%"></div>
                      <div style="height:2px;background:#e5e7eb;width:80%;margin-bottom:1%"></div>
                      <div style="height:2px;background:#e5e7eb;width:60%;margin-bottom:3%"></div>
                      <div style="font-size:0.26rem;text-transform:uppercase;color:#1e3a5f;font-weight:700;margin-bottom:1.5%">Ausbildung</div>
                      <div style="height:2px;background:#e5e7eb;width:85%;margin-bottom:1%"></div>
                      <div style="height:2px;background:#e5e7eb;width:60%;margin-bottom:1%"></div>
                      <div style="height:2px;background:#e5e7eb;width:75%;margin-bottom:3%"></div>
                      <div style="font-size:0.26rem;text-transform:uppercase;color:#1e3a5f;font-weight:700;margin-bottom:1.5%">Berufserfahrung</div>
                      <div style="height:2px;background:#e5e7eb;width:88%;margin-bottom:1%"></div>
                      <div style="height:2px;background:#e5e7eb;width:72%;margin-bottom:1%"></div>
                      <div style="height:2px;background:#e5e7eb;width:55%;margin-bottom:1%"></div>
                      <div style="height:2px;background:#e5e7eb;width:80%;margin-bottom:3%"></div>
                      <div style="font-size:0.26rem;text-transform:uppercase;color:#1e3a5f;font-weight:700;margin-bottom:1.5%">Hobbys & Interessen</div>
                      <div style="height:2px;background:#e5e7eb;width:65%;margin-bottom:1%"></div>
                      <div style="height:2px;background:#e5e7eb;width:50%"></div>
                    </div>
                  </div>
                </div>
                <div class="cv-template-name">Modern</div>
              </div>
              <div class="cv-template" data-template="classic" onclick="document.querySelectorAll('.cv-template').forEach(el=>el.classList.remove('selected'));this.classList.add('selected')">
                <div class="cv-preview" style="overflow:hidden;padding:4% 5%;font-family:Georgia,serif;background:#fff">
                  <div style="display:flex;align-items:center;gap:3%;border-bottom:1.5px double #111;padding-bottom:2%;margin-bottom:2.5%">
                    <div style="width:14%;aspect-ratio:1;border-radius:2px;background:var(--gray-100);border:1px dashed var(--gray-300)"></div>
                    <div style="flex:1"><div style="height:3px;background:#111;width:65%;margin-bottom:2px"></div><div style="height:2px;background:var(--gray-300);width:80%"></div></div>
                  </div>
                  <div style="font-size:0.26rem;text-transform:uppercase;letter-spacing:0.08em;color:#111;border-bottom:0.5px solid #ddd;padding-bottom:1%;margin-bottom:1.5%;font-weight:600">Persönliche Daten</div>
                  <div style="height:2px;background:#e5e7eb;width:70%;margin-bottom:1%"></div>
                  <div style="height:2px;background:#e5e7eb;width:55%;margin-bottom:1%"></div>
                  <div style="height:2px;background:#e5e7eb;width:65%;margin-bottom:2.5%"></div>
                  <div style="font-size:0.26rem;text-transform:uppercase;letter-spacing:0.08em;color:#111;border-bottom:0.5px solid #ddd;padding-bottom:1%;margin-bottom:1.5%;font-weight:600">Ausbildung</div>
                  <div style="display:flex;gap:2%;margin-bottom:1%"><div style="height:2px;background:var(--gray-300);width:16%"></div><div style="height:2px;background:var(--gray-200);width:50%"></div></div>
                  <div style="display:flex;gap:2%;margin-bottom:1%"><div style="height:2px;background:var(--gray-300);width:16%"></div><div style="height:2px;background:var(--gray-200);width:35%"></div></div>
                  <div style="display:flex;gap:2%;margin-bottom:2.5%"><div style="height:2px;background:var(--gray-300);width:16%"></div><div style="height:2px;background:var(--gray-200);width:45%"></div></div>
                  <div style="font-size:0.26rem;text-transform:uppercase;letter-spacing:0.08em;color:#111;border-bottom:0.5px solid #ddd;padding-bottom:1%;margin-bottom:1.5%;font-weight:600">Berufserfahrung</div>
                  <div style="display:flex;gap:2%;margin-bottom:1%"><div style="height:2px;background:var(--gray-300);width:16%"></div><div style="height:2px;background:var(--gray-200);width:55%"></div></div>
                  <div style="display:flex;gap:2%;margin-bottom:1%"><div style="height:2px;background:var(--gray-300);width:16%"></div><div style="height:2px;background:var(--gray-200);width:40%"></div></div>
                  <div style="display:flex;gap:2%;margin-bottom:2.5%"><div style="height:2px;background:var(--gray-300);width:16%"></div><div style="height:2px;background:var(--gray-200);width:50%"></div></div>
                  <div style="font-size:0.26rem;text-transform:uppercase;letter-spacing:0.08em;color:#111;border-bottom:0.5px solid #ddd;padding-bottom:1%;margin-bottom:1.5%;font-weight:600">Kenntnisse</div>
                  <div style="height:2px;background:var(--gray-200);width:60%;margin-bottom:1%"></div>
                  <div style="height:2px;background:var(--gray-200);width:45%;margin-bottom:2.5%"></div>
                  <div style="font-size:0.26rem;text-transform:uppercase;letter-spacing:0.08em;color:#111;border-bottom:0.5px solid #ddd;padding-bottom:1%;margin-bottom:1.5%;font-weight:600">Hobbys & Interessen</div>
                  <div style="height:2px;background:var(--gray-200);width:55%;margin-bottom:1%"></div>
                  <div style="height:2px;background:var(--gray-200);width:40%"></div>
                </div>
                <div class="cv-template-name">Klassisch</div>
              </div>
              <div class="cv-template" data-template="creative" onclick="document.querySelectorAll('.cv-template').forEach(el=>el.classList.remove('selected'));this.classList.add('selected')">
                <div class="cv-preview" style="overflow:hidden;font-family:Inter,sans-serif;padding:0">
                  <div style="background:linear-gradient(135deg,#3b82f6,#93c5fd);padding:3% 5%;display:flex;align-items:center;gap:3%;color:#fff">
                    <div style="width:15%;aspect-ratio:1;border-radius:50%;background:rgba(255,255,255,0.15);border:1px dashed rgba(255,255,255,0.3)"></div>
                    <div style="flex:1"><div style="height:3px;background:rgba(255,255,255,0.5);width:55%;margin-bottom:2px"></div><div style="height:2px;background:rgba(255,255,255,0.25);width:70%"></div></div>
                  </div>
                  <div style="display:flex;flex:1">
                    <div style="flex:1;padding:3% 4%">
                      <div style="font-size:0.24rem;text-transform:uppercase;color:#2563eb;font-weight:700;margin-bottom:1.5%"><span style="width:6%;height:1px;background:#2563eb;display:inline-block;vertical-align:middle;margin-right:1.5%"></span>Persönliche Daten</div>
                      <div style="height:2px;background:#e5e7eb;width:85%;margin-bottom:1%"></div>
                      <div style="height:2px;background:#e5e7eb;width:65%;margin-bottom:1%"></div>
                      <div style="height:2px;background:#e5e7eb;width:75%;margin-bottom:2.5%"></div>
                      <div style="font-size:0.24rem;text-transform:uppercase;color:#2563eb;font-weight:700;margin-bottom:1.5%"><span style="width:6%;height:1px;background:#2563eb;display:inline-block;vertical-align:middle;margin-right:1.5%"></span>Ausbildung</div>
                      <div style="height:2px;background:#e5e7eb;width:80%;margin-bottom:1%"></div>
                      <div style="height:2px;background:#e5e7eb;width:55%;margin-bottom:1%"></div>
                      <div style="height:2px;background:#e5e7eb;width:70%;margin-bottom:2.5%"></div>
                      <div style="font-size:0.24rem;text-transform:uppercase;color:#2563eb;font-weight:700;margin-bottom:1.5%"><span style="width:6%;height:1px;background:#2563eb;display:inline-block;vertical-align:middle;margin-right:1.5%"></span>Berufserfahrung</div>
                      <div style="height:2px;background:#e5e7eb;width:88%;margin-bottom:1%"></div>
                      <div style="height:2px;background:#e5e7eb;width:68%;margin-bottom:1%"></div>
                      <div style="height:2px;background:#e5e7eb;width:78%;margin-bottom:1%"></div>
                      <div style="height:2px;background:#e5e7eb;width:55%"></div>
                    </div>
                    <div style="width:34%;padding:3% 3%;background:#f8fafc;border-left:0.5px solid #e2e8f0">
                      <div style="font-size:0.22rem;text-transform:uppercase;color:#2563eb;font-weight:700;margin-bottom:2%">Kenntnisse</div>
                      <div style="display:flex;flex-wrap:wrap;gap:1.5%"><div style="height:7px;background:#eff6ff;border-radius:3px;width:40%"></div><div style="height:7px;background:#eff6ff;border-radius:3px;width:30%"></div><div style="height:7px;background:#eff6ff;border-radius:3px;width:36%"></div><div style="height:7px;background:#eff6ff;border-radius:3px;width:28%"></div></div>
                      <div style="font-size:0.22rem;text-transform:uppercase;color:#2563eb;font-weight:700;margin-top:4%;margin-bottom:2%">Sprachen</div>
                      <div style="height:2px;background:#e5e7eb;width:60%;margin-bottom:1%"></div>
                      <div style="height:2px;background:#e5e7eb;width:45%;margin-bottom:4%"></div>
                      <div style="font-size:0.22rem;text-transform:uppercase;color:#2563eb;font-weight:700;margin-bottom:2%">Interessen</div>
                      <div style="height:2px;background:#e5e7eb;width:70%;margin-bottom:1%"></div>
                      <div style="height:2px;background:#e5e7eb;width:50%"></div>
                    </div>
                  </div>
                </div>
                <div class="cv-template-name">Kreativ</div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-header">Deine Daten</div>
            <div class="card-body">

              <!-- Foto-Upload -->
              <div style="display:flex;align-items:center;gap:1.25rem;margin-bottom:1.5rem;padding-bottom:1.5rem;border-bottom:1px solid var(--gray-200)">
                <div id="cv-photo-preview" onclick="document.getElementById('cv-photo-input').click()" style="width:80px;height:80px;border-radius:50%;background:var(--gray-100);display:flex;align-items:center;justify-content:center;cursor:pointer;border:2px dashed var(--gray-300);overflow:hidden;flex-shrink:0;transition:all 0.2s;${state.cvPhoto ? 'background-image:url('+state.cvPhoto+');background-size:cover;background-position:center;border-style:solid;border-color:var(--primary)' : ''}" onmouseover="this.style.borderColor='var(--primary)'" onmouseout="this.style.borderColor='${state.cvPhoto ? 'var(--primary)' : 'var(--gray-300)'}'">${state.cvPhoto ? '' : '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--gray-400)" stroke-width="2"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>'}</div>
                <input type="file" id="cv-photo-input" accept="image/*" style="display:none" onchange="handleCVPhoto(this)">
                <div>
                  <div style="font-weight:600;font-size:0.95rem">Bewerbungsfoto</div>
                  <div style="font-size:0.8rem;color:var(--gray-500)">Klicke auf den Kreis, um ein Foto hochzuladen</div>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Vorname</label>
                  <input type="text" id="cv-vorname" class="form-input" value="${escapeAttr((state.user.name||'').split(' ')[0])}">
                </div>
                <div class="form-group">
                  <label class="form-label">Nachname</label>
                  <input type="text" id="cv-nachname" class="form-input" value="${escapeAttr((state.user.name||'').split(' ').slice(1).join(' '))}">
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">E-Mail</label>
                  <input type="email" id="cv-email" class="form-input" value="${escapeAttr(state.user.email)}">
                </div>
                <div class="form-group">
                  <label class="form-label">Telefon</label>
                  <input type="tel" id="cv-telefon" class="form-input" placeholder="+49 ...">
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Adresse</label>
                  <input type="text" id="cv-adresse" class="form-input" placeholder="Straße, PLZ, Stadt">
                </div>
                <div class="form-group">
                  <label class="form-label">Geburtsdatum</label>
                  <input type="text" id="cv-geburtsdatum" class="form-input" placeholder="z.B. 15.03.2008">
                </div>
              </div>

              <h3 style="font-size:1rem;margin:1.5rem 0 1rem;padding-top:1rem;border-top:1px solid var(--gray-200)">Schulbildung</h3>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Schule</label>
                  <input type="text" id="cv-schule" class="form-input" placeholder="Name der Schule">
                </div>
                <div class="form-group">
                  <label class="form-label">Zeitraum</label>
                  <input type="text" id="cv-schul-zeitraum" class="form-input" placeholder="z.B. 2020 - heute">
                </div>
              </div>

              <h3 style="font-size:1rem;margin:1.5rem 0 1rem;padding-top:1rem;border-top:1px solid var(--gray-200)">Erfahrungen</h3>
              <div class="form-group">
                <label class="form-label">Praktika / Jobs</label>
                <textarea class="form-textarea" id="cv-erfahrungen" placeholder="Beschreibe deine bisherigen Erfahrungen..."></textarea>
              </div>

              <h3 style="font-size:1rem;margin:1.5rem 0 1rem;padding-top:1rem;border-top:1px solid var(--gray-200)">Fähigkeiten</h3>
              <div class="form-group">
                <div class="checkbox-group" id="cv-skills">
                  ${SKILLS.slice(0,10).map(s => `<label class="checkbox-label"><input type="checkbox"> <span>${s}</span></label>`).join('')}
                </div>
              </div>

              <h3 style="font-size:1rem;margin:1.5rem 0 1rem;padding-top:1rem;border-top:1px solid var(--gray-200)">Hobbys & Interessen</h3>
              <div class="form-group">
                <textarea class="form-textarea" rows="3" id="cv-hobbys" placeholder="Deine Hobbys und Interessen..."></textarea>
              </div>
            </div>
            <div class="card-footer" style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:0.5rem">
              <button class="btn btn-outline" onclick="previewCV()">Vorschau anzeigen</button>
              <div style="display:flex;gap:0.5rem">
                <button class="btn btn-outline" onclick="downloadCV()">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:0.3rem"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Herunterladen
                </button>
                <button class="btn btn-primary" onclick="addCVToProfile()">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:0.3rem"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  Zum Profil hinzufügen
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>`;
}

// ===== EMPLOYER PAGES =====

function renderEmployerLanding() {
  return `
    <!-- HERO: Split-Layout - Text links, Mac-Browser-Mockup mit unserer UI rechts -->
    <section class="eh2">
      <div class="eh2-inner">
        <div class="eh2-text">
          <span class="eh2-kicker">Für Arbeitgeber</span>
          <h1>Junge Talente.<br>Direkt erreichen.</h1>
          <p>Schalte deine Stellenanzeige in fünf Minuten und schreib mit motivierten Schülern und Studenten in deiner Stadt &mdash; ohne Bewerbungsformular, ohne Mail-Hin-und-Her.</p>
          <div class="eh2-buttons">
            <button class="btn btn-lg cta-btn-primary" onclick="goPostJob()">Jetzt Anzeige schalten</button>
            <button class="btn btn-lg cta-btn-outline" onclick="document.getElementById('emp-cascade-wrap').scrollIntoView({behavior:'smooth'})">So funktioniert's</button>
          </div>
        </div>
        <div class="eh2-visual">
          <!-- Browser-Fenster Mockup mit unserer WorkPilot-Oberflaeche -->
          <div class="eh2-browser">
            <div class="eh2-browser-bar">
              <span class="eh2-bd" style="background:#ef4444"></span>
              <span class="eh2-bd" style="background:#f59e0b"></span>
              <span class="eh2-bd" style="background:#22c55e"></span>
              <div class="eh2-browser-url">workpilot.de/dashboard</div>
            </div>
            <div class="eh2-browser-body">
              <div class="eh2-heading">
                <div>
                  <strong>Neue Bewerbungen</strong>
                  <span>Heute, 14. April</span>
                </div>
                <span class="eh2-chip">3 neu</span>
              </div>
              <div class="eh2-row">
                <div class="eh2-av" style="background:linear-gradient(135deg,#fce7f3,#f9a8d4)">LM</div>
                <div class="eh2-info">
                  <strong>Lena M., 17</strong>
                  <span>Schülerin &middot; Köln</span>
                </div>
                <span class="eh2-pill eh2-pill-new">Neu</span>
              </div>
              <div class="eh2-row">
                <div class="eh2-av" style="background:linear-gradient(135deg,#dbeafe,#93c5fd)">TK</div>
                <div class="eh2-info">
                  <strong>Tim K., 19</strong>
                  <span>Student &middot; Düsseldorf</span>
                </div>
                <span class="eh2-pill eh2-pill-new">Neu</span>
              </div>
              <div class="eh2-row">
                <div class="eh2-av" style="background:linear-gradient(135deg,#fef3c7,#fcd34d)">SH</div>
                <div class="eh2-info">
                  <strong>Sara H., 16</strong>
                  <span>Schülerin &middot; Essen</span>
                </div>
                <span class="eh2-pill eh2-pill-chat">Im Chat</span>
              </div>
            </div>
          </div>
          <!-- Kleines Phone-Mockup im Vordergrund, wie bei workflow.at -->
          <div class="eh2-phone">
            <div class="eh2-phone-screen">
              <div class="eh2-phone-top"></div>
              <div class="eh2-phone-heading">Nachrichten</div>
              <div class="eh2-phone-msg">
                <div class="eh2-av-sm" style="background:#fce7f3">L</div>
                <div>
                  <strong>Lena M.</strong>
                  <p>Hallo! Ich hätte Interesse...</p>
                </div>
              </div>
              <div class="eh2-phone-msg">
                <div class="eh2-av-sm" style="background:#dbeafe">T</div>
                <div>
                  <strong>Tim K.</strong>
                  <p>Wann kann ich anfangen?</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- BENTO GRID: 6 unterschiedlich grosse Kacheln (individuelles Layout) -->
    <section class="eh-bento">
      <div class="eh-bento-head">
        <span class="emp3-section-kicker">Warum WorkPilot</span>
        <h2>Alles an <em>einem</em> Ort.</h2>
      </div>
      <div class="eh-bento-grid">
        <!-- Kachel 1: Gross, mit Mini-Editor-Mockup -->
        <article class="eh-b eh-b-big eh-b-blue">
          <span class="eh-b-tag">01 · Ausschreiben</span>
          <h3>Anzeige in fünf Minuten online.</h3>
          <p>Titel, Beschreibung, Standort, Stundenlohn &mdash; fertig. Keine Freischaltung, keine Formulare.</p>
          <div class="eh-b-editor">
            <div class="eh-b-editor-field"><label>Jobtitel</label><div>Kassierer*in (m/w/d)</div></div>
            <div class="eh-b-editor-field"><label>Standort</label><div>Köln, Innenstadt</div></div>
            <div class="eh-b-editor-field"><label>Stundenlohn</label><div>14,50 €</div></div>
            <div class="eh-b-editor-btn">Anzeige veröffentlichen</div>
          </div>
        </article>

        <!-- Kachel 2: Typografie-Statement -->
        <article class="eh-b eh-b-type">
          <span class="eh-b-tag">02 · Preis</span>
          <div class="eh-b-type-big">Kostenlos.<br><em>Für immer.</em></div>
          <p>Kein Abo, keine Provision, keine Freemium-Falle.</p>
        </article>

        <!-- Kachel 3: Chat-Bubbles-Mockup -->
        <article class="eh-b eh-b-chat">
          <span class="eh-b-tag">03 · Kommunikation</span>
          <h3>Direkt im Messenger.</h3>
          <div class="eh-b-chat-stream">
            <div class="eh-b-bubble eh-b-bubble-them">Hi! Ich hätte Interesse an der Stelle.</div>
            <div class="eh-b-bubble eh-b-bubble-you">Super. Kannst du Samstag 14 Uhr?</div>
            <div class="eh-b-bubble eh-b-bubble-them">Passt! ✓</div>
          </div>
        </article>

        <!-- Kachel 4: Foto + kurzer Text -->
        <article class="eh-b eh-b-photo">
          <img src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80" alt="" loading="lazy">
          <div class="eh-b-photo-overlay">
            <span class="eh-b-tag eh-b-tag-light">04 · Talente</span>
            <h3>Junge Aushilfen, sofort bereit.</h3>
          </div>
        </article>

        <!-- Kachel 5: Profil-Card-Mockup -->
        <article class="eh-b eh-b-profile">
          <span class="eh-b-tag">05 · Bewerbungen</span>
          <h3>Profil statt PDF.</h3>
          <p>Lebenslauf, Verfügbarkeit und Erfahrung direkt im Dashboard.</p>
          <div class="eh-b-profile-card">
            <div class="eh-b-profile-av">LM</div>
            <div class="eh-b-profile-info">
              <strong>Lena M., 17</strong>
              <span>Verfügbar ab Mai &middot; 10 Std/Wo</span>
              <div class="eh-b-profile-skills">
                <span>Kasse</span><span>Service</span><span>Englisch</span>
              </div>
            </div>
          </div>
        </article>

        <!-- Kachel 6: Typografie-Statement -->
        <article class="eh-b eh-b-type eh-b-dark">
          <span class="eh-b-tag eh-b-tag-light">06 · Flexibilität</span>
          <div class="eh-b-type-big">Kein Vertrag.<br><em>Keine Laufzeit.</em></div>
          <p>Schalte Anzeigen wann du willst, pausiere wann du willst.</p>
        </article>
      </div>
    </section>

    <!-- STIMMEN: Karten mit echten Profilbildern (gleich wie vorher) -->
    <section class="emp2-quotes">
      <div class="emp2-quotes-head">
        <span class="emp2-section-kicker">Stimmen</span>
        <h2>Was <em>Arbeitgeber</em> sagen</h2>
      </div>
      <div class="emp2-quotes-grid">
        <article class="emp2-quote scroll-reveal">
          <p>&bdquo;Innerhalb von einem Tag hatte ich vier Bewerbungen. Eine davon arbeitet jetzt seit drei Monaten bei mir im Café.&ldquo;</p>
          <div class="emp2-quote-author">
            <img src="https://randomuser.me/api/portraits/women/65.jpg" alt="">
            <div>
              <strong>Sandra K.</strong>
              <span>Inhaberin, Café Sonnenschein &middot; Köln</span>
            </div>
          </div>
        </article>
        <article class="emp2-quote scroll-reveal">
          <p>&bdquo;Wir suchen regelmäßig Aushilfen für Wochenenden. Über WorkPilot läuft das ohne Bürokratie &mdash; einfach hingucken, anschreiben, fertig.&ldquo;</p>
          <div class="emp2-quote-author">
            <img src="https://randomuser.me/api/portraits/men/52.jpg" alt="">
            <div>
              <strong>Thomas M.</strong>
              <span>Filialleiter, MediaMarkt &middot; Düsseldorf</span>
            </div>
          </div>
        </article>
        <article class="emp2-quote scroll-reveal">
          <p>&bdquo;Der direkte Chat ist Gold wert. Keine Bewerbungs-Mails mehr durchforsten &mdash; und die Schüler antworten schneller als jeder Erwachsene.&ldquo;</p>
          <div class="emp2-quote-author">
            <img src="https://randomuser.me/api/portraits/women/82.jpg" alt="">
            <div>
              <strong>Lara H.</strong>
              <span>HR Manager, TechStart &middot; Berlin</span>
            </div>
          </div>
        </article>
      </div>
    </section>

    <!-- FINALER CTA: editorial, kein Fullblock-Gradient -->
    <section class="eh-cta">
      <div class="eh-cta-inner">
        <div class="eh-cta-text">
          <span class="emp3-section-kicker">Los geht's</span>
          <h2>Dein nächster Mitarbeiter ist <em>einen Klick</em> entfernt.</h2>
          <p>Anzeige schalten dauert fünf Minuten. Kostenlos, unverbindlich, ohne Kleingedrucktes.</p>
        </div>
        <div class="eh-cta-actions">
          <button class="btn btn-lg cta-btn-primary" onclick="goPostJob()">Jetzt Anzeige schalten <span class="cta-arrow">&rarr;</span></button>
          <a href="#" onclick="navigate('register');return false;" class="eh-cta-link">oder Konto erstellen</a>
        </div>
      </div>
    </section>`;
}

// (Slideshow-Logik fuer die alte Arbeitgeber-Slideshow ist nicht mehr im Einsatz,
// goToSlide/nextSlide/empObserver weiter unten bleiben harmlos - kein .emp-slideshow im DOM.)

// Employer Slideshow Logic
var empSlideIndex = 0;
var empSlideTimer = null;
function goToSlide(n) {
  empSlideIndex = n;
  var slides = document.getElementById('emp-slides');
  var dots = document.querySelectorAll('.emp-slideshow-dot');
  if (!slides) return;
  slides.style.transform = 'translateX(-' + (n * 100) + '%)';
  dots.forEach(function(d, i) { d.classList.toggle('active', i === n); });
  clearInterval(empSlideTimer);
  empSlideTimer = setInterval(nextSlide, 5000);
}
function nextSlide() {
  goToSlide((empSlideIndex + 1) % 3);
}
// Auto-start slideshow when employer page loads
var empObserver = new MutationObserver(function() {
  if (document.getElementById('emp-slideshow')) {
    clearInterval(empSlideTimer);
    empSlideTimer = setInterval(nextSlide, 5000);
  } else {
    clearInterval(empSlideTimer);
  }
});
empObserver.observe(document.getElementById('app'), { childList: true, subtree: true });

function renderEmployerDashboard() {
  if (!state.user || state.user.role !== 'employer') return renderLogin();
  // Jobs come from the Supabase-backed JOBS array, filtered by employer
  const myJobs = JOBS.filter(j => j.employerId === state.user.id);
  const totalViews = myJobs.reduce((s, j) => s + (j.views || 0), 0);
  const totalApps = myJobs.reduce((s, j) => s + (j.applications || 0), 0);
  const hasJobs = myJobs.length > 0;
  return `
    <div class="page employer-page">
      <div class="dashboard-layout">
        ${renderEmployerSidebar('dashboard')}
        <div class="dashboard-content">
          <div class="employer-dash-header">
            <div>
              <h2 class="dashboard-title" style="margin-bottom:0.15rem">Willkommen, ${escapeHtml(state.user.name?.split(' ')[0])}!</h2>
              <p style="font-size:0.85rem;color:var(--gray-500);margin:0">${state.user.company ? escapeHtml(state.user.company) + ' – ' : ''}Verwalte deine Stellenanzeigen und Bewerbungen</p>
            </div>
            <button class="btn btn-employer" onclick="goPostJob()" ${!state.user.approved ? 'disabled style="opacity:0.5;cursor:not-allowed"' : ''}>+ Neue Anzeige schalten</button>
          </div>

          ${!state.user.approved ? `
          <div class="card" style="margin-bottom:1.5rem;border-color:var(--secondary);border-left:4px solid var(--secondary)">
            <div class="card-body" style="display:flex;align-items:center;gap:1rem;background:rgba(245,158,11,0.05)">
              <div style="font-size:1.5rem">&#9888;</div>
              <div style="flex:1">
                <strong>Account wird geprüft</strong>
                <div style="font-size:0.85rem;color:var(--gray-500);margin-top:0.25rem">Dein Arbeitgeber-Account muss erst vom Admin freigeschaltet werden, bevor du Anzeigen schalten kannst.</div>
              </div>
            </div>
          </div>` : ''}

          <div class="stats-grid">
            <div class="stat-card employer-stat">
              <div class="stat-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-4 0v2"/><path d="M8 7V5a2 2 0 0 1 4 0v2"/></svg></div>
              <div class="stat-value">${myJobs.length}</div>
              <div class="stat-label">Aktive Anzeigen</div>
            </div>
            <div class="stat-card employer-stat">
              <div class="stat-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></div>
              <div class="stat-value">${totalViews}</div>
              <div class="stat-label">Gesamte Views</div>
            </div>
            <div class="stat-card employer-stat">
              <div class="stat-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
              <div class="stat-value">${totalApps}</div>
              <div class="stat-label">Bewerbungen</div>
            </div>
            <div class="stat-card employer-stat">
              <div class="stat-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div>
              <div class="stat-value">0</div>
              <div class="stat-label">Neue Nachrichten</div>
            </div>
          </div>

          ${hasJobs ? `
          <h3 style="font-size:1.1rem;margin-bottom:1rem">Deine Anzeigen</h3>
          <div class="jobs-grid">
            ${myJobs.map(j => `
              <div class="card">
                <div class="card-body" style="display:flex;justify-content:space-between;align-items:center;gap:1rem">
                  <div style="display:flex;align-items:center;gap:1rem;flex:1">
                    ${companyLogoHtml(j.companyLogo, j.company)}
                    <div>
                      <h3 style="font-size:0.95rem;margin-bottom:0.25rem">${escapeHtml(j.title)}</h3>
                      <div style="display:flex;gap:1rem;font-size:0.8rem;color:var(--gray-500)">
                        <span>${j.views || 0} Views</span>
                        <span>${j.applications || 0} Bew.</span>
                      </div>
                    </div>
                  </div>
                  <div style="display:flex;align-items:center;gap:0.5rem">
                    <span class="badge badge-success">Aktiv</span>
                    <button class="btn btn-sm" style="background:var(--danger);color:#fff;font-size:0.75rem" onclick="event.stopPropagation();deletePostedJob('${j.id}')">Löschen</button>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>` : `
          <div class="empty-state" style="margin-top:2rem">
            <div style="font-size:3rem;margin-bottom:1rem">&#9962;</div>
            <h3>Noch keine Anzeigen</h3>
            <p style="color:var(--gray-500);margin-bottom:1.5rem">Schalte deine erste Stellenanzeige und finde passende Mitarbeiter.</p>
            <button class="btn btn-employer" onclick="goPostJob()">+ Erste Anzeige erstellen</button>
          </div>`}
        </div>
      </div>
    </div>`;
}

function renderEmployerSidebar(active) {
  return `
    <div class="dashboard-sidebar">
      <nav class="sidebar-nav">
        <a href="#" class="${active==='dashboard'?'active':''}" onclick="navigate('employer-dashboard')">Dashboard</a>
        <a href="#" class="${active==='post'?'active':''}" onclick="goPostJob()">Anzeige schalten</a>
        <a href="#" class="${active==='applicants'?'active':''}" onclick="navigate('applicants')">Bewerber</a>
        <a href="#" class="${active==='profile'?'active':''}" onclick="navigate('employer-profile')">Unternehmensprofil</a>
        <div class="divider"></div>
        <a href="#" class="${active==='messages'?'active':''}" onclick="navigate('messages')">Nachrichten</a>
        <a href="#" class="${active==='reviews'?'active':''}" onclick="navigate('reviews')">Bewertungen</a>
      </nav>
      <div class="divider" style="margin:0.25rem 0"></div>
      <nav class="sidebar-nav">
        <a href="#" class="${active==='support'?'active':''}" onclick="navigate('support')" style="font-size:0.82rem;opacity:0.6">Support</a>
      </nav>
    </div>`;
}

function validateWizardStep() {
  const step = state.wizardStep;
  const body = document.querySelector('.wizard-content');
  if (!body) return;
  let valid = true;
  if (step === 0) {
    const inputs = body.querySelectorAll('input.form-input, select.form-select');
    inputs.forEach(inp => {
      const label = inp.closest('.form-group')?.querySelector('.form-label');
      if (label && label.textContent.includes('*') && !inp.value.trim()) {
        inp.style.border = '2px solid var(--danger)';
        valid = false;
      } else {
        inp.style.border = '';
      }
    });
  } else if (step === 1) {
    const textareas = body.querySelectorAll('textarea.form-textarea');
    textareas.forEach(ta => {
      const label = ta.closest('.form-group')?.querySelector('.form-label');
      if (label && label.textContent.includes('*') && !ta.value.trim()) {
        ta.style.border = '2px solid var(--danger)';
        valid = false;
      } else {
        ta.style.border = '';
      }
    });
  }
  if (!valid) {
    showToast('Bitte fülle alle Pflichtfelder (*) aus.', 'error');
    return;
  }
  // PLZ-Spezialvalidierung (step 0): genau 5 Ziffern. Unabhaengig vom
  // Label-"*"-Heuristik oben — falls das Markup mal refactored wird
  // und der Wrapper wegfaellt, greift hier trotzdem noch der Check.
  if (step === 0) {
    const plzEl = body.querySelector('#nj-plz');
    if (!plzEl) {
      // Markup-Regression — Feld existiert nicht. Abbrechen statt durch.
      showToast('Formular nicht vollständig geladen. Seite neu laden.', 'error');
      return;
    }
    if (!/^\d{5}$/.test((plzEl.value || '').trim())) {
      plzEl.style.border = '2px solid var(--danger)';
      showToast('PLZ muss 5-stellig sein (z.B. 12345).', 'error');
      return;
    }
  }
  // Persist wizard inputs into state.newJob so publishJob() can read
  // them on Step 4 even though the Step 0/1 DOM inputs are gone.
  if (body && step === 0) {
    state.newJob.title = body.querySelector('input[placeholder*="Aushilfe"]')?.value || '';
    const selects = body.querySelectorAll('select.form-select');
    if (selects[0]) state.newJob.category = selects[0].value;
    if (selects[1]) state.newJob.type = selects[1].value;
    // Adresse aus 3 Einzelfeldern zusammensetzen → Format das sowohl
    // Nominatim als auch getFilteredJobs (splits auf Komma fuer city)
    // sauber verarbeiten koennen.
    const _street = body.querySelector('#nj-street')?.value.trim() || '';
    const _plz    = body.querySelector('#nj-plz')?.value.trim()    || '';
    const _city   = body.querySelector('#nj-city')?.value.trim()   || '';
    state.newJob.location = _street + ', ' + _plz + ' ' + _city;
    state.newJob.city = _city;
    state.newJob.salary = body.querySelector('input[placeholder*="12,50"]')?.value || '';
    state.newJob.hours = body.querySelector('input[placeholder*="Std/Woche"]')?.value || '';
  }
  if (body && step === 1) {
    const textareas = body.querySelectorAll('textarea.form-textarea');
    if (textareas[0]) state.newJob.description = textareas[0].value;
    if (textareas[1]) state.newJob.requirements = textareas[1].value;
    if (textareas[2]) state.newJob.benefits = textareas[2].value;
  }
  state.wizardStep = Math.min(4, state.wizardStep + 1);
  render();
}

function renderPostJob() {
  if (!state.user || state.user.role !== 'employer') return renderLogin();
  if (!state.user.approved) {
    return `<div class="page page-narrow" style="text-align:center;padding-top:4rem">
      <div style="font-size:3rem;margin-bottom:1rem">&#128274;</div>
      <h2 style="margin-bottom:0.5rem">Account noch nicht freigeschaltet</h2>
      <p style="color:var(--gray-500);margin-bottom:1.5rem">Dein Arbeitgeber-Account muss zuerst von einem Administrator freigeschaltet werden, bevor du Stellenanzeigen veröffentlichen kannst.</p>
      <p style="color:var(--gray-500);font-size:0.85rem">Du wirst benachrichtigt, sobald dein Account freigegeben wurde.</p>
      <button class="btn btn-primary" style="margin-top:1.5rem" onclick="navigate('employer-dashboard')">Zurück zum Dashboard</button>
    </div>`;
  }
  const step = state.wizardStep;
  const steps = ['Grundinfos', 'Details', 'Bilder', 'Laufzeit', 'Vorschau'];

  return `
    <div class="page page-narrow" style="max-width:900px">
      <h2 class="dashboard-title">Stellenanzeige schalten</h2>

      <div class="wizard-steps">
        ${steps.map((s, i) => `
          <div class="wizard-step ${i === step ? 'active' : i < step ? 'completed' : ''}">
            <span class="step-num">${i < step ? '✓' : i + 1}</span>
            <span>${s}</span>
          </div>
        `).join('')}
      </div>

      <div class="wizard-content">
        ${step === 0 ? renderWizardStep1() : ''}
        ${step === 1 ? renderWizardStep2() : ''}
        ${step === 2 ? renderWizardStep3() : ''}
        ${step === 3 ? renderWizardStep4() : ''}
        ${step === 4 ? renderWizardStep5() : ''}
      </div>

      <div class="wizard-footer">
        ${step === 0
          ? `<button class="btn btn-outline" onclick="navigate('employer-dashboard')">&#8592; Dashboard</button>`
          : `<button class="btn btn-outline" onclick="state.wizardStep=Math.max(0,state.wizardStep-1);render()">&#8592; Zurück</button>`}
        ${step < 4 ? `
          <button class="btn btn-primary" onclick="validateWizardStep()">Weiter &#8594;</button>
        ` : `
          <button class="btn btn-success btn-lg" onclick="publishJob()">✓ Veröffentlichen</button>
        `}
      </div>
    </div>`;
}

function renderWizardStep1() {
  return `
    <h3 style="margin-bottom:1.5rem">Grundinformationen</h3>
    <div class="form-group">
      <label class="form-label">Jobtitel *</label>
      <input type="text" class="form-input" placeholder="z.B. Aushilfe im Einzelhandel" value="Aushilfe im Einzelhandel">
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Kategorie *</label>
        <select class="form-select">
          <option value="">Kategorie wählen...</option>
          ${CATEGORIES.map(c => `<option value="${c.name}" ${c.name==='Einzelhandel'?'selected':''}>${c.icon} ${c.name}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Jobtyp *</label>
        <select class="form-select">
          ${JOB_TYPES.map(t => `<option value="${t}" ${t==='Minijob'?'selected':''}>${t}</option>`).join('')}
        </select>
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Straße & Hausnummer *</label>
      <input type="text" id="nj-street" class="form-input" placeholder="Musterstraße 1" value="">
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">PLZ *</label>
        <input type="text" id="nj-plz" class="form-input" placeholder="12345" inputmode="numeric" pattern="\\d{5}" maxlength="5" value="">
      </div>
      <div class="form-group">
        <label class="form-label">Stadt *</label>
        <input type="text" id="nj-city" class="form-input" placeholder="Berlin" value="">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Stundenlohn</label>
        <input type="text" class="form-input" placeholder="z.B. 12,50€/Std" value="12,50€/Std">
      </div>
      <div class="form-group">
        <label class="form-label">Arbeitszeit</label>
        <input type="text" class="form-input" placeholder="z.B. 10-15 Std/Woche" value="10-15 Std/Woche">
      </div>
    </div>

    <div style="background:rgba(79,70,229,0.05);border:1px solid rgba(79,70,229,0.15);border-radius:var(--radius-sm);padding:1rem;margin-top:1rem">
      <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.5rem">
        <span>KI</span>
        <strong style="font-size:0.9rem">KI-Unterstützung</strong>
      </div>
      <p style="font-size:0.85rem;color:var(--gray-600);margin-bottom:0.75rem">Lass die KI deine Stellenanzeige basierend auf den Grundinfos vorgenerieren.</p>
      <button class="btn btn-primary btn-sm" id="ai-gen-btn" onclick="aiGenerateJob(this)">Mit KI generieren</button>
    </div>`;
}

function renderWizardStep2() {
  return `
    <h3 style="margin-bottom:1.5rem">Stellenbeschreibung</h3>
    <div class="form-group">
      <label class="form-label">Aufgaben *</label>
      <textarea class="form-textarea" rows="4" placeholder="Beschreibe die Aufgaben...">Kassentätigkeit und Kundenberatung
Wareneinräumen und Regalpflege
Sauberhalten des Verkaufsbereichs</textarea>
    </div>
    <div class="form-group">
      <label class="form-label">Anforderungen *</label>
      <textarea class="form-textarea" rows="4" placeholder="Was bringt der ideale Bewerber mit?"></textarea>
    </div>
    <div class="form-group">
      <label class="form-label">Wir bieten</label>
      <textarea class="form-textarea" rows="4" placeholder="Was bietet ihr den Bewerbern?"></textarea>
    </div>
    <div class="form-group">
      <label class="form-label">Gewünschte Eigenschaften</label>
      <div class="checkbox-group">
        ${SKILLS.map(s => `<label class="checkbox-label"><input type="checkbox"> <span>${s}</span></label>`).join('')}
      </div>
    </div>`;
}

function renderWizardStep3() {
  const imgs = state.user?.companyImages || [];
  if (!state.selectedJobImages) state.selectedJobImages = [];
  return `
    <h3 style="margin-bottom:1.5rem">Bilder auswählen</h3>
    ${imgs.length > 0 ? `
      <p style="color:var(--gray-500);font-size:0.9rem;margin-bottom:1rem">Wähle Bilder aus deinem Unternehmensprofil für diese Anzeige:</p>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:0.75rem;margin-bottom:1.5rem">
        ${imgs.map((img, i) => {
          const selected = state.selectedJobImages.includes(i);
          return `
          <button type="button" onclick="toggleJobImage(${i})" aria-pressed="${selected}" aria-label="Bild ${i+1}${selected ? ' — ausgewählt' : ''}" style="position:relative;aspect-ratio:1;border-radius:var(--radius-sm);overflow:hidden;cursor:pointer;padding:0;background:none;border:3px solid ${selected ? 'var(--primary)' : 'transparent'}">
            <img src="${img}" alt="" style="width:100%;height:100%;object-fit:cover;display:block" loading="lazy">
            ${selected ? '<div style="position:absolute;top:6px;right:6px;width:26px;height:26px;border-radius:50%;background:var(--primary);color:#fff;display:flex;align-items:center;justify-content:center;font-size:0.85rem" aria-hidden="true">&#10003;</div>' : ''}
          </button>`;
        }).join('')}
      </div>
      <p style="font-size:0.85rem;color:var(--gray-500)">${state.selectedJobImages.length} Bild${state.selectedJobImages.length !== 1 ? 'er' : ''} ausgewählt</p>
    ` : `
      <div class="empty-state" style="padding:2rem">
        <div style="font-size:2rem;margin-bottom:0.75rem">&#128247;</div>
        <h3 style="font-size:1rem">Keine Bilder vorhanden</h3>
        <p style="color:var(--gray-500);font-size:0.85rem;margin-bottom:1rem">Lade zuerst Bilder in deinem Unternehmensprofil hoch.</p>
        <button class="btn btn-outline btn-sm" onclick="navigate('employer-profile')">Zum Profil</button>
      </div>
    `}`;
}

function renderWizardStep4() {
  return `
    <h3 style="margin-bottom:1.5rem">Laufzeit</h3>
    <div class="form-group">
      <label class="form-label">Laufzeit der Anzeige</label>
      <div class="radio-group" style="flex-direction:column">
        <label class="radio-label"><input type="radio" name="duration" value="30" checked> <span>30 Tage</span></label>
        <label class="radio-label"><input type="radio" name="duration" value="60"> <span>60 Tage <span class="badge badge-success" style="margin-left:0.5rem">Empfohlen</span></span></label>
        <label class="radio-label"><input type="radio" name="duration" value="90"> <span>90 Tage</span></label>
      </div>
    </div>

    <div style="background:rgba(37,99,235,0.05);border:1px solid rgba(37,99,235,0.15);border-radius:var(--radius);padding:1.25rem;margin-top:1rem;display:flex;align-items:center;gap:1rem">
      <div style="font-size:1.5rem">&#127881;</div>
      <div>
        <strong style="color:var(--primary)">Aktuell komplett kostenlos!</strong>
        <div style="font-size:0.85rem;color:var(--gray-500);margin-top:0.25rem">Alle Stellenanzeigen auf WorkPilot sind derzeit kostenfrei. Keine versteckten Kosten, kein Abo.</div>
      </div>
    </div>`;
}

function renderWizardStep5() {
  return `
    <h3 style="margin-bottom:1.5rem">Vorschau deiner Anzeige</h3>
    <div class="job-card" style="cursor:default">
      <div>
        <div class="job-card-header">
          <div class="job-company-logo" aria-hidden="true"></div>
          <div class="job-card-info">
            <h3>Dein Jobtitel</h3>
            <div class="job-company-name">Dein Unternehmen</div>
          </div>
        </div>
        <div class="job-card-meta">
          <span>Deine Adresse</span>
          <span>Arbeitszeit</span>
          <span>Stundenlohn</span>
          <span>Heute</span>
        </div>
      </div>
    </div>

    <div style="background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.3);border-radius:var(--radius-sm);padding:1rem;margin-top:1.5rem;display:flex;align-items:center;gap:0.75rem">
      <span style="font-size:1.25rem">!</span>
      <div>
        <strong>Fast geschafft!</strong>
        <div style="font-size:0.85rem;color:var(--gray-600)">Nach der Bezahlung wird deine Anzeige sofort veröffentlicht. Du kannst sie jederzeit bearbeiten oder pausieren.</div>
      </div>
    </div>`;
}

function renderEmployerProfile() {
  if (!state.sessionLoaded) {
    return `
      <div class="page">
        <div class="dashboard-layout">
          ${renderEmployerSidebar('profile')}
          <div class="dashboard-content">${skeletonProfilePage()}</div>
        </div>
      </div>`;
  }
  if (!state.user || state.user.role !== 'employer') return renderLogin();
  if (state._profileRefreshing) {
    return `
      <div class="page">
        <div class="dashboard-layout">
          ${renderEmployerSidebar('profile')}
          <div class="dashboard-content">${skeletonProfilePage()}</div>
        </div>
      </div>`;
  }
  return `
    <div class="page">
      <div class="dashboard-layout">
        ${renderEmployerSidebar('profile')}
        <div class="dashboard-content">
          <h2 class="dashboard-title">Unternehmensprofil</h2>

          <div class="profile-header-card" style="background:linear-gradient(135deg,#1e40af,#2563eb)">
            <button type="button" class="profile-avatar" style="font-size:1.5rem;cursor:pointer;padding:0;border:none;${state.user.companyLogo && state.user.companyLogo.startsWith('data:') ? `background-image:url(${state.user.companyLogo});background-size:cover;background-position:center;` : ''}" onclick="document.getElementById('company-logo-input').click()" id="company-logo-preview" aria-label="Firmenlogo hochladen">
              ${state.user.companyLogo && state.user.companyLogo.startsWith('data:') ? '' : escapeHtml(state.user.company?.[0] || state.user.name?.[0] || '?')}
            </button>
            <input type="file" id="company-logo-input" accept="image/*" style="display:none" onchange="handleCompanyLogo(this)">
            <div class="profile-info">
              <h2>${escapeHtml(state.user.company || state.user.name + '\'s Unternehmen')}</h2>
              <p>Klicke auf das Logo um es zu ändern</p>
            </div>
          </div>

          <div class="profile-sections">
            <div class="profile-section">
              <h3>Allgemeine Informationen</h3>
              <div class="form-group">
                <label class="form-label">Unternehmensname</label>
                <input type="text" name="company" class="form-input" placeholder="Name des Unternehmens" value="${escapeAttr(state.user.company || '')}">
              </div>
              <div class="form-group">
                <label class="form-label">Branche</label>
                <select name="industry" class="form-select">
                  <option value="">Branche wählen...</option>
                  ${CATEGORIES.map(c => `<option value="${c.name}" ${state.user.industry===c.name?'selected':''}>${c.name}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Beschreibung</label>
                <textarea name="description" class="form-textarea" placeholder="Beschreibe dein Unternehmen...">${escapeHtml(state.user.description || '')}</textarea>
              </div>
            </div>

            <div class="profile-section">
              <h3>Kontakt & Standort</h3>
              <div class="form-group">
                <label class="form-label">Adresse</label>
                <input type="text" name="address" class="form-input" placeholder="Straße, PLZ, Stadt" value="${escapeAttr(state.user.address || '')}">
              </div>
              <div class="form-group">
                <label class="form-label">Telefon</label>
                <input type="tel" name="phone" class="form-input" placeholder="+49 ..." value="${escapeAttr(state.user.phone || '')}">
              </div>
              <div class="form-group">
                <label class="form-label">Website</label>
                <input type="url" name="website" class="form-input" placeholder="https://..." value="${escapeAttr(state.user.website || '')}">
              </div>
            </div>

            <div class="profile-section">
              <h3>Unternehmensbilder</h3>
              <p style="font-size:0.85rem;color:var(--gray-500);margin-bottom:1rem">Lade Bilder hoch, die du bei Stellenanzeigen verwenden kannst (z.B. Büro, Team, Arbeitsplatz).</p>
              <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:0.75rem;margin-bottom:1rem" id="company-images-grid">
                ${(state.user.companyImages || []).map((img, i) => `
                  <div style="position:relative;aspect-ratio:1;border-radius:var(--radius-sm);overflow:hidden">
                    <img src="${img}" alt="Unternehmensbild ${i+1}" style="width:100%;height:100%;object-fit:cover;display:block" loading="lazy">
                    <button onclick="removeCompanyImage(${i})" aria-label="Bild ${i+1} entfernen" style="position:absolute;top:4px;right:4px;width:24px;height:24px;border-radius:50%;background:rgba(0,0,0,0.6);color:#fff;border:none;cursor:pointer;font-size:0.8rem;display:flex;align-items:center;justify-content:center">&#10005;</button>
                  </div>
                `).join('')}
                ${(state.user.companyImages || []).length < 6 ? `
                <div style="aspect-ratio:1;border:2px dashed var(--gray-300);border-radius:var(--radius-sm);display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;color:var(--gray-500);font-size:0.85rem" onclick="document.getElementById('company-images-input').click()">
                  <div style="font-size:1.5rem">+</div>
                  Bild hinzufügen
                </div>` : ''}
              </div>
              <input type="file" id="company-images-input" accept="image/*" style="display:none" onchange="handleCompanyImage(this)">
            </div>

            <div class="profile-section">
              <h3>Unternehmensdaten</h3>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Gründungsjahr</label>
                  <input type="number" name="founded" class="form-input" placeholder="z.B. 2020" value="${escapeAttr(state.user.founded || '')}">
                </div>
                <div class="form-group">
                  <label class="form-label">Mitarbeiterzahl</label>
                  <input type="text" name="employees" class="form-input" placeholder="z.B. 10-50" value="${escapeAttr(state.user.employees || '')}">
                </div>
              </div>
            </div>
          </div>

          <div style="margin-top:1.5rem;text-align:right">
            <button class="btn btn-primary btn-lg" onclick="saveEmployerProfile(this)">✓ Profil speichern</button>
          </div>
        </div>
      </div>
    </div>`;
}


// Mock applicants removed — all applicants come from Supabase now.
const MOCK_APPLICANTS = [];

function renderApplicants() {
  if (!state.user || state.user.role !== 'employer') return renderLogin();
  const realApps = getEmployerApplicants();
  const allApplicants = [...realApps, ...MOCK_APPLICANTS];
  const applicants = (!state.applicantFilter || state.applicantFilter === 'all') ? allApplicants : allApplicants.filter(a => a.status === state.applicantFilter);

  return `
    <div class="page">
      <div class="dashboard-layout">
        ${renderEmployerSidebar('applicants')}
        <div class="dashboard-content">
          <h2 class="dashboard-title">Bewerber verwalten</h2>

          <div class="tabs">
            <button class="tab ${!state.applicantFilter || state.applicantFilter==='all' ? 'active' : ''}" onclick="state.applicantFilter='all';render()">Alle (${allApplicants.length})</button>
            <button class="tab ${state.applicantFilter==='new' ? 'active' : ''}" onclick="state.applicantFilter='new';render()">Neu (${allApplicants.filter(a=>a.status==='new').length})</button>
            <button class="tab ${state.applicantFilter==='reviewing' ? 'active' : ''}" onclick="state.applicantFilter='reviewing';render()">In Prüfung (${allApplicants.filter(a=>a.status==='reviewing').length})</button>
            <button class="tab ${state.applicantFilter==='accepted' ? 'active' : ''}" onclick="state.applicantFilter='accepted';render()">Eingeladen (${allApplicants.filter(a=>a.status==='accepted').length})</button>
          </div>

          <div class="card">
            <table class="applicants-table">
              <thead>
                <tr>
                  <th>Bewerber</th>
                  <th>Stelle</th>
                  <th>Skills</th>
                  <th>Status</th>
                  <th>Datum</th>
                  <th>Aktionen</th>
                </tr>
              </thead>
              <tbody>
                ${applicants.map(a => {
                  // "Already employed" — derived from the application status.
                  // Actual cross-employer active-job check would require a
                  // DB lookup per row and is overkill for this render.
                  const workerHasActiveJob = a.status === 'accepted';
                  return `
                  <tr${workerHasActiveJob ? ' style="opacity:0.6"' : ''}>
                    <td>
                      <div class="applicant-row">
                        <div class="user-avatar" style="width:32px;height:32px;font-size:0.7rem">${a.initials}</div>
                        <div>
                          <strong>${escapeHtml(a.name)}</strong>
                          ${workerHasActiveJob ? '<div style="font-size:0.7rem;color:var(--danger);font-weight:600">Bereits beschäftigt</div>' : ''}
                        </div>
                      </div>
                    </td>
                    <td>${escapeHtml(a.jobTitle || a.job)}</td>
                    <td>${(a.skills || []).map(s => `<span class="tag">${escapeHtml(s)}</span>`).join(' ')}</td>
                    <td>
                      <select class="form-select" style="font-size:0.8rem;padding:0.3rem 0.5rem;min-width:120px" onchange="updateApplicantStatus(${a.id}, this.value)">
                        <option value="new" ${a.status==='new'?'selected':''}>Neu</option>
                        <option value="reviewing" ${a.status==='reviewing'?'selected':''}>In Prüfung</option>
                        <option value="accepted" ${a.status==='accepted'?'selected':''}>Eingeladen</option>
                        <option value="rejected" ${a.status==='rejected'?'selected':''}>Abgelehnt</option>
                      </select>
                    </td>
                    <td>${formatDate(a.date)}</td>
                    <td>
                      <div style="display:flex;gap:0.375rem;flex-wrap:wrap">
                        <button class="btn btn-sm btn-outline" onclick="navigate('applicant-profile', {applicantId: ${a.id}})">Profil</button>
                        ${a.motivation || a.motivationFileName ? '<button class="btn btn-sm btn-outline" onclick="openApplicationDoc(' + a.id + ',\'motivation\')" title="Motivationsschreiben öffnen" style="color:#2563eb;border-color:#2563eb">Anschreiben</button>' : ''}
                        <button class="btn btn-sm btn-outline" onclick="openApplicationDoc(${a.id},'cv')" title="Lebenslauf öffnen" style="color:#6366f1;border-color:#6366f1">Lebenslauf</button>
                        <button class="btn btn-sm btn-primary" onclick="openApplicantChat(${a.id})">Nachricht</button>
                      </div>
                    </td>
                  </tr>`;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>`;
}

function renderApplicantProfile() {
  if (!state.user || state.user.role !== 'employer') return renderLogin();
  const id = state.pageData?.applicantId;
  const allApplicants = [...getEmployerApplicants(), ...MOCK_APPLICANTS];
  const a = allApplicants.find(x => x.id === id) || allApplicants[0];
  const statusColor = { new: 'badge-primary', reviewing: 'badge-secondary', accepted: 'badge-success', rejected: 'badge-danger' };

  return `
    <div class="page">
      <div class="dashboard-layout">
        ${renderEmployerSidebar('applicants')}
        <div class="dashboard-content">

          <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:1.5rem">
            <button class="btn btn-sm btn-outline" onclick="navigate('applicants')">&#8592; Zurück</button>
            <h2 class="dashboard-title" style="margin:0">Bewerberprofil</h2>
          </div>

          <div style="background:linear-gradient(135deg,var(--primary-light) 0%,var(--primary) 100%);height:110px;border-radius:12px 12px 0 0;position:relative;display:block;border:none;padding:0;margin:0">
            <div style="position:absolute;bottom:-30px;left:1.5rem;width:64px;height:64px;font-size:1.3rem;border:3px solid #fff;background:var(--primary);color:#fff;display:flex;align-items:center;justify-content:center;border-radius:50%;font-weight:700">
              ${a.initials}
            </div>
          </div>

          <div class="card" style="border-radius:0 0 12px 12px;padding-top:2.5rem;margin-bottom:1rem">
            <div class="card-body">
              <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:0.75rem">
                <div>
                  <h2 style="font-size:1.3rem;margin-bottom:0.25rem">${escapeHtml(a.name)}</h2>
                  <div style="font-size:0.85rem;color:var(--gray-500)">
                    ${a.age ? a.age + ' Jahre &bull; ' : ''}${escapeHtml(a.city)} &bull; max. ${a.weeklyHours || '?'} Std./Woche
                  </div>
                  <div style="margin-top:0.5rem;display:flex;align-items:center;gap:0.75rem;flex-wrap:wrap">
                    <select class="form-select" style="font-size:0.8rem;padding:0.3rem 0.5rem;width:auto" onchange="updateApplicantStatus(${a.id}, this.value)">
                      <option value="new" ${a.status==='new'?'selected':''}>Neu</option>
                      <option value="reviewing" ${a.status==='reviewing'?'selected':''}>In Prüfung</option>
                      <option value="accepted" ${a.status==='accepted'?'selected':''}>Eingeladen</option>
                      <option value="rejected" ${a.status==='rejected'?'selected':''}>Abgelehnt</option>
                    </select>
                    <span style="font-size:0.8rem;color:var(--gray-500)">Beworben auf: <strong>${escapeHtml(a.jobTitle || a.job)}</strong></span>
                  </div>
                </div>
                <button class="btn btn-primary" onclick="openApplicantChat(${a.id})">
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:0.4rem;vertical-align:-2px"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                  Nachricht senden
                </button>
              </div>
              ${a.about ? `
                <div style="margin-top:1rem;padding-top:1rem;border-top:1px solid var(--gray-100);font-size:0.88rem;color:var(--gray-600);line-height:1.5">
                  ${escapeHtml(a.about)}
                </div>` : ''}
            </div>
          </div>

          <div class="grid-2">
            <div class="card">
              <div class="card-body">
                <h4 style="font-size:0.9rem;color:var(--gray-500);text-transform:uppercase;letter-spacing:.05em;margin-bottom:0.75rem">Stärken</h4>
                ${a.skills.length > 0
                  ? `<div style="display:flex;flex-wrap:wrap;gap:0.375rem">${a.skills.map(s => `<span class="epc-skill-tag">${escapeHtml(s)}</span>`).join('')}</div>`
                  : `<span class="pv-missing-chip">Noch nicht angegeben</span>`}
              </div>
            </div>

            <div class="card">
              <div class="card-body">
                <h4 style="font-size:0.9rem;color:var(--gray-500);text-transform:uppercase;letter-spacing:.05em;margin-bottom:0.75rem">Berufserfahrung</h4>
                ${a.refs && a.refs.length > 0
                  ? `<ul style="margin:0;padding-left:1.1rem;font-size:0.88rem;line-height:1.8">${a.refs.map(r => `<li>${escapeHtml(r)}</li>`).join('')}</ul>`
                  : `<span class="pv-missing-chip">Noch nicht angegeben</span>`}
              </div>
            </div>

            <div class="card">
              <div class="card-body">
                <h4 style="font-size:0.9rem;color:var(--gray-500);text-transform:uppercase;letter-spacing:.05em;margin-bottom:0.75rem">Dokumente</h4>
                <div class="epc-doc-row">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                  <span style="flex:1;font-size:0.88rem">Lebenslauf</span>
                  ${a.cvUploaded ? '<span class="badge badge-success" style="font-size:0.72rem">Hochgeladen</span>' : '<span class="pv-missing-chip">Fehlt</span>'}
                </div>
                <div class="epc-doc-row" style="margin-top:0.5rem">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><polyline points="9 11 12 14 22 4"></polyline></svg>
                  <span style="flex:1;font-size:0.88rem">Zeugnis / Zertifikat</span>
                  ${a.docsUploaded ? '<span class="badge badge-success" style="font-size:0.72rem">Hochgeladen</span>' : '<span class="pv-missing-chip">Fehlt</span>'}
                </div>
              </div>
            </div>

            <div class="card">
              <div class="card-body">
                <h4 style="font-size:0.9rem;color:var(--gray-500);text-transform:uppercase;letter-spacing:.05em;margin-bottom:0.75rem">Verfügbarkeit</h4>
                <div style="font-size:0.88rem">
                  <div style="display:flex;justify-content:space-between;padding:0.25rem 0;border-bottom:1px solid var(--gray-100)">
                    <span style="color:var(--gray-500)">Wochenstunden</span>
                    <strong>${a.weeklyHours} Std.</strong>
                  </div>
                  <div style="display:flex;justify-content:space-between;padding:0.25rem 0">
                    <span style="color:var(--gray-500)">Standort</span>
                    <strong>${a.city}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style="text-align:center;margin-top:1.5rem">
            <button class="btn btn-primary btn-lg" onclick="openApplicantChat(${a.id})">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:0.5rem;vertical-align:-2px"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              ${escapeHtml((a.name||'').split(' ')[0])} anschreiben
            </button>
          </div>

        </div>
      </div>
    </div>`;
}

function renderChatDetail() {
  if (!state.user) return renderLogin();
  const isEmployer = state.user.role === 'employer';
  const chatId = state.pageData?.chatId !== undefined ? state.pageData.chatId : state.activeChat;
  if (chatId !== undefined && chatId !== null) state.activeChat = chatId;
  const chat = findChat(state.activeChat);
  if (!chat) return renderMessages();

  return `
    <div class="page">
      <div class="dashboard-layout">
        ${isEmployer ? renderEmployerSidebar('messages') : renderWorkerSidebar('messages')}
        <div class="dashboard-content" style="display:flex;flex-direction:column;max-height:calc(100vh - 140px)">

          <!-- Chat-Kopfzeile -->
          <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:1rem;padding-bottom:0.75rem;border-bottom:1px solid var(--gray-200)">
            <button class="btn btn-sm btn-outline" onclick="navigate('messages')">&#8592; Zurück</button>
            <div class="user-avatar" style="width:38px;height:38px;font-size:0.8rem;flex-shrink:0">${chat.partnerInitials}</div>
            <div>
              <strong style="font-size:0.95rem">${escapeHtml(chat.partnerName)}</strong>
              <div style="font-size:0.78rem;color:var(--gray-500)">${escapeHtml(chat.jobTitle)}</div>
            </div>
          </div>

          <!-- Nachrichten -->
          <div id="chat-messages-page" style="flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:0.625rem;padding-bottom:1rem;max-width:620px">
            ${state._activeChatLoading === chat.id ? skeletonChatMessages() : ''}
            ${state._activeChatLoading !== chat.id && chat.messages.length === 0 ? `
              <div style="text-align:center;color:var(--gray-500);font-size:0.85rem;padding:2rem">
                Noch keine Nachrichten. Schreib ${escapeHtml(chat.partnerName?.split(' ')[0])} eine erste Nachricht!
              </div>` : ''}
            ${state._activeChatLoading === chat.id ? '' : chat.messages.map(m => `
              <div style="display:flex;justify-content:${m.sent ? 'flex-end' : 'flex-start'}">
                <div style="max-width:72%;padding:0.6rem 0.85rem;border-radius:${m.sent ? '14px 14px 4px 14px' : '14px 14px 14px 4px'};background:${m.sent ? 'var(--primary)' : 'var(--gray-100)'};color:${m.sent ? '#fff' : 'inherit'};font-size:0.88rem;line-height:1.45">
                  ${escapeHtml(m.text)}
                  <div style="font-size:0.68rem;opacity:0.6;margin-top:0.25rem;text-align:right">${m.time}</div>
                </div>
              </div>
            `).join('')}
          </div>

          <!-- Eingabezeile -->
          <div style="display:flex;gap:0.5rem;padding-top:0.75rem;border-top:1px solid var(--gray-200);max-width:620px">
            <label for="chat-input" class="sr-only">Nachricht schreiben</label>
            <input type="text" id="chat-input" class="form-input" placeholder="Nachricht schreiben..." style="flex:1" onkeydown="if(event.key==='Enter')sendChatMessage()" aria-label="Nachricht schreiben">
            <button class="btn btn-primary" onclick="sendChatMessage()">Senden</button>
          </div>

        </div>
      </div>
    </div>`;
}

// ===== SHARED PAGES =====

function renderMessages() {
  if (!state.user) return renderLogin();
  const isEmployer = state.user.role === 'employer';
  const loading = !state.chatsLoaded;
  const chatList = loading ? [] : getChatList();
  const unreadCount = chatList.filter(c => c.unread).length;
  if (loading) {
    return `
      <div class="page">
        <div class="dashboard-layout">
          ${isEmployer ? renderEmployerSidebar('messages') : renderWorkerSidebar('messages')}
          <div class="dashboard-content">
            <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:1rem">
              <h2 class="dashboard-title" style="margin-bottom:0;font-size:1.25rem">Nachrichten</h2>
            </div>
            ${skeletonChatList(4)}
          </div>
        </div>
      </div>`;
  }
  return `
    <div class="page">
      <div class="dashboard-layout">
        ${isEmployer ? renderEmployerSidebar('messages') : renderWorkerSidebar('messages')}
        <div class="dashboard-content">
          <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:1rem">
            <h2 class="dashboard-title" style="margin-bottom:0;font-size:1.25rem">Nachrichten</h2>
            ${unreadCount > 0 ? `<span class="badge badge-danger">${unreadCount} neu</span>` : ''}
          </div>
          <div class="card" style="max-width:620px">
            ${chatList.map(c => `
              <div style="display:flex;align-items:center;gap:0.75rem;padding:0.625rem 1rem;border-bottom:1px solid var(--gray-100);cursor:pointer;transition:background 0.15s" onmouseover="this.style.background='var(--gray-50)'" onmouseout="this.style.background='transparent'" onclick="navigate('chat',{chatId:${c.id}})">
                <div class="user-avatar" style="width:36px;height:36px;font-size:0.75rem;flex-shrink:0">${c.partnerInitials}</div>
                <div style="flex:1;min-width:0">
                  <div style="display:flex;justify-content:space-between;align-items:baseline">
                    <strong style="font-size:0.85rem">${escapeHtml(c.partnerName)}</strong>
                    <span style="font-size:0.72rem;color:var(--gray-500);flex-shrink:0;margin-left:0.5rem">${c.time}</span>
                  </div>
                  <div style="font-size:0.75rem;color:var(--primary)">${escapeHtml(c.jobTitle)}</div>
                  <div style="font-size:0.78rem;color:var(--gray-500);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escapeHtml(c.lastMessage)}</div>
                </div>
                ${c.unread ? '<div style="width:8px;height:8px;background:var(--primary);border-radius:50%;flex-shrink:0"></div>' : ''}
              </div>
            `).join('')}
            ${chatList.length === 0 ? `
              <div style="padding:1.5rem;text-align:center;color:var(--gray-500);font-size:0.85rem">
                ${isEmployer ? 'Noch keine Bewerbernachrichten.' : 'Noch keine Nachrichten von Arbeitgebern.'}
              </div>` : ''}
          </div>
        </div>
      </div>
    </div>`;
}

// ===== SUPPORT SYSTEM (Supabase-backed) =====
function getSupportTickets() {
  return state._supportTicketsCache || [];
}

async function loadSupportTicketsForUser() {
  if (!state.user || !window.DB) { state._supportTicketsCache = []; return; }
  try {
    let rows;
    if (typeof isCurrentUserAdmin === 'function' && isCurrentUserAdmin() && DB.sb) {
      const res = await DB.sb.from('support_tickets').select('*').order('created_at', { ascending: false });
      rows = res.error ? [] : (res.data || []);
    } else {
      rows = await DB.listSupportTickets(state.user.id);
    }
    state._supportTicketsCache = (rows || []).map(r => ({
      id: r.id,
      userId: r.user_id,
      userName: state.user.name || '',
      userEmail: state.user.email || '',
      userRole: state.user.role || '',
      category: r.category,
      subject: r.subject,
      message: r.message,
      status: r.status,
      adminReply: r.admin_reply,
      createdAt: r.created_at
    }));
  } catch (e) {
    console.error('[loadSupportTicketsForUser]', e);
    state._supportTicketsCache = [];
  }
}

async function submitSupportTicket() {
  if (!state.user || !window.DB) { showToast('Bitte erst einloggen.', 'error'); return; }
  const category = document.getElementById('support-category')?.value;
  const subject = document.getElementById('support-subject')?.value?.trim();
  const message = document.getElementById('support-message')?.value?.trim();
  if (!category || !subject || !message) {
    showToast('Bitte fülle alle Felder aus.', 'error');
    return;
  }
  try {
    await DB.createSupportTicket({
      userId: state.user.id, category, subject, message
    });
    await loadSupportTicketsForUser();
    showToast('Dein Ticket wurde erfolgreich eingereicht!');
    const c = document.getElementById('support-category'); if (c) c.value = '';
    const s = document.getElementById('support-subject'); if (s) s.value = '';
    const m = document.getElementById('support-message'); if (m) m.value = '';
    render();
  } catch (e) {
    console.error('[submitSupportTicket]', e);
    showToast('Konnte Ticket nicht erstellen: ' + (e.message || ''), 'error');
  }
}

function renderSupport() {
  if (!state.user) return renderLogin();
  const isEmployer = state.user.role === 'employer';
  const tickets = getSupportTickets().filter(t => t.userId === state.user.id).reverse();

  return `
    <div class="page">
      <div class="dashboard-layout">
        ${isEmployer ? renderEmployerSidebar('support') : renderWorkerSidebar('support')}
        <div class="dashboard-content">
          <h2 style="margin-bottom:0.25rem">Support</h2>
          <p style="color:var(--gray-500);margin-bottom:1.5rem">Hast du ein Problem? Schreib uns und wir kümmern uns darum.</p>

          <!-- Neues Ticket -->
          <div class="card" style="padding:1.5rem;margin-bottom:2rem">
            <h3 style="margin-bottom:1rem">Neues Ticket erstellen</h3>
            <div style="display:flex;flex-direction:column;gap:0.75rem">
              <div>
                <label class="form-label">Kategorie</label>
                <select id="support-category" class="form-input">
                  <option value="">Bitte wählen...</option>
                  <option value="bug">Technisches Problem / Bug</option>
                  <option value="account">Konto & Profil</option>
                  <option value="payment">Zahlung & Abrechnung</option>
                  <option value="job">Job & Bewerbung</option>
                  <option value="user">Problem mit einem Nutzer</option>
                  <option value="other">Sonstiges</option>
                </select>
              </div>
              <div>
                <label class="form-label">Betreff</label>
                <input type="text" id="support-subject" class="form-input" placeholder="Kurze Beschreibung des Problems...">
              </div>
              <div>
                <label class="form-label">Nachricht</label>
                <textarea id="support-message" class="form-input" rows="5" placeholder="Beschreibe dein Problem so genau wie möglich..."></textarea>
              </div>
              <button class="btn btn-primary" onclick="submitSupportTicket()" style="align-self:flex-start">Ticket absenden</button>
            </div>
          </div>

          <!-- Meine Tickets -->
          <h3 style="margin-bottom:0.75rem">Meine Tickets</h3>
          ${tickets.length === 0 ? `
            <div class="card" style="padding:2rem;text-align:center;color:var(--gray-500)">
              Du hast noch keine Support-Tickets erstellt.
            </div>` : tickets.map(t => {
            const categoryLabels = { bug: 'Technisches Problem', account: 'Konto & Profil', payment: 'Zahlung', job: 'Job & Bewerbung', user: 'Nutzer-Problem', other: 'Sonstiges' };
            const statusColors = { open: '#f59e0b', 'in-progress': 'var(--primary)', closed: 'var(--success)' };
            const statusLabels = { open: 'Offen', 'in-progress': 'In Bearbeitung', closed: 'Erledigt' };
            return `
              <div class="card" style="padding:1rem 1.25rem;margin-bottom:0.75rem">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem">
                  <div>
                    <strong style="font-size:0.95rem">${escapeHtml(t.subject)}</strong>
                    <span style="margin-left:0.5rem;font-size:0.75rem;padding:0.15rem 0.5rem;border-radius:999px;background:var(--gray-100);color:var(--gray-500)">${categoryLabels[t.category] || t.category}</span>
                  </div>
                  <span style="font-size:0.75rem;font-weight:600;padding:0.2rem 0.6rem;border-radius:999px;background:${statusColors[t.status]}20;color:${statusColors[t.status]}">${statusLabels[t.status]}</span>
                </div>
                <p style="font-size:0.85rem;color:var(--gray-600);margin-bottom:0.5rem">${escapeHtml(t.message)}</p>
                <div style="font-size:0.75rem;color:var(--gray-500)">${new Date(t.createdAt).toLocaleString('de-DE')}</div>
                ${t.adminReply ? `
                  <div style="margin-top:0.75rem;padding:0.75rem;background:var(--gray-50);border-radius:8px;border-left:3px solid var(--primary)">
                    <div style="font-size:0.75rem;font-weight:600;color:var(--primary);margin-bottom:0.25rem">Antwort vom Support</div>
                    <p style="font-size:0.85rem;margin:0">${escapeHtml(t.adminReply)}</p>
                  </div>` : ''}
              </div>`;
          }).join('')}
        </div>
      </div>
    </div>`;
}

function renderReviews() {
  if (!state.user) return renderLogin();
  const isEmployer = state.user.role === 'employer';
  return `
    <div class="page">
      <div class="dashboard-layout">
        ${isEmployer ? renderEmployerSidebar('reviews') : renderWorkerSidebar('reviews')}
        <div class="dashboard-content">
          <h2 class="dashboard-title">★ Bewertungen</h2>

          <div class="review-restriction">
            ! Bewertungen können nur abgegeben werden, wenn du einen Job abgeschlossen hast. Dies stellt sicher, dass nur faire und aktuelle Bewertungen abgegeben werden.
          </div>

          <div class="tabs">
            <button class="tab ${!state.reviewTab || state.reviewTab==='received' ? 'active' : ''}" onclick="state.reviewTab='received';render()">Erhaltene Bewertungen</button>
            <button class="tab ${state.reviewTab==='given' ? 'active' : ''}" onclick="state.reviewTab='given';render()">Abgegebene Bewertungen</button>
          </div>

          <div class="rating-display" style="margin-bottom:1.5rem;padding:1.5rem;background:#fff;border-radius:var(--radius);border:1px solid var(--gray-200)">
            <div style="font-size:3rem;font-weight:800;color:var(--secondary)">4.5</div>
            <div>
              <div class="stars" style="font-size:1.5rem">
                ${'<span class="star filled">&#9733;</span>'.repeat(4)}
                <span class="star filled" style="opacity:0.5">&#9733;</span>
              </div>
              <div style="font-size:0.85rem;color:var(--gray-500)">Basierend auf 6 Bewertungen</div>
            </div>
          </div>

          ${JOBS.flatMap(j => j.reviews || []).map(r => `
            <div class="review-card">
              <div class="review-header">
                <div class="review-author">
                  <div class="user-avatar" style="width:36px;height:36px;font-size:0.75rem">${r.author.split(' ').map(n=>n[0]).join('')}</div>
                  <div>
                    <strong style="font-size:0.9rem">${escapeHtml(r.author)}</strong>
                    ${r.active ? '<span class="badge badge-success" style="margin-left:0.5rem">Aktiv</span>' : ''}
                  </div>
                </div>
                <div class="stars">${'<span class="star filled">&#9733;</span>'.repeat(r.rating)}${'<span class="star">&#9734;</span>'.repeat(5-r.rating)}</div>
              </div>
              <div class="review-text">${escapeHtml(r.text)}</div>
              <div class="review-date">${formatDate(r.date)}</div>
            </div>
          `).join('')}

          ${(() => {
            const completedJobs = getCompletedJobs();
            const hasActiveJob = !!getActiveJob();
            const canReview = completedJobs.length > 0 || hasActiveJob;
            if (!canReview) return `
            <div class="card" style="margin-top:1.5rem;opacity:0.6">
              <div class="card-header">Bewertung abgeben</div>
              <div class="card-body" style="text-align:center;padding:2rem">
                <div style="font-size:2rem;margin-bottom:0.5rem">🔒</div>
                <p style="color:var(--gray-500);font-size:0.9rem">Du musst zuerst einen Job abschließen, bevor du eine Bewertung abgeben kannst.</p>
              </div>
            </div>`;
            return `
            <div class="card" style="margin-top:1.5rem">
              <div class="card-header">Bewertung abgeben</div>
              <div class="card-body">
                <div class="form-group">
                  <label class="form-label">Bewertung</label>
                  <div class="stars" style="font-size:1.75rem" id="rating-stars">
                    ${[1,2,3,4,5].map(i => `<span class="star" onclick="setRating(${i})" data-rating="${i}">&#9734;</span>`).join('')}
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-label">Dein Feedback</label>
                  <textarea class="form-textarea" placeholder="Beschreibe deine Erfahrung..."></textarea>
                </div>
                <button class="btn btn-primary" onclick="submitReview(this)">Bewertung absenden</button>
              </div>
            </div>`;
          })()}
        </div>
      </div>
    </div>`;
}

// Boost-Code wurde komplett entfernt — aktuell keine kostenpflichtigen
// Features. Wenn später Stripe integriert wird, kann der Code aus
// der Git-Historie wiederhergestellt werden.

function setRating(n) {
  document.querySelectorAll('#rating-stars .star').forEach((s, i) => {
    s.innerHTML = i < n ? '&#9733;' : '&#9734;';
    s.classList.toggle('filled', i < n);
  });
}

function setJobRating(jobId, n) {
  document.querySelectorAll(`#job-rating-stars-${jobId} .star`).forEach((s, i) => {
    s.innerHTML = i < n ? '&#9733;' : '&#9734;';
    s.classList.toggle('filled', i < n);
  });
}

function submitJobReview(jobId) {
  const stars = document.querySelectorAll(`#job-rating-stars-${jobId} .star.filled`).length;
  const text = document.getElementById(`job-review-text-${jobId}`)?.value?.trim();
  if (!stars) { alert('Bitte wähle eine Bewertung (1-5 Sterne).'); return; }
  if (!text) { alert('Bitte schreibe einen kurzen Text.'); return; }
  alert('Bewertung abgegeben! Sie wird nach Prüfung veröffentlicht.');
}

// ===== ADMIN HELPERS =====
// The real adminToggleApproval lives further up in the file (DB-backed).
// The old localStorage version here has been removed — it was dead
// code that got overwritten by the DB version at load time anyway.

// Navigate to the admin panel. No separate admin password anymore —
// just check whether the currently logged-in user is an admin.
async function openAdminPanel() {
  if (!state.user) {
    showToast('Bitte erst mit deiner Admin-E-Mail einloggen.', 'info');
    navigate('login');
    return;
  }
  if (!isCurrentUserAdmin()) {
    showToast('Dein Konto hat keine Admin-Berechtigung.', 'error');
    return;
  }
  try { await loadAllProfilesForAdmin(); } catch (e) { console.error('[openAdminPanel] profiles', e); }
  navigate('admin-panel');
}

// Refresh the admin profile list on demand (used by the
// "Aktualisieren" button on the admin panel).
async function adminRefreshProfiles() {
  try {
    await loadAllProfilesForAdmin();
    render();
  } catch (e) {
    console.error('[adminRefreshProfiles]', e);
    showToast('Liste konnte nicht aktualisiert werden: ' + (e.message || ''), 'error');
  }
}

// Flip the `approved` flag on an employer profile. Backed by the
// profiles_admin_update_approval RLS policy from supabase-add-approval.sql,
// which only lets the hard-coded admin emails write to other people's rows.
async function adminToggleApproval(userId, newApproved) {
  if (!window.DB || !DB.sb) return;
  try {
    const res = await DB.sb.from('profiles').update({ approved: !!newApproved }).eq('id', userId);
    if (res.error) throw res.error;
    showToast(newApproved ? 'Arbeitgeber freigeschaltet.' : 'Arbeitgeber gesperrt.');
    await loadAllProfilesForAdmin();
    render();
  } catch (e) {
    console.error('[adminToggleApproval]', e);
    showToast('Konnte Status nicht ändern: ' + (e.message || ''), 'error');
  }
}

// Remove an employer by wiping their profile data and locking the
// account. We can't delete the Supabase Auth user from the client
// (that requires the service_role key), but blanking the profile +
// setting approved=false effectively locks them out.
async function adminRemoveEmployer(userId) {
  if (!window.DB || !DB.sb) return;
  if (!confirm('Diesen Arbeitgeber wirklich entfernen? Der Account wird gesperrt und seine Daten gelöscht.')) return;
  try {
    const res = await DB.sb.from('profiles').update({
      approved: false,
      name: '[Entfernt]',
      company: null,
      about: null,
      phone: null,
      logo: null,
      images: null
    }).eq('id', userId);
    if (res.error) throw res.error;
    // Also delete all jobs posted by this employer
    const jobRes = await DB.sb.from('jobs').delete().eq('employer_id', userId);
    if (jobRes.error) console.error('[adminRemoveEmployer] jobs', jobRes.error);
    showToast('Arbeitgeber entfernt und alle Stellenanzeigen gelöscht.');
    await loadAllProfilesForAdmin();
    await loadJobsFromDB();
    render();
  } catch (e) {
    console.error('[adminRemoveEmployer]', e);
    showToast('Konnte Arbeitgeber nicht entfernen: ' + (e.message || ''), 'error');
  }
}

// Admin-Logout loggt den User komplett aus (es gibt keinen separaten
// Admin-Session mehr — die Admin-Rechte kommen aus der normalen
// Supabase-Auth-Session).
async function adminLogout() {
  await logout();
}

// ===== LEGAL PAGES =====
function renderImpressum() {
  return `<div class="page page-narrow" style="padding-top:3rem">
    <h1 style="font-size:2rem;font-weight:800;margin-bottom:0.5rem;font-family:'Playfair Display',serif">Impressum</h1>
    <p style="color:var(--gray-500);font-size:0.85rem;margin-bottom:2rem">Angaben gemäß § 5 DDG (Digitale-Dienste-Gesetz)</p>

    <div style="background:#fff;border:1px solid var(--gray-200);border-radius:var(--radius-lg);padding:2rem;margin-bottom:1.5rem">
      <h3 style="font-size:1rem;font-weight:700;margin-bottom:0.75rem;color:var(--gray-800)">Betreiber der Website</h3>
      <p style="color:var(--gray-600);line-height:1.8;font-size:0.9rem">
        WorkPilot GmbH<br>
        Musterstraße 1<br>
        40213 Düsseldorf<br>
        Deutschland
      </p>
    </div>
    <div style="background:#fff;border:1px solid var(--gray-200);border-radius:var(--radius-lg);padding:2rem;margin-bottom:1.5rem">
      <h3 style="font-size:1rem;font-weight:700;margin-bottom:0.75rem;color:var(--gray-800)">Kontakt</h3>
      <p style="color:var(--gray-600);line-height:1.8;font-size:0.9rem">
        Telefon: +49 (0) 211 123 456 78<br>
        E-Mail: info@workpilot.de<br>
        Website: www.workpilot.de
      </p>
    </div>
    <div style="background:#fff;border:1px solid var(--gray-200);border-radius:var(--radius-lg);padding:2rem;margin-bottom:1.5rem">
      <h3 style="font-size:1rem;font-weight:700;margin-bottom:0.75rem;color:var(--gray-800)">Vertretungsberechtigte Geschäftsführer</h3>
      <p style="color:var(--gray-600);line-height:1.8;font-size:0.9rem">Max Mustermann, Anna Musterfrau</p>
    </div>
    <div style="background:#fff;border:1px solid var(--gray-200);border-radius:var(--radius-lg);padding:2rem;margin-bottom:1.5rem">
      <h3 style="font-size:1rem;font-weight:700;margin-bottom:0.75rem;color:var(--gray-800)">Registereintrag</h3>
      <p style="color:var(--gray-600);line-height:1.8;font-size:0.9rem">
        Registergericht: Amtsgericht Düsseldorf<br>
        Registernummer: HRB 123456<br>
        Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG: DE123456789
      </p>
    </div>
    <div style="background:#fff;border:1px solid var(--gray-200);border-radius:var(--radius-lg);padding:2rem;margin-bottom:1.5rem">
      <h3 style="font-size:1rem;font-weight:700;margin-bottom:0.75rem;color:var(--gray-800)">Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h3>
      <p style="color:var(--gray-600);line-height:1.8;font-size:0.9rem">Max Mustermann<br>Musterstraße 1<br>40213 Düsseldorf</p>
    </div>
    <div style="background:#fff;border:1px solid var(--gray-200);border-radius:var(--radius-lg);padding:2rem;margin-bottom:1.5rem">
      <h3 style="font-size:1rem;font-weight:700;margin-bottom:0.75rem;color:var(--gray-800)">EU-Streitschlichtung</h3>
      <p style="color:var(--gray-600);line-height:1.8;font-size:0.9rem">Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit. Unsere E-Mail-Adresse finden Sie oben im Impressum. Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>
    </div>
    <div style="background:#fff;border:1px solid var(--gray-200);border-radius:var(--radius-lg);padding:2rem;margin-bottom:1.5rem">
      <h3 style="font-size:1rem;font-weight:700;margin-bottom:0.75rem;color:var(--gray-800)">Haftung für Inhalte</h3>
      <p style="color:var(--gray-600);line-height:1.8;font-size:0.9rem">Als Diensteanbieter sind wir gemäß § 7 Abs. 1 DDG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 DDG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.</p>
      <p style="color:var(--gray-600);line-height:1.8;font-size:0.9rem;margin-top:0.75rem">Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.</p>
    </div>
    <div style="background:#fff;border:1px solid var(--gray-200);border-radius:var(--radius-lg);padding:2rem;margin-bottom:1.5rem">
      <h3 style="font-size:1rem;font-weight:700;margin-bottom:0.75rem;color:var(--gray-800)">Haftung für Links</h3>
      <p style="color:var(--gray-600);line-height:1.8;font-size:0.9rem">Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Links umgehend entfernen.</p>
    </div>
    <div style="background:#fff;border:1px solid var(--gray-200);border-radius:var(--radius-lg);padding:2rem;margin-bottom:1.5rem">
      <h3 style="font-size:1rem;font-weight:700;margin-bottom:0.75rem;color:var(--gray-800)">Urheberrecht</h3>
      <p style="color:var(--gray-600);line-height:1.8;font-size:0.9rem">Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers. Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet.</p>
    </div>
  </div>`;
}

function renderDatenschutz() {
  return `<div class="page page-narrow" style="padding-top:3rem">
    <h1 style="font-size:2rem;font-weight:800;margin-bottom:0.5rem;font-family:'Playfair Display',serif">Datenschutzerklärung</h1>
    <p style="color:var(--gray-500);font-size:0.85rem;margin-bottom:2rem">Stand: April 2026</p>

    <div style="background:#fff;border:1px solid var(--gray-200);border-radius:var(--radius-lg);padding:2rem;margin-bottom:1.5rem">
      <h3 style="font-size:1rem;font-weight:700;margin-bottom:0.75rem;color:var(--gray-800)">1. Verantwortlicher</h3>
      <p style="color:var(--gray-600);line-height:1.8;font-size:0.9rem">Verantwortlich im Sinne der DSGVO:<br>WorkPilot GmbH<br>Musterstraße 1, 40213 Düsseldorf<br>E-Mail: datenschutz@workpilot.de<br>Telefon: +49 (0) 211 123 456 78</p>
    </div>

    <div style="background:#fff;border:1px solid var(--gray-200);border-radius:var(--radius-lg);padding:2rem;margin-bottom:1.5rem">
      <h3 style="font-size:1rem;font-weight:700;margin-bottom:0.75rem;color:var(--gray-800)">2. Übersicht der Datenverarbeitungen</h3>
      <p style="color:var(--gray-600);line-height:1.8;font-size:0.9rem">Wir verarbeiten personenbezogene Daten unserer Nutzer, soweit dies zur Bereitstellung unserer Plattform, zur Vermittlung von Beschäftigungsverhältnissen und zur Verbesserung unserer Dienste erforderlich ist. Hierzu zählen insbesondere Bestandsdaten (Name, Adresse), Kontaktdaten (E-Mail, Telefon), Inhaltsdaten (Eingaben in Formularen, Lebenslauf, Bewerbungsunterlagen), Nutzungsdaten (besuchte Seiten, Zugriffszeiten) sowie Vertragsdaten (Vertragsgegenstand, Laufzeit).</p>
    </div>

    <div style="background:#fff;border:1px solid var(--gray-200);border-radius:var(--radius-lg);padding:2rem;margin-bottom:1.5rem">
      <h3 style="font-size:1rem;font-weight:700;margin-bottom:0.75rem;color:var(--gray-800)">3. Rechtsgrundlagen</h3>
      <p style="color:var(--gray-600);line-height:1.8;font-size:0.9rem">Die Verarbeitung personenbezogener Daten erfolgt auf Grundlage folgender Rechtsgrundlagen:</p>
      <ul style="color:var(--gray-600);line-height:2;font-size:0.9rem;padding-left:1.25rem;margin-top:0.5rem">
        <li><strong>Art. 6 Abs. 1 lit. a DSGVO</strong> — Einwilligung des Nutzers (z. B. Newsletter, optionale Profilangaben)</li>
        <li><strong>Art. 6 Abs. 1 lit. b DSGVO</strong> — Erfüllung eines Vertrages oder vorvertraglicher Maßnahmen (z. B. Registrierung, Jobvermittlung)</li>
        <li><strong>Art. 6 Abs. 1 lit. c DSGVO</strong> — Erfüllung rechtlicher Verpflichtungen (z. B. steuerrechtliche Aufbewahrungspflichten)</li>
        <li><strong>Art. 6 Abs. 1 lit. f DSGVO</strong> — Berechtigtes Interesse (z. B. Analyse, Sicherheit, Betrugsprävention)</li>
      </ul>
    </div>

    <div style="background:#fff;border:1px solid var(--gray-200);border-radius:var(--radius-lg);padding:2rem;margin-bottom:1.5rem">
      <h3 style="font-size:1rem;font-weight:700;margin-bottom:0.75rem;color:var(--gray-800)">4. Registrierung und Nutzerkonto</h3>
      <p style="color:var(--gray-600);line-height:1.8;font-size:0.9rem">Bei der Registrierung erheben wir: Name, E-Mail-Adresse, Wohnort und Rolle (Arbeitnehmer/Arbeitgeber). Arbeitnehmer können zusätzlich angeben: Geburtsdatum, Verfügbarkeit, Skills, Lebenslauf und Motivationsschreiben. Arbeitgeber geben zusätzlich an: Firmenname, Branche und Unternehmensadresse. Diese Daten werden zur Vertragserfüllung (Art. 6 Abs. 1 lit. b DSGVO) verarbeitet und in Ihrem Browser lokal gespeichert (localStorage).</p>
    </div>

    <div style="background:#fff;border:1px solid var(--gray-200);border-radius:var(--radius-lg);padding:2rem;margin-bottom:1.5rem">
      <h3 style="font-size:1rem;font-weight:700;margin-bottom:0.75rem;color:var(--gray-800)">5. Jobvermittlung und Bewerberdaten</h3>
      <p style="color:var(--gray-600);line-height:1.8;font-size:0.9rem">Wenn Sie sich auf eine Stellenanzeige bewerben, werden Ihre Profildaten (Name, Skills, Verfügbarkeit) sowie ggf. Ihr Lebenslauf und Motivationsschreiben an den jeweiligen Arbeitgeber weitergeleitet. Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO (vorvertragliche Maßnahmen). Der Arbeitgeber erhält ausschließlich die für die Bewerbung relevanten Daten.</p>
    </div>

    <div style="background:#fff;border:1px solid var(--gray-200);border-radius:var(--radius-lg);padding:2rem;margin-bottom:1.5rem">
      <h3 style="font-size:1rem;font-weight:700;margin-bottom:0.75rem;color:var(--gray-800)">6. Chat und Kommunikation</h3>
      <p style="color:var(--gray-600);line-height:1.8;font-size:0.9rem">Die Plattform bietet eine integrierte Chat-Funktion zur Kommunikation zwischen Arbeitgebern und Bewerbern. Chatnachrichten werden lokal in Ihrem Browser gespeichert und nicht an unsere Server übertragen. Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO.</p>
    </div>

    <div style="background:#fff;border:1px solid var(--gray-200);border-radius:var(--radius-lg);padding:2rem;margin-bottom:1.5rem">
      <h3 style="font-size:1rem;font-weight:700;margin-bottom:0.75rem;color:var(--gray-800)">7. Cookies und lokale Speicherung</h3>
      <p style="color:var(--gray-600);line-height:1.8;font-size:0.9rem">Diese Website verwendet localStorage zur Speicherung von Nutzereinstellungen, Sitzungsdaten und Nutzerprofilen. Diese Daten werden ausschließlich lokal in Ihrem Browser gespeichert und nicht an externe Server übertragen. Es werden keine Tracking-Cookies oder Analyse-Tools von Drittanbietern eingesetzt. Sie können die lokal gespeicherten Daten jederzeit über Ihre Browsereinstellungen löschen.</p>
    </div>

    <div style="background:#fff;border:1px solid var(--gray-200);border-radius:var(--radius-lg);padding:2rem;margin-bottom:1.5rem">
      <h3 style="font-size:1rem;font-weight:700;margin-bottom:0.75rem;color:var(--gray-800)">8. Zahlungsabwicklung</h3>
      <p style="color:var(--gray-600);line-height:1.8;font-size:0.9rem">Die Plattform bietet derzeit ausschließlich kostenfreie Dienste an. Es werden keine Zahlungsdaten erhoben oder verarbeitet.</p>
    </div>

    <div style="background:#fff;border:1px solid var(--gray-200);border-radius:var(--radius-lg);padding:2rem;margin-bottom:1.5rem">
      <h3 style="font-size:1rem;font-weight:700;margin-bottom:0.75rem;color:var(--gray-800)">9. Speicherdauer</h3>
      <p style="color:var(--gray-600);line-height:1.8;font-size:0.9rem">Personenbezogene Daten werden gelöscht, sobald der Zweck der Speicherung entfällt. Nutzerdaten werden bei Kündigung des Kontos gelöscht. Daten, die aufgrund gesetzlicher Aufbewahrungsfristen aufbewahrt werden müssen (z. B. steuerrechtlich: 10 Jahre), werden nach Ablauf der Frist gelöscht.</p>
    </div>

    <div style="background:#fff;border:1px solid var(--gray-200);border-radius:var(--radius-lg);padding:2rem;margin-bottom:1.5rem">
      <h3 style="font-size:1rem;font-weight:700;margin-bottom:0.75rem;color:var(--gray-800)">10. Ihre Rechte als betroffene Person</h3>
      <p style="color:var(--gray-600);line-height:1.8;font-size:0.9rem">Ihnen stehen folgende Rechte zu:</p>
      <ul style="color:var(--gray-600);line-height:2;font-size:0.9rem;padding-left:1.25rem;margin-top:0.5rem">
        <li><strong>Auskunft</strong> (Art. 15 DSGVO) — Recht auf Auskunft über Ihre gespeicherten Daten</li>
        <li><strong>Berichtigung</strong> (Art. 16 DSGVO) — Recht auf Korrektur unrichtiger Daten</li>
        <li><strong>Löschung</strong> (Art. 17 DSGVO) — Recht auf Löschung Ihrer Daten</li>
        <li><strong>Einschränkung</strong> (Art. 18 DSGVO) — Recht auf Einschränkung der Verarbeitung</li>
        <li><strong>Datenübertragbarkeit</strong> (Art. 20 DSGVO) — Recht auf Erhalt Ihrer Daten in maschinenlesbarem Format</li>
        <li><strong>Widerspruch</strong> (Art. 21 DSGVO) — Recht auf Widerspruch gegen die Verarbeitung</li>
        <li><strong>Widerruf</strong> — Erteilte Einwilligungen können jederzeit mit Wirkung für die Zukunft widerrufen werden</li>
        <li><strong>Beschwerde</strong> (Art. 77 DSGVO) — Recht auf Beschwerde bei einer Datenschutz-Aufsichtsbehörde</li>
      </ul>
      <p style="color:var(--gray-600);line-height:1.8;font-size:0.9rem;margin-top:0.75rem">Kontaktieren Sie uns hierzu unter datenschutz@workpilot.de.</p>
    </div>

    <div style="background:#fff;border:1px solid var(--gray-200);border-radius:var(--radius-lg);padding:2rem;margin-bottom:1.5rem">
      <h3 style="font-size:1rem;font-weight:700;margin-bottom:0.75rem;color:var(--gray-800)">11. Änderungen dieser Datenschutzerklärung</h3>
      <p style="color:var(--gray-600);line-height:1.8;font-size:0.9rem">Wir behalten uns vor, diese Datenschutzerklärung anzupassen, damit sie stets den aktuellen rechtlichen Anforderungen entspricht oder um Änderungen unserer Leistungen umzusetzen. Für Ihren erneuten Besuch gilt dann die neue Datenschutzerklärung.</p>
    </div>
  </div>`;
}

function renderAGB() {
  return `<div class="page page-narrow" style="padding-top:3rem">
    <h1 style="font-size:2rem;font-weight:800;margin-bottom:0.5rem;font-family:'Playfair Display',serif">Allgemeine Geschäftsbedingungen</h1>
    <p style="color:var(--gray-500);font-size:0.85rem;margin-bottom:2rem">Stand: April 2026</p>

    <div style="background:#fff;border:1px solid var(--gray-200);border-radius:var(--radius-lg);padding:2rem;margin-bottom:1.5rem">
      <h3 style="font-size:1rem;font-weight:700;margin-bottom:0.75rem;color:var(--gray-800)">§ 1 Geltungsbereich und Vertragsgegenstand</h3>
      <p style="color:var(--gray-600);line-height:1.8;font-size:0.9rem">(1) Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für sämtliche Leistungen, die über die Plattform WorkPilot (nachfolgend „Plattform") der WorkPilot GmbH, Musterstraße 1, 40213 Düsseldorf (nachfolgend „Betreiber"), erbracht werden.</p>
      <p style="color:var(--gray-600);line-height:1.8;font-size:0.9rem;margin-top:0.5rem">(2) Die Plattform ist ein Online-Marktplatz, der Arbeitgeber und Arbeitnehmer — insbesondere Schüler, Studenten und junge Erwachsene — zusammenbringt. Der Betreiber vermittelt lediglich den Kontakt; ein Arbeitsvertrag kommt ausschließlich zwischen Arbeitgeber und Arbeitnehmer zustande.</p>
      <p style="color:var(--gray-600);line-height:1.8;font-size:0.9rem;margin-top:0.5rem">(3) Mit der Registrierung akzeptiert der Nutzer diese AGB.</p>
    </div>

    <div style="background:#fff;border:1px solid var(--gray-200);border-radius:var(--radius-lg);padding:2rem;margin-bottom:1.5rem">
      <h3 style="font-size:1rem;font-weight:700;margin-bottom:0.75rem;color:var(--gray-800)">§ 2 Registrierung und Nutzerkonto</h3>
      <p style="color:var(--gray-600);line-height:1.8;font-size:0.9rem">(1) Für die Nutzung bestimmter Funktionen ist eine kostenlose Registrierung erforderlich. Die Registrierung steht natürlichen Personen ab 14 Jahren sowie Unternehmen offen.</p>
      <p style="color:var(--gray-600);line-height:1.8;font-size:0.9rem;margin-top:0.5rem">(2) Der Nutzer verpflichtet sich, bei der Registrierung wahrheitsgemäße und vollständige Angaben zu machen und diese bei Änderungen unverzüglich zu aktualisieren.</p>
      <p style="color:var(--gray-600);line-height:1.8;font-size:0.9rem;margin-top:0.5rem">(3) Jeder Nutzer darf nur ein Konto anlegen. Die Zugangsdaten sind vertraulich zu behandeln und Dritten nicht zugänglich zu machen.</p>
      <p style="color:var(--gray-600);line-height:1.8;font-size:0.9rem;margin-top:0.5rem">(4) Arbeitgeber-Konten können einer Prüfung und Freischaltung durch den Betreiber unterzogen werden, bevor Stellenanzeigen veröffentlicht werden können.</p>
    </div>

    <div style="background:#fff;border:1px solid var(--gray-200);border-radius:var(--radius-lg);padding:2rem;margin-bottom:1.5rem">
      <h3 style="font-size:1rem;font-weight:700;margin-bottom:0.75rem;color:var(--gray-800)">§ 3 Leistungen der Plattform</h3>
      <p style="color:var(--gray-600);line-height:1.8;font-size:0.9rem">(1) <strong>Für Arbeitnehmer</strong> bietet die Plattform: Erstellung eines Nutzerprofils, Jobsuche mit Filteroptionen, Ein-Klick-Bewerbung, automatische Erstellung von Motivationsschreiben, Lebenslauf-Builder, Chat-Kommunikation mit Arbeitgebern.</p>
      <p style="color:var(--gray-600);line-height:1.8;font-size:0.9rem;margin-top:0.5rem">(2) <strong>Für Arbeitgeber</strong> bietet die Plattform: Veröffentlichung von Stellenanzeigen, Verwaltung von Bewerbungen, Chat-Kommunikation mit Bewerbern und Analyse-Dashboard.</p>
      <p style="color:var(--gray-600);line-height:1.8;font-size:0.9rem;margin-top:0.5rem">(3) Die Nutzung der Plattform ist für Arbeitnehmer und Arbeitgeber vollständig kostenlos.</p>
    </div>

    <div style="background:#fff;border:1px solid var(--gray-200);border-radius:var(--radius-lg);padding:2rem;margin-bottom:1.5rem">
      <h3 style="font-size:1rem;font-weight:700;margin-bottom:0.75rem;color:var(--gray-800)">§ 4 Kostenfreiheit</h3>
      <p style="color:var(--gray-600);line-height:1.8;font-size:0.9rem">(1) Die Nutzung sämtlicher Funktionen der Plattform ist derzeit kostenlos. Es werden keine kostenpflichtigen Dienste angeboten.</p>
      <p style="color:var(--gray-600);line-height:1.8;font-size:0.9rem;margin-top:0.5rem">(2) Sollten in Zukunft kostenpflichtige Leistungen eingeführt werden, werden die betroffenen Nutzer rechtzeitig informiert und um ausdrückliche Zustimmung gebeten, bevor ein kostenpflichtiger Vertrag zustande kommt.</p>
    </div>

    <div style="background:#fff;border:1px solid var(--gray-200);border-radius:var(--radius-lg);padding:2rem;margin-bottom:1.5rem">
      <h3 style="font-size:1rem;font-weight:700;margin-bottom:0.75rem;color:var(--gray-800)">§ 5 Pflichten der Nutzer</h3>
      <p style="color:var(--gray-600);line-height:1.8;font-size:0.9rem">(1) Nutzer verpflichten sich, die Plattform nicht missbräuchlich zu nutzen. Insbesondere ist es untersagt:</p>
      <ul style="color:var(--gray-600);line-height:2;font-size:0.9rem;padding-left:1.25rem;margin-top:0.5rem">
        <li>Falsche, irreführende oder rechtswidrige Inhalte zu veröffentlichen</li>
        <li>Stellenanzeigen oder Bewerbungen unter falschen Angaben zu erstellen</li>
        <li>Andere Nutzer zu belästigen, zu diskriminieren oder zu bedrohen</li>
        <li>Die Plattform für gewerbliche Zwecke außerhalb der vorgesehenen Nutzung einzusetzen</li>
        <li>Automatisierte Abrufe oder Scraping der Plattform durchzuführen</li>
      </ul>
      <p style="color:var(--gray-600);line-height:1.8;font-size:0.9rem;margin-top:0.5rem">(2) Arbeitgeber stellen sicher, dass ihre Stellenanzeigen den gesetzlichen Anforderungen entsprechen, insbesondere dem Allgemeinen Gleichbehandlungsgesetz (AGG) und den Bestimmungen zum Jugendarbeitsschutz (JArbSchG).</p>
    </div>

    <div style="background:#fff;border:1px solid var(--gray-200);border-radius:var(--radius-lg);padding:2rem;margin-bottom:1.5rem">
      <h3 style="font-size:1rem;font-weight:700;margin-bottom:0.75rem;color:var(--gray-800)">§ 6 Haftung und Haftungsbeschränkung</h3>
      <p style="color:var(--gray-600);line-height:1.8;font-size:0.9rem">(1) Der Betreiber ist ein Vermittler und haftet nicht für die Richtigkeit, Vollständigkeit oder Aktualität der von Nutzern eingestellten Inhalte.</p>
      <p style="color:var(--gray-600);line-height:1.8;font-size:0.9rem;margin-top:0.5rem">(2) Der Betreiber haftet nicht für das Zustandekommen, den Inhalt oder die Durchführung von Arbeitsverhältnissen, die über die Plattform angebahnt werden.</p>
      <p style="color:var(--gray-600);line-height:1.8;font-size:0.9rem;margin-top:0.5rem">(3) Die Haftung des Betreibers für leichte Fahrlässigkeit ist auf die Verletzung vertragswesentlicher Pflichten (Kardinalpflichten) beschränkt und der Höhe nach auf den vorhersehbaren, vertragstypischen Schaden begrenzt.</p>
      <p style="color:var(--gray-600);line-height:1.8;font-size:0.9rem;margin-top:0.5rem">(4) Die vorstehenden Haftungsbeschränkungen gelten nicht bei Vorsatz, grober Fahrlässigkeit, der Verletzung von Leben, Körper oder Gesundheit sowie bei zwingenden gesetzlichen Haftungstatbeständen.</p>
    </div>

    <div style="background:#fff;border:1px solid var(--gray-200);border-radius:var(--radius-lg);padding:2rem;margin-bottom:1.5rem">
      <h3 style="font-size:1rem;font-weight:700;margin-bottom:0.75rem;color:var(--gray-800)">§ 7 Datenschutz</h3>
      <p style="color:var(--gray-600);line-height:1.8;font-size:0.9rem">Der Schutz personenbezogener Daten ist uns wichtig. Einzelheiten zur Verarbeitung personenbezogener Daten entnehmen Sie bitte unserer <a href="#" onclick="navigate('datenschutz')" style="color:var(--primary);font-weight:600">Datenschutzerklärung</a>.</p>
    </div>

    <div style="background:#fff;border:1px solid var(--gray-200);border-radius:var(--radius-lg);padding:2rem;margin-bottom:1.5rem">
      <h3 style="font-size:1rem;font-weight:700;margin-bottom:0.75rem;color:var(--gray-800)">§ 8 Geistiges Eigentum</h3>
      <p style="color:var(--gray-600);line-height:1.8;font-size:0.9rem">(1) Alle Inhalte der Plattform (Design, Texte, Grafiken, Software) sind urheberrechtlich geschützt und Eigentum des Betreibers.</p>
      <p style="color:var(--gray-600);line-height:1.8;font-size:0.9rem;margin-top:0.5rem">(2) Nutzer räumen dem Betreiber ein einfaches, nicht-exklusives Nutzungsrecht an den von ihnen eingestellten Inhalten ein, soweit dies zur Erbringung der Plattformdienste erforderlich ist.</p>
    </div>

    <div style="background:#fff;border:1px solid var(--gray-200);border-radius:var(--radius-lg);padding:2rem;margin-bottom:1.5rem">
      <h3 style="font-size:1rem;font-weight:700;margin-bottom:0.75rem;color:var(--gray-800)">§ 9 Kündigung und Kontosperrung</h3>
      <p style="color:var(--gray-600);line-height:1.8;font-size:0.9rem">(1) Nutzer können ihr Konto jederzeit ohne Angabe von Gründen kündigen.</p>
      <p style="color:var(--gray-600);line-height:1.8;font-size:0.9rem;margin-top:0.5rem">(2) Der Betreiber ist berechtigt, Nutzerkonten bei Verstößen gegen diese AGB vorübergehend zu sperren oder dauerhaft zu löschen. Bei schwerwiegenden Verstößen kann die Sperrung ohne vorherige Abmahnung erfolgen.</p>
      <p style="color:var(--gray-600);line-height:1.8;font-size:0.9rem;margin-top:0.5rem">(3) Inaktive Konten können nach 12 Monaten ohne Aktivität gelöscht werden. Der Nutzer wird zuvor per E-Mail benachrichtigt.</p>
    </div>

    <div style="background:#fff;border:1px solid var(--gray-200);border-radius:var(--radius-lg);padding:2rem;margin-bottom:1.5rem">
      <h3 style="font-size:1rem;font-weight:700;margin-bottom:0.75rem;color:var(--gray-800)">§ 10 Änderungen der AGB</h3>
      <p style="color:var(--gray-600);line-height:1.8;font-size:0.9rem">(1) Der Betreiber behält sich vor, diese AGB mit Wirkung für die Zukunft zu ändern, soweit dies aus sachlich gerechtfertigten Gründen erforderlich ist und den Nutzer nicht unangemessen benachteiligt.</p>
      <p style="color:var(--gray-600);line-height:1.8;font-size:0.9rem;margin-top:0.5rem">(2) Der Nutzer wird über Änderungen mindestens 30 Tage vor Inkrafttreten informiert. Widerspricht der Nutzer den Änderungen nicht innerhalb dieser Frist, gelten die neuen AGB als akzeptiert.</p>
    </div>

    <div style="background:#fff;border:1px solid var(--gray-200);border-radius:var(--radius-lg);padding:2rem;margin-bottom:1.5rem">
      <h3 style="font-size:1rem;font-weight:700;margin-bottom:0.75rem;color:var(--gray-800)">§ 11 Schlussbestimmungen</h3>
      <p style="color:var(--gray-600);line-height:1.8;font-size:0.9rem">(1) Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts.</p>
      <p style="color:var(--gray-600);line-height:1.8;font-size:0.9rem;margin-top:0.5rem">(2) Gerichtsstand für alle Streitigkeiten ist, soweit gesetzlich zulässig, Düsseldorf.</p>
      <p style="color:var(--gray-600);line-height:1.8;font-size:0.9rem;margin-top:0.5rem">(3) Sollten einzelne Bestimmungen dieser AGB unwirksam sein oder werden, so bleibt die Wirksamkeit der übrigen Bestimmungen unberührt. An die Stelle der unwirksamen Bestimmung tritt eine wirksame Regelung, die dem wirtschaftlichen Zweck der unwirksamen Bestimmung am nächsten kommt.</p>
    </div>
  </div>`;
}

// renderAdminLogin / adminLogin removed — admin access now goes
// through the normal Supabase login flow (see openAdminPanel).

function buildDonutSVG(segments, size, strokeWidth, centerLabel, centerSub) {
  const r = (size - strokeWidth) / 2;
  const cx = size / 2, cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
  let offset = 0;
  const paths = segments.map(seg => {
    const pct = seg.value / total;
    const dash = pct * circumference;
    const gap = circumference - dash;
    const rotation = (offset * 360 / total) - 90;
    offset += seg.value;
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${seg.color}" stroke-width="${strokeWidth}"
      stroke-dasharray="${dash} ${gap}" transform="rotate(${rotation} ${cx} ${cy})"
      style="transition:stroke-dasharray 0.8s ease"/>`;
  });
  if (total <= 1 && segments.every(s => s.value === 0)) {
    paths.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#e5e7eb" stroke-width="${strokeWidth}"/>`);
  }
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    ${paths.join('')}
    <text x="${cx}" y="${cy - 6}" text-anchor="middle" font-size="22" font-weight="800" fill="#1f2937">${centerLabel}</text>
    <text x="${cx}" y="${cy + 14}" text-anchor="middle" font-size="10" fill="#9ca3af" font-weight="500">${centerSub}</text>
  </svg>`;
}

function renderAdminPanel() {
  const data = getAnalyticsData();
  const formatEuro = (n) => n.toFixed(2).replace('.', ',') + ' EUR';
  const formatEuroShort = (n) => n >= 1000 ? (n/1000).toFixed(1).replace('.',',') + 'k EUR' : n.toFixed(2).replace('.',',') + ' EUR';

  const onlineDonut = buildDonutSVG([
    { value: data.online.employer, color: '#f97316', label: 'Arbeitgeber' },
    { value: data.online.worker, color: '#2563eb', label: 'Arbeitnehmer' },
    { value: data.online.guest, color: '#8b5cf6', label: 'Gast' }
  ], 140, 18, data.online.total, 'Online');

  const usersDonut = buildDonutSVG([
    { value: data.users.employers, color: '#f97316', label: 'Arbeitgeber' },
    { value: data.users.workers, color: '#2563eb', label: 'Arbeitnehmer' }
  ], 140, 18, data.users.total, 'Registriert');

  const maxVisits = Math.max(...data.visits.last7Days.map(d => d.count), 1);
  const barColors = ['#6366f1','#818cf8','#a78bfa','#8b5cf6','#7c3aed','#6d28d9','#5b21b6'];
  const chartBars = data.visits.last7Days.map((d, i) => {
    const pct = Math.max((d.count / maxVisits) * 100, 3);
    return `<div class="admin-bar-col"><div class="admin-bar-value">${d.count}</div><div class="admin-bar-track"><div class="admin-bar-fill" style="height:${pct}%;background:${barColors[i]};animation-delay:${i * 0.08}s"></div></div><div class="admin-bar-label">${d.date.split(',')[0]}</div></div>`;
  }).join('');

  const productEntries = Object.entries(data.revenue.byProduct);
  const maxProductRevenue = productEntries.length > 0 ? Math.max(...productEntries.map(([,i]) => i.total), 1) : 1;
  const productColors = { 'Standard Boost (7 Tage)': '#f97316', 'Standard Boost (30 Tage)': '#2563eb', 'Premium Boost (14 Tage)': '#8b5cf6' };
  const revenueChart = productEntries.length > 0
    ? productEntries.map(([product, info]) => {
      const pct = (info.total / maxProductRevenue) * 100;
      const color = productColors[product] || '#6366f1';
      return `<div class="admin-hbar-row"><div class="admin-hbar-info"><span class="admin-hbar-dot" style="background:${color}"></span><span class="admin-hbar-name">${product}</span><span class="admin-hbar-count">${info.count}x</span></div><div class="admin-hbar-track"><div class="admin-hbar-fill" style="width:${pct}%;background:${color}"></div></div><div class="admin-hbar-amount">${formatEuro(info.total)}</div></div>`;
    }).join('')
    : '<div style="text-align:center;padding:2rem;color:var(--gray-500)">Noch keine Verkäufe</div>';

  const revenueDonut = buildDonutSVG(
    productEntries.map(([product, info]) => ({ value: info.total, color: productColors[product] || '#6366f1', label: product })),
    140, 18, formatEuroShort(data.revenue.total), 'Umsatz'
  );

  return `
    <div class="page-wide admin-panel" style="padding-top:2rem">
      <div class="admin-header">
        <div style="display:flex;align-items:center;gap:1rem">
          <div class="admin-header-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
          <div><h1 style="font-size:1.5rem;margin:0">Admin-Kontrollpanel</h1><p style="color:var(--gray-500);font-size:0.85rem;margin:0">WorkPilot &mdash; Live-Dashboard</p></div>
        </div>
        <div style="display:flex;gap:0.5rem;align-items:center">
          <span class="admin-live-dot"></span><span style="font-size:0.8rem;color:var(--success);font-weight:600">Live</span>
          <button class="btn btn-outline" onclick="navigate('admin-panel')" style="font-size:0.85rem;margin-left:0.75rem"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="vertical-align:-2px"><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg> Aktualisieren</button>
          <button class="btn btn-ghost" onclick="adminLogout()" style="color:var(--danger);font-size:0.85rem">Abmelden</button>
        </div>
      </div>

      <!-- KPI Strip - immer sichtbar -->
      <div class="admin-kpi-strip">
        <div class="admin-kpi"><div class="admin-kpi-icon" style="background:rgba(37,99,235,0.1);color:#2563eb"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg></div><div><div class="admin-kpi-value">${data.online.total}</div><div class="admin-kpi-label">Gerade Online</div></div></div>
        <div class="admin-kpi"><div class="admin-kpi-icon" style="background:rgba(99,102,241,0.1);color:#6366f1"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><path d="M20 8v6M23 11h-6"/></svg></div><div><div class="admin-kpi-value">${data.users.total}</div><div class="admin-kpi-label">Registriert</div></div></div>
        <div class="admin-kpi"><div class="admin-kpi-icon" style="background:rgba(37,99,235,0.1);color:#2563eb"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg></div><div><div class="admin-kpi-value">${formatEuro(data.revenue.total)}</div><div class="admin-kpi-label">Gesamt-Umsatz</div></div></div>
        <div class="admin-kpi"><div class="admin-kpi-icon" style="background:rgba(249,115,22,0.1);color:#f97316"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg></div><div><div class="admin-kpi-value">${data.purchases.total}</div><div class="admin-kpi-label">Bestellungen</div></div></div>
      </div>

      <!-- Ausstehende Arbeitgeber-Freischaltungen (nur anzeigen wenn es welche gibt) -->
      ${(() => {
        const pending = (state._allProfilesCache || []).filter(u => u.role === 'employer' && !u.approved);
        if (pending.length === 0) return '';
        return `
        <div class="card admin-chart-card" style="margin-bottom:1.5rem;border:2px solid #f59e0b;background:linear-gradient(135deg,#fffbeb 0%,#fef3c7 100%)">
          <div class="card-body" style="padding:0;overflow:hidden">
            <div style="padding:1rem 1.25rem;display:flex;align-items:center;gap:0.75rem;border-bottom:1px solid #fde68a">
              <div style="width:36px;height:36px;border-radius:8px;background:#f59e0b;color:#fff;display:flex;align-items:center;justify-content:center;flex-shrink:0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              </div>
              <div style="flex:1">
                <h4 style="margin:0;font-size:1rem;font-weight:700;color:#92400e">Arbeitgeber warten auf Freischaltung</h4>
                <p style="margin:0.1rem 0 0;font-size:0.8rem;color:#b45309">${pending.length} ${pending.length === 1 ? 'Konto muss' : 'Konten müssen'} geprüft und freigeschaltet werden, bevor Stellenanzeigen geschaltet werden können.</p>
              </div>
              <span class="badge" style="background:#f59e0b;color:#fff;font-weight:700">${pending.length}</span>
            </div>
            <table style="width:100%;border-collapse:collapse;font-size:0.9rem;background:#fff">
              <thead>
                <tr style="background:var(--gray-50);border-bottom:1px solid var(--gray-200)">
                  <th style="padding:0.65rem 1.25rem;text-align:left;font-size:0.72rem;text-transform:uppercase;letter-spacing:0.05em;color:var(--gray-500);font-weight:600">Firma</th>
                  <th style="padding:0.65rem 1.25rem;text-align:left;font-size:0.72rem;text-transform:uppercase;letter-spacing:0.05em;color:var(--gray-500);font-weight:600">Kontakt</th>
                  <th style="padding:0.65rem 1.25rem;text-align:left;font-size:0.72rem;text-transform:uppercase;letter-spacing:0.05em;color:var(--gray-500);font-weight:600">E-Mail</th>
                  <th style="padding:0.65rem 1.25rem;text-align:left;font-size:0.72rem;text-transform:uppercase;letter-spacing:0.05em;color:var(--gray-500);font-weight:600">Registriert</th>
                  <th style="padding:0.65rem 1.25rem;text-align:center;font-size:0.72rem;text-transform:uppercase;letter-spacing:0.05em;color:var(--gray-500);font-weight:600">Aktion</th>
                </tr>
              </thead>
              <tbody>
                ${pending.map(u => {
                  const created = u.createdAt ? new Date(u.createdAt).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';
                  return `<tr class="admin-table-row" style="border-bottom:1px solid var(--gray-100)">
                    <td style="padding:0.8rem 1.25rem;font-weight:600">${escapeHtml(u.company || '—')}</td>
                    <td style="padding:0.8rem 1.25rem;color:var(--gray-700)">${escapeHtml(u.name || '—')}</td>
                    <td style="padding:0.8rem 1.25rem;color:var(--gray-500)">${escapeHtml(u.email || '—')}</td>
                    <td style="padding:0.8rem 1.25rem;color:var(--gray-500);font-size:0.78rem">${escapeHtml(created)}</td>
                    <td style="padding:0.8rem 1.25rem;text-align:center;white-space:nowrap">
                      <button class="btn btn-sm" style="background:var(--success);color:#fff;font-size:0.78rem;font-weight:600;padding:0.45rem 0.9rem;margin-right:0.3rem" onclick="adminToggleApproval('${u.id}', true)">✓ Freischalten</button>
                      <button class="btn btn-sm btn-ghost" style="font-size:0.78rem;color:var(--danger)" onclick="adminRemoveEmployer('${u.id}')">Ablehnen</button>
                    </td>
                  </tr>`;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>`;
      })()}

      <!-- Tab Navigation -->
      <div class="admin-tabs">
        <button class="admin-tab ${!state.adminTab || state.adminTab === 'besucher' ? 'active' : ''}" onclick="switchAdminTab('besucher')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
          Besucher
        </button>
        <button class="admin-tab ${state.adminTab === 'umsatz' ? 'active' : ''}" onclick="switchAdminTab('umsatz')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
          Umsatz
        </button>
        <button class="admin-tab ${state.adminTab === 'benutzer' ? 'active' : ''}" onclick="switchAdminTab('benutzer')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
          Benutzer
        </button>
        <button class="admin-tab ${state.adminTab === 'support' ? 'active' : ''}" onclick="switchAdminTab('support')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
          Support
          ${getSupportTickets().filter(t => t.status === 'open').length > 0 ? '<span class="admin-tab-badge">' + getSupportTickets().filter(t => t.status === 'open').length + '</span>' : ''}
        </button>
      </div>

      <!-- TAB: Besucher -->
      <div class="admin-tab-content ${!state.adminTab || state.adminTab === 'besucher' ? 'active' : ''}" id="admin-tab-besucher">
        <div class="admin-row-2">
          <div class="card admin-chart-card"><div class="card-body">
            <h4 class="admin-chart-title"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg> Aktuelle Besucher</h4>
            <div class="admin-donut-row"><div class="admin-donut-wrap">${onlineDonut}</div><div class="admin-donut-legend">
              <div class="admin-legend-item"><span class="admin-legend-dot" style="background:#f97316"></span>Arbeitgeber<strong>${data.online.employer}</strong></div>
              <div class="admin-legend-item"><span class="admin-legend-dot" style="background:#2563eb"></span>Arbeitnehmer<strong>${data.online.worker}</strong></div>
              <div class="admin-legend-item"><span class="admin-legend-dot" style="background:#8b5cf6"></span>Ohne Konto<strong>${data.online.guest}</strong></div>
            </div></div>
          </div></div>
          <div class="card admin-chart-card"><div class="card-body">
            <h4 class="admin-chart-title"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg> Registrierte Benutzer</h4>
            <div class="admin-donut-row"><div class="admin-donut-wrap">${usersDonut}</div><div class="admin-donut-legend">
              <div class="admin-legend-item"><span class="admin-legend-dot" style="background:#f97316"></span>Arbeitgeber<strong>${data.users.employers}</strong></div>
              <div class="admin-legend-item"><span class="admin-legend-dot" style="background:#2563eb"></span>Arbeitnehmer<strong>${data.users.workers}</strong></div>
            </div></div>
          </div></div>
        </div>
        <div class="card admin-chart-card" style="margin-top:1.5rem"><div class="card-body">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.25rem;flex-wrap:wrap;gap:0.5rem">
            <h4 class="admin-chart-title" style="margin:0"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> Besucher-Verlauf (7 Tage)</h4>
            <div style="display:flex;gap:1.25rem">
              <div class="admin-mini-stat"><span style="color:var(--gray-500)">Heute</span><strong>${data.visits.today}</strong></div>
              <div class="admin-mini-stat"><span style="color:var(--gray-500)">Woche</span><strong>${data.visits.thisWeek}</strong></div>
              <div class="admin-mini-stat"><span style="color:var(--gray-500)">Monat</span><strong>${data.visits.thisMonth}</strong></div>
            </div>
          </div>
          <div class="admin-bar-chart">${chartBars}</div>
        </div></div>
      </div>

      <!-- TAB: Umsatz -->
      <div class="admin-tab-content ${state.adminTab === 'umsatz' ? 'active' : ''}" id="admin-tab-umsatz">
        <div class="admin-row-2">
          <div class="card admin-chart-card"><div class="card-body">
            <h4 class="admin-chart-title"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg> Umsatz-Verteilung</h4>
            <div class="admin-donut-row"><div class="admin-donut-wrap">${revenueDonut}</div><div class="admin-donut-legend">
              <div class="admin-legend-item"><span class="admin-legend-dot" style="background:#f97316"></span>Standard 7T<strong>${formatEuro((data.revenue.byProduct['Standard Boost (7 Tage)'] || {total:0}).total)}</strong></div>
              <div class="admin-legend-item"><span class="admin-legend-dot" style="background:#2563eb"></span>Standard 30T<strong>${formatEuro((data.revenue.byProduct['Standard Boost (30 Tage)'] || {total:0}).total)}</strong></div>
              <div class="admin-legend-item"><span class="admin-legend-dot" style="background:#8b5cf6"></span>Premium 14T<strong>${formatEuro((data.revenue.byProduct['Premium Boost (14 Tage)'] || {total:0}).total)}</strong></div>
            </div></div>
          </div></div>
          <div class="card admin-chart-card"><div class="card-body">
            <h4 class="admin-chart-title"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f97316" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg> Umsatz pro Produkt</h4>
            <div style="display:flex;gap:1.25rem;margin-bottom:1rem">
              <div class="admin-mini-stat"><span style="color:var(--gray-500)">Heute</span><strong style="color:#2563eb">${formatEuro(data.revenue.today)}</strong></div>
              <div class="admin-mini-stat"><span style="color:var(--gray-500)">Monat</span><strong style="color:#2563eb">${formatEuro(data.revenue.thisMonth)}</strong></div>
            </div>
            ${revenueChart}
          </div></div>
        </div>
        <div class="card admin-chart-card" id="admin-revenue-timeline" style="margin-top:1.5rem"><div class="card-body">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.25rem;flex-wrap:wrap;gap:0.75rem">
            <h4 class="admin-chart-title" style="margin:0"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg> Umsatz-Verlauf</h4>
            <div class="admin-rev-tabs">
              <button class="admin-rev-tab ${state.adminRevenuePeriod === 'daily' ? 'active' : ''}" data-period="daily" onclick="switchRevenueView('daily')">Täglich</button>
              <button class="admin-rev-tab ${state.adminRevenuePeriod === 'monthly' ? 'active' : ''}" data-period="monthly" onclick="switchRevenueView('monthly')">Monatlich</button>
              <button class="admin-rev-tab ${state.adminRevenuePeriod === 'yearly' ? 'active' : ''}" data-period="yearly" onclick="switchRevenueView('yearly')">Jährlich</button>
              <button class="admin-rev-tab ${state.adminRevenuePeriod === 'alltime' ? 'active' : ''}" data-period="alltime" onclick="switchRevenueView('alltime')">Gesamt</button>
            </div>
          </div>
          <div style="display:flex;gap:2rem;margin-bottom:1rem">
            <div><span style="font-size:0.75rem;color:var(--gray-500)">Zeitraum-Umsatz</span><div id="admin-revenue-period-sum" style="font-size:1.3rem;font-weight:800;color:#1d4ed8">${(() => { const b = getRevenueTimeline(state.adminRevenuePeriod); return b.reduce((s, x) => s + x.total, 0).toFixed(2).replace('.',',') + ' EUR'; })()}</div></div>
            <div><span style="font-size:0.75rem;color:var(--gray-500)">Bestellungen</span><div id="admin-revenue-period-count" style="font-size:1.3rem;font-weight:800;color:var(--gray-700)">${(() => { const b = getRevenueTimeline(state.adminRevenuePeriod); return b.reduce((s, x) => s + x.count, 0) + ' Bestellungen'; })()}</div></div>
          </div>
          <div class="admin-bar-chart" id="admin-revenue-bars" style="height:200px">
            ${(() => {
              const bars = getRevenueTimeline(state.adminRevenuePeriod);
              const maxVal = Math.max(...bars.map(b => b.total), 1);
              const gradients = ['#2563eb','#3b82f6','#60a5fa','#93c5fd','#1d4ed8','#1e40af','#1e40af','#1e3a8a','#0d9488','#2563eb','#3b82f6','#60a5fa','#93c5fd','#1d4ed8'];
              return bars.map((b, i) => {
                const pct = Math.max((b.total / maxVal) * 100, 3); const color = gradients[i % gradients.length];
                return '<div class="admin-bar-col"><div class="admin-bar-value" style="color:#1d4ed8">' + (b.total > 0 ? b.total.toFixed(0) + ' EUR' : '-') + '</div><div class="admin-bar-track"><div class="admin-bar-fill" style="height:' + pct + '%;background:' + color + ';animation-delay:' + (i * 0.05) + 's"></div></div><div class="admin-bar-label">' + b.label + '</div></div>';
              }).join('');
            })()}
          </div>
        </div></div>
      </div>

      <!-- TAB: Benutzer -->
      <div class="admin-tab-content ${state.adminTab === 'benutzer' ? 'active' : ''}" id="admin-tab-benutzer">

      <!-- Alle Arbeitgeber -->
      ${(() => {
        const employers = (state._allProfilesCache || []).filter(u => u.role === 'employer' && u.name !== '[Entfernt]');
        return `
      <div class="card admin-chart-card" style="margin-bottom:1.5rem"><div class="card-body" style="padding:0;overflow:hidden">
        <div style="padding:1.25rem 1.25rem 0.75rem;display:flex;align-items:center;gap:0.5rem">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f97316" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>
          <h4 style="margin:0;font-size:0.95rem;font-weight:700">Alle Arbeitgeber</h4>
          <span class="badge badge-warning" style="margin-left:auto">${employers.length} gesamt</span>
          <button class="btn btn-sm btn-outline" style="margin-left:0.5rem;font-size:0.75rem" onclick="adminRefreshProfiles()">Neu laden</button>
        </div>
        <table style="width:100%;border-collapse:collapse;font-size:0.9rem">
          <thead><tr style="background:var(--gray-50);border-top:1px solid var(--gray-100);border-bottom:1px solid var(--gray-200)">
            <th style="padding:0.65rem 1.25rem;text-align:left;font-size:0.75rem;text-transform:uppercase;letter-spacing:0.05em;color:var(--gray-500);font-weight:600">Firma</th>
            <th style="padding:0.65rem 1.25rem;text-align:left;font-size:0.75rem;text-transform:uppercase;letter-spacing:0.05em;color:var(--gray-500);font-weight:600">Inhaber</th>
            <th style="padding:0.65rem 1.25rem;text-align:left;font-size:0.75rem;text-transform:uppercase;letter-spacing:0.05em;color:var(--gray-500);font-weight:600">E-Mail</th>
            <th style="padding:0.65rem 1.25rem;text-align:center;font-size:0.75rem;text-transform:uppercase;letter-spacing:0.05em;color:var(--gray-500);font-weight:600">Status</th>
            <th style="padding:0.65rem 1.25rem;text-align:left;font-size:0.75rem;text-transform:uppercase;letter-spacing:0.05em;color:var(--gray-500);font-weight:600">Registriert</th>
            <th style="padding:0.65rem 1.25rem;text-align:center;font-size:0.75rem;text-transform:uppercase;letter-spacing:0.05em;color:var(--gray-500);font-weight:600">Aktionen</th>
          </tr></thead>
          <tbody>
            ${employers.map(u => {
              const created = u.createdAt ? new Date(u.createdAt).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';
              return `<tr class="admin-table-row">
                <td style="padding:0.65rem 1.25rem;font-weight:600">${escapeHtml(u.company || '-')}</td>
                <td style="padding:0.65rem 1.25rem;color:var(--gray-500)">${escapeHtml(u.name || '-')}</td>
                <td style="padding:0.65rem 1.25rem;color:var(--gray-500)">${escapeHtml(u.email || '-')}</td>
                <td style="padding:0.65rem 1.25rem;text-align:center">${u.approved !== false ? '<span class="badge badge-success">Aktiv</span>' : '<span class="badge badge-danger" style="background:rgba(239,68,68,0.15);color:#ef4444">Gesperrt</span>'}</td>
                <td style="padding:0.65rem 1.25rem;color:var(--gray-500);font-size:0.78rem">${escapeHtml(created)}</td>
                <td style="padding:0.65rem 1.25rem;text-align:center;white-space:nowrap">
                  ${u.approved !== false
                    ? `<button class="btn btn-sm" style="background:#f97316;color:#fff;font-size:0.75rem;margin-right:0.25rem" onclick="adminToggleApproval('${u.id}', false)">Sperren</button>`
                    : `<button class="btn btn-sm" style="background:var(--success);color:#fff;font-size:0.75rem;margin-right:0.25rem" onclick="adminToggleApproval('${u.id}', true)">Entsperren</button>`}
                  <button class="btn btn-sm" style="background:var(--danger);color:#fff;font-size:0.75rem" onclick="adminRemoveEmployer('${u.id}')">Entfernen</button>
                </td>
              </tr>`;
            }).join('') || '<tr><td colspan="6" style="padding:2rem;text-align:center;color:var(--gray-500)">Noch keine Arbeitgeber registriert</td></tr>'}
          </tbody>
        </table>
      </div></div>`;
      })()}

      <!-- Alle Benutzer -->
      <div class="card admin-chart-card" style="margin-bottom:1.5rem"><div class="card-body" style="padding:0;overflow:hidden">
        <div style="padding:1.25rem 1.25rem 0.75rem;display:flex;align-items:center;gap:0.5rem">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
          <h4 style="margin:0;font-size:0.95rem;font-weight:700">Alle Benutzer</h4>
          <span class="badge badge-info" style="margin-left:auto">${(state._allProfilesCache || []).length} gesamt</span>
          <button class="btn btn-sm btn-outline" style="margin-left:0.5rem;font-size:0.75rem" onclick="adminRefreshProfiles()">Neu laden</button>
        </div>
        <table style="width:100%;border-collapse:collapse;font-size:0.9rem">
          <thead><tr style="background:var(--gray-50);border-top:1px solid var(--gray-100);border-bottom:1px solid var(--gray-200)">
            <th style="padding:0.65rem 1.25rem;text-align:left;font-size:0.75rem;text-transform:uppercase;letter-spacing:0.05em;color:var(--gray-500);font-weight:600">Benutzer</th>
            <th style="padding:0.65rem 1.25rem;text-align:left;font-size:0.75rem;text-transform:uppercase;letter-spacing:0.05em;color:var(--gray-500);font-weight:600">E-Mail</th>
            <th style="padding:0.65rem 1.25rem;text-align:left;font-size:0.75rem;text-transform:uppercase;letter-spacing:0.05em;color:var(--gray-500);font-weight:600">Firma</th>
            <th style="padding:0.65rem 1.25rem;text-align:center;font-size:0.75rem;text-transform:uppercase;letter-spacing:0.05em;color:var(--gray-500);font-weight:600">Rolle</th>
            <th style="padding:0.65rem 1.25rem;text-align:center;font-size:0.75rem;text-transform:uppercase;letter-spacing:0.05em;color:var(--gray-500);font-weight:600">Status</th>
            <th style="padding:0.65rem 1.25rem;text-align:left;font-size:0.75rem;text-transform:uppercase;letter-spacing:0.05em;color:var(--gray-500);font-weight:600">Registriert</th>
            <th style="padding:0.65rem 1.25rem;text-align:center;font-size:0.75rem;text-transform:uppercase;letter-spacing:0.05em;color:var(--gray-500);font-weight:600">Aktion</th>
          </tr></thead>
          <tbody>
            ${(state._allProfilesCache || []).map(u => {
              const initials = (u.name || '?').split(' ').map(n => n[0]).join('').toUpperCase();
              const avatarColor = u.role === 'employer' ? '#f97316' : '#2563eb';
              const created = u.createdAt ? new Date(u.createdAt).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';
              const statusBadge = u.role === 'worker'
                ? '<span class="badge badge-info">Aktiv</span>'
                : (u.approved
                    ? '<span class="badge badge-success">Freigeschaltet</span>'
                    : '<span class="badge badge-warning">Ausstehend</span>');
              const actionBtn = u.role === 'employer'
                ? (u.approved
                    ? `<button class="btn btn-sm" style="background:var(--danger);color:#fff;font-size:0.75rem" onclick="adminToggleApproval('${u.id}', false)">Sperren</button>`
                    : `<button class="btn btn-sm" style="background:var(--success);color:#fff;font-size:0.75rem" onclick="adminToggleApproval('${u.id}', true)">Freischalten</button>`)
                : '';
              return `<tr class="admin-table-row">
                <td style="padding:0.65rem 1.25rem"><div style="display:flex;align-items:center;gap:0.75rem"><div style="width:32px;height:32px;border-radius:50%;background:${avatarColor};color:#fff;display:flex;align-items:center;justify-content:center;font-size:0.7rem;font-weight:700;flex-shrink:0">${escapeHtml(initials)}</div><span style="font-weight:600">${escapeHtml(u.name || '-')}</span></div></td>
                <td style="padding:0.65rem 1.25rem;color:var(--gray-500)">${escapeHtml(u.email || '-')}</td>
                <td style="padding:0.65rem 1.25rem;color:var(--gray-500)">${escapeHtml(u.company || '-')}</td>
                <td style="padding:0.65rem 1.25rem;text-align:center"><span class="badge ${u.role === 'employer' ? 'badge-warning' : 'badge-info'}">${u.role === 'employer' ? 'Arbeitgeber' : 'Arbeitnehmer'}</span></td>
                <td style="padding:0.65rem 1.25rem;text-align:center">${statusBadge}</td>
                <td style="padding:0.65rem 1.25rem;color:var(--gray-500);font-size:0.78rem">${escapeHtml(created)}</td>
                <td style="padding:0.65rem 1.25rem;text-align:center">${actionBtn}</td>
              </tr>`;
            }).join('') || '<tr><td colspan="7" style="padding:2rem;text-align:center;color:var(--gray-500)">Noch keine Benutzer registriert</td></tr>'}
          </tbody>
        </table>
      </div></div>
      </div>

      <!-- TAB: Support -->
      <div class="admin-tab-content ${state.adminTab === 'support' ? 'active' : ''}" id="admin-tab-support">
      <div class="card admin-chart-card" style="margin-bottom:1.5rem">
        <div class="card-body" style="padding:0;overflow:hidden">
        <div style="padding:1.25rem 1.25rem 0.75rem;display:flex;align-items:center;gap:0.5rem">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
          <h4 style="margin:0;font-size:0.95rem;font-weight:700">Support-Tickets</h4>
          <span class="badge badge-warning" style="margin-left:auto">${getSupportTickets().filter(t => t.status === 'open').length} offen</span>
        </div>
        <div style="overflow-x:auto">
          <table style="width:100%;border-collapse:collapse">
            <thead>
              <tr style="background:var(--gray-50)">
                <th style="padding:0.65rem 1.25rem;text-align:left;font-size:0.78rem;color:var(--gray-500);font-weight:600">Status</th>
                <th style="padding:0.65rem 1.25rem;text-align:left;font-size:0.78rem;color:var(--gray-500);font-weight:600">Benutzer</th>
                <th style="padding:0.65rem 1.25rem;text-align:left;font-size:0.78rem;color:var(--gray-500);font-weight:600">Kategorie</th>
                <th style="padding:0.65rem 1.25rem;text-align:left;font-size:0.78rem;color:var(--gray-500);font-weight:600">Betreff</th>
                <th style="padding:0.65rem 1.25rem;text-align:left;font-size:0.78rem;color:var(--gray-500);font-weight:600">Datum</th>
                <th style="padding:0.65rem 1.25rem;text-align:center;font-size:0.78rem;color:var(--gray-500);font-weight:600">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              ${getSupportTickets().filter(t => t.status !== 'closed').slice().reverse().map(t => {
                const catLabels = { bug: 'Bug', account: 'Konto', payment: 'Zahlung', job: 'Job', user: 'Nutzer', other: 'Sonstiges' };
                const statusColors = { open: '#f59e0b', 'in-progress': 'var(--primary)', closed: 'var(--success)' };
                const statusLabels = { open: 'Offen', 'in-progress': 'In Bearbeitung', closed: 'Erledigt' };
                return `
                <tr class="admin-table-row" style="cursor:pointer" onclick="document.getElementById('ticket-detail-${t.id}').style.display=document.getElementById('ticket-detail-${t.id}').style.display==='none'?'table-row':'none'">
                  <td style="padding:0.65rem 1.25rem">
                    <span style="font-size:0.75rem;font-weight:600;padding:0.2rem 0.6rem;border-radius:999px;background:${statusColors[t.status]}20;color:${statusColors[t.status]}">${statusLabels[t.status]}</span>
                  </td>
                  <td style="padding:0.65rem 1.25rem">
                    <div style="font-weight:600;font-size:0.85rem">${escapeHtml(t.userName)}</div>
                    <div style="font-size:0.75rem;color:var(--gray-500)">${t.userEmail} &bull; ${t.userRole === 'employer' ? 'AG' : 'AN'}</div>
                  </td>
                  <td style="padding:0.65rem 1.25rem"><span class="badge">${catLabels[t.category] || t.category}</span></td>
                  <td style="padding:0.65rem 1.25rem;font-weight:500;font-size:0.88rem">${escapeHtml(t.subject)}</td>
                  <td style="padding:0.65rem 1.25rem;font-size:0.8rem;color:var(--gray-500)">${new Date(t.createdAt).toLocaleString('de-DE')}</td>
                  <td style="padding:0.65rem 1.25rem;text-align:center">
                    <button class="btn btn-sm btn-outline" onclick="event.stopPropagation();adminUpdateTicketStatus(${t.id},'in-progress')" ${t.status==='in-progress'||t.status==='closed'?'disabled':''}>Bearbeiten</button>
                    <button class="btn btn-sm" style="background:var(--success);color:#fff;border:none;margin-left:0.25rem" onclick="event.stopPropagation();adminUpdateTicketStatus(${t.id},'closed')" ${t.status==='closed'?'disabled':''}>Erledigt</button>
                  </td>
                </tr>
                <tr id="ticket-detail-${t.id}" style="display:none">
                  <td colspan="6" style="padding:1rem 1.25rem;background:var(--gray-50);border-bottom:1px solid var(--gray-200)">
                    <p style="font-size:0.88rem;margin-bottom:0.75rem;white-space:pre-wrap">${escapeHtml(t.message)}</p>
                    ${t.adminReply ? `<div style="padding:0.5rem 0.75rem;background:rgba(255,255,255,0.04);border-radius:8px;border-left:3px solid #6366f1;margin-bottom:0.75rem"><strong style="font-size:0.78rem;color:#818cf8">Deine Antwort:</strong><p style="font-size:0.85rem;margin:0.25rem 0 0;color:#cbd5e1">${escapeHtml(t.adminReply)}</p></div>` : ''}
                    <div style="display:flex;gap:0.5rem;align-items:flex-end">
                      <textarea id="reply-${t.id}" class="form-input" rows="2" placeholder="Antwort schreiben..." style="flex:1;font-size:0.85rem">${t.adminReply || ''}</textarea>
                      <button class="btn btn-primary btn-sm" onclick="event.stopPropagation();adminReplyTicket(${t.id})">Antworten</button>
                    </div>
                  </td>
                </tr>`;
              }).join('') || '<tr><td colspan="6" style="padding:2rem;text-align:center;color:var(--gray-500)">Keine Support-Tickets vorhanden</td></tr>'}
            </tbody>
          </table>
        </div>
      </div></div>
      </div><!-- /TAB: Support -->

      <!-- Footer -->
      <div style="text-align:center;padding:1.5rem 0 2.5rem;color:var(--gray-500);font-size:0.8rem">
        Letzte Aktualisierung: ${new Date().toLocaleString('de-DE')} &bull;
        <a href="#" onclick="navigate('admin-panel')" style="color:var(--primary);text-decoration:none;font-weight:500">Jetzt aktualisieren</a>
      </div>
    </div>`;
}

async function adminUpdateTicketStatus(ticketId, newStatus) {
  if (!window.DB || !DB.sb) return;
  try {
    const dbStatus = newStatus === 'in-progress' ? 'in_progress' : newStatus;
    const res = await DB.sb.from('support_tickets').update({ status: dbStatus }).eq('id', ticketId);
    if (res.error) throw res.error;
    await loadSupportTicketsForUser();
    render();
  } catch (e) {
    console.error('[adminUpdateTicketStatus]', e);
    showToast('Konnte Status nicht ändern: ' + (e.message || ''), 'error');
  }
}

async function adminReplyTicket(ticketId) {
  if (!window.DB || !DB.sb) return;
  const replyEl = document.getElementById('reply-' + ticketId);
  if (!replyEl || !replyEl.value.trim()) {
    showToast('Bitte schreibe eine Antwort.', 'error');
    return;
  }
  try {
    const res = await DB.sb.from('support_tickets').update({
      admin_reply: replyEl.value.trim(),
      status: 'in_progress'
    }).eq('id', ticketId);
    if (res.error) throw res.error;
    await loadSupportTicketsForUser();
    render();
  } catch (e) {
    console.error('[adminReplyTicket]', e);
    showToast('Antwort konnte nicht gespeichert werden.', 'error');
  }
}

// ===== EVENT LISTENERS =====
let _listenersAttached = false;
function attachEventListeners() {
  if (_listenersAttached) return;
  _listenersAttached = true;
  // Close dropdown on outside click
  document.addEventListener('click', (e) => {
    if (state.dropdownOpen && !e.target.closest('.user-menu')) {
      state.dropdownOpen = false;
      const dd = document.getElementById('user-dropdown');
      if (dd) dd.classList.add('hidden');
    }
  });
}

// ===== SCROLL ANIMATIONS =====
function initScrollAnimations() {
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        if (entry.target.id === 'stats-counter-section') {
          animateCounters();
        }
      }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right').forEach(function(el) {
    observer.observe(el);
  });
  var statsSection = document.getElementById('stats-counter-section');
  if (statsSection) observer.observe(statsSection);
}

function animateCounters() {
  if (window._countersAnimated) return;
  window._countersAnimated = true;
  document.querySelectorAll('.counter-number').forEach(function(el) {
    var target = parseInt(el.dataset.target);
    var startFrom = Math.floor(target * 0.98);
    var range = target - startFrom;
    var duration = 1200;
    var startTime = null;
    el.textContent = startFrom.toLocaleString('de-DE') + '+';
    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = Math.floor(startFrom + eased * range);
      el.textContent = current.toLocaleString('de-DE') + '+';
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });
}

// ===== INIT =====
// Wrap render so every call also schedules scroll animations.
var _origRender = render;
render = function() { _origRender(); setTimeout(initScrollAnimations, 100); };

// ===== DSGVO Cookie-Banner =====
function dismissCookieBanner(persist) {
  const el = document.getElementById('cookie-banner');
  if (el) el.style.display = 'none';
  if (persist) { try { localStorage.setItem('jj_cookie_consent', '1'); } catch (_) {} }
}
function maybeShowCookieBanner() {
  try { if (localStorage.getItem('jj_cookie_consent') === '1') return; } catch (_) {}
  const el = document.getElementById('cookie-banner');
  if (el) el.style.display = 'block';
}

// ===== Passwort vergessen =====
// Nutzt Supabase resetPasswordForEmail. Generische Toast-Meldung verrät NICHT
// ob die E-Mail registriert ist (Schutz gegen User-Enumeration).
async function showForgotPassword() {
  const email = prompt('Bitte gib deine E-Mail-Adresse ein, an die wir den Link zum Passwort-Zurücksetzen schicken:');
  if (!email || !email.trim()) return;
  if (!window.DB || !DB.resetPasswordForEmail) {
    showToast('Backend nicht geladen.', 'error');
    return;
  }
  try {
    await DB.resetPasswordForEmail(email.trim().toLowerCase(), window.location.origin + '/?reset=1');
  } catch (e) {
    console.error('[showForgotPassword]', e);
  }
  showToast('Falls die E-Mail bei uns existiert, ist eine Reset-Mail unterwegs. Schau in dein Postfach.');
}

// Bootstrap reads the Supabase session + jobs, then renders. If the DB
// module failed to load (offline / script blocked), fall back to a
// plain render so the landing page still shows something.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (typeof bootstrap === 'function') { bootstrap(); }
    else { render(); setTimeout(initScrollAnimations, 200); }
    maybeShowCookieBanner();
  });
} else {
  if (typeof bootstrap === 'function') { bootstrap(); }
  else { render(); setTimeout(initScrollAnimations, 200); }
  maybeShowCookieBanner();
}

// Close mobile menu on nav
document.addEventListener('click', (e) => {
  if (!e.target.closest('#navbar')) {
    const menu = document.getElementById('mobile-menu');
    if (menu) menu.classList.remove('open');
  }
});
