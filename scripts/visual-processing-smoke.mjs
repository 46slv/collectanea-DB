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
    await expect(page.locator('.theme-doc-markdown')).toContainText('最初の操作できる実験');
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
  await check('dithering-interaction-and-mobile', async () => {
    await page.setViewportSize({width: 1440, height: 1000});
    await go(route);
    await page.getByRole('link', {name: 'ディザリングの詳細記事と操作デモ'}).click();
    await expect(page).toHaveURL(/\/reference\/visual-processing\/dithering\/?$/);
    await expect(page.locator('.theme-doc-markdown h1')).toHaveText('ディザリング（Dithering）');
    const widget = page.locator('[data-vp-dither="ready"]');
    await expect(widget).toBeVisible();
    // Preview and readout must precede parameter controls in DOM, visual and keyboard order.
    const assertResultsBeforeControls = async () => {
      const layout = await widget.evaluate((section) => {
        const results = section.querySelector('.vp-dither__previews');
        const controls = section.querySelector('.vp-dither__controls');
        const reset = section.querySelector('.vp-dither__reset');
        return {
          domOrder: Boolean(results.compareDocumentPosition(controls) & Node.DOCUMENT_POSITION_FOLLOWING),
          visualOrder: results.getBoundingClientRect().bottom < controls.getBoundingClientRect().top,
          resetBelow: controls.getBoundingClientRect().bottom <= reset.getBoundingClientRect().top,
        };
      });
      assert.ok(layout.domOrder && layout.visualOrder && layout.resetBelow,
        'Results must appear above all parameter controls: ' + JSON.stringify(layout));
    };
    await assertResultsBeforeControls();
    const preview = (kind) => widget.locator('[data-vp-preview="' + kind + '"] canvas');
    const picture = (kind) => preview(kind).evaluate((canvas) => canvas.toDataURL());
    await expect.poll(() => preview('original').evaluate((canvas) => canvas.getContext('2d')
      .getImageData(canvas.width - 1, 0, 1, 1).data[0])).toBe(255);
    const original = await picture('original');
    const plain = await picture('plain');
    await expect.poll(() => picture('processed')).not.toBe(plain);
    await widget.locator('.vp-dither__previews').scrollIntoViewIfNeeded();
    await shot('dithering-desktop');

    const method = widget.getByRole('combobox', {name: '処理方式'});
    await method.selectOption('none');
    await expect(widget).toHaveAttribute('data-vp-method', 'none');
    await expect.poll(() => picture('processed')).toBe(plain);

    await method.selectOption('error-diffusion');
    await expect.poll(() => picture('processed')).not.toBe(plain);
    const levels = widget.getByRole('slider', {name: '階調数'});
    await levels.focus();
    await levels.press('Home');
    await expect(levels).toHaveValue('2');
    await expect(widget).toHaveAttribute('data-vp-levels', '2');
    await expect.poll(() => picture('plain')).not.toBe(plain);

    await method.selectOption('ordered');
    const matrix = widget.getByRole('combobox', {name: 'パターンの大きさ'});
    await matrix.selectOption('2');
    const small = await picture('processed');
    await matrix.selectOption('8');
    await expect.poll(() => picture('processed')).not.toBe(small);

    await widget.getByRole('combobox', {name: '元画像'}).selectOption('radial');
    await expect.poll(() => picture('original')).not.toBe(original);
    await widget.getByRole('combobox', {name: '表示倍率'}).selectOption('4');
    await expect.poll(() => preview('processed').evaluate((canvas) =>
      canvas.getBoundingClientRect().width / canvas.parentElement.getBoundingClientRect().width))
      .toBeGreaterThan(3.9);

    await widget.getByRole('button', {name: '初期値に戻す'}).click();
    await expect(widget).toHaveAttribute('data-vp-levels', '4');
    await expect(widget).toHaveAttribute('data-vp-method', 'ordered');
    await expect(widget.getByRole('combobox', {name: '元画像'})).toHaveValue('ramp');
    await expect(widget.getByRole('combobox', {name: '表示倍率'})).toHaveValue('1');

    for (const width of [390, 320]) {
      await page.setViewportSize({width, height: 844});
      await go('/reference/visual-processing/dithering');
      await expect(page.locator('[data-vp-dither="ready"]')).toBeVisible();
      await assertResultsBeforeControls();
      await noOverflow();
      if (width === 390) {
        await page.locator('.vp-dither__previews').scrollIntoViewIfNeeded();
        await shot('dithering-mobile');
      }
    }
  });
  await check('quantization-article-and-mobile', async () => {
    await page.setViewportSize({width: 1440, height: 1000});
    await go(route);
    await page.getByRole('link', {name: '仕組みと4階調の操作実験'}).click();
    await expect(page).toHaveURL(/\/reference\/visual-processing\/quantization\/?$/);
    await expect(page.locator('.theme-doc-markdown h1')).toHaveText('量子化（Quantization）');
    const widget = page.locator('[data-vp-dither="ready"]');
    await expect(widget).toBeVisible();
    const plain = widget.locator('[data-vp-preview="plain"] canvas');
    const result = widget.locator('[data-vp-preview="processed"] canvas');
    const image = (canvas) => canvas.evaluate((element) => element.toDataURL());
    const fourLevels = await image(plain);
    const levels = widget.getByRole('slider', {name: '階調数'});
    await levels.focus();
    await levels.press('Home');
    await expect(levels).toHaveValue('2');
    await expect.poll(() => image(plain)).not.toBe(fourLevels);
    await widget.getByRole('combobox', {name: '処理方式'}).selectOption('none');
    await expect.poll(() => image(result)).toBe(await image(plain));
    await page.setViewportSize({width: 390, height: 844});
    await go('/reference/visual-processing/quantization');
    await noOverflow();
    await shot('quantization-mobile');
  });
  await check('posterization-article-and-mobile', async () => {
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({width, height: width === 1440 ? 1000 : 844});
      await go(route);
      await page.getByRole('link', {name: '階調数を変えて面表現を試す'}).click();
      await expect(page).toHaveURL(new RegExp('/reference/visual-processing/posterization/?$'));
      await expect(page.locator('.theme-doc-markdown h1')).toHaveText('ポスタリゼーション（Posterization）');
      const widget = page.locator('[data-vp-dither="ready"]');
      await expect(widget).toBeVisible();
      const levels = widget.getByRole('slider', {name: '階調数'});
      await levels.focus();
      await levels.press('Home');
      await expect(widget).toHaveAttribute('data-vp-levels', '2');
      await widget.getByRole('combobox', {name: '処理方式'}).selectOption('none');
      await expect(widget).toHaveAttribute('data-vp-method', 'none');
      const picture = (kind) => widget.locator('[data-vp-preview="' + kind + '"] canvas')
        .evaluate((canvas) => canvas.toDataURL());
      await expect.poll(() => picture('processed')).toBe(await picture('plain'));
      await widget.getByRole('button', {name: '初期値に戻す'}).click();
      await expect(widget).toHaveAttribute('data-vp-levels', '4');
      await noOverflow();
    }
  });
  await check('filter-optics-widget-interactions-mobile', async () => {
    const cases = [
      {route: '/filters/gaussian-blur', name: 'blur', slider: 'ぼかし幅', attr: 'data-vp-sigma', minimum: '0'},
      {route: '/optics/bloom', name: 'bloom', slider: '合成強度', attr: 'data-vp-bloom-strength', minimum: '0'},
      {route: '/filters/unsharp-mask', name: 'sharpen', slider: '強さ', attr: 'data-vp-sharpen-amount', minimum: '0'},
      {route: '/filters/sobel-edge-detection', name: 'sobel', slider: '輪郭の閾値', attr: 'data-vp-sobel-threshold', minimum: '0'},
      {route: '/filters/difference-of-gaussians', name: 'dog', slider: '小さいぼかしの標準偏差', attr: 'data-vp-dog-sigma', minimum: '0.5'},
    ];
    for (const spec of cases) {
      for (const width of [1440, 390, 320]) {
        await page.setViewportSize({width, height: width === 1440 ? 1000 : 844});
        await go('/reference/visual-processing' + spec.route);
        const widget = page.locator('[data-vp-' + spec.name + '="ready"]');
        await expect(widget).toBeVisible();
        const order = await widget.evaluate((section, name) => {
          const previews = section.querySelector('.vp-' + name + '__previews');
          const controls = section.querySelector('.vp-' + name + '__controls');
          return {
            dom: Boolean(previews && controls && (previews.compareDocumentPosition(controls) & Node.DOCUMENT_POSITION_FOLLOWING)),
            visual: Boolean(previews && controls && previews.getBoundingClientRect().bottom <= controls.getBoundingClientRect().top),
          };
        }, spec.name);
        assert.ok(order.dom && order.visual, 'Results precede controls: ' + spec.name + ' ' + width + ' ' + JSON.stringify(order));
        const slider = widget.getByRole('slider', {name: spec.slider, exact: true});
        await slider.focus();
        await slider.press('Home');
        await expect(widget).toHaveAttribute(spec.attr, spec.minimum);
        await widget.getByRole('button', {name: '初期値に戻す'}).click();
        await expect(widget).not.toHaveAttribute(spec.attr, spec.minimum);
        await noOverflow();
      }
    }
  });
  await check('median-filter-noise-controls-and-mobile', async () => {
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({width, height: width === 1440 ? 1000 : 844});
      await go('/reference/visual-processing/filters/median-filter');
      await expect(page.locator('.theme-doc-markdown h1')).toHaveText('Median Filter（中央値フィルタ）');
      const widget = page.locator('[data-vp-median="ready"]');
      await expect(widget).toBeVisible();
      const order = await widget.evaluate((element) => {
        const previews = element.querySelector('.vp-median__previews');
        const controls = element.querySelector('.vp-median__controls');
        return {
          dom: Boolean(previews && controls && (previews.compareDocumentPosition(controls) & Node.DOCUMENT_POSITION_FOLLOWING)),
          visual: Boolean(previews && controls && previews.getBoundingClientRect().bottom <= controls.getBoundingClientRect().top),
          panels: element.querySelectorAll('[data-vp-median-preview]').length,
        };
      });
      assert.ok(order.dom && order.visual && order.panels === 5,
        'Five previews before controls: ' + width + ' ' + JSON.stringify(order));
      const clean = widget.locator('[data-vp-median-preview="clean"] canvas');
      await expect.poll(() => clean.evaluate((canvas) => canvas.getContext('2d')
        .getImageData(0, 0, 1, 1).data[0])).toBe(45);
      if (width === 1440) {
        const noisy = widget.locator('[data-vp-median-preview="noisy"] canvas');
        const initial = await noisy.evaluate((canvas) => canvas.toDataURL());
        const slider = widget.getByRole('slider', {name: '塩胡椒ノイズ', exact: true});
        await slider.focus();
        await slider.press('Home');
        await expect(slider).toHaveValue('0');
        await expect.poll(() => noisy.evaluate((canvas) => canvas.toDataURL())).not.toBe(initial);
        await widget.getByRole('combobox', {name: 'ノイズの方式'}).selectOption('gaussian');
        await expect(widget).toHaveAttribute('data-vp-median-noise-mode', 'gaussian');
        await widget.getByRole('combobox', {name: 'ノイズ配置', exact: true}).selectOption('2027');
        await expect(widget).toHaveAttribute('data-vp-median-seed', '2027');
        await widget.getByRole('combobox', {name: '誤差マップの対象'}).selectOption('gaussian');
        await expect(widget).toHaveAttribute('data-vp-median-error-target', 'gaussian');
        const radius = widget.getByRole('slider', {name: 'Medianの近傍半径'});
        await radius.focus();
        await radius.press('End');
        await expect(widget).toHaveAttribute('data-vp-median-radius', '3');
        await widget.getByRole('button', {name: '初期値に戻す'}).click();
        await expect(widget).toHaveAttribute('data-vp-median-radius', '1');
        await expect(widget).toHaveAttribute('data-vp-median-noise-mode', 'impulse');
        await expect(widget).toHaveAttribute('data-vp-median-seed', '2026');
      }
      await noOverflow();
      if (width === 390) await shot('median-filter-mobile');
    }
  });
  await check('bilateral-filter-preview-controls-and-mobile', async () => {
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({width, height: width === 1440 ? 1000 : 844});
      await go('/reference/visual-processing/filters/bilateral-filter');
      await expect(page.locator('.theme-doc-markdown h1')).toHaveText('Bilateral Filter（バイラテラルフィルタ）');
      const widget = page.locator('[data-vp-bilateral="ready"]');
      await expect(widget).toBeVisible();
      const layout = await widget.evaluate((element) => {
        const previews = element.querySelector('.vp-bilateral__previews');
        const controls = element.querySelector('.vp-bilateral__controls');
        return {
          dom: Boolean(previews && controls && (previews.compareDocumentPosition(controls) & Node.DOCUMENT_POSITION_FOLLOWING)),
          visual: Boolean(previews && controls && previews.getBoundingClientRect().bottom <= controls.getBoundingClientRect().top),
          panels: element.querySelectorAll('[data-vp-bilateral-preview]').length,
        };
      });
      assert.ok(layout.dom && layout.visual && layout.panels === 4,
        'Bilateral four-panel preview-first layout: ' + width + ' ' + JSON.stringify(layout));
      const range = widget.getByRole('slider', {name: '輝度差シグマ'});
      const canvas = widget.locator('[data-vp-bilateral-preview="bilateral"] canvas');
      if (width === 1440) {
        const initial = await canvas.evaluate((element) => element.toDataURL());
        await range.focus();
        await range.press('Home');
        await expect(widget).toHaveAttribute('data-vp-bilateral-range-sigma', '10');
        await expect.poll(() => canvas.evaluate((element) => element.toDataURL())).not.toBe(initial);
        await widget.getByRole('button', {name: '初期値に戻す'}).click();
        await expect(widget).toHaveAttribute('data-vp-bilateral-range-sigma', '25');
      }
      await noOverflow();
      if (width === 390) await shot('bilateral-filter-mobile');
    }
  });
  await check('thresholding-interaction-and-mobile', async () => {
    await go(route);
    await page.getByRole('link', {name: '操作して二値化を比較する'}).click();
    await expect(page).toHaveURL(new RegExp('/reference/visual-processing/thresholding/?$'));
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({width, height: width === 1440 ? 1000 : 844});
      await go('/reference/visual-processing/thresholding');
      await expect(page.locator('.theme-doc-markdown h1')).toHaveText('閾値処理（Thresholding）');
      const widget = page.locator('[data-vp-threshold="ready"]');
      await expect(widget).toBeVisible();
      const layout = await widget.evaluate((el) => {
        const previews = el.querySelector('.vp-threshold__previews');
        const controls = el.querySelector('.vp-threshold__controls');
        return {
          dom: Boolean(previews && controls && (previews.compareDocumentPosition(controls) & Node.DOCUMENT_POSITION_FOLLOWING)),
          visual: Boolean(previews && controls && previews.getBoundingClientRect().bottom <= controls.getBoundingClientRect().top),
        };
      });
      assert.ok(layout.dom && layout.visual, 'Threshold previews precede controls: ' + width + ' ' + JSON.stringify(layout));
      const binary = widget.locator('[data-vp-threshold-preview="binary"] canvas');
      const initial = await binary.evaluate((canvas) => canvas.toDataURL());
      const slider = widget.getByRole('slider', {name: 'しきい値'});
      await slider.focus();
      await slider.press('Home');
      await expect(widget).toHaveAttribute('data-vp-threshold-value', '0');
      await expect.poll(() => binary.evaluate((canvas) => canvas.toDataURL())).not.toBe(initial);
      await widget.getByRole('button', {name: '初期値に戻す'}).click();
      await expect(widget).toHaveAttribute('data-vp-threshold-value', '128');
      await noOverflow();
      if (width === 390) await shot('thresholding-mobile');
    }
  });
  await check('guided-filter-preview-controls-and-mobile', async () => {
    await go(route);
    await page.getByRole('link', {name: '自己ガイドと理想ガイドを操作して比較'}).click();
    await expect(page).toHaveURL(new RegExp('/reference/visual-processing/filters/guided-filter/?$'));
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({width, height: width === 1440 ? 1000 : 844});
      await go('/reference/visual-processing/filters/guided-filter');
      await expect(page.locator('.theme-doc-markdown h1')).toHaveText('Guided Filter（ガイド付きフィルタ）');
      const widget = page.locator('[data-vp-guided="ready"]');
      await expect(widget).toBeVisible();
      const layout = await widget.evaluate((element) => {
        const previews = element.querySelector('.vp-guided__previews');
        const controls = element.querySelector('.vp-guided__controls');
        return {
          dom: Boolean(previews && controls && (previews.compareDocumentPosition(controls) & Node.DOCUMENT_POSITION_FOLLOWING)),
          visual: Boolean(previews && controls && previews.getBoundingClientRect().bottom <= controls.getBoundingClientRect().top),
          panels: element.querySelectorAll('[data-vp-guided-preview]').length,
        };
      });
      assert.ok(layout.dom && layout.visual && layout.panels === 4,
        'Guided Filter four-panel preview-first layout: ' + width + ' ' + JSON.stringify(layout));
      const mode = widget.getByRole('combobox', {name: 'ガイドの種類'});
      const guidance = widget.locator('[data-vp-guided-preview="guide"] canvas');
      const output = widget.locator('[data-vp-guided-preview="output"] canvas');
      const frame = canvas => canvas.evaluate(element => element.toDataURL());
      if (width === 1440) {
        const originalGuide = await frame(guidance);
        const originalOutput = await frame(output);
        await mode.selectOption('ideal');
        await expect(widget).toHaveAttribute('data-vp-guided-guide-mode', 'ideal');
        await expect.poll(() => frame(guidance)).not.toBe(originalGuide);
        await expect.poll(() => frame(output)).not.toBe(originalOutput);
        const radius = widget.getByRole('slider', {name: '近傍半径'});
        await radius.focus();
        await radius.press('End');
        await expect(widget).toHaveAttribute('data-vp-guided-radius', '6');
        const changed = await frame(output);
        await widget.getByRole('slider', {name: '正則化'}).focus();
        await widget.getByRole('slider', {name: '正則化'}).press('End');
        await expect.poll(() => frame(output)).not.toBe(changed);
        await widget.getByRole('button', {name: '初期値に戻す'}).click();
        await expect(widget).toHaveAttribute('data-vp-guided-guide-mode', 'self');
        await expect(widget).toHaveAttribute('data-vp-guided-radius', '3');
        await expect(widget.getByRole('slider', {name: '正則化'})).toHaveValue('20');
      }
      await noOverflow();
      if (width === 390) await shot('guided-filter-mobile');
    }
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
