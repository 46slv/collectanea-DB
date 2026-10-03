---
title: sKill
description: 指定した条件に該当するShapeの線分を取り除く。
doc_type: node
term_id: skill
term_short: 条件に一致したShapeの線分を取り除くツール。
verification: partial
aliases: [sKill]
nodes: [sKill]
node_family: krokodove
inputs: [shape]
outputs: [shape]
tasks: [build-shape]
product_scope: fusion
suite_surfaces: [fusion]
updated: '2026-10-03'
---

# sKill

Shapeを構成する線分のうち、設定した条件に当てはまるものを取り除きます。輪郭全体を移動する処理ではなく、輪郭の一部を除く処理です。

## 入力と出力

処理対象はShapeの線分です。ManualではShape Toolsに分類され、条件に合った線分を取り除くと説明されています。正式な端子名と内部型は実機未確認です。

## 使う場面

輪郭を部分的に欠かせる表現を調べるときの候補です。ただし、長さ・方向・位置・番号などのどの条件を使えるかは、Manualのこの行だけでは分かりません。任意の条件を選択できるツールとしては説明しません。

## 似たツールとの違い

[sWriteOn](./swriteon)は輪郭を描いて見せたり隠したりする役割です。sKillは条件に該当する線分の除去として説明されており、同じ結果やアニメーション方法になるとは限りません。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 105、p.2437。処理対象と除去という役割を確認しました。条件の選択肢、評価順、元のShapeを保持する方法、実機結果は未確認です。
