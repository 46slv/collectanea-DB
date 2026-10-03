const fs = require('node:fs/promises');
const path = require('node:path');
const {makeCatalog} = require('./model.cjs');
const labels = {manual: 'Manual', article: 'Article', reference: 'Reference', research: 'Research'};
const list = (value) => value == null ? [] : (Array.isArray(value) ? value : [value]).map(String).filter(Boolean);
function date(value) {
  if (value == null || value === '') return null;
  const candidate = typeof value === 'number' ? value * (value < 1e11 ? 1000 : 1) : value;
  const parsed = new Date(candidate);
  if (Number.isNaN(parsed.valueOf())) throw new Error(`Invalid content date: ${value}`);
  return parsed.toISOString().slice(0, 10);
}
function text(raw) {
  return raw.replace(/^\uFEFF?---\s*\r?\n[\s\S]*?\r?\n---\s*(?:\r?\n|$)/, '')
    .replace(/^import\s.+$/gm, '').replace(/<[^>]+>/g, ' ')
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/[#*`~]/g, '').replace(/\s+/g, ' ').trim();
}
function sidebarLabels(sidebars) {
  const result = new Map();
  const walk = (items) => items.forEach((item) => {
    if (typeof item === 'string') return;
    if (item.type === 'category') {
      if (item.link?.type === 'doc') result.set(item.link.id, item.label);
      walk(item.items || []);
    } else if (item.type === 'doc' && item.label) result.set(item.id, item.label);
  });
  Object.values(sidebars || {}).forEach(walk);
  return result;
}
module.exports = function collectaneaCatalog(context, options = {}) {
  let searchModule, catalogModule, catalog;
  async function record(meta, kind, pluginId, navLabels = new Map()) {
    const fm = meta.frontMatter || {};
    const source = String(meta.source || '').replace(/^@site\//, '');
    const file = path.resolve(context.siteDir, source);
    if (!file.startsWith(path.resolve(context.siteDir) + path.sep)) throw new Error(`Source outside site: ${source}`);
    const body = text(await fs.readFile(file, 'utf8'));
    const dirs = String(meta.sourceDirName || '.').split('/').filter((p) => p && p !== '.').map((p) => p.replace(/^\d+-/, ''));
    const leaf = path.basename(source).replace(/\.(md|mdx)$/, '').replace(/^\d+-/, '');
    let material, segments;
    if (kind === 'article') {
      material = typeof fm.material === 'string' ? fm.material : 'articles'; segments = [meta.id || leaf];
    } else if (pluginId === 'default') {
      material = typeof fm.material === 'string' ? fm.material : dirs[0] || null;
      segments = [...dirs.slice(1), ...(leaf === 'index' ? [] : [leaf])];
    } else {
      material = typeof fm.material === 'string' ? fm.material : pluginId;
      segments = [...dirs, ...(leaf === 'index' ? [] : [leaf])];
    }
    const tags = (meta.tags || []).map((tag) => typeof tag === 'string' ? tag : tag.label).filter(Boolean);
    return {
      id: `${kind}:${pluginId}:${meta.id || source}`, source,
      href: meta.permalink, title: meta.title, navTitle: navLabels.get(meta.id) || fm.sidebar_label || meta.title,
      summary: fm.description || meta.description || body.slice(0, 150), kind,
      label: kind === 'manual' && dirs.includes('nodes') && leaf !== 'index' ? 'Node' : labels[kind],
      material, materialTitle: typeof fm.material_title === 'string' ? fm.material_title : (kind === 'article' && material === 'articles' ? 'Articles' : null),
      domain: typeof fm.domain === 'string' ? fm.domain : '', tags,
      docType: typeof fm.doc_type === 'string' ? fm.doc_type : '',
      termId: typeof fm.term_id === 'string' ? fm.term_id.trim() : '',
      termShort: typeof fm.term_short === 'string' ? fm.term_short.trim() : '',
      nodeFamily: typeof fm.node_family === 'string' ? fm.node_family : '',
      level: typeof fm.level === 'string' ? fm.level : '',
      productScope: typeof fm.product_scope === 'string' ? fm.product_scope : '',
      aliases: list(fm.aliases), concepts: list(fm.concepts), patterns: list(fm.patterns), nodes: list(fm.nodes),
      controls: list(fm.controls), inputs: list(fm.inputs), outputs: list(fm.outputs), tasks: list(fm.tasks),
      symptoms: list(fm.symptoms), prerequisites: list(fm.prerequisites), familiarApps: list(fm.familiar_apps),
      familiarTerms: list(fm.familiar_terms), compareTopics: list(fm.compare_topics), suiteSurfaces: list(fm.suite_surfaces),
      updated: date(fm.updated ?? meta.lastUpdatedAt ?? fm.last_update?.date ?? meta.date),
      published: date(meta.date), status: typeof fm.verification === 'string' ? fm.verification : (typeof fm.status === 'string' ? fm.status : null),
      position: meta.sidebarPosition ?? fm.sidebar_position ?? 9999,
      isMaterialRoot: kind !== 'article' && segments.length === 0,
      segments, draft: Boolean(meta.draft || fm.draft), unlisted: Boolean(meta.unlisted || fm.unlisted), body,
    };
  }
  return {
    name: 'collectanea-catalog',
    async allContentLoaded({allContent, actions}) {
      const records = [];
      for (const [id, content] of Object.entries(allContent['docusaurus-plugin-content-docs'] || {})) {
        const versions = content.loadedVersions || [];
        for (const version of versions.filter((v) => v.isLast || versions.length === 1)) {
          const nav = sidebarLabels(version.sidebars);
          const kind = id === 'reference' ? 'reference' : id === 'research' ? 'research' : 'manual';
          for (const meta of version.docs || []) if (!meta.draft && !meta.unlisted) records.push(await record(meta, kind, id, nav));
        }
      }
      for (const [id, content] of Object.entries(allContent['docusaurus-plugin-content-blog'] || {})) {
        const route = options.blogRoutes?.[id];
        if (!route) throw new Error(`Declare the shared blog route for plugin ${id}`);
        const indexHref = `${context.siteConfig.baseUrl}${route}/`.replace(/\/+/g, '/');
        for (const post of content.blogPosts || []) {
          if (post.metadata.draft || post.metadata.unlisted) continue;
          const entry = await record(post.metadata, 'article', id);
          if (entry.material === 'articles') {entry.materialHref = indexHref; entry.materialSummary = content.blogDescription;}
          records.push(entry);
        }
      }
      catalog = makeCatalog(records);
      const {search, ...compact} = catalog;
      searchModule = await actions.createData('search-index.json', JSON.stringify(search));
      catalogModule = await actions.createData('catalog-data.json', JSON.stringify(compact));
    },
    configureWebpack() {
      if (!searchModule || !catalogModule) throw new Error('Catalog lifecycle did not run before webpack. Check the pinned Docusaurus contract.');
      return {resolve: {alias: {'@collectanea/search-index': searchModule, '@collectanea/catalog-data': catalogModule}}};
    },
    async postBuild({outDir}) {
      const {search, ...compact} = catalog;
      await fs.writeFile(path.join(outDir, 'catalog.json'), JSON.stringify(compact));
      await fs.writeFile(path.join(outDir, 'catalog-search.json'), JSON.stringify(search));
    },
  };
};
