---
title: sWriteOn
description: Shapeの輪郭を描いて現したり、隠したりする。
doc_type: node
term_id: swriteon
term_short: Shapeの輪郭線を現す・隠すためのツール。
verification: partial
aliases: [sWriteOn, sWrite On]
nodes: [sWriteOn]
node_family: krokodove
inputs: [shape]
outputs: [shape]
tasks: [build-shape, animate-shape]
product_scope: fusion
suite_surfaces: [fusion]
updated: '2026-10-03'
---

# sWriteOn

Shapeの輪郭を描いて現したり、隠したりします。完成した輪郭を常に全部見せる代わりに、線が描かれる表現を作るためのツールです。

## 入力と出力

対象はShapeの輪郭です。Manualは輪郭を現す・隠す役割を説明していますが、始点・終点・進行方向などの正式な設定名や、塗りへの作用は示していません。

Shapeから通常の画像へ移る境界は[sRender](../shapes/s-render)のページを参照してください。

## 運用例

図形の輪郭が描かれてから全体が見える演出の候補です。まず輪郭線が明確なShapeを使い、表示範囲を変えたときの見え方を確認します。アニメーション可能なコントロール名と値の範囲は実機確認が必要です。

## 似たツールとの違い

Krokodoveの[Write](./write)は文字用Modifierです。[sKill](./skill)は条件に該当する線分を取り除きます。sWriteOnの対象はShapeの輪郭であり、文字列をタイプする処理とは分けます。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 105、pp.2437–2438。役割とText ModifierのWriteとの区別を確認しました。全端子、全設定、実機結果は未確認です。
