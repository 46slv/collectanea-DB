const {test} = require('node:test');
const assert = require('node:assert/strict');
const {makeCatalog} = require('../plugins/catalog/model.cjs');
const page = (id, extra = {}) => ({id, title: id, href: `/base/${id}`, material: 'manual', kind: 'manual', tags: [], segments: [id], updated: null, ...extra});

test('published inventory excludes draft and unlisted records', () => {
  const data = makeCatalog([page('public'), page('draft', {draft: true}), page('hidden', {unlisted: true})]);
  assert.deepEqual(data.pages.map((p) => p.id), ['public']);
  assert.equal(data.materials[0].pageCount, 1);
  assert.ok(!JSON.stringify(data.search).includes('/base/hidden'));
});
test('ordinary nested records create navigable tree without a handwritten registry', () => {
  const data = makeCatalog([page('root', {segments: [], isMaterialRoot: true}), page('child', {segments: ['nodes', 'child'], href: '/base/custom-slug'})]);
  assert.equal(data.materials[0].tree[0].children[0].href, '/base/custom-slug');
  assert.equal(data.materials[0].pageCount, 2);
});
test('only an explicit material root can establish inherited tags/status', () => {
  const data = makeCatalog([page('root', {isMaterialRoot: true, segments: [], tags: ['software'], status: 'unverified'}), page('child'), page('checked', {status: 'verified'})]);
  assert.deepEqual(data.pages[1].tags, ['software']);
  assert.equal(data.pages[1].status, 'unverified');
  assert.equal(data.pages[2].status, 'verified');
});
test('an arbitrary first article cannot contaminate other article metadata', () => {
  const data = makeCatalog([page('one', {material: 'articles', kind: 'article', tags: ['only-one'], status: 'unverified', materialTitle: 'Articles', materialHref: '/base/articles/'}), page('two', {material: 'articles', kind: 'article'})]);
  assert.deepEqual(data.pages[1].tags, []);
  assert.equal(data.pages[1].status, 'published');
  assert.equal(data.materials[0].href, '/base/articles/');
});
test('recency uses updated metadata, not publication dates or generated timestamps', () => {
  const data = makeCatalog([page('one', {published: '2026-09-30', updated: '2026-01-01'}), page('two', {published: '2020-01-01', updated: '2026-09-29'})]);
  assert.equal(data.materials[0].updated, '2026-09-29');
  assert.equal(makeCatalog([page('unknown')]).materials[0].updated, null);
});
test('search retains body and tag entries, compact navigation omits full body', () => {
  const data = makeCatalog([page('search', {body: '本文だけにある検索語', tags: ['software']})]);
  assert.match(data.search[0].text, /本文だけにある検索語/);
  assert.equal(data.search.find((p) => p.kind === 'tag').tag, 'software');
  assert.ok(!Object.hasOwn(data.pages[0], 'body'));
});
test('semantic metadata is normalized, searchable and exposed as facets', () => {
  const data = makeCatalog([page('semantic', {material: 'fusion', docType: 'node', termId: 'semantic', nodeFamily: 'compositing', aliases: ['Alias'], controls: ['Blend', 'Blend'], tasks: ['composite'], familiarApps: ['nuke']})]);
  assert.deepEqual(data.pages[0].controls, ['Blend']);
  assert.deepEqual(data.semanticFacets.controls, ['Blend']);
  assert.match(data.search[0].text, /Alias/);
  assert.match(data.search[0].text, /composite/);
  assert.match(data.search[0].text, /nuke/);
});
test('Fusion indexes are generated from semantic metadata', () => {
  const data = makeCatalog([
    page('merge', {material: 'fusion', docType: 'node', termId: 'merge', nodeFamily: 'compositing', controls: ['Blend'], inputs: ['image', 'mask'], outputs: ['image'], tasks: ['composite']}),
    page('alpha', {material: 'fusion', docType: 'concept', termId: 'alpha', termShort: 'Alphaの短い説明。', concepts: ['alpha'], tasks: ['composite']}),
    page('blank', {material: 'fusion', docType: 'diagnostic', symptoms: ['nothing-visible'], tasks: ['debug']}),
    page('nuke', {material: 'fusion', docType: 'bridge', familiarApps: ['nuke'], familiarTerms: ['Merge'], suiteSurfaces: ['fusion']}),
  ]);
  assert.equal(data.indexes.nodes[0].title, 'merge');
  assert.equal(data.indexes.controls.find((entry) => entry.key === 'Blend').items[0].title, 'merge');
  assert.equal(data.indexes.tasks.find((entry) => entry.key === 'composite').count, 2);
  assert.equal(data.indexes.symptoms[0].key, 'nothing-visible');
  assert.equal(data.indexes.dataTypes.find((entry) => entry.key === 'image').producers[0].title, 'merge');
  assert.equal(data.indexes.familiarApps[0].key, 'nuke');
  assert.equal(data.indexes.resolveSurfaces[0].key, 'fusion');
  assert.ok(data.indexes.glossary.some((entry) => entry.id === 'merge'));
  assert.ok(data.indexes.glossary.some((entry) => entry.id === 'alpha'));
});

