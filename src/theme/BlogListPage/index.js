import React from 'react';
import Layout from '@theme/Layout';
import ArticlesExplorer from '@site/src/components/ArticlesExplorer';
// Keep the blog plugin's post/tag/feed routes. The index itself is one full-catalog DB,
// not a second block outside the theme Layout or the current pagination slice.
export default function BlogListPage() {
  return <Layout title="Articles" description="技術記事の検索・一覧"><ArticlesExplorer /></Layout>;
}
