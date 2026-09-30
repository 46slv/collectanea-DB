import {mkdir, writeFile} from 'node:fs/promises';
import {execSync} from 'node:child_process';
import {chromium, devices} from '@playwright/test';

const baseUrl = process.env.CAPTURE_BASE_URL ?? 'http://127.0.0.1:3000/collectanea-DB';
const output = process.env.CAPTURE_OUTPUT ?? 'artifacts/visual';

await mkdir(output, {recursive: true});

function candidateSha() {
  try {
    return execSync('git rev-parse HEAD', {encoding: 'utf8'}).trim();
  } catch {
    return 'unknown';
  }
}

const meta = {
  candidate: candidateSha(),
  node: process.version,
  baseUrl,
  startedAt: new Date().toISOString(),
  playwright: '1.56.0',
};
await writeFile(`${output}/candidate.json`, JSON.stringify(meta, null, 2));

const browser = await chromium.launch({headless: true});
const findings = [];
let failures = 0;

async function runCase(item) {
  const contextOptions = item.device ? {...devices[item.device]} : {viewport: item.viewport};
  const context = await browser.newContext(contextOptions);
  const page = await context.newPage();
  const errors = [];
  const asserts = [];
  const check = (name, ok, detail = '') => {
    asserts.push({name, ok, detail});
    if (!ok) errors.push(`${name}${detail ? `: ${detail}` : ''}`);
  };
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`);
  });
  try {
    await page.goto(`${baseUrl}${item.path}`, {waitUntil: 'networkidle'});
    await page.waitForTimeout(600);
    await item.steps(page, check);
    await page.screenshot({path: `${output}/${item.name}.png`, fullPage: item.fullPage ?? true});
  } catch (error) {
    errors.push(`exception: ${error.message?.split('\n')[0] ?? String(error)}`);
    try {
      await page.screenshot({path: `${output}/${item.name}-failure.png`, fullPage: true});
    } catch {
      // ignore screenshot failure
    }
  } finally {
    findings.push({name: item.name, url: page.url(), errors, asserts});
    if (errors.length) failures += 1;
    await context.close();
  }
}

const DESKTOP = {width: 1440, height: 900};

const cases = [
  {
    name: '01-home-desktop',
    path: '/',
    viewport: DESKTOP,
    steps: async (page, check) => {
      const heading = page.locator('main h1', {hasText: 'COLLECTANEA'});
      await heading.first().waitFor({timeout: 8000});
      check('home heading visible', (await heading.count()) > 0);
      const searchEntry = page.getByRole('button', {name: /資料・記事・ノードを検索/});
      check('home search entry visible', await searchEntry.isVisible());
      const cards = page.locator('main a[href*="/manuals/fusion"], main a[href*="/articles"]');
      check('material links present', (await cards.count()) > 0, `count=${await cards.count()}`);
    },
  },
  {
    name: '02-command-palette',
    path: '/',
    viewport: DESKTOP,
    steps: async (page, check) => {
      await page.locator('.collectanea-navbar-search').first().click();
      const dialog = page.getByRole('dialog', {name: 'サイト内検索'});
      await dialog.waitFor({timeout: 8000});
      check('palette dialog opens via navbar control', await dialog.isVisible());
      const input = page.getByRole('combobox', {name: '検索語'});
      await input.fill('Merge');
      await page.waitForTimeout(400);
      // Scope to the palette listbox: native <select> options elsewhere
      // also carry role=option and must not pollute the count.
      const options = page.locator('#collectanea-search-listbox [role="option"]');
      const count = await options.count();
      check('search returns Merge result', count > 0, `count=${count}`);
      const meta = await dialog.locator('text=/件中|件 —/').first().textContent().catch(() => '');
      check('honest result total shown', /件/.test(meta ?? ''), meta ?? '');
      await page.keyboard.press('ArrowDown');
      const selected = await page.locator('#collectanea-search-listbox [role="option"][aria-selected="true"]').count();
      check('arrow-key selection works', selected === 1, `selected=${selected}`);
      // Empty-search zero state (R2 regression).
      await input.fill('zzzzzz存在しない語句');
      await page.waitForTimeout(400);
      check(
        'zero-result guidance shown',
        await page.getByText('一致する項目はありません').isVisible(),
      );
      await input.fill('Merge');
      await page.waitForTimeout(300);
    },
  },
  {
    name: '03-manual-top',
    path: '/manuals/fusion',
    viewport: DESKTOP,
    steps: async (page, check) => {
      await page.locator('main h1', {hasText: 'Fusion'}).first().waitFor({timeout: 8000});
      const tree = page.locator('text=全ページ階層');
      check('manual tree section present', (await tree.count()) > 0);
      const mergeLink = page.locator('main a[href$="/manuals/fusion/nodes/merge"]');
      check('real Merge page linked (no fragment)', (await mergeLink.count()) > 0);
      const noFragments = await page
        .locator('main a[href*="#"]')
        .count()
        .catch(() => -1);
      check('no heading-fragment links in manual tree', noFragments === 0, `fragmentLinks=${noFragments}`);
      const collapse = page.getByRole('button', {name: 'Collapse'});
      const expand = page.getByRole('button', {name: 'Expand all'});
      if ((await collapse.count()) > 0) {
        await collapse.click();
        await page.waitForTimeout(300);
        check('tree collapses via real control', (await page.locator('main a[href$="/nodes/merge"]').count()) === 0);
        await expand.click();
        await page.waitForTimeout(300);
        check('tree expands via real control', (await page.locator('main a[href$="/nodes/merge"]').count()) > 0);
      }
      // Tree search reveals descendants (R5 regression).
      const filter = page.getByLabel('Fusionページの絞り込み検索');
      await filter.fill('Merge');
      await page.waitForTimeout(400);
      check('tree search reveals Merge', await page.locator('main a[href$="/nodes/merge"]').isVisible());
      await filter.fill('');
    },
  },
  {
    name: '04-article-sidebar-open',
    path: '/manuals/fusion/nodes/merge',
    viewport: DESKTOP,
    steps: async (page, check) => {
      await page.locator('.theme-doc-markdown h1', {hasText: 'Merge'}).first().waitFor({timeout: 8000});
      const state = await page.evaluate(() => document.documentElement.dataset.collectaneaSidebar);
      check('sidebar state explicit', state === 'expanded' || state === 'collapsed', `state=${state}`);
      const sidebar = page.locator('.theme-doc-sidebar-container');
      const rail = page.getByRole('navigation', {name: 'このページの見出し'});
      check('hierarchy present when open or toggle available', (await sidebar.count()) > 0);
      check('heading rail present', (await rail.count()) > 0);
      // The toggle carries an aria-label (its accessible name); visible text alone won't match.
      const toggle = page.getByRole('button', {name: /階層ナビゲーション/});
      check('discoverable hierarchy toggle present', (await toggle.count()) > 0);
    },
  },
  {
    name: '05-article-sidebar-closed',
    path: '/manuals/fusion/nodes/merge',
    viewport: DESKTOP,
    steps: async (page, check) => {
      await page.locator('.theme-doc-markdown h1', {hasText: 'Merge'}).first().waitFor({timeout: 8000});
      const toggle = page.getByRole('button', {name: /階層ナビゲーション/});
      await toggle.waitFor({timeout: 8000});
      await toggle.scrollIntoViewIfNeeded();
      const label = await toggle.textContent();
      if (/閉じる/.test(label ?? '')) await toggle.click();
      await page.waitForTimeout(500);
      const state = await page.evaluate(() => document.documentElement.dataset.collectaneaSidebar);
      check('sidebar closes via real toggle click', state === 'collapsed', `state=${state}`);
      const geometry = await page.evaluate(() => {
        const article = document.querySelector('.theme-doc-markdown');
        if (!article) return null;
        const rect = article.getBoundingClientRect();
        return {articleCenter: rect.left + rect.width / 2, viewportCenter: window.innerWidth / 2, width: rect.width};
      });
      check('article geometry measurable', Boolean(geometry), JSON.stringify(geometry));
      if (geometry) {
        const drift = Math.abs(geometry.articleCenter - geometry.viewportCenter);
        check('article text column centered in viewport', drift <= 60, `drift=${drift.toFixed(1)}px`);
        check('readable max-width preserved', geometry.width <= 860, `width=${geometry.width.toFixed(0)}px`);
      }
      // Reload persistence (R5/R3 regression).
      await page.reload({waitUntil: 'networkidle'});
      await page.waitForTimeout(600);
      const persisted = await page.evaluate(() => document.documentElement.dataset.collectaneaSidebar);
      check('sidebar state persists across reload', persisted === 'collapsed', `state=${persisted}`);
      // Reopen for subsequent cases.
      const reopen = page.getByRole('button', {name: /階層ナビゲーション/});
      if ((await reopen.count()) > 0) await reopen.click();
      await page.waitForTimeout(400);
    },
  },
  {
    name: '06-heading-rail-active',
    path: '/manuals/fusion/nodes/merge',
    viewport: DESKTOP,
    steps: async (page, check) => {
      await page.locator('.theme-doc-markdown h1', {hasText: 'Merge'}).first().waitFor({timeout: 8000});
      const controls = page.locator('.theme-doc-markdown #controls, .theme-doc-markdown h2', {hasText: 'Controls'});
      if ((await controls.count()) > 0) {
        await controls.first().scrollIntoViewIfNeeded();
        await page.waitForTimeout(600);
      }
      const current = page.locator('.theme-doc-toc-desktop a[aria-current="location"], nav[aria-label="このページの見出し"] a[aria-current="location"]');
      check('active heading tracked on scroll', (await current.count()) > 0);
      const railLink = page.locator('nav[aria-label="このページの見出し"] a[href^="#"]').first();
      if ((await railLink.count()) > 0) {
        await railLink.hover();
        await page.waitForTimeout(250);
      }
    },
  },
  {
    name: '07-home-mobile',
    path: '/',
    device: 'iPhone 13',
    steps: async (page, check) => {
      await page.locator('main h1', {hasText: 'COLLECTANEA'}).first().waitFor({timeout: 8000});
      await page.locator('.collectanea-navbar-search').first().click();
      const dialog = page.getByRole('dialog', {name: 'サイト内検索'});
      await dialog.waitFor({timeout: 8000});
      check('site search opens on mobile', await dialog.isVisible());
      const input = page.getByRole('combobox', {name: '検索語'});
      await input.fill('Merge');
      await page.waitForTimeout(400);
      const firstOption = page.locator('#collectanea-search-listbox [role="option"]').first();
      const optionText = (await firstOption.textContent().catch(() => '')) ?? '';
      check('result type visible on mobile (not hidden)', /Manual|Article|Reference|Research/.test(optionText), optionText.slice(0, 80));
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
      check('palette closes on Escape', (await dialog.count()) === 0 || !(await dialog.isVisible()));
    },
  },
  {
    name: '08-article-mobile',
    path: '/manuals/fusion/nodes/merge',
    device: 'iPhone 13',
    steps: async (page, check) => {
      await page.locator('.theme-doc-markdown h1', {hasText: 'Merge'}).first().waitFor({timeout: 8000});
      const summary = page.locator('details summary', {hasText: '見出し一覧'});
      check('mobile heading navigation present', (await summary.count()) > 0);
      if ((await summary.count()) > 0) {
        await summary.click();
        await page.waitForTimeout(300);
        const links = page.locator('details a[href^="#"]');
        check('mobile heading list opens with anchors', (await links.count()) > 0, `count=${await links.count()}`);
      }
    },
  },
  {
    name: '09-mobile-navigation',
    path: '/manuals/fusion/nodes/merge',
    device: 'iPhone 13',
    steps: async (page, check) => {
      await page.locator('.theme-doc-markdown h1', {hasText: 'Merge'}).first().waitFor({timeout: 8000});
      const hamburger = page.locator('.navbar__toggle');
      await hamburger.click();
      await page.waitForTimeout(500);
      check(
        'mobile hierarchy overlay opens via real control',
        (await page.locator('.navbar-sidebar--show').count()) > 0,
      );
    },
  },
  {
    name: '10-articles-db',
    path: '/articles',
    viewport: DESKTOP,
    steps: async (page, check) => {
      await page.getByRole('heading', {name: 'Articles'}).first().waitFor({timeout: 8000});
      const search = page.getByLabel('記事検索');
      check('articles DB search present', (await search.count()) > 0);
      const tagFilter = page.getByLabel('タグフィルタ');
      check('articles DB tag filter present', (await tagFilter.count()) > 0);
      const listButton = page.getByRole('button', {name: 'List'});
      const panelButton = page.getByRole('button', {name: 'Panel'});
      check('articles Panel/List toggle present', (await listButton.count()) > 0 && (await panelButton.count()) > 0);
      await listButton.click();
      await page.waitForTimeout(300);
      check('articles DB list view works', await page.getByText('COLLECTANEAを始める').first().isVisible());
      await search.fill('存在しない記事zzzzzz');
      await page.waitForTimeout(300);
      check('articles DB empty state', await page.getByText('一致する記事はありません').isVisible());
      await search.fill('');
    },
  },
  {
    name: '11-search-honesty',
    path: '/?search=open',
    viewport: DESKTOP,
    steps: async (page, check) => {
      const dialog = page.getByRole('dialog', {name: 'サイト内検索'});
      await dialog.waitFor({timeout: 8000});
      const input = page.getByRole('combobox', {name: '検索語'});
      await input.fill('COLLECTANEAを始める');
      await page.waitForTimeout(400);
      const first = page.locator('#collectanea-search-listbox [role="option"]').first();
      check('real article title searchable', await first.isVisible());
      const text = (await first.textContent()) ?? '';
      check('circle-tutorial mislabel gone', !/線だけの円/.test(text), text.slice(0, 80));
    },
  },
];

for (const item of cases) await runCase(item);

await browser.close();

const report = {meta: {...meta, finishedAt: new Date().toISOString()}, findings};
await writeFile(`${output}/capture-report.json`, JSON.stringify(report, null, 2));

const failed = findings.filter((item) => item.errors.length > 0);
if (failed.length) {
  console.error(`capture: ${failed.length} case(s) with errors`);
  for (const item of failed) console.error(` - ${item.name}: ${item.errors.join(' | ')}`);
  process.exitCode = 1;
} else {
  console.log(`capture: ${findings.length} cases passed (candidate ${meta.candidate.slice(0, 12)})`);
}
