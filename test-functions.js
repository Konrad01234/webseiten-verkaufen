#!/usr/bin/env node
// ============================================================
// WorkPilot — Statischer Funktionstest
// Prüft app.js, db.js, actions.js auf fehlende Funktionen,
// unregistrierte Handler, kaputte Referenzen, CSP-Verstösse.
// Aufruf: node test-functions.js
// ============================================================

const fs = require('fs');
const path = require('path');

let passed = 0;
let failed = 0;
const errors = [];

function ok(msg) { passed++; console.log(`  ✓ ${msg}`); }
function fail(msg) { failed++; errors.push(msg); console.log(`  ✗ ${msg}`); }
function test(condition, msg) { condition ? ok(msg) : fail(msg); }

// --- Load files ---
const dir = __dirname;
const appJs = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
const dbJs = fs.readFileSync(path.join(dir, 'db.js'), 'utf8');
const actionsJs = fs.readFileSync(path.join(dir, 'actions.js'), 'utf8');
const indexHtml = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
const styleCss = fs.existsSync(path.join(dir, 'style.css')) ? fs.readFileSync(path.join(dir, 'style.css'), 'utf8') : '';

console.log('\n=== 1. SYNTAX ===');
try { new Function(appJs); ok('app.js parst fehlerfrei'); } catch(e) { fail('app.js Parse-Error: ' + e.message); }
try { new Function(dbJs); ok('db.js parst fehlerfrei'); } catch(e) { fail('db.js Parse-Error: ' + e.message); }
try { new Function(actionsJs); ok('actions.js parst fehlerfrei'); } catch(e) { fail('actions.js Parse-Error: ' + e.message); }

