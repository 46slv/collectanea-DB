---
title: rMerge
description: Regionツールで作った領域をまとめる。
doc_type: node
term_id: rmerge
term_short: Region同士をまとめるツール。画像合成のMergeとは別に扱う。
verification: partial
aliases: [rMerge]
nodes: [rMerge]
node_family: krokodove
inputs: [region]
outputs: [region]
tasks: [limit-effect-region]
product_scope: fusion
suite_surfaces: [fusion]
updated: '2026-10-03'
---

# rMerge

Regionツールで作った領域をまとめます。ここでまとめる対象は画像の前景・背景ではなく、別のツールへ渡す作用領域です。

## 入力と出力

ManualはRegionツール群のMergeとして説明しています。領域を扱うという分類は確認できますが、入力本数、結合方式、領域が重なる場所の値の扱いは記載されていません。

## 使う場面

一つの立方体や球だけでは表せない範囲を組み立てる際の候補です。[rCube](./rcube)や[rSphere](./rsphere)との組み合わせを調べる場合も、和・差・積などの演算がどれだけ使えるかは実機で確認します。名前だけからBoolean演算の全対応を推定しません。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 105、p.2438。名称とRegionの統合という役割を確認しました。端子名、結合方式、設定値、実機結果は未確認です。
