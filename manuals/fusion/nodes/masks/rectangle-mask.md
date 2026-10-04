---
title: Rectangle Mask
description: Width・Height・Corner Radius・Angleで四角形から角丸矩形まで作り、Effect範囲やgraphic shapeへ使うPrimitive Mask。
doc_type: node
term_id: rectangle-mask
verification: partial
aliases: [Rectangle Mask, Rec]
concepts: [mask-data]
nodes: [Rectangle Mask]
node_family: masks
controls: [Level, Filter, Soft Edge, Border Width, Paint Mode, Invert, Solid, Center, Width, Height, Corner Radius, Angle]
inputs: [mask]
outputs: [mask]
tasks: [create-mask, rectangle, rounded-rectangle]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# Rectangle Mask

Rectangle Maskは、四角形の<Term id="mask">Mask</Term>を作るPrimitive Maskです。

Width / HeightだけでなくCorner RadiusとAngleを持つため、角丸panel、window、UI card、画面領域の限定にも使えます。

## 入力 / 出力

任意Effect Mask inputへ別Maskを接続し、Paint Modeで組み合わせられます。出力はsingle-channel Maskです。

## Geometry

### Center

Maskの中心位置です。

### Width / Height

横幅と縦幅を個別に調整します。Viewer edgeをdragしても変更できます。

### Corner Radius

cornerの丸みです。

Manualでは0.0がsharp corner、1.0が最大roundingとして記載されています。

### Angle

rectangle全体を回転します。

## Edge / fill

### Soft Edge

edgeをfeatherします。

### Border Width

edgeの厚みを変えます。

### Solid

有効なら内部をfill、無効ならBorder Widthに従うoutline Maskになります。

## Level / Invert

LevelはMask値全体を弱めます。

InvertはMask全体のwhite / blackを反転します。

## 最小構成

```text
Rectangle Mask → Background / Blur / Merge Effect Mask
```

Backgroundへ接続するとsolid rectangle graphicを作る基本構成になります。

## Ellipseとの違い

Rectangleはstraight edgeとCorner Radius、Ellipseは円 / 楕円を直接扱います。

角丸rectをEllipseと複数Maskで組むより、RectangleのCorner Radiusを使う方が構造を読みやすくできます。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 108 pp.2490–2493で、Effect Mask、Level、Filter、Soft Edge、Border、Paint Mode、Invert、Solid、Center、Width / Height、Corner Radius、Angleを確認しました。
