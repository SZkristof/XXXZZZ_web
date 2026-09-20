/**
 * Resolves a Chromium for the verification scripts.
 *
 * Locally (and in the sandbox) a browser is already on disk at a known path;
 * on a CI runner Playwright installs its own and knows where it is. Hardcoding
 * either one breaks the other, so probe and fall back.
 */
import { existsSync } from 'node:fs';
import { chromium } from 'playwright';

const CANDIDATES = [
  process.env.PLAYWRIGHT_CHROMIUM_PATH,
  '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
].filter(Boolean);

export function launchChromium(opts = {}) {
  const executablePath = CANDIDATES.find((p) => existsSync(p));
  // No executablePath => Playwright uses the browser it installed itself.
  return chromium.launch(executablePath ? { ...opts, executablePath } : opts);
}
