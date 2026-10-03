---
title: sChangeStyle
description: 上流で組み合わせたShapeの色と透明度の扱いを、一つの場所で上書きする。
doc_type: node
term_id: schangestyle
term_short: ShapeのColorとAllow Combiningを上書きし、色と重なり時のAlphaの扱いを統一する。
verification: partial
aliases: [sChangeStyle, sCS]
concepts: [shape-data]
nodes: [sChangeStyle]
node_family: shapes
inputs: [shape]
outputs: [shape]
controls: [Color, Allow Combining]
tasks: [build-shape, style-shape]
product_scope: fusion
suite_surfaces: [fusion]
updated: '2026-10-03'
---

# sChangeStyle

上流のShapeで決めた色と`Allow Combining`を上書きします。図形を作るノードごとに色を直さず、組み合わせたShapeの見た目を後段でまとめて指定するためのノードです。

## 入力

Shapeを受け取る入力が一つあります。色を変えたいShapeの出力を接続します。画像用のColor Correctorとは入力するデータが異なります。

## 出力

スタイルを変更したShapeを、別のShapeノードまたは[sRender](./s-render)へ渡します。sRenderで画像へ変換するまでは、Shapeの処理として組みます。

## 主な設定

### Color

色とAlphaを指定します。色見本、スポイト、RGBAのスライダーや数値入力を使います。上流で作ったShapeの見た目をこのノード側で上書きします。

### Allow Combining

同じShapeやその複製が重なる場所で、Alphaを維持するかどうかに関わります。Manualの例ではAlphaが0.5の長方形を複製して重ねたとき、有効なら0.5を保ち、無効なら重なった部分でAlphaが重なり合います。

この設定は、単にノード全体を有効・無効にするスイッチではありません。半透明の図形を複製する際の見え方を調べる項目です。

## 最小構成

```text
sEllipse → sChangeStyle → sRender
```

これはManual p.2734に示された構成です。sChangeStyleの色を変え、sRenderの結果を見ます。本リポジトリでの実機追試は未実施です。

## 運用例

複数の図形の色を揃えたい場合は、Shapeを組み合わせた後段へ置く構成が考えられます。半透明の反復模様で重なり部分だけ濃くなる場合は、Allow Combiningの有効・無効で結果を比較します。

## 似たノードとの違い

Krokodoveの[sRestyle](../krokodove/srestyle)もShapeの見た目を扱いますが、別のノードです。こちらのページは標準sChangeStyleに対して、Manualに明記されたColorとAllow Combiningを説明しています。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 117、pp.2733–2734。入力数、接続例、設定の役割を本文で確認しました。`sCS`は資料上の略号であり、内部REGIDの保証ではありません。初出バージョンと実機結果は未確認です。
