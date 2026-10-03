---
title: Tube Create 3D
description: 指定した経路に沿って管状の3D形状を作り、断面を多角形や星形にできる。
doc_type: node
term_id: tube-create-3d
term_short: 経路に沿う管状の3D形状を作る。断面にPolygonまたはStarを使える。
verification: partial
aliases: [Tube Create 3D, TubeCreate3D]
nodes: [Tube Create 3D]
node_family: krokodove
outputs: [classic-3d]
tasks: [motion-graphics]
product_scope: fusion
suite_surfaces: [fusion]
updated: '2026-10-03'
---

# Tube Create 3D

指定した経路に沿って、管のような3D形状を作ります。経路が管の進む方向を決め、断面の形が管の見た目を決めます。

## 入力と出力

必要な形状情報は経路です。Manualは「指定した経路に沿う」と説明していますが、その経路を外部ノードから渡すのか、Inspector内で定義するのかまでは示していません。したがって、sPolygonや3Dカーブを直接つなげるといった配線は未確認です。

生成結果は管状の3D形状です。2Dの線をそのまま返すツールとしては扱いません。

## 主な設定

断面の選択肢として`Polygon`と`Star`が記載されています。多角形の断面と星形の断面では、同じ経路でも管の表面形状が変わります。辺数・半径・分割数などの正式な設定名や範囲は未確認です。

## 運用例

曲がったパイプや、経路に沿って続く立体的な装飾を作りたい場合の候補です。まず経路を固定したまま断面だけを切り替え、経路と断面が別の役割を持つことを確認する方法が考えられます。

## 似たツールとの違い

[Connect 3D](./connect-3d)の公式発表で確認できる役割は頂点間の接続です。Tube Create 3Dは経路に沿う管の生成であり、両者の経路データを直接受け渡せるとは確認していません。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 105、p.2434。名称、管状形状、経路、断面の選択肢を確認しました。内部ID、経路の入力方法、端子、実機結果は未確認です。
