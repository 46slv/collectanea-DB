// One-off PR12 integration check; validation branch only, not part of the site.
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';

const require = createRequire(path.resolve('package.json'));
const {chromium, expect} = require('@playwright/test');
const out = 'artifacts/pr12-integration';
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

  assert.equal(nodes.length, 385, 'Integrated node/related-element count');
  assert.equal(nodes.filter((p) => p.nodeFamily === 'krokodove').length, 86, 'Krokodove coverage');
  assert.equal(nodes.find((p) => p.title === 'sOffset').nodeFamily, 'krokodove');
  assert.ok(catalog.terms['shape-data'], 'Shape term must exist');

  const shapeConcept = catalog.pages.find((p) => p.title === 'シェイプ（Shape）' && p.docType === 'concept');
  assert.ok(shapeConcept, 'Shape concept page missing');
  assert.equal(catalog.terms['shape-data'].href, shapeConcept.href, 'Shape term must point to Shape concept');

  const wantedTitles = [
    'ノードリファレンス（Node Reference）',
    'Shapeノード',
    'Krokodoveの画像・Shape・3D・Region',
    'シェイプ（Shape）',
    'sGrid',
    'sDuplicate',
    'sEllipse',
    'sRender',
    'OpenPBR',
    'sChangeStyle',
    'rCube',
    'Mapped Duplicate 3D',
  ];

  const selected = wantedTitles.map((title) => {
    const matches = catalog.pages.filter((p) => p.title === title);
    assert.equal(matches.length, 1, `Expected one page: ${title}`);
    const page = matches[0];
    assert.ok(search.some((p) => p.href === page.href && p.text.includes(title)), `Missing search entry: ${title}`);
    return page;
  });

  for (const title of ['sGrid','sDuplicate','sEllipse','sRender']) {
    const node = nodes.find((p) => p.title === title);
    assert.ok(node, `Missing node index record: ${title}`);
    const page = catalog.pages.find((p) => p.href === node.href);
    assert.ok(page?.controls?.length > 0, `Manual-grounded controls missing: ${title}`);
    assert.equal(page.status, 'partial', `Verification boundary changed unexpectedly: ${title}`);
  }

  report.checks.push('385 records, 86 Krokodove records, Shape term/concept and representative Shape control metadata are present');

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
    const text = await page.locator('.theme-doc-markdown').innerText();
    assert.ok(text.length > 250, `Article too thin: ${entry.title}`);
    report.pages.push({title: entry.title, href: entry.href, status: 200, textLength: text.length});
  }

  report.checks.push('Node index, family guides, Shape concept, representative Shape nodes and PR11 representative pages render with nontrivial body text');

  const sGrid = selected.find((p) => p.title === 'sGrid');
  await page.goto(origin + sGrid.href, {waitUntil: 'networkidle'});
  const term = page.locator('[data-term-id="shape-data"]').first();
  await expect(term).toBeVisible();
  await term.locator('.cc-term-trigger').hover();
  await expect(term.locator('.cc-term-popover')).toBeVisible();
  await expect(term.locator('.cc-term-popover')).toContainText('シェイプ');
  report.checks.push('Shape inline term renders and opens its explanatory popover on the representative node page');

  for (const width of [1440,390]) {
    await page.setViewportSize({width, height: width === 390 ? 844 : 1000});
    for (const title of ['Shapeノード','sGrid','sDuplicate','OpenPBR']) {
      const entry = selected.find((p) => p.title === title);
      await page.goto(origin + entry.href, {waitUntil: 'networkidle'});
      const bounds = await page.evaluate(() => ({
        scroll: document.documentElement.scrollWidth,
        client: document.documentElement.clientWidth,
      }));
      assert.ok(bounds.scroll <= bounds.client + 1, `Horizontal overflow at ${width}: ${title} ${JSON.stringify(bounds)}`);
      await page.screenshot({path: path.join(out, `${width}-${title.replace(/[^a-zA-Z0-9]+/g, '-')}.png`), fullPage: true});
    }
  }
  report.checks.push('Representative family/node/material pages render at desktop and mobile widths without page overflow');

  await page.goto(origin + base + '/manuals/fusion/index/node-a-z', {waitUntil: 'networkidle'});
  const index = page.locator('[data-cc-fusion-index="nodes"]');
  await expect(index).toBeVisible();
  for (const title of ['sGrid','sDuplicate','OpenPBR','rCube']) {
    const input = index.getByLabel('この索引を絞り込む', {exact: true});
    await input.fill(title);
    await expect(index.getByRole('link', {name: title, exact: true})).toBeVisible();
  }
  report.checks.push('Node A-Z can find representative integrated records');

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
