import React, {useMemo, useState} from 'react';
import Link from '@docusaurus/Link';
import {usePreference} from '../SiteUI';
import {matches, sorted, statusLabel, useCatalog} from '@site/src/data/catalog';
export default function ArticlesExplorer() {
  const {pages} = useCatalog();
  const articles = useMemo(() => pages.filter((p) => p.kind === 'article'), [pages]);
  const tags = useMemo(() => Array.from(new Set(articles.flatMap((p) => p.tags))).sort(), [articles]);
  const [query, setQuery] = useState(''), [tag, setTag] = useState('all');
  const [view, setView] = usePreference('collectanea.articles.view', 'panel', ['panel', 'list']);
  const [order, setOrder] = usePreference('collectanea.articles.sort', 'recent', ['recent', 'name']);
  const visible = useMemo(() => sorted(articles.filter((p) => (tag === 'all' || p.tags.includes(tag)) && matches(p, query)), order), [articles, query, tag, order]);
  return <main className="cc-index" id="main-content"><header className="cc-index-heading"><div><p className="cc-eyebrow">記事一覧</p><h1>Articles</h1></div></header><div className="cc-index-toolbar"><label className="cc-flex-search">記事を検索<input type="search" placeholder="記事名・説明を検索" value={query} onChange={(e) => setQuery(e.target.value)} /></label><label>タグ<select autoComplete="off" aria-label="タグ" value={tag} onChange={(e) => setTag(e.target.value)}><option value="all">すべて</option>{tags.map((t) => <option value={t} key={t}>{t}</option>)}</select></label><label>並び順<select autoComplete="off" aria-label="並び順" value={order} onChange={(e) => setOrder(e.target.value)}><option value="recent">最近更新</option><option value="name">名前順</option></select></label><div className="cc-view-switch" role="group" aria-label="記事の表示形式"><button type="button" aria-pressed={view === 'panel'} onClick={() => setView('panel')}>パネル</button><button type="button" aria-pressed={view === 'list'} onClick={() => setView('list')}>リスト</button></div></div><p className="cc-results-count" role="status">{visible.length} / {articles.length} 件</p><div className={`cc-materials cc-materials--${view}`} data-cc-articles>{visible.map((p) => <article className="cc-card" key={p.id}><Link className="cc-card-hit" to={p.href} aria-label={p.title} /><div className="cc-card-main"><span className="cc-eyebrow">Article {statusLabel(p.status)}</span><h2>{p.title}</h2><p className="cc-card-summary">{p.summary}</p></div><div className="cc-tags">{p.tags.map((t) => <span key={t}>{t}</span>)}</div><footer className="cc-card-meta"><span>{p.materialTitle}</span><time dateTime={p.updated || undefined}>{p.updated || '更新日なし'}</time></footer></article>)}</div>{visible.length === 0 && <p className="cc-empty">該当する記事がありません。検索語やタグを変更してください。</p>}</main>;
}
