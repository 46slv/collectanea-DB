# COLLECTANEA — Review Receipt

Status: Repaired — awaiting parent PR review
Branch: `feat/award-grade-ui-foundation`
Updated: 2026-09-30

## Review contract

Authority:

- `docs/requirements.md`
- `docs/brief.md`
- `docs/quality-bar.md`
- `docs/design-references.md`
- `docs/execution-task.md`

A review pass records observed evidence, severity, repair, and residual risk. Scores are internal comparison aids, not award or compliance claims.

## Pass 1 — Structure and implementation review

Evidence basis: source inspection before rendered capture.

### Findings

1. **P0 — Home did not implement the required explorer.**
   - Prior state used a poetic hero and four generic section cards.
   - Repair: replace with a data-driven material explorer, large search entry, separate Type and Domain filters, sort, and Grid/List views.

2. **P0 — Manual top did not show the real hierarchy.**
   - Prior state exposed only top-level sections.
   - Repair: add a searchable multi-level Fusion tree with expand/collapse and direct page links.

3. **P0 — Right TOC did not match the Heading Rail requirement.**
   - Prior state used the default text TOC.
   - Repair: wrap the Docusaurus TOC with line lengths by heading level, active-scroll luminance, hover/focus label, and anchor navigation.

4. **P1 — Home, search, and navigation did not share one content model.**
   - Repair: centralize representative material, hierarchy, and search metadata in `src/data/catalog.js`.

5. **P1 — Visual values were distributed across component CSS.**
   - Repair: centralize typography, spacing, luminance, surface, line, radius, width, and motion tokens in `src/css/custom.css`.

6. **P1 — Sidebar-closed centering had no explicit layout state.**
   - Repair: expose expanded/collapsed state at the document root and recenter Article + Heading Rail as one reading unit.

### Pass 1 disposition

- Source-level P0 findings: addressed in the first implementation candidate.
- Rendered correctness: verified in Pass 2 below.
- Accessibility behavior: verified at runtime in Pass 2 below.
- Responsive quality: captured in Pass 2 below.

## Pass 2 — Completion repair (R1–R9) + rendered verification

Evidence basis: repaired implementation, production build, static regressions,
and 11 real-browser cases with screenshots against a local production serve.
Review packet: PR #1 comment 5904420226 (candidate `52480427464cf3ab28e3706ac6fb2ebd025f9947`).

### Repairs (found → fixed → verified)

- **R1 content truth.** Removed fabricated counts/dates/hrefs and the
  circle-tutorial mislabel. `scripts/generate-catalog.mjs` derives
  `src/data/generated-catalog.json` from real Markdown/MDX/docs/blog metadata
  (route, title, description, tags, git date); `src/data/catalog.js` consumes
  it. Page counts count real pages only. Blender / After Effects / Cavalry /
  Git are explicit `planned` (no date/count/href). Tree and search hrefs are
  real page routes; no `#` fragment links. Verified by
  `scripts/regression-check.mjs` (passed, 14 pages) and capture cases
  03/11 (zero fragment links; real article resolves).
- **R2 one global search.** Deleted the Home-only `CommandPalette` and the
  duplicate navbar `search-local` theme. `GlobalSearch` (combobox + modal
  dialog, focus trap/restoration, Escape anywhere, IME-safe Enter, tokenized
  JA/Latin match, Type/Domain facets, honest totals, zero-result guidance,
  type badge kept on mobile) mounts in `Root.js` and opens from a navbar
  entry plus Ctrl/Cmd+K on every page. Verified by cases 02/07/11.
- **R3 reading state/centering.** Replaced MutationObserver/width heuristics
  and `?sidebar=` URL forcing with persisted explicit state
  (`collectanea.sidebar.v1`, validated, storage-failure tolerant, doc-route
  scoped) plus a discoverable Hierarchy toggle. Closed state centers the
  800px article column against the viewport (measured drift **0px**,
  width 800px) with the rail fixed in a gutter. Reload persistence verified.
  Cases 04/05.
