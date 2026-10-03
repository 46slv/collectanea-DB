---
title: sZigZag
description: Shapeの各線分を波形へ変え、輪郭にギザギザを加える。
doc_type: node
term_id: szigzag
term_short: 入力Shapeの線分を波形にして輪郭をギザギザにするツール。
verification: partial
aliases: [sZigZag]
nodes: [sZigZag]
node_family: krokodove
inputs: [shape]
outputs: [shape]
tasks: [build-shape]
product_scope: fusion
suite_surfaces: [fusion]
updated: '2026-10-03'
---

# sZigZag

入力Shapeを構成する各線分を波形へ変え、輪郭にギザギザを加えます。図形を複製して並べる処理ではなく、元の輪郭自体を変える処理です。

## 入力と出力

処理対象は上流のShapeの各線分です。通常の画像にノイズを加えるフィルターとは区別します。具体的な端子名と内部型は実機未確認です。

## 運用例

整った輪郭を、波打つ境界やギザギザの縁へ変えたい場合の候補です。まず単純な直線や図形の輪郭で試すと、元の線分ごとに変化することを観察しやすくなります。

振幅・周期・波の種類に相当する設定がどの名前で存在するかは、Manualにはありません。特定の波形を選べると断定しないでください。

## 似たツールとの違い

[sSmooth](./ssmooth)は線分を曲げて滑らかな辺を作ります。sZigZagは各線分を波形へ変える役割として説明されています。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 105、p.2437。線分ごとの波形化と輪郭の変化を確認しました。設定名、値、実機結果は未確認です。
