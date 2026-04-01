// @ts-check
// Run this AFTER changing hero headline in Strapi + rebuilding Astro.
// Compares against the "before" snapshot saved by cms.spec.js.

import { test, expect } from '@playwright/test';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCREENSHOTS_DIR = join(__dirname, 'screenshots');

async function shot(page, name) {
  const path = join(SCREENSHOTS_DIR, `${name}.png`);
  await page.screenshot({ path, fullPage: true });
  console.log(`Screenshot saved: ${path}`);
}

test('AFTER snapshot - homepage hero changed', async ({ page }) => {
  await page.goto('/');
  const headline = await page.locator('h1').first().textContent();
  const after = headline?.trim() ?? '(empty)';
  console.log('AFTER hero headline:', after);

  writeFileSync(join(SCREENSHOTS_DIR, 'after-headline.txt'), after);

  // Compare with before
  const beforeFile = join(SCREENSHOTS_DIR, 'before-headline.txt');
  if (existsSync(beforeFile)) {
    const before = readFileSync(beforeFile, 'utf8').trim();
    console.log('BEFORE:', before);
    console.log('AFTER: ', after);
    expect(after).not.toBe(before); // content change must be reflected
    console.log('✅ Hero headline changed successfully — CMS edit reflected in build');
  } else {
    console.warn('No before-headline.txt found — run cms.spec.js first');
  }

  await shot(page, 'after-homepage');
});
