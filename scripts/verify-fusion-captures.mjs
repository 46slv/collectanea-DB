import {chromium} from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const ids=process.argv.slice(2).length?process.argv.slice(2):Array.from({length:14},(_,i)=>`S${String(i+1).padStart(2,'0')}`);
const candidates=JSON.parse(await fs.readFile('docs/fusion-screenshot-candidates.json','utf8'));
const out=process.env.CAPTURE_EVIDENCE_DIR||'artifacts/fusion-captures';
await fs.mkdir(out,{recursive:true});
const channel=process.env.CAPTURE_BROWSER_CHANNEL||(process.platform==='win32'?'msedge':undefined);
const browser=await chromium.launch({...(channel?{channel}:{}),headless:true});
const context=await browser.newContext({viewport:{width:1440,height:1000},colorScheme:'dark'});
const page=await context.newPage();
const report={checked_at:new Date().toISOString(),origin:(process.env.CAPTURE_ORIGIN||'http://127.0.0.1:3017').replace(/\/$/,''),checks:[],errors:[]};
const digest=b=>createHash('sha256').update(b).digest('hex');
page.on('pageerror',e=>report.errors.push(String(e)));
try {
 for(const id of ids){
  const candidate=candidates.candidates.find(c=>c.id===id);
  const route=candidate.article.replace(/\.mdx?$/,'');
  const response=await page.goto(`${report.origin}/collectanea-DB/${route}`,{waitUntil:'networkidle'});
  assert.equal(response.status(),200,route);
  const shots=page.locator('article img');
  const manifest=JSON.parse(await fs.readFile(`static/img/fusion/captures/${id}/capture.json`,'utf8'));
  assert.equal(await shots.count(),manifest.shots.length,id+' missing article shots');
  const images=[];
  for(const img of await shots.all()){
   await img.scrollIntoViewIfNeeded();
   await img.evaluate(el=>el.decode());
   images.push(await img.evaluate(el=>({src:el.getAttribute('src').startsWith('data:')?'inline PNG':el.getAttribute('src'),alt:el.alt,width:el.naturalWidth,height:el.naturalHeight,displayWidth:el.getBoundingClientRect().width})));
   const value=images.at(-1);assert.ok(value.width>0&&value.alt.length>5);
   const original=await img.evaluate(el=>el.closest('a')?.href);
   assert.ok(original,'Every shot must open at native resolution');
   const originalAsset=await context.request.get(original);
   assert.equal(originalAsset.status(),200);
   const originalPath=new URL(original).pathname;
   assert.ok(originalPath.startsWith(`/collectanea-DB/img/fusion/captures/${id}/`));
   const localPath='static'+originalPath.slice('/collectanea-DB'.length);
   assert.equal(digest(await originalAsset.body()),digest(await fs.readFile(localPath)),id+' linked crop must match final source');
  }
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1));
  await shots.first().scrollIntoViewIfNeeded();
  await page.screenshot({path:path.join(out,`${id}-desktop.png`)});
  for(const width of [390]){
   await page.setViewportSize({width,height:844});
   await shots.last().scrollIntoViewIfNeeded();
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1));
   await page.screenshot({path:path.join(out,`${id}-mobile.png`)});
  }
  await page.setViewportSize({width:1440,height:1000});
  for(const filename of ['fixture.comp','capture.json','screen.png']){
   const asset=await context.request.get(`${report.origin}/collectanea-DB/img/fusion/captures/${id}/${filename}`);
   assert.equal(asset.status(),200,id+'/'+filename);
   assert.equal(digest(await asset.body()),digest(await fs.readFile(`static/img/fusion/captures/${id}/${filename}`)),id+'/'+filename+' must match final local source');
  }
  report.checks.push({id,status:'PASS',route,images});
 }
 assert.equal(report.errors.length,0);
} catch(e){report.errors.push(String(e));process.exitCode=1;}
finally{await fs.writeFile(path.join(out,'display-report.json'),JSON.stringify(report,null,2));await browser.close();}
console.log(JSON.stringify({checks:report.checks.map(c=>({id:c.id,status:c.status,images:c.images.length})),errors:report.errors},null,2));
