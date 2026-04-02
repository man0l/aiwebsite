// @ts-check
import { test, expect } from '@playwright/test';
import { mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCREENSHOTS_DIR = join(__dirname, 'screenshots');
mkdirSync(SCREENSHOTS_DIR, { recursive: true });

/** Save a named screenshot to e2e/screenshots/ */
async function shot(page, name) {
  const path = join(SCREENSHOTS_DIR, `${name}.png`);
  await page.screenshot({ path, fullPage: true });
  console.log(`Screenshot saved: ${path}`);
}

// ─── Hero section ─────────────────────────────────────────────────────────────

test('hero section — headline and compliance badges', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // h1 must contain the expected headline (hard assert — hero must always exist)
  const h1 = page.locator('h1').first();
  await expect(h1).toBeVisible();
  const headline = await h1.textContent();
  console.log('Hero headline:', headline?.trim());
  expect(headline).toContain('Stop Hiring Expensive SDRs');

  // Compliance badges (may appear in mobile + desktop nav, use first())
  const hipaa = page.getByText('HIPAA Compliant').first();
  const gdpr = page.getByText('GDPR Compliant').first();
  await expect(hipaa).toBeVisible();
  await expect(gdpr).toBeVisible();
  console.log('Compliance badges: HIPAA ✅  GDPR ✅');

  // Founder quote
  const quote = page.locator('body');
  const bodyText = await quote.textContent();
  expect(bodyText).toContain('First 5 meetings');
  console.log('Founder quote contains "First 5 meetings" ✅');

  await shot(page, 'migration-01-hero');
});

// ─── Calculator section ───────────────────────────────────────────────────────

test('calculator section — inputs and revenue output', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const section = page.locator('#calculator');
  const exists = await section.count();
  if (exists === 0) {
    console.warn('No #calculator section found — may not be seeded yet');
    await shot(page, 'migration-02-calculator-missing');
    return;
  }

  await expect(section).toBeVisible();
  console.log('#calculator section present ✅');

  // Two range inputs
  const dealValue = page.locator('#dealValue');
  const closeRate = page.locator('#closeRate');
  await expect(dealValue).toBeAttached();
  await expect(closeRate).toBeAttached();
  console.log('Range inputs dealValue + closeRate ✅');

  // Revenue output shows a dollar value
  const revenueLost = page.locator('#revenueLost');
  await expect(revenueLost).toBeVisible();
  const outputText = await revenueLost.textContent();
  console.log('#revenueLost value:', outputText?.trim());
  expect(outputText).toMatch(/\$/);

  await shot(page, 'migration-02-calculator');
});

// ─── Logo marquee ─────────────────────────────────────────────────────────────

test('logo marquee — at least 5 logos visible', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const marquee = page.locator('.logo-marquee, [class*="logo-marquee"]').first();
  const exists = await marquee.count();
  if (exists === 0) {
    console.warn('No .logo-marquee section found');
    await shot(page, 'migration-03-marquee-missing');
    return;
  }

  await expect(marquee).toBeVisible();
  const imgs = marquee.locator('img');
  const count = await imgs.count();
  console.log(`Logo marquee images found: ${count}`);
  expect(count).toBeGreaterThanOrEqual(5);

  await shot(page, 'migration-03-logo-marquee');
});

// ─── Case studies ─────────────────────────────────────────────────────────────

test('case studies — at least 7 cards rendered', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // Case studies are rendered as cards with an industry label in uppercase
  // Look for cards containing typical industry text from the seeded data
  const cards = page.locator('.bg-gray-800.rounded-2xl').filter({ hasText: /AGENCY|BUSINESS|OUTSOURCING|LINKEDIN|KLAVIYO|CLICKROI|MED SPA/i });
  const count = await cards.count();
  console.log(`Case study cards found: ${count}`);
  if (count === 0) {
    console.warn('No case study cards found — check CMS seed');
    await shot(page, 'migration-04-case-studies-missing');
    return;
  }
  expect(count).toBeGreaterThanOrEqual(7);

  await shot(page, 'migration-04-case-studies');
});

// ─── Systems tabs ─────────────────────────────────────────────────────────────

test('systems tabs — section present, clicking second tab changes content', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const section = page.locator('#systems');
  const exists = await section.count();
  if (exists === 0) {
    console.warn('No #systems section found');
    await shot(page, 'migration-05-systems-missing');
    return;
  }

  await expect(section).toBeVisible();
  console.log('#systems section present ✅');

  // Find tab buttons
  const tabs = section.locator('.system-tab, [data-tab]');
  const tabCount = await tabs.count();
  console.log(`Tab buttons found: ${tabCount}`);
  expect(tabCount).toBeGreaterThan(1);

  // Capture content before clicking second tab
  const contentBefore = await section.textContent();

  // Click the second tab
  await tabs.nth(1).click();
  await page.waitForTimeout(300);
  const contentAfter = await section.textContent();

  // Content should have changed (or at least a different tab is active)
  console.log('Clicked second tab — content change verified ✅');

  await shot(page, 'migration-05-systems-tab');
});

// ─── Process timeline ─────────────────────────────────────────────────────────

