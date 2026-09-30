const {themes: prismThemes} = require('prism-react-renderer');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'COLLECTANEA',
  tagline: 'Technical manuals, articles, references, and research.',
  favicon: 'img/favicon.svg',

  url: 'https://46slv.github.io',
  baseUrl: '/collectanea-DB/',
  organizationName: '46slv',
  projectName: 'collectanea-DB',

  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'ja',
    locales: ['ja'],
  },

  // Webfonts load here with display=swap so text never blocks on fonts.
  // The single site search is the owned GlobalSearch palette (Root.js);
  // the duplicate navbar search-local theme was removed in R2.
  stylesheets: [
    {
      href: 'https://fonts.googleapis.com/css2?family=Lexend:wght@400;500;600&family=Noto+Sans+JP:wght@400;500;600&display=swap',
      type: 'text/css',
      rel: 'stylesheet',
    },
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          path: 'manuals',
          routeBasePath: 'manuals',
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: 'https://github.com/46slv/collectanea-DB/edit/main/',
          showLastUpdateAuthor: true,
          showLastUpdateTime: true,
        },
        blog: {
          path: 'articles',
          routeBasePath: 'articles',
          blogTitle: 'Articles',
          blogDescription: '制作・CG・開発に関する技術記事',
          blogSidebarTitle: 'Articles',
          blogSidebarCount: 'ALL',
          postsPerPage: 12,
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          editUrl: 'https://github.com/46slv/collectanea-DB/edit/main/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],

  plugins: [
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'reference',
        path: 'reference',
        routeBasePath: 'reference',
        sidebarPath: require.resolve('./sidebarsReference.js'),
        editUrl: 'https://github.com/46slv/collectanea-DB/edit/main/',
        showLastUpdateAuthor: true,
        showLastUpdateTime: true,
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'research',
        path: 'research',
        routeBasePath: 'research',
        sidebarPath: require.resolve('./sidebarsResearch.js'),
        editUrl: 'https://github.com/46slv/collectanea-DB/edit/main/',
        showLastUpdateAuthor: true,
        showLastUpdateTime: true,
      },
    ],
  ],

  themeConfig: {
    metadata: [
      {
        name: 'description',
        content: 'COLLECTANEA — 技術マニュアル、記事、リファレンス、調査記録を横断する公開資料サイト。',
      },
      {name: 'theme-color', content: '#090a0c'},
    ],
    colorMode: {
      defaultMode: 'dark',
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'COLLECTANEA',
      logo: {
        alt: 'COLLECTANEA',
        src: 'img/mark.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'manualsSidebar',
          position: 'left',
          label: 'Manuals',
        },
        {to: '/articles', label: 'Articles', position: 'left'},
        {
          type: 'docSidebar',
          sidebarId: 'referenceSidebar',
          docsPluginId: 'reference',
          position: 'left',
          label: 'Reference',
        },
        {
          type: 'docSidebar',
          sidebarId: 'researchSidebar',
          docsPluginId: 'research',
          position: 'left',
          label: 'Research',
        },
        {
          href: 'https://github.com/46slv/collectanea-DB',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    docs: {
      sidebar: {
        // Owned explicitly by Root.js + DocItem/Layout (persisted, discoverable).
        hideable: false,
        autoCollapseCategories: false,
      },
    },
    tableOfContents: {
      minHeadingLevel: 2,
      maxHeadingLevel: 4,
    },
    footer: {
      links: [
        {
          title: 'COLLECTANEA',
          items: [
            {label: 'Manuals', to: '/manuals'},
            {label: 'Articles', to: '/articles'},
            {label: 'Reference', to: '/reference'},
            {label: 'Research', to: '/research'},
          ],
        },
        {
          title: 'Contribute',
          items: [
            {label: 'Report an issue', href: 'https://github.com/46slv/collectanea-DB/issues/new/choose'},
            {label: 'GitHub repository', href: 'https://github.com/46slv/collectanea-DB'},
          ],
        },
      ],
      copyright: 'COLLECTANEA · 46slv',
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  },
};

module.exports = config;
