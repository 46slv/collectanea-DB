---
title: rNoise
description: Perlinノイズで変化する領域を作り、Region入力を持つツールに渡す。
doc_type: node
term_id: rnoise
term_short: Perlinノイズによる作用領域を作るRegionツール。
verification: partial
aliases: [rNoise]
nodes: [rNoise]
node_family: krokodove
outputs: [region]
tasks: [limit-effect-region]
product_scope: fusion
suite_surfaces: [fusion]
updated: '2026-10-03'
---

# rNoise

Perlinノイズを使ったRegionを作ります。一つの箱や球で範囲を指定する代わりに、ノイズに基づく領域を対応ツールへ渡す用途です。

## 入力と出力

出力の役割はRegionです。ManualはRegion入力を持つツールと組み合わせることを明記しています。画面にノイズ画像を生成するノードと同じものとしては扱いません。

## 運用例

対応する3D効果の作用範囲を不規則にしたい場合の候補です。[rCube](./rcube)のような単純な形のRegionと比較すると、領域を決める方法の違いを確認できます。

ノイズの大きさ、時間変化、次元、振幅などの正式なパラメータは、この項目には記載されていません。Fast Noiseの設定をそのまま流用する説明はしません。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 105、p.2438。Perlinノイズの領域生成と接続用途を確認しました。対応ノード一覧、全端子、全設定、実機結果は未確認です。
