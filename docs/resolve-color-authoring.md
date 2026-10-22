# DaVinci Resolve Color Manual — Authoring Scope

Updated: 2026-10-21
Status: Active authoring lane / draft delivery
Repository: [46slv/collectanea-DB](https://github.com/46slv/collectanea-DB)
Authority: user requested a separate Color page manual, with the same incremental Writer A / Writer B / Integrator method as Fusion (2026-10-21 JST).

## Scope / ownership

- **Color manual** owns `manuals/resolve/color/**`: Color page color grading, node workflow, primary/secondary grading, scopes, HDR wheels, color management, stills, tracking, Color-page-specific debugging.
- **Suite landing** `manuals/resolve/index.md` is shared navigation; Integrator owns future modifications after this seed.
- **Fusion manual** owns `manuals/fusion/**` (including its *Fusion Color Nodes*). Color writers never edit or reword Fusion articles merely to fill this manual.
- **COLLECTANEA interactive dictionary** owns `reference/visual-processing/**` and separate experiment/Canvas code. Color writers do not edit its own source.
- Shared `docusaurus.config.js`, `sidebars*.js`, `plugins/`, `src/`, root `manuals/index.md`, cross-app architecture and search are **integration-only**, never Writer A/B territory without a fresh explicit scope transfer.
- Public website `main` and Pages Deploy are distinct from private draft work. Writers only publish draft branches/PRs.

## Writing structure

Follow the principles of `docs/fusion-authoring-contract.md`, adapted to the **Color page** (not Fusion Node input/output):

| Reader goal | Destination |
| --- | --- |
| Understand color processing | `learn/` |
| Look up a palette/control | `reference/` |
| Reuse a grading approach | `patterns/` (when a real reusable pattern exists) |
| Finish a concrete grade | `recipes/` (when the procedure is source-verified) |
| Diagnose a symptom | `troubleshooting/` (when justified) |
| Find what to read | `index.md` (navigation only) |

Every new page must answer the reader's practical question with clear Japanese, actual use, **observed effect or source-grounded expected effect**, explicit version/source/verification state, and relevant links. No mass-generated one-line placeholders, fabricated Inspector names/defaults, copied manual passages, or nonexistent links.

## Source and validation

- Primary: [Blackmagic Design DaVinci Resolve 21.1 Reference Manual, 2026-09-08](https://www.blackmagicdesign.com/support) and [official Color product page](https://www.blackmagicdesign.com/products/davinciresolve/color).
- If the current version's controls or exact procedures cannot be confirmed, mark them *unverified / to verify* without inventing details.
- Source-grounded text is not equal to Resolve host acceptance. Keep `verification: partial` where necessary.
- Before writing, check current `main`, Color cumulative stack, current PRs, and other Color writer's target paths. One file = one active writer.
- Each bounded batch: write or repair substantive article(s), validate source claims, links/frontmatter and relevant `npm run test:content` / `npm run build` when a runtime is available; use PR CI if available. Avoid full test repetition for unchanged candidates.
- Use the current repository PR convention (stacked Draft PR, batch/fan-in, clean integration branch). Do not independently merge Writer PRs into main or force push.
- Since published site is a public surface, Integrator must verify exact candidate, CI, conflicts, release/publishing authority and the repo's latest rule before advancing main. If ambiguous, leave an audited integration PR rather than assuming publishing permission.

## Initial concrete material

- `manuals/resolve/index.md` — Resolve suite landing with a real Color link.
- `manuals/resolve/color/index.md` — Manual root and current links.
- `learn/first-grade.md` — First-grade procedure and guardrails.
- `learn/color-node-graph.md` — Color node serial order and processing responsibility.
- `reference/primaries-color-wheels.md` — Lift/Gamma/Gain/Offset.
- `reference/scopes.md` — Waveform/Parade/Vectorscope.

## Next writer subjects (choose one bounded slice at a time)

1. Separate Log Wheels and HDR Wheels; compare their tonal range models without conflating them.
2. Custom Curves and Hue-related Curves, with observed examples.
3. Qualifier, Power Window, Tracker: *selection → movement tracking → color correction*.
4. Color Management: Input / Timeline / Output, RCM vs manual CST, display vs processing transforms.
5. Gallery / Stills, grade matching and copy/paste workflows.
6. Further references, recipes, troubleshooting, own captured example images after verified scope permits.

Prioritize missing user-facing explanation over metadata expansion. Do not count a page's existence as visual/host verification. Update this list only when it materially changes; current task progress belongs in Git PR and project Notion state.
