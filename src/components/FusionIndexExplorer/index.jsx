import React, {useMemo, useState} from 'react';
import Link from '@docusaurus/Link';
import {normalize, useCatalog} from '@site/src/data/catalog';

const MODES = {
  'node-a-z': 'nodes',
  'concept-a-z': 'concepts',
  'controls-parameters': 'controls',
  'by-task': 'tasks',
  'by-symptom': 'symptoms',
  'connection-data-types': 'dataTypes',
  glossary: 'glossary',
  'by-resolve-surface': 'resolveSurfaces',
  'by-familiar-app': 'familiarApps',
};
const labels = {
  image: '2D Image', mask: 'Mask', shape: 'Shape', 'particle-set': 'Particle set',
  'classic-3d-scene': 'Classic 3D scene', 'usd-scene': 'USD scene', 'deep-image': 'Deep image',
  fusion: 'Fusion', edit: 'Edit', color: 'Color', fairlight: 'Fairlight', media: 'Media', deliver: 'Deliver',
  'after-effects': 'After Effects', photoshop: 'Photoshop', 'premiere-pro': 'Premiere Pro', nuke: 'Nuke',
  composite: '合成する', position: '位置を動かす', resize: '解像度を変える', animate: 'アニメーションを付ける',
  automate: '自動化する', 'link-values': '値を連動する', reuse: '再利用する', track: 'トラッキングする',
  particles: 'パーティクルを扱う', debug: '診断する', performance: '軽くする / 高速化する',
  'color-correct': '色を補正する', key: 'キーイングする', text: 'テキストを作る', template: 'テンプレート化する',
};
const display = (key = '') => labels[key] || String(key).replace(/[-_]+/g, ' ');
const textFor = (value) => normalize(JSON.stringify(value));

export function fusionIndexMode(page) {
  if (!page || page.material !== 'fusion' || page.segments?.[0] !== 'index') return null;
  return MODES[page.segments.at(-1)] || null;
}
function Meta({values = []}) {
  if (!values.length) return null;
  return <div className="cc-fusion-index-tags">{values.slice(0, 6).map((value) => <span key={value}>{display(value)}</span>)}</div>;
}
function PageRow({item}) {
  const meta = [item.nodeFamily || item.docType, ...(item.aliases || []).slice(0, 2)].filter(Boolean);
  return <li className="cc-fusion-index-row">
    <div><Link to={item.href}>{item.title}</Link><p>{item.summary}</p></div>
    <Meta values={meta} />
  </li>;
}
function FlatIndex({items}) {
  return <ul className="cc-fusion-index-list">{items.map((item) => <PageRow key={item.id} item={item} />)}</ul>;
}
function GroupIndex({items}) {
  return <div className="cc-fusion-index-groups">{items.map((group) => <details key={group.key} className="cc-fusion-index-group">
    <summary><strong>{display(group.key)}</strong><span>{group.count} 件</span></summary>
    <ul className="cc-fusion-index-list">{group.items.map((item) => <PageRow key={item.id} item={item} />)}</ul>
  </details>)}</div>;
}
function DataTypeIndex({items}) {
  return <div className="cc-fusion-index-groups">{items.map((group) => <details key={group.key} className="cc-fusion-index-group">
    <summary><strong>{display(group.key)}</strong><span>{group.count} Node</span></summary>
    <div className="cc-fusion-index-columns">
      <section><h3>出力するNode</h3>{group.producers.length ? <FlatIndex items={group.producers} /> : <p className="cc-meta">現在のReferenceにはありません。</p>}</section>
      <section><h3>入力として受けるNode</h3>{group.consumers.length ? <FlatIndex items={group.consumers} /> : <p className="cc-meta">現在のReferenceにはありません。</p>}</section>
    </div>
  </details>)}</div>;
}
export default function FusionIndexExplorer({mode}) {
  const {indexes = {}} = useCatalog();
  const [query, setQuery] = useState('');
  const source = indexes[mode] || [];
  const items = useMemo(() => {
    if (!normalize(query)) return source;
    return source.filter((entry) => textFor(entry).includes(normalize(query)));
  }, [source, query]);
  const grouped = !['nodes', 'concepts', 'glossary'].includes(mode);
  return <section className="cc-fusion-index" data-cc-fusion-index={mode}>
    <div className="cc-fusion-index-toolbar">
      <label>この索引を絞り込む<input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="名前・用語・用途・Node…" /></label>
      <span className="cc-meta">{items.length} 項目</span>
    </div>
    {!items.length ? <p className="cc-empty">該当する項目がありません。</p> :
      mode === 'dataTypes' ? <DataTypeIndex items={items} /> :
      grouped ? <GroupIndex items={items} /> : <FlatIndex items={items} />}
  </section>;
}
