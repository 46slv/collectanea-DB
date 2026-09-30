import React from 'react';
import BlogListPage from '@theme-original/BlogListPage';
import ArticlesExplorer from '@site/src/components/ArticlesExplorer';

// DB-first Articles index. Post URLs, feeds, and the underlying blog plugin
// are untouched; only the list presentation becomes a searchable DB.
export default function BlogListPageWrapper(props) {
  const {metadata, items} = props;
  const isFirstPage = !metadata?.page || metadata.page === 1;
  return (
    <>
      {isFirstPage ? <ArticlesExplorer items={items ?? []} /> : null}
      <BlogListPage {...props} />
    </>
  );
}
