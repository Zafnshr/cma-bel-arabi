const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const screenshotsDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

(async () => {
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Set viewport for a premium desktop-first aesthetic
  await page.setViewportSize({ width: 1440, height: 900 });

  // 1. Dashboard
  console.log('Capturing Dashboard...');
  try {
    await page.goto('http://127.0.0.1:3000/dashboard', { waitUntil: 'networkidle' });
    await page.screenshot({ path: path.join(screenshotsDir, 'latest-dashboard.png') });
    console.log('Dashboard captured!');
  } catch (err) {
    console.error('Failed to capture Dashboard:', err.message);
  }

  // 2a. Chapter Menu
  console.log('Capturing Chapter Menu...');
  try {
    await page.goto('http://127.0.0.1:3000/study/reader', { waitUntil: 'networkidle' });
    await page.screenshot({ path: path.join(screenshotsDir, 'latest-chapter-menu.png') });
    console.log('Chapter Menu captured!');
  } catch (err) {
    console.error('Failed to capture Chapter Menu:', err.message);
  }

  // 2b. PDF Reader Workspace - DOM Stitched Hover
  console.log('Capturing PDF Reader Workspace - Stitched Hover...');
  try {
    await page.goto('http://127.0.0.1:3000/study/reader/SU1', { waitUntil: 'load' });
    await page.waitForSelector('.react-pdf__Page__canvas', { state: 'visible', timeout: 15000 });
    // Wait for the DOM stitching useEffect to fire and tag spans with data-sentence-id
    await page.waitForTimeout(3000);
    
    // Hover over any tagged span to trigger the full-sentence highlight and translation
    const taggedSpan = await page.locator('.react-pdf__Page__textContent span[data-sentence-id]').first();
    if (await taggedSpan.count() > 0) {
      await taggedSpan.hover();
      console.log('Hovered over a stitched sentence span!');
    }
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(screenshotsDir, 'fix-stitched-hover.png') });
    await page.screenshot({ path: path.join(screenshotsDir, 'fix-static-translation.png') });
    console.log('Stitched Hover captured!');
  } catch (err) {
    console.error('Failed to capture Stitched Hover:', err.message);
  }

  // 2c. PDF Reader Workspace - Collapsed Global Sidebar
  console.log('Capturing PDF Reader Workspace - Collapsed Global Sidebar...');
  try {
    // Click the Global Sidebar collapse button (located on the far right aside)
    await page.click('button[title="طي القائمة"]');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(screenshotsDir, 'fix-sidebar-collapsed.png') });
    console.log('Collapsed Global Sidebar captured!');
  } catch (err) {
    console.error('Failed to collapse and capture Global Sidebar:', err.message);
  }

  // 3. Flashcards
  console.log('Capturing Flashcards...');
  try {
    await page.goto('http://127.0.0.1:3000/study/flashcards', { waitUntil: 'networkidle' });
    await page.screenshot({ path: path.join(screenshotsDir, 'latest-flashcards.png') });
    console.log('Flashcards captured!');
  } catch (err) {
    console.error('Failed to capture Flashcards:', err.message);
  }

  // 4. Simulator
  console.log('Capturing Simulator...');
  try {
    await page.goto('http://127.0.0.1:3000/simulator', { waitUntil: 'networkidle' });
    await page.screenshot({ path: path.join(screenshotsDir, 'latest-simulator.png') });
    console.log('Simulator captured!');
  } catch (err) {
    console.error('Failed to capture Simulator:', err.message);
  }

  await browser.close();
  console.log('All screenshots completed successfully!');
})().catch(err => {
  console.error('Process failed:', err);
  process.exit(1);
});
