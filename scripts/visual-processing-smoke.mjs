import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {chromium, expect} from '@playwright/test';

// Run against the production server, like capture-ui.mjs. Keep this content-specific
// check separate from the global UI suite; both write to its existing artifact folder.
const origin = process.env.CC_ORIGIN || 'http://127.0.0.1:3000';
const base = process.env.CC_BASE_PATH || '/collectanea-DB';
const out = process.env.CC_EVIDENCE_DIR || 'artifacts/visual';
const title = '映像表現と画像処理';
const route = '/reference/visual-processing/';
const anchors = ['tones', 'filters', 'optics', 'compositing', 'geometry', 'temporal', 'stylization'];
const source = await fs.readFile('reference/visual-processing/index.md', 'utf8');
const terms = [...source.matchAll(/^\| \*\*(.+?)\*\* \|/gm)].map((match) => match[1]);
assert.ok(terms.length > 0, 'The source index must contain real terminology');
await fs.mkdir(out, {recursive: true});
const report = {
  head: process.env.CC_HEAD_SHA || null,
  tested: execFileSync('git', ['rev-parse', 'HEAD'], {encoding: 'utf8'}).trim(),
  environment: {node: process.version, fonts: 'system fallbacks; font stylesheet intentionally unavailable'},
  termCount: terms.length, checks: [], pageErrors: [], resourceErrors: [], layouts: [],
};
const browser = await chromium.launch();
report.environment.browser = browser.version();
const context = await browser.newContext({viewport: {width: 1440, height: 1000}, colorScheme: 'light'});
await context.route('https://fonts.googleapis.com/**', (request) => request.abort());
const page = await context.newPage();
page.on('pageerror', (error) => report.pageErrors.push(String(error)));
page.on('response', (response) => {
  if (response.url().startsWith(origin) && response.status() >= 400) {
    report.resourceErrors.push({url: response.url(), status: response.status()});
  }
});
const url = (suffix) => `${origin}${base}${suffix}`;
async function go(suffix) {
  const response = await page.goto(url(suffix), {waitUntil: 'networkidle'});
  assert.equal(response.status(), 200, suffix);
  await expect(page.locator('html')).toHaveAttribute('data-cc-sidebar', /collapsed|expanded/);
}
async function shot(name) {
  await page.screenshot({path: path.join(out, `reference-${name}.png`)});
}
async function check(name, fn) {
  try {await fn(); report.checks.push({name, status: 'PASS'});}
  catch (error) {
    report.checks.push({name, status: 'FAIL', error: String(error)});
    await shot(`failure-${name}`).catch(() => {});
  }
  await fs.writeFile(path.join(out, 'reference-smoke-report.json'), JSON.stringify(report, null, 2));
}
async function noOverflow() {
  const widths = await page.evaluate(() => ({scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth}));
  assert.ok(widths.scroll <= widths.client + 1, `Page overflows horizontally: ${JSON.stringify(widths)}`);
  return widths;
}

