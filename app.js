// ===== APP STATE =====
let state = {
  currentPage: 'landing',
  user: JSON.parse(localStorage.getItem('jj_user')) || null,
  get savedJobs() { const u = this.user; return JSON.parse(localStorage.getItem(u ? 'jj_saved_'+u.id : 'jj_saved_guest') || '[]'); },
  filters: { search: '', category: '', type: '', radius: 50, hours: [], city: '', sort: 'date' },
  chatOpen: false,
  aiOpen: false,
  activeChat: null,
  wizardStep: 0,
  newJob: {},
  dropdownOpen: false,
  adminLoggedIn: false,
  adminRevenuePeriod: 'daily'
};

// ===== ADMIN CONFIG =====
const ADMIN_EMAILS = ['kwg.range@web.de', 'jojo102009@icloud.com'];
const ADMIN_PASSWORD = 'Tauranga@2025';

// ===== ANALYTICS TRACKING =====
function trackVisit() {
  const visits = JSON.parse(localStorage.getItem('jj_analytics_visits') || '[]');
  const now = new Date().toISOString();
  const userRole = state.user ? state.user.role : 'guest';
  const userId = state.user ? state.user.id : 'anon_' + (sessionStorage.getItem('jj_anon_id') || (() => { const id = Date.now(); sessionStorage.setItem('jj_anon_id', id); return id; })());
  // Prüfe ob dieser User in den letzten 5 Minuten schon getrackt wurde
  const recent = visits.find(v => v.userId === userId && (new Date(now) - new Date(v.timestamp)) < 300000);
  if (!recent) {
    visits.push({ userId, role: userRole, timestamp: now, page: state.currentPage });
    // Maximal 10000 Einträge behalten
    if (visits.length > 10000) visits.splice(0, visits.length - 10000);
    localStorage.setItem('jj_analytics_visits', JSON.stringify(visits));
  }
}

function trackPurchase(product, price) {
  const purchases = JSON.parse(localStorage.getItem('jj_analytics_purchases') || '[]');
  purchases.push({
    product,
    price,
    timestamp: new Date().toISOString(),
    userId: state.user ? state.user.id : null
  });
  localStorage.setItem('jj_analytics_purchases', JSON.stringify(purchases));
}

