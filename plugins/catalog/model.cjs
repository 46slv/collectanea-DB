// Pure projection; Docusaurus owns parsing, permalinks and publication rules.
const collator = new Intl.Collator('ja', {numeric: true});
const unique = (values) => [...new Set((values || []).filter(Boolean))];
const asList = (value) => value == null ? [] : Array.isArray(value) ? value : [value];
const compare = (a, b) => (a.position ?? 9999) - (b.position ?? 9999) || collator.compare(a.title, b.title);
const semanticListFields = [
  'aliases', 'concepts', 'patterns', 'nodes', 'controls', 'inputs', 'outputs',
  'tasks', 'symptoms', 'prerequisites', 'familiarApps', 'familiarTerms',
  'compareTopics', 'suiteSurfaces',
];

function makeTree(pages) {
  const root = {children: new Map()};
  for (const page of pages) {
    if (!page.segments.length) continue;
    let node = root, key = '';
    for (const segment of page.segments) {
      key += `/${segment}`;
      if (!node.children.has(segment)) node.children.set(segment, {id: key, title: segment, href: null, children: new Map()});
      node = node.children.get(segment);
    }
    Object.assign(node, {title: page.navTitle || page.title, href: page.href, position: page.position, pageId: page.id});
  }
  const serialize = (node) => [...node.children.values()].map(({children, ...item}) => ({...item, children: serialize({children})})).sort(compare);
  return serialize(root);
}

function normalizedPage(record) {
  const page = {...record, tags: unique(asList(record.tags).map(String)), segments: record.segments || []};
  for (const field of semanticListFields) page[field] = unique(asList(record[field]).map(String));
  return page;
}

const typeRank = {recipe: 0, pattern: 1, diagnostic: 2, concept: 3, node: 4, bridge: 5, start: 6, index: 7};
const semanticRow = (page) => ({
  id: page.id, title: page.title, href: page.href, summary: page.summary,
  docType: page.docType || '', nodeFamily: page.nodeFamily || '', status: page.status || '',
  level: page.level || '', productScope: page.productScope || '',
  aliases: page.aliases, concepts: page.concepts, patterns: page.patterns, nodes: page.nodes,
  controls: page.controls, inputs: page.inputs, outputs: page.outputs, tasks: page.tasks,
  symptoms: page.symptoms, prerequisites: page.prerequisites, familiarApps: page.familiarApps,
  familiarTerms: page.familiarTerms, compareTopics: page.compareTopics, suiteSurfaces: page.suiteSurfaces,
});
const semanticCompare = (a, b) => (typeRank[a.docType] ?? 99) - (typeRank[b.docType] ?? 99) || collator.compare(a.title, b.title);
function groupedRows(pages, field) {
  const groups = new Map();
  for (const page of pages) for (const key of page[field] || []) {
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(semanticRow(page));
  }
  return [...groups].map(([key, items]) => ({key, count: items.length, items: items.sort(semanticCompare)})).sort((a, b) => collator.compare(a.key, b.key));
}
function dataTypeRows(nodes) {
  const keys = unique(nodes.flatMap((page) => [...page.inputs, ...page.outputs])).sort(collator.compare);
  return keys.map((key) => ({
    key,
    count: nodes.filter((page) => page.inputs.includes(key) || page.outputs.includes(key)).length,
    producers: nodes.filter((page) => page.outputs.includes(key)).map(semanticRow).sort(semanticCompare),
    consumers: nodes.filter((page) => page.inputs.includes(key)).map(semanticRow).sort(semanticCompare),
  }));
}
function makeTerms(pages) {
  const terms = {};
  for (const page of pages) {
    const id = String(page.termId || '').trim();
    const short = String(page.termShort || '').trim();
    if (page.material === 'fusion' && ['concept', 'node'].includes(page.docType) && !id) {
      throw new Error(`Fusion ${page.docType} is missing term_id: ${page.source || page.id}`);
    }
    if (page.material === 'fusion' && page.docType === 'concept' && !short) {
      throw new Error(`Fusion concept is missing term_short: ${page.source || page.id}`);
    }
    if (!id) continue;
    if (terms[id]) throw new Error(`Duplicate term id: ${id}`);
    terms[id] = {
      id,
      title: page.title,
      summary: short || page.summary,
      href: page.href,
      aliases: page.aliases || [],
      status: page.status || '',
    };
  }
  return terms;
}
function validateTermRefs(pages, terms) {
  for (const page of pages) for (const id of page.termRefs || []) {
    if (!terms[id]) throw new Error(`Unknown term id "${id}" referenced by ${page.source || page.id}`);
  }
}

