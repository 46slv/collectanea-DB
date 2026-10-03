---
title: rSphere
description: 球状の領域を作り、Region対応ツールの作用範囲に使う。
doc_type: node
term_id: rsphere
term_short: 球状の作用領域を作る。球体のモデルを生成するツールとは区別する。
verification: partial
aliases: [rSphere]
nodes: [rSphere]
node_family: krokodove
outputs: [region]
tasks: [limit-effect-region]
product_scope: fusion
suite_surfaces: [fusion]
updated: '2026-10-03'
---

# rSphere

球状のRegionを作り、対応ツールの作用範囲として使います。画面に球体を表示することと、球状の範囲へ効果を制限することは別の役割です。

## 入力と出力

生成結果はRegionとして使います。接続先はRegion入力を持つツールです。内部のデータ型名、補助入力、対応ツールの全一覧は未確認です。

## 主な設定

Manualは境界の柔らかさ、反転、変形の調整を挙げています。球の周囲で作用の境界を調整する用途は読み取れますが、減衰の式や中心・半径の単位は示されていません。

## 運用例

3D空間のある場所を中心に、丸い範囲で効果を使いたいときの候補です。対象データの入力とは別に、rSphereを効果側のRegion入力へ渡す構成を確認します。具体的な対応ノードを指定した実機レシピは未検証です。

## 似たツールとの違い

[rCube](./rcube)は箱状、[rPlane](./rplane)は平らなカード状の範囲です。形を作った後の変形は[rTransform](./rtransform)という別項目にも分かれています。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 105、p.2438。球状領域、調整内容、Region入力への接続用途を確認しました。設定値と実機結果は未確認です。
