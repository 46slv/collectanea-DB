# Fusion 21.1 Manual coverage

Updated: 2026-10-05
Scope: source-grounded node documentation; not runtime inventory certification.

## Source identity

- User-supplied `DaVinci_Resolve_21.1_Reference_Manual.pdf`
- Cover: September 2026 / DaVinci Resolve 21.1
- 4,351 pages
- Supplement: Blackmagic Design 21.1 release material was used where the supplied PDF had no exact text match, notably Connect 3D.
- Full copyrighted manual text / image dump is not committed. Documentation is paraphrased and scoped to the claim it supports.

## Current documentation candidate

The reader-first completion candidate contains **420 node / related-element pages**.

This is a documentation inventory, not a claim that Resolve 21.1 exposes exactly 420 Add Tool entries. The corpus includes Modifier and Paint internal elements, MediaIn / MediaOut, Krokodove, USD, Deep and other related records.

The current candidate separates three states:

1. **Manual-grounded detailed page** — 21.1 Manual provides individual sections, inputs, controls or workflow detail.
2. **Source-limited reader-first page** — official material confirms the role / domain but does not support invented Inspector details.
3. **Runtime verification pending** — REGID, visible/hidden state, exact ports, defaults/ranges, Edition and host behavior need current Resolve/Fusion runtime evidence.

## 21.1 additions and candidate reconciliation

The original 21.0.4-based corpus was expanded as individual 21.1 Manual sections were confirmed.

### Krokodove / 21.1 material

Chapter 105 pp.2434–2438 contains 85 unique Krokodove named rows. The category includes Image, Shape, 3D and Region tools; those domains are not collapsed into one generic type.

The first pass added or rewrote items such as:

- Fold Create 3D / Heightfield Create 3D / Tube Create 3D
- Warped Transform
- sExtrude / sKill / sResample / sRestyle / sRound / sSmooth / sTriangulate / sWriteOn / sZigZag
- sPrimitive Create / sSpiral Create / sTrace Create
- rCube / rMerge / rModify / rNoise / rPlane / rSphere / rTransform
- sChangeStyle
- OpenPBR
- Connect 3D from release material

Most Krokodove entries are short Manual summaries. Their pages therefore preserve explicit source limits instead of inventing ports, defaults or controls.

### Candidates resolved by individual Manual sections

The following items were initially held as candidates and were later confirmed as independent sections / documented tools, then added or deepened:

- Extrude 3D
- DomeLight
- Shader (Deep Pixel)
- Object Removal
- Rays
- Layer Muxer / Layer Regex / Layer Remover
- Relight
- Frame Average / Keyframe Stretcher / Switch / Wireless Link
- pFollow
- External Matte Saver
- Surface Tracker
- uExport / uMaterialX / uReplaceMaterial
- uSwitch / uVariant / uVisibility
- ACES Transform
- Chromatic Adaptation
- Color Space Transform
- Gamut Limiter
- Gamut Mapping
- Chromatic Aberration Removal
- OCIO Display

The exact current page count should be taken from the built catalog / repository tree rather than reconstructed from one historical delta, because several source-grounded passes were integrated after the original 359-page baseline.

## Major Manual-grounded family passes

- Chapter 92 / 99 — Blur and Filter
- Chapter 93 — Color
- Chapter 94 — Composite
- Chapter 95 — Deep Image
- Chapter 96 — Deep Pixel / auxiliary channels
- Chapter 103 — Generators
- Chapter 105 — Krokodove
- Chapter 108 — Masks
- Chapter 114 — Particles
- Chapter 119 / 120 — Tracking / Planar Transform / Transform
- Chapter 121 — USD
- Chapter 88–90 — Classic 3D / Materials / Lights

Representative pages with richer Manual evidence include exact input roles, major Inspector controls and basic graph examples. Pages whose Manual evidence is limited remain `verification: partial` / source-limited.

## Source boundaries that must remain visible

- A Manual page heading or row confirms documentation identity; it does not prove the current runtime REGID or Effects Library visibility.
- Select Tool shorthand, whitespace variants and UI abbreviations are not automatically REGIDs.
- Krokodove one-row summaries do not justify invented Inspector controls.
- Deep Image and Deep Pixel are distinct: Chapter 95 uses true multi-sample Deep data; Chapter 96 uses auxiliary-channel 2D Image post-processing.
- Classic 3D and USD are distinct scene domains.
- Shape and 2D Image are distinct until sRender.
- Particle set remains a separate data domain until pRender.
- OpenPBR Manual evidence is preserved as written; repeated labels are not silently converted into assumed shading equations.
- Proposed operational examples are labeled as configuration proposals rather than runtime-tested facts.

## Reader-first text completion gate

A repository-wide migration was run against the final candidate on 2026-10-05.

Result:

- node / related-element pages scanned: **420**
- old generated-template pages transformed: **196**
- remaining legacy-template pages: **0**
- exact repeated `description → 主な用途` pattern: **0**
- missing family indexes: **0**
- duplicate Krokodove/non-Krokodove term-id collision repaired without changing the non-Krokodove canonical term
- catalog regressions: PASS
- production Docusaurus build: PASS

The migration intentionally does **not** fabricate missing 21.1 Inspector data. Source-limited pages now tell the reader what the item is for, which domain it accepts/returns, how to choose it, a minimal connection shape and what remains unverified.

## Runtime gate

Still separate from documentation text completion:

- product / build / OS / Edition
- registry IDs and visible / hidden flags
- native vs installed extensions
- per-tool exact inputs / outputs
- defaults / ranges
- current host behavior
- image / render acceptance
- diff against published node pages

A Manual match is not runtime certification.

## Image pass

Images are a later evidence / usability layer:

1. Node tile / ports
2. minimal graph
3. major Inspector section
4. result / Before-After

Use self-produced current-runtime captures rather than copying the Manual. Empty placeholders are not added in bulk.

## Owners

- reader-facing policy: `docs/fusion-authoring-contract.md`
- current corpus entry: `manuals/fusion/nodes/index.md`
- text-pass roadmap / history: `docs/fusion-node-reference-roadmap.md`
- primary source: DaVinci Resolve 21.1 Reference Manual, September 2026
- runtime facts: current Resolve / Fusion host
