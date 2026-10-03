---
title: sEllipse
description: 円・楕円のShapeを生成し、塗り・輪郭・大きさ・位置・開き方を調整するShape Generator。
doc_type: node
term_id: s-ellipse
verification: partial
aliases: [sEllipse, Shape Ellipse]
concepts: [shape-data, vector-shape, rasterization]
nodes: [sEllipse]
node_family: shapes
outputs: [shape]
controls: [Solid, Border Width, Cap Style, Position, Length, X Offset, Y Offset, Width, Height, Angle, Color, Allow Combining]
tasks: [shape, ellipse, procedural-graphics]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-03"
---

# sEllipse

sEllipseは、円や楕円の<Term id="shape-data">Shape</Term>を作るGeneratorです。塗りつぶした円だけでなく、輪郭だけの楕円や、途中に切れ目を持つ円弧状のShapeも作れます。

## 役割

Shape系処理の元になる円・楕円を生成します。入力画像を加工するNodeではなく、自分でShapeを作るNodeです。

## 入力

外部入力はありません。

## 出力

円・楕円のShapeを出力します。通常は別のShape系Nodeへつなぐか、`sRender` で2D Imageへ変換します。

```text
sEllipse → sGrid / sDuplicate / sTransform → sRender
```

## 主な設定項目

### Solid / Border Width

Solidを有効にすると、Styleで指定した色で内部を塗ります。無効にすると中心は透明になり、Border Widthで輪郭の太さを調整します。

### Cap Style

Solidが無効なとき、輪郭の端をFlat、Rounded、Squaredの形にできます。輪郭が閉じている状態では端が見えないため、Lengthを1.0未満にしたときに違いを確認しやすくなります。

### Position / Length

Solidが無効なときに表示されます。Length 1.0は閉じた輪郭で、1.0未満にすると輪郭に開きができます。Lengthをアニメーションすると、円が描かれていくような表現を作れます。

Positionは、その開きの開始位置を動かします。

### X / Y Offset

Shapeの位置を動かします。座標はフレーム幅を基準にした正規化座標で、X Offset 0.5は中心をフレーム右端へ移す例としてManualに記載されています。

### Width / Height / Angle

WidthとHeightで楕円の横幅・縦幅を決めます。同じ値なら真円になります。AngleはShapeを回転します。

### Style / Color / Allow Combining

Styleタブで色とAlphaを指定します。Allow Combiningは、Shapeを複製して重ねたときにAlphaを維持するか、重なり部分で値を加算させるかに関わります。

## 主な用途

- 円・楕円のモーショングラフィックス素材を作る。
- 輪郭だけの円を作る。
- Lengthを使って円が描かれるアニメーションを作る。
- sGridやsDuplicateへ渡す元Shapeを作る。

## 最小構成

```text
sEllipse → sRender → Merge
```

Shapeのままでは通常の2D合成へ渡せないため、画像として使う地点でsRenderを挟みます。

## 似たNode・関連Node

- Ellipse Mask — Effect Maskとして処理範囲を作る。Shapeとはデータ領域が異なる
- [sGrid](./sgrid) — ShapeをX・Y方向へ並べる
- [sDuplicate](./sduplicate) — Shapeをコピーしながら変化を積み重ねる
- [sRender](./s-render) — Shapeを2D Imageへ変換する

## 関連する考え方

- [シェイプ（Shape）](../../learn/02-data/shape)
- [正規化座標（Normalized Coordinates）](../../learn/03-space/normalized-coordinates)

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 117、pp.2738–2741で、外部入力なし、基本Graph、Solid、Border Width、Cap Style、Position、Length、X/Y Offset、Width/Height、Angle、Style、Color、Allow Combiningを確認しました。

内部REGID、Edition差、実機での描画結果は未確認のため `verification: partial` を維持します。
