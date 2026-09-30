import React, {useEffect, useMemo, useRef, useState} from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './styles.module.css';

function normalize(value) {
  return value.toLocaleLowerCase('ja').normalize('NFKC');
}

function matches(entry, query) {
  if (!query) return true;
  const haystack = [entry.title, entry.summary, entry.hierarchy, ...(entry.tags ?? [])]
    .filter(Boolean)
    .join(' ');
  return normalize(haystack).includes(normalize(query));
}

export default function CommandPalette({open, entries, onClose, initialQuery = ''}) {
  const {siteConfig} = useDocusaurusContext();
  const inputRef = useRef(null);
  const [query, setQuery] = useState(initialQuery);
  const [type, setType] = useState('All');
  const [domain, setDomain] = useState('All');
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!open) return undefined;
    setQuery(initialQuery);
    setActiveIndex(0);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => inputRef.current?.focus());
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open, initialQuery]);

  const results = useMemo(
    () =>
      entries
        .filter((entry) => type === 'All' || entry.type === type)
        .filter((entry) => domain === 'All' || entry.domain === domain || entry.tags?.includes(domain))
        .filter((entry) => matches(entry, query))
        .slice(0, 12),
    [entries, type, domain, query],
  );

  useEffect(() => {
    setActiveIndex((current) => Math.min(current, Math.max(results.length - 1, 0)));
  }, [results.length]);

  if (!open) return null;

  const navigate = (entry) => {
    if (!entry) return;
    const base = siteConfig.baseUrl.replace(/\/$/, '');
    window.location.assign(`${base}${entry.href}`);
  };

  const onKeyDown = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, results.length - 1));
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      navigate(results[activeIndex]);
    }
  };

  const types = ['All', 'Manual', 'Article', 'Reference', 'Research', 'Page'];
  const domains = ['All', 'Software', 'DaVinci', 'Blender', 'Adobe', 'Development'];

  return (
    <div className={styles.backdrop} role="presentation" onMouseDown={onClose}>
      <section
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-label="サイト内検索"
        onMouseDown={(event) => event.stopPropagation()}>
        <div className={styles.searchRow}>
          <span className={styles.searchIcon} aria-hidden="true">⌕</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={onKeyDown}
            placeholder="資料・記事・ノードを検索"
            aria-label="検索語"
          />
          <button type="button" className={styles.escape} onClick={onClose}>Esc</button>
        </div>

        <div className={styles.filters} aria-label="検索フィルタ">
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Type</span>
            <div className={styles.chips}>
              {types.map((item) => (
                <button
                  type="button"
                  key={item}
                  className={item === type ? styles.chipActive : styles.chip}
                  onClick={() => {
                    setType(item);
                    setActiveIndex(0);
                  }}>
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Domain</span>
            <div className={styles.chips}>
              {domains.map((item) => (
                <button
                  type="button"
                  key={item}
                  className={item === domain ? styles.chipActive : styles.chip}
                  onClick={() => {
                    setDomain(item);
                    setActiveIndex(0);
                  }}>
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.resultMeta}>
          <span>{results.length} results</span>
          <span>↑↓ select · Enter open</span>
        </div>

        <div className={styles.results} role="listbox" aria-label="検索結果">
          {results.length === 0 ? (
            <div className={styles.empty}>一致する項目はありません。</div>
          ) : (
            results.map((entry, index) => (
              <button
                type="button"
                key={entry.id}
                role="option"
                aria-selected={index === activeIndex}
                className={index === activeIndex ? styles.resultActive : styles.result}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => navigate(entry)}>
                <span className={styles.resultMarker} aria-hidden="true" />
                <span className={styles.resultMain}>
                  <strong>{entry.title}</strong>
                  <span>{entry.hierarchy}</span>
                </span>
                <span className={styles.resultSide}>
                  <span>{entry.type}</span>
                  <span>{entry.domain}</span>
                </span>
              </button>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
