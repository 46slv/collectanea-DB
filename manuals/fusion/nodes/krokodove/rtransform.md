---
title: rTransform
description: Regionの変形を扱い、作用領域を調整する。
doc_type: node
term_id: rtransform
term_short: Regionを変形するツール。画像や3Dモデル自体のTransformとは区別する。
verification: partial
aliases: [rTransform]
nodes: [rTransform]
node_family: krokodove
inputs: [region]
outputs: [region]
tasks: [limit-effect-region]
product_scope: fusion
suite_surfaces: [fusion]
updated: '2026-10-03'
---

# rTransform

Regionの変形を扱うツールです。変える対象は効果を制限する領域であり、効果を受けるモデルそのものとは分けます。

## 入力と出力

ManualはRegionツール群のTransformと説明しています。入力したRegionを変形して使う位置に置きますが、正式な端子名、変形の順番、座標系は記載されていません。

## 運用例

領域を作る部分と、できた領域の変形を調整する部分を分けたい場合の候補です。[rCube](./rcube)や[rSphere](./rsphere)自体にも変形の調整が記載されているため、rTransformを加える必要があるかは構成に応じて判断します。

移動・回転・拡縮の全項目が必ず存在する、ピボットを共有する、といった細部は名称だけから断定しません。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 105、p.2438。名称とRegionの変形という役割を確認しました。Inspector項目、単位、実機結果は未確認です。