- **R4 heading rail.** Recomputes on route change; H1 34 / H2 24 / H3 16px
  lengths; explicit muted/secondary/primary + 2px active treatment both
  themes; visible focus; 24px hit rows; active tooltips on hover/focus;
  scrollable long lists; mobile `<details>` heading navigation via new
  `src/theme/TOCCollapsible`. Cases 06/08.
- **R5 persistence/hierarchy search.** Explorer prefs initialize SSR-safe and
  hydrate from validated storage after mount. Tree search keeps full children
  on parent match and auto-expands ancestors of matches; accessible labels
  and empty states; unimplemented `/` hint removed. Cases 03/05.
- **R6 Articles DB.** New `BlogListPage` wrapper layers a searchable,
  tag-filterable, Panel/List, recently-updated-first DB (`ArticlesExplorer`)
  over the untouched blog plugin (post URLs/RSS preserved; chronological
  list still renders below). Case 10.
- **R7 visual system.** Compact header (no slogan hero), honest
  catalog-derived stats, monochrome tokens, stable selectors only (Infima
  `.row`/`.col`, `main`, element structure — no CSS-module hashes), fonts via
  `<link display=swap>` with fallbacks, wide table/code overflow handling,
  reduced-motion preserved, attribution kept. Cases 01/07/09 + inspection.
- **R8 provenance.** Fusion surfaces marked Draft/unverified working notes
  (Manual top note + per-article banner pointing at official Blackmagic
  docs); UI-only fixtures excluded from the catalog. Cases 03/04 screenshots.
- **R9 evidence.** `capture-ui.mjs` rewritten (scoped locators, real-control
  interaction, failure screenshots, candidate/environment record, behavior
  assertions incl. centering geometry, empty search, storage reload, honesty
  regressions). `@playwright/test@1.56.0` locked in devDependencies;
  `npm run catalog|capture|test:regressions` documented. `pr-quality.yml`
  runs regressions + build + capture and uploads **collectanea-visual-evidence**
  plus the new **collectanea-built-site** artifact (`build/` +
  `build/candidate.json` with commit SHA) for independent cloud review.

### Toolchain incident found during verification

Production Babel compiles `new Set([...setA, ...setB])` / `[...aSet]` to a
broken `[].concat(...)` that stores Set objects instead of ids. It silently
broke tree auto-expand and the Articles tag list. Fixed by avoiding Set
spreads in bundled code (`forEach` union, `Array.from`). Array/object
spreads are unaffected. Future edits must not reintroduce Set spreads in
`src/`.

### Verification results

Commands (Node v24.14.1, Windows WS + Ubuntu CI equivalent):

- `npm run catalog` → 14 pages indexed
- `node scripts/regression-check.mjs` → passed
- `npm run build` → Client + Server compiled successfully, static files generated
- `npm run serve` + `node scripts/capture-ui.mjs` → **11/11 cases passed**,
  zero console/page errors (`artifacts/visual/capture-report.json`,
  candidate `52480427464cf3ab28e3706ac6fb2ebd025f9947` pre-commit tree)

Evidence: `artifacts/visual/` (11 PNG + `capture-report.json` +
`candidate.json`; PNGs flow through the CI `collectanea-visual-evidence`
artifact, the static site through `collectanea-built-site`).

### Residual gaps (not waived)

1. All `updated` dates are identical (single-day history); recency sorting is
   structurally verified but visually uniform until content ages.
2. Fusion prose remains Draft/unverified — completing the UI is not
   completing a Fusion manual (needs primary-source verification pass).
3. No automated contrast-ratio measurement; rail states were inspected at
   real size in both themes but not instrumented.
4. `docs/quality-bar.md` numeric gate (8.0+/8.75) intentionally not claimed;
   no invented quality score per R9.
