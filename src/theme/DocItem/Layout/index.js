import React, {useEffect, useState} from 'react';
import DocItemLayout from '@theme-original/DocItem/Layout';
import {useLocation} from '@docusaurus/router';
import {getSidebarState, toggleSidebarState} from '@site/src/theme/Root';
import styles from './styles.module.css';

function isFusionDraft(pathname) {
  return pathname.includes('/manuals/fusion');
}

export default function DocItemLayoutWrapper(props) {
  const {pathname} = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const sync = () => setCollapsed(getSidebarState() === 'collapsed');
    sync();
    window.addEventListener('collectanea:toggle-sidebar', sync);
    return () => window.removeEventListener('collectanea:toggle-sidebar', sync);
  }, [pathname]);

  return (
    <div className="collectanea-doc-shell">
      <div className={styles.readingToolbar} role="toolbar" aria-label="読書レイアウト操作">
        <button
          type="button"
          className={styles.sidebarToggle}
          onClick={toggleSidebarState}
          aria-expanded={!collapsed}
          aria-label={collapsed ? '階層ナビゲーションを開く' : '階層ナビゲーションを閉じる'}>
          {collapsed ? '⟨ Hierarchyを開く' : '⟩ Hierarchyを閉じる'}
        </button>
      </div>
      {isFusionDraft(pathname) ? (
        <p className={styles.draftBanner} role="note">
          Draft — unverified working notes. 公式仕様ではありません。Blackmagic Design
          の公式ドキュメントで確認してください。
        </p>
      ) : null}
      <DocItemLayout {...props} />
    </div>
  );
}
