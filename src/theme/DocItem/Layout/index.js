import React, {useEffect, useState} from 'react';
import {createPortal} from 'react-dom';
import DocItemLayout from '@theme-original/DocItem/Layout';
import {useLocation} from '@docusaurus/router';
import {useSiteUI} from '@site/src/components/SiteUI';
import FusionIndexExplorer, {fusionIndexMode} from '@site/src/components/FusionIndexExplorer';
import {statusLabel, useCatalog} from '@site/src/data/catalog';

function HierarchyControl({collapsed, setCollapsed, pathname}) {
  const [host, setHost] = useState(null);

  useEffect(() => {
    const update = () => setHost(document.querySelector('.theme-doc-sidebar-container'));
    update();
    const frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  }, [pathname, collapsed]);

  const closeButton = !collapsed && host ? createPortal(
    <button
      type="button"
      className="cc-icon-button cc-sidebar-inset-toggle"
      aria-label="階層を閉じる"
      aria-expanded="true"
      onClick={() => setCollapsed(true)}
      title="階層を閉じる">
      <span aria-hidden="true">‹</span>
    </button>,
    host,
  ) : null;

  return <>
    {closeButton}
    {collapsed && <button
      type="button"
      className="cc-icon-button cc-sidebar-reopen"
      aria-label="階層を開く"
      aria-expanded="false"
      onClick={() => setCollapsed(false)}
      title="階層を開く">
      <span aria-hidden="true">›</span>
    </button>}
  </>;
}

export default function Layout(props) {
  const {collapsed, setCollapsed} = useSiteUI();
  const {pages} = useCatalog();
  const {pathname} = useLocation();
  const page = pages.find((p) => p.href.replace(/\/$/, '') === pathname.replace(/\/$/, ''));
  const status = page && statusLabel(page.status);
  const indexMode = fusionIndexMode(page);
  return <div className="cc-doc" data-cc-reading>
    <HierarchyControl collapsed={collapsed} setCollapsed={setCollapsed} pathname={pathname} />
    {status && <aside className="cc-content-status"><strong>{status}</strong><span>作成途中の資料です。仕様や手順は確認が必要です。</span></aside>}
    <DocItemLayout {...props} />
    {indexMode && <FusionIndexExplorer mode={indexMode} />}
  </div>;
}