function getAnalyticsData() {
  const visits = JSON.parse(localStorage.getItem('jj_analytics_visits') || '[]');
  const purchases = JSON.parse(localStorage.getItem('jj_analytics_purchases') || '[]');
  const allUsers = JSON.parse(localStorage.getItem('jj_users') || '[]');
  const now = new Date();

  // Online-Besucher (letzte 15 Minuten)
  const onlineThreshold = 15 * 60 * 1000;
  const recentVisits = visits.filter(v => (now - new Date(v.timestamp)) < onlineThreshold);
  const uniqueOnline = [...new Set(recentVisits.map(v => v.userId))];
  const onlineByRole = {
    employer: [...new Set(recentVisits.filter(v => v.role === 'employer').map(v => v.userId))].length,
    worker: [...new Set(recentVisits.filter(v => v.role === 'worker').map(v => v.userId))].length,
    guest: [...new Set(recentVisits.filter(v => v.role === 'guest').map(v => v.userId))].length
  };

  // Registrierte Benutzer
  const totalUsers = allUsers.length;
  const employers = allUsers.filter(u => u.role === 'employer').length;
  const workers = allUsers.filter(u => u.role === 'worker').length;

  // Besucher heute
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const visitsToday = [...new Set(visits.filter(v => new Date(v.timestamp) >= todayStart).map(v => v.userId))].length;

  // Besucher diese Woche
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
  const visitsThisWeek = [...new Set(visits.filter(v => new Date(v.timestamp) >= weekStart).map(v => v.userId))].length;

  // Besucher diesen Monat
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const visitsThisMonth = [...new Set(visits.filter(v => new Date(v.timestamp) >= monthStart).map(v => v.userId))].length;

  // Umsatz pro Produkt
  const revenue = {};
  let totalRevenue = 0;
  purchases.forEach(p => {
    if (!revenue[p.product]) revenue[p.product] = { count: 0, total: 0 };
    revenue[p.product].count++;
    revenue[p.product].total += p.price;
    totalRevenue += p.price;
  });

  // Umsatz heute
  const purchasesToday = purchases.filter(p => new Date(p.timestamp) >= todayStart);
  const revenueToday = purchasesToday.reduce((sum, p) => sum + p.price, 0);

  // Umsatz diesen Monat
  const purchasesThisMonth = purchases.filter(p => new Date(p.timestamp) >= monthStart);
  const revenueThisMonth = purchasesThisMonth.reduce((sum, p) => sum + p.price, 0);

  // Letzte 7 Tage Besucher-Verlauf
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const day = new Date(todayStart);
    day.setDate(day.getDate() - i);
    const nextDay = new Date(day);
    nextDay.setDate(nextDay.getDate() + 1);
    const count = [...new Set(visits.filter(v => {
      const d = new Date(v.timestamp);
      return d >= day && d < nextDay;
    }).map(v => v.userId))].length;
    last7Days.push({ date: day.toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short' }), count });
  }

  return {
    online: { total: uniqueOnline.length, ...onlineByRole },
    users: { total: totalUsers, employers, workers },
    visits: { today: visitsToday, thisWeek: visitsThisWeek, thisMonth: visitsThisMonth, last7Days },
    revenue: { byProduct: revenue, total: totalRevenue, today: revenueToday, thisMonth: revenueThisMonth },
    purchases: { total: purchases.length, today: purchasesToday.length }
  };
}

// Umsatz-Zeitverlauf für verschiedene Ansichten
function getRevenueTimeline(period) {
  const purchases = JSON.parse(localStorage.getItem('jj_analytics_purchases') || '[]');
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const bars = [];

  if (period === 'daily') {
    // Letzte 14 Tage, pro Tag
    for (let i = 13; i >= 0; i--) {
      const day = new Date(todayStart); day.setDate(day.getDate() - i);
      const nextDay = new Date(day); nextDay.setDate(nextDay.getDate() + 1);
      const dayPurchases = purchases.filter(p => { const d = new Date(p.timestamp); return d >= day && d < nextDay; });
      const total = dayPurchases.reduce((s, p) => s + p.price, 0);
      const count = dayPurchases.length;
      bars.push({ label: day.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' }), total, count });
    }
  } else if (period === 'monthly') {
    // Letzte 12 Monate
    for (let i = 11; i >= 0; i--) {
      const m = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextM = new Date(m.getFullYear(), m.getMonth() + 1, 1);
      const mPurchases = purchases.filter(p => { const d = new Date(p.timestamp); return d >= m && d < nextM; });
      const total = mPurchases.reduce((s, p) => s + p.price, 0);
      const count = mPurchases.length;
      bars.push({ label: m.toLocaleDateString('de-DE', { month: 'short', year: '2-digit' }), total, count });
    }
  } else if (period === 'yearly') {
    // Letzte 5 Jahre
    const currentYear = now.getFullYear();
    for (let i = 4; i >= 0; i--) {
      const y = currentYear - i;
      const yStart = new Date(y, 0, 1);
      const yEnd = new Date(y + 1, 0, 1);
      const yPurchases = purchases.filter(p => { const d = new Date(p.timestamp); return d >= yStart && d < yEnd; });
      const total = yPurchases.reduce((s, p) => s + p.price, 0);
      const count = yPurchases.length;
      bars.push({ label: '' + y, total, count });
    }
  } else {
    // All-time: gruppiert nach Monat (alle vorhandenen)
    const byMonth = {};
    purchases.forEach(p => {
      const d = new Date(p.timestamp);
      const key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
      if (!byMonth[key]) byMonth[key] = { total: 0, count: 0 };
      byMonth[key].total += p.price;
      byMonth[key].count++;
    });
    const sortedKeys = Object.keys(byMonth).sort();
    if (sortedKeys.length === 0) {
      // Zeige letzten 6 Monate leer
      for (let i = 5; i >= 0; i--) {
        const m = new Date(now.getFullYear(), now.getMonth() - i, 1);
        bars.push({ label: m.toLocaleDateString('de-DE', { month: 'short', year: '2-digit' }), total: 0, count: 0 });
      }
    } else {
      sortedKeys.forEach(key => {
        const [y, m] = key.split('-');
        const d = new Date(parseInt(y), parseInt(m) - 1, 1);
        bars.push({ label: d.toLocaleDateString('de-DE', { month: 'short', year: '2-digit' }), total: byMonth[key].total, count: byMonth[key].count });
      });
    }
  }
  return bars;
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
  const gradients = ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#059669', '#047857', '#065f46', '#064e3b', '#0d9488', '#14b8a6', '#2dd4bf', '#5eead4', '#99f6e4', '#0f766e'];

  // Tab-Buttons updaten
  document.querySelectorAll('.admin-rev-tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.period === period);
  });

  // Summen updaten
  const sumEl = document.getElementById('admin-revenue-period-sum');
  if (sumEl) sumEl.textContent = formatEuro(periodTotal);
  const countEl = document.getElementById('admin-revenue-period-count');
  if (countEl) countEl.textContent = periodCount + ' Bestellungen';

  // Balken rendern
  const chart = document.getElementById('admin-revenue-bars');
  if (chart) {
    chart.innerHTML = bars.map((b, i) => {
      const pct = Math.max((b.total / maxVal) * 100, 3);
      const color = gradients[i % gradients.length];
      return `<div class="admin-bar-col">
        <div class="admin-bar-value" style="color:#059669">${b.total > 0 ? b.total.toFixed(0) + ' EUR' : '-'}</div>
        <div class="admin-bar-track">
          <div class="admin-bar-fill" style="height:${pct}%;background:${color};animation-delay:${i * 0.05}s"></div>
        </div>
        <div class="admin-bar-label">${b.label}</div>
      </div>`;
    }).join('');
  }
}

// ===== NAVIGATION =====
function navigate(page, data) {
  state.currentPage = page;
  state.pageData = data;
  render();
  window.scrollTo(0, 0);
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

function render() {
  const app = document.getElementById('app');
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
    'admin-login': renderAdminLogin,
    'admin-panel': renderAdminPanel
  };

  // Admin-Panel Zugangsschutz
  if (state.currentPage === 'admin-panel' && !state.adminLoggedIn) {
    state.currentPage = 'admin-login';
  }

  const renderFn = pages[state.currentPage] || renderLanding;
  app.innerHTML = renderFn();

  // Analytics tracking
  trackVisit();

  // Auto-scroll chat to bottom
  if (state.currentPage === 'chat') {
    setTimeout(() => {
      const el = document.getElementById('chat-messages-page');
      if (el) el.scrollTop = el.scrollHeight;
    }, 50);
  }

  // Show/hide widgets based on login
  // chat-widget removed
  document.getElementById('ai-widget').classList.toggle('hidden', state.aiOpen);

  // Re-attach event listeners
  attachEventListeners();
}

function updateNav() {
  const actions = document.getElementById('nav-actions');
  if (state.user) {
    const isEmployer = state.user.role === 'employer';
    actions.innerHTML = `
      <div class="user-menu">

        <div class="user-avatar" onclick="toggleDropdown()">${state.user.name.split(' ').map(n=>n[0]).join('')}</div>
        <div class="user-dropdown ${state.dropdownOpen ? '' : 'hidden'}" id="user-dropdown">
          <a href="#" onclick="navigate('${isEmployer ? 'employer-dashboard' : 'worker-dashboard'}'); toggleDropdown()">Dashboard</a>
          <a href="#" onclick="navigate('${isEmployer ? 'employer-profile' : 'worker-profile'}'); toggleDropdown()">Profil</a>
          ${!isEmployer ? '<a href="#" onclick="navigate(\'saved-jobs\'); toggleDropdown()">Gespeicherte Jobs</a>' : ''}
          ${!isEmployer ? '<a href="#" onclick="navigate(\'cv-builder\'); toggleDropdown()">Lebenslauf</a>' : ''}
          ${isEmployer ? '<a href="#" onclick="navigate(\'post-job\'); toggleDropdown()">Anzeige schalten</a>' : ''}
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

  // Show/hide mobile profile icon button
  const mobileProfileBtn = document.getElementById('mobile-profile-btn');
  if (mobileProfileBtn) {
    mobileProfileBtn.style.display = state.user ? 'flex' : 'none';
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
function loadUserSession(user) {
  // Load all user-specific data into state
  state.user = user;
  localStorage.setItem('jj_user', JSON.stringify(user));
  loadUserChats();
}

function login(email, password) {
  const allUsers = JSON.parse(localStorage.getItem('jj_users') || '[]');
  const user = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (user) {
    const latestUser = JSON.parse(localStorage.getItem('jj_user_' + user.id) || JSON.stringify(user));
    if (latestUser.password !== password) {
      const err = document.getElementById('login-error');
      if (err) { err.textContent = 'E-Mail oder Passwort falsch. Noch kein Konto? Jetzt registrieren.'; err.style.display='block'; }
      return;
    }
    loadUserSession(latestUser);
    navigate(latestUser.role === 'employer' ? 'employer-dashboard' : 'worker-dashboard');
  } else {
    const err = document.getElementById('login-error');
    if (err) { err.textContent = 'E-Mail oder Passwort falsch. Noch kein Konto? Jetzt registrieren.'; err.style.display='block'; }
  }
}

function register(data) {
  const users = JSON.parse(localStorage.getItem('jj_users') || '[]');
  if (users.find(u => u.email.toLowerCase() === data.email.toLowerCase())) {
    const err = document.getElementById('register-error');
    if (err) { err.textContent = 'Diese E-Mail ist bereits registriert. Bitte melde dich an.'; err.style.display='block'; }
    return;
  }
  const user = { ...data, id: Date.now(), createdAt: new Date().toISOString(), profileComplete: 20 };
  users.push({ email: user.email, id: user.id, role: user.role, name: user.name });
  localStorage.setItem('jj_users', JSON.stringify(users));
  // Save full user data under its own key
  localStorage.setItem('jj_user_' + user.id, JSON.stringify(user));
  loadUserSession(user);
  navigate(user.role === 'employer' ? 'employer-dashboard' : 'worker-dashboard');
}

function logout() {
  state.user = null;
  state.dropdownOpen = false;
  localStorage.removeItem('jj_user');
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

function getUserApps() {
  if (!state.user) return [];
  return JSON.parse(localStorage.getItem('jj_apps_' + state.user.id) || '[]');
}
function saveUserApps(apps) {
  if (!state.user) return;
  localStorage.setItem('jj_apps_' + state.user.id, JSON.stringify(apps));
}
function submitApplication(jobId) {
  const apps = getUserApps();
  if (apps.includes(jobId)) { showToast('Du hast dich bereits beworben!', 'info'); return; }
  apps.push(jobId);
  saveUserApps(apps);
  showToast('Bewerbung erfolgreich gesendet!');
  render();
}

// ===== PROFIL SPEICHERN =====
function saveWorkerProfile(btn) {
  // Alle Formularfelder auslesen und in user speichern
  const page = btn.closest('.dashboard-content');
  const inputs = page ? page.querySelectorAll('input[type=text],input[type=number],textarea,select') : [];
  inputs.forEach(inp => {
    if (inp.name) state.user[inp.name] = inp.value;
  });
  // Fortschritt berechnen
  state.user.address = state.user.address || (page && page.querySelector('input[placeholder*="Stadt"]')?.value) || '';
  state.user.hasSkills = true;
  state.user.hasHours = true;
  localStorage.setItem('jj_user', JSON.stringify(state.user)); if (state.user?.id) localStorage.setItem('jj_user_' + state.user.id, JSON.stringify(state.user));
  showToast('Profil gespeichert!');
  render();
}

// ===== STELLENANZEIGE VERÖFFENTLICHEN =====
function publishJob() {
  const newJob = {
    id: Date.now(),
    title: document.querySelector('.wizard-body input[placeholder*="Aushilfe"]')?.value || 'Neue Stelle',
    company: state.user?.name || 'Unternehmen',
    companyLogo: state.user?.companyLogo || state.user?.company?.[0] || state.user?.name?.[0] || 'U',
    location: document.querySelector('.wizard-body input[placeholder*="Straße"]')?.value || 'Berlin',
    city: 'Berlin', distance: 3,
    salary: document.querySelector('.wizard-body input[placeholder*="12,50"]')?.value || 'Nach Vereinbarung',
    hours: document.querySelector('.wizard-body input[placeholder*="Std/Woche"]')?.value || 'Flexible',
    category: 'Sonstiges', type: 'Minijob',
    posted: new Date().toISOString(),
    views: 0, clicks: 0, applications: 0,
    promoted: false, tags: [],
    description: 'Neue Stellenanzeige', requirements: '', benefits: '',
    images: [], reviews: [],
    companyInfo: { about: '', industry: '', employees: '', founded: '', instagram: '', website: '' }
  };
  JOBS.unshift(newJob);
  state.wizardStep = 0;
  showToast('Stellenanzeige veröffentlicht!');
  navigate('employer-dashboard');
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
    const textareas = document.querySelectorAll('.wizard-body textarea');
    if (textareas[0]) textareas[0].value = ex.tasks;
    if (textareas[1]) textareas[1].value = ex.req;
    if (textareas[2]) textareas[2].value = ex.benefits;
    btn.textContent = '✓ Generiert';
    btn.disabled = false;
    showToast('KI hat die Stellenanzeige vorgeneriert!');
  }, 1200);
}

// ===== BEWERTUNG ABSENDEN =====
function submitReview(btn) {
  const card = btn.closest('.card-body');
  const stars = card.querySelectorAll('.star.filled').length;
  const text = card.querySelector('textarea')?.value?.trim();
  if (!stars) { showToast('Bitte wähle eine Bewertung (1-5 Sterne).', 'error'); return; }
  if (!text) { showToast('Bitte schreibe einen kurzen Text.', 'error'); return; }
  showToast('Bewertung abgegeben! Sie wird nach Prüfung sichtbar.');
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
function addCVToProfile() {
  if (!state.user) { navigate('login'); return; }
  state.user.cvUploaded = true;
  state.user.cvFileName = 'Lebenslauf (Builder)';
  localStorage.setItem('jj_user', JSON.stringify(state.user)); if (state.user?.id) localStorage.setItem('jj_user_' + state.user.id, JSON.stringify(state.user));
  showToast('Lebenslauf wurde deinem Profil hinzugefügt!');
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

function handleCVPhoto(input) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = function(e) {
      state.cvPhoto = e.target.result;
      const preview = document.getElementById('cv-photo-preview');
      if (preview) {
        preview.style.backgroundImage = `url(${e.target.result})`;
        preview.style.backgroundSize = 'cover';
        preview.style.backgroundPosition = 'center';
        preview.innerHTML = '';
      }
    };
    reader.readAsDataURL(input.files[0]);
  }
}

function handleCompanyLogo(input) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = function(e) {
      state.user.companyLogo = e.target.result;
      localStorage.setItem('jj_user', JSON.stringify(state.user));
      localStorage.setItem('jj_user_' + state.user.id, JSON.stringify(state.user));
      const preview = document.getElementById('company-logo-preview');
      if (preview) {
        preview.style.backgroundImage = `url(${e.target.result})`;
        preview.style.backgroundSize = 'cover';
        preview.style.backgroundPosition = 'center';
        preview.innerHTML = '';
      }
      showToast('Logo hochgeladen!');
    };
    reader.readAsDataURL(input.files[0]);
  }
}

function handleCompanyImage(input) {
  if (input.files && input.files[0]) {
    if (!state.user.companyImages) state.user.companyImages = [];
    if (state.user.companyImages.length >= 6) { showToast('Maximal 6 Bilder erlaubt.', 'error'); return; }
    const reader = new FileReader();
    reader.onload = function(e) {
      state.user.companyImages.push(e.target.result);
      localStorage.setItem('jj_user', JSON.stringify(state.user));
      localStorage.setItem('jj_user_' + state.user.id, JSON.stringify(state.user));
      showToast('Bild hochgeladen!');
      render();
    };
    reader.readAsDataURL(input.files[0]);
  }
}

function removeCompanyImage(index) {
  if (!state.user.companyImages) return;
  state.user.companyImages.splice(index, 1);
  localStorage.setItem('jj_user', JSON.stringify(state.user));
  localStorage.setItem('jj_user_' + state.user.id, JSON.stringify(state.user));
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
  const name = `${data.vorname} ${data.nachname}`.trim() || 'Max Mustermann';
  const photoHTML = data.photo ? `<img src="${data.photo}" style="width:90px;height:90px;border-radius:50%;object-fit:cover;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.15)">` : `<div style="width:90px;height:90px;border-radius:50%;background:#e0e7ff;display:flex;align-items:center;justify-content:center;font-size:1.8rem;font-weight:700;color:#4f46e5;border:3px solid #fff">${(data.vorname[0]||'M')+(data.nachname[0]||'M')}</div>`;

  const skillsHTML = data.skills.length > 0 ? data.skills.map(s => `<span style="display:inline-block;padding:0.2rem 0.6rem;background:rgba(255,255,255,0.2);border-radius:4px;font-size:0.8rem;margin:0.15rem">${s}</span>`).join('') : '<span style="color:rgba(255,255,255,0.6);font-size:0.85rem">Noch keine Fähigkeiten angegeben</span>';

  const infoItems = [
    data.email ? `<div style="display:flex;align-items:center;gap:0.5rem;font-size:0.85rem">✉ ${data.email}</div>` : '',
    data.telefon ? `<div style="display:flex;align-items:center;gap:0.5rem;font-size:0.85rem">✆ ${data.telefon}</div>` : '',
    data.adresse ? `<div style="display:flex;align-items:center;gap:0.5rem;font-size:0.85rem">⌂ ${data.adresse}</div>` : '',
    data.geburtsdatum ? `<div style="display:flex;align-items:center;gap:0.5rem;font-size:0.85rem">★ ${data.geburtsdatum}</div>` : ''
  ].filter(Boolean).join('');

  if (template === 'modern') {
    return `<div style="font-family:Inter,Arial,sans-serif;max-width:700px;margin:0 auto;box-shadow:0 4px 24px rgba(0,0,0,0.1);border-radius:8px;overflow:hidden;background:#fff">
      <div style="display:flex">
        <div style="width:220px;background:linear-gradient(180deg,#4f46e5,#6366f1);color:#fff;padding:1.5rem;display:flex;flex-direction:column;align-items:center;gap:1rem">
          ${photoHTML}
          <div style="text-align:center"><h2 style="margin:0;font-size:1.1rem">${name}</h2></div>
          <div style="width:100%;border-top:1px solid rgba(255,255,255,0.2);padding-top:0.75rem;display:flex;flex-direction:column;gap:0.4rem">${infoItems}</div>
          <div style="width:100%;border-top:1px solid rgba(255,255,255,0.2);padding-top:0.75rem">
            <h4 style="font-size:0.8rem;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:0.5rem;opacity:0.8">Fähigkeiten</h4>
            <div style="display:flex;flex-wrap:wrap;gap:0.25rem">${skillsHTML}</div>
          </div>
        </div>
        <div style="flex:1;padding:1.5rem 2rem">
          <div style="margin-bottom:1.5rem"><h3 style="font-size:0.9rem;text-transform:uppercase;letter-spacing:0.05em;color:#4f46e5;border-bottom:2px solid #4f46e5;padding-bottom:0.3rem;margin-bottom:0.75rem">Schulbildung</h3>
            <div><strong>${data.schule || 'Schule angeben'}</strong><div style="font-size:0.85rem;color:#666">${data.schulZeitraum || 'Zeitraum'}</div></div></div>
          <div style="margin-bottom:1.5rem"><h3 style="font-size:0.9rem;text-transform:uppercase;letter-spacing:0.05em;color:#4f46e5;border-bottom:2px solid #4f46e5;padding-bottom:0.3rem;margin-bottom:0.75rem">Erfahrungen</h3>
            <p style="font-size:0.9rem;color:#444;white-space:pre-line">${data.erfahrungen || 'Noch keine Erfahrungen angegeben'}</p></div>
          <div><h3 style="font-size:0.9rem;text-transform:uppercase;letter-spacing:0.05em;color:#4f46e5;border-bottom:2px solid #4f46e5;padding-bottom:0.3rem;margin-bottom:0.75rem">Hobbys & Interessen</h3>
            <p style="font-size:0.9rem;color:#444;white-space:pre-line">${data.hobbys || 'Noch keine Hobbys angegeben'}</p></div>
        </div>
      </div>
    </div>`;
  } else if (template === 'classic') {
    const photoClassic = data.photo ? `<img src="${data.photo}" style="width:80px;height:80px;border-radius:4px;object-fit:cover;border:2px solid #d1d5db">` : '';
    return `<div style="font-family:Georgia,'Times New Roman',serif;max-width:700px;margin:0 auto;box-shadow:0 4px 24px rgba(0,0,0,0.1);border-radius:4px;overflow:hidden;background:#fff;padding:2rem">
      <div style="display:flex;align-items:center;gap:1.25rem;border-bottom:3px double #1f2937;padding-bottom:1rem;margin-bottom:1.25rem">
        ${photoClassic}
        <div><h1 style="margin:0;font-size:1.5rem;color:#1f2937">${name}</h1>
          <div style="display:flex;flex-wrap:wrap;gap:0.75rem;margin-top:0.35rem;font-size:0.85rem;color:#666">
            ${data.email ? `<span>✉ ${data.email}</span>` : ''}${data.telefon ? `<span>✆ ${data.telefon}</span>` : ''}${data.adresse ? `<span>⌂ ${data.adresse}</span>` : ''}${data.geburtsdatum ? `<span>★ ${data.geburtsdatum}</span>` : ''}
          </div>
        </div>
      </div>
      <div style="margin-bottom:1.25rem"><h3 style="font-size:1rem;color:#1f2937;border-bottom:1px solid #d1d5db;padding-bottom:0.25rem;margin-bottom:0.5rem">Schulbildung</h3>
        <div><strong>${data.schule || 'Schule angeben'}</strong> <span style="color:#666;font-size:0.85rem">— ${data.schulZeitraum || 'Zeitraum'}</span></div></div>
      <div style="margin-bottom:1.25rem"><h3 style="font-size:1rem;color:#1f2937;border-bottom:1px solid #d1d5db;padding-bottom:0.25rem;margin-bottom:0.5rem">Berufserfahrung</h3>
        <p style="font-size:0.9rem;color:#444;white-space:pre-line">${data.erfahrungen || 'Noch keine Erfahrungen angegeben'}</p></div>
      <div style="margin-bottom:1.25rem"><h3 style="font-size:1rem;color:#1f2937;border-bottom:1px solid #d1d5db;padding-bottom:0.25rem;margin-bottom:0.5rem">Fähigkeiten</h3>
        <p style="font-size:0.9rem;color:#444">${data.skills.join(' • ') || 'Noch keine Fähigkeiten angegeben'}</p></div>
      <div><h3 style="font-size:1rem;color:#1f2937;border-bottom:1px solid #d1d5db;padding-bottom:0.25rem;margin-bottom:0.5rem">Hobbys & Interessen</h3>
        <p style="font-size:0.9rem;color:#444;white-space:pre-line">${data.hobbys || 'Noch keine Hobbys angegeben'}</p></div>
    </div>`;
  } else {
    const skillsCreative = data.skills.length > 0 ? data.skills.map(s => `<span style="display:inline-block;padding:0.25rem 0.75rem;background:#f3e8ff;color:#7c3aed;border-radius:100px;font-size:0.8rem;font-weight:600;margin:0.15rem">${s}</span>`).join('') : '<span style="color:#999;font-size:0.85rem">Noch keine Fähigkeiten</span>';
    const photoCreative = data.photo ? `<img src="${data.photo}" style="width:100px;height:100px;border-radius:50%;object-fit:cover;border:4px solid #7c3aed;box-shadow:0 4px 16px rgba(124,58,237,0.3)">` : `<div style="width:100px;height:100px;border-radius:50%;background:linear-gradient(135deg,#7c3aed,#a78bfa);display:flex;align-items:center;justify-content:center;font-size:2rem;font-weight:700;color:#fff;border:4px solid #fff;box-shadow:0 4px 16px rgba(124,58,237,0.3)">${(data.vorname[0]||'M')+(data.nachname[0]||'M')}</div>`;
    return `<div style="font-family:Inter,Arial,sans-serif;max-width:700px;margin:0 auto;box-shadow:0 4px 24px rgba(0,0,0,0.1);border-radius:12px;overflow:hidden;background:#fff">
      <div style="background:linear-gradient(135deg,#7c3aed,#a78bfa);padding:2rem;text-align:center;color:#fff">
        ${photoCreative}
        <h1 style="margin:0.75rem 0 0.25rem;font-size:1.5rem">${name}</h1>
        <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:0.75rem;font-size:0.85rem;opacity:0.9;margin-top:0.5rem">
          ${data.email ? `<span>✉ ${data.email}</span>` : ''}${data.telefon ? `<span>✆ ${data.telefon}</span>` : ''}${data.geburtsdatum ? `<span>★ ${data.geburtsdatum}</span>` : ''}
        </div>
        ${data.adresse ? `<div style="font-size:0.85rem;opacity:0.8;margin-top:0.25rem">⌂ ${data.adresse}</div>` : ''}
      </div>
      <div style="padding:1.5rem 2rem">
        <div style="margin-bottom:1.5rem"><h3 style="font-size:0.9rem;text-transform:uppercase;letter-spacing:0.08em;color:#7c3aed;margin-bottom:0.5rem">🎓 Schulbildung</h3>
          <div style="padding-left:0.75rem;border-left:3px solid #e9d5ff"><strong>${data.schule || 'Schule angeben'}</strong><div style="font-size:0.85rem;color:#888">${data.schulZeitraum || 'Zeitraum'}</div></div></div>
        <div style="margin-bottom:1.5rem"><h3 style="font-size:0.9rem;text-transform:uppercase;letter-spacing:0.08em;color:#7c3aed;margin-bottom:0.5rem">💼 Erfahrungen</h3>
          <p style="font-size:0.9rem;color:#444;white-space:pre-line;padding-left:0.75rem;border-left:3px solid #e9d5ff">${data.erfahrungen || 'Noch keine Erfahrungen'}</p></div>
        <div style="margin-bottom:1.5rem"><h3 style="font-size:0.9rem;text-transform:uppercase;letter-spacing:0.08em;color:#7c3aed;margin-bottom:0.5rem">⚡ Fähigkeiten</h3>
          <div style="display:flex;flex-wrap:wrap;gap:0.3rem">${skillsCreative}</div></div>
        <div><h3 style="font-size:0.9rem;text-transform:uppercase;letter-spacing:0.08em;color:#7c3aed;margin-bottom:0.5rem">🎯 Hobbys & Interessen</h3>
          <p style="font-size:0.9rem;color:#444;white-space:pre-line">${data.hobbys || 'Noch keine Hobbys'}</p></div>
      </div>
    </div>`;
  }
}

function previewCV() {
  const data = getCVData();
  const template = getSelectedTemplate();
  const html = buildCVHTML(data, template);
  const win = window.open('', '_blank');
  win.document.write(`<!DOCTYPE html><html><head><title>Lebenslauf - ${data.vorname} ${data.nachname}</title><link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet"><style>body{margin:0;padding:2rem;background:#f3f4f6;}</style></head><body>${html}</body></html>`);
  win.document.close();
}

function downloadCV() {
  const data = getCVData();
  const template = getSelectedTemplate();
  const html = buildCVHTML(data, template);
  const fullHTML = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Lebenslauf - ${data.vorname} ${data.nachname}</title><link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet"><style>body{margin:0;padding:2rem;background:#fff;}@media print{body{padding:0;}}</style></head><body>${html}</body></html>`;
  const blob = new Blob([fullHTML], { type: 'text/html' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `lebenslauf-${(data.vorname||'mein').toLowerCase()}-${(data.nachname||'cv').toLowerCase()}.html`;
  a.click();
  showToast('Lebenslauf wird heruntergeladen! Öffne die Datei im Browser und drücke Strg+P zum Drucken als PDF.');
}

// ===== DOKUMENT GESCANNT =====
function docScanned(input) {
  if (input.files.length) {
    state.user.docsUploaded = true;
    localStorage.setItem('jj_user', JSON.stringify(state.user)); if (state.user?.id) localStorage.setItem('jj_user_' + state.user.id, JSON.stringify(state.user));
    showToast('Dokument erfolgreich hochgeladen!');
    render();
  }
}

// ===== SAVE JOB =====
function toggleSaveJob(jobId, e) {
  if (e) e.stopPropagation();
  if (!state.user) { navigate('register'); return; }
  const key = 'jj_saved_' + state.user.id;
  const saved = JSON.parse(localStorage.getItem(key) || '[]');
  const idx = saved.indexOf(jobId);
  if (idx > -1) saved.splice(idx, 1);
  else saved.push(jobId);
  localStorage.setItem(key, JSON.stringify(saved));
  render();
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

function goPostJob() {
  requireEmployerLogin(() => navigate('post-job'));
}

// ===== CHAT =====
function toggleChat() {
  if (!state.user) { navigate('login'); return; }
  if (state.user.role === 'employer') return; // Arbeitgeber kommen nicht auf Worker-Nachrichten
  navigate('messages');
}

function chatKey() {
  return state.user ? 'jj_chats_' + state.user.id : null;
}
function loadUserChats() {
  if (!state.user) return;
  const key = chatKey();
  const chats = JSON.parse(localStorage.getItem(key) || '[]');
  if (state.user.role === 'employer') {
    EMPLOYER_CHAT_MESSAGES.length = 0;
    chats.forEach(c => EMPLOYER_CHAT_MESSAGES.push(c));
  } else {
    WORKER_CHAT_MESSAGES.length = 0;
    chats.forEach(c => WORKER_CHAT_MESSAGES.push(c));
  }
}
function saveUserChats() {
  const key = chatKey();
  if (!key) return;
  const chats = state.user.role === 'employer' ? EMPLOYER_CHAT_MESSAGES : WORKER_CHAT_MESSAGES;
  localStorage.setItem(key, JSON.stringify(chats));
}
function getChatList() {
  if (!state.user) return [];
  return state.user.role === 'employer' ? EMPLOYER_CHAT_MESSAGES : WORKER_CHAT_MESSAGES;
}

function findChat(id) {
  return [...WORKER_CHAT_MESSAGES, ...EMPLOYER_CHAT_MESSAGES].find(c => c.id === id);
}

function renderChatWidget() {
  const content = document.getElementById('chat-content');
  const chatList = getChatList();
  if (!state.activeChat) {
    content.innerHTML = `
      <div class="chat-list">
        ${chatList.map(c => `
          <div class="chat-list-item" onclick="openChat(${c.id})">
            <div class="user-avatar" style="width:36px;height:36px;font-size:0.75rem">${c.partnerInitials}</div>
            <div style="flex:1;min-width:0">
              <div style="font-weight:600;font-size:0.85rem">${c.partnerName}</div>
              <div style="font-size:0.75rem;color:var(--gray-400);margin-bottom:0.1rem">${c.jobTitle}</div>
              <div style="font-size:0.8rem;color:var(--gray-500);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${c.lastMessage}</div>
            </div>
            <div style="text-align:right">
              <div style="font-size:0.7rem;color:var(--gray-400)">${c.time}</div>
              ${c.unread ? '<div class="unread" style="margin-left:auto;margin-top:4px"></div>' : ''}
            </div>
          </div>
        `).join('')}
        ${chatList.length === 0 ? '<div style="padding:1.5rem;text-align:center;color:var(--gray-400);font-size:0.85rem">Noch keine Nachrichten</div>' : ''}
      </div>`;
  } else {
    const chat = findChat(state.activeChat);
    content.innerHTML = `
      <div style="padding:0.5rem;border-bottom:1px solid var(--gray-200);display:flex;align-items:center;gap:0.5rem">
        <button onclick="state.activeChat=null;renderChatWidget()" style="background:none;border:none;cursor:pointer;font-size:1.1rem">&#8592;</button>
        <strong style="font-size:0.85rem">${chat.partnerName}</strong>
      </div>
      <div class="chat-messages" style="flex:1;overflow-y:auto;padding:0.75rem">
        ${chat.messages.map(m => `
          <div class="chat-msg ${m.sent ? 'sent' : 'received'}">
            ${m.text}
            <div class="msg-time">${m.time}</div>
          </div>
        `).join('')}
      </div>
      <div class="chat-input-area">
        <input type="text" placeholder="Nachricht..." id="chat-input" onkeydown="if(event.key==='Enter')sendChatMessage()">
        <button onclick="sendChatMessage()">→</button>
      </div>`;
  }
}

function openChat(id) {
  state.activeChat = id;
  renderChatWidget();
}

function updateApplicantStatus(applicantId, newStatus) {
  const a = MOCK_APPLICANTS.find(x => x.id === applicantId);
  if (!a) return;
  const statusTexts = { new: 'Neu', reviewing: 'In Prüfung', accepted: 'Eingeladen', rejected: 'Abgelehnt' };
  a.status = newStatus;
  a.statusText = statusTexts[newStatus];
  if (newStatus === 'rejected' || newStatus === 'accepted') {
    let chat = EMPLOYER_CHAT_MESSAGES.find(c => c.partnerName === a.name);
    if (!chat) {
      chat = { id: 100 + applicantId, partnerId: 'worker-' + applicantId, partnerName: a.name, partnerInitials: a.initials, jobTitle: a.job, lastMessage: '', time: '', unread: false, messages: [] };
      EMPLOYER_CHAT_MESSAGES.push(chat);
    }
    const now = new Date();
    const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2,'0')}`;
    const msg = newStatus === 'rejected'
      ? `Hallo ${a.name.split(' ')[0]}, vielen Dank für deine Bewerbung auf die Stelle "${a.job}". Leider müssen wir dir mitteilen, dass wir uns für einen anderen Bewerber entschieden haben. Wir wünschen dir alles Gute!`
      : `Hallo ${a.name.split(' ')[0]}, wir freuen uns dir mitzuteilen, dass deine Bewerbung auf die Stelle "${a.job}" erfolgreich war! Wir würden dich gerne zu einem Gespräch einladen. Melde dich gerne zurück, damit wir einen Termin vereinbaren können.`;
    chat.messages.push({ text: msg, sent: true, time: time });
    chat.lastMessage = msg;
    chat.time = time;
    saveUserChats();
  }
  render();
}

function openApplicantChat(applicantId) {
  const a = MOCK_APPLICANTS.find(x => x.id === applicantId);
  if (!a) { navigate('messages'); return; }
  let chat = EMPLOYER_CHAT_MESSAGES.find(c => c.partnerName === a.name);
  if (!chat) {
    chat = {
      id: 100 + applicantId,
      partnerId: 'worker-' + applicantId,
      partnerName: a.name,
      partnerInitials: a.initials,
      jobTitle: a.job,
      lastMessage: '',
      time: '',
      unread: false,
      messages: []
    };
    EMPLOYER_CHAT_MESSAGES.push(chat);
  saveUserChats();
  }
  state.activeChat = chat.id;
  navigate('chat', { chatId: chat.id });
}

function sendChatMessage() {
  const input = document.getElementById('chat-input');
  if (!input || !input.value.trim()) return;
  const chat = findChat(state.activeChat);
  if (chat) {
    const now = new Date();
    chat.messages.push({ text: input.value, sent: true, time: `${now.getHours()}:${String(now.getMinutes()).padStart(2,'0')}` });
    saveUserChats();
    input.value = '';
    if (state.currentPage === 'chat') {
      render();
      // Scroll to bottom after render
      setTimeout(() => {
        const el = document.getElementById('chat-messages-page');
        if (el) el.scrollTop = el.scrollHeight;
      }, 50);
    } else {
      renderChatWidget();
    }
    setTimeout(() => {
      chat.messages.push({ text: 'Danke für deine Nachricht! Ich melde mich bald.', sent: false, time: `${now.getHours()}:${String(now.getMinutes()+1).padStart(2,'0')}` });
      saveUserChats();
      if (state.currentPage === 'chat') {
        render();
        setTimeout(() => {
          const el = document.getElementById('chat-messages-page');
          if (el) el.scrollTop = el.scrollHeight;
        }, 50);
      } else {
        renderChatWidget();
      }
    }, 1500);
  }
}

// ===== AI ASSISTANT =====
function toggleAI() {
  state.aiOpen = !state.aiOpen;
  document.getElementById('ai-panel').classList.toggle('hidden');
  document.getElementById('ai-widget').classList.toggle('hidden', state.aiOpen);
}

function sendAIMessage() {
  const input = document.getElementById('ai-input');
  if (!input || !input.value.trim()) return;
  const msg = input.value.trim();
  const container = document.getElementById('ai-messages');
  container.innerHTML += `<div class="ai-msg user">${escapeHtml(msg)}</div>`;
  input.value = '';

  // Find best matching response (most keyword hits wins)
  const lower = msg.toLowerCase();
  let bestMatch = null;
  let bestScore = 0;
  for (const entry of AI_RESPONSES) {
    const score = entry.keywords.filter(kw => lower.includes(kw)).length;
    if (score > bestScore) { bestScore = score; bestMatch = entry; }
  }
  const response = bestMatch ? bestMatch.answer : AI_RESPONSES.defaultAnswer;

  setTimeout(() => {
    container.innerHTML += `<div class="ai-msg bot">${response.replace(/\n/g, '<br>')}</div>`;
    container.scrollTop = container.scrollHeight;
  }, 800);
}

// ===== HELPER =====
function escapeHtml(text) {
  const d = document.createElement('div');
  d.textContent = text;
  return d.innerHTML;
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

function toggleHoursFilter(h) {
  const idx = state.filters.hours.indexOf(h);
  if (idx > -1) state.filters.hours.splice(idx, 1);
  else state.filters.hours.push(h);
  render();
}

function getFilteredJobs() {
  let jobs = [...JOBS];
  const f = state.filters;
  if (f.search) {
    const s = f.search.toLowerCase();
    jobs = jobs.filter(j => j.title.toLowerCase().includes(s) || j.company.toLowerCase().includes(s) || j.tags.some(t => t.toLowerCase().includes(s)));
  }
  if (f.category) jobs = jobs.filter(j => j.category === f.category);
  if (f.type) jobs = jobs.filter(j => j.type === f.type);
  if (f.radius < 50) jobs = jobs.filter(j => j.distance <= f.radius);
  if (f.city) jobs = jobs.filter(j => j.city === f.city);
  if (f.hours.length > 0) {
    jobs = jobs.filter(j => {
      const match = j.hours.match(/(\d+)/);
      if (!match) return false;
      return f.hours.includes(parseInt(match[0]));
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
    <div class="hero">
      <div class="hero-content slide-up">
        <h1>Finde deinen perfekten Nebenjob</h1>
        <p>Die Plattform, die junge Talente mit den besten Arbeitgebern verbindet. Einfach, schnell und sicher.</p>
        <div class="hero-buttons">
          <button class="btn btn-lg btn-primary" onclick="navigate('jobs')">Jobs entdecken</button>
          <button class="btn btn-lg btn-outline" onclick="navigate('employer-landing')">Stellenanzeige schalten</button>
        </div>
        <div class="stats-bar">
          <div class="stat"><div class="stat-number">2.500</div><div class="stat-label">Aktive Jobs</div></div>
          <div class="stat"><div class="stat-number">15.000</div><div class="stat-label">Registrierte Nutzer</div></div>
          <div class="stat"><div class="stat-number">800</div><div class="stat-label">Unternehmen</div></div>
          <div class="stat"><div class="stat-number">98%</div><div class="stat-label">Zufriedenheit</div></div>
        </div>
      </div>
    </div>

    <div class="section-band section-band-white">
    <div class="features-section">
      <div class="section-header">
        <h2>Warum EasyJobs?</h2>
        <p>Alles was du brauchst, um den perfekten Job zu finden oder die besten Talente einzustellen.</p>
      </div>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></div>
          <h3>Smarte Jobsuche</h3>
          <p>Finde Jobs in deiner Nähe mit intelligenten Filtern nach Umkreis, Arbeitszeit und Branche.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M9 9h.01M15 9h.01M9 15h6"/></svg></div>
          <h3>KI-Unterstützung</h3>
          <p>Unser KI-Assistent hilft dir bei Motivationsschreiben, Lebenslauf und beantwortet deine Fragen.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div>
          <h3>Direkter Chat</h3>
          <p>Kommuniziere direkt mit Arbeitgebern über unseren integrierten Chat.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg></div>
          <h3>Lebenslauf-Builder</h3>
          <p>Erstelle professionelle Lebensläufe mit unseren modernen Vorlagen.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg></div>
          <h3>Analytics Dashboard</h3>
          <p>Arbeitgeber sehen in Echtzeit wie ihre Anzeigen performen.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></div>
          <h3>Bewertungssystem</h3>
          <p>Transparente Bewertungen von beiden Seiten für mehr Vertrauen.</p>
        </div>
      </div>
    </div>
    </div>

    <div class="section-band section-band-soft">
    <div class="cta-section">
      <h2>Bereit, deinen nächsten Job zu finden?</h2>
      <p>Entdecke hunderte Minijobs und Nebenjobs in deiner Nähe – kostenlos und ohne Umwege.</p>
      <button class="btn btn-lg" onclick="navigate('jobs')">Jobs finden</button>
    </div>
    </div>

    <div class="section-band section-band-mid">
    <div class="photo-strip">
      <div class="photo-strip-item">
        <img src="images/foto1.jpg" alt="Junger Kellner im Café" loading="lazy">
        <div class="photo-strip-label">Gastronomie</div>
      </div>
      <div class="photo-strip-item">
        <img src="images/foto2.jpg" alt="Azubi an der Kasse" loading="lazy">
        <div class="photo-strip-label">Einzelhandel</div>
      </div>
    </div>
    </div>

    <div class="section-band section-band-soft">
    <div class="testimonials-section">
      <div class="section-header">
        <h2>Das sagen unsere Nutzer</h2>
        <p>Tausende Schüler haben über EasyJobs ihren ersten Job gefunden.</p>
      </div>
      <div class="testimonials-grid">
        ${TESTIMONIALS.slice(0, 3).map(t => `
          <div class="testimonial-card fade-in">
            <div class="testimonial-stars">${'&#9733;'.repeat(t.rating)}${'&#9734;'.repeat(5 - t.rating)}</div>
            <div class="testimonial-text">"${t.text}"</div>
            <div class="testimonial-author">
              <div class="testimonial-avatar">${t.initials}</div>
              <div>
                <div class="testimonial-name">${t.name}</div>
                <div class="testimonial-role">${t.role}</div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
    </div>

    <div class="section-band section-band-white">
    <div class="cta-section">
      <h2>Starte jetzt durch!</h2>
      <p>Egal ob Arbeitnehmer oder Arbeitgeber - registriere dich kostenlos und leg los.</p>
      <div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap">
        <button class="btn btn-lg" onclick="navigate('register')">Kostenlos registrieren</button>
        <button class="btn btn-lg" style="background:transparent;border:2px solid rgba(255,255,255,0.4);color:#fff" onclick="navigate('employer-landing')">Stellenanzeige schalten</button>
      </div>
    </div>
    </div>

    <div class="section-band section-band-soft">
    <div class="faq-section">
      <div class="section-header">
        <h2>Häufige Fragen</h2>
        <p>Alles was du über EasyJobs wissen musst.</p>
      </div>
      <div class="faq-list">
        ${[
          { q: 'Ist EasyJobs kostenlos?', a: 'Ja, für Schüler und Jobsuchende ist EasyJobs vollständig kostenlos. Du kannst dich registrieren, Bewerbungen abschicken und Arbeitgeber kontaktieren – ohne versteckte Kosten.' },
          { q: 'Wie alt muss ich sein, um mich zu bewerben?', a: 'Du kannst dich ab 13 Jahren registrieren. Für bestimmte Jobs gelten gesetzliche Altersgrenzen – diese sind direkt in der Stellenanzeige angegeben.' },
          { q: 'Was ist ein Minijob?', a: 'Ein Minijob ist eine geringfügige Beschäftigung mit einem Verdienst bis 538 € pro Monat. Du zahlst keine Steuern und Sozialabgaben sind minimal – ideal als erster Job neben der Schule.' },
          { q: 'Wie bewerbe ich mich auf einen Job?', a: 'Einfach Profil anlegen, Lebenslauf hochladen und auf „Jetzt bewerben" klicken. Der Arbeitgeber erhält deine Bewerbung sofort und kann dich direkt über den Chat kontaktieren.' },
          { q: 'Kann ich mehrere Jobs gleichzeitig haben?', a: 'Grundsätzlich ja – bei mehreren Minijobs musst du jedoch darauf achten, dass du die 538 €-Grenze insgesamt nicht überschreitest. Bei Unsicherheiten hilft dein Steuerberater oder das Finanzamt weiter.' },
          { q: 'Wie sicher sind meine Daten?', a: 'Deine Daten werden verschlüsselt gespeichert und niemals ohne deine Zustimmung an Dritte weitergegeben. Arbeitgeber sehen nur die Informationen, die du in deinem Profil freigibst.' },
        ].map((item, i) => `
          <div class="faq-item" onclick="this.classList.toggle('open')">
            <div class="faq-question">
              <span>${item.q}</span>
              <svg class="faq-chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
            <div class="faq-answer">${item.a}</div>
          </div>
        `).join('')}
      </div>
    </div>
    </div>`;
}

function renderJobSearch() {
  const jobs = getFilteredJobs();
  return `
    <div class="page page-wide">
      <div class="search-header">
        <div class="search-bar">
          <input type="text" placeholder="Job, Unternehmen oder Stichwort..." value="${state.filters.search}" oninput="state.filters.search=this.value;render()">
          <button class="btn btn-primary" onclick="render()">Suchen</button>
        </div>
        <div style="display:flex;align-items:center;gap:1rem">
          <span class="search-results-count">${jobs.length} Jobs gefunden</span>
          <select class="sort-select" onchange="state.filters.sort=this.value;render()">
            <option value="date" ${state.filters.sort==='date'?'selected':''}>Neueste zuerst</option>
            <option value="distance" ${state.filters.sort==='distance'?'selected':''}>Entfernung</option>
            <option value="views" ${state.filters.sort==='views'?'selected':''}>Beliebtheit</option>
          </select>
        </div>
      </div>
      <div class="search-layout">
        <aside class="search-sidebar">
          <h3 style="font-size:1rem;margin-bottom:1rem">Filter</h3>

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
              ${[...new Set(JOBS.map(j => j.city))].sort().map(c => `<option value="${c}" ${state.filters.city===c?'selected':''}>${c}</option>`).join('')}
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
            <div style="display:flex;justify-content:space-between;font-size:0.75rem;color:var(--gray-400)">
              <span>5 km</span><span>25 km</span><span>50+ km</span>
            </div>
          </div>

          <button class="btn btn-outline btn-block" onclick="state.filters={search:'',category:'',type:'',radius:50,hours:[],city:'',sort:'date'};render()">Filter zurücksetzen</button>
        </aside>

        <div class="jobs-grid">
          ${jobs.map(j => renderJobCard(j)).join('')}
          ${jobs.length === 0 ? `
            <div class="empty-state">
              <div class="empty-state-icon"></div>
              <h3>Keine Jobs gefunden</h3>
              <p>Versuche andere Filter oder erweitere deinen Suchradius.</p>
            </div>` : ''}
        </div>
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
          <div class="job-company-logo" ${j.companyLogo && j.companyLogo.startsWith('data:') ? `style="background-image:url(${j.companyLogo});background-size:cover;background-position:center"` : ''}>${j.companyLogo && j.companyLogo.startsWith('data:') ? '' : j.companyLogo}</div>
          <div class="job-card-info">
            <h3>${j.title}</h3>
            <div class="job-company-name">${j.company}</div>
          </div>
        </div>
        <div class="job-card-meta">
          <span class="job-meta-item">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            ${j.city} (${j.distance} km)
          </span>
          <span class="job-meta-item">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            ${j.hours}
          </span>
          <span class="job-meta-item">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
            ${j.salary}
          </span>
        </div>
        <div class="job-card-tags">
          <span class="badge badge-primary">${j.type}</span>
          ${j.tags.slice(0,3).map(t => `<span class="tag">${t}</span>`).join('')}
        </div>
        <div class="job-card-date">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          ${formatDate(j.posted)}
        </div>
      </div>
      <div class="job-card-actions">
        <div class="job-stats">
          <div class="job-stat-row" title="Gespeichert von">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
            ${j.saves || 0}
          </div>
          <div class="job-stat-row" title="Bewerbungen">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            ${j.applications || 0}
          </div>
        </div>
        <button class="save-btn ${saved ? 'saved' : ''}" onclick="toggleSaveJob(${j.id}, event)" title="${saved ? 'Gespeichert' : 'Speichern'}">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="${saved ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
        </button>
      </div>
    </div>`;
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
                <h1>${job.title}</h1>
                <div class="job-detail-company">
                  <span class="job-company-logo" style="width:40px;height:40px;${job.companyLogo && job.companyLogo.startsWith('data:') ? `background-image:url(${job.companyLogo});background-size:cover;background-position:center` : ''}">${job.companyLogo && job.companyLogo.startsWith('data:') ? '' : job.companyLogo}</span>
                  <span style="font-weight:600">${job.company}</span>
                </div>
              </div>
              <button class="save-btn ${saved ? 'saved' : ''}" onclick="toggleSaveJob(${job.id})" style="font-size:1.5rem">${saved ? '♥' : '♡'}</button>
            </div>
            <div class="job-detail-badges">
              <span class="badge badge-primary">${job.type}</span>
              <span class="badge badge-gray">${job.location}</span>
              <span class="badge badge-gray">${job.hours}</span>
              <span class="badge badge-success">${job.salary}</span>
            </div>
            <div style="margin-top:1rem;display:flex;gap:1.5rem;font-size:0.8rem;color:var(--gray-500)">
              <span>Hochgeladen: ${formatDate(job.posted)}</span>
              <span>${job.views} Aufrufe</span>
              <span>${job.clicks} Klicks</span>
              <span>${job.applications} Bewerbungen</span>
            </div>
          </div>
          <div class="job-detail-body">
            ${job.description}
          </div>
          ${job.images.length > 0 ? `
            <div style="padding:0 2rem 2rem">
              <h3 style="font-size:1.05rem;margin-bottom:0.75rem">Bilder</h3>
              <div class="job-images">
                ${job.images.map(img => `<div class="job-image-placeholder">${img}</div>`).join('')}
              </div>
            </div>` : ''}
          <div style="padding:0 2rem 2rem">
            <h3 style="font-size:1.05rem;margin-bottom:0.75rem">★ Bewertungen</h3>
            ${job.reviews.length > 0 ? job.reviews.map(r => `
              <div class="review-card">
                <div class="review-header">
                  <div class="review-author">
                    <div class="user-avatar" style="width:32px;height:32px;font-size:0.7rem">${r.author.split(' ').map(n=>n[0]).join('')}</div>
                    <div>
                      <strong style="font-size:0.85rem">${r.author}</strong>
                      ${r.active ? '<span class="badge badge-success" style="margin-left:0.5rem;font-size:0.7rem">Aktiv beschäftigt</span>' : ''}
                    </div>
                  </div>
                  <div class="stars">${'<span class="star filled">&#9733;</span>'.repeat(r.rating)}${'<span class="star">&#9734;</span>'.repeat(5-r.rating)}</div>
                </div>
                <div class="review-text">${r.text}</div>
                <div class="review-date">${formatDate(r.date)}</div>
              </div>
            `).join('') : '<p style="font-size:0.85rem;color:var(--gray-400);margin-bottom:1rem">Noch keine Bewertungen.</p>'}
          </div>
        </div>

        <div class="job-detail-sidebar">
          <div class="card">
            <div class="card-body">
              <button class="btn btn-primary btn-block btn-lg" id="apply-btn-${job.id}" onclick="${state.user && state.user.role !== 'employer' ? `submitApplication(${job.id})` : `navigate('login')`}">
                ${state.user && state.user.role !== 'employer' ? (getUserApps().includes(job.id) ? '✓ Beworben' : 'Jetzt bewerben') : 'Anmelden zum Bewerben'}
              </button>

              <div style="margin-top:1.5rem">
                <h3 style="font-size:1rem;margin-bottom:1rem">Über ${job.company}</h3>
                <p style="font-size:0.85rem;color:var(--gray-600);margin-bottom:1rem">${job.companyInfo.about}</p>
                <div style="display:flex;flex-direction:column;gap:0.5rem">
                  <div class="company-info-row"><span class="label">Branche:</span> <span>${job.companyInfo.industry}</span></div>
                  <div class="company-info-row"><span class="label">Mitarbeiter:</span> <span>${job.companyInfo.employees}</span></div>
                  <div class="company-info-row"><span class="label">Gegründet:</span> <span>${job.companyInfo.founded}</span></div>
                  <div class="company-info-row"><span class="label">Instagram:</span> <span style="color:var(--primary)">${job.companyInfo.instagram}</span></div>
                  <div class="company-info-row"><span class="label">Website:</span> <span style="color:var(--primary)">${job.companyInfo.website}</span></div>
                  <div class="company-info-row"><span class="label">Adresse:</span> <span>${job.location}</span></div>
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
            <input type="email" name="email" class="form-input" placeholder="deine@email.de" value="test@test.de" required>
          </div>
          <div class="form-group">
            <label class="form-label">Passwort</label>
            <input type="password" name="password" class="form-input" placeholder="Dein Passwort" value="test1234" required>
          </div>
          <div id="login-error" style="display:none;background:#fef2f2;border:1px solid #fca5a5;color:#dc2626;border-radius:8px;padding:0.6rem 0.9rem;font-size:0.85rem;margin-bottom:0.75rem"></div>
          <button type="submit" class="btn btn-primary btn-block btn-lg">Anmelden</button>
        </form>
        <div class="auth-divider">oder</div>
        <p style="text-align:center;font-size:0.9rem">Noch kein Konto? <a href="#" onclick="navigate('register')" style="color:var(--primary);font-weight:600">Jetzt registrieren</a></p>
      </div>
    </div>`;
}

function renderRegister() {
  return `
    <div class="auth-page">
      <div class="auth-card fade-in" style="max-width:500px">
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
              <input type="text" name="firstName" class="form-input" placeholder="Max" value="Max" required>
            </div>
            <div class="form-group">
              <label class="form-label">Nachname</label>
              <input type="text" name="lastName" class="form-input" placeholder="Mustermann" value="Mustermann" required>
            </div>
          </div>
          <div class="form-group employer-field" style="display:none">
            <label class="form-label">Firmenname</label>
            <input type="text" name="company" class="form-input" placeholder="z.B. MediaMarkt GmbH">
          </div>
          <div class="form-group">
            <label class="form-label">E-Mail</label>
            <input type="email" name="email" class="form-input" placeholder="deine@email.de" value="test@test.de" required>
          </div>
          <div class="form-group">
            <label class="form-label">Passwort</label>
            <input type="password" name="password" class="form-input" placeholder="Min. 8 Zeichen" value="test1234" required minlength="8">
          </div>
          <div id="register-error" style="display:none;color:var(--danger);font-size:0.85rem;margin-bottom:0.75rem"></div>
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

          <h2 class="dashboard-title">Hallo, ${state.user.name.split(' ')[0]}!</h2>

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
                    <div class="wdt-msg-name">${m.partnerName}</div>
                    <div class="wdt-msg-preview">${m.messages[m.messages.length-1]?.text?.slice(0,45) || ''}…</div>
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
                <div class="wdt-job-row" onclick="event.stopPropagation();navigate('job-detail',${j.id})">
                  <div class="wdt-job-logo">${j.company[0]}</div>
                  <div class="wdt-job-info">
                    <div class="wdt-job-title">${j.title}</div>
                    <div class="wdt-job-company">${j.company} · ${j.city}</div>
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

function uploadCV(input) {
  if (input.files.length) {
    state.user.cvUploaded = true;
    state.user.cvFileName = input.files[0].name;
    localStorage.setItem('jj_user', JSON.stringify(state.user)); if (state.user?.id) localStorage.setItem('jj_user_' + state.user.id, JSON.stringify(state.user));
    showToast('Lebenslauf erfolgreich hochgeladen!');
    render();
  }
}

function addRef() {
  const name = prompt('Arbeitgeber & Position (z.B. Rewe – Kassierer/in):');
  if (!name || !name.trim()) return;
  if (!state.user.refs) state.user.refs = [];
  state.user.refs.push(name.trim());
  state.user.hasRefs = true;
  localStorage.setItem('jj_user', JSON.stringify(state.user)); if (state.user?.id) localStorage.setItem('jj_user_' + state.user.id, JSON.stringify(state.user));
  render();
  setTimeout(() => navigateToSection('worker-profile', 'section-skills'), 10);
}

function removeRef(i) {
  state.user.refs.splice(i, 1);
  if (!state.user.refs.length) state.user.hasRefs = false;
  localStorage.setItem('jj_user', JSON.stringify(state.user)); if (state.user?.id) localStorage.setItem('jj_user_' + state.user.id, JSON.stringify(state.user));
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
      </nav>
    </div>`;
}

function renderWorkerProfileView() {
  if (!state.user) return renderLogin();
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
              <div class="epc-avatar">${u.name.split(' ').map(n=>n[0]).join('')}</div>
              <div class="epc-info">
                <h2 class="epc-name">${u.name}</h2>
                <div class="epc-meta-row">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  ${u.email}
                </div>
                ${address ? `
                <div class="epc-meta-row">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  ${address}
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
                <div style="font-size:0.68rem;color:var(--gray-400);margin-top:0.2rem">vollständig</div>
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
                    <span>${r}</span>
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
                       <span>${u.cvFileName || 'Lebenslauf'}</span>`
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

  const stepContent = [
    // ── Schritt 0: Adresse ──
    `<h3 class="profile-step-title">Adresse & Umkreis</h3>
    <p class="profile-step-hint">Damit wir dir passende Jobs in deiner Nähe zeigen können.</p>
    <div class="form-group">
      <label class="form-label">Deine Adresse</label>
      <input type="text" id="ps-address" class="form-input" placeholder="Musterstraße 1, 10115 Berlin" value="${u.address || ''}">
    </div>
    <div class="form-group">
      <label class="form-label">Suchradius: <strong id="radius-label">${u.radius || 15} km</strong></label>
      <input type="range" class="range-slider" min="5" max="50" step="5" value="${u.radius || 15}"
        oninput="document.getElementById('radius-label').textContent=this.value+' km'">
      <div style="display:flex;justify-content:space-between;font-size:0.75rem;color:var(--gray-400);margin-top:0.25rem">
        <span>5 km</span><span>25 km</span><span>50 km</span>
      </div>
    </div>`,

    // ── Schritt 1: Lebenslauf ──
    `<h3 class="profile-step-title">Lebenslauf</h3>
    <p class="profile-step-hint">Arbeitgeber sehen deinen Lebenslauf direkt bei deiner Bewerbung.</p>
    ${u.cvUploaded ? `
      <div class="upload-success-bar">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--success)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        <span>${u.cvFileName || 'Lebenslauf hochgeladen'}</span>
        <button class="btn btn-sm btn-outline" style="margin-left:auto" onclick="state.user.cvUploaded=false;localStorage.setItem('jj_user',JSON.stringify(state.user));render()">Entfernen</button>
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
        <button class="btn btn-sm btn-outline" style="margin-left:auto" onclick="state.user.docsUploaded=false;localStorage.setItem('jj_user',JSON.stringify(state.user));render()">Entfernen</button>
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
      <label class="form-label">Deine Top-3 Stärken <span style="color:var(--gray-400);font-weight:400;font-size:0.8rem">(max. 3 wählbar)</span></label>
      <div class="checkbox-group">
        ${SKILLS.map(s => `<label class="checkbox-label"><input type="checkbox" ${u.skills?.includes(s)?'checked':''} onchange="limitSkills(this,3)"> <span>${s}</span></label>`).join('')}
      </div>
    </div>
    <div class="form-group" style="margin-top:1.25rem">
      <label class="form-label">Bisherige Jobs / Referenzen</label>
      <div id="refs-list">
        ${(u.refs||[]).map((r,i) => `
          <div style="display:flex;align-items:center;gap:0.5rem;padding:0.55rem 0.75rem;background:var(--gray-50);border-radius:8px;margin-bottom:0.4rem;font-size:0.88rem">
            <span style="flex:1">${r}</span>
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
            <div class="profile-avatar">${u.name.split(' ').map(n=>n[0]).join('')}</div>
            <div class="profile-info">
              <h2>${u.name}</h2>
              <p>${u.email}</p>
            </div>
          </div>

          <!-- Schritt-Indikatoren -->
          <div class="profile-step-indicators">
            ${PROFILE_STEPS.map((s,i) => `
              <div class="psi-item ${i===step?'active':''} ${i<step?'done':''}" onclick="saveProfileStep();state.profileStep=${i};render()">
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
              ? `<button class="btn btn-outline" onclick="saveProfileStep();state.profileStep=Math.max(0,state.profileStep-1);render()">← Zurück</button>`
              : `<button class="btn btn-outline" onclick="navigate('worker-dashboard')">← Dashboard</button>`}
            ${step < total-1
              ? `<button class="btn btn-primary" onclick="saveProfileStep();state.profileStep=Math.min(${total-1},state.profileStep+1);render()">Weiter →</button>`
              : `<button class="btn btn-primary" onclick="saveProfileStep();showToast('Profil gespeichert!');navigate('worker-dashboard')">✓ Profil speichern</button>`}
          </div>

        </div>
      </div>
    </div>`;
}

function saveProfileStep() {
  const u = state.user;
  const step = state.profileStep;
  if (step === 0) {
    const addr   = document.getElementById('ps-address');
    const radius = document.querySelector('.range-slider');
    if (addr   && addr.value.trim())  u.address = addr.value.trim();
    if (radius) u.radius = parseInt(radius.value);
  }
  if (step === 3) {
    const hours   = document.getElementById('ps-hours');
    if (hours) u.weeklyHours = hours.value;
    const checked = [...document.querySelectorAll('.checkbox-group input:checked')]
      .map(c => c.nextElementSibling.textContent.trim());
    if (checked.length) u.skills = checked;
    // Referenzen werden via addRef() direkt gespeichert
  }
  localStorage.setItem('jj_user', JSON.stringify(u));
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
  const apps = [
    { job: JOBS[1], status: 'reviewing', statusText: 'In Prüfung', date: '2026-03-22' },
    { job: JOBS[0], status: 'accepted', statusText: 'Eingeladen', date: '2026-03-20' },
    { job: JOBS[3], status: 'new', statusText: 'Gesendet', date: '2026-03-23' }
  ];
  return `
    <div class="page">
      <div class="dashboard-layout">
        ${renderWorkerSidebar('applications')}
        <div class="dashboard-content">
          <h2 class="dashboard-title">Meine Bewerbungen</h2>
          <div class="jobs-grid">
            ${apps.map(a => `
              <div class="card" style="cursor:pointer" onclick="navigate('job-detail', {jobId: ${a.job.id}})">
                <div class="card-body" style="display:flex;justify-content:space-between;align-items:center">
                  <div style="display:flex;align-items:center;gap:1rem">
                    <div class="job-company-logo">${a.job.companyLogo}</div>
                    <div>
                      <h3 style="font-size:1rem;margin-bottom:0.25rem">${a.job.title}</h3>
                      <div style="font-size:0.85rem;color:var(--gray-500)">${a.job.company}</div>
                    </div>
                  </div>
                  <div style="text-align:right">
                    <div class="badge ${a.status==='accepted'?'badge-success':a.status==='reviewing'?'badge-secondary':'badge-primary'}">${a.statusText}</div>
                    <div style="font-size:0.8rem;color:var(--gray-400);margin-top:0.25rem">${formatDate(a.date)}</div>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
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

          <div style="margin-bottom:2rem">
            <h3 style="font-size:1.1rem;margin-bottom:1rem">Vorlage wählen</h3>
            <div class="cv-templates">
              <div class="cv-template selected" data-template="modern" onclick="document.querySelectorAll('.cv-template').forEach(el=>el.classList.remove('selected'));this.classList.add('selected')">
                <div class="cv-preview" style="position:relative;overflow:hidden">
                  <div style="display:flex;height:100%">
                    <div style="width:35%;background:linear-gradient(180deg,#4f46e5,#6366f1);padding:0.75rem;display:flex;flex-direction:column;align-items:center;gap:0.5rem">
                      <div style="width:28px;height:28px;border-radius:50%;background:rgba(255,255,255,0.3);margin-top:0.25rem"></div>
                      <div style="height:5px;background:rgba(255,255,255,0.4);width:80%;border-radius:2px"></div>
                      <div style="height:4px;background:rgba(255,255,255,0.25);width:60%;border-radius:2px"></div>
                      <div style="height:4px;background:rgba(255,255,255,0.25);width:70%;border-radius:2px"></div>
                    </div>
                    <div style="flex:1;padding:0.75rem;display:flex;flex-direction:column;gap:0.35rem">
                      <div style="height:5px;background:#4f46e5;width:45%;border-radius:2px;margin-bottom:0.15rem"></div>
                      <div style="height:4px;background:var(--gray-200);width:100%;border-radius:2px"></div>
                      <div style="height:4px;background:var(--gray-200);width:85%;border-radius:2px"></div>
                      <div style="height:10px"></div>
                      <div style="height:5px;background:#4f46e5;width:35%;border-radius:2px;margin-bottom:0.15rem"></div>
                      <div style="height:4px;background:var(--gray-200);width:90%;border-radius:2px"></div>
                    </div>
                  </div>
                </div>
                <div class="cv-template-name">Modern</div>
              </div>
              <div class="cv-template" data-template="classic" onclick="document.querySelectorAll('.cv-template').forEach(el=>el.classList.remove('selected'));this.classList.add('selected')">
                <div class="cv-preview" style="position:relative;overflow:hidden;padding:0.75rem">
                  <div style="display:flex;align-items:center;gap:0.5rem;border-bottom:2px double #1f2937;padding-bottom:0.5rem;margin-bottom:0.5rem">
                    <div style="width:24px;height:24px;border-radius:3px;background:var(--gray-200)"></div>
                    <div><div style="height:6px;background:#1f2937;width:60px;border-radius:2px;margin-bottom:3px"></div><div style="height:4px;background:var(--gray-300);width:80px;border-radius:2px"></div></div>
                  </div>
                  <div style="display:flex;flex-direction:column;gap:0.3rem">
                    <div style="height:4px;background:#1f2937;width:40%;border-radius:2px"></div>
                    <div style="height:3px;background:var(--gray-200);width:100%;border-radius:2px"></div>
                    <div style="height:3px;background:var(--gray-200);width:80%;border-radius:2px"></div>
                    <div style="height:8px"></div>
                    <div style="height:4px;background:#1f2937;width:35%;border-radius:2px"></div>
                    <div style="height:3px;background:var(--gray-200);width:90%;border-radius:2px"></div>
                  </div>
                </div>
                <div class="cv-template-name">Klassisch</div>
              </div>
              <div class="cv-template" data-template="creative" onclick="document.querySelectorAll('.cv-template').forEach(el=>el.classList.remove('selected'));this.classList.add('selected')">
                <div class="cv-preview" style="position:relative;overflow:hidden">
                  <div style="background:linear-gradient(135deg,#7c3aed,#a78bfa);padding:0.75rem;text-align:center">
                    <div style="width:30px;height:30px;border-radius:50%;background:rgba(255,255,255,0.3);margin:0 auto 0.25rem;border:2px solid rgba(255,255,255,0.5)"></div>
                    <div style="height:5px;background:rgba(255,255,255,0.5);width:50%;border-radius:2px;margin:0 auto 0.15rem"></div>
                    <div style="height:3px;background:rgba(255,255,255,0.3);width:65%;border-radius:2px;margin:0 auto"></div>
                  </div>
                  <div style="padding:0.5rem 0.75rem;display:flex;flex-direction:column;gap:0.3rem">
                    <div style="height:4px;background:#7c3aed;width:35%;border-radius:2px"></div>
                    <div style="height:3px;background:var(--gray-200);width:100%;border-radius:2px;border-left:2px solid #e9d5ff"></div>
                    <div style="height:7px"></div>
                    <div style="display:flex;gap:0.2rem"><div style="height:12px;background:#f3e8ff;border-radius:6px;width:30px"></div><div style="height:12px;background:#f3e8ff;border-radius:6px;width:25px"></div></div>
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
                  <input type="text" id="cv-vorname" class="form-input" value="${state.user.name.split(' ')[0]}">
                </div>
                <div class="form-group">
                  <label class="form-label">Nachname</label>
                  <input type="text" id="cv-nachname" class="form-input" value="${state.user.name.split(' ').slice(1).join(' ')}">
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">E-Mail</label>
                  <input type="email" id="cv-email" class="form-input" value="${state.user.email}">
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
    <div class="employer-hero">
      <div style="max-width:800px;margin:0 auto">
        <h1>Finde junge Talente für dein Team</h1>
        <p>Schalte deine Stellenanzeige und erreiche tausende motivierte Jugendliche in deiner Region.</p>
        <button class="btn btn-lg" style="background:#fff;color:#0284c7;font-size:1.1rem;padding:1rem 3rem" onclick="goPostJob()">Jetzt Stellenanzeige schalten</button>
      </div>
    </div>

    <div class="features-section">
      <div class="section-header">
        <h2>Warum EasyJobs für Arbeitgeber?</h2>
      </div>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg></div>
          <h3>Zielgruppe Jugendliche</h3>
          <p>Erreiche gezielt junge, motivierte Arbeitnehmer in deiner Umgebung.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg></div>
          <h3>Analytics Dashboard</h3>
          <p>Verfolge Klicks, Views und Bewerbungen in Echtzeit.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div>
          <h3>Direkter Kontakt</h3>
          <p>Chatte direkt mit Bewerbern und führe Gespräche über die Plattform.</p>
        </div>
      </div>
    </div>

    <div class="cta-section" style="margin-top:3rem">
      <h2>Bereit loszulegen?</h2>
      <p>Schalte jetzt deine erste Stellenanzeige und finde die besten jungen Talente.</p>
      <button class="btn btn-lg" onclick="goPostJob()">Stellenanzeige schalten</button>
    </div>`;
}

function renderEmployerDashboard() {
  if (!state.user || state.user.role !== 'employer') return renderLogin();
  const myJobs = (state.user.postedJobs || []);
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
              <h2 class="dashboard-title" style="margin-bottom:0.15rem">Willkommen, ${state.user.name.split(' ')[0]}!</h2>
              <p style="font-size:0.85rem;color:var(--gray-500);margin:0">${state.user.company ? state.user.company + ' – ' : ''}Verwalte deine Stellenanzeigen und Bewerbungen</p>
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
                    <div class="job-company-logo">${j.companyLogo || '&#9962;'}</div>
                    <div>
                      <h3 style="font-size:0.95rem;margin-bottom:0.25rem">${j.title}</h3>
                      <div style="display:flex;gap:1rem;font-size:0.8rem;color:var(--gray-500)">
                        <span>${j.views || 0} Views</span>
                        <span>${j.applications || 0} Bew.</span>
                      </div>
                    </div>
                  </div>
                  <span class="badge badge-success">Aktiv</span>
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
        <a href="#" class="${active==='post'?'active':''}" onclick="navigate('post-job')">Anzeige schalten</a>
        <a href="#" class="${active==='applicants'?'active':''}" onclick="navigate('applicants')">Bewerber</a>
        <a href="#" class="${active==='profile'?'active':''}" onclick="navigate('employer-profile')">Unternehmensprofil</a>
        <div class="divider"></div>
        <a href="#" class="${active==='messages'?'active':''}" onclick="navigate('messages')">Nachrichten</a>
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
  state.wizardStep = Math.min(3, state.wizardStep + 1);
  render();
}

function renderPostJob() {
  if (!state.user || state.user.role !== 'employer') return renderLogin();
  const step = state.wizardStep;
  const steps = ['Grundinfos', 'Details', 'Bilder', 'Vorschau'];

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
        ${step === 3 ? renderWizardStep5() : ''}
      </div>

      <div class="wizard-footer">
        ${step === 0
          ? `<button class="btn btn-outline" onclick="navigate('employer-dashboard')">&#8592; Dashboard</button>`
          : `<button class="btn btn-outline" onclick="state.wizardStep=Math.max(0,state.wizardStep-1);render()">&#8592; Zurück</button>`}
        ${step < 3 ? `
          <button class="btn btn-primary" onclick="validateWizardStep()">Weiter &#8594;</button>
        ` : `
          <button class="btn btn-success btn-lg" onclick="publishJob()">&#10003; Veröffentlichen</button>
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
      <label class="form-label">Arbeitsort / Adresse *</label>
      <input type="text" class="form-input" placeholder="Straße, PLZ, Stadt" value="Musterstraße 1, 10115 Berlin">
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
        ${imgs.map((img, i) => `
          <div onclick="toggleJobImage(${i})" style="position:relative;aspect-ratio:1;border-radius:var(--radius-sm);overflow:hidden;cursor:pointer;background-image:url(${img});background-size:cover;background-position:center;border:3px solid ${state.selectedJobImages.includes(i) ? 'var(--primary)' : 'transparent'}">
            ${state.selectedJobImages.includes(i) ? '<div style="position:absolute;top:6px;right:6px;width:26px;height:26px;border-radius:50%;background:var(--primary);color:#fff;display:flex;align-items:center;justify-content:center;font-size:0.85rem">&#10003;</div>' : ''}
          </div>
        `).join('')}
      </div>
      <p style="font-size:0.85rem;color:var(--gray-400)">${state.selectedJobImages.length} Bild${state.selectedJobImages.length !== 1 ? 'er' : ''} ausgewählt</p>
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
    <h3 style="margin-bottom:1.5rem">Laufzeit & Bezahlung</h3>
    <div class="form-group">
      <label class="form-label">Laufzeit der Anzeige</label>
      <div class="radio-group" style="flex-direction:column">
        <label class="radio-label"><input type="radio" name="duration" value="30" checked> <span>30 Tage &mdash; 29€</span></label>
        <label class="radio-label"><input type="radio" name="duration" value="60"> <span>60 Tage &mdash; 49€ <span class="badge badge-success" style="margin-left:0.5rem">Beliebt</span></span></label>
        <label class="radio-label"><input type="radio" name="duration" value="90"> <span>90 Tage &mdash; 69€</span></label>
      </div>
    </div>

    <div class="form-group">
      <label class="form-label">Anzeige boosten?</label>
      <p style="font-size:0.85rem;color:var(--gray-500);margin-bottom:0.75rem">
        Hebe deine Anzeige hervor und erscheine ganz oben in den Suchergebnissen. Du kannst deinen Boost auch jederzeit nach der Veröffentlichung aktivieren.
      </p>
      <div style="display:flex;flex-direction:column;gap:0.75rem">
        <div class="card" style="border-color:var(--gray-200);cursor:pointer" onclick="selectBoost(this,'none')">
          <div class="card-body" style="display:flex;align-items:center;gap:1rem;padding:1rem">
            <input type="radio" name="boost" value="none" checked>
            <div style="flex:1">
              <strong>Kein Boost</strong>
              <div style="font-size:0.85rem;color:var(--gray-500)">Standard-Platzierung in den Suchergebnissen.</div>
            </div>
            <div style="font-weight:700;color:var(--gray-500)">+0€</div>
          </div>
        </div>
        <div class="card" style="border-color:var(--secondary);background:rgba(249,115,22,0.03);cursor:pointer" onclick="selectBoost(this,'standard')">
          <div class="card-body" style="display:flex;align-items:center;gap:1rem;padding:1rem">
            <input type="radio" name="boost" value="standard">
            <div style="flex:1">
              <strong>↑ Standard Boost</strong>
              <div style="font-size:0.85rem;color:var(--gray-500)">Hervorgehoben auf der Suchergebnisseite. 2&times; mehr Sichtbarkeit.</div>
            </div>
            <div style="font-weight:800;font-size:1.1rem;color:var(--secondary)">+15€</div>
          </div>
        </div>
        <div class="card" style="border-color:var(--primary);background:rgba(22,163,74,0.03);cursor:pointer" onclick="selectBoost(this,'premium')">
          <div class="card-body" style="display:flex;align-items:center;gap:1rem;padding:1rem">
            <input type="radio" name="boost" value="premium">
            <div style="flex:1">
              <strong>&#9733; Premium Boost</strong>
              <div style="font-size:0.85rem;color:var(--gray-500)">Ganz oben + farblich hervorgehoben + E-Mail-Newsletter an passende Bewerber. 5&times; mehr Sichtbarkeit.</div>
            </div>
            <div style="font-weight:800;font-size:1.1rem;color:var(--primary)">+35€</div>
          </div>
        </div>
      </div>
    </div>

    <div id="price-summary" style="background:var(--gray-50);border-radius:var(--radius-sm);padding:1.25rem;margin-top:1rem">
      <div style="display:flex;justify-content:space-between;margin-bottom:0.5rem">
        <span>Anzeige (30 Tage)</span><span>29,00€</span>
      </div>
      <div style="display:flex;justify-content:space-between;margin-bottom:0.5rem" id="boost-line" class="hidden">
        <span id="boost-label">Standard Boost</span><span id="boost-price">15,00€</span>
      </div>
      <div style="display:flex;justify-content:space-between;margin-bottom:0.75rem;padding-bottom:0.75rem;border-bottom:1px solid var(--gray-200)" id="tax-line">
        <span>MwSt. (19%)</span><span id="tax-amount">5,51€</span>
      </div>
      <div style="display:flex;justify-content:space-between;font-weight:700;font-size:1.1rem">
        <span>Gesamt</span><span id="total-price">34,51€</span>
      </div>
    </div>`;
}

function renderWizardStep5() {
  return `
    <h3 style="margin-bottom:1.5rem">Vorschau deiner Anzeige</h3>
    <div class="job-card" style="cursor:default">
      <div>
        <div class="job-card-header">
          <div class="job-company-logo"></div>
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
  if (!state.user) return renderLogin();
  return `
    <div class="page">
      <div class="dashboard-layout">
        ${renderEmployerSidebar('profile')}
        <div class="dashboard-content">
          <h2 class="dashboard-title">Unternehmensprofil</h2>

          <div class="profile-header-card" style="background:linear-gradient(135deg,#0369a1,#0ea5e9)">
            <div class="profile-avatar" style="font-size:1.5rem;cursor:pointer;${state.user.companyLogo && state.user.companyLogo.startsWith('data:') ? `background-image:url(${state.user.companyLogo});background-size:cover;background-position:center;` : ''}" onclick="document.getElementById('company-logo-input').click()" id="company-logo-preview">
              ${state.user.companyLogo && state.user.companyLogo.startsWith('data:') ? '' : (state.user.company?.[0] || state.user.name?.[0] || '?')}
            </div>
            <input type="file" id="company-logo-input" accept="image/*" style="display:none" onchange="handleCompanyLogo(this)">
            <div class="profile-info">
              <h2>${state.user.company || state.user.name + '\'s Unternehmen'}</h2>
              <p>Klicke auf das Logo um es zu ändern</p>
            </div>
          </div>

          <div class="profile-sections">
            <div class="profile-section">
              <h3>Allgemeine Informationen</h3>
              <div class="form-group">
                <label class="form-label">Unternehmensname</label>
                <input type="text" class="form-input" placeholder="Name des Unternehmens" value="${state.user.company || ''}">
              </div>
              <div class="form-group">
                <label class="form-label">Branche</label>
                <select class="form-select">
                  <option>Branche wählen...</option>
                  ${CATEGORIES.map(c => `<option>${c.name}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Beschreibung</label>
                <textarea class="form-textarea" placeholder="Beschreibe dein Unternehmen..."></textarea>
              </div>
            </div>

            <div class="profile-section">
              <h3>Kontakt & Standort</h3>
              <div class="form-group">
                <label class="form-label">Adresse</label>
                <input type="text" class="form-input" placeholder="Straße, PLZ, Stadt">
              </div>
              <div class="form-group">
                <label class="form-label">Telefon</label>
                <input type="tel" class="form-input" placeholder="+49 ...">
              </div>
              <div class="form-group">
                <label class="form-label">Website</label>
                <input type="url" class="form-input" placeholder="https://...">
              </div>
            </div>

            <div class="profile-section">
              <h3>Unternehmensbilder</h3>
              <p style="font-size:0.85rem;color:var(--gray-500);margin-bottom:1rem">Lade Bilder hoch, die du bei Stellenanzeigen verwenden kannst (z.B. Büro, Team, Arbeitsplatz).</p>
              <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:0.75rem;margin-bottom:1rem" id="company-images-grid">
                ${(state.user.companyImages || []).map((img, i) => `
                  <div style="position:relative;aspect-ratio:1;border-radius:var(--radius-sm);overflow:hidden;background-image:url(${img});background-size:cover;background-position:center">
                    <button onclick="removeCompanyImage(${i})" style="position:absolute;top:4px;right:4px;width:24px;height:24px;border-radius:50%;background:rgba(0,0,0,0.6);color:#fff;border:none;cursor:pointer;font-size:0.8rem;display:flex;align-items:center;justify-content:center">&#10005;</button>
                  </div>
                `).join('')}
                ${(state.user.companyImages || []).length < 6 ? `
                <div style="aspect-ratio:1;border:2px dashed var(--gray-300);border-radius:var(--radius-sm);display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;color:var(--gray-400);font-size:0.85rem" onclick="document.getElementById('company-images-input').click()">
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
                  <input type="number" class="form-input" placeholder="z.B. 2020">
                </div>
                <div class="form-group">
                  <label class="form-label">Mitarbeiterzahl</label>
                  <input type="text" class="form-input" placeholder="z.B. 10-50">
                </div>
              </div>
            </div>
          </div>

          <div style="margin-top:1.5rem;text-align:right">
            <button class="btn btn-primary btn-lg" onclick="saveWorkerProfile(this)">✓ Profil speichern</button>
          </div>
        </div>
      </div>
    </div>`;
}


const MOCK_APPLICANTS = [
  { id: 1, name: 'Lisa Müller', initials: 'LM', age: 19, city: 'Berlin', job: 'Aushilfe im Einzelhandel', status: 'new', statusText: 'Neu', date: '2026-03-23', skills: ['Kundenservice', 'Teamarbeit'], weeklyHours: 15, refs: ['Supermarkt Frisch (2025)', 'Bäckerei Müller (2024)'], cvUploaded: true, docsUploaded: true, about: 'Ich bin eine zuverlässige und freundliche Schülerin, die nach einem Minijob im Einzelhandel sucht.' },
  { id: 2, name: 'Tom Fischer', initials: 'TF', age: 17, city: 'Berlin', job: 'Aushilfe im Einzelhandel', status: 'reviewing', statusText: 'In Prüfung', date: '2026-03-22', skills: ['Zuverlässigkeit', 'Kasse'], weeklyHours: 10, refs: ['Aldi Nord (2025)'], cvUploaded: true, docsUploaded: false, about: 'Schüler im letzten Schuljahr, sehr motiviert und lernbereit.' },
  { id: 3, name: 'Anna Becker', initials: 'AB', age: 20, city: 'Hamburg', job: 'Kellner/in im Café', status: 'accepted', statusText: 'Eingeladen', date: '2026-03-21', skills: ['Gastronomie', 'Freundlich'], weeklyHours: 20, refs: ['Café Central (2025)', 'Restaurant Adler (2024)', 'Eisdiele Süß (2023)'], cvUploaded: true, docsUploaded: true, about: 'Erfahrene Servicekraft mit Leidenschaft für gute Küche und freundlichen Umgang mit Gästen.' },
  { id: 4, name: 'Max Weber', initials: 'MW', age: 18, city: 'München', job: 'Kellner/in im Café', status: 'new', statusText: 'Neu', date: '2026-03-23', skills: ['Service', 'Belastbar'], weeklyHours: 12, refs: [], cvUploaded: false, docsUploaded: true, about: 'Student im ersten Semester, suche Nebenjob an Wochenenden.' },
  { id: 5, name: 'Sarah Koch', initials: 'SK', age: 21, city: 'Köln', job: 'Lagerhelfer/in', status: 'rejected', statusText: 'Abgelehnt', date: '2026-03-20', skills: ['Logistik'], weeklyHours: 20, refs: ['DHL Paketcenter (2025)'], cvUploaded: true, docsUploaded: true, about: 'Erfahren im Lager- und Logistikbereich, körperlich fit und strukturiert.' }
];

function renderApplicants() {
  if (!state.user) return renderLogin();
  const applicants = MOCK_APPLICANTS;

  return `
    <div class="page">
      <div class="dashboard-layout">
        ${renderEmployerSidebar('applicants')}
        <div class="dashboard-content">
          <h2 class="dashboard-title">Bewerber verwalten</h2>

          <div class="tabs">
            <button class="tab active">Alle (${applicants.length})</button>
            <button class="tab">Neu (${applicants.filter(a=>a.status==='new').length})</button>
            <button class="tab">In Prüfung (${applicants.filter(a=>a.status==='reviewing').length})</button>
            <button class="tab">Eingeladen (${applicants.filter(a=>a.status==='accepted').length})</button>
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
                ${applicants.map(a => `
                  <tr>
                    <td>
                      <div class="applicant-row">
                        <div class="user-avatar" style="width:32px;height:32px;font-size:0.7rem">${a.initials}</div>
                        <strong>${a.name}</strong>
                      </div>
                    </td>
                    <td>${a.job}</td>
                    <td>${a.skills.map(s => `<span class="tag">${s}</span>`).join(' ')}</td>
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
                      <div style="display:flex;gap:0.375rem">
                        <button class="btn btn-sm btn-outline" onclick="navigate('applicant-profile', {applicantId: ${a.id}})">Profil</button>
                        <button class="btn btn-sm btn-primary" onclick="openApplicantChat(${a.id})">Nachricht</button>
                      </div>
                    </td>
                  </tr>
                `).join('')}
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
  const a = MOCK_APPLICANTS.find(x => x.id === id) || MOCK_APPLICANTS[0];
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

          <div class="pv-banner" style="background:linear-gradient(135deg,var(--primary-light) 0%,var(--primary) 100%);height:110px;border-radius:12px 12px 0 0;position:relative">
            <div style="position:absolute;bottom:-30px;left:1.5rem;width:64px;height:64px;font-size:1.3rem;border:3px solid #fff;background:var(--primary);color:#fff;display:flex;align-items:center;justify-content:center;border-radius:50%;font-weight:700">
              ${a.initials}
            </div>
          </div>

          <div class="card" style="border-radius:0 0 12px 12px;padding-top:2.5rem;margin-bottom:1rem">
            <div class="card-body">
              <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:0.75rem">
                <div>
                  <h2 style="font-size:1.3rem;margin-bottom:0.25rem">${a.name}</h2>
                  <div style="font-size:0.85rem;color:var(--gray-500)">
                    ${a.age} Jahre &bull; ${a.city} &bull; max. ${a.weeklyHours} Std./Woche
                  </div>
                  <div style="margin-top:0.5rem;display:flex;align-items:center;gap:0.75rem;flex-wrap:wrap">
                    <select class="form-select" style="font-size:0.8rem;padding:0.3rem 0.5rem;width:auto" onchange="updateApplicantStatus(${a.id}, this.value)">
                      <option value="new" ${a.status==='new'?'selected':''}>Neu</option>
                      <option value="reviewing" ${a.status==='reviewing'?'selected':''}>In Prüfung</option>
                      <option value="accepted" ${a.status==='accepted'?'selected':''}>Eingeladen</option>
                      <option value="rejected" ${a.status==='rejected'?'selected':''}>Abgelehnt</option>
                    </select>
                    <span style="font-size:0.8rem;color:var(--gray-400)">Beworben auf: <strong>${a.job}</strong></span>
                  </div>
                </div>
                <button class="btn btn-primary" onclick="openApplicantChat(${a.id})">
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:0.4rem;vertical-align:-2px"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                  Nachricht senden
                </button>
              </div>
              ${a.about ? `
                <div style="margin-top:1rem;padding-top:1rem;border-top:1px solid var(--gray-100);font-size:0.88rem;color:var(--gray-600);line-height:1.5">
                  ${a.about}
                </div>` : ''}
            </div>
          </div>

          <div class="grid-2">
            <div class="card">
              <div class="card-body">
                <h4 style="font-size:0.9rem;color:var(--gray-400);text-transform:uppercase;letter-spacing:.05em;margin-bottom:0.75rem">Stärken</h4>
                ${a.skills.length > 0
                  ? `<div style="display:flex;flex-wrap:wrap;gap:0.375rem">${a.skills.map(s => `<span class="epc-skill-tag">${s}</span>`).join('')}</div>`
                  : `<span class="pv-missing-chip">Noch nicht angegeben</span>`}
              </div>
            </div>

            <div class="card">
              <div class="card-body">
                <h4 style="font-size:0.9rem;color:var(--gray-400);text-transform:uppercase;letter-spacing:.05em;margin-bottom:0.75rem">Berufserfahrung</h4>
                ${a.refs && a.refs.length > 0
                  ? `<ul style="margin:0;padding-left:1.1rem;font-size:0.88rem;line-height:1.8">${a.refs.map(r => `<li>${r}</li>`).join('')}</ul>`
                  : `<span class="pv-missing-chip">Noch nicht angegeben</span>`}
              </div>
            </div>

            <div class="card">
              <div class="card-body">
                <h4 style="font-size:0.9rem;color:var(--gray-400);text-transform:uppercase;letter-spacing:.05em;margin-bottom:0.75rem">Dokumente</h4>
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
                <h4 style="font-size:0.9rem;color:var(--gray-400);text-transform:uppercase;letter-spacing:.05em;margin-bottom:0.75rem">Verfügbarkeit</h4>
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
              ${a.name.split(' ')[0]} anschreiben
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
              <strong style="font-size:0.95rem">${chat.partnerName}</strong>
              <div style="font-size:0.78rem;color:var(--gray-500)">${chat.jobTitle}</div>
            </div>
          </div>

          <!-- Nachrichten -->
          <div id="chat-messages-page" style="flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:0.625rem;padding-bottom:1rem;max-width:620px">
            ${chat.messages.length === 0 ? `
              <div style="text-align:center;color:var(--gray-400);font-size:0.85rem;padding:2rem">
                Noch keine Nachrichten. Schreib ${chat.partnerName.split(' ')[0]} eine erste Nachricht!
              </div>` : ''}
            ${chat.messages.map(m => `
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
            <input type="text" id="chat-input" class="form-input" placeholder="Nachricht schreiben..." style="flex:1" onkeydown="if(event.key==='Enter')sendChatMessage()">
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
  const chatList = getChatList();
  const unreadCount = chatList.filter(c => c.unread).length;
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
                    <strong style="font-size:0.85rem">${c.partnerName}</strong>
                    <span style="font-size:0.72rem;color:var(--gray-400);flex-shrink:0;margin-left:0.5rem">${c.time}</span>
                  </div>
                  <div style="font-size:0.75rem;color:var(--primary)">${c.jobTitle}</div>
                  <div style="font-size:0.78rem;color:var(--gray-500);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${c.lastMessage}</div>
                </div>
                ${c.unread ? '<div style="width:8px;height:8px;background:var(--primary);border-radius:50%;flex-shrink:0"></div>' : ''}
              </div>
            `).join('')}
            ${chatList.length === 0 ? `
              <div style="padding:1.5rem;text-align:center;color:var(--gray-400);font-size:0.85rem">
                ${isEmployer ? 'Noch keine Bewerbernachrichten.' : 'Noch keine Nachrichten von Arbeitgebern.'}
              </div>` : ''}
          </div>
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
            ! Bewertungen können nur abgegeben werden, solange ein aktives Arbeitsverhältnis besteht. Dies stellt sicher, dass nur faire und aktuelle Bewertungen abgegeben werden.
          </div>

          <div class="tabs">
            <button class="tab active">Erhaltene Bewertungen</button>
            <button class="tab">Abgegebene Bewertungen</button>
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

          ${JOBS[0].reviews.concat(JOBS[1].reviews).concat(JOBS[4].reviews).map(r => `
            <div class="review-card">
              <div class="review-header">
                <div class="review-author">
                  <div class="user-avatar" style="width:36px;height:36px;font-size:0.75rem">${r.author.split(' ').map(n=>n[0]).join('')}</div>
                  <div>
                    <strong style="font-size:0.9rem">${r.author}</strong>
                    ${r.active ? '<span class="badge badge-success" style="margin-left:0.5rem">Aktiv</span>' : ''}
                  </div>
                </div>
                <div class="stars">${'<span class="star filled">&#9733;</span>'.repeat(r.rating)}${'<span class="star">&#9734;</span>'.repeat(5-r.rating)}</div>
              </div>
              <div class="review-text">${r.text}</div>
              <div class="review-date">${formatDate(r.date)}</div>
            </div>
          `).join('')}

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
          </div>
        </div>
      </div>
    </div>`;
}

function selectBoost(card, type) {
  // Alle Karten zurücksetzen
  document.querySelectorAll('[onclick^="selectBoost"]').forEach(c => {
    c.style.borderColor = 'var(--gray-200)';
    c.style.background = '';
  });
  card.querySelector('input[type=radio]').checked = true;

  const boostLine = document.getElementById('boost-line');
  const boostLabel = document.getElementById('boost-label');
  const boostPrice = document.getElementById('boost-price');
  const taxAmount = document.getElementById('tax-amount');
  const totalPrice = document.getElementById('total-price');

  const base = 29;
  let boostCost = 0;
  if (type === 'standard') {
    boostCost = 15;
    boostLine?.classList.remove('hidden');
    if (boostLabel) boostLabel.textContent = 'Standard Boost';
    if (boostPrice) boostPrice.textContent = '15,00€';
    card.style.borderColor = 'var(--secondary)';
    card.style.background = 'rgba(249,115,22,0.03)';
  } else if (type === 'premium') {
    boostCost = 35;
    boostLine?.classList.remove('hidden');
    if (boostLabel) boostLabel.textContent = 'Premium Boost';
    if (boostPrice) boostPrice.textContent = '35,00€';
    card.style.borderColor = 'var(--primary)';
    card.style.background = 'rgba(22,163,74,0.03)';
  } else {
    boostLine?.classList.add('hidden');
    card.style.borderColor = 'var(--gray-200)';
  }

  const net = base + boostCost;
  const tax = (net * 0.19).toFixed(2).replace('.', ',');
  const total = (net * 1.19).toFixed(2).replace('.', ',');
  if (taxAmount) taxAmount.textContent = tax + '€';
  if (totalPrice) totalPrice.textContent = total + '€';
}

function showBoostModal(jobTitle) {
  document.getElementById('boost-modal-title').textContent = 'Anzeige boosten: ' + jobTitle;
  document.getElementById('boost-modal').classList.add('open');
}

function closeBoostModal() {
  document.getElementById('boost-modal').classList.remove('open');
  // Reset
  document.querySelectorAll('#boost-modal .card').forEach(c => {
    c.style.borderColor = 'var(--gray-200)'; c.style.background = '';
  });
  document.getElementById('boost-opt-standard').style.borderColor = 'var(--secondary)';
  document.getElementById('boost-modal-summary')?.classList.add('hidden');
  const btn = document.getElementById('boost-modal-pay-btn');
  if (btn) btn.disabled = true;
}

function selectBoostModal(card, type, price) {
  document.querySelectorAll('#boost-modal .card').forEach(c => {
    c.style.borderColor = 'var(--gray-200)'; c.style.background = '';
  });
  card.querySelector('input[type=radio]').checked = true;
  card.style.borderColor = type === 'premium' ? 'var(--primary)' : 'var(--secondary)';
  card.style.background = type === 'premium' ? 'rgba(22,163,74,0.04)' : 'rgba(249,115,22,0.04)';

  const summary = document.getElementById('boost-modal-summary');
  summary?.classList.remove('hidden');
  const labels = { standard: 'Standard Boost (7 Tage)', standard30: 'Standard Boost (30 Tage)', premium: 'Premium Boost (14 Tage)' };
  const tax = (price * 0.19).toFixed(2).replace('.', ',');
  const total = (price * 1.19).toFixed(2).replace('.', ',');
  if (document.getElementById('bms-label')) document.getElementById('bms-label').textContent = labels[type];
  if (document.getElementById('bms-net')) document.getElementById('bms-net').textContent = price.toFixed(2).replace('.', ',') + '€';
  if (document.getElementById('bms-tax')) document.getElementById('bms-tax').textContent = tax + '€';
  if (document.getElementById('bms-total')) document.getElementById('bms-total').textContent = total + '€';

  const btn = document.getElementById('boost-modal-pay-btn');
  if (btn) btn.disabled = false;
}

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

// ===== BOOST PURCHASE TRACKING =====
function handleBoostPurchase() {
  const selected = document.querySelector('#boost-modal input[type=radio]:checked');
  if (!selected) return;
  const labels = { standard: 'Standard Boost (7 Tage)', standard30: 'Standard Boost (30 Tage)', premium: 'Premium Boost (14 Tage)' };
  const prices = { standard: 15, standard30: 29, premium: 35 };
  const type = selected.value;
  trackPurchase(labels[type] || type, prices[type] || 0);
  alert('Boost aktiviert! Deine Anzeige wird jetzt hervorgehoben.');
}

// ===== ADMIN LOGIN =====
function adminToggleApproval(userId, approved) {
  const userData = JSON.parse(localStorage.getItem('jj_user_' + userId) || '{}');
  userData.approved = approved;
  localStorage.setItem('jj_user_' + userId, JSON.stringify(userData));
  if (state.user && state.user.id === userId) {
    state.user.approved = approved;
    localStorage.setItem('jj_user', JSON.stringify(state.user));
  }
  showToast(approved ? 'Arbeitgeber freigeschaltet!' : 'Arbeitgeber gesperrt.', approved ? 'success' : 'error');
  render();
}

function adminLogin() {
  const email = document.getElementById('admin-email')?.value?.trim().toLowerCase();
  const password = document.getElementById('admin-password')?.value;
  const err = document.getElementById('admin-login-error');

  if (!ADMIN_EMAILS.includes(email)) {
    if (err) { err.textContent = 'Zugriff verweigert. Diese E-Mail hat keine Admin-Berechtigung.'; err.style.display = 'block'; }
    return;
  }
  if (password !== ADMIN_PASSWORD) {
    if (err) { err.textContent = 'Falsches Passwort.'; err.style.display = 'block'; }
    return;
  }

  state.adminLoggedIn = true;
  navigate('admin-panel');
}

function adminLogout() {
  state.adminLoggedIn = false;
  navigate('landing');
}

function renderAdminLogin() {
  return `
    <div class="page-narrow" style="padding-top:4rem">
      <div class="card" style="max-width:440px;margin:0 auto">
        <div class="card-body" style="padding:2.5rem">
          <div style="text-align:center;margin-bottom:2rem">
            <div style="width:64px;height:64px;border-radius:16px;background:linear-gradient(135deg,var(--primary),#6366f1);display:inline-flex;align-items:center;justify-content:center;margin-bottom:1rem">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <h2 style="font-size:1.5rem;margin-bottom:0.25rem">Admin-Kontrollpanel</h2>
            <p style="color:var(--gray-500);font-size:0.9rem">Nur autorisierte Administratoren</p>
          </div>
          <div id="admin-login-error" class="form-error" style="display:none;background:#fef2f2;color:#dc2626;padding:0.75rem 1rem;border-radius:8px;margin-bottom:1rem;font-size:0.85rem"></div>
          <div class="form-group">
            <label class="form-label">Admin E-Mail</label>
            <input type="email" id="admin-email" class="form-input" placeholder="admin@email.de" onkeydown="if(event.key==='Enter')adminLogin()">
          </div>
          <div class="form-group">
            <label class="form-label">Zugangs-Code</label>
            <input type="password" id="admin-password" class="form-input" placeholder="Zugangs-Code eingeben" onkeydown="if(event.key==='Enter')adminLogin()">
          </div>
          <button class="btn btn-primary" style="width:100%;margin-top:0.5rem" onclick="adminLogin()">Anmelden</button>
          <p style="text-align:center;margin-top:1.5rem;font-size:0.8rem;color:var(--gray-400)">
            <a href="#" onclick="navigate('landing')" style="color:var(--gray-400)">Zurück zur Startseite</a>
          </p>
        </div>
      </div>
    </div>`;
}

function buildDonutSVG(segments, size, strokeWidth, centerLabel, centerSub) {
  // segments: [{value, color, label}]
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
  // If no data, show gray ring
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

  // --- Donut: Online Besucher ---
  const onlineDonut = buildDonutSVG([
    { value: data.online.employer, color: '#f97316', label: 'Arbeitgeber' },
    { value: data.online.worker, color: '#0ea5e9', label: 'Arbeitnehmer' },
    { value: data.online.guest, color: '#8b5cf6', label: 'Gast' }
  ], 140, 18, data.online.total, 'Online');

  // --- Donut: Registrierte Benutzer ---
  const usersDonut = buildDonutSVG([
    { value: data.users.employers, color: '#f97316', label: 'Arbeitgeber' },
    { value: data.users.workers, color: '#0ea5e9', label: 'Arbeitnehmer' }
  ], 140, 18, data.users.total, 'Registriert');

  // --- Balkendiagramm letzte 7 Tage (schoen animiert) ---
  const maxVisits = Math.max(...data.visits.last7Days.map(d => d.count), 1);
  const barColors = ['#6366f1','#818cf8','#a78bfa','#8b5cf6','#7c3aed','#6d28d9','#5b21b6'];
  const chartBars = data.visits.last7Days.map((d, i) => {
    const pct = Math.max((d.count / maxVisits) * 100, 3);
    return `
    <div class="admin-bar-col">
      <div class="admin-bar-value">${d.count}</div>
      <div class="admin-bar-track">
        <div class="admin-bar-fill" style="height:${pct}%;background:${barColors[i]};animation-delay:${i * 0.08}s"></div>
      </div>
      <div class="admin-bar-label">${d.date.split(',')[0]}</div>
    </div>`;
  }).join('');

  // --- Umsatz pro Produkt als horizontale Balken ---
  const productEntries = Object.entries(data.revenue.byProduct);
  const maxProductRevenue = productEntries.length > 0 ? Math.max(...productEntries.map(([,i]) => i.total), 1) : 1;
  const productColors = { 'Standard Boost (7 Tage)': '#f97316', 'Standard Boost (30 Tage)': '#0ea5e9', 'Premium Boost (14 Tage)': '#8b5cf6' };
  const revenueChart = productEntries.length > 0
    ? productEntries.map(([product, info]) => {
      const pct = (info.total / maxProductRevenue) * 100;
      const color = productColors[product] || '#6366f1';
      return `
      <div class="admin-hbar-row">
        <div class="admin-hbar-info">
          <span class="admin-hbar-dot" style="background:${color}"></span>
          <span class="admin-hbar-name">${product}</span>
          <span class="admin-hbar-count">${info.count}x</span>
        </div>
        <div class="admin-hbar-track">
          <div class="admin-hbar-fill" style="width:${pct}%;background:${color}"></div>
        </div>
        <div class="admin-hbar-amount">${formatEuro(info.total)}</div>
      </div>`;
    }).join('')
    : '<div style="text-align:center;padding:2rem;color:var(--gray-400)">Noch keine Verkäufe</div>';

  // --- Donut: Umsatz-Verteilung ---
  const revenueDonut = buildDonutSVG(
    productEntries.map(([product, info]) => ({
      value: info.total,
      color: productColors[product] || '#6366f1',
      label: product
    })),
    140, 18, formatEuroShort(data.revenue.total), 'Umsatz'
  );

  return `
    <div class="page-wide admin-panel" style="padding-top:2rem">
      <!-- Header -->
      <div class="admin-header">
        <div style="display:flex;align-items:center;gap:1rem">
          <div class="admin-header-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <div>
            <h1 style="font-size:1.5rem;margin:0">Admin-Kontrollpanel</h1>
            <p style="color:var(--gray-500);font-size:0.85rem;margin:0">EasyJobs &mdash; Live-Dashboard</p>
          </div>
        </div>
        <div style="display:flex;gap:0.5rem;align-items:center">
          <span class="admin-live-dot"></span>
          <span style="font-size:0.8rem;color:var(--success);font-weight:600">Live</span>
          <button class="btn btn-outline" onclick="navigate('admin-panel')" style="font-size:0.85rem;margin-left:0.75rem">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="vertical-align:-2px"><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>
            Aktualisieren
          </button>
          <button class="btn btn-ghost" onclick="adminLogout()" style="color:var(--danger);font-size:0.85rem">Abmelden</button>
        </div>
      </div>

      <!-- KPI Top-Leiste -->
      <div class="admin-kpi-strip">
        <div class="admin-kpi">
          <div class="admin-kpi-icon" style="background:rgba(14,165,233,0.1);color:#0ea5e9">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
          </div>
          <div>
            <div class="admin-kpi-value">${data.online.total}</div>
            <div class="admin-kpi-label">Gerade Online</div>
          </div>
        </div>
        <div class="admin-kpi">
          <div class="admin-kpi-icon" style="background:rgba(99,102,241,0.1);color:#6366f1">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><path d="M20 8v6M23 11h-6"/></svg>
          </div>
          <div>
            <div class="admin-kpi-value">${data.users.total}</div>
            <div class="admin-kpi-label">Registriert</div>
          </div>
        </div>
        <div class="admin-kpi">
          <div class="admin-kpi-icon" style="background:rgba(34,197,94,0.1);color:#22c55e">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
          </div>
          <div>
            <div class="admin-kpi-value">${formatEuro(data.revenue.total)}</div>
            <div class="admin-kpi-label">Gesamt-Umsatz</div>
          </div>
        </div>
        <div class="admin-kpi">
          <div class="admin-kpi-icon" style="background:rgba(249,115,22,0.1);color:#f97316">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
          </div>
          <div>
            <div class="admin-kpi-value">${data.purchases.total}</div>
            <div class="admin-kpi-label">Bestellungen</div>
          </div>
        </div>
      </div>

      <!-- Row: Online Besucher Donut + Registrierte Donut -->
      <div class="admin-row-2">
        <div class="card admin-chart-card">
          <div class="card-body">
            <h4 class="admin-chart-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
              Aktuelle Besucher
            </h4>
            <div class="admin-donut-row">
              <div class="admin-donut-wrap">${onlineDonut}</div>
              <div class="admin-donut-legend">
                <div class="admin-legend-item"><span class="admin-legend-dot" style="background:#f97316"></span>Arbeitgeber<strong>${data.online.employer}</strong></div>
                <div class="admin-legend-item"><span class="admin-legend-dot" style="background:#0ea5e9"></span>Arbeitnehmer<strong>${data.online.worker}</strong></div>
                <div class="admin-legend-item"><span class="admin-legend-dot" style="background:#8b5cf6"></span>Ohne Konto<strong>${data.online.guest}</strong></div>
              </div>
            </div>
          </div>
        </div>
        <div class="card admin-chart-card">
          <div class="card-body">
            <h4 class="admin-chart-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
              Registrierte Benutzer
            </h4>
            <div class="admin-donut-row">
              <div class="admin-donut-wrap">${usersDonut}</div>
              <div class="admin-donut-legend">
                <div class="admin-legend-item"><span class="admin-legend-dot" style="background:#f97316"></span>Arbeitgeber<strong>${data.users.employers}</strong></div>
                <div class="admin-legend-item"><span class="admin-legend-dot" style="background:#0ea5e9"></span>Arbeitnehmer<strong>${data.users.workers}</strong></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Besucher-Verlauf 7 Tage -->
      <div class="card admin-chart-card" style="margin-bottom:1.5rem">
        <div class="card-body">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.25rem;flex-wrap:wrap;gap:0.5rem">
            <h4 class="admin-chart-title" style="margin:0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              Besucher-Verlauf (7 Tage)
            </h4>
            <div style="display:flex;gap:1.25rem">
              <div class="admin-mini-stat"><span style="color:var(--gray-500)">Heute</span><strong>${data.visits.today}</strong></div>
              <div class="admin-mini-stat"><span style="color:var(--gray-500)">Woche</span><strong>${data.visits.thisWeek}</strong></div>
              <div class="admin-mini-stat"><span style="color:var(--gray-500)">Monat</span><strong>${data.visits.thisMonth}</strong></div>
            </div>
          </div>
          <div class="admin-bar-chart">${chartBars}</div>
        </div>
      </div>

      <!-- Row: Umsatz Donut + Umsatz-Balken -->
      <div class="admin-row-2">
        <div class="card admin-chart-card">
          <div class="card-body">
            <h4 class="admin-chart-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
              Umsatz-Verteilung
            </h4>
            <div class="admin-donut-row">
              <div class="admin-donut-wrap">${revenueDonut}</div>
              <div class="admin-donut-legend">
                <div class="admin-legend-item"><span class="admin-legend-dot" style="background:#f97316"></span>Standard 7T<strong>${formatEuro((data.revenue.byProduct['Standard Boost (7 Tage)'] || {total:0}).total)}</strong></div>
                <div class="admin-legend-item"><span class="admin-legend-dot" style="background:#0ea5e9"></span>Standard 30T<strong>${formatEuro((data.revenue.byProduct['Standard Boost (30 Tage)'] || {total:0}).total)}</strong></div>
                <div class="admin-legend-item"><span class="admin-legend-dot" style="background:#8b5cf6"></span>Premium 14T<strong>${formatEuro((data.revenue.byProduct['Premium Boost (14 Tage)'] || {total:0}).total)}</strong></div>
              </div>
            </div>
          </div>
        </div>
        <div class="card admin-chart-card">
          <div class="card-body">
            <h4 class="admin-chart-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f97316" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
              Umsatz pro Produkt
            </h4>
            <div style="display:flex;gap:1.25rem;margin-bottom:1rem">
              <div class="admin-mini-stat"><span style="color:var(--gray-500)">Heute</span><strong style="color:#22c55e">${formatEuro(data.revenue.today)}</strong></div>
              <div class="admin-mini-stat"><span style="color:var(--gray-500)">Monat</span><strong style="color:#22c55e">${formatEuro(data.revenue.thisMonth)}</strong></div>
            </div>
            ${revenueChart}
          </div>
        </div>
      </div>

      <!-- Umsatz-Zeitverlauf -->
      <div class="card admin-chart-card" id="admin-revenue-timeline" style="margin-bottom:1.5rem">
        <div class="card-body">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.25rem;flex-wrap:wrap;gap:0.75rem">
            <h4 class="admin-chart-title" style="margin:0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
              Umsatz-Verlauf
            </h4>
            <div class="admin-rev-tabs">
              <button class="admin-rev-tab ${state.adminRevenuePeriod === 'daily' ? 'active' : ''}" data-period="daily" onclick="switchRevenueView('daily')">Täglich</button>
              <button class="admin-rev-tab ${state.adminRevenuePeriod === 'monthly' ? 'active' : ''}" data-period="monthly" onclick="switchRevenueView('monthly')">Monatlich</button>
              <button class="admin-rev-tab ${state.adminRevenuePeriod === 'yearly' ? 'active' : ''}" data-period="yearly" onclick="switchRevenueView('yearly')">Jährlich</button>
              <button class="admin-rev-tab ${state.adminRevenuePeriod === 'alltime' ? 'active' : ''}" data-period="alltime" onclick="switchRevenueView('alltime')">Gesamt</button>
            </div>
          </div>
          <div style="display:flex;gap:2rem;margin-bottom:1rem">
            <div><span style="font-size:0.75rem;color:var(--gray-500)">Zeitraum-Umsatz</span><div id="admin-revenue-period-sum" style="font-size:1.3rem;font-weight:800;color:#059669">${(() => { const b = getRevenueTimeline(state.adminRevenuePeriod); return b.reduce((s, x) => s + x.total, 0).toFixed(2).replace('.',',') + ' EUR'; })()}</div></div>
            <div><span style="font-size:0.75rem;color:var(--gray-500)">Bestellungen</span><div id="admin-revenue-period-count" style="font-size:1.3rem;font-weight:800;color:var(--gray-700)">${(() => { const b = getRevenueTimeline(state.adminRevenuePeriod); return b.reduce((s, x) => s + x.count, 0) + ' Bestellungen'; })()}</div></div>
          </div>
          <div class="admin-bar-chart" id="admin-revenue-bars" style="height:200px">
            ${(() => {
              const bars = getRevenueTimeline(state.adminRevenuePeriod);
              const maxVal = Math.max(...bars.map(b => b.total), 1);
              const gradients = ['#10b981','#34d399','#6ee7b7','#a7f3d0','#059669','#047857','#065f46','#064e3b','#0d9488','#14b8a6','#2dd4bf','#5eead4','#99f6e4','#0f766e'];
              return bars.map((b, i) => {
                const pct = Math.max((b.total / maxVal) * 100, 3);
                const color = gradients[i % gradients.length];
                return '<div class="admin-bar-col"><div class="admin-bar-value" style="color:#059669">' + (b.total > 0 ? b.total.toFixed(0) + ' EUR' : '-') + '</div><div class="admin-bar-track"><div class="admin-bar-fill" style="height:' + pct + '%;background:' + color + ';animation-delay:' + (i * 0.05) + 's"></div></div><div class="admin-bar-label">' + b.label + '</div></div>';
              }).join('');
            })()}
          </div>
        </div>
      </div>

      <!-- Arbeitgeber Freischaltung -->
      ${(() => {
        const allUsers = JSON.parse(localStorage.getItem('jj_users') || '[]');
        const pendingEmployers = allUsers.filter(u => u.role === 'employer').map(u => {
          const full = JSON.parse(localStorage.getItem('jj_user_' + u.id) || '{}');
          return { ...u, ...full };
        });
        return pendingEmployers.length > 0 ? `
      <div class="card admin-chart-card" style="margin-bottom:1.5rem">
        <div class="card-body" style="padding:0;overflow:hidden">
          <div style="padding:1.25rem 1.25rem 0.75rem;display:flex;align-items:center;gap:0.5rem">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f97316" stroke-width="2"><path d="M9 12l2 2 4-4"/><rect x="2" y="3" width="20" height="18" rx="2"/></svg>
            <h4 style="margin:0;font-size:0.95rem;font-weight:700">Arbeitgeber Freischaltung</h4>
            <span class="badge badge-warning" style="margin-left:auto">${pendingEmployers.filter(u => !u.approved).length} ausstehend</span>
          </div>
          <table style="width:100%;border-collapse:collapse;font-size:0.9rem">
            <thead>
              <tr style="background:var(--gray-50);border-top:1px solid var(--gray-100);border-bottom:1px solid var(--gray-200)">
                <th style="padding:0.65rem 1.25rem;text-align:left;font-size:0.75rem;text-transform:uppercase;letter-spacing:0.05em;color:var(--gray-500);font-weight:600">Unternehmen</th>
                <th style="padding:0.65rem 1.25rem;text-align:left;font-size:0.75rem;text-transform:uppercase;letter-spacing:0.05em;color:var(--gray-500);font-weight:600">E-Mail</th>
                <th style="padding:0.65rem 1.25rem;text-align:center;font-size:0.75rem;text-transform:uppercase;letter-spacing:0.05em;color:var(--gray-500);font-weight:600">Status</th>
                <th style="padding:0.65rem 1.25rem;text-align:center;font-size:0.75rem;text-transform:uppercase;letter-spacing:0.05em;color:var(--gray-500);font-weight:600">Aktion</th>
              </tr>
            </thead>
            <tbody>
              ${pendingEmployers.map(u => {
                const freemail = isFreemailDomain(u.email);
                return `
                <tr class="admin-table-row" style="${freemail && !u.approved ? 'background:rgba(245,158,11,0.08)' : ''}">
                  <td style="padding:0.65rem 1.25rem">
                    <div>
                      <span style="font-weight:600">${u.company || u.name}</span>
                      <div style="font-size:0.75rem;color:var(--gray-500)">${u.name}</div>
                    </div>
                  </td>
                  <td style="padding:0.65rem 1.25rem">
                    <span style="${freemail ? 'color:#f97316;font-weight:600' : 'color:var(--gray-500)'}">${u.email}</span>
                    ${freemail ? '<div style="font-size:0.7rem;color:#f97316;font-weight:500">&#9888; Freemail-Adresse</div>' : '<div style="font-size:0.7rem;color:var(--success)">&#10003; Geschäfts-E-Mail</div>'}
                  </td>
                  <td style="padding:0.65rem 1.25rem;text-align:center">
                    ${u.approved
                      ? '<span class="badge badge-success">Freigeschaltet</span>'
                      : '<span class="badge badge-warning">Ausstehend</span>'}
                  </td>
                  <td style="padding:0.65rem 1.25rem;text-align:center">
                    ${u.approved
                      ? `<button class="btn btn-sm" style="background:var(--danger);color:#fff;font-size:0.75rem" onclick="adminToggleApproval(${u.id}, false)">Sperren</button>`
                      : `<button class="btn btn-sm" style="background:var(--success);color:#fff;font-size:0.75rem" onclick="adminToggleApproval(${u.id}, true)">Freischalten</button>`}
                  </td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>` : '';
      })()}

      <!-- Benutzer-Liste -->
      <div class="card admin-chart-card" style="margin-bottom:1.5rem">
        <div class="card-body" style="padding:0;overflow:hidden">
          <div style="padding:1.25rem 1.25rem 0.75rem;display:flex;align-items:center;gap:0.5rem">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
            <h4 style="margin:0;font-size:0.95rem;font-weight:700">Alle Benutzer</h4>
            <span class="badge badge-info" style="margin-left:auto">${data.users.total} gesamt</span>
          </div>
          <table style="width:100%;border-collapse:collapse;font-size:0.9rem">
            <thead>
              <tr style="background:var(--gray-50);border-top:1px solid var(--gray-100);border-bottom:1px solid var(--gray-200)">
                <th style="padding:0.65rem 1.25rem;text-align:left;font-size:0.75rem;text-transform:uppercase;letter-spacing:0.05em;color:var(--gray-500);font-weight:600">Benutzer</th>
                <th style="padding:0.65rem 1.25rem;text-align:left;font-size:0.75rem;text-transform:uppercase;letter-spacing:0.05em;color:var(--gray-500);font-weight:600">E-Mail</th>
                <th style="padding:0.65rem 1.25rem;text-align:center;font-size:0.75rem;text-transform:uppercase;letter-spacing:0.05em;color:var(--gray-500);font-weight:600">Rolle</th>
              </tr>
            </thead>
            <tbody>
              ${JSON.parse(localStorage.getItem('jj_users') || '[]').map(u => {
                const initials = (u.name || '?').split(' ').map(n => n[0]).join('').toUpperCase();
                const avatarColor = u.role === 'employer' ? '#f97316' : '#0ea5e9';
                return `
                <tr class="admin-table-row">
                  <td style="padding:0.65rem 1.25rem">
                    <div style="display:flex;align-items:center;gap:0.75rem">
                      <div style="width:32px;height:32px;border-radius:50%;background:${avatarColor};color:#fff;display:flex;align-items:center;justify-content:center;font-size:0.7rem;font-weight:700;flex-shrink:0">${initials}</div>
                      <span style="font-weight:600">${u.name || '-'}</span>
                    </div>
                  </td>
                  <td style="padding:0.65rem 1.25rem;color:var(--gray-500)">${u.email}</td>
                  <td style="padding:0.65rem 1.25rem;text-align:center">
                    <span class="badge ${u.role === 'employer' ? 'badge-warning' : 'badge-info'}">${u.role === 'employer' ? 'Arbeitgeber' : 'Arbeitnehmer'}</span>
                  </td>
                </tr>`;
              }).join('') || '<tr><td colspan="3" style="padding:2rem;text-align:center;color:var(--gray-400)">Noch keine Benutzer registriert</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Footer -->
      <div style="text-align:center;padding:1.5rem 0 2.5rem;color:var(--gray-400);font-size:0.8rem">
        Letzte Aktualisierung: ${new Date().toLocaleString('de-DE')} &bull;
        <a href="#" onclick="navigate('admin-panel')" style="color:var(--primary);text-decoration:none;font-weight:500">Jetzt aktualisieren</a>
      </div>
    </div>`;
}

// ===== EVENT LISTENERS =====
function attachEventListeners() {
  // Close dropdown on outside click
  document.addEventListener('click', (e) => {
    if (state.dropdownOpen && !e.target.closest('.user-menu')) {
      state.dropdownOpen = false;
      const dd = document.getElementById('user-dropdown');
      if (dd) dd.classList.add('hidden');
    }
  });
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  render();
});

// Close mobile menu on nav
document.addEventListener('click', (e) => {
  if (!e.target.closest('#navbar')) {
    const menu = document.getElementById('mobile-menu');
    if (menu) menu.classList.remove('open');
  }
});
