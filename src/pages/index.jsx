import React from 'react';
import Layout from '@theme/Layout';
import KnowledgeExplorer from '../components/KnowledgeExplorer';

export default function HomePage() {
  return (
    <Layout
      title="Technical Documentation Index"
      description="技術マニュアル、記事、リファレンス、調査記録を横断して検索・閲覧するCOLLECTANEA。">
      <main>
        <KnowledgeExplorer />
      </main>
    </Layout>
  );
}
