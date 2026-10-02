---
title: Photoshopから来た人へ
description: PhotoshopのLayer・Layer Mask・Smart Object経験をResolve / Fusionのcanonical Conceptへ翻訳する入口。
doc_type: index
verification: partial
product_scope: resolve
familiar_apps: [photoshop]
familiar_terms: [Layer, Layer Mask, Smart Object, Smart Filter]
compare_topics: [layer-stack, masking, reuse, non-destructive-editing]
suite_surfaces: [fusion]
tasks: [translate-mental-model]
---

# Photoshopから来た人へ

Photoshopでは、Layer panelを中心に複数Layerを並べ、順序・表示・Mask・Smart Object等を使ってdocumentを構成します。

Fusionでは、同じ「複数素材を非破壊に組み合わせる」goalでも、Image / Mask / parameterをNode connectionとして明示するFlowが中心です。

このBridgeはPhotoshop操作をFusionへ置き換える表ではなく、知っているmental modelからcanonical Fusionページへ移る地図です。

## Map

| Photoshop starting point | Resolve / Fusionへ進む |
|---|---|
| Layers / layer order | [Layer StackとFlow](./layers-vs-flow) |
| Layer Mask | [Layer MaskとFusion Mask / Alpha](./layer-mask-vs-mask-alpha) |
| Smart Object | [Smart ObjectとFusionの再利用構造](./smart-object-vs-reuse) |
| Transform | [Center / Pivot / Size / Angle](../../learn/03-space/center-pivot-size-angle) |
| Filters / Adjustment-like intent | [Graphとして考える](../../learn/01-flow/graph-as-flow) |
| non-destructive workflow | [再利用の境界を選ぶ](../../patterns/reuse/choose-reuse-boundary) |

## Important

PhotoshopのLayer、Layer Mask、Smart Objectは、それぞれFusion Node、Effect Mask、Group / Macroの別名ではありません。

同じgoalを持つ場面はあっても、document model・evaluation・sharing boundaryが異なります。

---

Verification scope: Adobe current Layers / Layer Mask / Smart Object documentation and the canonical Fusion content in this repository.
