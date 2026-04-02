import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('http://localhost:4323/');
  await page.waitForLoadState('networkidle');

  // Take first screenshot
  await page.screenshot({ path: '/home/manol/Projects/personal/aiwebsite/e2e/screenshots/rotator-0.png', fullPage: false });

  // Get the h1 text at moment 0
  const h1Text0 = await page.evaluate(() => {
    const h1 = document.querySelector('h1');
    if (!h1) return 'no h1 found';
    return h1.innerText;
  });

  // Get lime/green rotating text at moment 0
  const rotatingText0 = await page.evaluate(() => {
    // Look for elements with lime/green color in h1
    const h1 = document.querySelector('h1');
    if (!h1) return 'no h1';
    const spans = h1.querySelectorAll('span, [class*="rotat"], [class*="green"], [class*="lime"]');
    const results = [];
    spans.forEach(el => {
      const style = window.getComputedStyle(el);
      const color = style.color;
      results.push({ text: el.innerText, color, className: el.className });
    });
    return JSON.stringify(results);
  });

  console.log('=== SCREENSHOT 0 ===');
  console.log('H1 text:', h1Text0);
  console.log('Rotating/colored spans:', rotatingText0);

  // Wait 4 seconds
  await page.waitForTimeout(4000);

  // Take second screenshot
  await page.screenshot({ path: '/home/manol/Projects/personal/aiwebsite/e2e/screenshots/rotator-1.png', fullPage: false });

  // Get the h1 text at moment 1
  const h1Text1 = await page.evaluate(() => {
    const h1 = document.querySelector('h1');
    if (!h1) return 'no h1 found';
    return h1.innerText;
  });

  const rotatingText1 = await page.evaluate(() => {
    const h1 = document.querySelector('h1');
    if (!h1) return 'no h1';
    const spans = h1.querySelectorAll('span, [class*="rotat"], [class*="green"], [class*="lime"]');
    const results = [];
    spans.forEach(el => {
      const style = window.getComputedStyle(el);
      const color = style.color;
      results.push({ text: el.innerText, color, className: el.className });
    });
    return JSON.stringify(results);
  });

  console.log('=== SCREENSHOT 1 ===');
  console.log('H1 text:', h1Text1);
  console.log('Rotating/colored spans:', rotatingText1);

  await browser.close();
})();
