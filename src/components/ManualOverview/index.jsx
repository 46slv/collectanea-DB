import React, {useMemo, useState} from 'react';
import Link from '@docusaurus/Link';
import {useLocation} from '@docusaurus/router';
import {filterTree, sorted, treeIds, useCatalog} from '@site/src/data/catalog';

function Tree({nodes, opened, toggle, forceOpen}) {
  return <ul className="cc-tree">{nodes.map((node) => {
    const children = node.children || [], open = forceOpen || opened.has(node.id);
    return <li key={node.id}><div className="cc-tree-row">{children.length ? <button type="button" className="cc-icon-button" aria-label={`${node.title}を${open ? '閉じる' : '開く'}`} aria-expanded={open} onClick={() => toggle(node.id)}>{open ? '−' : '+'}</button> : <span className="cc-tree-leaf" aria-hidden="true">·</span>}{node.href ? <Link to={node.href}>{node.title}</Link> : <span>{node.title}</span>}</div>{children.length > 0 && open && <Tree nodes={children} opened={opened} toggle={toggle} forceOpen={forceOpen} />}</li>;
  })}</ul>;
}
export default function ManualOverview({materialId}) {
  const {materials, pages} = useCatalog();
  const {pathname} = useLocation();
  const clean = (path) => path.replace(/\/$/, '');
  const material = materials.find((m) => materialId ? m.id === materialId : clean(m.href) === clean(pathname));
  const [query, setQuery] = useState(''), [closed, setClosed] = useState(new Set());
  const tree = material?.tree || [];
  const opened = useMemo(() => new Set(treeIds(tree).filter((id) => !closed.has(id))), [tree, closed]);
  const visible = useMemo(() => filterTree(tree, query), [tree, query]);
  const toggle = (id) => setClosed((old) => {const next = new Set(old); if (next.has(id)) next.delete(id); else next.add(id); return next;});
  if (!material) return <section className="cc-manual"><h1>資料</h1><p>この資料の索引を取得できませんでした。</p></section>;
  const recent = sorted(pages.filter((p) => p.material === material.id && p.href !== material.href), 'recent').slice(0, 5);
  return <section className="cc-manual">
    <header><p className="cc-eyebrow">Manual</p><h1>{material.title}</h1><p className="cc-meta">{material.pageCount} ページ</p></header>
    <label className="cc-tree-search">この資料を検索<input type="search" placeholder="章・ページ名で絞り込む" value={query} onChange={(e) => setQuery(e.target.value)} /></label>
    <div className="cc-manual-columns"><section><div className="cc-section-heading"><h2>全ページ</h2><div className="cc-button-group"><button type="button" className="cc-button" disabled={Boolean(query)} onClick={() => setClosed(new Set())}>すべて展開</button><button type="button" className="cc-button" disabled={Boolean(query)} onClick={() => setClosed(new Set(treeIds(tree)))}>閉じる</button></div></div>{visible.length ? <Tree nodes={visible} opened={opened} toggle={toggle} forceOpen={Boolean(query)} /> : <p className="cc-empty">該当するページがありません。</p>}</section>
      <aside className="cc-recent"><h2>最近更新</h2><ul>{recent.map((p) => <li key={p.id}><Link to={p.href}>{p.title}</Link><time dateTime={p.updated || undefined}>{p.updated || '更新日なし'}</time></li>)}</ul></aside></div>
  </section>;
}
