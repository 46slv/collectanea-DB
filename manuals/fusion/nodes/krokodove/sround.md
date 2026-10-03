---
title: sRound
description: Shapeの辺を保ちながら、角を曲線に変える。
doc_type: node
term_id: sround
term_short: 辺を保ちながらShapeの角を丸めるツール。
verification: partial
aliases: [sRound]
nodes: [sRound]
node_family: krokodove
inputs: [shape]
outputs: [shape]
tasks: [build-shape]
product_scope: fusion
suite_surfaces: [fusion]
updated: '2026-10-03'
---

# sRound

Shapeの角を曲線に変えます。Manualが示している特徴は、辺を保ちながら角を丸めることです。

## 入力と出力

角を持つShapeを対象に、丸みを加えた形を後段で使います。ここでの入出力は処理対象の分類であり、正式な端子ラベル・型は未確認です。

## 運用例

角張った図形に丸みを付けたい場合の候補です。確認素材として四角いShapeを使うと、直線の辺と丸まる角を見分けやすくなります。具体的な丸みの量や、短い辺の角が重なった場合の処理は実機で確認します。

## sSmoothとの違い

[sSmooth](./ssmooth)は線分を曲げて滑らかな辺を作り、角を保つと説明されています。sRoundは辺を保って角を曲げます。「角を変えたいのか、辺を変えたいのか」が最初の選択基準になります。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 105、p.2437。角と辺の扱いを確認しました。半径などの正式な設定名、適用限界、初期値、実機結果は未確認です。
