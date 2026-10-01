// Adds ordinary authoring fixtures only inside the disposable CI checkout.
// Builds them through Docusaurus, checks real routes/UI, then removes every fixture.
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {spawn, execFileSync} from 'node:child_process';
import {chromium, expect} from '@playwright/test';

const site = process.cwd();
const cli = path.join(site, 'node_modules/@docusaurus/core/bin/docusaurus.mjs');
const out = process.env.CC_EVIDENCE_DIR || 'artifacts/visual';
await fs.mkdir(out, {recursive: true});
const owned = ['manuals/zz-ci-catalog', 'manuals/fusion/zz-ci-catalog'];
const articleFiles = Array.from({length: 47}, (_, i) => `articles/2000-01-01-zz-ci-catalog-${String(i + 1).padStart(2, '0')}.md`);
for (const name of [...owned, ...articleFiles]) {
  await assert.rejects(() => fs.stat(name), {code: 'ENOENT'}, `Fixture path must not already exist: ${name}`);
}
const report = {status: 'RUNNING', checks: [], fixtureCount: 0, removed: false};
let server, browser, page;
const base = '/collectanea-DB';
const origin = 'http://127.0.0.1:3001';
const write = async (name, text) => {await fs.mkdir(path.dirname(name), {recursive: true}); await fs.writeFile(name, text); report.fixtureCount++;};
try {
  await write('manuals/zz-ci-catalog/index.md', `---\ntitle: CI Material\nslug: /ci-material\ndomain: ci-domain\ntags: [software, ci-material]\nverification: unverified\nhide_title: true\nhide_table_of_contents: true\n---\n\nimport ManualOverview from '@site/src/components/ManualOverview';\n\n<ManualOverview />\n`);
  await write('manuals/zz-ci-catalog/nested/page.md', `---\ntitle: CI Nested Entry\nslug: /ci-custom-route\nupdated: 2026-09-28\n---\n\n# CI Nested Entry\n\n${'通常の説明です。'.repeat(80)}\n\n## Deep heading\n\n本文末尾だけの検索語CICatalog\n`);
  await write('manuals/fusion/zz-ci-catalog/ordinary.md', '---\ntitle: CI Ordinary Markdown\n---\n\n# CI Ordinary Markdown\n\nA normal nested Markdown page.\n');
  for (let i = 1; i <= 47; i++) {
    const id = String(i).padStart(2, '0');
    const publication = i === 46 ? 'draft: true\n' : i === 47 ? 'unlisted: true\n' : '';
    await write(articleFiles[i - 1], `---\ntitle: CI Entry ${id}\nslug: ci-entry-${id}\ndate: 2000-01-01\nupdated: ${i === 45 ? '2026-09-29' : '2020-01-01'}\ntags: [ci-fixture${i === 1 ? ', ci-one-only' : ''}]\nauthors: [46slv]\n${publication}---\n\nAn isolated integration fixture.\n\n<!-- truncate -->\n\n## Example\n\nEntry ${id} body.\n`);
  }
  // Force fresh lifecycle/global-data projection without deleting the already
  // verified production build artifact used by the parent review.
  await fs.rm('.docusaurus', {recursive: true, force: true});
  await fs.rm(path.join('node_modules', '.cache'), {recursive: true, force: true});
  await fs.rm('build-fixtures', {recursive: true, force: true});
  execFileSync(process.execPath, [cli, 'build', '--out-dir', 'build-fixtures'], {stdio: 'inherit', timeout: 300000});
  const catalog = JSON.parse(await fs.readFile('build-fixtures/catalog.json', 'utf8'));
  const search = JSON.parse(await fs.readFile('build-fixtures/catalog-search.json', 'utf8'));
  const root = catalog.materials.find((m) => m.id === 'zz-ci-catalog');
  assert.ok(root && root.pageCount === 2 && root.tags.includes('software'));
  assert.equal(root.tree[0].children[0].href, `${base}/manuals/ci-custom-route`);
  assert.ok(catalog.pages.find((p) => p.title === 'CI Ordinary Markdown').material === 'fusion');
  assert.ok(search.find((p) => p.title === 'CI Nested Entry').text.includes('本文末尾だけの検索語CICatalog'));
  assert.ok(!catalog.pages.some((p) => ['CI Entry 46', 'CI Entry 47'].includes(p.title)));
  assert.ok(!search.some((p) => ['CI Entry 46', 'CI Entry 47'].includes(p.title)));
  assert.deepEqual(catalog.pages.find((p) => p.title === 'CI Entry 02').tags, ['ci-fixture']);
  const newest = catalog.pages.find((p) => p.title === 'CI Entry 45');
  assert.equal(newest.published, '2000-01-01'); assert.equal(newest.updated, '2026-09-29');
  report.checks.push('real parser, nested Markdown, material discovery, actual custom permalink, body search, visibility and date semantics');
  server = spawn(process.execPath, [cli, 'serve', '--dir', 'build-fixtures', '--host', '127.0.0.1', '--port', '3001', '--no-open'], {stdio: 'inherit'});
  let ready = false;
  for (let i = 0; i < 120; i++) {
    try {if ((await fetch(`${origin}${base}/`)).ok) {ready = true; break;}} catch { /* Startup only. */ }
    if (server.exitCode !== null) throw new Error(`Fixture server exited: ${server.exitCode}`);
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  assert.ok(ready, 'Fixture server did not become ready');
  browser = await chromium.launch();
  const context = await browser.newContext({viewport: {width: 1440, height: 1000}});
  await context.route('https://fonts.googleapis.com/**', (route) => route.abort());
  page = await context.newPage();
  const errors = []; page.on('pageerror', (error) => errors.push(String(error)));
  const go = async (route) => {const response = await page.goto(`${origin}${base}${route}`, {waitUntil: 'networkidle'}); assert.equal(response.status(), 200); await expect(page.locator('html')).toHaveAttribute('data-cc-sidebar', /expanded|collapsed/);};
  await go('/');
  await expect(page.locator('.cc-card').getByRole('link', {name: 'CI Material', exact: true})).toBeVisible();
  await page.locator('.cc-card').getByRole('link', {name: 'CI Material', exact: true}).click();
  await expect(page.locator('.cc-tree').getByRole('link', {name: 'CI Nested Entry', exact: true})).toBeVisible();
  await page.locator('.cc-tree').getByRole('link', {name: 'CI Nested Entry', exact: true}).click();
  await expect(page).toHaveURL(/\/manuals\/ci-custom-route$/);
  await expect(page.locator('.theme-doc-markdown h1')).toHaveText('CI Nested Entry');
  await go('/manuals/fusion');
  await page.getByRole('button', {name: '閉じる', exact: true}).click();
  await page.getByLabel('この資料を検索', {exact: true}).fill('CI Ordinary');
  await expect(page.locator('.cc-manual').getByRole('link', {name: 'CI Ordinary Markdown', exact: true})).toBeVisible();
  report.checks.push('new material and nested ordinary page visible/navigable without component changes');
  await go('/articles');
  const articleTag = page.locator('[data-cc-articles]').locator('..').getByLabel('タグ', {exact: true});
  const articleTagValues = await articleTag.locator('option').evaluateAll((options) => options.map((option) => option.value));
  assert.ok(articleTagValues.includes('ci-fixture'), `Fixture article tag missing from UI: ${articleTagValues.join(',')}`);
  await articleTag.selectOption('ci-fixture');
  await expect(page.locator('[data-cc-articles] .cc-card')).toHaveCount(45);
  await expect(page.locator('[data-cc-articles] .cc-card h2').first()).toHaveText('CI Entry 45');
  await page.getByLabel('記事を検索', {exact: true}).fill('CI Entry 39');
  await expect(page.locator('[data-cc-articles] .cc-card')).toHaveCount(1);
  await page.locator('[data-cc-articles] .cc-card a').click();
  await expect(page).toHaveURL(/\/articles\/ci-entry-39$/);
  report.checks.push('full Articles DB, beyond pagination, updated rather than published sort');
  await page.locator('.cc-navbar-search').click();
  const dialog = page.locator('dialog'), input = page.locator('#cc-search-input');
  await expect(dialog).toBeVisible();
  await input.fill('本文末尾だけの検索語CICatalog');
  await expect(dialog.locator('[role="option"]')).toHaveCount(1);
  await expect(dialog.locator('[role="option"] strong')).toHaveText('CI Nested Entry');
  await input.fill('CI Entry');
  await dialog.getByLabel('種類', {exact: true}).selectOption('article');
  await expect(dialog.locator('[role="option"]')).toHaveCount(40);
  await expect(dialog.getByRole('button', {name: /さらに表示/})).toBeVisible();
  await input.focus();
  for (let i = 0; i < 44; i++) await input.press('ArrowDown');
  await expect(dialog.locator('[role="option"]')).toHaveCount(45);
  const selected = dialog.locator('[role="option"][aria-selected="true"]');
  await expect(selected.locator('strong')).toHaveText('CI Entry 45');
  assert.ok(await selected.evaluate((el) => {const r = el.getBoundingClientRect(), parent = document.querySelector('.cc-results').getBoundingClientRect(); return r.top >= parent.top - 1 && r.bottom <= parent.bottom + 1;}));
  await page.screenshot({path: path.join(out, '16-fixture-large-search.png'), fullPage: false});
  await input.press('Enter'); await expect(page).toHaveURL(/\/articles\/ci-entry-45$/);
  report.checks.push('body search and keyboard access to all >40 matches');
  assert.deepEqual(errors, []);
  report.status = 'PASS';
} catch (error) {
  report.status = 'FAIL'; report.error = String(error);
  if (page) await page.screenshot({path: path.join(out, 'failure-content-integration.png'), fullPage: false}).catch(() => {});
  process.exitCode = 1;
} finally {
  await browser?.close(); server?.kill('SIGTERM');
  for (const name of [...owned, ...articleFiles]) await fs.rm(name, {recursive: true, force: true});
  for (const name of [...owned, ...articleFiles]) await assert.rejects(() => fs.stat(name), {code: 'ENOENT'});
  report.removed = true;
  await fs.writeFile(path.join(out, 'content-integration-report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}
