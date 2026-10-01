import React, {createContext, useContext, useEffect, useMemo, useState} from 'react';
const UI = createContext(null);
const SIDEBAR_KEY = 'collectanea.sidebar';
export function useSiteUI() {
  const value = useContext(UI);
  if (!value) throw new Error('COLLECTANEA UI provider is missing');
  return value;
}
export function SiteUIProvider({children}) {
  const [collapsed, setCollapsed] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  useEffect(() => {
    try { setCollapsed(localStorage.getItem(SIDEBAR_KEY) === 'collapsed'); } catch { /* Optional persistence. */ }
    setHydrated(true);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.ccSidebar = collapsed ? 'collapsed' : 'expanded';
    if (hydrated) try { localStorage.setItem(SIDEBAR_KEY, collapsed ? 'collapsed' : 'expanded'); } catch { /* In-memory state still works. */ }
  }, [collapsed, hydrated]);
  useEffect(() => {
    const onKey = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k' && !event.isComposing) {
        event.preventDefault(); setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  const value = useMemo(() => ({collapsed, setCollapsed, searchOpen, setSearchOpen}), [collapsed, searchOpen]);
  return <UI.Provider value={value}>{children}</UI.Provider>;
}
export function usePreference(key, initial, allowed) {
  const [value, setValue] = useState(initial);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try { const saved = localStorage.getItem(key); if (allowed.includes(saved)) setValue(saved); } catch { /* Optional. */ }
    setReady(true);
  }, [key]);
  useEffect(() => { if (ready) try { localStorage.setItem(key, value); } catch { /* Optional. */ } }, [key, value, ready]);
  return [value, setValue];
}
