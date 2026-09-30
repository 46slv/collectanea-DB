import React, {useEffect, useMemo, useRef, useState} from 'react';
import {useSiteUI} from '../SiteUI';
import {CONTENT_TYPES, matches, normalize, useCatalog} from '@site/src/data/catalog';

export default function GlobalSearch() {
  const {searchOpen, setSearchOpen} = useSiteUI();
  const {facets} = useCatalog();
  const dialog = useRef(null), input = useRef(null), composing = useRef(false);
  const [entries, setEntries] = useState(null), [failed, setFailed] = useState(false);
  const [query, setQuery] = useState(''), [type, setType] = useState('all'), [tag, setTag] = useState('all');
  const [selected, setSelected] = useState(0), [limit, setLimit] = useState(40);
  useEffect(() => {
    if (!searchOpen) return;
    let alive = true;
    if (!entries) import('@collectanea/search-index').then((m) => {if (alive) setEntries(m.default);}).catch(() => {if (alive) setFailed(true);});
    const opener = document.activeElement, el = dialog.current;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    setQuery(''); setType('all'); setTag('all'); setSelected(0); setLimit(40);
    el.showModal(); input.current.focus();
    return () => {
      alive = false; el.close(); document.body.style.overflow = overflow;
      if (opener?.isConnected && typeof opener.focus === 'function') opener.focus();
    };
  }, [searchOpen]);
  const results = useMemo(() => (entries || []).filter((e) =>
    (type === 'all' || e.kind === type) && (tag === 'all' || e.tags?.includes(tag) || e.domain === tag) && matches(e, query)
  ).sort((a, b) => {
    const score = (entry) => normalize(entry.title) === normalize(query) ? 0 : normalize(query) && normalize(entry.title).startsWith(normalize(query)) ? 1 : entry.kind === 'tag' ? 3 : 2;
    return score(a) - score(b) || a.title.localeCompare(b.title, 'ja');
  }), [entries, query, type, tag]);
  useEffect(() => {setSelected(0); setLimit(40);}, [query, type, tag]);
  useEffect(() => {document.getElementById(`cc-result-${selected}`)?.scrollIntoView({block: 'nearest'});}, [selected, limit]);
  const activate = (entry) => {
    if (!entry) return;
    if (entry.kind === 'tag') {setTag(entry.tag); setQuery(''); input.current.focus(); return;}
    setSearchOpen(false);
    // A real processed permalink, including baseUrl. Native navigation preserves normal URL behavior.
    window.location.assign(entry.href);
  };
  const onInputKey = (event) => {
    if (event.isComposing || composing.current || event.keyCode === 229) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!results.length) return;
      const next = Math.max(0, Math.min(results.length - 1, selected + (event.key === 'ArrowDown' ? 1 : -1)));
      if (next >= limit) setLimit(next + 40);
      setSelected(next);
    } else if (event.key === 'Enter' && results.length) {event.preventDefault(); activate(results[selected]);}
  };
  const onDialogKey = (event) => {
    if (event.key === 'Escape' && !event.isComposing) {event.preventDefault(); setSearchOpen(false); return;}
    if (event.key !== 'Tab') return;
    const focusable = Array.from(dialog.current.querySelectorAll('button:not([disabled]):not([tabindex="-1"]), input, select, a[href]'))
      .filter((el) => typeof el.getClientRects === 'function' && el.getClientRects().length);
    if (!focusable.length) return;
    const activeIndex = focusable.indexOf(document.activeElement);
    if (event.shiftKey && activeIndex <= 0) {event.preventDefault(); focusable.at(-1).focus();}
    else if (!event.shiftKey && (activeIndex < 0 || activeIndex === focusable.length - 1)) {event.preventDefault(); focusable[0].focus();}
  };
  return <dialog ref={dialog} className="cc-palette" aria-labelledby="cc-search-title" onCancel={(e) => {e.preventDefault(); setSearchOpen(false);}} onKeyDownCapture={onDialogKey} onClick={(e) => {if (e.target === dialog.current) setSearchOpen(false);}}>
    <div className="cc-palette-inner">
      <div className="cc-palette-top"><label id="cc-search-title" htmlFor="cc-search-input">サイト内検索</label><button type="button" className="cc-icon-button" aria-label="検索を閉じる" onClick={() => setSearchOpen(false)}>×</button></div>
      <input id="cc-search-input" ref={input} type="search" value={query} onChange={(e) => setQuery(e.target.value)} onCompositionStart={() => {composing.current = true;}} onCompositionEnd={() => {composing.current = false;}} onKeyDown={onInputKey} role="combobox" aria-autocomplete="list" aria-expanded={searchOpen} aria-controls="cc-search-results" aria-activedescendant={results.length ? `cc-result-${Math.min(selected, results.length - 1)}` : undefined} placeholder="資料・記事・見出しを検索" autoComplete="off" />
      <div className="cc-palette-filters"><label>種類<select autoComplete="off" aria-label="種類" value={type} onChange={(e) => setType(e.target.value)}>{CONTENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}<option value="tag">Tag</option></select></label><label>タグ<select autoComplete="off" aria-label="タグ" value={tag} onChange={(e) => setTag(e.target.value)}><option value="all">すべて</option>{facets.map((f) => <option key={f} value={f}>{f}</option>)}</select></label><span role="status">{entries ? `${results.length} 件` : failed ? '検索を読み込めませんでした' : '検索を準備中…'}</span></div>
      <ul id="cc-search-results" role="listbox" aria-label="検索結果" className="cc-results">{results.slice(0, limit).map((e, i) => <li role="presentation" key={e.id}><button type="button" role="option" id={`cc-result-${i}`} tabIndex={-1} aria-selected={i === selected} onMouseMove={() => setSelected(i)} onClick={() => activate(e)}><span className="cc-result-content"><strong>{e.title}</strong><small>{e.materialTitle || e.summary}</small></span><span className="cc-result-type">{e.label}</span></button></li>)}</ul>
      {entries && results.length === 0 && <p className="cc-empty">該当する資料がありません。検索語やタグを変更してください。</p>}
      {results.length > limit && <button type="button" className="cc-button" onClick={() => setLimit(limit + 40)}>さらに表示（残り {results.length - limit} 件）</button>}
      <div className="cc-palette-bottom"><span>↑ ↓ 選択　Enter 開く　Esc 閉じる</span><span>Ctrl / ⌘ K</span></div>
    </div>
  </dialog>;
}
