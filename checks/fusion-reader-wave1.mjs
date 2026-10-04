// One-off reader-first wave 1 check; validation branch only, not part of the site.
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';

const require = createRequire(path.resolve('package.json'));
const {chromium, expect} = require('@playwright/test');
const out = 'artifacts/reader-first-wave1';
await fs.mkdir(out, {recursive: true});

const report = {
  status: 'RUNNING',
  expected: process.env.CC_EXPECTED_SHA,
  tested: execFileSync('git', ['rev-parse', 'HEAD'], {encoding: 'utf8'}).trim(),
  node: process.version,
  checks: [],
  pages: [],
  errors: [],
};

const origin = 'http://127.0.0.1:3000';
const base = '/collectanea-DB';
let browser;

try {
  assert.equal(report.tested, report.expected, 'Wrong source commit');

  const catalog = JSON.parse(await fs.readFile('build/catalog.json', 'utf8'));
  const search = JSON.parse(await fs.readFile('build/catalog-search.json', 'utf8'));
  const nodes = catalog.indexes.nodes;

  assert.equal(nodes.length, 385, 'Node/related-element count changed unexpectedly');

  for (const id of ['mask', 'transform', 'merge', 'multi-merge', 'ellipse-mask', 'polygon-mask', 'bitmap-mask', 'resize']) {
    assert.ok(catalog.terms[id], `Missing term: ${id}`);
  }

  const wanted = [
    '合成ノード（Compositing）',
    'Merge',
    'MultiMerge',
    'Dissolve',
    'Transform / Formatノード',
    'Transform',
    'Resize',
    'Scale',
    'Crop',
    'Maskノード',
    'Bitmap Mask',
    'Ellipse Mask',
    'Polygon Mask',
    'マスク（Mask）',
    'Center / Pivot / Size / Angle',
    '解像度 / アスペクト比（Resolution / Aspect）',
  ];

  const selected = wanted.map((title) => {
    const matches = catalog.pages.filter((p) => p.title === title);
    assert.equal(matches.length, 1, `Expected exactly one page: ${title}`);
    const page = matches[0];
    assert.ok(search.some((x) => x.href === page.href && x.text.includes(title)), `Missing search entry: ${title}`);
    return page;
  });

  for (const title of ['Merge','MultiMerge','Dissolve','Transform','Resize','Scale','Crop','Bitmap Mask','Ellipse Mask','Polygon Mask']) {
    const rec = nodes.find((p) => p.title === title);
    assert.ok(rec, `Missing node index record: ${title}`);
    const page = catalog.pages.find((p) => p.href === rec.href);
    assert.ok(page, `Missing page record: ${title}`);
    assert.ok(page.controls?.length > 0, `Reader-first control metadata missing: ${title}`);
    assert.equal(page.status, 'partial', `Unexpected verification state: ${title}`);
  }

  report.checks.push('385 catalog records retained; wave-1 family guides, terms, search entries and representative control metadata are present');

  browser = await chromium.launch();
  const context = await browser.newContext({viewport: {width: 1440, height: 1000}});
  await context.route('https://fonts.googleapis.com/**', (route) => route.abort());
  const page = await context.newPage();

  page.on('pageerror', (error) => report.errors.push(String(error)));
  page.on('console', (message) => {
    if (message.type() === 'error' && /hydration|Minified React|uncaught/i.test(message.text())) {
      report.errors.push(message.text());
    }
  });

  for (const entry of selected) {
    const response = await page.goto(origin + entry.href, {waitUntil: 'networkidle'});
    assert.equal(response.status(), 200, entry.href);
    await expect(page.locator('.theme-doc-markdown h1')).toHaveText(entry.title);
    const body = await page.locator('.theme-doc-markdown').innerText();
    assert.ok(body.length > 300, `Article too thin: ${entry.title}`);
    report.pages.push({title: entry.title, href: entry.href, textLength: body.length});
  }

  report.checks.push('Compositing, Transform and Mask family guides plus representative Node/Concept pages render with nontrivial body text');

  const merge = selected.find((p) => p.title === 'Merge');
  await page.goto(origin + merge.href, {waitUntil: 'networkidle'});
  const maskTerm = page.locator('[data-term-id="mask"]').first();
  await expect(maskTerm).toBeVisible();
  await maskTerm.locator('.cc-term-trigger').hover();
  await expect(maskTerm.locator('.cc-term-popover')).toBeVisible();

  const transform = selected.find((p) => p.title === 'Transform');
  await page.goto(origin + transform.href, {waitUntil: 'networkidle'});
  const imageTerm = page.locator('[data-term-id="image"]').first();
  await expect(imageTerm).toBeVisible();
  await imageTerm.locator('.cc-term-trigger').hover();
  await expect(imageTerm.locator('.cc-term-popover')).toBeVisible();

  report.checks.push('Inline concept terms remain interactive on rewritten representative Node pages');

  for (const width of [1440, 390]) {
    await page.setViewportSize({width, height: width === 390 ? 844 : 1000});
    for (const title of ['合成ノード（Compositing）','Merge','Transform / Formatノード','Transform','Maskノード','Polygon Mask']) {
      const entry = selected.find((p) => p.title === title);
      await page.goto(origin + entry.href, {waitUntil: 'networkidle'});
      const bounds = await page.evaluate(() => ({
        scroll: document.documentElement.scrollWidth,
        client: document.documentElement.clientWidth,
      }));
      assert.ok(bounds.scroll <= bounds.client + 1, `Horizontal overflow at ${width}: ${title}`);
      const safe = title.replace(/[^a-zA-Z0-9\u3040-\u30ff\u3400-\u9fff]+/g, '-').slice(0, 50);
      await page.screenshot({path: path.join(out, `${width}-${safe}.png`), fullPage: true});
    }
  }
  report.checks.push('Representative family and Node pages render without horizontal overflow at desktop and mobile widths');

  await page.goto(origin + base + '/manuals/fusion/index/node-a-z', {waitUntil: 'networkidle'});
  const index = page.locator('[data-cc-fusion-index="nodes"]');
  await expect(index).toBeVisible();
  const input = index.getByLabel('この索引を絞り込む', {exact: true});
  for (const title of ['Merge','Transform','Bitmap Mask']) {
    await input.fill(title);
    await expect(index.getByRole('link', {name: title, exact: true})).toBeVisible();
  }
  report.checks.push('Node A-Z finds representative rewritten nodes');

  assert.deepEqual(report.errors, [], 'Browser errors');
  report.status = 'PASS';
} catch (error) {
  report.status = 'FAIL';
  report.error = String(error);
  process.exitCode = 1;
} finally {
  await browser?.close();
  await fs.writeFile(path.join(out, 'report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}
