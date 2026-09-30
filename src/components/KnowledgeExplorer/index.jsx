import React, {useEffect, useMemo, useState} from 'react';
import Link from '@docusaurus/Link';
import CommandPalette from '../CommandPalette';
import {CONTENT_TYPES, DOMAINS, MATERIALS, SEARCH_ENTRIES} from '../../data/catalog';
import styles from './styles.module.css';

const STORAGE_KEY = 'collectanea.explorer.v1';

function loadPreferences() {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}');
  } catch {
    return {};
  }
}

function formatDate(value) {
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(`${value}T00:00:00`));
}

function MaterialCard({material, view}) {
  const onPointerMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty('--pointer-x', `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty('--pointer-y', `${event.clientY - rect.top}px`);
  };

  return (
    <Link
      to={material.href}
      className={view === 'list' ? styles.materialList : styles.materialCard}
      onPointerMove={onPointerMove}>
      <span className={styles.proximity} aria-hidden="true" />
      <span className={styles.materialHeader}>
        <span>
          <span className={styles.kind}>{material.kind}</span>
          <strong>{material.title}</strong>
        </span>
        <span className={styles.arrow} aria-hidden="true">↗</span>
      </span>
      <span className={styles.summary}>{material.summary}</span>
      <span className={styles.tags} aria-label="タグ">
        {material.tags.map((tag) => <span key={tag}>{tag}</span>)}
      </span>
      <span className={styles.counts}>
        {material.counts.map(([label, value]) => (
          <span key={label}><span>{label}</span><strong>{value}</strong></span>
        ))}
      </span>
      <span className={styles.updated}>Updated {formatDate(material.updated)}</span>
    </Link>
  );
}

export default function KnowledgeExplorer() {
  const preferences = loadPreferences();
  const [type, setType] = useState(preferences.type ?? 'All');
  const [domain, setDomain] = useState(preferences.domain ?? 'All');
  const [sort, setSort] = useState(preferences.sort ?? 'updated-desc');
  const [view, setView] = useState(preferences.view ?? 'panel');
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const params = new URLSearchParams(window.location.search);
    if (params.get('palette') === 'open') setPaletteOpen(true);
    const onKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLocaleLowerCase() === 'k') {
        event.preventDefault();
        setPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({type, domain, sort, view}));
  }, [type, domain, sort, view]);

  const visible = useMemo(() => {
    const filtered = MATERIALS
      .filter((material) => type === 'All' || material.kind === type)
      .filter((material) => domain === 'All' || material.domain === domain || material.tags.includes(domain));
    return [...filtered].sort((a, b) => {
      if (sort === 'updated-asc') return a.updated.localeCompare(b.updated);
      if (sort === 'name') return a.title.localeCompare(b.title, 'ja');
      if (sort === 'volume') {
        const total = (item) => item.counts.reduce((sum, [, value]) => sum + value, 0);
        return total(b) - total(a);
      }
      return b.updated.localeCompare(a.updated);
    });
  }, [type, domain, sort]);

  return (
    <div className={styles.explorer}>
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>Technical documentation index</span>
          <h1>COLLECTANEA</h1>
        </div>
        <div className={styles.stats} aria-label="サイト統計">
          <span><strong>{MATERIALS.length}</strong> Materials</span>
          <span><strong>{SEARCH_ENTRIES.length}</strong> Indexed entries</span>
        </div>
      </header>

      <button
        type="button"
        className={styles.searchEntry}
        onClick={() => setPaletteOpen(true)}>
        <span className={styles.searchGlyph} aria-hidden="true">⌕</span>
        <span>資料・記事・ノードを検索</span>
        <kbd>⌘ K</kbd>
      </button>

      <section className={styles.controls} aria-label="資料一覧の表示設定">
        <div className={styles.filterRow}>
          <span className={styles.controlLabel}>Type</span>
          <div className={styles.chipRow}>
            {CONTENT_TYPES.map((item) => (
              <button
                type="button"
                key={item}
                className={item === type ? styles.chipActive : styles.chip}
                onClick={() => setType(item)}>
                {item}
              </button>
            ))}
          </div>
        </div>
        <div className={styles.filterRow}>
          <span className={styles.controlLabel}>Domain</span>
          <div className={styles.chipRow}>
            {DOMAINS.map((item) => (
              <button
                type="button"
                key={item}
                className={item === domain ? styles.chipActive : styles.chip}
                onClick={() => setDomain(item)}>
                {item}
              </button>
            ))}
          </div>
        </div>
        <div className={styles.viewControls}>
          <label>
            <span>Sort</span>
            <select value={sort} onChange={(event) => setSort(event.target.value)}>
              <option value="updated-desc">Recently updated</option>
              <option value="updated-asc">Oldest update</option>
              <option value="name">Name</option>
              <option value="volume">Volume</option>
            </select>
          </label>
          <div className={styles.segmented} aria-label="表示形式">
            <button
              type="button"
              aria-pressed={view === 'panel'}
              className={view === 'panel' ? styles.segmentActive : styles.segment}
              onClick={() => setView('panel')}>
              Grid
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
      </section>

      <section className={view === 'list' ? styles.list : styles.grid} aria-live="polite">
        {visible.length ? (
          visible.map((material) => <MaterialCard key={material.id} material={material} view={view} />)
        ) : (
          <div className={styles.noResults}>この条件に一致する資料はありません。</div>
        )}
      </section>

      <CommandPalette
        open={paletteOpen}
        entries={SEARCH_ENTRIES}
        onClose={() => setPaletteOpen(false)}
      />
    </div>
  );
}
