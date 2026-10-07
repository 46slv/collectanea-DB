---
title: "sMerge"
description: "Shape streamを統合。"
doc_type: node
term_id: "smerge"
term_short: "sMergeは、Shape streamを統合。"
verification: partial
aliases: ["sMerge"]
concepts: ["shape-data"]
nodes: ["sMerge"]
node_family: "shapes"
inputs: ["shape"]
outputs: ["shape"]
tasks: ["build-shape"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-03"
---
# sMerge

sMergeは、複数の<Term id="shape-data">Shape</Term>を1つのShape treeへまとめるNodeです。

2D Mergeのようにpixelを合成するのではなく、まだvector-likeなShape dataのまま複数shapeを束ねます。

## 入力

接続するたびに新しいShape inputが自動追加され、input数に固定上限はありません。

    sRectangle ─┐
    sEllipse ───┼─ sMerge → sRender
    sText ──────┘

最初のinputが一番下、後から接続したinputほど上のlayerとして扱われます。

## Override Axis

sMerge固有ControlはOverride Axisです。

compound shapeへ共通axisを使いたい場合に、個別shapeのaxisをoverrideします。

## 出力

複数shapeを含む1つのShape dataを出力します。sBoolean、sTransform、sDuplicate等へ続けるか、sRenderで2D Imageへ変換します。

## sBooleanとの違い

- **sMerge** — shapeをlayerとしてまとめる。個別geometryは保持
- **sBoolean** — overlapをIntersection / Union / Subtract / Xorで計算

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 117 p.2746で、dynamic inputs、layer order、Override Axisを確認しました。
