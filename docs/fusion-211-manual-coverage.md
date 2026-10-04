# Fusion 21.1 Manual coverage

Updated: 2026-10-03
Scope: source-grounded node documentation; not runtime inventory certification.
Base: main aa97c2ac53cdeecab9f1d260a53b5fdc30fed4c9.

## Source identity

- User-supplied `DaVinci_Resolve_21.1_Reference_Manual.pdf`
- Cover: September 2026 / DaVinci Resolve 21.1
- 4,351 pages; 183,184,250 bytes
- SHA-256: `ccc5fadcb51c47ff0ced658fecd95f7a4f73b85ff74b08c1d98ac8b5eaa17c7e`
- Text extraction: all pages via PyMuPDF; PDF outline: 4,611 entries. Outline entries are navigation headings, not Tool counts.
- Visual review: pp.2061, 2434, 2437, 2438. The OpenPBR input-menu image is evidence, not a live Inspector capture.
- No copy of the full copyrighted manual or full extracted prose is committed.
- Supplement: Blackmagic Design, https://www.blackmagicdesign.com/media/partial/release/20260908-03 (2026-09-08), checked 2026-10-03. Used only for Connect 3D name/role and the sPrimitive Create spelling; not for Inspector details.

## Delivered page scope

27 new node pages:

- 3D Create, p.2434: Fold Create 3D; Heightfield Create 3D; Tube Create 3D.
- Image Warp, p.2437: Warped Transform.
- Shape Tools, p.2437: sExtrude; sKill; sResample; sRestyle; sRound; sSmooth; sTriangulate; sWriteOn; sZigZag.
- Shape Create, p.2437: sPrimitiveCreate; sSpiral Create; sTrace Create.
- Region, p.2438: rCube; rMerge; rModify; rNoise; rPlane; rSphere; rTransform.
- Standard Shape, pp.2733–2734: sChangeStyle.
- Material, pp.2060–2066: OpenPBR.
- Particle, p.2667: pFollow.
- Release-note-only: Connect 3D.

Existing sOffset and Mapped Duplicate 3D are rewritten, not duplicated. The sOffset URL and term_id are retained. Its unsupported introduction-version 17 statement is removed; the 21.1 manual places it in Krokodove Shape Tools. Same-name/REGID identity still needs confirmation.

Krokodove table comparison: 85 unique named rows on pp.2434–2438; all 61 prior Krokodove catalogue names are present. Of the additional 24 table names, one is the already-published sOffset and 23 receive new pages. This is a documentation diff, not proof that all 24 were introduced in 21.1. Connect 3D is outside those 85 rows.

Node-page arithmetic: prior 359 + 27 = 386. The Krokodove category guide and node index are not counted as nodes.

## Source boundaries that must remain visible

- Most Krokodove entries are one-row summaries. They do not provide full Inspector labels, defaults, ranges, terminal counts, or all valid upstream/downstream tools.
- Do not identify Select Tool shorthand or whitespace variants as REGIDs.
- sExtrude has only a connected-shape extrusion description; do not claim a verified 3D output or invent a complete graph.
- rModify has only a region-alteration description; do not invent Boolean, invert, blur, or remapping controls.
- Connect 3D / Connect3D have zero exact text matches across this supplied PDF. This is not proof of absence from runtime or from image-only content. The 2D Connect entry is distinct.
- OpenPBR text says 29 possible inputs; the menu image shows 29 names. The same page separately describes a Bumpmap connection. The runtime count and how the Bumpmap connection relates to that count are unresolved.
- Preserve the manual's OpenPBR terminology. Repeated Alpha descriptions for several controls are not silently rewritten into independently assumed shading equations.
- Proposed uses are labelled as proposals; no runtime render or GUI acceptance is claimed.

## Next documentation pass: named candidates, not confirmed new nodes

Comparing normalized level-3 headings from Chapters 88–124 to the 357-entry catalogue surfaced more candidates. Some are aliases or chapter headings. These are not an approved add-list and must be checked against live repository pages and full manual sections first.

Priority candidates with individual manual sections:

| Candidate | Manual page | Required next check |
| --- | --- | --- |
| Extrude 3D | 1942 | Distinguish from image Extrude and sExtrude |
| DomeLight | 2033 | Distinguish from USD uDomeLight |
| Shader | 2263 | Distinguish Deep Pixel shader from USD shader |
| Object Removal / Rays | 2288 / 2293 | Check implementation and edition boundary |
| Layer Muxer / Layer Regex / Layer Remover | 2440 / 2441 / 2444 | Read multilayer I/O and existing aliases |
| Relight | 2557 | Check edition and data dependencies |
| Frame Average / Keyframe Stretcher / Switch / Wireless Link | 2596 / 2597 / 2606 / 2613 | Read individual operation and controls |
| External Matte Saver | 2723 | Resolve integration boundary |
| Surface Tracker | 2830 | Read tracking requirements and edition |
| uExport / uMaterialX / uReplaceMaterial | 2900 / 2904 / 2915 | USD-specific inputs and materials |
| uSwitch / uVariant / uVisibility | 2921 / 2925 / 2927 | USD scene and selection behavior |

Do not add alias-only pages for Soft Clip vs SoftClip 3D, Texture 2D vs Texture, Primatte vs Primatte5, Z to World Pos vs ZtoWorld, or modifiers before checking identity. Do not count Common Controls, toolset headings, shortcuts, or navigation entries as Tool instances.

pFollowはChapter 114 pp.2667–2668の独立Node sectionで、pFlockとは別Nodeとして確認し、reader-first pageを追加しました。

## Runtime gate

Still required: current product/build/OS/edition; registry IDs and visible/hidden flags; native vs installed extensions; per-tool inputs/outputs; defaults/ranges; diff against published node pages. A manual match is not runtime-confirmed.

## Integration state

PR #10のreader-first方針とShape concept、sGrid / sDuplicate / sEllipse / sRenderの改稿は、統合候補 `docs/fusion-reader-first-211-integration-20261003` でこのcoverage差分と合わせています。

統合後も役割は分けます。

- この文書: 21.1資料との照合範囲、追加候補、未確認事項の台帳
- `docs/fusion-authoring-contract.md`: 読者向けNode Referenceの書き方と根拠の扱い
- Learn / Family Overview: Shapeなど複数Nodeにまたがる概念とFamilyの案内
- 各Nodeページ: Node固有の入出力、Control、最小構成、用途、確認範囲

coverageを増やすことと、既存ページを読みやすく深くすることを同じ一括生成処理には戻さない。