console.log('\n=== 2. DATA-ACTION HANDLER ===');
const registeredActions = [...appJs.matchAll(/registerAction\s*\(\s*'([^']+)'/g)].map(m => m[1]);
const usedActionsApp = [...appJs.matchAll(/data-action="([^"]+)"/g)].map(m => m[1]);
const usedActionsHtml = [...indexHtml.matchAll(/data-action="([^"]+)"/g)].map(m => m[1]);
const allUsedActions = [...new Set([...usedActionsApp, ...usedActionsHtml])];
const regSet = new Set(registeredActions);
allUsedActions.forEach(a => {
  test(regSet.has(a), `data-action="${a}" ist registriert`);
});
ok(`${registeredActions.length} Actions registriert, ${allUsedActions.length} verwendet`);

console.log('\n=== 3. DATA-ON-SUBMIT HANDLER ===');
const registeredSubmits = [...appJs.matchAll(/registerSubmit\s*\(\s*'([^']+)'/g)].map(m => m[1]);
const usedSubmits = [...appJs.matchAll(/data-on-submit="([^"]+)"/g)].map(m => m[1]);
const subSet = new Set(registeredSubmits);
[...new Set(usedSubmits)].forEach(s => {
  test(subSet.has(s), `data-on-submit="${s}" ist registriert`);
});

console.log('\n=== 4. DATA-ON-INPUT HANDLER ===');
const registeredInputs = [...appJs.matchAll(/registerInput\s*\(\s*'([^']+)'/g)].map(m => m[1]);
const usedInputs = [...appJs.matchAll(/data-on-input="([^"]+)"/g)].map(m => m[1]);
const inpSet = new Set(registeredInputs);
[...new Set(usedInputs)].forEach(i => {
  test(inpSet.has(i), `data-on-input="${i}" ist registriert`);
});

console.log('\n=== 5. DATA-ON-CHANGE HANDLER ===');
const registeredChanges = [...appJs.matchAll(/registerChange\s*\(\s*'([^']+)'/g)].map(m => m[1]);
const usedChanges = [...appJs.matchAll(/data-on-change="([^"]+)"/g)].map(m => m[1]);
const chgSet = new Set(registeredChanges);
[...new Set(usedChanges)].forEach(c => {
  test(chgSet.has(c), `data-on-change="${c}" ist registriert`);
});

console.log('\n=== 6. DATA-ON-KEYDOWN HANDLER ===');
const registeredKeydowns = [...appJs.matchAll(/registerKeydown\s*\(\s*'([^']+)'/g)].map(m => m[1]);
const usedKeydowns = [...appJs.matchAll(/data-on-keydown="([^"]+)"/g)].map(m => m[1]);
const kdSet = new Set(registeredKeydowns);
[...new Set(usedKeydowns)].forEach(k => {
  test(kdSet.has(k), `data-on-keydown="${k}" ist registriert`);
});

console.log('\n=== 7. CSP-KONFORMITÄT (keine inline Handler) ===');
const inlineHandlers = ['onclick=', 'onsubmit=', 'onchange=', 'oninput=', 'onkeydown=', 'onmouseover=', 'onmouseout='];
inlineHandlers.forEach(h => {
  // Nur echte Attribute zählen, nicht Kommentare
  const codeLines = appJs.split('\n').filter(l => !l.trim().startsWith('//') && !l.trim().startsWith('*'));
  const codeStr = codeLines.join('\n');
  const appCount = (codeStr.match(new RegExp(h + '"', 'g')) || []).length;
  const htmlCount = (indexHtml.match(new RegExp(h + '"', 'g')) || []).length;
  test(appCount === 0, `app.js: kein ${h} (${appCount} gefunden)`);
  test(htmlCount === 0, `index.html: kein ${h} (${htmlCount} gefunden)`);
});

console.log('\n=== 8. DB-FUNKTIONEN ===');
const dbExports = [...dbJs.matchAll(/(?:^|\s)(signUp|signIn|signOut|getSession|onAuthChange|resetPasswordForEmail|updatePassword|getProfile|updateProfile|listJobs|getJob|getJobsByEmployer|createJob|updateJob|deleteJob|incrementJobMetric|applyToJob|getApplicationsForWorker|getApplicationsForJob|getApplicationsForEmployer|updateApplicationStatus|acceptInvitation|declineInvitation|getOrCreateChat|listChatsForUser|getMessages|sendMessage|subscribeToMessages|subscribeToChatList|getReviewsFor|createReview|listSavedJobIds|saveJob|unsaveJob|createSupportTicket|listSupportTickets)\b/g)].map(m => m[1]);
const uniqueExports = [...new Set(dbExports)];
uniqueExports.forEach(fn => {
  const defined = dbJs.includes(`function ${fn}(`) || dbJs.includes(`async function ${fn}(`);
  test(defined, `DB.${fn}() ist definiert`);
});

console.log('\n=== 9. RENDER-FUNKTIONEN ===');
const pages = ['renderLanding', 'renderLogin', 'renderRegister', 'renderJobSearch', 'renderJobDetail',
  'renderWorkerDashboard', 'renderWorkerProfile', 'renderWorkerProfileView',
  'renderEmployerDashboard', 'renderEmployerLanding', 'renderEmployerProfile',
  'renderPostJob', 'renderMessages', 'renderChatDetail', 'renderApplicants', 'renderApplicantProfile',
  'renderAdminPanel', 'renderSupport'];
pages.forEach(fn => {
  test(appJs.includes(`function ${fn}(`), `${fn}() existiert`);
});

console.log('\n=== 10. MERGE-KONFLIKTE ===');
test(!appJs.includes('<<<<<<<'), 'app.js: keine Merge-Konflikte');
test(!appJs.includes('>>>>>>>'), 'app.js: keine >>>>>>> Marker');
test(!indexHtml.includes('<<<<<<<'), 'index.html: keine Merge-Konflikte');
test(!dbJs.includes('<<<<<<<'), 'db.js: keine Merge-Konflikte');

console.log('\n=== 11. BRAND-CHECK ===');
test(!appJs.includes('EasyJobs'), 'app.js: kein "EasyJobs" (→ WorkPilot)');
test(!indexHtml.includes('EasyJobs'), 'index.html: kein "EasyJobs"');
test(!dbJs.includes('EasyJobs'), 'db.js: kein "EasyJobs"');

console.log('\n=== 12. SCRIPT-LADEREIHENFOLGE ===');
const actionsPos = indexHtml.indexOf('actions.js');
const appPos = indexHtml.indexOf('app.js');
test(actionsPos > 0, 'actions.js wird geladen');
test(appPos > 0, 'app.js wird geladen');
test(actionsPos < appPos, 'actions.js lädt VOR app.js');

console.log('\n=== 13. CACHE-BUSTING ===');
const appVersion = indexHtml.match(/app\.js\?v=(\d+)/);
const styleVersion = indexHtml.match(/style\.css\?v=(\d+)/);
test(appVersion, `app.js hat Cache-Bust v=${appVersion ? appVersion[1] : '?'}`);
test(styleVersion, `style.css hat Cache-Bust v=${styleVersion ? styleVersion[1] : '?'}`);

console.log('\n' + '='.repeat(50));
console.log(`ERGEBNIS: ${passed} bestanden, ${failed} fehlgeschlagen`);
if (failed > 0) {
  console.log('\nFehler:');
  errors.forEach(e => console.log(`  - ${e}`));
  process.exit(1);
} else {
  console.log('\n✓ Alle Tests bestanden!\n');
  process.exit(0);
}
