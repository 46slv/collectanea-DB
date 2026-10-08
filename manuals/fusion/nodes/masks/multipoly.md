---
title: MultiPoly
description: 複数のPolygon / B-Spline Maskを1 Nodeのlayer listで作成・並べ替え・animationし、複雑なrotoをまとめて管理するNode。
doc_type: node
term_id: multipoly
verification: partial
aliases: [MultiPoly, MPly]
concepts: [mask-data, spline, roto]
nodes: [MultiPoly]
node_family: masks
outputs: [mask]
tasks: [create-mask, roto, manage-masks]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# MultiPoly

MultiPolyは、複数のPolygon / B-Spline shapeを**1つのNode内のlist**で管理する<Term id="mask">Mask</Term> Nodeです。

人物の腕・胴体・顔など、複数shapeを別々にrotoしつつ1つのmatteとして扱いたい場合に向きます。

## 出力

複数shapeをまとめたsingle-channel Maskを出力します。

複数のPolygon NodeをFlow上へ大量に並べる代わりに、shape管理をInspectorのList viewへ集約できます。

## Shapeを追加する

InspectorのPolygonまたはB-Spline buttonから新しいMask shapeを追加します。

Viewer toolbarからpointを追加し、最初のpointを再度clickするとshapeを閉じます。

## List view

各shapeを1行として管理します。

- select
- rename
- reorder
- visibility確認
- 個別parameter編集

複雑なrotoで「どのshapeを今編集しているか」をNode単位ではなくlist内で管理できます。

## Animation

shape animationを有効にすると、frameごとのshape変化をkeyframe化できます。

選択中shapeだけを編集するため、複数部位のroto animationを1 Node内にまとめられます。

## 右click操作

21.1 Manualでは次を確認できます。

- Duplicate — shapeを複製
- Split here — 選択shape以下を新しいMultiPolyへ分離
- Rename
- Reset to default
- Delete

Split hereは、1 Nodeが複雑になりすぎたときにGraphを分割する出口になります。

## Polygonを複数Nodeで組む場合との違い

- **MultiPoly** — shape数が多いrotoをListで集中管理
- **複数Polygon Mask** — Flow上でshape同士のPaint Mode関係を明示しやすい

小さいmatteなら複数Polygon、shape数が多く管理性が重要ならMultiPolyが候補です。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 108 pp.2478–2479で、multiple mask list、Polygon / B-Spline作成、rename / reorder、animation、Duplicate / Split / Reset / Deleteを確認しました。
