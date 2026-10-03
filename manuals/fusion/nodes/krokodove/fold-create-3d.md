---
title: Fold Create 3D
description: 分割した平面を区画ごとに順番に折り、カードが開閉するような3D表現を作る。
doc_type: node
term_id: fold-create-3d
term_short: 平面の各区画を個別に折りたたむ3D生成ツール。
verification: partial
aliases: [Fold Create 3D, FoldCreate3D]
nodes: [Fold Create 3D]
node_family: krokodove
outputs: [classic-3d]
tasks: [motion-graphics]
product_scope: fusion
suite_surfaces: [fusion]
updated: '2026-10-03'
---

# Fold Create 3D

平面を複数の区画に分け、各区画を決められた順番で折るツールです。一枚の面全体を回転させるのではなく、分割された面ごとに折り動作が分かれます。カードを順に開くような見せ方に使います。

## 入力と出力

作るものは、折り動作を持つ3Dの平面です。21.1 Manualは画像平面の各分割面を個別にアニメーションさせると説明しています。ただし、外部画像を受ける端子の名前・本数・必須条件は、この項目では説明していません。

## 設定を考える順序

最初に確認するのは面の分割と折る順番です。分割を細かくすると、どの区画が動いているかを見分けにくくなるため、用途を確認する段階では少ない区画で観察する方法が考えられます。これは確認方法の提案であり、既定値や正式なInspectorラベルの指定ではありません。

## 運用例

映像やタイトルを一度に出さず、複数のカードが開いて見える演出の候補になります。斜めから平面を見て、面全体が回っているのか、各区画が独立して折れているのかを確認すると、このツールの役割が分かりやすくなります。

3Dの結果を通常の画像合成へ渡す段階では、[Renderer3D](../3d/renderer-3d)などの描画処理が必要です。具体的な端子接続と描画結果は実機未検証です。

## 似たツールとの違い

[Heightfield Create 3D](./heightfield-create-3d)は画像の明るさを平面の奥行きへ変換します。Fold Create 3Dで確認した役割は、平面の区画を折る動作です。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 105、p.2434。名称・役割・分割面ごとの折り動作を本文で確認しました。内部REGID、全端子、Inspector項目、初期値、Edition差は未確認です。
