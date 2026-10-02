import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {chromium, expect} from '@playwright/test';

const origin = process.env.CC_ORIGIN || 'http://127.0.0.1:3000';
const base = process.env.CC_BASE_PATH || '/collectanea-DB';
const out = process.env.CC_EVIDENCE_DIR || 'artifacts/visual';
await fs.mkdir(out, {recursive: true});
const report = {head: process.env.CC_HEAD_SHA || null, tested: execFileSync('git', ['rev-parse', 'HEAD'], {encoding: 'utf8'}).trim(), checks: [], consoleErrors: [], environment: {node: process.version}, measured: {}};
const browser = await chromium.launch();
const context = await browser.newContext({viewport: {width: 1440, height: 1000}, colorScheme: 'light'});
// Deterministic fallback-font captures also prove that font CDN loss cannot block reading.
await context.route('https://fonts.googleapis.com/**', (route) => route.abort());
report.environment.fonts = 'system fallbacks; font stylesheet intentionally unavailable';
const page = await context.newPage();
page.on('pageerror', (error) => report.consoleErrors.push(String(error)));
page.on('console', (msg) => {if (msg.type() === 'error' && /hydration|Minified React|uncaught/i.test(msg.text())) report.consoleErrors.push(msg.text());});
const url = (route = '') => `${origin}${base}${route}`;
async function go(route = '') {
  const response = await page.goto(url(route), {waitUntil: 'networkidle'});
  assert.equal(response.status(), 200, route);
  await expect(page.locator('html')).toHaveAttribute('data-cc-sidebar', /collapsed|expanded/);
}
async function shot(name) {await page.screenshot({path: path.join(out, `${name}.png`), fullPage: false});}
async function check(name, fn) {
  try {await fn(); report.checks.push({name, status: 'PASS'});}
  catch (error) {report.checks.push({name, status: 'FAIL', error: String(error)}); await shot(`failure-${name.replace(/[^a-z0-9-]/gi, '-')}`).catch(() => {});}
  await fs.writeFile(path.join(out, 'capture-report.json'), JSON.stringify(report, null, 2));
}
async function noOverflow() {
  const sizes = await page.evaluate(() => ({scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth}));
  assert.ok(sizes.scroll <= sizes.client + 1, `Horizontal overflow: ${JSON.stringify(sizes)}`);
}
async function center() {
  const result = await page.locator('.theme-doc-markdown').evaluate((el) => {const r = el.getBoundingClientRect(); return {center: r.x + r.width / 2, width: r.width, viewport: document.documentElement.clientWidth, inner: window.innerWidth};});
  result.drift = Math.abs(result.center - result.viewport / 2);
  assert.ok(result.drift <= 2, `Article drift ${JSON.stringify(result)}`);
  assert.ok(result.width <= 800.1, 'Reading width must remain bounded');
  return result;
}
function contrast(a, b) {
  const lum = (rgb) => rgb.map((v) => {v /= 255; return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4;}).reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0);
  const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05);
}
try {
  await check('home-and-view-switch', async () => {
    await go('/');
    assert.equal(await page.locator('main').count(), 1);
    assert.ok(await page.locator('.cc-card').count() > 0);
    await expect(page.getByLabel('並び順', {exact: true})).toHaveValue('recent');
    await page.getByRole('button', {name: 'リスト', exact: true}).click();
    await expect(page.locator('[data-cc-view]')).toHaveAttribute('data-cc-view', 'list');
    await noOverflow();
    await page.getByRole('button', {name: 'パネル', exact: true}).click();
    await shot('01-home-desktop');
    const firstCard = page.locator('.cc-card').first();
    const cardHref = await firstCard.locator('.cc-card-hit').getAttribute('href');
    assert.ok(cardHref, 'Card must expose one full-surface destination');
    await firstCard.click({position: {x: 12, y: 12}});
    assert.equal(new URL(page.url()).pathname, cardHref, 'Clicking card surface must navigate');
    await go('/');
  });
  await check('palette-focus-ime-and-empty', async () => {
    await page.locator('.cc-navbar-search').click();
    const dialog = page.locator('dialog'), input = page.locator('#cc-search-input');
    await expect(dialog).toBeVisible(); await expect(input).toBeFocused();
    await input.fill('Merge');
    await expect(dialog.locator('[role="option"]').first()).toBeVisible();
    assert.equal(await dialog.evaluate((el) => el.matches(':modal')), true);
    await shot('02-command-palette');
    const close = dialog.getByRole('button', {name: '検索を閉じる'});
    const focusable = dialog.locator('button:not([disabled]):not([tabindex="-1"]), input, select, a[href]');
    const last = focusable.last();
    const before = page.url();
    await close.focus(); await close.press('Shift+Tab'); await expect(last).toBeFocused();
    await last.press('Tab'); await expect(close).toBeFocused();
    await input.focus();
    await input.dispatchEvent('compositionstart');
    await input.press('Enter'); await input.press('ArrowDown');
    assert.equal(page.url(), before); await expect(dialog).toBeVisible();
    await input.dispatchEvent('compositionend');
    await input.fill('zz-no-matches-908172635');
    await expect(dialog.locator('[role="option"]')).toHaveCount(0);
    await expect(input).not.toHaveAttribute('aria-activedescendant');
    await last.focus(); await last.press('Escape');
    await expect(dialog).not.toBeVisible(); await expect(page.locator('.cc-navbar-search')).toBeFocused();
  });
  await check('manual-tree-and-scoped-recent', async () => {
    await go('/manuals/fusion');
    const tree = page.locator('.cc-manual .cc-tree').first();
    await expect(tree.getByRole('link', {name: 'Merge', exact: true}).first()).toBeVisible();
    const recents = await page.locator('.cc-recent a').evaluateAll((links) => links.map((a) => a.getAttribute('href')));
    assert.ok(recents.length && recents.every((href) => href.includes('/manuals/fusion/')));
    await expect(page.locator('.cc-content-status')).toHaveCount(1);
    await shot('03-manual-top');
    await page.getByRole('button', {name: '閉じる', exact: true}).click();
    await page.getByLabel('この資料を検索', {exact: true}).fill('Merge');
    await expect(page.locator('.cc-manual').getByRole('link', {name: 'Merge', exact: true}).first()).toBeVisible();
  });
  await check('sidebar-real-close-persistence-center', async () => {
    await go('/manuals/fusion/nodes/compositing/merge');
    const closeHierarchy = page.getByRole('button', {name: '階層を閉じる', exact: true});
    await expect(closeHierarchy).toHaveAttribute('aria-expanded', 'true');
    assert.equal(await closeHierarchy.evaluate((el) => Boolean(el.closest('.theme-doc-sidebar-container'))), true, 'Close hierarchy control must live inside the hierarchy');
    await shot('04-article-sidebar-open');
    await closeHierarchy.click();
    await expect(page.getByRole('button', {name: '階層を開く', exact: true})).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('.theme-doc-sidebar-container')).toBeHidden();
    report.measured.center = await center();
    await shot('05-article-sidebar-closed');
    await page.locator('.navbar').getByRole('link', {name: 'Manuals', exact: true}).click();
    await expect(page.getByRole('button', {name: '階層を開く', exact: true})).toBeVisible();
    await page.goBack({waitUntil: 'networkidle'}); await page.reload({waitUntil: 'networkidle'});
    await expect(page.getByRole('button', {name: '階層を開く', exact: true})).toBeVisible();
    await center();
  });
  await check('heading-rail-visible-outline-native-anchor', async () => {
    await go('/manuals/fusion/nodes/compositing/merge');
    const inputId = await page.locator('.theme-doc-markdown h2').filter({hasText: '入力'}).first().getAttribute('id');
    assert.ok(inputId, 'Input heading must expose a native anchor id');
    const inputHref = `#${inputId}`;
    const rail = page.locator('[data-cc-rail]'), target = rail.locator(`.cc-rail-lines a[href="${inputHref}"]`);
    await expect(target).toBeVisible();
    const widths = await rail.locator('.cc-rail-line').evaluateAll((els) => Object.fromEntries(els.map((el) => [el.parentElement.dataset.headingLevel, parseFloat(getComputedStyle(el).width)])));
    assert.ok(widths[1] > widths[2] && widths[2] > widths[3]); report.measured.railWidths = widths;
    await target.hover();
    const label = page.locator(`[data-cc-outline] a[href="${inputHref}"]`);
    await expect(label).toBeVisible();
    assert.ok(await label.evaluate((el) => {const r = el.getBoundingClientRect(); const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2); return !!hit && (hit === el || el.contains(hit));}), 'Outline label is clipped or covered');
    await shot('06-heading-rail-expanded');
    await label.click();
    await expect.poll(() => page.evaluate(() => decodeURIComponent(location.hash))).toBe(inputHref);
    await expect(rail.locator(`.cc-rail-lines a[href="${inputHref}"]`)).toHaveAttribute('aria-current', 'location');
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
    await page.mouse.move(10, 10); await shot('07-heading-rail-current');
  });
  await check('fusion-generated-indexes', async () => {
    await go('/manuals/fusion/index/node-a-z');
    const generated = page.locator('[data-cc-fusion-index="nodes"]');
    await expect(generated).toBeVisible();
    await expect(generated.getByRole('link', {name: 'Merge', exact: true})).toBeVisible();
    await generated.getByLabel('この索引を絞り込む', {exact: true}).fill('MultiMerge');
    await expect(generated.getByRole('link', {name: 'MultiMerge', exact: true})).toBeVisible();
    await go('/manuals/fusion/index/by-task');
    await expect(page.locator('[data-cc-fusion-index="tasks"]')).toBeVisible();
  });
  await check('articles-single-layout-full-db', async () => {
    await go('/articles');
    assert.equal(await page.locator('main').count(), 1);
    await expect(page.locator('[data-cc-articles]')).toBeVisible();
    const nav = await page.locator('.navbar').boundingBox(), main = await page.locator('main').boundingBox();
    assert.ok(main.y >= nav.y + nav.height - 1, 'Articles must be below navbar');
    assert.equal(await page.locator('.theme-blog-markdown').count(), 0, 'Chronological duplicate remains');
    await shot('08-articles-db');
  });
  await check('light-dark-monochrome-contrast', async () => {
    await go('/');
    report.measured.contrast = {};
    for (const theme of ['light', 'dark']) {
      await page.evaluate((value) => document.documentElement.setAttribute('data-theme', value), theme);
      await page.waitForFunction(() => getComputedStyle(document.documentElement).getPropertyValue('--cc-canvas').trim().startsWith('#'));
      const tokens = await page.evaluate(() => {
        const style = getComputedStyle(document.documentElement), names = ['canvas','surface','raised','text','secondary','muted','rail-idle','rail-current','focus'];
        const parseHex = (raw) => {
          const hex = raw.trim().replace(/^#/, '');
          const full = hex.length === 3 ? [...hex].map((c) => c + c).join('') : hex;
          return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
        };
        return Object.fromEntries(names.map((name) => [name, parseHex(style.getPropertyValue(`--cc-${name}`))]));
      });
      for (const [name, values] of Object.entries(tokens)) assert.ok(values.every(Number.isFinite) && values[0] === values[1] && values[1] === values[2], `Tinted or invalid UI token ${name}: ${values.join(',')}`);
      const measurements = {};
      for (const text of ['text','secondary','muted']) for (const surface of ['canvas','surface','raised']) {const ratio = contrast(tokens[text], tokens[surface]); measurements[`${text}/${surface}`] = ratio; assert.ok(ratio >= 4.5, `${theme} ${text}/${surface}: ${ratio}`);}
      assert.ok(contrast(tokens['rail-idle'], tokens.canvas) >= 3);
      report.measured.contrast[theme] = measurements;
      await shot(`09-home-${theme}`);
    }
  });
  await check('responsive-and-mobile-navigation', async () => {
    for (const width of [1100, 996, 768, 390]) {
      await page.setViewportSize({width, height: 844}); await go('/');
      await page.getByRole('button', {name: 'リスト', exact: true}).click(); await noOverflow();
      await page.getByRole('button', {name: 'パネル', exact: true}).click(); await noOverflow();
    }
    await shot('10-mobile-home');
    await go('/manuals/fusion/nodes/compositing/merge'); await noOverflow(); await shot('11-mobile-article');
    await page.locator('.cc-mobile-outline summary').click();
    await expect(page.locator('.cc-mobile-outline')).toHaveAttribute('open', '');
    await shot('12-mobile-outline');
    const mobileInputId = await page.locator('.theme-doc-markdown h2').filter({hasText: '入力'}).first().getAttribute('id');
    assert.ok(mobileInputId, 'Mobile outline input heading must have an id');
    const mobileInputHref = `#${mobileInputId}`;
    await page.locator(`.cc-mobile-outline a[href="${mobileInputHref}"]`).click();
    await expect.poll(() => page.evaluate(() => decodeURIComponent(location.hash))).toBe(mobileInputHref);
    await expect(page.locator('.cc-mobile-outline')).not.toHaveAttribute('open');
    await page.locator('.navbar__toggle').click();
    const drawer = page.locator('.navbar-sidebar'); await expect(drawer).toBeVisible();
    await expect.poll(async () => (await drawer.boundingBox())?.x ?? -999).toBeGreaterThanOrEqual(-1);
    const bounds = await drawer.boundingBox(); assert.ok(bounds.x < 20);
    await shot('13-mobile-hierarchy');
  });
  await check('short-viewport-palette', async () => {
    await page.setViewportSize({width: 390, height: 520}); await go('/');
    await page.locator('.cc-home-search').click(); await expect(page.locator('dialog')).toBeVisible();
    await page.locator('#cc-search-input').fill('Merge'); await expect(page.locator('dialog [role="option"]').first()).toBeVisible();
    const box = await page.locator('dialog').boundingBox(); assert.ok(box.y >= 0 && box.y + box.height <= 520);
    await expect(page.locator('dialog .cc-result-type').first()).toBeVisible(); await shot('14-mobile-palette');
    await page.locator('dialog').getByRole('button', {name: '検索を閉じる'}).click();
  });
  await check('reduced-motion-keyboard-anchor', async () => {
    await page.setViewportSize({width: 1440, height: 1000}); await page.emulateMedia({reducedMotion: 'reduce'});
    await go('/manuals/fusion/nodes/compositing/merge');
    const controlsId = await page.locator('.theme-doc-markdown h2').filter({hasText: '主な設定'}).first().getAttribute('id');
    assert.ok(controlsId, 'Controls heading must expose a native anchor id');
    const controlsHref = `#${controlsId}`;
    const target = page.locator(`.cc-rail-lines a[href="${controlsHref}"]`); await target.focus(); await target.press('Enter');
    await expect.poll(() => page.evaluate(() => decodeURIComponent(location.hash))).toBe(controlsHref);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
    await expect(target).toHaveAttribute('aria-current', 'location');
    assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior), 'auto');
    await shot('15-reduced-motion-focus');
  });
  await check('storage-disabled-and-corrupt', async () => {
    for (const mode of ['corrupt', 'disabled']) {
      const isolated = await browser.newContext({viewport: {width: 1440, height: 1000}});
      await isolated.route('https://fonts.googleapis.com/**', (route) => route.abort());
      await isolated.addInitScript((value) => {
        if (value === 'corrupt') localStorage.setItem('collectanea.sidebar', 'invalid-value');
        else for (const method of ['getItem', 'setItem']) {const original = Storage.prototype[method]; Storage.prototype[method] = function(key, ...args) {if (String(key).startsWith('collectanea.')) throw new DOMException('Storage disabled', 'SecurityError'); return original.call(this, key, ...args);};}
      }, mode);
      const other = await isolated.newPage();
      await other.goto(url('/manuals/fusion/nodes/compositing/merge'), {waitUntil: 'networkidle'});
      await expect(other.locator('html')).toHaveAttribute('data-cc-sidebar', 'expanded');
      await other.getByRole('button', {name: '階層を閉じる', exact: true}).click();
      await other.locator('.theme-doc-markdown h1').click();
      await expect(other.getByRole('button', {name: '階層を開く', exact: true})).toHaveAttribute('aria-expanded', 'false');
      await isolated.close();
    }
  });
  await check('no-react-runtime-errors', async () => assert.deepEqual(report.consoleErrors, []));
} finally {
  report.status = report.checks.every((c) => c.status === 'PASS') ? 'PASS' : 'FAIL';
  await fs.writeFile(path.join(out, 'capture-report.json'), JSON.stringify(report, null, 2));
  await browser.close();
}
console.log(JSON.stringify(report, null, 2));
if (report.status !== 'PASS') process.exitCode = 1;
