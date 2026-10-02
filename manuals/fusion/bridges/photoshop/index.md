---
title: Photoshopから来た人へ
description: PhotoshopのLayer・Layer Mask・Smart Object経験をResolve / Fusionの正本となる概念ページへ翻訳する入口。
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

Photoshopでは、レイヤーパネル（Layers panel）を中心に複数のLayerを並べ、順序・表示・Layer Mask・Smart Objectなどを使ってDocumentを構成します。

Fusionでは、同じ「複数素材を非破壊に組み合わせる」目的でも、画像（Image）/ マスク（Mask）/ パラメータをNodeの接続（connection）として明示するFlowが中心です。

このページはPhotoshop操作をFusionへ置き換える表ではなく、知っている考え方からFusionの正本ページへ移る地図です。

## 対応の見方（Map）

| Photoshopでの考え方 | Resolve / Fusionで読むページ |
|---|---|
| Layer / Layerの順序 | [Layer StackとFlow](./layers-vs-flow) |
| Layer Mask | [Layer MaskとFusion Mask / Alpha](./layer-mask-vs-mask-alpha) |
| Smart Object | [Smart ObjectとFusionの再利用構造](./smart-object-vs-reuse) |
| Transform | [Center / Pivot / Size / Angle](../../learn/03-space/center-pivot-size-angle) |
| Filter / 調整系の処理 | [Graphとして考える](../../learn/01-flow/graph-as-flow) |
| 非破壊編集（non-destructive editing） | [再利用の境界を選ぶ](../../patterns/reuse/choose-reuse-boundary) |

## 大事な点

PhotoshopのLayer、Layer Mask、Smart Objectは、それぞれFusion Node、Effect Mask、Group / Macroの別名ではありません。

同じ目的を持つ場面はあっても、Documentの構造・評価方法・共有の境界が異なります。

---

確認範囲（Verification scope）: Adobeの現行Layers / Layer Mask / Smart Object資料と、このリポジトリのFusion正本ページを確認しています。