try {
  await check('reference-entry-sidebar-and-content', async () => {
    await go('/reference/');
    await page.locator('.theme-doc-markdown').getByRole('link', {name: title, exact: true}).click();
    await expect(page).toHaveURL(url(route));
    await expect(page.locator('.theme-doc-markdown h1')).toHaveText(title);
    assert.equal(await page.locator('h1').count(), 1, 'Avoid duplicate article headings');
    const renderedTerms = await page.locator('.theme-doc-markdown tbody tr td:first-child').allTextContents();
    assert.deepEqual(renderedTerms.map((term) => term.trim()), terms, 'Every source term must render, in order');
    await expect(page.locator('.theme-doc-sidebar-container').getByRole('link', {name: title, exact: true})).toBeVisible();
    await expect(page.locator('.theme-doc-markdown')).toContainText('現時点で操作できる実験はこの索引にはありません');
    const unresolved = await page.locator('.theme-doc-markdown a[href^="#"]').evaluateAll((links) => links
      .map((link) => link.getAttribute('href')).filter((href) => !document.getElementById(decodeURIComponent(href.slice(1)))));
    assert.deepEqual(unresolved, [], 'All article fragment links must have real targets');
    await noOverflow();
    await shot('desktop-light');
  });
  await check('category-anchors-keyboard-and-reduced-motion', async () => {
    await page.emulateMedia({reducedMotion: 'reduce'});
    await go(route);
    for (const id of anchors) {
      const link = page.locator(`.theme-doc-markdown li a[href="#${id}"]`);
      await link.focus();
      await link.press('Enter');
      await expect.poll(() => new URL(page.url()).hash).toBe(`#${id}`);
      const target = page.locator(`.theme-doc-markdown h2[id="${id}"]`);
      await expect(target).toBeInViewport();
    }
    assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior), 'auto');
    await page.locator('.theme-doc-markdown li a[href="#tones"]').click();
    await shot('desktop-terms');
    await page.emulateMedia({reducedMotion: 'no-preference'});
  });
  await check('global-search-japanese-and-english', async () => {
    for (const query of ['Dithering', 'ディザリング', title]) {
      await go('/');
      await page.locator('.cc-home-search').click();
      const input = page.locator('#cc-search-input');
      await input.fill(query);
      const result = page.locator('dialog [role="option"]').filter({hasText: title}).first();
      await expect(result).toBeVisible();
      if (query === 'Dithering') await shot('search-dithering');
      await result.click();
      await expect(page).toHaveURL(url(route));
      await expect(page.locator('.theme-doc-markdown h1')).toHaveText(title);
    }
  });
  await check('responsive-reading-themes-and-mobile-outline', async () => {
    for (const width of [1440, 768, 390, 320]) {
      await page.setViewportSize({width, height: width > 1000 ? 1000 : 844});
      for (const theme of ['light', 'dark']) {
        await go(route);
        await page.evaluate((value) => document.documentElement.setAttribute('data-theme', value), theme);
        await expect(page.locator('.theme-doc-markdown h1')).toBeInViewport();
        const widths = await noOverflow();
        const tables = await page.locator('.theme-doc-markdown table').evaluateAll((els) => els.map((el) => {
          const cells = el.querySelector('tbody tr').cells;
          return {client: el.clientWidth, scroll: el.scrollWidth, termWidth: cells[0].getBoundingClientRect().width, descriptionWidth: cells[1].getBoundingClientRect().width};
        }));
        if (width <= 996) {
          for (const table of tables) {
            assert.ok(table.scroll <= table.client + 1, 'Compact tables must not hide text in horizontal overflow');
            assert.ok(table.descriptionWidth >= table.client * 0.58,
              `Mobile definitions must not collapse into a narrow strip: ${JSON.stringify(table)}`);
          }
        }
        report.layouts.push({width, theme, ...widths, tables});
        if ([1440, 390].includes(width)) await shot(`${width}-${theme}`);
      }
    }
    await page.setViewportSize({width: 390, height: 844});
    await page.emulateMedia({reducedMotion: 'reduce'});
    await go(route);
    await page.locator('.cc-mobile-outline summary').click();
    await page.locator('.cc-mobile-outline a[href="#tones"]').click();
    await expect(page).toHaveURL(`${url(route)}#tones`);
    await expect(page.locator('.cc-mobile-outline')).not.toHaveAttribute('open');
    await expect(page.locator('.theme-doc-markdown h2[id="tones"]')).toBeInViewport();
    await noOverflow();
    await shot('mobile-terms');
    await page.setViewportSize({width: 320, height: 844});
    await page.locator('.theme-doc-markdown h2[id="tones"]').scrollIntoViewIfNeeded();
    await shot('320-terms');
    await page.setViewportSize({width: 390, height: 844});
    await go(route);
    await page.locator('.navbar__toggle').click();
    await expect(page.locator('.navbar-sidebar')).toBeVisible();
    await expect(page.locator('.navbar-sidebar').getByRole('link', {name: title, exact: true})).toBeVisible();
    await shot('mobile-sidebar');
  });
  await check('no-runtime-or-resource-errors', async () => {
    assert.deepEqual(report.pageErrors, []);
    assert.deepEqual(report.resourceErrors, []);
  });
} finally {
  report.status = report.checks.every((entry) => entry.status === 'PASS') ? 'PASS' : 'FAIL';
  await fs.writeFile(path.join(out, 'reference-smoke-report.json'), JSON.stringify(report, null, 2));
  await browser.close();
}
console.log(JSON.stringify(report, null, 2));
if (report.status !== 'PASS') process.exitCode = 1;