function makeIndexes(pages) {
  const fusion = pages.filter((page) => page.material === 'fusion');
  const nodes = fusion.filter((page) => page.docType === 'node');
  const concepts = fusion.filter((page) => page.docType === 'concept');
  return {
    nodes: nodes.map(semanticRow).sort((a, b) => collator.compare(a.title, b.title)),
    concepts: concepts.map(semanticRow).sort((a, b) => collator.compare(a.title, b.title)),
    controls: groupedRows(nodes, 'controls'),
    tasks: groupedRows(fusion.filter((page) => page.docType !== 'index'), 'tasks'),
    symptoms: groupedRows(fusion.filter((page) => page.docType === 'diagnostic'), 'symptoms'),
    dataTypes: dataTypeRows(nodes),
    glossary: [...concepts, ...nodes].map((page) => ({...semanticRow(page), summary: page.termShort || page.summary})).sort((a, b) => collator.compare(a.title, b.title)),
    resolveSurfaces: groupedRows(fusion, 'suiteSurfaces'),
    familiarApps: groupedRows(fusion, 'familiarApps'),
  };
}

function makeCatalog(records) {
  const seen = new Set();
  const pages = records.filter((r) => !r.draft && !r.unlisted).map((record) => {
    if (!record.href || !record.title || seen.has(record.href)) throw new Error(`Invalid/duplicate catalog route: ${record.href}`);
    seen.add(record.href);
    return normalizedPage(record);
  });
  const groups = new Map();
  for (const page of pages) {
    if (!page.material) continue;
    if (!groups.has(page.material)) groups.set(page.material, []);
    groups.get(page.material).push(page);
  }
  const materials = [];
  for (const [id, members] of groups) {
    const explicitRoot = members.find((p) => p.isMaterialRoot);
    const root = explicitRoot || [...members].sort(compare)[0];
    for (const page of members) {
      page.tags = unique([...(explicitRoot?.tags || []), ...page.tags]);
      page.domain = page.domain || explicitRoot?.domain || '';
      page.status = page.status || explicitRoot?.status || 'published';
      page.materialTitle = explicitRoot?.materialTitle || explicitRoot?.title || root.materialTitle || root.title;
    }
    materials.push({
      id, title: root.materialTitle || root.title, summary: root.materialSummary || root.summary,
      href: root.materialHref || root.href, kind: root.kind, domain: root.domain,
      tags: unique(members.flatMap((p) => [...p.tags, p.domain])), status: explicitRoot?.status || 'published',
      updated: members.map((p) => p.updated).filter(Boolean).sort().at(-1) || null,
      pageCount: members.length, tree: makeTree(members.filter((p) => p.kind === root.kind)),
    });
  }
  const terms = makeTerms(pages);
  validateTermRefs(pages, terms);
  const facets = unique(pages.flatMap((p) => [...p.tags, p.domain])).sort(collator.compare);
  const semanticFacets = Object.fromEntries(semanticListFields.map((field) => [field, unique(pages.flatMap((p) => p[field] || [])).sort(collator.compare)]));
  const search = pages.map((p) => ({
    ...p,
    text: [
      p.title, p.materialTitle, p.summary, p.body, p.docType, p.nodeFamily, p.level, p.productScope, p.termId, p.termShort,
      ...p.tags, ...semanticListFields.flatMap((field) => p[field] || []),
    ].filter(Boolean).join(' '),
  }));
  for (const tag of facets) search.push({id: `tag:${tag}`, title: tag, kind: 'tag', label: 'Tag', tag, tags: [tag], summary: 'このタグで絞り込む', text: tag});
  const compact = pages.map(({body, draft, unlisted, termRefs, ...page}) => page);
  return {pages: compact, materials, facets, semanticFacets, indexes: makeIndexes(pages), terms, search};
}
module.exports = {makeCatalog, makeTree, makeIndexes, makeTerms, validateTermRefs};
