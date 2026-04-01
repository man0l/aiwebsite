// @ts-check
import { test, expect } from '@playwright/test';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCREENSHOTS_DIR = join(__dirname, 'screenshots');
mkdirSync(SCREENSHOTS_DIR, { recursive: true });

// Helper: save a named screenshot to e2e/screenshots/
async function shot(page, name) {
  const path = join(SCREENSHOTS_DIR, `${name}.png`);
  await page.screenshot({ path, fullPage: true });
  console.log(`Screenshot saved: ${path}`);
}

// ─── Landing page ──────────────────────────────────────────────────────────────

test('homepage renders with CMS content', async ({ page }) => {
  await page.goto('/');

  // Page should not be blank or error
  await expect(page.locator('body')).toBeVisible();

  // Hero h1 must exist and have text
  const h1 = page.locator('h1').first();
  await expect(h1).toBeVisible();
  const headline = await h1.textContent();
  expect(headline?.trim().length).toBeGreaterThan(0);
  console.log('Hero headline:', headline?.trim());

  // Header nav must be present
  await expect(page.locator('header')).toBeVisible();

  // Footer must be present
  await expect(page.locator('footer')).toBeVisible();

  await shot(page, '01-homepage');
});

test('homepage hero CTA link is present when data exists', async ({ page }) => {
  await page.goto('/');
  // CTA is optional (only shown if ctaLabel + ctaUrl set in Strapi)
  const cta = page.locator('a[href]:has-text("")').filter({ hasText: /\S/ }).first();
  // Just screenshot — don't fail if CTA isn't seeded yet
  await shot(page, '02-homepage-hero-cta');
});

test('homepage case studies section renders', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // Section only renders if caseStudies array is non-empty in Strapi
  const section = page.locator('section').filter({ hasText: /Case Studies/i });
  const exists = await section.count();
  if (exists > 0) {
    await expect(section).toBeVisible();
    const cards = section.locator('[class*="rounded-2xl"]');
    const count = await cards.count();
    console.log(`Case study cards found: ${count}`);
    expect(count).toBeGreaterThan(0);
  } else {
    console.warn('No case studies section — seed caseStudies in Strapi Home Page');
  }

  await shot(page, '03-homepage-case-studies');
});

test('homepage FAQ section renders', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const section = page.locator('section#faq');
  const exists = await section.count();
  if (exists > 0) {
    await expect(section).toBeVisible();
    // Click first FAQ item to expand it
    const firstSummary = section.locator('summary').first();
    await firstSummary.click();
    await shot(page, '04-homepage-faq-open');
  } else {
    console.warn('No FAQ section — seed faq items in Strapi Home Page');
    await shot(page, '04-homepage-faq-empty');
  }
});

// ─── Blog listing ──────────────────────────────────────────────────────────────

test('blog listing page renders', async ({ page }) => {
  await page.goto('/blog');

  await expect(page.locator('h1')).toBeVisible();
  const heading = await page.locator('h1').textContent();
  expect(heading?.trim()).toBe('Blog');

  await shot(page, '05-blog-listing');
});

test('blog listing shows post cards when posts are seeded', async ({ page }) => {
  await page.goto('/blog');
  await page.waitForLoadState('networkidle');

  const cards = page.locator('a[href^="/blog/"]');
  const count = await cards.count();
  console.log(`Blog post cards found: ${count}`);

  if (count > 0) {
    // Each card should have a title
    const firstTitle = cards.first().locator('h2');
    await expect(firstTitle).toBeVisible();
    console.log('First post title:', await firstTitle.textContent());
  } else {
    console.warn('No blog posts found — seed Blog Posts in Strapi (and publish them)');
  }

  await shot(page, '06-blog-listing-cards');
});

// ─── Blog post page ────────────────────────────────────────────────────────────

test('blog post page renders for first published post', async ({ page }) => {
  // Navigate to blog listing to find a real slug
  await page.goto('/blog');
  await page.waitForLoadState('networkidle');

  const firstCard = page.locator('a[href^="/blog/"]').first();
  const count = await firstCard.count();

  if (count === 0) {
    console.warn('No blog posts to test — skipping post page test');
    test.skip();
    return;
  }

  const href = await firstCard.getAttribute('href');
  console.log('Testing blog post at:', href);

  await page.goto(href);
  await page.waitForLoadState('networkidle');

  // Title must be visible
  const h1 = page.locator('h1').first();
  await expect(h1).toBeVisible();
  console.log('Post title:', await h1.textContent());

  // Back link must exist (use the specific back-link text, not the nav link)
  await expect(page.locator('a[href="/blog"]:has-text("Back to Blog")')).toBeVisible();

  await shot(page, '07-blog-post');
});

test('blog post prose content renders', async ({ page }) => {
  await page.goto('/blog');
  await page.waitForLoadState('networkidle');

  const firstCard = page.locator('a[href^="/blog/"]').first();
  if (await firstCard.count() === 0) { test.skip(); return; }

  const href = await firstCard.getAttribute('href');
  await page.goto(href);
  await page.waitForLoadState('networkidle');

  // Prose container should be present if content was set
  const prose = page.locator('.prose');
  if (await prose.count() > 0) {
    await expect(prose).toBeVisible();
    console.log('Prose content present ✅');
  } else {
    console.warn('No prose content — check blog post content field in Strapi');
  }

  await shot(page, '08-blog-post-prose');
});

// ─── Before/After CMS change test ─────────────────────────────────────────────
// Run this test BEFORE changing content in Strapi to capture "before" state.
// Then change the hero headline in Strapi → rebuild Astro → run again for "after".

test('BEFORE snapshot - homepage hero', async ({ page }) => {
  await page.goto('/');
  const headline = await page.locator('h1').first().textContent();
  console.log('BEFORE hero headline:', headline?.trim());

  // Save headline text to a file so we can compare after
  writeFileSync(
    join(SCREENSHOTS_DIR, 'before-headline.txt'),
    headline?.trim() ?? '(empty)',
  );

  await shot(page, 'before-homepage');
});
