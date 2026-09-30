import generated from './generated-catalog.json';

export const GENERATED_CANDIDATE = generated.candidate ?? 'unknown';
export const CATALOG_PAGES = generated.pages ?? [];

export const CONTENT_TYPES = ['All', 'Manual', 'Article', 'Reference', 'Research'];
export const DOMAINS = ['All', 'DaVinci', 'Fusion', 'Development', 'collectanea', 'documentation'];

function pagesForMaterial(materialId) {
  return CATALOG_PAGES.filter((page) => page.material === materialId);
}

function latestUpdate(pages) {
  const dates = pages.map((page) => page.updated).filter(Boolean).sort();
  return dates.length ? dates[dates.length - 1] : null;
}

// Materials are derived from the generated page catalog. Page counts are
// counts of real Markdown/MDX pages (heading anchors are never counted).
// Subjects without authored content are explicitly planned and carry no
// fabricated dates, counts, or destination links.
export const MATERIALS = [
  {
    id: 'fusion-manual',
    title: 'Fusion 日本語リファレンス',
    summary: 'DaVinci Resolve Fusionの概念・ノード・Expression・レシピを日本語で整理する非公式ドラフト。',
    kind: 'Manual',
    domain: 'DaVinci',
    tags: ['DaVinci', 'Fusion', 'Manual'],
    updated: latestUpdate(pagesForMaterial('fusion-manual')),
    href: '/manuals/fusion',
    status: 'draft',
    pageCount: pagesForMaterial('fusion-manual').length,
  },
  {
    id: 'articles',
    title: 'Articles',
    summary: '制作・CG・開発の技術記事。時系列ではなく検索・タグ・更新順のDBとして読む。',
    kind: 'Article',
    domain: 'Development',
    tags: ['Article'],
    updated: latestUpdate(pagesForMaterial('articles')),
    href: '/articles',
    status: 'active',
    pageCount: pagesForMaterial('articles').length,
  },
  {
    id: 'reference',
    title: 'Reference',
    summary: '用語・仕様・式を素早く引くための資料。',
    kind: 'Reference',
    domain: 'Development',
    tags: ['Reference'],
    updated: latestUpdate(pagesForMaterial('reference')),
    href: '/reference',
    status: 'active',
    pageCount: pagesForMaterial('reference').length,
  },
  {
    id: 'research',
    title: 'Research',
    summary: '調査・比較・検証の記録。結論だけでなく根拠へ戻れる形で残す。',
    kind: 'Research',
    domain: 'Development',
    tags: ['Research'],
    updated: latestUpdate(pagesForMaterial('research')),
    href: '/research',
    status: 'active',
    pageCount: pagesForMaterial('research').length,
  },
  {
    id: 'blender',
    title: 'Blender',
    summary: '計画中 — 著者コンテンツが追加されるまで空のまま保持する。',
    kind: 'Manual',
    domain: 'Blender',
    tags: ['Blender'],
    updated: null,
    href: null,
    status: 'planned',
    pageCount: 0,
  },
  {
    id: 'after-effects',
    title: 'After Effects',
    summary: '計画中 — 著者コンテンツが追加されるまで空のまま保持する。',
    kind: 'Reference',
    domain: 'Adobe',
    tags: ['Adobe'],
    updated: null,
    href: null,
    status: 'planned',
    pageCount: 0,
  },
  {
    id: 'cavalry',
    title: 'Cavalry',
    summary: '計画中 — 著者コンテンツが追加されるまで空のまま保持する。',
    kind: 'Manual',
    domain: 'Motion',
    tags: ['Motion'],
    updated: null,
    href: null,
    status: 'planned',
    pageCount: 0,
  },
  {
    id: 'git-github',
    title: 'Git / GitHub',
    summary: '計画中 — 著者コンテンツが追加されるまで空のまま保持する。',
    kind: 'Reference',
    domain: 'Development',
    tags: ['Git'],
    updated: null,
    href: null,
    status: 'planned',
    pageCount: 0,
  },
];

// Manual tree contains only routes present in the generated catalog.
// No heading-fragment links: every href is a real page route.
export const FUSION_TREE = [
  {id: 'getting-started', title: 'はじめに', href: '/manuals/fusion/getting-started'},
  {id: 'concepts', title: 'Concepts', href: '/manuals/fusion/concepts'},
  {
    id: 'nodes',
    title: 'Nodes',
    href: '/manuals/fusion/nodes',
    children: [
      {id: 'nodes-merge', title: 'Merge', href: '/manuals/fusion/nodes/merge'},
      {id: 'nodes-background', title: 'Background', href: '/manuals/fusion/nodes/background'},
      {id: 'nodes-transform', title: 'Transform', href: '/manuals/fusion/nodes/transform'},
    ],
  },
  {id: 'expressions', title: 'Expressions', href: '/manuals/fusion/expressions'},
  {id: 'recipes', title: 'Recipes', href: '/manuals/fusion/recipes'},
  {id: 'troubleshooting', title: 'Troubleshooting', href: '/manuals/fusion/troubleshooting'},
];

export function flattenTree(nodes, parent = []) {
  return nodes.flatMap((node) => {
    const hierarchy = [...parent, node.title];
    const current = {...node, hierarchy};
    return [current, ...flattenTree(node.children ?? [], hierarchy)];
  });
}

function hierarchyFor(page) {
  if (page.route.startsWith('/manuals/fusion')) {
    const rest = page.route.replace('/manuals/fusion', '').replace(/^\//, '').replace(/\//g, ' › ');
    return rest ? `Fusion › ${rest}` : 'Fusion';
  }
  if (page.route.startsWith('/manuals')) return 'Manuals';
  if (page.route.startsWith('/articles')) return 'Articles';
  if (page.route.startsWith('/reference')) return 'Reference';
  if (page.route.startsWith('/research')) return 'Research';
  return 'Site';
}

function domainFor(page) {
  if (page.material === 'fusion-manual') return 'DaVinci';
  if (page.type === 'Article') return 'Development';
  return 'Development';
}

// The single authoritative search model: real pages only. New Markdown files
// appear here after `npm run catalog` without touching component data.
export const SEARCH_ENTRIES = CATALOG_PAGES.filter((page) => page.route !== '/manuals/fusion').map((page) => ({
  id: `page-${page.route}`,
  title: page.title,
  summary: page.description ?? '',
  type: page.type,
  domain: domainFor(page),
  tags: page.tags ?? [],
  hierarchy: hierarchyFor(page),
  href: page.route,
  updated: page.updated ?? null,
}));

export function recentPages(limit = 4) {
  return [...CATALOG_PAGES]
    .filter((page) => page.route !== '/manuals' && page.route !== '/manuals/fusion')
    .sort((a, b) => (b.updated ?? '').localeCompare(a.updated ?? ''))
    .slice(0, limit);
}
