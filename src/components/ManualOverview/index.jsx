import React, {useMemo, useState} from 'react';
import Link from '@docusaurus/Link';
import {FUSION_TREE, flattenTree} from '../../data/catalog';
import styles from './styles.module.css';

function filterTree(nodes, query) {
  const normalized = query.trim().toLocaleLowerCase('ja');
  if (!normalized) return nodes;
  return nodes.flatMap((node) => {
    const children = filterTree(node.children ?? [], query);
    if (node.title.toLocaleLowerCase('ja').includes(normalized) || children.length) {
      return [{...node, children}];
    }
    return [];
  });
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
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              expanded={expanded}
              onToggle={onToggle}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export default function ManualOverview() {
  const branchIds = flattenTree(FUSION_TREE)
    .filter((node) => node.children?.length)
    .map((node) => node.id);
  const [expanded, setExpanded] = useState(() => new Set(branchIds));
  const [query, setQuery] = useState('');

  const visibleTree = useMemo(() => filterTree(FUSION_TREE, query), [query]);
  const pageCount = flattenTree(FUSION_TREE).length;
  const categories = FUSION_TREE.filter((item) => item.children?.length).slice(0, 4);
  const recent = [
    ['Merge', '/manuals/fusion/nodes/merge', '2026-09-30'],
    ['Transform', '/manuals/fusion/nodes/transform', '2026-09-29'],
    ['Expressions', '/manuals/fusion/expressions', '2026-09-28'],
    ['Background', '/manuals/fusion/nodes/background', '2026-09-27'],
  ];

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
          <p>基本概念、ノード、Expression、レシピを日本語で参照できる非公式マニュアル。</p>
        </div>
        <dl className={styles.metrics}>
          <div><dt>Pages</dt><dd>{pageCount}</dd></div>
          <div><dt>Updated</dt><dd>2026.09.30</dd></div>
        </dl>
      </header>

      <label className={styles.search}>
        <span aria-hidden="true">⌕</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Fusion内を検索・絞り込み"
        />
        <kbd>/</kbd>
      </label>

      <section className={styles.categoryGrid} aria-label="主要カテゴリ">
        {categories.map((category, index) => (
          <Link key={category.id} to={category.href} className={styles.categoryCard}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <strong>{category.title}</strong>
            <small>{category.children.length} sections</small>
          </Link>
        ))}
      </section>

      <div className={styles.contentGrid}>
        <section className={styles.treePanel}>
          <div className={styles.sectionHeader}>
            <div>
              <span className={styles.eyebrow}>Structure</span>
              <h2>全ページ階層</h2>
            </div>
            <div className={styles.treeActions}>
              <button type="button" onClick={expandAll}>Expand all</button>
              <button type="button" onClick={collapseAll}>Collapse</button>
            </div>
          </div>
          <ul className={styles.treeRoot}>
            {visibleTree.map((node) => (
              <TreeNode
                key={node.id}
                node={node}
                depth={0}
                expanded={expanded}
                onToggle={toggle}
              />
            ))}
          </ul>
        </section>

        <aside className={styles.recentPanel}>
          <div className={styles.sectionHeader}>
            <div>
              <span className={styles.eyebrow}>Changes</span>
              <h2>最近更新</h2>
            </div>
          </div>
          <ol>
            {recent.map(([title, href, date], index) => (
              <li key={title}>
                <Link to={href}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <strong>{title}</strong>
                  <time dateTime={date}>{date.replaceAll('-', '.')}</time>
                </Link>
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </div>
  );
}
