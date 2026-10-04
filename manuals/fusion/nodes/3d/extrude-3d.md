---
title: Extrude 3D
description: Fusion ShapeをZ方向へ押し出してClassic 3D geometryへ変換し、bevelを加えられるNode。
doc_type: node
term_id: extrude-3d
term_short: Extrude 3Dは、2D ShapeをZ方向へ押し出してClassic 3D geometryへ変換するNode。
verification: partial
aliases: [Extrude 3D, Extrude3D, 3Ex]
concepts: [shape-data, classic-3d, geometry]
nodes: [Extrude 3D]
node_family: 3d
controls: [Extrusion Style, Extrusion Depth, Extrusion Subdivisions, Bevel Depth, Bevel Width, Smoothing Angle, Bevel Front, Bevel Back]
inputs: [shape, material, material]
outputs: [classic-3d]
tasks: [extrude-3d, convert-domain, shape-to-3d]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# Extrude 3D

Extrude 3Dは、2D <Term id="shape-data">Shape</Term>をZ方向へ押し出し、<Term id="classic-3d">Classic 3D geometry</Term>へ変換するNodeです。

sRectangleやsText等のflat Shapeから厚みのある3D objectを作れます。

## 入力

- **Shape Input** — 黄色。Fusion Shape Nodeのoutput。
- **Material Input** — 本体surface用の2D Imageまたは3D Material。
- **Bevel Material Input** — bevel部分へ使う別Material / Image。

## 主な設定

### Extrusion Style

Classicは一様な押し出しです。CustomではExtrusion Profile graphを使って断面形状を作ります。

### Extrusion Depth / Subdivisions

DepthでZ方向の厚みを決めます。SubdivisionsはCustom profileのsmooth部分を分割します。

### Bevel

Bevel Depth / Widthでedgeへ面取りを追加し、Smoothing Angleでedge normalのsmoothさを調整します。Front / Backは個別に有効化できます。

## 最小構成

sRectangle → Extrude 3D → Merge 3D → Renderer 3D

ここがShape domainからClassic 3D domainへの変換点です。sRenderはShapeを2D Imageへ変換するため、用途が異なります。

## Textで使う

sText → Extrude 3Dでvector textを3D geometry化できます。

Text 3Dは最初からClassic 3D textとして作るため、既存Shape chainを活かすか、直接3D textを作るかで選びます。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 88 pp.1942–1944で、Shape / Material inputs、Classic / Custom extrusion、Depth / Subdivision、bevel controlsを確認しました。

runtime REGID、全Material挙動、performanceは未確認です。
