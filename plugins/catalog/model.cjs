// Pure projection; Docusaurus owns parsing, permalinks and publication rules.
const collator = new Intl.Collator('ja', {numeric: true});
const unique = (values) => [...new Set(values.filter(Boolean))];
const compare = (a, b) => (a.position ?? 9999) - (b.position ?? 9999) || collator.compare(a.title, b.title);

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

function makeCatalog(records) {
  const seen = new Set();
  const pages = records.filter((r) => !r.draft && !r.unlisted).map((record) => {
    if (!record.href || !record.title || seen.has(record.href)) throw new Error(`Invalid/duplicate catalog route: ${record.href}`);
    seen.add(record.href);
    return {...record, tags: unique(record.tags || []), segments: record.segments || []};
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
    // Only a real material root establishes inherited metadata. An arbitrary
    // first article must not donate its tags/status to all other articles.
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
  const facets = unique(pages.flatMap((p) => [...p.tags, p.domain])).sort(collator.compare);
  const search = pages.map((p) => ({...p, text: [p.title, p.materialTitle, p.summary, p.body, ...p.tags].filter(Boolean).join(' ')}));
  for (const tag of facets) search.push({id: `tag:${tag}`, title: tag, kind: 'tag', label: 'Tag', tag, tags: [tag], summary: 'このタグで絞り込む', text: tag});
  const compact = pages.map(({body, draft, unlisted, ...page}) => page);
  return {pages: compact, materials, facets, search};
}
module.exports = {makeCatalog, makeTree};
