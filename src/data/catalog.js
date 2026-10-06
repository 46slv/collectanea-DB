import catalogData from '@collectanea/catalog-data';
export const CONTENT_TYPES = [{value: 'all', label: 'すべて'}, {value: 'manual', label: 'Manual'}, {value: 'article', label: 'Article'}, {value: 'reference', label: 'Reference'}, {value: 'research', label: 'Research'}];
export function useCatalog() { return catalogData; }
export const normalize = (text = '') => String(text).normalize('NFKC').toLocaleLowerCase('ja').trim();
export function matches(entry, query) {
  const haystack = normalize(entry.text || [entry.title, entry.summary, entry.materialTitle, ...(entry.tags || [])].join(' '));
  return normalize(query).split(/\s+/u).filter(Boolean).every((token) => haystack.includes(token));
}
export function filterTree(nodes, query) {
  if (!normalize(query)) return nodes;
  return nodes.flatMap((node) => {
    if (matches({title: node.title}, query)) return [node];
    const children = filterTree(node.children || [], query);
    return children.length ? [{...node, children}] : [];
  });
}
export function treeIds(nodes) { return nodes.flatMap((node) => [node.id, ...treeIds(node.children || [])]); }
export function sorted(items, order) {
  return [...items].sort((a, b) => order === 'name' ? a.title.localeCompare(b.title, 'ja') : order === 'count' ? (b.pageCount || 0) - (a.pageCount || 0) : String(b.updated || '').localeCompare(String(a.updated || '')) || a.title.localeCompare(b.title, 'ja'));
}
export function statusLabel(status) { return status === 'unverified' || status === 'working-draft' ? '未検証' : status === 'deprecated' ? '旧版' : ''; }
