---
title: rPlane
description: 平らなカード状の領域を作り、Region対応ツールの作用範囲に使う。
doc_type: node
term_id: rplane
term_short: 平らなカード状の作用領域を作るRegionツール。
verification: partial
aliases: [rPlane]
nodes: [rPlane]
node_family: krokodove
outputs: [region]
tasks: [limit-effect-region]
product_scope: fusion
suite_surfaces: [fusion]
updated: '2026-10-03'
---

# rPlane

平らなカード状のRegionを作ります。平面モデルを描画するためではなく、Region入力を持つ対応ツールへ範囲を渡すために使います。

## 入力と出力

生成結果の役割はRegionです。Manualではflat card regionと説明されています。厚さがゼロか、無限平面か、片側だけへ作用するかなど、範囲の厳密な定義はこの記述からは分かりません。

## 主な設定と用途

境界の柔らかさ、反転、変形の調整が記載されています。平らな範囲を使って効果を制限したい場合の候補ですが、向きと作用範囲を実機で確認してから使います。

## 似たツールとの違い

[rCube](./rcube)は立方体、[rSphere](./rsphere)は球状の領域です。rPlaneに板の材質を接続してレンダリングする、といった使い方は確認していません。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 105、p.2438。領域の分類、調整内容、Region入力への接続用途を確認しました。正式な端子、数値範囲、実機結果は未確認です。
