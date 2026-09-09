const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  const errs = [];
  p.on('requestfailed', r => errs.push('FEHLT: ' + r.url().split('/').slice(-2).join('/')));
  await p.goto('file:///home/user/webseiten-verkaufen/verkauf/mare-print/verkaufsunterlage.html',
               { waitUntil: 'networkidle' });
  await p.waitForTimeout(1200);
  // Überlauf je Seite prüfen
  const over = await p.evaluate(() => {
    const out = [];
    document.querySelectorAll('.page').forEach((pg, i) => {
      const pr = pg.getBoundingClientRect();
      const grenze = pr.bottom - 14 * 3.7795;           // 14 mm Fussbereich freihalten
      pg.querySelectorAll('.pad *').forEach(el => {
        if (el.closest('.foot')) return;
        const r = el.getBoundingClientRect();
        if (r.height > 0 && r.bottom > grenze + 1)
          out.push('Seite ' + (i + 1) + ': ' + el.tagName + '.' + String(el.className).slice(0, 24) +
                   ' ragt ' + Math.round((r.bottom - grenze) / 3.7795) + ' mm zu weit');
      });
    });
    return [...new Set(out)];
  });
  console.log(errs.length ? errs.join('\n') : 'alle Bilder geladen');
  console.log(over.length ? over.join('\n') : 'kein Seitenüberlauf');
  await p.pdf({ path: '/home/user/webseiten-verkaufen/verkauf/mare-print/MARE-Print-Entwurf-und-Angebot.pdf',
                format: 'A4', printBackground: true, preferCSSPageSize: true });
  await b.close();
})();
