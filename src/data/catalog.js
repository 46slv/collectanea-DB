export const CONTENT_TYPES = ['All', 'Manual', 'Article', 'Reference', 'Research'];
export const DOMAINS = ['All', 'Software', 'DaVinci', 'Blender', 'Adobe', 'Development'];

export const MATERIALS = [
  {
    id: 'davinci-resolve',
    title: 'DaVinci Resolve',
    summary: '映像編集・カラー・VFXを横断する制作資料。Fusion日本語リファレンスを含みます。',
    kind: 'Manual',
    domain: 'DaVinci',
    tags: ['Software', 'DaVinci', 'Fusion'],
    updated: '2026-09-30',
    href: '/manuals/fusion',
    counts: [
      ['Nodes', 128],
      ['Recipes', 42],
      ['Concepts', 18],
    ],
  },
  {
    id: 'blender',
    title: 'Blender',
    summary: 'Geometry Nodes、モデリング、procedural assemblyの実践資料。',
    kind: 'Manual',
    domain: 'Blender',
    tags: ['Software', 'Blender', '3D'],
    updated: '2026-09-29',
    href: '/research',
    counts: [
      ['Geometry Nodes', 62],
      ['Modeling', 48],
      ['Research', 18],
    ],
  },
  {
    id: 'after-effects',
    title: 'After Effects',
    summary: 'Expression、scripting、motion graphicsの参照資料。',
    kind: 'Reference',
    domain: 'Adobe',
    tags: ['Software', 'Adobe', 'Motion'],
    updated: '2026-09-27',
    href: '/reference',
    counts: [
      ['Expressions', 56],
      ['Scripting', 24],
      ['Workflow', 20],
    ],
  },
  {
    id: 'cavalry',
    title: 'Cavalry',
    summary: 'リアルタイムモーショングラフィックスをAE基準で読み替える資料。',
    kind: 'Manual',
    domain: 'Software',
    tags: ['Software', 'Motion', 'Procedural'],
    updated: '2026-09-25',
    href: '/manuals',
    counts: [
      ['Basics', 18],
      ['Advanced', 12],
      ['Recipes', 10],
    ],
  },
  {
    id: 'git-github',
    title: 'Git / GitHub',
    summary: '履歴管理、collaboration、CI、運用判断のリファレンス。',
    kind: 'Reference',
    domain: 'Development',
    tags: ['Software', 'Git', 'Development'],
    updated: '2026-09-28',
    href: '/reference',
    counts: [
      ['Git', 42],
      ['GitHub', 28],
      ['CI', 16],
    ],
  },
  {
    id: 'development',
    title: 'Development',
    summary: '開発環境、tooling、UI、automationに関する技術記事と調査。',
    kind: 'Research',
    domain: 'Development',
    tags: ['Development', 'Tooling', 'UI'],
    updated: '2026-09-24',
    href: '/research',
    counts: [
      ['Tooling', 32],
      ['Workflow', 20],
      ['UI', 14],
    ],
  },
];

export const FUSION_TREE = [
  {id: 'getting-started', title: 'はじめに', href: '/manuals/fusion/getting-started'},
  {
    id: 'concepts',
    title: 'Concepts',
    href: '/manuals/fusion/concepts',
    children: [
      {id: 'concepts-data', title: 'Image / Mask / Data', href: '/manuals/fusion/concepts#image--mask--data'},
      {id: 'concepts-alpha', title: 'Alphaと合成', href: '/manuals/fusion/concepts#alphaと合成'},
      {id: 'concepts-coordinates', title: '座標とCenter', href: '/manuals/fusion/concepts#座標とcenter'},
    ],
  },
  {
    id: 'nodes',
    title: 'Nodes',
    href: '/manuals/fusion/nodes',
    children: [
      {
        id: 'nodes-compositing',
        title: 'Compositing',
        href: '/manuals/fusion/nodes#compositing',
        children: [
          {id: 'merge', title: 'Merge', href: '/manuals/fusion/nodes/merge'},
          {id: 'channel-booleans', title: 'Channel Booleans', href: '/manuals/fusion/nodes#channel-booleans'},
        ],
      },
      {
        id: 'nodes-generator',
        title: 'Generator',
        href: '/manuals/fusion/nodes#generator',
        children: [
          {id: 'background', title: 'Background', href: '/manuals/fusion/nodes/background'},
          {id: 'text-plus', title: 'Text+', href: '/manuals/fusion/nodes#text'},
        ],
      },
      {
        id: 'nodes-transform',
        title: 'Transform',
        href: '/manuals/fusion/nodes#transform',
        children: [
          {id: 'transform', title: 'Transform', href: '/manuals/fusion/nodes/transform'},
          {id: 'resize', title: 'Resize', href: '/manuals/fusion/nodes#resize'},
        ],
      },
    ],
  },
  {
    id: 'expressions',
    title: 'Expressions',
    href: '/manuals/fusion/expressions',
    children: [
      {id: 'expression-reference', title: '他ノードを参照する', href: '/manuals/fusion/expressions#他ノードを参照する'},
      {id: 'expression-layout', title: '値を連動する', href: '/manuals/fusion/expressions#値を連動する'},
    ],
  },
  {
    id: 'recipes',
    title: 'Recipes',
    href: '/manuals/fusion/recipes',
    children: [
      {id: 'recipe-circle', title: '線だけの円', href: '/manuals/fusion/recipes#線だけの円'},
      {id: 'recipe-sync', title: '位置を同期する', href: '/manuals/fusion/recipes#位置を同期する'},
    ],
  },
  {id: 'troubleshooting', title: 'Troubleshooting', href: '/manuals/fusion/troubleshooting'},
];

export function flattenTree(nodes, parent = []) {
  return nodes.flatMap((node) => {
    const hierarchy = [...parent, node.title];
    const current = {...node, hierarchy};
    return [current, ...flattenTree(node.children ?? [], hierarchy)];
  });
}

const MATERIAL_SEARCH = MATERIALS.map((material) => ({
  id: `material-${material.id}`,
  title: material.title,
  summary: material.summary,
  type: material.kind,
  domain: material.domain,
  tags: material.tags,
  hierarchy: material.title,
  href: material.href,
}));

const FUSION_SEARCH = flattenTree(FUSION_TREE).map((item) => ({
  id: `fusion-${item.id}`,
  title: item.title,
  summary: item.children?.length ? `${item.children.length}件の下位項目` : 'Fusion日本語リファレンス',
  type: item.children?.length ? 'Page' : 'Reference',
  domain: 'DaVinci',
  tags: ['Software', 'DaVinci', 'Fusion'],
  hierarchy: ['Fusion', ...item.hierarchy].join(' › '),
  href: item.href,
}));

export const SEARCH_ENTRIES = [
  ...MATERIAL_SEARCH,
  ...FUSION_SEARCH,
  {
    id: 'article-circle',
    title: 'Fusionで線だけの円を作る',
    summary: 'EllipseとBackgroundを使った基本構成。',
    type: 'Article',
    domain: 'DaVinci',
    tags: ['Fusion', 'Recipe'],
    hierarchy: 'Articles › DaVinci › Fusion',
    href: '/articles/collectanea-start',
  },
  {
    id: 'reference-glossary',
    title: 'Technical Glossary',
    summary: '制作・CG・開発の用語を横断するリファレンス。',
    type: 'Reference',
    domain: 'Development',
    tags: ['Reference', 'Glossary'],
    hierarchy: 'Reference',
    href: '/reference',
  },
];
