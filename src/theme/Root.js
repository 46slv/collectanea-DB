import React, {useCallback, useEffect, useState} from 'react';
import GlobalSearch from '@site/src/components/GlobalSearch';

const SIDEBAR_KEY = 'collectanea.sidebar.v1';

function readSidebarState() {
  try {
    const raw = window.localStorage.getItem(SIDEBAR_KEY);
    if (raw === 'collapsed' || raw === 'expanded') return raw;
    return 'expanded';
  } catch {
    return 'expanded';
  }
}

function isDocRoute(pathname) {
  // window.location.pathname includes the site baseUrl (e.g.
  // /collectanea-DB/manuals/...), so match the doc route segment anywhere.
  return /(^|\/)(manuals|reference|research)(\/|$)/.test(pathname.replace(/\/$/, ''));
}

function applySidebarState(state) {
  document.documentElement.dataset.collectaneaSidebar = state;
}

// Collapsed layout CSS (`html[data-collectanea-sidebar='collapsed'] main`)
// only applies on doc routes, so blog/Home can never inherit it.
export function applyRouteScopedSidebar() {
  const persisted = readSidebarState();
  const scoped = persisted === 'collapsed' && isDocRoute(window.location.pathname) ? 'collapsed' : 'expanded';
  applySidebarState(scoped);
}

export function getSidebarState() {
  if (typeof document === 'undefined') return 'expanded';
  return document.documentElement.dataset.collectaneaSidebar === 'collapsed' ? 'collapsed' : 'expanded';
}

export function toggleSidebarState() {
  window.dispatchEvent(new CustomEvent('collectanea:toggle-sidebar'));
}

export function openSiteSearch() {
  window.dispatchEvent(new CustomEvent('collectanea:open-search'));
}

export default function Root({children}) {
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    applyRouteScopedSidebar();

    const onToggle = () => {
      const next = getSidebarState() === 'collapsed' ? 'expanded' : 'collapsed';
      applySidebarState(next);
      try {
        window.localStorage.setItem(SIDEBAR_KEY, next);
      } catch {
        // storage unavailable: keep in-memory layout state only
      }
    };
    const onOpenSearch = () => setSearchOpen(true);    const onKeyDown = (event) => {
      const isK = event.key.toLocaleLowerCase('ja') === 'k';
      if ((event.metaKey || event.ctrlKey) && isK) {
        event.preventDefault();
        setSearchOpen(true);
      }
    };
    const params = new URLSearchParams(window.location.search);
    if (params.get('palette') === 'open' || params.get('search') === 'open') {
      setSearchOpen(true);
    }

    window.addEventListener('collectanea:toggle-sidebar', onToggle);
    window.addEventListener('collectanea:open-search', onOpenSearch);
    window.addEventListener('keydown', onKeyDown);
    // SPA navigation never reloads: re-scope collapsed state after route
    // changes so non-doc pages cannot inherit doc-only layout CSS.
    const rescope = () => window.setTimeout(applyRouteScopedSidebar, 0);
    window.addEventListener('popstate', rescope);
    document.addEventListener('click', rescope, true);

    // Single site-wide visible search entry. The navbar inner/item class
    // names below are stable Docusaurus theme classes (not CSS-module hashes).
    // Owned here so every page — not only Home — offers the same palette.
    const navbarInner = document.querySelector('.navbar__inner');
    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'collectanea-navbar-search';
    trigger.setAttribute('aria-label', 'サイト内検索を開く (Ctrl+K)');
    trigger.innerHTML = '<span aria-hidden="true">⌕</span><span>検索</span><kbd aria-hidden="true">⌘K</kbd>';
    trigger.addEventListener('click', onOpenSearch);
    let injected = false;
    if (navbarInner && !navbarInner.querySelector('.collectanea-navbar-search')) {
      navbarInner.appendChild(trigger);
      injected = true;
    }
    return () => {
      window.removeEventListener('collectanea:toggle-sidebar', onToggle);
      window.removeEventListener('collectanea:open-search', onOpenSearch);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('popstate', rescope);
      document.removeEventListener('click', rescope, true);
      if (injected) trigger.remove();
    };
  }, []);

  const closeSearch = useCallback(() => setSearchOpen(false), []);

  return (
    <>
      {children}
      <GlobalSearch open={searchOpen} onClose={closeSearch} />
    </>
  );
}
