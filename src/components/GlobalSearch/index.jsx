import React, {useEffect, useMemo, useRef, useState} from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {SEARCH_ENTRIES} from '../../data/catalog';
import {matchesEntry} from '../search';
import styles from './styles.module.css';

const TYPES = ['All', 'Manual', 'Article', 'Reference', 'Research'];
const DOMAINS = ['All', 'DaVinci', 'Development'];
const PAGE_SIZE = 20;

export default function GlobalSearch({open, initialQuery = '', onClose}) {
  const {siteConfig} = useDocusaurusContext();
  const dialogRef = useRef(null);
  const inputRef = useRef(null);
  const openerRef = useRef(null);
  const [query, setQuery] = useState(initialQuery);
  const [type, setType] = useState('All');
  const [domain, setDomain] = useState('All');
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!open) return undefined;
    openerRef.current = document.activeElement;
    setQuery(initialQuery);
    setType('All');
    setDomain('All');
    setActiveIndex(0);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const frame = requestAnimationFrame(() => inputRef.current?.focus());
    const onGlobalKey = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };
    document.addEventListener('keydown', onGlobalKey, true);
    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onGlobalKey, true);
      if (openerRef.current && typeof openerRef.current.focus === 'function') {
        openerRef.current.focus();
      }
    };
  }, [open, initialQuery, onClose]);

  const filtered = useMemo(() => {
    const matches = SEARCH_ENTRIES.filter(
      (entry) =>
        (type === 'All' || entry.type === type) &&
        (domain === 'All' || entry.domain === domain || entry.tags?.includes(domain)),
    ).filter((entry) => matchesEntry(entry, query));
    return {total: matches.length, shown: matches.slice(0, PAGE_SIZE)};
  }, [type, domain, query]);

  useEffect(() => {
    setActiveIndex((current) => Math.min(current, Math.max(filtered.shown.length - 1, 0)));
  }, [filtered.shown.length]);

  if (!open) return null;

  const navigate = (entry) => {
    if (!entry) return;
    const base = siteConfig.baseUrl.replace(/\/$/, '');
    const target = entry.href.startsWith('/') ? `${base}${entry.href}` : entry.href;
    window.location.assign(target);
  };

  const isComposing = (event) => event.nativeEvent?.isComposing || event.keyCode === 229;

  const onInputKeyDown = (event) => {
    if (event.key === 'Enter' && isComposing(event)) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, filtered.shown.length - 1));
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      navigate(filtered.shown[activeIndex]);
    }
    if (event.key === 'Tab') {
      const dialog = dialogRef.current;
      if (!dialog) return;
      const focusable = dialog.querySelectorAll(
        'input, button:not([disabled]), select, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  };

  const listboxId = 'collectanea-search-listbox';

  return (
    <div className={styles.backdrop} role="presentation" onMouseDown={onClose}>
      <section
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-label="サイト内検索"
        onMouseDown={(event) => event.stopPropagation()}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.preventDefault();
            onClose();
          }
        }}>
        <div className={styles.searchRow}>
          <span className={styles.searchIcon} aria-hidden="true">
            ⌕
          </span>
          <input
            ref={inputRef}
            value={query}
            role="combobox"
            aria-expanded="true"
            aria-controls={listboxId}
            aria-activedescendant={
              filtered.shown[activeIndex] ? `collectanea-search-option-${filtered.shown[activeIndex].id}` : undefined
            }
            aria-label="検索語"
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={onInputKeyDown}
            placeholder="資料・記事・ノードを検索"
            autoComplete="off"
            spellCheck={false}
          />
          <button type="button" className={styles.escape} onClick={onClose}>
            Esc
          </button>
        </div>

        <div className={styles.filters} aria-label="検索フィルタ">
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel} id="collectanea-search-type-label">
              Type
            </span>
            <div className={styles.chips} role="group" aria-labelledby="collectanea-search-type-label">
              {TYPES.map((item) => (
                <button
                  type="button"
                  key={item}
                  className={item === type ? styles.chipActive : styles.chip}
                  aria-pressed={item === type}
                  onClick={() => {
                    setType(item);
                    setActiveIndex(0);
                    inputRef.current?.focus();
                  }}>
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel} id="collectanea-search-domain-label">
              Domain
            </span>
            <div className={styles.chips} role="group" aria-labelledby="collectanea-search-domain-label">
              {DOMAINS.map((item) => (
                <button
                  type="button"
                  key={item}
                  className={item === domain ? styles.chipActive : styles.chip}
                  aria-pressed={item === domain}
                  onClick={() => {
                    setDomain(item);
                    setActiveIndex(0);
                    inputRef.current?.focus();
                  }}>
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.resultMeta} aria-live="polite">
          <span>
            {filtered.total === 0
              ? '0件 — 条件を変えて再検索してください'
              : `${filtered.total}件中 ${filtered.shown.length}件を表示`}
          </span>
          <span>↑↓ 選択 · Enterで開く</span>
        </div>

        <div className={styles.results} role="listbox" id={listboxId} aria-label="検索結果">
          {filtered.shown.length === 0 ? (
            <div className={styles.empty}>
              一致する項目はありません。別の語句やフィルタで試してください。
            </div>
          ) : (
            filtered.shown.map((entry, index) => (
              <button
                type="button"
                key={entry.id}
                id={`collectanea-search-option-${entry.id}`}
                role="option"
                aria-selected={index === activeIndex}
                className={index === activeIndex ? styles.resultActive : styles.result}
                onMouseEnter={() => setActiveIndex(index)}
                onFocus={() => setActiveIndex(index)}
                onClick={() => navigate(entry)}>
                <span className={styles.resultMarker} aria-hidden="true" />
                <span className={styles.resultMain}>
                  <strong>{entry.title}</strong>
                  <span>{entry.hierarchy}</span>
                </span>
                <span className={styles.resultSide}>
                  <span className={styles.resultType}>{entry.type}</span>
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
