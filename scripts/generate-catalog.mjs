import {readdirSync, readFileSync, statSync, writeFileSync} from 'node:fs';
import {join, relative, sep} from 'node:path';
import {execSync} from 'node:child_process';

const ROOT = process.cwd();
const OUT = join(ROOT, 'src', 'data', 'generated-catalog.json');

function listMarkdown(dir) {
  const out = [];
  const walk = (current) => {
    let entries = [];
    try {
      entries = readdirSync(current, {withFileTypes: true});
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = join(current, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.(md|mdx)$/.test(entry.name)) out.push(full);
    }
  };
  walk(join(ROOT, dir));
  return out;
}

function parseFrontMatter(text) {
  if (!text.startsWith('---')) return {};
  const end = text.indexOf('---', 3);
  if (end < 0) return {};
  const block = text.slice(3, end);
  const result = {};
  let currentKey = null;
  for (const rawLine of block.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const match = line.match(/^([A-Za-z0-9_/-]+)\s*:\s*(.*)$/);
    if (match) {
      currentKey = match[1];
      let value = match[2].trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (value.startsWith('[') && value.endsWith(']')) {
        result[currentKey] = value
          .slice(1, -1)
          .split(',')
          .map((s) => s.trim().replace(/^["']|["']$/g, ''))
          .filter(Boolean);
      } else if (value === '') {
        result[currentKey] = '';
      } else {
        result[currentKey] = value;
      }
    } else if (currentKey && line.startsWith('-')) {
      const item = line.replace(/^-\s*/, '').replace(/^["']|["']$/g, '').trim();
      if (!Array.isArray(result[currentKey])) result[currentKey] = [];
      if (item) result[currentKey].push(item);
    }
  }
  return result;
}

function gitDate(file) {
  try {
    const out = execSync(`git log -1 --format=%cs -- "${file}"`, {cwd: ROOT, encoding: 'utf8'}).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(out)) return out;
  } catch {
    // fall through
  }
  try {
    const stat = statSync(join(ROOT, file));
    return stat.mtime.toISOString().slice(0, 10);
  } catch {
    return null;
  }
}

function routeFor(sourcePath, frontMatter) {
  const normalized = sourcePath.split(sep).join('/');
  if (normalized.startsWith('articles/')) {
    const slug = typeof frontMatter.slug === 'string' && frontMatter.slug
      ? frontMatter.slug.replace(/^\/+/, '')
      : normalized.replace(/^articles\//, '').replace(/\.(md|mdx)$/, '').replace(/^\d{4}-\d{2}-\d{2}-/, '');
    return `/articles/${slug}`;
  }
  if (normalized.startsWith('manuals/')) {
    let rest = normalized.replace(/^manuals\//, '').replace(/\.(md|mdx)$/, '');
    if (rest.endsWith('/index')) rest = rest.slice(0, -'/index'.length);
    if (rest === 'index') return '/manuals';
    if (frontMatter.slug) {
      const slug = String(frontMatter.slug).replace(/^\/+/, '');
      return `/manuals/${slug}`;
    }
    return `/manuals/${rest}`;
  }
  if (normalized.startsWith('reference/')) {
    let rest = normalized.replace(/^reference\//, '').replace(/\.(md|mdx)$/, '');
    if (rest.endsWith('/index')) rest = rest.slice(0, -'/index'.length);
    if (rest === 'index' || rest === '') return '/reference';
    return `/reference/${rest}`;
  }
  if (normalized.startsWith('research/')) {
    let rest = normalized.replace(/^research\//, '').replace(/\.(md|mdx)$/, '');
    if (rest.endsWith('/index')) rest = rest.slice(0, -'/index'.length);
    if (rest === 'index' || rest === '') return '/research';
    return `/research/${rest}`;
  }
  return null;
}

function typeFor(sourcePath, frontMatter) {
  const normalized = sourcePath.split(sep).join('/');
  if (normalized.startsWith('articles/')) return 'Article';
  if (normalized.startsWith('reference/')) return 'Reference';
  if (normalized.startsWith('research/')) return 'Research';
  if (normalized.startsWith('manuals/')) return 'Manual';
  return 'Page';
}

function materialFor(sourcePath) {
  const normalized = sourcePath.split(sep).join('/');
  if (normalized.startsWith('manuals/fusion')) return 'fusion-manual';
  if (normalized.startsWith('manuals/')) return 'manuals';
  if (normalized.startsWith('articles/')) return 'articles';
  if (normalized.startsWith('reference/')) return 'reference';
  if (normalized.startsWith('research/')) return 'research';
  return 'site';
}

function firstHeading(text) {
  const body = text.replace(/^\uFEFF/, '').replace(/^---[\s\S]*?---/, '');
  for (const line of body.split('\n')) {
    const trimmed = line.trim();
    const match = trimmed.match(/^#\s+(.+)$/);
    if (match) return match[1].trim();
  }
  return null;
}

function excerptFor(text, frontMatter) {
  if (typeof frontMatter.description === 'string' && frontMatter.description) return frontMatter.description;
  const body = text
    .replace(/^\uFEFF/, '')
    .replace(/^---[\s\S]*?---/, '')
    .split('\n')
    .filter((line) => !/^\s*import\s+/.test(line) && !/^\s*<\s*[A-Z]/.test(line))
    .join('\n')
    .replace(/<[^>]+>/g, ' ');
  const paragraph = body
    .split(/\n\s*\n/)
    .map((s) => s.trim().replace(/\s+/g, ' '))
    .find((s) => s && !s.startsWith('#') && !s.startsWith('```') && s.length > 20);
  if (!paragraph) return '';
  return paragraph.slice(0, 160);
}

const sources = [
  ...listMarkdown('manuals'),
  ...listMarkdown('articles'),
  ...listMarkdown('reference'),
  ...listMarkdown('research'),
];

const pages = [];
for (const absolute of sources) {
  const rel = relative(ROOT, absolute).split(sep).join('/');
  const text = readFileSync(absolute, 'utf8');
  const frontMatter = parseFrontMatter(text);
  const route = routeFor(rel, frontMatter);
  if (!route) continue;
  // UI-only fixtures stay out of the public catalog: skip underscore/private files.
  if (rel.split('/').some((part) => part.startsWith('_'))) continue;
  const title = (typeof frontMatter.title === 'string' && frontMatter.title) || firstHeading(text) || rel;
  const tags = Array.isArray(frontMatter.tags) ? frontMatter.tags : [];
  pages.push({
    sourcePath: rel,
    route,
    title: String(title),
    description: excerptFor(text, frontMatter),
    tags,
    type: typeFor(rel, frontMatter),
    material: materialFor(rel),
    updated: gitDate(rel),
    sidebarPosition: Number(frontMatter.sidebar_position ?? frontMatter.sidebarPosition ?? 999),
  });
}

pages.sort((a, b) => a.route.localeCompare(b.route));

let candidate = 'unknown';
try {
  candidate = execSync('git rev-parse HEAD', {cwd: ROOT, encoding: 'utf8'}).trim();
} catch {
  // keep unknown
}

const payload = {
  generatedBy: 'scripts/generate-catalog.mjs',
  candidate,
  pages,
};

writeFileSync(OUT, `${JSON.stringify(payload, null, 2)}\n`);
console.log(`catalog: ${pages.length} pages -> src/data/generated-catalog.json`);
for (const page of pages) console.log(` - ${page.route} (${page.type}, ${page.updated ?? 'no-date'}) :: ${page.sourcePath}`);
