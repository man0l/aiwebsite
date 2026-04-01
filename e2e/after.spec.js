// @ts-check
// Self-contained before/after CMS change test.
// 1. Reads current hero headline (BEFORE)
// 2. Updates headline via Strapi REST API
// 3. Rebuilds Astro
// 4. Verifies the new headline is live (AFTER)
// 5. Restores the original headline + rebuilds (cleanup)

import { test, expect } from '@playwright/test';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCREENSHOTS_DIR = join(__dirname, 'screenshots');
mkdirSync(SCREENSHOTS_DIR, { recursive: true });

const STRAPI_URL = 'http://localhost:1337';
const WEB_DIR = join(__dirname, '..', 'web');
const READ_TOKEN_FILE = join(__dirname, '..', 'strapi', 'seed-token.txt');
const WRITE_TOKEN_FILE = join(__dirname, '..', 'strapi', 'write-token.txt');
const WEB_ENV_FILE = join(WEB_DIR, '.env');

function getWriteToken() {
  return readFileSync(WRITE_TOKEN_FILE, 'utf8').trim();
}

/** Sync the current read token from Strapi into web/.env before building */
function syncReadToken() {
  const token = readFileSync(READ_TOKEN_FILE, 'utf8').trim();
  let env = readFileSync(WEB_ENV_FILE, 'utf8');
  env = env.replace(/^STRAPI_API_TOKEN=.*/m, `STRAPI_API_TOKEN=${token}`);
  writeFileSync(WEB_ENV_FILE, env);
}

async function updateHeadline(headline) {
  const token = getWriteToken();
  const res = await fetch(`${STRAPI_URL}/api/home-page`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ data: { hero: { headline } } }),
  });
  if (!res.ok) throw new Error(`Strapi PUT failed: ${res.status} ${await res.text()}`);
  return res.json();
}

function rebuild() {
  syncReadToken();
  execSync('npm run build', { cwd: WEB_DIR, stdio: 'inherit' });
}

async function shot(page, name) {
  const path = join(SCREENSHOTS_DIR, `${name}.png`);
  await page.screenshot({ path, fullPage: true });
  console.log(`Screenshot saved: ${path}`);
}

test('BEFORE/AFTER: CMS hero headline change flows through to static build', async ({ page }) => {
  // ── BEFORE ────────────────────────────────────────────────────────────────
  await page.goto('/');
  const before = (await page.locator('h1').first().textContent())?.trim() ?? '';
  console.log('BEFORE headline:', before);
  expect(before.length).toBeGreaterThan(0);

  writeFileSync(join(SCREENSHOTS_DIR, 'before-headline.txt'), before);
  await shot(page, 'before-homepage');

  // ── CHANGE IN STRAPI ──────────────────────────────────────────────────────
  const changed = before + ' [UPDATED]';
  await updateHeadline(changed);
  console.log('Updated headline in Strapi to:', changed);

  // ── REBUILD ASTRO ─────────────────────────────────────────────────────────
  console.log('Rebuilding Astro...');
  rebuild();
  console.log('Rebuild complete.');

  // ── AFTER ─────────────────────────────────────────────────────────────────
  // Hard-navigate to bypass browser cache and pick up the new dist/ files
  await page.goto('/', { waitUntil: 'networkidle' });
  const after = (await page.locator('h1').first().textContent())?.trim() ?? '';
  console.log('AFTER headline:', after);

  writeFileSync(join(SCREENSHOTS_DIR, 'after-headline.txt'), after);
  await shot(page, 'after-homepage');

  expect(after).toBe(changed);
  expect(after).not.toBe(before);
  console.log('✅ CMS edit reflected in static build');

  // ── RESTORE ───────────────────────────────────────────────────────────────
  await updateHeadline(before);
  console.log('Restored original headline in Strapi.');
  rebuild();
  console.log('Restore rebuild complete.');
});
