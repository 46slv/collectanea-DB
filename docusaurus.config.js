const blogRoute = 'articles';
const repository = 'https://github.com/46slv/collectanea-DB';
const editUrl = `${repository}/edit/main/`;
const docs = (path, sidebarPath) => ({path, routeBasePath: path, sidebarPath: require.resolve(sidebarPath), editUrl, showLastUpdateAuthor: true, showLastUpdateTime: true, numberPrefixParser: (filename) => ({filename})});
const codeTheme = (foreground, background) => ({plain: {color: foreground, backgroundColor: background}, styles: [{types: ['comment', 'prolog', 'doctype', 'cdata'], style: {fontStyle: 'italic', opacity: 0.8}}, {types: ['keyword', 'important'], style: {fontWeight: 'bold'}}, {types: ['string'], style: {textDecoration: 'none'}}]});

/** @type {import('@docusaurus/types').Config} */
module.exports = {
  title: 'COLLECTANEA', tagline: '技術資料・記事・リファレンス', favicon: 'img/favicon.svg',
  url: 'https://46slv.github.io', baseUrl: '/collectanea-DB/', organizationName: '46slv', projectName: 'collectanea-DB',
  onBrokenLinks: 'throw', i18n: {defaultLocale: 'ja', locales: ['ja']},
  presets: [['classic', {
    docs: docs('manuals', './sidebars.js'),
    blog: {path: 'articles', routeBasePath: blogRoute, blogTitle: 'Articles', blogDescription: '制作・CG・開発の技術記事', postsPerPage: 12, blogSidebarCount: 'ALL', showReadingTime: true, showLastUpdateTime: true, showLastUpdateAuthor: true, feedOptions: {type: ['rss', 'atom'], xslt: true}, editUrl},
    theme: {customCss: require.resolve('./src/css/custom.css')},
  }]],
  plugins: [
    ['@docusaurus/plugin-content-docs', {id: 'reference', ...docs('reference', './sidebarsReference.js')}],
    ['@docusaurus/plugin-content-docs', {id: 'research', ...docs('research', './sidebarsResearch.js')}],
    [require.resolve('./plugins/catalog/index.cjs'), {blogRoutes: {default: blogRoute}}],
  ],
  themeConfig: {
    metadata: [{name: 'description', content: '技術マニュアル、記事、リファレンス、調査記録。'}, {name: 'theme-color', content: '#0f0f0f'}],
    colorMode: {defaultMode: 'dark', respectPrefersColorScheme: true},
    navbar: {title: 'COLLECTANEA', logo: {alt: 'COLLECTANEA', src: 'img/mark.svg'}, items: [
      {type: 'docSidebar', sidebarId: 'manualsSidebar', position: 'left', label: 'Manuals'},
      {to: `/${blogRoute}`, label: 'Articles', position: 'left'},
      {type: 'docSidebar', sidebarId: 'referenceSidebar', docsPluginId: 'reference', position: 'left', label: 'Reference'},
      {type: 'docSidebar', sidebarId: 'researchSidebar', docsPluginId: 'research', position: 'left', label: 'Research'},
      {type: 'custom-collectanea-search', position: 'right'},
      {href: repository, label: 'GitHub', position: 'right'},
    ]},
    docs: {sidebar: {hideable: false, autoCollapseCategories: false}},
    tableOfContents: {minHeadingLevel: 2, maxHeadingLevel: 4},
    footer: {links: [
      {title: 'COLLECTANEA', items: [{label: 'Manuals', to: '/manuals'}, {label: 'Articles', to: `/${blogRoute}`}, {label: 'Reference', to: '/reference'}, {label: 'Research', to: '/research'}]},
      {title: 'Contribute', items: [{label: '誤りを報告', href: `${repository}/issues/new/choose`}, {label: 'GitHub', href: repository}]},
    ], copyright: 'COLLECTANEA · 46slv'},
    prism: {theme: codeTheme('#202020', '#f1f1f1'), darkTheme: codeTheme('#eeeeee', '#202020')},
  },
};
