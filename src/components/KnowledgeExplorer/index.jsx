import React, {useEffect, useMemo, useState} from 'react';
import Link from '@docusaurus/Link';
import {CONTENT_TYPES, DOMAINS, MATERIALS, CATALOG_PAGES} from '../../data/catalog';
import {openSiteSearch} from '@site/src/theme/Root';
import styles from './styles.module.css';

const STORAGE_KEY = 'collectanea.explorer.v1';
const SORTS = ['updated-desc', 'updated-asc', 'name', 'volume'];
const VIEWS = ['panel', 'list'];
const TYPES = CONTENT_TYPES;
const DOMAINS_FILTER = ['All', 'DaVinci', 'Fusion', 'Blender', 'Adobe', 'Development', 'Motion', 'Git'];

function isValid(value, allowed) {
  return allowed.includes(value) ? value : null;
}

function formatDate(value) {
  if (!value) return '—';
  try {
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date(`${value}T00:00:00`));
  } catch {
    return value;
  }
}

function MaterialCard({material, view}) {
  const onPointerMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty('--pointer-x', `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty('--pointer-y', `${event.clientY - rect.top}px`);
  };

  const body = (
    <>
      <span className={styles.proximity} aria-hidden="true" />
      <span className={styles.materialHeader}>
        <span>
          <span className={styles.kind}>
            {material.kind}
            {material.status === 'planned' ? ' · Planned' : ''}
            {material.status === 'draft' ? ' · Draft' : ''}
          </span>
          <strong>{material.title}</strong>
        </span>
        {material.href ? (
          <span className={styles.arrow} aria-hidden="true">
            ↗
          </span>
        ) : null}
      </span>
      <span className={styles.summary}>{material.summary}</span>
      <span className={styles.tags} aria-label="タグ">
        {material.tags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </span>
      {material.status === 'planned' ? (
        <span className={styles.updated}>コンテンツ待ち — 空のまま保持</span>
      ) : (
        <>
          <span className={styles.counts}>
            <span>
              <span>Pages</span>
              <strong>{material.pageCount}</strong>
            </span>
          </span>
          <span className={styles.updated}>
            Updated {material.updated ? formatDate(material.updated) : '—'}
          </span>
        </>
      )}
    </>
  );

  if (!material.href) {
    return (
      <div
        className={view === 'list' ? styles.materialList : styles.materialCard}
        aria-label={`${material.title}（計画中）`}>
        {body}
      </div>
    );
  }

  return (
    <Link
      to={material.href}
      className={view === 'list' ? styles.materialList : styles.materialCard}
      onPointerMove={onPointerMove}>
      {body}
    </Link>
  );
}

export default function KnowledgeExplorer() {
  // SSR-safe defaults first; localStorage is applied after mount (see R5).
  const [type, setType] = useState('All');
  const [domain, setDomain] = useState('All');
  const [sort, setSort] = useState('updated-desc');
  const [view, setView] = useState('panel');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        const nextType = isValid(saved.type, TYPES);
        const nextDomain = isValid(saved.domain, DOMAINS_FILTER);
        const nextSort = isValid(saved.sort, SORTS);
        const nextView = isValid(saved.view, VIEWS);
        if (nextType) setType(nextType);
        if (nextDomain) setDomain(nextDomain);
        if (nextSort) setSort(nextSort);
        if (nextView) setView(nextView);
      }
    } catch {
      // corrupt or unavailable storage: keep defaults
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({type, domain, sort, view}));
    } catch {
      // storage disabled: preferences simply do not persist
    }
  }, [type, domain, sort, view, hydrated]);

  const visible = useMemo(() => {
    const filtered = MATERIALS.filter(
      (material) =>
        (type === 'All' || material.kind === type) &&
        (domain === 'All' || material.domain === domain || material.tags.includes(domain)),
    );
    return [...filtered].sort((a, b) => {
      if (sort === 'updated-asc') return (a.updated ?? '').localeCompare(b.updated ?? '');
      if (sort === 'name') return a.title.localeCompare(b.title, 'ja');
      if (sort === 'volume') return (b.pageCount ?? 0) - (a.pageCount ?? 0);
      // Planned items (no date) sort last under recently-updated.
      if (!a.updated && b.updated) return 1;
      if (a.updated && !b.updated) return -1;
      return (b.updated ?? '').localeCompare(a.updated ?? '');
    });
  }, [type, domain, sort]);

  const activeMaterials = MATERIALS.filter((material) => material.status !== 'planned').length;

  return (
    <div className={styles.explorer}>
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>Technical documentation index</span>
          <h1>COLLECTANEA 資料索引</h1>
          <p className={styles.lede}>
            マニュアル・記事・リファレンス・調査記録を横断して探す索引。長文を読む前の現在地確認用。
          </p>
        </div>
        <div className={styles.stats} aria-label="収録状況">
          <span>
            <strong>{activeMaterials}</strong> Active materials
          </span>
          <span>
            <strong>{CATALOG_PAGES.length}</strong> Pages indexed
          </span>
        </div>
      </header>

      <button type="button" className={styles.searchEntry} onClick={openSiteSearch}>
        <span className={styles.searchGlyph} aria-hidden="true">
          ⌕
        </span>
        <span>資料・記事・ノードを検索</span>
        <kbd>⌘ K</kbd>
      </button>

      <section className={styles.controls} aria-label="資料一覧の表示設定">
        <div className={styles.filterRow}>
          <span className={styles.controlLabel} id="explorer-type-label">
            Type
          </span>
          <div className={styles.chipRow} role="group" aria-labelledby="explorer-type-label">
            {TYPES.map((item) => (
              <button
                type="button"
                key={item}
                className={item === type ? styles.chipActive : styles.chip}
                aria-pressed={item === type}
                onClick={() => setType(item)}>
                {item}
              </button>
            ))}
          </div>
        </div>
        <div className={styles.filterRow}>
          <span className={styles.controlLabel} id="explorer-domain-label">
            Domain
          </span>
          <div className={styles.chipRow} role="group" aria-labelledby="explorer-domain-label">
            {DOMAINS_FILTER.map((item) => (
              <button
                type="button"
                key={item}
                className={item === domain ? styles.chipActive : styles.chip}
                aria-pressed={item === domain}
                onClick={() => setDomain(item)}>
                {item}
              </button>
            ))}
          </div>
        </div>
        <div className={styles.viewControls}>
          <label>
            <span>Sort</span>
            <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="並び順">
              <option value="updated-desc">Recently updated</option>
              <option value="updated-asc">Oldest update</option>
              <option value="name">Name</option>
              <option value="volume">Volume</option>
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
      </section>

      <section className={view === 'list' ? styles.list : styles.grid} aria-live="polite">
        {visible.length ? (
          visible.map((material) => <MaterialCard key={material.id} material={material} view={view} />)
        ) : (
          <div className={styles.noResults}>この条件に一致する資料はありません。</div>
        )}
      </section>
    </div>
  );
}
