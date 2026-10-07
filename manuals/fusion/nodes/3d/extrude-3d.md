---
title: Extrude 3D
description: Fusion ShapeをZ方向へextrudeし、Depth・Subdivision・Bevel・Custom profileでClassic 3D geometryへ変換するNode。
doc_type: node
term_id: extrude-3d
term_short: Extrude 3Dは、2D Shapeを奥行きとbevelを持つClassic 3D geometryへ変換するNode。
verification: partial
aliases: [Extrude 3D, Extrude3D, 3Ex]
concepts: [shape-data, classic-3d, geometry]
nodes: [Extrude 3D]
node_family: 3d
controls: [Extrusion Style, Extrusion Depth, Extrusion Subdivisions, Bevel Depth, Bevel Width, Smoothing Angle, Bevel Front, Bevel Back, Extrusion Profile]
inputs: [shape, material, material]
outputs: [classic-3d]
tasks: [extrude-shape, build-3d-scene, bevel]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# Extrude 3D

Extrude 3Dは、Fusionの<Term id="shape-data">Shape</Term>をZ方向へ押し出し、<Term id="classic-3d">Classic 3D geometry</Term>へ変換するNodeです。

sRectangleやsText等のflat Shapeへ厚みとbevelを付け、3D objectとしてMerge 3Dへ渡せます。

## 入力

### Shape Input

黄色のShape inputです。extrudeしたいShapeを接続します。

### Material Input

front / side等へ使うMaterial inputです。2D Imageまたは3D Materialを接続できます。

### Bevel Material Input

bevel部分へ別Materialを使う場合のinputです。

## Extrusion Style

### Classic

一定の厚みで標準的にextrudeします。

### Custom

Extrusion Profile splineを使って断面shapeを変えられます。

frame状、段差、knurled edge等、uniform extrusion以上のprofileを作る場合に使います。

## Extrusion Depth

Z方向の厚みです。

## Extrusion Subdivisions

Custom profile等でsmoothな変化を表現するためのsubdivision数です。

## Bevel

Bevel Depth / Widthでedgeへ面取りを加えます。

Front / Backを別々に有効化でき、Smoothing Angleでbevel edgeのnormal smoothingを調整します。

## 最小構成

```text
sRectangle → Extrude 3D → Merge 3D → Renderer 3D
```

ShapeをsRenderでImageにしてから3Dへ持ち込む必要はありません。Extrude 3DはShape domainからClassic 3Dへ直接変換します。

## sExtrudeとの違い

KrokodoveのsExtrudeはShape tool familyの別Nodeです。

Extrude 3DはChapter 88のClassic 3D Nodeで、Shape inputからClassic 3D geometryを生成します。名前が似てもdata domainを分けて扱います。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 88 pp.1942–1944で、Shape / Material inputs、Classic / Custom extrusion、Depth、Subdivision、Bevel controlsを確認しました。

runtime REGIDと実機mesh topologyは未確認です。
