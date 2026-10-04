import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';

const require = createRequire(path.resolve('package.json'));
const {chromium, expect} = require('@playwright/test');
const out = 'artifacts/reader-first-final';
await fs.mkdir(out, {recursive:true});

const report = {
  status:'RUNNING',
  expected: process.env.CC_EXPECTED_SHA,
  tested: execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),
  checks:[],
  pages:[],
  errors:[]
};

async function walk(dir) {
  const out=[];
  for (const ent of await fs.readdir(dir,{withFileTypes:true})) {
    const p=path.join(dir,ent.name);
    if (ent.isDirectory()) out.push(...await walk(p));
    else if (ent.isFile() && ent.name.endsWith('.md')) out.push(p);
  }
  return out;
}

const origin='http://127.0.0.1:3000';
const base='/collectanea-DB';
let browser;

try {
  assert.equal(report.tested, report.expected, 'Wrong exact candidate');

  const nodeFiles=(await walk('manuals/fusion/nodes')).filter((p)=>!p.endsWith('/index.md'));
  assert.equal(nodeFiles.length,420,'Unexpected node/related-element page count');

  const legacy='このページはノードを選ぶための役割・データ領域・系譜を先に揃えています。';
  const catalogBoilerplate='この項目はカタログ上、**';
  const remaining=[];
  for (const p of nodeFiles) {
    const c=await fs.readFile(p,'utf8');
    if (c.includes(legacy) || c.includes(catalogBoilerplate)) remaining.push(p);
  }
  assert.deepEqual(remaining,[],'Legacy generated template remains');
  report.checks.push('420 node/related-element pages; no legacy generated-template markers');

  const catalog=JSON.parse(await fs.readFile('build/catalog.json','utf8'));
  const search=JSON.parse(await fs.readFile('build/catalog-search.json','utf8'));
  assert.equal(catalog.indexes.nodes.length,420,'Built catalog node count');
  assert.equal(Object.keys(catalog.terms).length,new Set(Object.keys(catalog.terms)).size,'Term ids unique');

  for (const term of ['shape-data','particle-data','classic-3d','usd-scene','deep-image','mask','image']) {
    assert.ok(catalog.terms[term], 'Missing canonical term: '+term);
  }

  const wanted=[
    'ノードリファレンス（Node Reference）',
    'Shapeノード',
    'Particleノード',
    'Classic 3Dノード',
    'USDノード',
    'Deep / Auxiliary Channelノード',
    'Krokodoveの画像・Shape・3D・Region',
    'Modifier',
    'Paintノード',
    'Warp / Distortノード',
    'Colorノード',
    'Trackingノード',
    'sRectangle',
    'Expression',
    'Optical Flow',
    'Paint',
    'Displace',
    'Duplicate'
  ];

  const selected=[];
  for (const title of wanted) {
    const matches=catalog.pages.filter((p)=>p.title===title);
    if (title==='Duplicate') {
      assert.ok(matches.length>=2,'Expected same-name Duplicate pages across families');
      const kd=matches.find((p)=>p.nodeFamily==='krokodove');
      assert.ok(kd,'Missing Krokodove Duplicate');
      selected.push(kd);
      continue;
    }
    assert.equal(matches.length,1,'Expected one page: '+title);
    selected.push(matches[0]);
  }
  for (const p of selected) {
    assert.ok(search.some((x)=>x.href===p.href),'Missing search entry: '+p.title);
  }
  report.checks.push('Representative family, detailed, and source-limited pages are indexed and searchable');

  browser=await chromium.launch();
  const context=await browser.newContext({viewport:{width:1440,height:1000}});
  await context.route('https://fonts.googleapis.com/**',(route)=>route.abort());
  const page=await context.newPage();
  page.on('pageerror',(e)=>report.errors.push(String(e)));
  page.on('console',(m)=>{ if(m.type()==='error' && /hydration|Minified React|uncaught/i.test(m.text())) report.errors.push(m.text()); });

  for (const entry of selected) {
    const response=await page.goto(origin+entry.href,{waitUntil:'networkidle'});
    assert.equal(response.status(),200,entry.href);
    await expect(page.locator('.theme-doc-markdown h1')).toHaveText(entry.title);
    const body=await page.locator('.theme-doc-markdown').innerText();
    assert.ok(body.length>180,'Page too thin: '+entry.title);
    report.pages.push({title:entry.title,href:entry.href,textLength:body.length});
  }
  report.checks.push('Representative pages render successfully');

  for (const width of [1440,390]) {
    await page.setViewportSize({width,height:width===390?844:1000});
    for (const title of ['ノードリファレンス（Node Reference）','Shapeノード','USDノード','Modifier','Krokodoveの画像・Shape・3D・Region','Expression']) {
      const entry=selected.find((p)=>p.title===title);
      await page.goto(origin+entry.href,{waitUntil:'networkidle'});
      const bounds=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));
      assert.ok(bounds.scroll<=bounds.client+1,'Horizontal overflow '+width+' '+title);
    }
  }
  report.checks.push('Desktop/mobile representative pages have no page-level horizontal overflow');

  const sr=selected.find((p)=>p.title==='sRectangle');
  await page.goto(origin+sr.href,{waitUntil:'networkidle'});
  const shapeTerm=page.locator('[data-term-id="shape-data"]').first();
  if (await shapeTerm.count()) {
    await expect(shapeTerm).toBeVisible();
    await shapeTerm.locator('.cc-term-trigger').hover();
    await expect(shapeTerm.locator('.cc-term-popover')).toBeVisible();
  }

  await page.goto(origin+base+'/manuals/fusion/index/node-a-z',{waitUntil:'networkidle'});
  const index=page.locator('[data-cc-fusion-index="nodes"]');
  await expect(index).toBeVisible();
  const input=index.getByLabel('この索引を絞り込む',{exact:true});
  for (const title of ['Merge','sRectangle','Expression','uRenderer','dMerge','Optical Flow']) {
    await input.fill(title);
    await expect(index.getByRole('link',{name:title,exact:true}).first()).toBeVisible();
  }
  report.checks.push('Node A-Z finds representative core and migrated pages');

  assert.deepEqual(report.errors,[],'Browser errors');
  report.status='PASS';
} catch (e) {
  report.status='FAIL';
  report.error=String(e);
  process.exitCode=1;
} finally {
  await browser?.close();
  await fs.writeFile(path.join(out,'report.json'),JSON.stringify(report,null,2));
  console.log(JSON.stringify(report,null,2));
}
