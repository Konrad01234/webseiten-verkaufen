const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const OUT = '/home/user/webseiten-verkaufen/verkauf/mare-print/bilder';

async function prep(p, url) {
  await p.goto(url, { waitUntil: 'networkidle' });
  await p.addStyleTag({ content: 'html{scroll-behavior:auto!important}' });
  await p.waitForTimeout(1500);
  // Alle Reveal-Animationen auslösen und Preloader entfernen
  await p.evaluate(() => {
    document.querySelectorAll('[data-rv]').forEach(e => e.classList.add('in'));
    // Zaehler auf Endwert setzen, damit kein Zwischenstand im Bild landet
    document.querySelectorAll('[data-count]').forEach(e => {
      e.textContent = e.getAttribute('data-count');
    });
    const pl = document.getElementById('preloader'); if (pl) pl.remove();
  });
  await p.waitForTimeout(600);
}
async function shot(p, sel, file, pad) {
  await p.evaluate(([s, pad]) => {
    const el = document.querySelector(s);
    window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - (pad || 0));
  }, [sel, pad]);
  await p.waitForTimeout(700);
  await p.screenshot({ path: OUT + '/' + file, type:'jpeg', quality:80 });
}

(async () => {
  const b = await chromium.launch();
  const c = await b.newContext({ viewport:{width:1440,height:900}, deviceScaleFactor:1.8, reducedMotion:'reduce' });
  const p = await c.newPage();

  await prep(p, 'http://localhost:8123/index.html');
  await p.screenshot({ path: OUT + '/hero.jpg', type:'jpeg', quality:80 });
  await shot(p, '#rechner', 'rechner.jpg', 0);
  await shot(p, '#anwendungen', 'anwendungen.jpg', 0);
  await shot(p, '#produkte', 'produkte.jpg', 0);

  await prep(p, 'http://localhost:8123/material.html');
  await shot(p, '.mx', 'material.jpg', 110);

  await prep(p, 'http://localhost:8123/technik.html');
  await shot(p, '.diagram', 'technik.jpg', 200);

  // Mobil – drei Ausschnitte
  const m = await b.newContext({ viewport:{width:390,height:844}, deviceScaleFactor:2, isMobile:true, hasTouch:true, reducedMotion:'reduce' });
  const mp = await m.newPage();
  await prep(mp, 'http://localhost:8123/index.html');
  await mp.screenshot({ path: OUT + '/mobil-1.jpg', type:'jpeg', quality:80 });
  await mp.evaluate(() => document.querySelector('#rechner').scrollIntoView());
  await mp.waitForTimeout(700);
  await mp.screenshot({ path: OUT + '/mobil-2.jpg', type:'jpeg', quality:80 });
  await prep(mp, 'http://localhost:8123/material.html');
  await mp.evaluate(() => window.scrollTo(0, 900));
  await mp.waitForTimeout(700);
  await mp.screenshot({ path: OUT + '/mobil-3.jpg', type:'jpeg', quality:80 });

  await b.close();
  console.log('Screenshots erstellt');
})();
