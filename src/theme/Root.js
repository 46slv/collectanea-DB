import React, {useEffect} from 'react';

export default function Root({children}) {
  useEffect(() => {
    let frame = 0;
    const syncSidebarState = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const params = new URLSearchParams(window.location.search);
        const forced = params.get('sidebar');
        const sidebar = document.querySelector('.theme-doc-sidebar-container');
        const naturallyCollapsed = sidebar ? sidebar.getBoundingClientRect().width < 80 : false;
        const collapsed = forced === 'closed' || (forced !== 'open' && naturallyCollapsed);
        document.documentElement.dataset.collectaneaSidebar = collapsed ? 'collapsed' : 'expanded';
      });
    };

    syncSidebarState();
    const observer = new MutationObserver(syncSidebarState);
    observer.observe(document.body, {attributes: true, childList: true, subtree: true});
    window.addEventListener('resize', syncSidebarState);
    document.addEventListener('click', syncSidebarState, true);

    const params = new URLSearchParams(window.location.search);
    if (params.get('mobileNav') === 'open') {
      window.setTimeout(() => document.querySelector('.navbar__toggle')?.click(), 250);
    }

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('resize', syncSidebarState);
      document.removeEventListener('click', syncSidebarState, true);
    };
  }, []);

  return <>{children}</>;
}
