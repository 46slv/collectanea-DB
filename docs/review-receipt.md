# COLLECTANEA — Review Receipt

Status: In progress
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
- Rendered correctness: **PENDING**.
- Accessibility behavior: **PENDING runtime checks**.
- Responsive quality: **PENDING capture**.

## Pass 2 — Rendered visual and interaction review

Status: PENDING GitHub Actions capture.

Required evidence:

1. desktop Home;
2. desktop Command Palette;
3. Manual top;
4. Article with hierarchy open;
5. Article with hierarchy closed;
6. Heading Rail active and hover state;
7. mobile Home;
8. mobile Article;
9. mobile hierarchy overlay.

The second pass will inspect hierarchy, grouping, alignment, spacing, typography, monochrome luminance, real-size thin lines, responsive behavior, console errors, and maintenance regressions. Repairs and residual gaps will be appended after capture.
