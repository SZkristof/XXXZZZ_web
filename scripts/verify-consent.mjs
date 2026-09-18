import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join } from 'node:path';

const TYPES = { '.html':'text/html','.css':'text/css','.js':'text/javascript','.woff2':'font/woff2','.svg':'image/svg+xml' };
const server = createServer(async (req, res) => {
  let p = join('dist', decodeURIComponent(req.url.split('?')[0]));
  try { if ((await stat(p)).isDirectory()) p = join(p, 'index.html'); }
  catch { p = p.endsWith('.html') ? p : p + '/index.html'; }
  try { const b = await readFile(p); res.writeHead(200, {'Content-Type': TYPES[extname(p)] ?? 'text/plain'}); res.end(b); }
  catch { res.writeHead(404); res.end(); }
});
await new Promise((r) => server.listen(4399, r));

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const fails = [];
const check = (name, cond, detail='') => {
  console.log(`${cond ? '✓' : '✗'} ${name}${detail ? ' — ' + detail : ''}`);
  if (!cond) fails.push(name);
};

// Block outbound GTM so the test is hermetic.
const ctx = await browser.newContext();
await ctx.route('**://www.googletagmanager.com/**', (r) => r.abort());
const page = await ctx.newPage();
await page.goto('http://localhost:4399/', { waitUntil: 'domcontentloaded' });

const readConsent = () => page.evaluate(() => {
  // Replay dataLayer the way Google's tags do: last 'consent' wins per key.
  const state = {};
  for (const a of window.dataLayer ?? []) {
    if (a && a[0] === 'consent' && (a[1] === 'default' || a[1] === 'update')) Object.assign(state, a[2]);
  }
  return state;
});

let c = await readConsent();
check('consent defaults present', Object.keys(c).length > 0, JSON.stringify(c));
check('ad_storage denied by default', c.ad_storage === 'denied');
check('analytics_storage denied by default', c.analytics_storage === 'denied');
check('ad_user_data denied by default', c.ad_user_data === 'denied');
check('ad_personalization denied by default', c.ad_personalization === 'denied');
check('security_storage granted', c.security_storage === 'granted');

const banner = page.locator('#consent');
check('banner visible on first visit', await banner.isVisible());

// Reject path
await page.click('#c-reject');
c = await readConsent();
check('reject keeps ad_storage denied', c.ad_storage === 'denied');
check('reject keeps analytics_storage denied', c.analytics_storage === 'denied');
check('banner hidden after reject', !(await banner.isVisible()));
const cookiesAfterReject = await ctx.cookies();
check('no cookies set after reject', cookiesAfterReject.length === 0,
      cookiesAfterReject.map(x => x.name).join(',') || 'none');

// Accept path, fresh context
const ctx2 = await browser.newContext();
await ctx2.route('**://www.googletagmanager.com/**', (r) => r.abort());
const p2 = await ctx2.newPage();
await p2.goto('http://localhost:4399/', { waitUntil: 'domcontentloaded' });
await p2.click('#c-accept');
const c2 = await p2.evaluate(() => {
  const s = {};
  for (const a of window.dataLayer ?? []) {
    if (a && a[0] === 'consent' && (a[1] === 'default' || a[1] === 'update')) Object.assign(s, a[2]);
  }
  return s;
});
check('accept grants ad_storage', c2.ad_storage === 'granted');
check('accept grants analytics_storage', c2.analytics_storage === 'granted');

// Persistence across reload
await p2.reload({ waitUntil: 'domcontentloaded' });
check('banner stays hidden after reload', !(await p2.locator('#consent').isVisible()));
const c3 = await p2.evaluate(() => {
  const s = {};
  for (const a of window.dataLayer ?? []) {
    if (a && a[0] === 'consent' && (a[1] === 'default' || a[1] === 'update')) Object.assign(s, a[2]);
  }
  return s;
});
check('consent restored on reload', c3.ad_storage === 'granted');

// CTA tracking
const evs = await p2.evaluate(() => {
  const seen = [];
  const orig = window.dataLayer.push.bind(window.dataLayer);
  window.dataLayer.push = (x) => { seen.push(x); return orig(x); };
  // Swallow the navigation so the page (and this context) survives the click.
  document.addEventListener('click', (e) => e.preventDefault(), true);
  document.querySelector('[data-track="hero-primary"]')?.click();
  return seen;
});
check('cta_click pushed to dataLayer', evs.some((e) => e && e.event === 'cta_click'),
      JSON.stringify(evs.filter(e => e && e.event)));

await browser.close(); server.close();
console.log(fails.length ? `\n${fails.length} CHECK(S) FAILED` : '\nAll consent checks passed.');
process.exit(fails.length ? 1 : 0);
