---
title: sSmooth
description: Shapeの角を保ちながら、線分を曲げて辺を滑らかにする。
doc_type: node
term_id: ssmooth
term_short: 角を保ち、Shapeの線分を曲げて滑らかにするツール。
verification: partial
aliases: [sSmooth]
nodes: [sSmooth]
node_family: krokodove
inputs: [shape]
outputs: [shape]
tasks: [build-shape]
product_scope: fusion
suite_surfaces: [fusion]
updated: '2026-10-03'
---

# sSmooth

Shapeの線分を曲げ、辺を滑らかにします。Manualでは角を保つことが明記されています。画像をぼかす処理ではありません。

## 入力と出力

輪郭を持つShapeが処理対象です。変更するのはその輪郭の線分です。端子の正式名、内部の曲線表現、点が追加・削除される条件は未確認です。

## 運用例

折れ線の印象を調整する処理を探すときの候補です。輪郭の角と、その間をつなぐ辺を分けて観察すると、どこが維持され、どこが曲がるかを確認できます。設定値を指定した検証済みレシピはまだありません。

## 似たツールとの違い

[sRound](./sround)は辺を保って角を丸めます。[sResample](./sresample)は輪郭のサンプリングを変更します。いずれも輪郭に関わりますが、同じ処理として入れ替えないでください。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 105、p.2437。線分を曲げる処理と角の保持を確認しました。アルゴリズム、全設定、初期値、実機結果は未確認です。
