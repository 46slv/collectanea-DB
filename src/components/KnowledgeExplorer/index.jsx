import React, {useMemo, useState} from 'react';
import Link from '@docusaurus/Link';
import {useSiteUI, usePreference} from '../SiteUI';
import {CONTENT_TYPES, sorted, statusLabel, useCatalog} from '@site/src/data/catalog';

export default function KnowledgeExplorer() {
  const {materials, facets} = useCatalog();
  const {setSearchOpen} = useSiteUI();
  const [type, setType] = useState('all'), [tag, setTag] = useState('all');
  const [view, setView] = usePreference('collectanea.home.view', 'panel', ['panel', 'list']);
  const [order, setOrder] = usePreference('collectanea.home.sort', 'recent', ['recent', 'name', 'count']);
  const visible = useMemo(() => sorted(materials.filter((m) => (type === 'all' || m.kind === type) && (tag === 'all' || m.tags.includes(tag) || m.domain === tag)), order), [materials, type, tag, order]);
  const move = (e) => {const box = e.currentTarget.getBoundingClientRect(); e.currentTarget.style.setProperty('--pointer-x', `${e.clientX - box.left}px`); e.currentTarget.style.setProperty('--pointer-y', `${e.clientY - box.top}px`);};
  return <main className="cc-index" id="main-content">
    <header className="cc-index-heading"><div><p className="cc-eyebrow">資料一覧</p><h1>COLLECTANEA</h1></div><span className="cc-meta">{materials.length} 資料</span></header>
    <button type="button" className="cc-home-search" onClick={() => setSearchOpen(true)}><span aria-hidden="true">⌕</span><span>資料・記事・見出しを検索</span><kbd>Ctrl / ⌘ K</kbd></button>
    <div className="cc-index-toolbar">
      <div className="cc-filter-group"><label>種類<select autoComplete="off" aria-label="種類" value={type} onChange={(e) => setType(e.target.value)}>{CONTENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}</select></label><label>タグ<select autoComplete="off" aria-label="タグ" value={tag} onChange={(e) => setTag(e.target.value)}><option value="all">すべて</option>{facets.map((t) => <option value={t} key={t}>{t}</option>)}</select></label></div>
      <div className="cc-filter-group"><label>並び順<select autoComplete="off" aria-label="並び順" value={order} onChange={(e) => setOrder(e.target.value)}><option value="recent">最近更新</option><option value="name">名前順</option><option value="count">ページ数</option></select></label><div className="cc-view-switch" role="group" aria-label="資料の表示形式"><button type="button" aria-pressed={view === 'panel'} onClick={() => setView('panel')}>パネル</button><button type="button" aria-pressed={view === 'list'} onClick={() => setView('list')}>リスト</button></div></div>
    </div>
    <p className="cc-results-count" role="status">{visible.length} 件</p>
    <div className={`cc-materials cc-materials--${view}`} data-cc-view={view}>{visible.map((m) => <article className="cc-card" key={m.id} onPointerMove={move}>
      <Link className="cc-card-hit" to={m.href} aria-label={`${m.title}を開く`} />
      <div className="cc-card-main"><span className="cc-eyebrow">{m.kind}{statusLabel(m.status) ? ` / ${statusLabel(m.status)}` : ''}</span><h2>{m.title}</h2><p className="cc-card-summary">{m.summary}</p></div>
      <div className="cc-tags">{m.tags.slice(0, 4).map((t) => <span key={t}>{t}</span>)}</div>
      <footer className="cc-card-meta"><span>{m.pageCount} ページ</span><time dateTime={m.updated || undefined}>{m.updated || '更新日なし'}</time></footer>
    </article>)}</div>
    {visible.length === 0 && <p className="cc-empty">該当する資料がありません。種類やタグを変更してください。</p>}
  </main>;
}
