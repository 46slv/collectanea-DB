import React, {useMemo, useState} from 'react';
import Link from '@docusaurus/Link';
import {matchesEntry} from '../search';
import styles from './styles.module.css';

const SORTS = ['updated-desc', 'updated-asc', 'title'];

function toEntry(item) {
  const frontMatter = item?.content?.frontMatter ?? {};
  const metadata = item?.content?.metadata ?? {};
  const permalink = metadata.permalink ?? frontMatter.slug ?? '#';
  const tags = metadata.tags ?? frontMatter.tags ?? [];
  const tagNames = (Array.isArray(tags) ? tags : []).map((tag) => (typeof tag === 'string' ? tag : tag.label ?? tag.name ?? '')).filter(Boolean);
  const date = metadata.date ?? frontMatter.date ?? null;
  return {
    id: permalink,
    title: metadata.title ?? frontMatter.title ?? permalink,
    summary: metadata.description ?? frontMatter.description ?? '',
    type: 'Article',
    domain: 'Development',
    tags: tagNames,
    hierarchy: 'Articles',
    href: permalink,
    updated: typeof date === 'string' ? date.slice(0, 10) : null,
  };
}

export default function ArticlesExplorer({items = []}) {
  const [query, setQuery] = useState('');
  const [tag, setTag] = useState('All');
  const [sort, setSort] = useState('updated-desc');
  const [view, setView] = useState('panel');

  const entries = useMemo(() => items.map(toEntry), [items]);
  const allTags = useMemo(() => {
    const tagSet = new Set();
    for (const entry of entries) for (const t of entry.tags) tagSet.add(t);
    // NOTE: Array.from, never `[...tagSet]`: the production Babel spread
    // transform compiles Set spreads to a broken concat.
    return ['All', ...Array.from(tagSet).sort()];
  }, [entries]);

  const visible = useMemo(() => {
    const filtered = entries
      .filter((entry) => tag === 'All' || entry.tags.includes(tag))
      .filter((entry) => matchesEntry(entry, query));
    return [...filtered].sort((a, b) => {
      if (sort === 'updated-asc') return (a.updated ?? '').localeCompare(b.updated ?? '');
      if (sort === 'title') return a.title.localeCompare(b.title, 'ja');
      return (b.updated ?? '').localeCompare(a.updated ?? '');
    });
  }, [entries, tag, query, sort]);

  return (
    <div className={styles.articlesDb}>
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>Articles database</span>
          <h1>Articles</h1>
          <p>時系列ではなく、検索・タグ・更新順で引く技術記事DB。個別記事のURLとRSSはそのまま維持する。</p>
        </div>
        <div className={styles.count} aria-live="polite">
          {visible.length} / {entries.length} articles
        </div>
      </header>

      <div className={styles.controls}>
        <label className={styles.search}>
          <span aria-hidden="true">⌕</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="記事を検索"
            aria-label="記事検索"
          />
        </label>
        <label>
          <span>Tag</span>
          <select value={tag} onChange={(event) => setTag(event.target.value)} aria-label="タグフィルタ">
            {allTags.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Sort</span>
          <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="並び順">
            <option value="updated-desc">Recently updated</option>
            <option value="updated-asc">Oldest update</option>
            <option value="title">Title</option>
          </select>
        </label>
        <div className={styles.segmented} role="group" aria-label="表示形式">
          <button
            type="button"
            aria-pressed={view === 'panel'}
            className={view === 'panel' ? styles.segmentActive : styles.segment}
            onClick={() => setView('panel')}>
            Panel
          </button>
          <button
            type="button"
            aria-pressed={view === 'list'}
            className={view === 'list' ? styles.segmentActive : styles.segment}
            onClick={() => setView('list')}>
            List
          </button>
        </div>
      </div>

      {visible.length === 0 ? (
        <p className={styles.empty} role="status">
          一致する記事はありません。語句やタグを変えて再検索してください。
        </p>
      ) : (
        <div className={view === 'list' ? styles.list : styles.grid}>
          {visible.map((entry) => (
            <Link key={entry.id} to={entry.href} className={view === 'list' ? styles.row : styles.card}>
              <span className={styles.cardType}>Article</span>
              <strong>{entry.title}</strong>
              {entry.summary ? <span className={styles.cardSummary}>{entry.summary}</span> : null}
              <span className={styles.cardMeta}>
                {entry.tags.map((t) => (
                  <span key={t}>{t}</span>
                ))}
                <time dateTime={entry.updated ?? ''}>{entry.updated ?? '—'}</time>
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
