"""Refresh derived Fusion coverage in the existing screenshot candidates ledger.

An image or native example is coverage evidence, not full article verification.
Human/agent review decisions are retained; no Resolve or network access is used.
"""
from collections import Counter
from datetime import datetime, timezone
import json
from pathlib import Path
import re

root = Path(__file__).resolve().parents[1]
ledger = root / 'docs/fusion-screenshot-candidates.json'
data = json.loads(ledger.read_text(encoding='utf-8'))
previous = {p['article']: p for p in data.get('coverage_inventory', {}).get('pages', [])}
by_article = {}
for case in data['candidates']:
    by_article.setdefault(case['article'], []).append(case)
reuse_by_article = {}
for reuse in data.get('reuses', []):
    reuse_by_article.setdefault(reuse['article'], []).append(reuse)

def field(text, name, fallback=''):
    match = re.search(r'^' + re.escape(name) + r':\s*(.+)$', text, re.M)
    return match.group(1).strip().strip('"\'') if match else fallback

pages = []
for path in sorted((root / 'manuals/fusion').rglob('*')):
    if path.suffix not in ('.md', '.mdx'):
        continue
    text = path.read_text(encoding='utf-8')
    article = path.relative_to(root).as_posix()
    old = previous.get(article, {})
    cases = by_article.get(article, [])
    native = [c['id'] for c in cases if c['status'] in ('captured-local-display-verified', 'published-display-verified')]
    reused = [c['source_case'] for c in reuse_by_article.get(article, []) if c['status'] != 'planned']
    kind = field(text, 'doc_type', 'index' if path.stem == 'index' else 'article')
    images = len(re.findall(r'!\[|<img\b', text))
    state = 'illustrated-native-example' if native else 'illustrated-reused-example' if reused else old.get('state', 'needs-review')
    page = dict(article=article, title=field(text, 'title', path.stem), kind=kind,
                image_count=images, native_cases=native, reused_cases=reused, planned_cases=[c['id'] for c in cases if c['id'] not in native],
                state=state)
    for key in ('decision', 'reason', 'reuse_candidates', 'priority', 'blocker', 'remaining_views'):
        if key in old:
            page[key] = old[key]
    if native or reused:
        page['decision']='image-required'
        page.setdefault('reason','本文の接続・設定・出力を、撮影済みの固定例で図示する。記事全体の検証とは区別する。')
    pages.append(page)

assert len({p['article'] for p in pages}) == len(pages)
data['coverage_inventory'] = dict(
    checked_at=datetime.now(timezone.utc).isoformat(),
    scope='All manuals/fusion Markdown and MDX pages; review necessity before adding images.',
    completion_rule='Every page has an explicit image decision; necessary images are native-observed, embedded, saved to GitHub and public-display-verified. A native example does not verify all article controls.',
    summary=dict(total_pages=len(pages), with_images=sum(p['image_count'] > 0 for p in pages),
                 with_native_examples=sum(bool(p['native_cases'] or p['reused_cases']) for p in pages),
                 states=dict(Counter(p['state'] for p in pages)),
                 decisions=dict(Counter(p.get('decision','needs-review') for p in pages))),
    pages=pages)
ledger.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8', newline='\n')
print(json.dumps(data['coverage_inventory']['summary'], ensure_ascii=False))
