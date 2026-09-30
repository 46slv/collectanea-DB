import React from 'react';
import Layout from '@theme/Layout';
import KnowledgeExplorer from '../components/KnowledgeExplorer';
export default function HomePage() {
  return <Layout title="資料一覧" description="技術マニュアル・記事・リファレンスを検索する"><KnowledgeExplorer /></Layout>;
}
