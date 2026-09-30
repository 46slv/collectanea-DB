import React from 'react';
import DocItemLayout from '@theme-original/DocItem/Layout';
import {useLocation} from '@docusaurus/router';
import {useSiteUI} from '@site/src/components/SiteUI';
import {statusLabel, useCatalog} from '@site/src/data/catalog';
export default function Layout(props) {
  const {collapsed, setCollapsed} = useSiteUI();
  const {pages} = useCatalog();
  const {pathname} = useLocation();
  const page = pages.find((p) => p.href.replace(/\/$/, '') === pathname.replace(/\/$/, ''));
  const status = page && statusLabel(page.status);
  return <div className="cc-doc" data-cc-reading>
    <div className="cc-doc-toolbar"><button type="button" className="cc-button cc-sidebar-toggle" aria-label={collapsed ? '階層を開く' : '階層を閉じる'} aria-expanded={!collapsed} onClick={() => setCollapsed((old) => !old)}><span aria-hidden="true">{collapsed ? '›' : '‹'}</span> 階層</button></div>
    {status && <aside className="cc-content-status"><strong>{status}</strong><span>作成途中の資料です。仕様や手順は確認が必要です。</span></aside>}
    <DocItemLayout {...props} />
  </div>;
}
