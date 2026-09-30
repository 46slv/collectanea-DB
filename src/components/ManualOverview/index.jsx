import React, {useEffect, useMemo, useState} from 'react';
import Link from '@docusaurus/Link';
import {FUSION_TREE, CATALOG_PAGES, flattenTree, recentPages} from '../../data/catalog';
import styles from './styles.module.css';

function matchesQuery(title, query) {
  return title.toLocaleLowerCase('ja').normalize('NFKC').includes(query.trim().toLocaleLowerCase('ja').normalize('NFKC'));
}

// Parent matches keep their full children (never erased). Non-matching
// parents keep only matching descendants.
function filterTree(nodes, query) {
  const normalized = query.trim().toLocaleLowerCase('ja').normalize('NFKC');
  if (!normalized) return nodes;
  const out = [];
  for (const node of nodes) {
    const selfMatch = node.title.toLocaleLowerCase('ja').normalize('NFKC').includes(normalized);
    if (selfMatch) {
      out.push({...node});
      continue;
    }
    const children = filterTree(node.children ?? [], query);
    if (children.length) out.push({...node, children});
  }
  return out;
}

function collectAncestorIds(nodes, query, ancestors = [], acc = new Set()) {
  const normalized = query.trim().toLocaleLowerCase('ja').normalize('NFKC');
  if (!normalized) return acc;
  for (const node of nodes) {
    const selfMatch = node.title.toLocaleLowerCase('ja').normalize('NFKC').includes(normalized);
    if (selfMatch) {
      for (const ancestor of ancestors) acc.add(ancestor);
    }
    if (node.children?.length) {
      collectAncestorIds(node.children, query, [...ancestors, node.id], acc);
      // If this branch contains a visible descendant, keep it open.
      const visible = filterTree(node.children, query);
      if (visible.length && !selfMatch) acc.add(node.id);
    }
  }
  return acc;
}

function TreeNode({node, depth, expanded, onToggle}) {
  const hasChildren = Boolean(node.children?.length);
  const isOpen = expanded.has(node.id);
  return (
    <li className={styles.treeItem}>
      <div className={styles.treeRow} style={{'--tree-depth': depth}}>
        {hasChildren ? (
          <button
            type="button"
            className={styles.disclosure}
            aria-expanded={isOpen}
            aria-label={`${node.title}を${isOpen ? '閉じる' : '開く'}`}
            onClick={() => onToggle(node.id)}>
            {isOpen ? '−' : '+'}
          </button>
        ) : (
          <span className={styles.leafMark} aria-hidden="true" />
        )}
        <Link to={node.href}>{node.title}</Link>
        {hasChildren ? <span className={styles.childCount}>{node.children.length}</span> : null}
      </div>
      {hasChildren && isOpen ? (
        <ul className={styles.treeBranch}>
          {node.children.map((child) => (
            <TreeNode key={child.id} node={child} depth={depth + 1} expanded={expanded} onToggle={onToggle} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export default function ManualOverview() {
  const branchIds = useMemo(
    () => flattenTree(FUSION_TREE).filter((node) => node.children?.length).map((node) => node.id),
    [],
  );
  const [expanded, setExpanded] = useState(() => new Set(branchIds));
  const [query, setQuery] = useState('');

  const visibleTree = useMemo(() => filterTree(FUSION_TREE, query), [query]);

  // Searching reveals matches under collapsed ancestors by auto-expanding them.
  // NOTE: union via forEach (never `new Set([...a, ...b])`): the production
  // Babel spread transform compiles Set spreads to a broken concat.
  useEffect(() => {
    if (!query.trim()) return;
    const ancestors = collectAncestorIds(FUSION_TREE, query);
    setExpanded((current) => {
      const next = new Set(current);
      ancestors.forEach((id) => next.add(id));
      return next;
    });
  }, [query]);

  const pageCount = useMemo(
    () => CATALOG_PAGES.filter((page) => page.material === 'fusion-manual').length,
    [],
  );
  const categories = useMemo(() => FUSION_TREE.filter((item) => item.children?.length), []);
  const recent = useMemo(() => recentPages(4), []);
  const empty = query.trim() && visibleTree.length === 0;

  const toggle = (id) => {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => setExpanded(new Set(branchIds));
  const collapseAll = () => setExpanded(new Set());

  return (
    <div className={styles.manualOverview}>
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>DaVinci Resolve / Fusion</span>
          <h1>Fusion 日本語リファレンス</h1>
          <p>
            基本概念、ノード、Expression、レシピを日本語で参照する非公式ドラフト。検証済みの公式仕様ではなく、UI検証用の作業草稿です。
          </p>
          <p className={styles.draftNote}>
            Draft — unverified. 公式仕様は Blackmagic Design の DaVinci Resolve
            ドキュメントで確認してください。UI fixture のみの項目は収録していません。
          </p>
        </div>
        <dl className={styles.metrics}>
          <div>
            <dt>Pages</dt>
            <dd>{pageCount}</dd>
          </div>
          <div>
            <dt>Source</dt>
            <dd>catalog</dd>
          </div>
        </dl>
      </header>

      <label className={styles.search}>
        <span aria-hidden="true">⌕</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Fusion内を検索・絞り込み"
          aria-label="Fusionページの絞り込み検索"
        />
      </label>

      <section className={styles.categoryGrid} aria-label="主要カテゴリ">
        {categories.map((category, index) => (
          <Link key={category.id} to={category.href} className={styles.categoryCard}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <strong>{category.title}</strong>
            <small>{category.children.length} pages</small>
          </Link>
        ))}
      </section>

      <div className={styles.contentGrid}>
        <section className={styles.treePanel} aria-label="全ページ階層">
          <div className={styles.sectionHeader}>
            <div>
              <span className={styles.eyebrow}>Structure</span>
              <h2>全ページ階層</h2>
            </div>
            <div className={styles.treeActions}>
              <button type="button" onClick={expandAll}>
                Expand all
              </button>
              <button type="button" onClick={collapseAll}>
                Collapse
              </button>
            </div>
          </div>
          {empty ? (
            <p className={styles.treeEmpty} role="status">
              「{query.trim()}」に一致するページはありません。
            </p>
          ) : (
            <ul className={styles.treeRoot}>
              {visibleTree.map((node) => (
                <TreeNode key={node.id} node={node} depth={0} expanded={expanded} onToggle={toggle} />
              ))}
            </ul>
          )}
        </section>

        <aside className={styles.recentPanel} aria-label="最近更新">
          <div className={styles.sectionHeader}>
            <div>
              <span className={styles.eyebrow}>Changes</span>
              <h2>最近更新</h2>
            </div>
          </div>
          <ol>
            {recent.map((page, index) => (
              <li key={page.route}>
                <Link to={page.route}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <strong>{page.title}</strong>
                  <time dateTime={page.updated ?? ''}>{(page.updated ?? '—').replaceAll('-', '.')}</time>
                </Link>
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </div>
  );
}
