---
title: Premiere Proから来た人へ
description: Premiere ProのSequence・Nested Sequence・clip effectの知識を使って、Resolve / Fusionの役割分担を読み解くための入口。
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

Resolveでは、timeline editingはEdit、shot内部のNode-based VFX / モーショングラフィックスはFusionというsurface境界を先に意識すると読み替えやすくなります。

## 対応表

| Premiere Proで知っているもの | Resolve / Fusionで読む先 |
|---|---|
| Sequence / Timeline | [TimelineとFusion Flow](./timeline-vs-fusion-flow) |
| Nested Sequence | [Nested SequenceとResolve/Fusionの再利用境界](./nested-sequence-vs-reuse) |
| clip-level transform / effect | [どの作業Pageを使うか](../../resolve-integration/choose-working-surface) |
| Shot内部の細かな合成 | [Graphとして考える](../../learn/01-flow/graph-as-flow) |
| reusable Fusion title / effect | [Fusion assetをResolveで再利用する](../../resolve-integration/reusable-fusion-assets) |

## 注意点

PremiereのNested SequenceをFusion Group / Macroへ直接対応させません。

Nested Sequenceはtimeline上で別Sequenceを1 clipとして扱うeditorial 構造です。Fusion Group / MacroはNode Graph内部のorganization / パッケージ化です。

---

検証範囲: Adobeの現行Nested Sequence資料と、このマニュアル内のResolve / Fusion境界ページを照合しています。
