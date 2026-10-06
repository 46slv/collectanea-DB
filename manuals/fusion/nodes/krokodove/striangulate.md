---
title: sTriangulate
description: Shapeへ交差する線を描き、三角形に分かれた表現を作る。
doc_type: node
term_id: striangulate
term_short: Shapeを交差する線で三角形に分けるツール。
verification: partial
aliases: [sTriangulate]
nodes: [sTriangulate]
node_family: krokodove
inputs: [shape]
outputs: [shape]
tasks: [build-shape]
product_scope: fusion
suite_surfaces: [fusion]
updated: '2026-10-03'
---

# sTriangulate

Shape上に交差する線を描き、三角形に分かれた表現を作ります。「三角形に分ける」は、ここでは入力した図形を複数の三角形として区切ることです。

## 入力と出力

対象はShapeです。ManualはShape Toolsの項目で線を描いて三角形へ分けると説明しています。3Dポリゴンの三角化や、外部へ書き出せるメッシュの生成を説明した項目ではありません。

## 使う場面

図形の中に三角形の線構造を作りたい場合の候補です。どの位置が接続されるか、塗りがどう扱われるかは、単純な図形を使って確認します。分割アルゴリズムや、三角形を個別に操作できるかは未確認です。

## 似たツールとの違い

[sZigZag](./szigzag)は輪郭の各線分を波形へ変えます。sTriangulateで確認した役割は、図形を三角形に分ける線の生成です。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 105、p.2437。名称と三角形に分ける役割を確認しました。正式な端子、全設定、分割方法、実機結果は未確認です。
