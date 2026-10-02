---
title: Premiere Proから来た人へ
description: Premiere ProのSequence・Nested Sequence・clip effect経験をResolve / Fusionのsurface境界へ翻訳する入口。
doc_type: index
verification: partial
product_scope: resolve
familiar_apps: [premiere-pro]
familiar_terms: [Sequence, Nested Sequence, Clip, Timeline, Effect]
compare_topics: [timeline, nesting, clip-effects, vfx-boundary]
suite_surfaces: [edit, fusion]
tasks: [translate-mental-model, choose-surface]
---

# Premiere Proから来た人へ

Premiere Proでは、Sequence / Timeline上のclip構成を中心に編集し、Nested Sequenceで複数trackの構造を1 clipとして扱えます。

Resolveでは、timeline editingはEdit、shot内部のNode-based VFX / motion graphicsはFusionというsurface境界を先に意識すると読み替えやすくなります。

## Map

| Premiere starting point | Resolve / Fusionへ進む |
|---|---|
| Sequence / Timeline | [TimelineとFusion Flow](./timeline-vs-fusion-flow) |
| Nested Sequence | [Nested SequenceとResolve/Fusionの再利用境界](./nested-sequence-vs-reuse) |
| clip-level transform / effect | [どのworking surfaceを使うか](../../resolve-integration/choose-working-surface) |
| detailed compositing | [Graphとして考える](../../learn/01-flow/graph-as-flow) |
| reusable Fusion title / effect | [Fusion assetをResolveで再利用する](../../resolve-integration/reusable-fusion-assets) |

## Important

PremiereのNested SequenceをFusion Group / Macroへ直接対応させません。

Nested Sequenceはtimeline上で別Sequenceを1 clipとして扱うeditorial structureです。Fusion Group / MacroはNode Graph内部のorganization / packagingです。

---

Verification scope: Adobe current nested-sequence documentation and canonical Resolve/Fusion boundary pages.
