---
title: rCube
description: 立方体の領域を作り、Region入力を持つツールの作用範囲に使う。
doc_type: node
term_id: rcube
term_short: 立方体の作用領域を作る。形状を描画するCube 3Dとは役割が異なる。
verification: partial
aliases: [rCube]
nodes: [rCube]
node_family: krokodove
outputs: [region]
tasks: [limit-effect-region]
product_scope: fusion
suite_surfaces: [fusion]
updated: '2026-10-03'
---

# rCube

立方体の領域を作り、別のツールに「どの範囲へ作用させるか」を渡します。立方体のモデルを映像に置くためのツールと、作用範囲を指定するツールを分けて考えます。

## 入力と出力

生成するのはRegionです。接続先は、Region入力を持つ対応ツールです。画像入力や通常の3Dシーン入力へ同じようにつなぐものではありません。内部型名、対応ツールの全一覧、補助入力は未確認です。

## 主な設定

Manualには境界の柔らかさ、反転、変形の調整があると記載されています。具体的なInspectorラベルや値の範囲は示されていません。

## 運用例

3D空間の箱状の範囲だけで効果を使いたい場合の候補です。構成を考えるときは、対象データを効果ノードへ渡す経路と、rCubeをそのノードのRegion入力へ渡す経路を分けます。これは役割を示す構成案で、対応ツール名を確定した実機レシピではありません。

## 似たツールとの違い

[rSphere](./rsphere)は球状、[rPlane](./rplane)は平らなカード状の領域です。複数領域の統合には[rMerge](./rmerge)という別ツールがあります。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 105、p.2438。領域の形、調整内容、Region入力への接続用途を確認しました。設定値・実機結果・Edition差は未確認です。
