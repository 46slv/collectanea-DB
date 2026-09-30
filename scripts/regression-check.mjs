import {readFileSync} from 'node:fs';
import {join, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const generated = JSON.parse(readFileSync(join(root, 'src', 'data', 'generated-catalog.json'), 'utf8'));
const catalogSource = readFileSync(join(root, 'src', 'data', 'catalog.js'), 'utf8');
const failures = [];

const routes = new Set(generated.pages.map((page) => page.route));

// R1: no heading-fragment hrefs authored in the catalog source.
const fragmentHrefs = [...catalogSource.matchAll(/href:\s*['"`]([^'"`]*#[^'"`]*)['"`]/g)].map((m) => m[1]);
if (fragmentHrefs.length) failures.push(`fragment hrefs in catalog.js: ${fragmentHrefs.join(', ')}`);

// R1: the mislabeled fixture must be gone; the real article stays in the
// generated model (change locality: titles live in Markdown, not components).
if (catalogSource.includes('Fusionで線だけの円を作る')) {
  failures.push('mislabeled circle-tutorial search entry still present');
}
const realArticle = generated.pages.find((page) => page.route === '/articles/collectanea-start');
if (!realArticle || realArticle.title !== 'COLLECTANEAを始める') {
  failures.push('real article /articles/collectanea-start missing or mislabeled in generated catalog');
}

// R1: fabricated counts from the prior candidate must be gone.
for (const fake of ['128', '42', '62', '48', '56']) {
  if (new RegExp(`\\['Nodes',\\s*${fake}\\]|\\['Recipes',\\s*${fake}\\]`).test(catalogSource)) {
    failures.push(`fabricated count still present: ${fake}`);
  }
}

// R1: planned materials are explicit and empty.
for (const id of ['blender', 'after-effects', 'cavalry', 'git-github']) {
  if (!catalogSource.includes(`id: '${id}'`)) failures.push(`planned material missing: ${id}`);
}
if (!catalogSource.includes("status: 'planned'")) failures.push('planned status marker missing');
if (!catalogSource.includes('href: null')) failures.push('planned empty-href marker missing');

// R1: search model derives from generated pages (change locality).
if (!catalogSource.includes('generated-catalog.json')) failures.push('catalog.js no longer derives from generated-catalog.json');
if (!catalogSource.includes('CATALOG_PAGES')) failures.push('authoritative CATALOG_PAGES export missing');

// Sanity: generated routes look real.
for (const expected of ['/manuals/fusion', '/manuals/fusion/nodes/merge', '/articles/collectanea-start', '/reference', '/research']) {
  if (!routes.has(expected)) failures.push(`generated catalog missing route: ${expected}`);
}

if (failures.length) {
  console.error(`regression-check: ${failures.length} failure(s)`);
  for (const failure of failures) console.error(` - ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`regression-check: passed (${generated.pages.length} pages indexed)`);
}
