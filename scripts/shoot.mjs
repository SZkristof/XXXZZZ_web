import { launchChromium } from './browser.mjs';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join } from 'node:path';

const TYPES = { '.html':'text/html', '.css':'text/css', '.js':'text/javascript',
  '.woff2':'font/woff2', '.svg':'image/svg+xml', '.xml':'application/xml',
  '.jpg':'image/jpeg', '.png':'image/png', '.webp':'image/webp' };

const server = createServer(async (req, res) => {
  let p = join('dist', decodeURIComponent(req.url.split('?')[0]));
  try {
    if ((await stat(p)).isDirectory()) p = join(p, 'index.html');
  } catch {
    p = p.endsWith('.html') ? p : p + '/index.html';
  }
  try {
    const buf = await readFile(p);
    res.writeHead(200, { 'Content-Type': TYPES[extname(p)] ?? 'application/octet-stream' });
    res.end(buf);
  } catch { res.writeHead(404); res.end('nf'); }
});
await new Promise((r) => server.listen(4321, r));

const targets = process.argv.slice(2);
const browser = await launchChromium();

for (const t of targets) {
  const [path, label] = t.split('::');
  for (const [name, vp] of [['desktop', { width: 1440, height: 900 }], ['mobile', { width: 390, height: 844 }]]) {
    const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: name === 'mobile' ? 2 : 1 });
    const page = await ctx.newPage();
    await page.goto(`http://localhost:4321${path}`, { waitUntil: 'networkidle' });
    await page.evaluate(() => { const c = document.getElementById('consent'); if (c) c.remove(); });
    await page.waitForTimeout(400);
    await page.screenshot({ path: `shots/${label}-${name}.png`, fullPage: true });
    console.log(`✓ shots/${label}-${name}.png`);
    await ctx.close();
  }
}
await browser.close();
server.close();
