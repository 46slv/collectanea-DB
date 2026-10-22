# DaVinci Resolve Color Manual — Authoring Scope

Updated: 2026-10-23
Status: Active authoring lane / draft delivery
Repository: [46slv/collectanea-DB](https://github.com/46slv/collectanea-DB)
Authority: separate Color-page manual requested 2026-10-21; worker-operation repair and verified main integration authorized 2026-10-23.

## Scope / ownership

- **Color manual** owns `manuals/resolve/color/**`: Color-page color grading, node workflow, primary/secondary grading, scopes, HDR wheels, color management, stills, tracking and troubleshooting.
- **Color Writer A** owns individual `reference/**` articles; **Color Writer B** owns individual `learn/**`, `recipes/**`, `troubleshooting/**` articles. Shared indexes are excluded from both writer scopes.
- **Collectanea Integrator** owns shared indexes, `manuals/resolve/index.md`, shared configuration, candidate validation and main publication across all article lanes. There is no separate Color main-writing integrator.
- **Fusion manual** owns `manuals/fusion/**`, including Fusion Color Nodes. Color writers do not edit these articles.
- **Interactive dictionary** owns `reference/visual-processing/**` and its Canvas experiments. Color writers do not edit that source.
- Shared `docusaurus.config.js`, `sidebars*.js`, `plugins/`, `src/`, root `manuals/index.md`, cross-app architecture and search remain integration-only.
- Writers deliver branches and PRs; they do not update public `main` directly.

The current scheduling, one-WIP-PR limit, candidate freeze, CI and merge protocol are defined in [article-worker-operations.md](article-worker-operations.md). That document supersedes the former stacked-PR cadence without changing these content-quality requirements.

## Writing structure

Follow `docs/fusion-authoring-contract.md`, adapted to the **Color page** rather than Fusion Node input/output:

| Reader goal | Destination |
| --- | --- |
| Understand color processing | `learn/` |
| Look up a palette/control | `reference/` |
| Reuse a verified grading pattern | `patterns/`, after explicit ownership assignment |
| Finish a concrete grade | `recipes/` |
| Diagnose a symptom | `troubleshooting/` |
| Find what to read | `index.md`, managed by Integrator |

Every new page answers a practical question in clear Japanese with actual use, an observed or source-grounded expected effect, version/source/verification status and relevant links. Do not mass-generate placeholders, invent controls/defaults, copy long manual passages, or add nonexistent links.

## Source and validation

- Primary sources: Blackmagic Design DaVinci Resolve 21.1 Reference Manual, available from the [support center](https://www.blackmagicdesign.com/support), and the [official Color page](https://www.blackmagicdesign.com/products/davinciresolve/color).
- Consult the supplied 21.1 Manual's relevant chapter when specifying controls or exact procedures. If unavailable or unconfirmed, identify the gap without inventing details.
- Source-grounded text is not Resolve host acceptance. Keep `verification: partial` where host/runtime behavior remains unchecked.
- Before writing, inspect current main, all relevant open PRs and current ownership. One file has one active writer.
- Each writer maintains at most one unintegrated PR. Finish or repair that batch before starting another. New batches begin on fresh main, not another writer's unmerged branch.
- Validate changed claims, frontmatter, links and relevant focused tests. A completed remote head is marked READY and frozen for integration; do not append more articles while it is being validated.
- Integrator reconciles current main and shared navigation, runs the necessary checks on the exact frozen candidate, and verifies mergeability before advancing main. Current user authorization covers this verified merge and the existing Pages deployment; it does not turn unverified behavior into confirmed fact.

## Topic selection

Choose the next substantive gap from the live published articles and current writer PRs rather than this document's historical seed list. Prefer missing user-facing explanation, concrete grading examples and source verification over metadata expansion. Existing topics may include Primaries, Log/HDR Wheels, Curves, Qualifier/Window/Tracker, RCM/CST, Gallery/Stills, Group/Timeline grading and delivery troubleshooting.

Own captures and host-specific recipes are added after the relevant scope and evidence are available. A page's existence is not proof of visual or host verification. Current progress belongs in GitHub and the project Notion state, not a duplicated static checklist here.
