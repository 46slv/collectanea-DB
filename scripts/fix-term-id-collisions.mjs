import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const nodesRoot = path.join(root, "manuals", "fusion", "nodes");
const reportDir = path.join(root, "artifacts", "reader-first-migration");

async function walk(dir) {
  const out = [];
  for (const ent of await fs.readdir(dir, {withFileTypes:true})) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...await walk(p));
    else if (ent.isFile() && ent.name.endsWith(".md") && ent.name !== "index.md") out.push(p);
  }
  return out;
}

function termId(content) {
  const m = content.match(/^term_id:\s*["']?([^"'\n]+)["']?\s*$/m);
  return m ? m[1].trim() : "";
}

function setTermId(content, id) {
  return content.replace(/^term_id:\s*.*$/m, 'term_id: "' + id + '"');
}

await fs.mkdir(reportDir, {recursive:true});
const files = await walk(nodesRoot);
const entries = [];
for (const file of files) {
  const content = await fs.readFile(file, "utf8");
  const id = termId(content);
  if (id) entries.push({file, content, id, category:path.relative(nodesRoot,file).split(path.sep)[0]});
}

const groups = new Map();
for (const e of entries) {
  if (!groups.has(e.id)) groups.set(e.id, []);
  groups.get(e.id).push(e);
}

const changes = [];
const unresolved = [];
const used = new Set(entries.map((e)=>e.id));

for (const [id, list] of groups) {
  if (list.length < 2) continue;
  const krok = list.filter((e)=>e.category === "krokodove");
  const non = list.filter((e)=>e.category !== "krokodove");
  if (!krok.length || !non.length) {
    unresolved.push({id, files:list.map((e)=>path.relative(root,e.file))});
    continue;
  }
  for (const e of krok) {
    let next = "krokodove-" + id;
    if (used.has(next)) {
      const stem = path.basename(e.file, ".md").replace(/[^a-zA-Z0-9-]+/g, "-").toLowerCase();
      next = "krokodove-" + stem;
    }
    if (used.has(next)) {
      unresolved.push({id, file:path.relative(root,e.file), reason:"prefixed id also collides"});
      continue;
    }
    const updated = setTermId(e.content, next);
    await fs.writeFile(e.file, updated);
    used.add(next);
    changes.push({file:path.relative(root,e.file), from:id, to:next});
  }
}

const after = new Map();
for (const file of files) {
  const content = await fs.readFile(file, "utf8");
  const id = termId(content);
  if (!id) continue;
  if (!after.has(id)) after.set(id, []);
  after.get(id).push(path.relative(root,file));
}
const remaining = [...after].filter(([,xs])=>xs.length>1).map(([id,xs])=>({id,files:xs}));

const report = {status: remaining.length===0 && unresolved.length===0 ? "PASS":"FAIL",changes,unresolved,remaining};
await fs.writeFile(path.join(reportDir,"term-id-collisions.json"),JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
if(report.status!=="PASS") process.exitCode=1;
