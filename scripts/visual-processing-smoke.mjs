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
  await check('gamma-powercurve-preview-and-mobile', async () => {
    await go(route);
    await page.getByRole('link', {name: 'べき乗カーブを操作して比較'}).click();
    await expect(page).toHaveURL(new RegExp('/reference/visual-processing/gamma/?$'));
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({width, height: width === 1440 ? 1000 : 844});
      await go('/reference/visual-processing/gamma');
      await expect(page.locator('.theme-doc-markdown h1')).toHaveText('ガンマ（Gamma）とべき乗変換');
      const widget = page.locator('[data-vp-gamma="ready"]');
      await expect(widget).toBeVisible();
      const order = await widget.evaluate((element) => {
        const previews = element.querySelector('.vp-gamma__previews');
        const controls = element.querySelector('.vp-gamma__controls');
        return {
          dom: Boolean(previews && controls && (previews.compareDocumentPosition(controls) & Node.DOCUMENT_POSITION_FOLLOWING)),
          visual: Boolean(previews && controls && previews.getBoundingClientRect().bottom <= controls.getBoundingClientRect().top),
          panels: element.querySelectorAll('[data-vp-gamma-preview]').length,
        };
      });
      assert.ok(order.dom && order.visual && order.panels === 2,
        'Gamma preview-first two-panel layout: ' + width + ' ' + JSON.stringify(order));
      const exponent = widget.getByRole('slider', {name: 'べき乗指数 g'});
      const sample = widget.locator('.vp-gamma__sample');
      const output = widget.locator('[data-vp-gamma-preview="output"] canvas');
      await expect(sample).toContainText('出力128');
      await expect(output).toBeVisible();
      if (width === 1440) {
        const initial = await output.evaluate((canvas) => canvas.toDataURL());
        await exponent.focus();
        await exponent.press('Home');
        await exponent.press('ArrowRight');
        await expect(widget).toHaveAttribute('data-vp-gamma-exponent', '0.5');
        await expect(sample).toContainText('出力181');
        await expect.poll(() => output.evaluate((canvas) => canvas.toDataURL())).not.toBe(initial);
        await exponent.press('End');
        for (let i = 0; i < 4; i += 1) await exponent.press('ArrowLeft');
        await expect(widget).toHaveAttribute('data-vp-gamma-exponent', '2');
        await expect(sample).toContainText('出力64');
        await widget.getByRole('combobox', {name: '元画像'}).selectOption('radial');
        await widget.getByRole('combobox', {name: '表示倍率'}).selectOption('2');
        await widget.getByRole('button', {name: '初期値に戻す'}).click();
        await expect(widget).toHaveAttribute('data-vp-gamma-exponent', '1');
        await expect(sample).toContainText('出力128');
        await expect(widget.getByRole('combobox', {name: '元画像'})).toHaveValue('ramp');
        await expect(widget.getByRole('combobox', {name: '表示倍率'})).toHaveValue('1');
      }
      await noOverflow();
      if (width === 390) await shot('gamma-powercurve-mobile');
    }
  });
  await check('box-blur-preview-controls-and-mobile', async () => {
    await go(route);
    await page.getByRole('link', {name: '操作してGaussian Blurと比較'}).click();
    await expect(page).toHaveURL(new RegExp('/reference/visual-processing/filters/box-blur/?$'));
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({width, height: width === 1440 ? 1000 : 844});
      await go('/reference/visual-processing/filters/box-blur');
      await expect(page.locator('.theme-doc-markdown h1')).toHaveText('ボックスブラー（Box Blur）');
      const widget = page.locator('[data-vp-box="ready"]');
      await expect(widget).toBeVisible();
      const layout = await widget.evaluate((element) => {
        const previews = element.querySelector('.vp-box__previews');
        const controls = element.querySelector('.vp-box__controls');
        return {
          dom: Boolean(previews && controls && (previews.compareDocumentPosition(controls) & Node.DOCUMENT_POSITION_FOLLOWING)),
          visual: Boolean(previews && controls && previews.getBoundingClientRect().bottom <= controls.getBoundingClientRect().top),
          panels: element.querySelectorAll('[data-vp-box-preview]').length,
        };
      });
      assert.ok(layout.dom && layout.visual && layout.panels === 3,
        'Box Blur three-panel preview-first layout: ' + width + ' ' + JSON.stringify(layout));
      if (width === 1440) {
        const canvas = widget.locator('[data-vp-box-preview="box"] canvas');
        const initial = await canvas.evaluate((element) => element.toDataURL());
        const slider = widget.getByRole('slider', {name: 'Box半径'});
        await slider.focus();
        await slider.press('Home');
        await expect(widget).toHaveAttribute('data-vp-box-radius', '0');
        await expect.poll(() => canvas.evaluate((element) => element.toDataURL())).not.toBe(initial);
        await widget.getByRole('combobox', {name: 'テスト画像'}).selectOption('lights');
        await widget.getByRole('button', {name: '初期値に戻す'}).click();
        await expect(widget).toHaveAttribute('data-vp-box-radius', '3');
        await expect(widget.getByRole('combobox', {name: 'テスト画像'})).toHaveValue('edges');
      }
      await noOverflow();
      if (width === 390) await shot('box-blur-mobile');
    }
  });
  await check('contrast-preview-controls-and-mobile', async () => {
    await go(route);
    await page.getByRole('link', {name: '倍率とピボットを操作して比較'}).click();
    await expect(page).toHaveURL(new RegExp('/reference/visual-processing/contrast/?$'));
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({width, height: width === 1440 ? 1000 : 844});
      await go('/reference/visual-processing/contrast');
      await expect(page.locator('.theme-doc-markdown h1')).toHaveText('コントラスト（Contrast）と明暗差の線形変換');
      const widget = page.locator('[data-vp-contrast="ready"]');
      await expect(widget).toBeVisible();
      const layout = await widget.evaluate((element) => {
        const previews = element.querySelector('.vp-contrast__previews');
        const controls = element.querySelector('.vp-contrast__controls');
        return {
          dom: Boolean(previews && controls && (previews.compareDocumentPosition(controls) & Node.DOCUMENT_POSITION_FOLLOWING)),
          visual: Boolean(previews && controls && previews.getBoundingClientRect().bottom <= controls.getBoundingClientRect().top),
          panels: element.querySelectorAll('[data-vp-contrast-preview]').length,
        };
      });
      assert.ok(layout.dom && layout.visual && layout.panels === 2, 'Contrast preview-first at ' + width);
      const sample = widget.locator('.vp-contrast__sample');
      await expect(sample).toContainText('入力64 → 64');
      if (width === 1440) {
        const gain = widget.getByRole('slider', {name: 'コントラスト倍率 c'});
        const pivot = widget.getByRole('slider', {name: 'ピボット p'});
        const output = widget.locator('[data-vp-contrast-preview="output"] canvas');
        const initial = await output.evaluate((canvas) => canvas.toDataURL());
        await gain.focus();
        await gain.press('Home');
        await expect(widget).toHaveAttribute('data-vp-contrast-gain', '0.5');
        await expect(sample).toContainText('入力64 → 96');
        await expect.poll(() => output.evaluate((canvas) => canvas.toDataURL())).not.toBe(initial);
        await gain.press('End');
        await expect(widget).toHaveAttribute('data-vp-contrast-gain', '2');
        await expect(sample).toContainText('入力192 → 255');
        await pivot.focus();
        await pivot.press('Home');
        await expect(sample).toContainText('入力64 → 64');
        await widget.getByRole('combobox', {name: '元画像'}).selectOption('radial');
        await widget.getByRole('combobox', {name: '表示倍率'}).selectOption('2');
        await widget.getByRole('button', {name: '初期値に戻す'}).click();
        await expect(widget).toHaveAttribute('data-vp-contrast-gain', '1');
        await expect(pivot).toHaveValue('128');
        await expect(widget.getByRole('combobox', {name: '元画像'})).toHaveValue('ramp');
        await expect(widget.getByRole('combobox', {name: '表示倍率'})).toHaveValue('1');
      }
      await noOverflow();
      if (width === 390) await shot('contrast-mobile');
    }
  });
  await check('directional-blur-preview-controls-and-mobile', async () => {
    await go(route);
    await page.getByRole('link', {name: '角度と半径を操作して比較'}).click();
    await expect(page).toHaveURL(/\/reference\/visual-processing\/filters\/directional-blur\/?$/);
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({width, height: width === 1440 ? 1000 : 844});
      await go('/reference/visual-processing/filters/directional-blur');
      await expect(page.locator('.theme-doc-markdown h1')).toHaveText('方向性ブラー（Directional Blur）');
      const widget = page.locator('[data-vp-dir="ready"]');
      await expect(widget).toBeVisible();
      const layout = await widget.evaluate((element) => {
        const previews = element.querySelector('.vp-dir__previews');
        const controls = element.querySelector('.vp-dir__controls');
        return {
          dom: Boolean(previews && controls && (previews.compareDocumentPosition(controls) & Node.DOCUMENT_POSITION_FOLLOWING)),
          visual: Boolean(previews && controls && previews.getBoundingClientRect().bottom <= controls.getBoundingClientRect().top),
          panels: element.querySelectorAll('[data-vp-dir-preview]').length,
        };
      });
      assert.ok(layout.dom && layout.visual && layout.panels === 3,
        'Directional Blur three-panel preview-first: ' + width + ' ' + JSON.stringify(layout));
      await expect(widget).toHaveAttribute('data-vp-dir-angle', '0');
      await expect(widget).toHaveAttribute('data-vp-dir-radius', '7');
      const picture = (name) => widget.locator('[data-vp-dir-preview="' + name + '"] canvas')
        .evaluate((canvas) => canvas.toDataURL());
      await expect.poll(async () => (await picture('along')) !== (await picture('across'))).toBe(true);
      if (width === 1440) {
        const initial = await picture('along');
        const before = await picture('before');
        const angle = widget.getByRole('slider', {name: '方向'});
        await angle.focus();
        for (let i = 0; i < 3; i += 1) await angle.press('ArrowRight');
        await expect(widget).toHaveAttribute('data-vp-dir-angle', '45');
        await expect.poll(() => picture('along')).not.toBe(initial);
        for (let i = 0; i < 3; i += 1) await angle.press('ArrowRight');
        await expect(widget).toHaveAttribute('data-vp-dir-angle', '90');
        const radius = widget.getByRole('slider', {name: '線の半径'});
        await radius.focus();
        await radius.press('Home');
        await expect(widget).toHaveAttribute('data-vp-dir-radius', '0');
        await expect.poll(() => picture('along')).toBe(before);
        await expect.poll(() => picture('across')).toBe(before);
        await radius.press('End');
        await expect(widget).toHaveAttribute('data-vp-dir-radius', '16');
        await widget.getByRole('combobox', {name: 'テスト画像'}).selectOption('edges');
        await expect.poll(() => picture('before')).not.toBe(before);
        await widget.getByRole('button', {name: '初期値に戻す'}).click();
        await expect(widget).toHaveAttribute('data-vp-dir-angle', '0');
        await expect(widget).toHaveAttribute('data-vp-dir-radius', '7');
        await expect(widget.getByRole('combobox', {name: 'テスト画像'})).toHaveValue('lights');
        await expect.poll(() => picture('along')).toBe(initial);
      }
      await noOverflow();
      if (width === 390) await shot('directional-blur-mobile');
    }
  });

  await check('tone-curve-preview-controls-and-mobile', async () => {
    await go(route);
    await page.getByRole('link', {name: '中間点を操作して比較'}).click();
    await expect(page).toHaveURL(/\/reference\/visual-processing\/tone-curve\/?$/);
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({width, height: width === 1440 ? 1000 : 844});
      await go('/reference/visual-processing/tone-curve');
      await expect(page.locator('.theme-doc-markdown h1'))
        .toHaveText('トーンカーブ（Tone Curve）と区分線形補間');
      const widget = page.locator('[data-vp-tone-curve="ready"]');
      await expect(widget).toBeVisible();
      const layout = await widget.evaluate((element) => {
        const previews = element.querySelector('.vp-tone-curve__previews');
        const controls = element.querySelector('.vp-tone-curve__controls');
        return {
          dom: Boolean(previews && controls &&
            (previews.compareDocumentPosition(controls) & Node.DOCUMENT_POSITION_FOLLOWING)),
          visual: Boolean(previews && controls &&
            previews.getBoundingClientRect().bottom <= controls.getBoundingClientRect().top),
          panels: element.querySelectorAll('[data-vp-tone-preview]').length,
        };
      });
      assert.ok(layout.dom && layout.visual && layout.panels === 2,
        'Tone Curve two-panel preview-first layout: ' + width + ' ' + JSON.stringify(layout));
      const readout = widget.locator('.vp-tone-curve__readout');
      const slider = widget.getByRole('slider', {name: '中間点の出力値'});
      const plot = widget.locator('.vp-tone-curve__plot svg');
      await expect(widget).toHaveAttribute('data-vp-tone-middle', '128');
      await expect(readout).toContainText('入力64 → 64');
      await expect(plot).toHaveAttribute('aria-label', /入力128→128/);
      if (width === 1440) {
        const output = widget.locator('[data-vp-tone-preview="output"] canvas');
        const picture = () => output.evaluate((canvas) => canvas.toDataURL());
        const original = await picture();
        await slider.focus();
        await slider.press('Home');
        for (let i = 0; i < 2; i += 1) await slider.press('ArrowRight');
        await expect(widget).toHaveAttribute('data-vp-tone-middle', '64');
        await expect(readout).toContainText('入力64 → 32');
        await expect(readout).toContainText('入力192 → 160');
        await expect.poll(() => picture()).not.toBe(original);
        await slider.press('End');
        for (let i = 0; i < 2; i += 1) await slider.press('ArrowLeft');
        await expect(widget).toHaveAttribute('data-vp-tone-middle', '192');
        await expect(readout).toContainText('入力192 → 224');
        await expect(plot).toHaveAttribute('aria-label', /入力128→192/);
        await widget.getByRole('combobox', {name: '元画像'}).selectOption('radial');
        await widget.getByRole('combobox', {name: '表示倍率'}).selectOption('2');
        await widget.getByRole('button', {name: '初期値に戻す'}).click();
        await expect(widget).toHaveAttribute('data-vp-tone-middle', '128');
        await expect(widget.getByRole('combobox', {name: '元画像'})).toHaveValue('ramp');
        await expect(widget.getByRole('combobox', {name: '表示倍率'})).toHaveValue('1');
        await expect.poll(() => picture()).toBe(original);
      }
      await noOverflow();
      if (width === 390) await shot('tone-curve-mobile');
    }
  });
  await check('vignetting-three-panel-controls-and-mobile', async () => {
    await go(route);
    await page.getByRole('link', {name: '中心位置と減衰を操作して比較'}).click();
    await expect(page).toHaveURL(/\/reference\/visual-processing\/optics\/vignetting\/?$/);
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({width, height: width === 1440 ? 1000 : 844});
      await go('/reference/visual-processing/optics/vignetting');
      await expect(page.locator('.theme-doc-markdown h1')).toHaveText('周辺減光（Vignetting）');
      const widget = page.locator('[data-vp-vignette="ready"]');
      await expect(widget).toBeVisible();
      const layout = await widget.evaluate((element) => {
        const previews = element.querySelector('.vp-vig__previews');
        const controls = element.querySelector('.vp-vig__controls');
        return {
          dom: Boolean(previews && controls &&
            (previews.compareDocumentPosition(controls) & Node.DOCUMENT_POSITION_FOLLOWING)),
          visual: Boolean(previews && controls &&
            previews.getBoundingClientRect().bottom <= controls.getBoundingClientRect().top),
          panels: element.querySelectorAll('[data-vp-vig-preview]').length,
        };
      });
      assert.ok(layout.dom && layout.visual && layout.panels === 3,
        'Vignetting 3-panel preview-first layout: ' + width + ' ' + JSON.stringify(layout));
      await expect(widget).toHaveAttribute('data-vp-vig-strength', '65');
      await expect(widget).toHaveAttribute('data-vp-vig-center', '50');
      const picture = (kind) => widget.locator('[data-vp-vig-preview="' + kind + '"] canvas')
        .evaluate((canvas) => canvas.toDataURL());
      await expect.poll(async () => (await picture('smooth')) !== (await picture('before'))).toBe(true);
      if (width === 1440) {
        const initial = await picture('smooth');
        const before = await picture('before');
        const strength = widget.getByRole('slider', {name: '暗さの強さ'});
        await strength.focus();
        await strength.press('Home');
        await expect(widget).toHaveAttribute('data-vp-vig-strength', '0');
        await expect.poll(() => picture('smooth')).toBe(before);
        await expect.poll(() => picture('quadratic')).toBe(before);
        await strength.press('End');
        await expect(widget).toHaveAttribute('data-vp-vig-strength', '100');
        await expect.poll(() => picture('smooth')).not.toBe(before);
        const protectedRadius = widget.getByRole('slider', {name: '中心の保護範囲'});
        await protectedRadius.focus();
        await protectedRadius.press('End');
        await expect(protectedRadius).toHaveValue('80');
        const center = widget.getByRole('slider', {name: '中心の横位置'});
        await center.focus();
        await center.press('End');
        await expect(widget).toHaveAttribute('data-vp-vig-center', '80');
        await widget.getByRole('combobox', {name: 'テスト画像'}).selectOption('gradient');
        await expect.poll(() => picture('before')).not.toBe(before);
        await widget.getByRole('button', {name: '初期値に戻す'}).click();
        await expect(widget).toHaveAttribute('data-vp-vig-strength', '65');
        await expect(widget).toHaveAttribute('data-vp-vig-center', '50');
        await expect(protectedRadius).toHaveValue('35');
        await expect(widget.getByRole('combobox', {name: 'テスト画像'})).toHaveValue('grid');
        await expect.poll(() => picture('smooth')).toBe(initial);
      }
      await noOverflow();
      if (width === 390) await shot('vignetting-mobile');
    }
  });


  await check('exposure-srgb-ev-clipping-and-mobile', async () => {
    await go(route);
    await page.getByRole('link', {name: '線形光のEV・ハイライトクリップを操作して比較'}).click();
    await expect(page).toHaveURL(/\/reference\/visual-processing\/exposure\/?$/);
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({width, height: width === 1440 ? 1000 : 844});
      await go('/reference/visual-processing/exposure');
      const widget = page.locator('[data-vp-exposure="ready"]');
      await expect(widget).toBeVisible();
      const layout = await widget.evaluate((element) => {
        const previews = element.querySelector('.vp-exposure__previews');
        const controls = element.querySelector('.vp-exposure__controls');
        return {
          dom: Boolean(previews && controls &&
            (previews.compareDocumentPosition(controls) & Node.DOCUMENT_POSITION_FOLLOWING)),
          panels: element.querySelectorAll('[data-vp-exposure-preview]').length,
        };
      });
      assert.ok(layout.dom && layout.panels === 2,
        'Exposure preview-first panels: ' + width + ' ' + JSON.stringify(layout));
      await expect(widget).toHaveAttribute('data-vp-exposure-ev', '0');
      const picture = (kind) => widget.locator('[data-vp-exposure-preview="' + kind + '"] canvas')
        .evaluate((canvas) => canvas.toDataURL());
      const initial = await picture('original');
      await expect.poll(() => picture('output')).toBe(initial);
      await expect(widget.locator('.vp-exposure__readout')).toContainText('入力128 → 128');
      if (width === 1440) {
        const slider = widget.getByRole('slider', {name: '露出補正（EV）'});
        await slider.focus();
        await slider.press('End');
        await expect(widget).toHaveAttribute('data-vp-exposure-ev', '2');
        await expect(widget.locator('.vp-exposure__readout')).toContainText('入力224 → 255');
        await expect.poll(() => picture('output')).not.toBe(initial);
        await slider.press('Home');
        await expect(widget).toHaveAttribute('data-vp-exposure-ev', '-2');
        await widget.getByRole('combobox', {name: '元画像'}).selectOption('radial');
        await expect.poll(() => picture('original')).not.toBe(initial);
        await widget.getByRole('combobox', {name: '表示倍率'}).selectOption('4');
        await widget.getByRole('button', {name: '初期値に戻す'}).click();
        await expect(widget).toHaveAttribute('data-vp-exposure-ev', '0');
        await expect(widget.getByRole('combobox', {name: '元画像'})).toHaveValue('ramp');
        await expect(widget.getByRole('combobox', {name: '表示倍率'})).toHaveValue('1');
        await expect.poll(() => picture('output')).toBe(initial);
      }
      await noOverflow();
      if (width === 390) await shot('exposure-mobile');
    }
  });

  await check('binary-morphology-three-panel-radius-scenes-mobile', async () => {
    await go(route);
    await page.getByRole('link', {name: '二値マスクの膨張・収縮を操作して比較'}).click();
    await expect(page).toHaveURL(/\/reference\/visual-processing\/filters\/dilation-erosion\/?$/);
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({width, height: width === 1440 ? 1000 : 844});
      await go('/reference/visual-processing/filters/dilation-erosion');
      const widget = page.locator('[data-vp-morphology="ready"]');
      await expect(widget).toBeVisible();
      const layout = await widget.evaluate((element) => {
        const previews = element.querySelector('.vp-morph__previews');
        const controls = element.querySelector('.vp-morph__controls');
        return {
          dom: Boolean(previews && controls &&
            (previews.compareDocumentPosition(controls) & Node.DOCUMENT_POSITION_FOLLOWING)),
          visual: Boolean(previews && controls &&
            previews.getBoundingClientRect().bottom <= controls.getBoundingClientRect().top),
          panels: element.querySelectorAll('[data-vp-morph-preview]').length,
        };
      });
      assert.ok(layout.dom && layout.visual && layout.panels === 3,
        'Morphology three-panel preview-first layout: ' + width + ' ' + JSON.stringify(layout));
      await expect(widget).toHaveAttribute('data-vp-morph-radius', '3');
      const picture = (kind) => widget.locator('[data-vp-morph-preview="' + kind + '"] canvas')
        .evaluate((canvas) => canvas.toDataURL());
      const before = await picture('before');
      await expect.poll(() => picture('dilation')).not.toBe(before);
      await expect.poll(() => picture('erosion')).not.toBe(before);
      if (width === 1440) {
        const slider = widget.getByRole('slider', {name: '近傍の半径'});
        await slider.focus();
        await slider.press('Home');
        await expect(widget).toHaveAttribute('data-vp-morph-radius', '0');
        await expect.poll(() => picture('dilation')).toBe(before);
        await expect.poll(() => picture('erosion')).toBe(before);
        await slider.press('End');
        await expect(widget).toHaveAttribute('data-vp-morph-radius', '8');
        await expect.poll(() => picture('dilation')).not.toBe(before);
        await widget.getByRole('combobox', {name: 'テストマスク'}).selectOption('lines');
        await expect.poll(() => picture('before')).not.toBe(before);
        await widget.getByRole('button', {name: '初期値に戻す'}).click();
        await expect(widget).toHaveAttribute('data-vp-morph-radius', '3');
        await expect(widget.getByRole('combobox', {name: 'テストマスク'})).toHaveValue('shapes');
        await expect.poll(() => picture('before')).toBe(before);
      }
      await noOverflow();
      if (width === 390) await shot('morphology-mobile');
    }
  });


  await check('tone-mapping-clipping-reinhard-ev-and-mobile', async () => {
    await go(route);
    await page.getByRole('link', {name: 'クリップとReinhard圧縮を操作して比較'}).click();
    await expect(page).toHaveURL(/\/reference\/visual-processing\/tone-mapping\/?$/);
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({width, height: width === 1440 ? 1000 : 844});
      await go('/reference/visual-processing/tone-mapping');
      const widget = page.locator('[data-vp-tonemap="ready"]');
      await expect(widget).toBeVisible();
      await expect(widget).toHaveAttribute('data-vp-tonemap-ev', '0');
      const layout = await widget.evaluate((element) => {
        const previews = element.querySelector('.vp-tonemap__previews');
        const controls = element.querySelector('.vp-tonemap__controls');
        return {
          dom: Boolean(previews && controls &&
            (previews.compareDocumentPosition(controls) & Node.DOCUMENT_POSITION_FOLLOWING)),
          panels: element.querySelectorAll('[data-vp-tonemap-preview]').length,
        };
      });
      assert.ok(layout.dom && layout.panels === 2,
        'Tone Mapping two-panel preview-first layout: ' + width + ' ' + JSON.stringify(layout));
      const picture = (kind) => widget.locator('[data-vp-tonemap-preview="' + kind + '"] canvas')
        .evaluate((canvas) => canvas.toDataURL());
      const firstClip = await picture('clip');
      const firstCompressed = await picture('reinhard');
      await expect.poll(() => picture('reinhard')).not.toBe(firstClip);
      if (width === 1440) {
        const peak = widget.getByRole('combobox', {name: '入力ピーク'});
        await peak.selectOption('8');
        await expect(widget.locator('.vp-tonemap__intro')).toContainText('0〜8');
        await expect.poll(() => picture('clip')).not.toBe(firstClip);
        const ev = widget.getByRole('slider', {name: '圧縮前の露出補正（EV）'});
        await ev.focus();
        await ev.press('End');
        await expect(widget).toHaveAttribute('data-vp-tonemap-ev', '2');
        await expect.poll(() => picture('reinhard')).not.toBe(firstCompressed);
        await widget.getByRole('combobox', {name: '入力パターン'}).selectOption('radial');
        await expect.poll(() => picture('clip')).not.toBe(firstClip);
        await widget.getByRole('button', {name: '初期値に戻す'}).click();
        await expect(widget).toHaveAttribute('data-vp-tonemap-ev', '0');
        await expect(peak).toHaveValue('4');
        await expect(widget.getByRole('combobox', {name: '入力パターン'})).toHaveValue('ramp');
        await expect.poll(() => picture('clip')).toBe(firstClip);
        await expect.poll(() => picture('reinhard')).toBe(firstCompressed);
      }
      await noOverflow();
      if (width === 390) await shot('tone-mapping-mobile');
    }
  });


  await check('chromatic-aberration-three-panel-channel-shift-and-mobile', async () => {
    await go(route);
    await page.getByRole('link', {name: '放射方向と水平ずれを操作して比較'}).click();
    await expect(page).toHaveURL(/\/reference\/visual-processing\/optics\/chromatic-aberration\/?$/);
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({width, height: width === 1440 ? 1000 : 844});
      await go('/reference/visual-processing/optics/chromatic-aberration');
      const widget = page.locator('[data-vp-chromatic="ready"]');
      await expect(widget).toBeVisible();
      await expect(widget).toHaveAttribute('data-vp-ca-shift', '7');
      await expect(widget).toHaveAttribute('data-vp-ca-center', '50');
      const layout = await widget.evaluate((element) => {
        const previews = element.querySelector('.vp-ca__previews');
        const controls = element.querySelector('.vp-ca__controls');
        return {
          dom: Boolean(previews && controls &&
            (previews.compareDocumentPosition(controls) & Node.DOCUMENT_POSITION_FOLLOWING)),
          panels: element.querySelectorAll('[data-vp-ca-panel]').length,
        };
      });
      assert.ok(layout.dom && layout.panels === 3,
        'Chromatic aberration preview-first layout: ' + width + ' ' + JSON.stringify(layout));
      const picture = (kind) => widget.locator('[data-vp-ca-panel="' + kind + '"] canvas')
        .evaluate((canvas) => canvas.toDataURL());
      const initialBefore = await picture('before');
      const initialRadial = await picture('radial');
      await expect.poll(() => picture('radial')).not.toBe(initialBefore);
      await expect.poll(() => picture('horizontal')).not.toBe(initialBefore);
      if (width === 1440) {
        const shift = widget.getByRole('slider', {name: '各色チャンネルの最大ずれ量'});
        await shift.focus();
        await shift.press('Home');
        await expect(widget).toHaveAttribute('data-vp-ca-shift', '0');
        await expect.poll(() => picture('radial')).toBe(initialBefore);
        await expect.poll(() => picture('horizontal')).toBe(initialBefore);
        await shift.press('End');
        await expect(widget).toHaveAttribute('data-vp-ca-shift', '12');
        await expect.poll(() => picture('radial')).not.toBe(initialBefore);
        const horizontalAt12 = await picture('horizontal');
        const radialAtCenter50 = await picture('radial');
        const center = widget.getByRole('slider', {name: '放射方向の横中心'});
        await center.focus();
        await center.press('End');
        await expect(widget).toHaveAttribute('data-vp-ca-center', '80');
        await expect.poll(() => picture('radial')).not.toBe(radialAtCenter50);
        await expect.poll(() => picture('horizontal')).toBe(horizontalAt12);
        await widget.getByRole('combobox', {name: 'テスト画像'}).selectOption('bars');
        await expect.poll(() => picture('before')).not.toBe(initialBefore);
        await widget.getByRole('button', {name: '初期値に戻す'}).click();
        await expect(widget).toHaveAttribute('data-vp-ca-shift', '7');
        await expect(widget).toHaveAttribute('data-vp-ca-center', '50');
        await expect(widget.getByRole('combobox', {name: 'テスト画像'})).toHaveValue('grid');
        await expect.poll(() => picture('before')).toBe(initialBefore);
        await expect.poll(() => picture('radial')).toBe(initialRadial);
      }
      await noOverflow();
      if (width === 390) await shot('chromatic-aberration-mobile');
    }
  });


  await check('saturation-rgb-gray-axis-slider-and-mobile', async () => {
    await go(route);
    await page.getByRole('link', {name: 'RGBの灰色軸と彩度係数を操作して比較'}).click();
    await expect(page).toHaveURL(/\/reference\/visual-processing\/saturation\/?$/);
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({width, height: width === 1440 ? 1000 : 844});
      await go('/reference/visual-processing/saturation');
      await expect(page.locator('.theme-doc-markdown h1')).toHaveText('彩度（Saturation）とRGBの灰色軸');
      const widget = page.locator('[data-vp-saturation="ready"]');
      await expect(widget).toBeVisible();
      await expect(widget).toHaveAttribute('data-vp-saturation-amount', '1');
      const layout = await widget.evaluate((element) => {
        const previews = element.querySelector('.vp-sat__previews');
        const controls = element.querySelector('.vp-sat__controls');
        return {
          dom: Boolean(previews && controls &&
            (previews.compareDocumentPosition(controls) & Node.DOCUMENT_POSITION_FOLLOWING)),
          panels: element.querySelectorAll('[data-vp-saturation-preview]').length,
        };
      });
      assert.ok(layout.dom && layout.panels === 2,
        'Saturation preview-first two-panel layout: ' + width + ' ' + JSON.stringify(layout));
      const picture = (kind) => widget.locator('[data-vp-saturation-preview="' + kind + '"] canvas')
        .evaluate((canvas) => canvas.toDataURL());
      const original = await picture('source');
      await expect.poll(() => picture('processed')).toBe(original);
      if (width === 1440) {
        const slider = widget.getByRole('slider', {name: '彩度係数（0から2倍）'});
        await slider.focus();
        await slider.press('Home');
        await expect(widget).toHaveAttribute('data-vp-saturation-amount', '0');
        await expect.poll(() => picture('processed')).not.toBe(original);
        const isGray = await widget.locator('[data-vp-saturation-preview="processed"] canvas')
          .evaluate((canvas) => {
            const data = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
            for (let i = 0; i < data.length; i += 4) {
              if (data[i] !== data[i + 1] || data[i + 1] !== data[i + 2]) return false;
            }
            return true;
          });
        assert.ok(isGray, 'Saturation zero becomes grayscale');
        await slider.press('End');
        await expect(widget).toHaveAttribute('data-vp-saturation-amount', '2');
        await expect.poll(() => picture('processed')).not.toBe(original);
        await widget.getByRole('combobox', {name: '入力パターン'}).selectOption('patches');
        await expect.poll(() => picture('source')).not.toBe(original);
        await widget.getByRole('combobox', {name: '表示倍率'}).selectOption('4');
        await expect(widget.locator('[data-vp-saturation-preview="source"] canvas'))
          .toHaveAttribute('style', 'width: 400%;');
        await widget.getByRole('button', {name: '初期値に戻す'}).click();
        await expect(widget).toHaveAttribute('data-vp-saturation-amount', '1');
        await expect(widget.getByRole('combobox', {name: '入力パターン'})).toHaveValue('hues');
        await expect(widget.getByRole('combobox', {name: '表示倍率'})).toHaveValue('1');
        await expect.poll(() => picture('source')).toBe(original);
        await expect.poll(() => picture('processed')).toBe(original);
      }
      await noOverflow();
      if (width === 390) await shot('saturation-mobile');
    }
  });


  await check('lens-distortion-three-panel-controls-and-mobile', async () => {
    await go(route);
    await page.getByRole('link', {name: '樽型と糸巻き型を操作して比較'}).click();
    await expect(page).toHaveURL(/\/reference\/visual-processing\/optics\/lens-distortion\/?$/);
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({width, height: width === 1440 ? 1000 : 844});
      await go('/reference/visual-processing/optics/lens-distortion');
      await expect(page.locator('.theme-doc-markdown h1')).toHaveText('レンズ歪曲（Lens Distortion）');
      const widget = page.locator('[data-vp-lens-distortion="ready"]');
      await expect(widget).toBeVisible();
      await expect(widget).toHaveAttribute('data-vp-ld-strength', '0.22');
      await expect(widget).toHaveAttribute('data-vp-ld-center', '50');
      const layout = await widget.evaluate((element) => {
        const previews = element.querySelector('.vp-ld__previews');
        const controls = element.querySelector('.vp-ld__controls');
        return {
          previewFirst: Boolean(previews && controls &&
            (previews.compareDocumentPosition(controls) & Node.DOCUMENT_POSITION_FOLLOWING)),
          panels: element.querySelectorAll('[data-vp-ld-panel]').length,
        };
      });
      assert.ok(layout.previewFirst && layout.panels === 3,
        'Lens distortion must be preview-first with three panels: ' + width + ' ' + JSON.stringify(layout));
      const picture = (kind) => widget.locator('[data-vp-ld-panel="' + kind + '"] canvas')
        .evaluate((canvas) => canvas.toDataURL());
      const original = await picture('original');
      const initialBarrel = await picture('barrel');
      const initialPin = await picture('pincushion');
      assert.notEqual(initialBarrel, original, 'Barrel visibly changes geometry');
      assert.notEqual(initialPin, original, 'Pincushion visibly changes geometry');
      if (width === 1440) {
        const strength = widget.getByRole('slider', {name: '歪曲の強さ'});
        await strength.focus();
        await strength.press('Home');
        await expect(widget).toHaveAttribute('data-vp-ld-strength', '0');
        await expect.poll(() => picture('barrel')).toBe(original);
        await expect.poll(() => picture('pincushion')).toBe(original);
        await strength.press('End');
        await expect(widget).toHaveAttribute('data-vp-ld-strength', '0.3');
        await expect.poll(() => picture('barrel')).not.toBe(original);
        const barrelBeforeCenter = await picture('barrel');
        const center = widget.getByRole('slider', {name: '歪曲中心の横位置'});
        await center.focus();
        await center.press('End');
        await expect(widget).toHaveAttribute('data-vp-ld-center', '75');
        await expect.poll(() => picture('barrel')).not.toBe(barrelBeforeCenter);
        await widget.getByRole('combobox', {name: 'テスト画像'}).selectOption('frames');
        await expect.poll(() => picture('original')).not.toBe(original);
        await widget.getByRole('button', {name: '初期値に戻す'}).click();
        await expect(widget).toHaveAttribute('data-vp-ld-strength', '0.22');
        await expect(widget).toHaveAttribute('data-vp-ld-center', '50');
        await expect(widget.getByRole('combobox', {name: 'テスト画像'})).toHaveValue('grid');
        await expect.poll(() => picture('original')).toBe(original);
        await expect.poll(() => picture('barrel')).toBe(initialBarrel);
        await expect.poll(() => picture('pincushion')).toBe(initialPin);
      }
      await noOverflow();
      if (width === 390) await shot('lens-distortion-mobile');
    }
  });

  await check('hue-shift-two-panel-hsl-angle-gray-reset-and-mobile', async () => {
    await go(route);
    await page.getByRole('link', {name: 'HSL色相角度を操作して比較'}).click();
    await expect(page).toHaveURL(/\/reference\/visual-processing\/hue-shift\/?$/);
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({width, height: width === 1440 ? 1000 : 844});
      await go('/reference/visual-processing/hue-shift');
      await expect(page.locator('.theme-doc-markdown h1')).toHaveText('色相の変更（Hue Shift）');
      const widget = page.locator('[data-vp-hue-shift="ready"]');
      await expect(widget).toBeVisible();
      await expect(widget).toHaveAttribute('data-vp-hue-shift-angle', '0');
      const layout = await widget.evaluate((element) => {
        const previews = element.querySelector('.vp-hue__previews');
        const controls = element.querySelector('.vp-hue__controls');
        return {
          previewFirst: Boolean(previews && controls &&
            (previews.compareDocumentPosition(controls) & Node.DOCUMENT_POSITION_FOLLOWING)),
          panels: element.querySelectorAll('[data-vp-hue-preview]').length,
        };
      });
      assert.ok(layout.previewFirst && layout.panels === 2,
        'Hue Shift previews must precede controls: ' + width + ' ' + JSON.stringify(layout));
      const picture = (kind) => widget.locator('[data-vp-hue-preview="' + kind + '"] canvas')
        .evaluate((canvas) => canvas.toDataURL());
      const source = await picture('source');
      await expect.poll(() => picture('processed')).toBe(source);
      if (width === 1440) {
        const angle = widget.getByRole('slider', {name: '色相回転（マイナス180度からプラス180度）'});
        await angle.focus();
        await angle.press('End');
        await expect(widget).toHaveAttribute('data-vp-hue-shift-angle', '180');
        await expect.poll(() => picture('processed')).not.toBe(source);
        await widget.getByRole('combobox', {name: '入力パターン'}).selectOption('patches');
        await expect.poll(() => picture('source')).not.toBe(source);
        const grayscale = await widget.locator('[data-vp-hue-preview] canvas').evaluateAll(
          (canvases) => canvases.map((canvas) => {
            const data = canvas.getContext('2d').getImageData(355, 80, 1, 1).data;
            return [data[0], data[1], data[2]];
          }));
        assert.deepEqual(grayscale, [[128, 128, 128], [128, 128, 128]],
          'Hue rotation leaves neutral patch unchanged');
        await widget.getByRole('combobox', {name: '表示倍率'}).selectOption('4');
        await expect(widget.locator('[data-vp-hue-preview="source"] canvas'))
          .toHaveAttribute('style', 'width: 400%;');
        await widget.getByRole('button', {name: '初期値に戻す'}).click();
        await expect(widget).toHaveAttribute('data-vp-hue-shift-angle', '0');
        await expect(widget.getByRole('combobox', {name: '入力パターン'})).toHaveValue('hues');
        await expect(widget.getByRole('combobox', {name: '表示倍率'})).toHaveValue('1');
        await expect.poll(() => picture('source')).toBe(source);
        await expect.poll(() => picture('processed')).toBe(source);
      }
      await noOverflow();
      if (width === 390) await shot('hue-shift-mobile');
    }
  });

  await check('high-pass-signed-detail-recomposition-and-mobile', async () => {
    await go(route);
    await page.getByRole('link', {name: '差分と再合成を操作して比較'}).click();
    await expect(page).toHaveURL(/\/reference\/visual-processing\/filters\/high-pass-filter\/?$/);
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({width, height: width === 1440 ? 1000 : 844});
      await go('/reference/visual-processing/filters/high-pass-filter');
      await expect(page.locator('.theme-doc-markdown h1')).toHaveText('ハイパスフィルタ（High-pass Filter）');
      const widget = page.locator('[data-vp-high-pass="ready"]');
      await expect(widget).toBeVisible();
      await expect(widget).toHaveAttribute('data-vp-hp-sigma', '3');
      await expect(widget).toHaveAttribute('data-vp-hp-gain', '2');
      const layout = await widget.evaluate((element) => {
        const previews = element.querySelector('.vp-hp__previews');
        const controls = element.querySelector('.vp-hp__controls');
        return {
          previewFirst: Boolean(previews && controls &&
            (previews.compareDocumentPosition(controls) & Node.DOCUMENT_POSITION_FOLLOWING)),
          panels: element.querySelectorAll('[data-vp-hp-preview]').length,
        };
      });
      assert.ok(layout.previewFirst && layout.panels === 3,
        'High-pass previews must precede controls: ' + width + ' ' + JSON.stringify(layout));
      const picture = (kind) => widget.locator('[data-vp-hp-preview="' + kind + '"] canvas')
        .evaluate((canvas) => canvas.toDataURL());
      const original = await picture('before');
      const initialDetail = await picture('detail');
      const initialOutput = await picture('recomposed');
      assert.notEqual(initialDetail, original, 'Signed detail visualization differs from input');
      if (width === 1440) {
        const gain = widget.getByRole('slider', {name: '再合成・差分表示の倍率'});
        await gain.focus();
        await gain.press('Home');
        await expect(widget).toHaveAttribute('data-vp-hp-gain', '0');
        const neutral = await widget.locator('[data-vp-hp-preview="detail"] canvas')
          .evaluate((canvas) => {
            const data = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
            for (let i = 0; i < data.length; i += 4) {
              if (data[i] !== 128 || data[i + 1] !== 128 || data[i + 2] !== 128) return false;
            }
            return true;
          });
        assert.ok(neutral, 'Zero gain produces neutral 128 high-pass preview');
        for (let step = 0; step < 4; step++) await gain.press('ArrowRight');
        await expect(widget).toHaveAttribute('data-vp-hp-gain', '1');
        await expect.poll(() => picture('recomposed')).toBe(original);
        await gain.press('End');
        await expect(widget).toHaveAttribute('data-vp-hp-gain', '3');
        const sigma = widget.getByRole('slider', {name: 'ぼかしの標準偏差'});
        await sigma.focus();
        await sigma.press('Home');
        await expect(widget).toHaveAttribute('data-vp-hp-sigma', '0.5');
        await expect.poll(() => picture('detail')).not.toBe(initialDetail);
        await widget.getByRole('combobox', {name: 'テスト画像'}).selectOption('texture');
        await expect.poll(() => picture('before')).not.toBe(original);
        await widget.getByRole('button', {name: '初期値に戻す'}).click();
        await expect(widget).toHaveAttribute('data-vp-hp-sigma', '3');
        await expect(widget).toHaveAttribute('data-vp-hp-gain', '2');
        await expect(widget.getByRole('combobox', {name: 'テスト画像'})).toHaveValue('edges');
        await expect.poll(() => picture('before')).toBe(original);
        await expect.poll(() => picture('detail')).toBe(initialDetail);
        await expect.poll(() => picture('recomposed')).toBe(initialOutput);
      }
      await noOverflow();
      if (width === 390) await shot('high-pass-mobile');
    }
  });

  await check('selective-color-preview-controls-and-mobile', async () => {
    await go(route);
    await page.getByRole('link', {name: '色相マスクと彩度を操作して比較'}).click();
    await expect(page).toHaveURL(new RegExp('/reference/visual-processing/selective-color/?$'));
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({width, height: width === 1440 ? 1000 : 844});
      await go('/reference/visual-processing/selective-color');
      await expect(page.locator('.theme-doc-markdown h1')).toHaveText('特定色の調整（Selective Color）');
      const widget = page.locator('[data-vp-selective-color="ready"]');
      await expect(widget).toBeVisible();
      const layout = await widget.evaluate((element) => {
        const previews = element.querySelector('.vp-selective__previews');
        const controls = element.querySelector('.vp-selective__controls');
        return {
          dom: Boolean(previews && controls &&
            (previews.compareDocumentPosition(controls) & Node.DOCUMENT_POSITION_FOLLOWING)),
          visual: Boolean(previews && controls &&
            previews.getBoundingClientRect().bottom <= controls.getBoundingClientRect().top),
          panels: element.querySelectorAll('[data-vp-selective-preview]').length,
        };
      });
      assert.ok(layout.dom && layout.visual && layout.panels === 3,
        'Selective Color preview-first three-panel layout: ' + width + ' ' + JSON.stringify(layout));
      const picture = kind => widget.locator('[data-vp-selective-preview="' + kind + '"] canvas')
        .evaluate(canvas => canvas.toDataURL());
      if (width === 1440) {
        const originalOutput = await picture('output');
        const originalMask = await picture('mask');
        const originalSource = await picture('source');
        const amount = widget.getByRole('slider', {name: '選択範囲の彩度係数'});
        await amount.focus();
        await amount.press('Home');
        await expect(amount).toHaveValue('0');
        await expect.poll(() => picture('output')).not.toBe(originalOutput);
        await expect.poll(() => picture('mask')).toBe(originalMask);
        const center = widget.getByRole('slider', {name: '色相中心'});
        await center.focus();
        await center.press('End');
        await expect(widget).toHaveAttribute('data-vp-selective-center', '330');
        await expect.poll(() => picture('mask')).not.toBe(originalMask);
        await widget.getByRole('combobox', {name: '入力パターン'}).selectOption('spectrum');
        await expect.poll(() => picture('source')).not.toBe(originalSource);
        await widget.getByRole('combobox', {name: '表示倍率'}).selectOption('2');
        await widget.getByRole('button', {name: '初期値に戻す'}).click();
        await expect(widget).toHaveAttribute('data-vp-selective-center', '0');
        await expect(amount).toHaveValue('1.5');
        await expect(widget.getByRole('combobox', {name: '入力パターン'})).toHaveValue('patches');
        await expect(widget.getByRole('combobox', {name: '表示倍率'})).toHaveValue('1');
        await expect.poll(() => picture('source')).toBe(originalSource);
        await expect.poll(() => picture('mask')).toBe(originalMask);
        await expect.poll(() => picture('output')).toBe(originalOutput);
      }
      await noOverflow();
      if (width === 390) await shot('selective-color-mobile');
    }
  });


  await check('halation-preview-controls-and-mobile', async () => {
    await go(route);
    await page.getByRole('link', {name: '赤いにじみを操作して比較'}).click();
    await expect(page).toHaveURL(/\/reference\/visual-processing\/optics\/halation\/?$/);
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({width, height: width === 1440 ? 1000 : 844});
      await go('/reference/visual-processing/optics/halation');
      await expect(page.locator('.theme-doc-markdown h1')).toHaveText('ハレーション（Film Halation）');
      const widget = page.locator('[data-vp-halation="ready"]');
      await expect(widget).toBeVisible();
      const layout = await widget.evaluate(element => {
        const previews = element.querySelector('.vp-halation__previews');
        const controls = element.querySelector('.vp-halation__controls');
        return {
          panels: element.querySelectorAll('[data-vp-halation-preview]').length,
          dom: Boolean(previews && controls &&
            (previews.compareDocumentPosition(controls) & Node.DOCUMENT_POSITION_FOLLOWING)),
          visual: Boolean(previews && controls &&
            previews.getBoundingClientRect().bottom <= controls.getBoundingClientRect().top),
        };
      });
      assert.ok(layout.dom && layout.visual && layout.panels === 3,
        'Halation preview-first three-panel layout: ' + width + ' ' + JSON.stringify(layout));
      const picture = kind => widget.locator('[data-vp-halation-preview="' + kind + '"] canvas')
        .evaluate(canvas => canvas.toDataURL());
      const original = await picture('before');
      const initialSpread = await picture('spread');
      const initialOutput = await picture('after');
      if (width === 1440) {
        const gain = widget.getByRole('slider', {name: '合成強度'});
        await gain.focus();
        await gain.press('Home');
        await expect(widget).toHaveAttribute('data-vp-halation-gain', '0');
        await expect.poll(() => picture('after')).toBe(original);
        await gain.press('End');
        await expect(widget).toHaveAttribute('data-vp-halation-gain', '2.5');
        await expect.poll(() => picture('after')).not.toBe(original);
        const redness = widget.getByRole('slider', {name: '赤み'});
        await redness.focus();
        await redness.press('Home');
        await expect(redness).toHaveValue('0');
        await expect.poll(() => picture('spread')).not.toBe(initialSpread);
        const sigma = widget.getByRole('slider', {name: 'ぼかし幅'});
        await sigma.focus();
        await sigma.press('Home');
        await expect(widget).toHaveAttribute('data-vp-halation-sigma', '0');
        const threshold = widget.getByRole('slider', {name: '明部閾値'});
        await threshold.focus();
        await threshold.press('End');
        await expect(threshold).toHaveValue('245');
        await widget.getByRole('combobox', {name: 'テスト画像'}).selectOption('sign');
        await expect.poll(() => picture('before')).not.toBe(original);
        await widget.getByRole('button', {name: '初期値に戻す'}).click();
        await expect(widget).toHaveAttribute('data-vp-halation-sigma', '5');
        await expect(widget).toHaveAttribute('data-vp-halation-gain', '1.5');
        await expect(threshold).toHaveValue('185');
        await expect(redness).toHaveValue('1');
        await expect(widget.getByRole('combobox', {name: 'テスト画像'})).toHaveValue('lamps');
        await expect.poll(() => picture('before')).toBe(original);
        await expect.poll(() => picture('spread')).toBe(initialSpread);
        await expect.poll(() => picture('after')).toBe(initialOutput);
      }
      await noOverflow();
      if (width === 390) await shot('halation-mobile');
    }
  });

  await check('white-balance-gains-and-mobile', async () => {
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({width, height: width === 1440 ? 1000 : 844});
      await go('/reference/visual-processing/white-balance');
      await expect(page.locator('.theme-doc-markdown h1')).toHaveText('ホワイトバランス（White Balance）');
      const widget = page.locator('[data-vp-white-balance="ready"]');
      await expect(widget).toBeVisible();
      const layout = await widget.evaluate(element => {
        const previews = element.querySelector('.vp-wb__previews');
        const readout = element.querySelector('.vp-wb__readout');
        const controls = element.querySelector('.vp-wb__controls');
        return {
          count: element.querySelectorAll('[data-vp-white-balance-preview]').length,
          dom: Boolean(previews && controls && readout &&
            (previews.compareDocumentPosition(readout) & Node.DOCUMENT_POSITION_FOLLOWING) &&
            (readout.compareDocumentPosition(controls) & Node.DOCUMENT_POSITION_FOLLOWING)),
          visual: Boolean(previews && controls &&
            previews.getBoundingClientRect().bottom <= controls.getBoundingClientRect().top),
        };
      });
      assert.ok(layout.count === 2 && layout.dom && layout.visual,
        'White Balance preview-first two-panel layout: ' + width + ' ' + JSON.stringify(layout));
      const picture = kind => widget.locator('[data-vp-white-balance-preview="' + kind + '"] canvas')
        .evaluate(canvas => canvas.toDataURL());
      const sourceImage = await picture('source');
      await expect.poll(() => picture('output')).toBe(sourceImage);
      await widget.getByRole('button', {name: 'テスト色かぶりを打ち消す'}).click();
      await expect(widget).toHaveAttribute('data-vp-white-balance-temperature', '-40');
      await expect(widget).toHaveAttribute('data-vp-white-balance-tint', '20');
      await expect.poll(() => picture('output')).not.toBe(sourceImage);
      if (width === 1440) {
        const warm = widget.getByRole('slider', {name: '寒色と暖色のゲイン軸（ケルビンではありません）'});
        await warm.focus();
        await warm.press('End');
        await expect(widget).toHaveAttribute('data-vp-white-balance-temperature', '100');
        await widget.getByRole('combobox', {name: '入力パターン'}).selectOption('neutral');
        await expect.poll(() => picture('source')).not.toBe(sourceImage);
        await widget.getByRole('combobox', {name: '表示倍率'}).selectOption('4');
        await expect(widget.locator('[data-vp-white-balance-preview="output"] canvas'))
          .toHaveAttribute('style', /width: 400%/);
      }
      await widget.getByRole('button', {name: '初期値に戻す'}).click();
      await expect(widget).toHaveAttribute('data-vp-white-balance-temperature', '0');
      await expect(widget).toHaveAttribute('data-vp-white-balance-tint', '0');
      await expect(widget.getByRole('combobox', {name: '入力パターン'})).toHaveValue('warm');
      await expect(widget.getByRole('combobox', {name: '表示倍率'})).toHaveValue('1');
      await expect.poll(() => picture('output')).toBe(sourceImage);
      await noOverflow();
      if (width === 390) await shot('white-balance-mobile');
    }
  });


  await check('bit-depth-codes-preview-and-mobile', async () => {
    await go(route);
    await page.getByRole('link', {name: '整数コードと段階数を操作して比較'}).click();
    await expect(page).toHaveURL(/\/reference\/visual-processing\/bit-depth\/?$/);
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({width, height: width === 1440 ? 1000 : 844});
      await go('/reference/visual-processing/bit-depth');
      await expect(page.locator('.theme-doc-markdown h1')).toHaveText('ビット深度（Bit Depth）');
      const widget = page.locator('[data-vp-bit-depth="ready"]');
      await expect(widget).toBeVisible();
      const order = await widget.evaluate(element => {
        const previews = element.querySelector('.vp-bit-depth__previews');
        const controls = element.querySelector('.vp-bit-depth__controls');
        return {
          panels: element.querySelectorAll('[data-vp-bit-depth-preview]').length,
          dom: Boolean(previews && controls &&
            (previews.compareDocumentPosition(controls) & Node.DOCUMENT_POSITION_FOLLOWING)),
          visual: Boolean(previews && controls &&
            previews.getBoundingClientRect().bottom <= controls.getBoundingClientRect().top),
        };
      });
      assert.ok(order.panels === 2 && order.dom && order.visual,
        'Bit depth preview-first layout: ' + width + ' ' + JSON.stringify(order));
      const bits = widget.getByRole('combobox', {name: 'ビット深度'});
      const readouts = widget.locator('.vp-bit-depth__readouts');
      const processed = widget.locator('[data-vp-bit-depth-preview="output"] canvas');
      const original = await processed.evaluate(canvas => canvas.toDataURL());
      await expect(widget).toHaveAttribute('data-vp-bit-depth-bits', '4');
      await expect(readouts).toContainText('16 段階');
      await expect(readouts).toContainText('50.0% → 8 / 15');
      await bits.selectOption('8');
      await expect(readouts).toContainText('256 段階');
      await expect(readouts).toContainText('50.0% → 128 / 255');
      await expect.poll(() => processed.evaluate(canvas => canvas.toDataURL())).not.toBe(original);
      await bits.selectOption('10');
      await expect(readouts).toContainText('1,024 段階');
      await expect(readouts).toContainText('50.0% → 512 / 1023');
      await bits.selectOption('12');
      await expect(readouts).toContainText('4,096 段階');
      await expect(readouts).toContainText('50.0% → 2048 / 4095');
      if (width === 1440) {
        const sample = widget.getByRole('slider', {name: '入力標本値'});
        await sample.focus();
        await sample.press('End');
        await expect(readouts).toContainText('100.0% → 4095 / 4095');
        await sample.press('Home');
        await expect(readouts).toContainText('0.0% → 0 / 4095');
        const before = await widget.locator('[data-vp-bit-depth-preview="input"] canvas')
          .evaluate(canvas => canvas.toDataURL());
        await widget.getByRole('combobox', {name: '入力パターン'}).selectOption('radial');
        await expect.poll(() => widget.locator('[data-vp-bit-depth-preview="input"] canvas')
          .evaluate(canvas => canvas.toDataURL())).not.toBe(before);
        await widget.getByRole('combobox', {name: '表示倍率'}).selectOption('4');
        await expect(widget.getByRole('combobox', {name: '表示倍率'})).toHaveValue('4');
      }
      await widget.getByRole('button', {name: '初期値に戻す'}).click();
      await expect(bits).toHaveValue('4');
      await expect(readouts).toContainText('50.0% → 8 / 15');
      await expect(widget.getByRole('combobox', {name: '入力パターン'})).toHaveValue('ramp');
      await expect(widget.getByRole('combobox', {name: '表示倍率'})).toHaveValue('1');
      await noOverflow();
    }
  });

  await check('emboss-preview-controls-and-mobile', async () => {
    await go(route);
    await page.getByRole('link', {name: '方向と距離を操作して比較'}).click();
    await expect(page).toHaveURL(/\/reference\/visual-processing\/filters\/emboss\/?$/);
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({width, height: width === 1440 ? 1000 : 844});
      await go('/reference/visual-processing/filters/emboss');
      await expect(page.locator('.theme-doc-markdown h1')).toHaveText('エンボス（Emboss）');
      const widget = page.locator('[data-vp-emboss="ready"]');
      await expect(widget).toBeVisible();
      const layout = await widget.evaluate(element => {
        const previews = element.querySelector('.vp-emboss__previews');
        const controls = element.querySelector('.vp-emboss__controls');
        return {
          count: element.querySelectorAll('[data-vp-emboss-preview]').length,
          dom: Boolean(previews && controls &&
            (previews.compareDocumentPosition(controls) & Node.DOCUMENT_POSITION_FOLLOWING)),
          visual: Boolean(previews && controls &&
            previews.getBoundingClientRect().bottom <= controls.getBoundingClientRect().top),
        };
      });
      assert.ok(layout.count === 3 && layout.dom && layout.visual,
        'Emboss preview-first three-panel layout: ' + width + ' ' + JSON.stringify(layout));
      const picture = kind => widget.locator('[data-vp-emboss-preview="' + kind + '"] canvas')
        .evaluate(canvas => canvas.toDataURL());
      const originalBefore = await picture('before');
      const originalRelief = await picture('relief');
      const originalAfter = await picture('after');
      const direction = widget.getByRole('combobox', {name: '差分方向'});
      await direction.selectOption('left');
      await expect.poll(() => picture('relief')).not.toBe(originalRelief);
      await direction.selectOption('right');
      await expect.poll(() => picture('relief')).toBe(originalRelief);
      if (width === 1440) {
        const radius = widget.getByRole('slider', {name: '差分の距離'});
        await radius.focus();
        await radius.press('End');
        await expect(radius).toHaveValue('5');
        await expect.poll(() => picture('relief')).not.toBe(originalRelief);
        const strength = widget.getByRole('slider', {name: '陰影強度'});
        const texture = widget.getByRole('slider', {name: '元の階調'});
        await strength.focus();
        await strength.press('Home');
        await texture.focus();
        await texture.press('Home');
        await expect(strength).toHaveValue('0');
        await expect(texture).toHaveValue('0');
        await expect.poll(() => widget.locator('[data-vp-emboss-preview="after"] canvas')
          .evaluate(canvas => {
            const bytes = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
            return bytes.every((value, index) => index % 4 === 3 ? value === 255 : value === 128);
          })).toBe(true);
      }
      await widget.getByRole('combobox', {name: 'テスト画像'}).selectOption('rings');
      await expect.poll(() => picture('before')).not.toBe(originalBefore);
      await widget.getByRole('button', {name: '初期値に戻す'}).click();
      await expect(direction).toHaveValue('right');
      await expect(widget.getByRole('slider', {name: '差分の距離'})).toHaveValue('2');
      await expect(widget.getByRole('slider', {name: '陰影強度'})).toHaveValue('1.5');
      await expect(widget.getByRole('slider', {name: '元の階調'})).toHaveValue('0.15');
      await expect(widget.getByRole('combobox', {name: 'テスト画像'})).toHaveValue('blocks');
      await expect.poll(() => picture('before')).toBe(originalBefore);
      await expect.poll(() => picture('after')).toBe(originalAfter);
      await noOverflow();
      if (width === 390) await shot('emboss-mobile');
    }
  });


  await check('kernel-sharpening-preview-controls-and-mobile', async () => {
    await go(route);
    await page.getByRole('link', {name: '4/8近傍と強さを操作して比較'}).click();
    await expect(page).toHaveURL(new RegExp('/reference/visual-processing/filters/sharpening/?$'));
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({width, height: width === 1440 ? 1000 : 844});
      await go('/reference/visual-processing/filters/sharpening');
      await expect(page.locator('.theme-doc-markdown h1')).toHaveText('シャープニング（Sharpening）');
      const widget = page.locator('[data-vp-ksharpen="ready"]');
      await expect(widget).toBeVisible();
      const layout = await widget.evaluate(element => {
        const previews = element.querySelector('.vp-ksharpen__previews');
        const controls = element.querySelector('.vp-ksharpen__controls');
        return {
          panels: element.querySelectorAll('[data-vp-ksharpen-preview]').length,
          dom: Boolean(previews && controls &&
            (previews.compareDocumentPosition(controls) & Node.DOCUMENT_POSITION_FOLLOWING)),
          visual: Boolean(previews && controls &&
            previews.getBoundingClientRect().bottom <= controls.getBoundingClientRect().top),
        };
      });
      assert.ok(layout.panels === 3 && layout.dom && layout.visual,
        'Kernel sharpening preview-first three-panel layout: ' + width + ' ' + JSON.stringify(layout));
      const picture = kind => widget.locator('[data-vp-ksharpen-preview="' + kind + '"] canvas')
        .evaluate(canvas => canvas.toDataURL());
      const before = await picture('before');
      const detail = await picture('detail');
      const after = await picture('after');
      assert.notEqual(after, before, 'Initial sharpening must visibly change pixels');
      const gain = widget.getByRole('slider', {name: '差分を加える強さ'});
      const neighbors = widget.getByRole('combobox', {name: '比較する近傍'});
      const pattern = widget.getByRole('combobox', {name: 'テスト画像'});
      await gain.focus();
      await gain.press('Home');
      await expect(gain).toHaveValue('0');
      await expect.poll(() => picture('after')).toBe(before);
      await expect(widget.locator('.vp-ksharpen__status')).toContainText('0 /');
      await neighbors.selectOption('square');
      await expect.poll(() => picture('detail')).not.toBe(detail);
      if (width === 1440) {
        await gain.focus();
        await gain.press('End');
        await expect(gain).toHaveValue('3');
        await expect.poll(() => picture('after')).not.toBe(before);
      }
      await pattern.selectOption('texture');
      await expect.poll(() => picture('before')).not.toBe(before);
      await widget.getByRole('button', {name: '初期値に戻す'}).click();
      await expect(neighbors).toHaveValue('cross');
      await expect(pattern).toHaveValue('edges');
      await expect(gain).toHaveValue('1');
      await expect.poll(() => picture('before')).toBe(before);
      await expect.poll(() => picture('detail')).toBe(detail);
      await expect.poll(() => picture('after')).toBe(after);
      await noOverflow();
      if (width === 390) await shot('kernel-sharpening-mobile');
    }
  });

  await check('chroma-subsampling-format-and-mobile', async () => {
    await go(route);
    await page.getByRole('link', {name: '縦横の色差標本を操作して比較'}).click();
    await expect(page).toHaveURL(/\/reference\/visual-processing\/chroma-subsampling\/?$/);
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({width, height: width === 1440 ? 1000 : 844});
      await go('/reference/visual-processing/chroma-subsampling');
      await expect(page.locator('.theme-doc-markdown h1'))
        .toContainText('クロマサブサンプリング');
      const widget = page.locator('[data-vp-chroma="ready"]');
      await expect(widget).toBeVisible();
      const layout = await widget.evaluate(element => {
        const previews = element.querySelector('.vp-chroma__previews');
        const controls = element.querySelector('.vp-chroma__controls');
        return {
          panels: element.querySelectorAll('[data-vp-chroma-preview]').length,
          dom: Boolean(previews && controls &&
            (previews.compareDocumentPosition(controls) & Node.DOCUMENT_POSITION_FOLLOWING)),
          visual: Boolean(previews && controls &&
            previews.getBoundingClientRect().bottom <= controls.getBoundingClientRect().top),
        };
      });
      assert.ok(layout.panels === 2 && layout.dom && layout.visual,
        'Chroma preview-first layout: ' + width + ' ' + JSON.stringify(layout));
      const picture = name => widget.locator('[data-vp-chroma-preview="' + name + '"] canvas')
        .evaluate(canvas => canvas.toDataURL());
      const original = await picture('before');
      const initial = await picture('after');
      assert.notEqual(initial, original, '4:2:0 must change 1-pixel chroma columns');
      const format = widget.getByRole('combobox', {name: '色差形式'});
      const pattern = widget.getByRole('combobox', {name: '入力パターン'});
      const zoom = widget.getByRole('combobox', {name: '表示倍率'});
      await expect(format).toHaveValue('420');
      await expect(widget.locator('.vp-chroma__stats')).toContainText('4,608');
      await format.selectOption('444');
      await expect(widget).toHaveAttribute('data-vp-chroma-format', '444');
      await expect.poll(() => picture('after')).toBe(original);
      await format.selectOption('422');
      await expect(widget.locator('.vp-chroma__stats')).toContainText('9,216');
      await expect.poll(() => picture('after')).not.toBe(original);
      await pattern.selectOption('rows');
      await expect.poll(() => picture('before')).not.toBe(original);
      await format.selectOption('420');
      await expect.poll(() => picture('after')).not.toBe(await picture('before'));
      await zoom.selectOption('4');
      await expect(zoom).toHaveValue('4');
      const scrollable = await widget.locator('[data-vp-chroma-preview="after"] .vp-chroma__viewport')
        .evaluate(el => el.scrollWidth > el.clientWidth);
      assert.ok(scrollable, '400% preview remains horizontally inspectable at ' + width);
      await widget.getByRole('button', {name: '初期値に戻す'}).click();
      await expect(format).toHaveValue('420');
      await expect(pattern).toHaveValue('columns');
      await expect(zoom).toHaveValue('2');
      await expect.poll(() => picture('before')).toBe(original);
      await expect.poll(() => picture('after')).toBe(initial);
      await noOverflow();
      if (width === 390) await shot('chroma-subsampling-mobile');
    }
  });

  await check('lens-ghost-preview-controls-and-mobile', async () => {
    await go(route);
    await page.getByRole('link', {name: '位置と形を操作して比較'}).click();
    await expect(page).toHaveURL(/\/reference\/visual-processing\/optics\/lens-ghosting\/?$/);
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({width, height: width === 1440 ? 1000 : 844});
      await go('/reference/visual-processing/optics/lens-ghosting');
      await expect(page.locator('.theme-doc-markdown h1')).toContainText('ゴースト');
      const widget = page.locator('[data-vp-lens-ghost="ready"]');
      await expect(widget).toBeVisible();
      const layout = await widget.evaluate(section => {
        const previews = section.querySelector('.vp-lg__previews');
        const controls = section.querySelector('.vp-lg__controls');
        return {
          panels: section.querySelectorAll('[data-vp-lg-panel] canvas').length,
          dom: Boolean(previews && controls &&
            (previews.compareDocumentPosition(controls) & Node.DOCUMENT_POSITION_FOLLOWING)),
          visual: Boolean(previews && controls &&
            previews.getBoundingClientRect().bottom <= controls.getBoundingClientRect().top),
        };
      });
      assert.ok(layout.panels === 3 && layout.dom && layout.visual,
        'Lens ghost preview-first layout at ' + width + ': ' + JSON.stringify(layout));
      const picture = mode => widget.locator('[data-vp-lg-panel="' + mode + '"] canvas')
        .evaluate(canvas => canvas.toDataURL());
      const originalGhost = await picture('ghosts');
      const originalComposite = await picture('combined');
      const x = widget.getByRole('slider', {name: '光源の横位置'});
      await x.focus();
      await x.press('Home');
      await expect(x).toHaveValue('15');
      await expect.poll(() => picture('ghosts')).not.toBe(originalGhost);
      const leftGhost = await picture('ghosts');
      await x.press('End');
      await expect(x).toHaveValue('85');
      await expect.poll(() => picture('ghosts')).not.toBe(leftGhost);
      const strength = widget.getByRole('slider', {name: 'ゴーストの強さ'});
      await strength.focus();
      await strength.press('Home');
      await expect(widget).toHaveAttribute('data-vp-lg-strength', '0');
      const withoutGhost = await picture('combined');
      await expect.poll(() => picture('combined')).toBe(withoutGhost);
      await strength.press('End');
      await expect(strength).toHaveValue('1');
      await expect.poll(() => picture('combined')).not.toBe(withoutGhost);
      const count = widget.getByRole('slider', {name: '反射像の数'});
      await count.focus();
      await count.press('End');
      await expect(widget).toHaveAttribute('data-vp-lg-count', '5');
      const manyGhosts = await picture('ghosts');
      const aperture = widget.getByRole('combobox', {name: '絞り形状'});
      await aperture.selectOption('8');
      await expect.poll(() => picture('ghosts')).not.toBe(manyGhosts);
      await widget.getByRole('button', {name: '初期値に戻す'}).click();
      await expect(x).toHaveValue('74');
      await expect(strength).toHaveValue('0.65');
      await expect(count).toHaveValue('3');
      await expect(aperture).toHaveValue('6');
      await expect.poll(() => picture('ghosts')).toBe(originalGhost);
      await expect.poll(() => picture('combined')).toBe(originalComposite);
      await noOverflow();
      if (width === 390) await shot('lens-ghost-mobile');
    }
  });



  await check('lut-interpolation-and-mobile', async () => {
    await go(route);
    await page.getByRole('link', {name: '記録点と補間を操作して比較'}).click();
    await expect(page).toHaveURL(/\/reference\/visual-processing\/lut\/?$/);
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({width, height: width === 1440 ? 1000 : 844});
      await go('/reference/visual-processing/lut');
      await expect(page.locator('.theme-doc-markdown h1')).toContainText('LUT');
      const widget = page.locator('[data-vp-lut="ready"]');
      await expect(widget).toBeVisible();
      const layout = await widget.evaluate(element => {
        const previews = element.querySelector('.vp-lut__previews');
        const controls = element.querySelector('.vp-lut__controls');
        return {
          panels: element.querySelectorAll('[data-vp-lut-preview] canvas').length,
          dom: Boolean(previews && controls &&
            (previews.compareDocumentPosition(controls) & Node.DOCUMENT_POSITION_FOLLOWING)),
          visual: Boolean(previews && controls &&
            previews.getBoundingClientRect().bottom <= controls.getBoundingClientRect().top),
        };
      });
      assert.ok(layout.panels === 3 && layout.dom && layout.visual,
        'LUT preview-first layout at ' + width + ': ' + JSON.stringify(layout));
      const picture = kind => widget.locator('[data-vp-lut-preview="' + kind + '"] canvas')
        .evaluate(canvas => canvas.toDataURL());
      const initialInput = await picture('input');
      const initialIdeal = await picture('ideal');
      const initialLookup = await picture('lookup');
      assert.notEqual(initialLookup, initialIdeal, 'Initial 4-point nearest LUT must differ');
      const curve = widget.getByRole('combobox', {name: '変換カーブ'});
      const points = widget.getByRole('combobox', {name: 'LUTの記録点数'});
      const method = widget.getByRole('combobox', {name: '点の間の補間'});
      const pattern = widget.getByRole('combobox', {name: '入力パターン'});
      const zoom = widget.getByRole('combobox', {name: '表示倍率'});
      const error = widget.locator('[data-vp-lut-error]');
      await expect(points).toHaveValue('4');
      await expect(method).toHaveValue('nearest');
      const initialError = await error.textContent();
      await method.selectOption('linear');
      await expect(widget).toHaveAttribute('data-vp-lut-interpolation', 'linear');
      await expect.poll(() => picture('lookup')).not.toBe(initialLookup);
      await expect(error).not.toHaveText(initialError);
      const linear4 = await picture('lookup');
      await points.selectOption('32');
      await expect(widget).toHaveAttribute('data-vp-lut-entries', '32');
      await expect.poll(() => picture('lookup')).not.toBe(linear4);
      await expect(widget.locator('.vp-lut__readout tbody tr')).toHaveCount(5);
      await pattern.selectOption('rgb');
      await expect.poll(() => picture('input')).not.toBe(initialInput);
      await zoom.selectOption('4');
      await expect(zoom).toHaveValue('4');
      await expect.poll(() => widget.locator('[data-vp-lut-preview="lookup"] .vp-lut__viewport')
        .evaluate(el => el.scrollWidth > el.clientWidth),
        {message: '400% LUT preview remains horizontally inspectable at ' + width}).toBe(true);
      if (width === 1440) {
        // Identity preserves the current RGB pattern, not the initial gray pattern.
        const currentInput = await picture('input');
        await curve.selectOption('identity');
        await expect.poll(() => picture('ideal')).toBe(currentInput);
        await curve.selectOption('power');
      }
      await widget.getByRole('button', {name: '初期値に戻す'}).click();
      await expect(curve).toHaveValue('power');
      await expect(points).toHaveValue('4');
      await expect(method).toHaveValue('nearest');
      await expect(pattern).toHaveValue('gray');
      await expect(zoom).toHaveValue('1');
      await expect.poll(() => picture('input')).toBe(initialInput);
      await expect.poll(() => picture('ideal')).toBe(initialIdeal);
      await expect.poll(() => picture('lookup')).toBe(initialLookup);
      await noOverflow();
      if (width === 390) await shot('lut-interpolation-mobile');
    }
  });


  await check('bokeh-shape-controls-and-mobile', async () => {
    await go(route);
    await page.getByRole('link', {name: '絞りと焦点外の点像を操作して比較'}).click();
    await expect(page).toHaveURL(/\/reference\/visual-processing\/optics\/bokeh-shape\/?$/);
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({width, height: width === 1440 ? 1000 : 844});
      await go('/reference/visual-processing/optics/bokeh-shape');
      await expect(page.locator('.theme-doc-markdown h1')).toContainText('ボケ形状');
      const widget = page.locator('[data-vp-bokeh="ready"]');
      await expect(widget).toBeVisible();
      const layout = await widget.evaluate(el => {
        const previews = el.querySelector('.vp-bokeh__previews');
        const controls = el.querySelector('.vp-bokeh__controls');
        return {
          panels: el.querySelectorAll('[data-vp-bokeh-panel] canvas').length,
          dom: Boolean(previews && controls &&
            (previews.compareDocumentPosition(controls) & Node.DOCUMENT_POSITION_FOLLOWING)),
          visual: Boolean(previews && controls &&
            previews.getBoundingClientRect().bottom <= controls.getBoundingClientRect().top),
        };
      });
      assert.ok(layout.panels === 3 && layout.dom && layout.visual,
        'Bokeh preview-first three-panel layout at ' + width + ': ' + JSON.stringify(layout));
      const picture = mode => widget.locator('[data-vp-bokeh-panel="' + mode + '"] canvas')
        .evaluate(canvas => canvas.toDataURL());
      const before = await picture('input');
      const opening = await picture('aperture');
      const result = await picture('result');
      assert.notEqual(result, before, 'Bokeh result must differ from point-source input');
      const radius = widget.getByRole('slider', {name: 'ぼけ半径'});
      const blades = widget.getByRole('combobox', {name: '絞りの形'});
      const oval = widget.getByRole('slider', {name: '横方向の倍率'});
      const edge = widget.getByRole('slider', {name: '縁の強さ'});
      await expect(radius).toHaveValue('14');
      await expect(blades).toHaveValue('6');
      await radius.focus();
      await radius.press('Home');
      await expect(radius).toHaveValue('3');
      await expect.poll(() => picture('result')).not.toBe(result);
      await blades.selectOption('0');
      await expect(widget).toHaveAttribute('data-vp-bokeh-blades', '0');
      await expect.poll(() => picture('aperture')).not.toBe(opening);
      const circularResult = await picture('result');
      await oval.focus();
      await oval.press('Home');
      await expect(oval).toHaveValue('0.6');
      await expect.poll(() => picture('result')).not.toBe(circularResult);
      await edge.focus();
      await edge.press('Home');
      await expect(edge).toHaveValue('0');
      await widget.getByRole('button', {name: '初期値に戻す'}).click();
      await expect(radius).toHaveValue('14');
      await expect(blades).toHaveValue('6');
      await expect(oval).toHaveValue('1');
      await expect(edge).toHaveValue('0.35');
      await expect.poll(() => picture('input')).toBe(before);
      await expect.poll(() => picture('aperture')).toBe(opening);
      await expect.poll(() => picture('result')).toBe(result);
      await noOverflow();
      if (width === 390) await shot('bokeh-shape-mobile');
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
