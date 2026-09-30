const {themes: prismThemes} = require('prism-react-renderer');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'COLLECTANEA',
  tagline: '技術を、探せる形で残す。',
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
          postsPerPage: 10,
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

  themes: [
    [
      require.resolve('@easyops-cn/docusaurus-search-local'),
      {
        hashed: 'filename',
        indexDocs: true,
        indexBlog: true,
        indexPages: true,
        docsRouteBasePath: ['manuals', 'reference', 'research'],
        docsDir: ['manuals', 'reference', 'research'],
        blogRouteBasePath: 'articles',
        blogDir: 'articles',
        language: ['en', 'ja'],
        highlightSearchTermsOnTargetPage: true,
        explicitSearchResultPath: true,
        searchBarPosition: 'right',
      },
    ],
  ],

  themeConfig: {
    metadata: [
      {
        name: 'description',
        content:
          'COLLECTANEA — マニュアル、技術記事、リファレンス、研究記録を公開する技術知識アーカイブ。',
      },
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
        {
          to: '/articles',
          label: 'Articles',
          position: 'left',
        },
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
        hideable: true,
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
            {
              label: 'Report an issue',
              href: 'https://github.com/46slv/collectanea-DB/issues/new/choose',
            },
            {
              label: 'GitHub repository',
              href: 'https://github.com/46slv/collectanea-DB',
            },
          ],
        },
      ],
      copyright: 'COLLECTANEA · 46slv · Built with Docusaurus',
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  },
};

module.exports = config;
