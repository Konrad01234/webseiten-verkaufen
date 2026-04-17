// Splash-Screen Failsafe-Timer. Wird vor app.js geladen, damit der
// Splash auch dann verschwindet wenn bootstrap() nie laeuft (JS-Error,
// Script blockiert, Netzwerkfehler bei app.js-Download).
// Synchronisiert sich mit app.js hidePageSplash() ueber die globale
// window.__splashHidden Flag.
window.__splashShownAt = performance.now();
setTimeout(function () {
  var s = document.getElementById('page-splash');
  if (s && !s.classList.contains('splash-hide')) {
    s.classList.add('splash-hide');
    setTimeout(function () { try { s.remove(); } catch (_) {} }, 500);
  }
  window.__splashHidden = true;
}, 8000);
