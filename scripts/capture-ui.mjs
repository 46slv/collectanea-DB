import {mkdir, writeFile} from 'node:fs/promises';
import {chromium, devices} from '@playwright/test';

const baseUrl = process.env.CAPTURE_BASE_URL ?? 'http://127.0.0.1:3000/collectanea-DB';
const output = process.env.CAPTURE_OUTPUT ?? 'artifacts/visual';

await mkdir(output, {recursive: true});

const browser = await chromium.launch({headless: true});
const findings = [];

const cases = [
  {
    name: '01-home-desktop',
    path: '/',
    viewport: {width: 1440, height: 900},
    check: async (page) => page.getByRole('heading', {name: 'COLLECTANEA'}).waitFor(),
  },
  {
    name: '02-command-palette',
    path: '/?palette=open',
    viewport: {width: 1440, height: 900},
    check: async (page) => page.getByRole('dialog', {name: 'サイト内検索'}).waitFor(),
  },
  {
    name: '03-manual-top',
    path: '/manuals/fusion',
    viewport: {width: 1440, height: 900},
    check: async (page) => page.getByRole('heading', {name: 'Fusion 日本語リファレンス'}).waitFor(),
  },
  {
    name: '04-article-sidebar-open',
    path: '/manuals/fusion/nodes/merge',
    viewport: {width: 1440, height: 900},
    check: async (page) => page.getByRole('navigation', {name: 'このページの見出し'}).waitFor(),
  },
  {
    name: '05-article-sidebar-closed',
    path: '/manuals/fusion/nodes/merge?sidebar=closed',
    viewport: {width: 1440, height: 900},
    check: async (page) => page.locator('html[data-collectanea-sidebar="collapsed"]').waitFor(),
  },
  {
    name: '06-heading-rail-active',
    path: '/manuals/fusion/nodes/merge#controls',
    viewport: {width: 1440, height: 900},
    after: async (page) => {
      await page.locator('#controls').scrollIntoViewIfNeeded();
      await page.waitForTimeout(450);
      await page.getByRole('link', {name: 'Controls'}).hover();
    },
    check: async (page) => page.locator('a[aria-current="location"]').waitFor(),
  },
  {
    name: '07-home-mobile',
    path: '/',
    device: 'iPhone 13',
    check: async (page) => page.getByRole('heading', {name: 'COLLECTANEA'}).waitFor(),
  },
  {
    name: '08-article-mobile',
    path: '/manuals/fusion/nodes/merge',
    device: 'iPhone 13',
    check: async (page) => page.getByRole('heading', {name: 'Merge'}).waitFor(),
  },
  {
    name: '09-mobile-navigation',
    path: '/manuals/fusion/nodes/merge?mobileNav=open',
    device: 'iPhone 13',
    check: async (page) => page.locator('.navbar-sidebar--show').waitFor(),
  },
];

for (const item of cases) {
  const contextOptions = item.device ? {...devices[item.device]} : {viewport: item.viewport};
  const context = await browser.newContext(contextOptions);
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });

  await page.goto(`${baseUrl}${item.path}`, {waitUntil: 'networkidle'});
  await page.waitForTimeout(550);
  if (item.after) await item.after(page);
  if (item.check) await item.check(page);
  await page.screenshot({path: `${output}/${item.name}.png`, fullPage: true});

  findings.push({name: item.name, url: page.url(), errors});
  await context.close();
}

await browser.close();
await writeFile(`${output}/capture-report.json`, JSON.stringify(findings, null, 2));

const failures = findings.flatMap((item) => item.errors.map((error) => `${item.name}: ${error}`));
if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
}