test('term registry is generated from canonical page metadata', () => {
  const data = makeCatalog([
    page('alpha', {material: 'fusion', docType: 'concept', termId: 'alpha', termShort: 'Alphaの短い説明。', aliases: ['alpha channel']}),
  ]);
  assert.equal(data.terms.alpha.title, 'alpha');
  assert.equal(data.terms.alpha.summary, 'Alphaの短い説明。');
  assert.equal(data.terms.alpha.href, '/base/alpha');
  assert.deepEqual(data.terms.alpha.aliases, ['alpha channel']);
  assert.equal(data.indexes.glossary[0].summary, 'Alphaの短い説明。');
  assert.match(data.search[0].text, /Alphaの短い説明/);
});

test('every Fusion concept and node must provide stable term metadata', () => {
  assert.throws(() => makeCatalog([
    page('node', {material: 'fusion', docType: 'node'}),
  ]), /Fusion node is missing term_id/);
  assert.throws(() => makeCatalog([
    page('concept', {material: 'fusion', docType: 'concept', termShort: '短い説明。'}),
  ]), /missing term_id/);
  assert.throws(() => makeCatalog([
    page('concept', {material: 'fusion', docType: 'concept', termId: 'concept'}),
  ]), /missing term_short/);
});
test('term references must resolve to a registered canonical term', () => {
  const data = makeCatalog([
    page('alpha', {material: 'fusion', docType: 'concept', termId: 'alpha', termShort: 'Alphaの短い説明。'}),
    page('reader', {termRefs: ['alpha']}),
  ]);
  assert.equal(data.terms.alpha.href, '/base/alpha');
  assert.throws(() => makeCatalog([
    page('reader', {termRefs: ['missing-term']}),
  ]), /Unknown term id/);
});

test('duplicate term ids fail instead of producing an ambiguous hover target', () => {
  assert.throws(() => makeCatalog([
    page('alpha', {termId: 'shared'}),
    page('mask', {termId: 'shared'}),
  ]), /Duplicate term id/);
});

test('duplicate permalinks and missing titles fail instead of misleading readers', () => {
  assert.throws(() => makeCatalog([page('one'), page('two', {href: '/base/one'})]), /duplicate/);
  assert.throws(() => makeCatalog([page('one', {title: ''})]), /Invalid/);
});
test('one hundred material roots are projected without a component registry', () => {
  const data = makeCatalog(Array.from({length: 100}, (_, i) => page(`m${i}`, {material: `m${i}`, isMaterialRoot: true, segments: []})));
  assert.equal(data.materials.length, 100);
  assert.ok(data.materials.every((m) => m.pageCount === 1));
});