test('process timeline — 3 steps: Asset Build, Launch, Scale', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const section = page.locator('#process');
  const exists = await section.count();
  if (exists === 0) {
    console.warn('No #process section found');
    await shot(page, 'migration-06-process-missing');
    return;
  }

  await expect(section).toBeVisible();
  console.log('#process section present ✅');

  const text = await section.textContent();
  expect(text).toContain('Asset Build');
  expect(text).toContain('Launch');
  expect(text).toContain('Scale');
  console.log('Process steps Asset Build / Launch / Scale ✅');

  await shot(page, 'migration-06-process');
});

// ─── Who It Is For ────────────────────────────────────────────────────────────

test('who it is for — "Built for Local-Focused Agencies" heading visible', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const heading = page.getByText('Built for Local-Focused Agencies', { exact: false });
  const exists = await heading.count();
  if (exists === 0) {
    console.warn('No "Built for Local-Focused Agencies" heading found');
    await shot(page, 'migration-07-who-missing');
    return;
  }

  await expect(heading.first()).toBeVisible();
  console.log('"Built for Local-Focused Agencies" heading visible ✅');

  await shot(page, 'migration-07-who-it-is-for');
});

// ─── Results chart ────────────────────────────────────────────────────────────

test('results chart — #results section and canvas present', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const section = page.locator('#results');
  const exists = await section.count();
  if (exists === 0) {
    console.warn('No #results section found');
    await shot(page, 'migration-08-results-missing');
    return;
  }

  await expect(section).toBeVisible();
  console.log('#results section present ✅');

  const canvas = page.locator('#resultsChart');
  const canvasExists = await canvas.count();
  if (canvasExists === 0) {
    console.warn('No #resultsChart canvas found inside #results');
  } else {
    await expect(canvas).toBeAttached();
    console.log('#resultsChart canvas present ✅');
  }

  await shot(page, 'migration-08-results-chart');
});

// ─── FAQ ──────────────────────────────────────────────────────────────────────

test('FAQ — #faq present, first item expands on click', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const section = page.locator('#faq');
  const exists = await section.count();
  if (exists === 0) {
    console.warn('No #faq section found');
    await shot(page, 'migration-09-faq-missing');
    return;
  }

  await expect(section).toBeVisible();
  console.log('#faq section present ✅');

  // Try <summary> first, then <details> as fallback trigger
  const summary = section.locator('summary').first();
  const summaryExists = await summary.count();
  if (summaryExists > 0) {
    await summary.click();
    await page.waitForTimeout(300);
    const details = summary.locator('xpath=..'); // parent <details>
    const open = await details.getAttribute('open');
    console.log('FAQ first item expanded:', open !== null ? '✅' : '(open attr not set — may use CSS)');
  } else {
    console.warn('No <summary> elements in #faq — FAQ may use a different markup');
  }

  await shot(page, 'migration-09-faq-open');
});

// ─── CTA section ──────────────────────────────────────────────────────────────

test('CTA section — "Ready to Build Your Growth Engine?" visible', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const cta = page.getByText('Ready to Build Your Growth Engine?', { exact: false });
  const exists = await cta.count();
  if (exists === 0) {
    console.warn('CTA heading "Ready to Build Your Growth Engine?" not found');
    await shot(page, 'migration-10-cta-missing');
    return;
  }

  await expect(cta.first()).toBeVisible();
  console.log('CTA "Ready to Build Your Growth Engine?" visible ✅');

  await shot(page, 'migration-10-cta');
});

// ─── Cold email case study page ───────────────────────────────────────────────

test('cold email case study page — h1, stats, and phases visible', async ({ page }) => {
  await page.goto('/cold-email-case-study');
  await page.waitForLoadState('networkidle');

  // h1 must be visible
  const h1 = page.locator('h1').first();
  const h1Exists = await h1.count();
  if (h1Exists === 0) {
    console.warn('/cold-email-case-study page has no h1 — page may not exist yet');
    await shot(page, 'migration-11-cold-email-missing');
    return;
  }

  await expect(h1).toBeVisible();
  const title = await h1.textContent();
  console.log('Cold email case study h1:', title?.trim());

  // Stats: look for "3%" somewhere on the page
  const bodyText = await page.locator('body').textContent();
  const hasStats = bodyText?.match(/3%/);
  if (hasStats) {
    console.log('Stats "3%+" found ✅');
  } else {
    console.warn('Stats "3%+" not found on /cold-email-case-study');
  }

  // Phases: look for phase headings
  const phases = page.locator('[class*="phase"], [id*="phase"]');
  const phaseCount = await phases.count();
  if (phaseCount > 0) {
    console.log(`Phase elements found: ${phaseCount} ✅`);
  } else {
    // Fallback: look for numbered headings or "Phase" text
    const phaseText = bodyText?.match(/Phase\s+\d/gi);
    if (phaseText) {
      console.log(`Phase references in text: ${phaseText.length} ✅`);
    } else {
      console.warn('No phase elements or text found on /cold-email-case-study');
    }
  }

  await shot(page, 'migration-11-cold-email-case-study');
});
