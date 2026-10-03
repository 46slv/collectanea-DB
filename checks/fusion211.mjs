// One-off PR11 check; kept on the validation branch, outside the reviewed site tree.
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
const require = createRequire(path.resolve('package.json'));
const {chromium, expect} = require('@playwright/test');
const out = 'artifacts/merge-ready';
await fs.mkdir(out, {recursive: true});
const report = {status: 'RUNNING', expected: process.env.CC_EXPECTED_SHA, tested: execFileSync('git', ['rev-parse', 'HEAD'], {encoding: 'utf8'}).trim(), node: process.version, checks: [], pages: [], links: [], errors: []};
const expectedNames = ['Connect 3D','Fold Create 3D','Heightfield Create 3D','Tube Create 3D','Warped Transform','sExtrude','sKill','sPrimitiveCreate','sResample','sRestyle','sRound','sSmooth','sSpiral Create','sTrace Create','sTriangulate','sWriteOn','sZigZag','rCube','rMerge','rModify','rNoise','rPlane','rSphere','rTransform','OpenPBR','sChangeStyle','sOffset','Mapped Duplicate 3D'];
const origin = 'http://127.0.0.1:3000';
const base = '/collectanea-DB';
let browser;
try {
  assert.equal(report.tested, report.expected, 'Wrong source commit');
  const catalog = JSON.parse(await fs.readFile('build/catalog.json', 'utf8'));
  const search = JSON.parse(await fs.readFile('build/catalog-search.json', 'utf8'));
  const nodes = catalog.indexes.nodes;
  assert.equal(nodes.length, 385, 'PR11 declared node-page count');
  report.nodePages = nodes.length;
  const selected = expectedNames.map((title) => {
    const matches = nodes.filter((node) => node.title === title);
    assert.equal(matches.length, 1, `Expected one node record: ${title}`);
    const node = matches[0];
    const page = catalog.pages.find((p) => p.href === node.href);
    assert.equal(page.docType, 'node', title);
    assert.ok(page.termId && catalog.terms[page.termId]?.href === page.href, `Missing term registration: ${title}`);
    assert.equal(page.status, 'partial', `Verification boundary: ${title}`);
    assert.ok(search.some((p) => p.href === node.href && p.text.includes(title)), `Missing search entry: ${title}`);
    return node;
  });
  assert.equal(nodes.find((p) => p.title === 'sOffset').nodeFamily, 'krokodove');
  assert.equal(nodes.filter((p) => p.nodeFamily === 'krokodove').length, 86, '85 table entries plus Connect 3D');
  assert.deepEqual(nodes.find((p) => p.title === 'OpenPBR').inputs, ['image']);
  assert.deepEqual(nodes.find((p) => p.title === 'sExtrude').outputs, [], 'Unknown output must remain unclassified');
  assert.ok(!nodes.find((p) => p.title === 'sTrace Create').tasks.includes('trace-image'));
  // Resolve guide identity through the real catalog, not guessed permalink suffixes.
  for (const title of ['ノードリファレンス（Node Reference）','Krokodoveの画像・Shape・3D・Region']) {
    const guides = catalog.pages.filter((p) => p.material === 'fusion' && p.docType === 'index' && p.title === title);
    assert.equal(guides.length, 1, `Missing guide: ${title}`);
    selected.push(guides[0]);
  }
  assert.equal(selected.length, 30, '28 node pages plus two category guides');
  report.checks.push('385 nodes; 86 Krokodove records; all 28 changed nodes have unique metadata, terms, partial status and search records');
  browser = await chromium.launch();
  const context = await browser.newContext({viewport: {width: 1440, height: 1000}});
  await context.route('https://fonts.googleapis.com/**', (route) => route.abort());
  const page = await context.newPage();
  page.on('pageerror', (error) => report.errors.push(String(error)));
  page.on('console', (message) => {if (message.type() === 'error' && /hydration|Minified React|uncaught/i.test(message.text())) report.errors.push(message.text());});
  const links = new Set();
  for (const entry of selected) {
    const response = await page.goto(origin + entry.href, {waitUntil: 'networkidle'});
    assert.equal(response.status(), 200, entry.href);
    await expect(page.locator('.theme-doc-markdown h1')).toHaveText(entry.title);
    const article = page.locator('.theme-doc-markdown');
    assert.ok((await article.innerText()).length > 200, `Empty article: ${entry.title}`);
    for (const href of await article.locator('a[href]').evaluateAll((as) => as.map((a) => a.href))) {
      const target = new URL(href);
      if (target.origin === origin && target.pathname.startsWith(base) && !target.hash) links.add(target.origin + target.pathname + target.search);
      if (target.origin === origin && target.pathname === new URL(page.url()).pathname && target.hash) {
        const id = decodeURIComponent(target.hash.slice(1));
        assert.ok(await page.evaluate((id) => Boolean(document.getElementById(id)), id), `Missing local heading: ${id}`);
      }
    }
    report.pages.push({title: entry.title, href: entry.href, status: 200});
  }
  for (const href of links) {
    const response = await context.request.get(href);
    assert.equal(response.status(), 200, `Broken article link: ${href}`);
    report.links.push(href.replace(origin, ''));
  }
  report.checks.push('30 changed article routes and their internal non-fragment links return 200; headings and nonempty body render');
  await page.goto(origin + base + '/manuals/fusion/index/node-a-z', {waitUntil: 'networkidle'});
  const index = page.locator('[data-cc-fusion-index="nodes"]');
  await expect(index).toBeVisible();
  for (const title of ['OpenPBR','rCube','sChangeStyle','Mapped Duplicate 3D']) {
    await index.getByLabel('この索引を絞り込む', {exact: true}).fill(title);
    await expect(index.getByRole('link', {name: title, exact: true})).toBeVisible();
  }
  report.checks.push('Node A-Z filtering exposes new and rewritten nodes');
  await page.locator('.cc-navbar-search').click();
  const dialog = page.locator('dialog');
  await expect(dialog).toBeVisible();
  await page.locator('#cc-search-input').fill('OpenPBR');
  const option = dialog.locator('[role="option"]').filter({has: page.locator('strong', {hasText: /^OpenPBR$/})}).first();
  await expect(option).toBeVisible();
  await option.click();
  await expect(page.locator('.theme-doc-markdown h1')).toHaveText('OpenPBR');
  report.checks.push('Global search opens the OpenPBR article');
  for (const width of [1440,390]) {
    await page.setViewportSize({width, height: width === 390 ? 844 : 1000});
    for (const title of ['OpenPBR','sChangeStyle','rCube']) {
      const entry = selected.find((p) => p.title === title);
      await page.goto(origin + entry.href, {waitUntil: 'networkidle'});
      await expect(page.locator('.theme-doc-markdown h1')).toHaveText(title);
      const bounds = await page.evaluate(() => ({scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth}));
      assert.ok(bounds.scroll <= bounds.client + 1, `Horizontal page overflow at ${width}: ${title} ${JSON.stringify(bounds)}`);
      await page.screenshot({path: path.join(out, `${width}-${title}.png`), fullPage: true});
    }
  }
  report.checks.push('OpenPBR, sChangeStyle and rCube render at desktop/mobile widths without page overflow');
  assert.deepEqual(report.errors, [], 'Browser errors');
  report.status = 'PASS';
} catch (error) {
  report.status = 'FAIL'; report.error = String(error); process.exitCode = 1;
} finally {
  await browser?.close();
  await fs.writeFile(path.join(out, 'report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}
