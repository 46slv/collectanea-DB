# COLLECTANEA — UI Foundation Execution Task

Status: Complete
Branch: `feat/award-grade-ui-foundation`

## Authorities

Read before editing:

- `docs/requirements.md`
- `docs/brief.md`
- `docs/quality-bar.md`
- `docs/design-references.md`
- `README.md`
- `package.json`
- `docusaurus.config.js`
- current `src/`, `manuals/`, `articles/`, `reference/`, `research/`
- current Git status and branch

## Goal

Implement the next coherent COLLECTANEA UI foundation: highly readable, visually refined, maintainable, responsive, accessible, and resilient to later visual changes. Preserve Docusaurus and Markdown/MDX as the content engine.

## Required scope

### 1. Shared content model

Create one centralized material/page metadata source used by Home panels, lists, filtering, sorting, and search. Do not duplicate UI-only copies of the same data. Include enough representative entries to exercise DaVinci/Fusion, Blender, Git, After Effects, Cavalry, Articles, Reference, and Research.

### 2. Home explorer

Replace the poetic hero and four generic category cards with:

- compact site header;
- large search entry opening an accessible Command Palette;
- separate content-type and domain/tag filtering;
- materials sorted by recently updated by default;
- user-selectable sorting alternatives;
- Panel/List view toggle;
- monochrome, dense, stable cards/rows;
- persisted view/filter/sort preference where useful.

### 3. Command Palette

Implement keyboard, pointer, and touch operation:

- visible GUI entry and optional Ctrl/Cmd+K;
- live matching;
- type, material/hierarchy, tags, and optional excerpt;
- arrow-key selection, Enter, Escape;
- strong active-row luminance and a second non-color cue;
- no hover-only required information.

### 4. Manual top

Build a Fusion manual landing view with:

- Manual search/filter;
- category summaries;
- a real multi-level hierarchy tree, not only top-level counts;
- expandable/collapsible branches;
- recent updates;
- direct links to pages.

### 5. Reading shell

Implement the documentation reading layout:

- left hierarchy navigation;
- central article body;
- right Heading Rail;
- hierarchy collapse state persisted across navigation;
- when hierarchy is closed, Article + Heading Rail recentered against the viewport, not merely widened into the old grid;
- mobile hierarchy as an overlay/drawer.

### 6. Heading Rail

Generate from rendered Markdown headings:

- H1 longest, H2 medium, H3 short;
- clear inactive / hover / active luminance states;
- active may also use increased thickness;
- hover/focus label opens to the left as an overlay and does not reflow layout;
- click/keyboard activates the heading anchor;
- active heading tracks scrolling;
- touch and reduced-motion paths remain usable.

### 7. Design system and maintainability

- Centralize tokens for typography, spacing, luminance, surfaces, lines, radii, widths, motion, and breakpoints.
- Use monochrome first; reserve color tokens for later.
- Use Lexend Variable for Latin/UI and Noto Sans JP for Japanese body if practical without fragile loading; provide robust fallbacks.
- Minimize Docusaurus swizzling. Prefer theme wrapping or small owned components over ejected copies.
- Avoid page-local magic numbers and duplicate state.
- Keep hit targets stable; fluid/proximity hover changes luminance/border/local light rather than moving the target.
- Preserve visible focus and `prefers-reduced-motion`.

## Reference principles to evaluate, not copy

- Ottografie: nested navigation that remains understandable across levels.
- Docusign Brand Guidelines: category-led guideline architecture and consistent content templates.
- Affinity Studio Website: visual quality driven by function rather than decoration.
- X, The Moonshot Factory: searchable, filterable project index and strong content hierarchy.
- Official Docusaurus 3.10.2 guidance: wrap before eject when possible; keep search/theme customizations localized.

Update `docs/design-references.md` with explicit Borrow / Avoid / Scope / source / checked date for any references actually used.

## Verification and review loop

1. Run the production build and existing relevant checks.
2. Capture and inspect at minimum:
   - desktop Home;
   - desktop Command Palette;
   - Manual top;
   - Article with hierarchy open;
   - Article with hierarchy closed;
   - Heading Rail inactive/hover/active states;
   - mobile Home;
   - mobile Article;
   - mobile hierarchy overlay.
3. Perform at least two bounded self-review/repair passes against `docs/quality-bar.md`.
4. Record findings and dispositions in `docs/review-receipt.md`.
5. Re-run the production build after repairs.

## Authority

Allowed:

- edit files in this repository;
- add justified dependencies;
- run build/tests/browser checks;
- create screenshots/review evidence;
- commit and push this task branch.

Not allowed:

- merge to `main`;
- publish a release;
- change repository settings;
- expose credentials;
- force-push or rewrite shared history.

## Done

- coherent implementation is committed and pushed on this branch;
- production build passes;
- required screens and states have review evidence;
- two bounded review/repair passes are recorded;
- requirements, brief, references, and implementation agree;
- final worker report names commit SHA, changed paths, commands/results, review findings fixed, and residual gaps.


## Completion record — 2026-10-01

Final implementation candidate:

- Head SHA: `be30350cbf81cfae91b324e05bd8db56acdb12d6`
- GitHub Actions: run `36750386329` — **success**
- Synthetic merge tested: `8f263672f6cfe1a4cfd3e2e5762c0babd6d5a979`
- Production build: PASS
- Real-browser UI checks: 12 / 12 PASS
- Content integration: PASS with 50 temporary fixtures removed
- Console/page errors: 0
- Closed hierarchy article center drift: 0px
- Post-test tracked source changes: 0

Evidence and final finding dispositions are recorded in `docs/review-receipt.md`.

The implementation scope in this task is complete. Merge to `main`, deployment/publication, and technical verification of the Fusion manual remain separate authority/scope.
