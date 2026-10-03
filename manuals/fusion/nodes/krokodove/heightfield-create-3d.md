---
title: Heightfield Create 3D
description: 画像の明るさを使って平面に高低差を付け、起伏や棒状の立体表現を作る。
doc_type: node
term_id: heightfield-create-3d
term_short: 画像の輝度を平面の奥行き変形に使う3D生成ツール。
verification: partial
aliases: [Heightfield Create 3D, HeightfieldCreate3D]
nodes: [Heightfield Create 3D]
node_family: krokodove
inputs: [image]
outputs: [classic-3d]
tasks: [motion-graphics]
product_scope: fusion
suite_surfaces: [fusion]
updated: '2026-10-03'
---

# Heightfield Create 3D

画像の明るさを参照し、平面に奥行き方向の起伏を付けるツールです。画像を表面に貼るだけでなく、その画像を面の変形に使います。Manualでは四角い区画や棒状の形へ変形を整える用途も説明されています。

## 入力と出力

変形の基準にする画像マップを使い、奥行きが変わった3D平面を作ります。参照する量は画像の輝度です。正式な画像入力名、追加の材質入力、出力の内部型は、この短い説明からは確定できません。

## 運用例

明暗のある画像から、区画ごとに高さが異なるパネルを作る場合の候補です。動作を調べるなら、まず単純な明暗の画像を用意し、平面を斜めから見ます。表面の色だけでなく、面の奥行きが変わることを観察します。

この例は用途から組み立てた確認案です。明るい側がどちら向きへ動くか、変形量の単位、必要な分割数は実機で確認してください。本文にない初期値を前提にしたレシピにはしていません。

## 似たツールとの違い

[Fold Create 3D](./fold-create-3d)は区画を折る動作、[Tube Create 3D](./tube-create-3d)は経路に沿う管を作る処理です。Heightfield Create 3Dは、画像の明るさを面の起伏へ使う点で選びます。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 105、p.2434。輝度による奥行き変形、画像マップ、四角・棒状の変形を確認しました。端子名、全設定、数値範囲、実機での結果は未確認です。
