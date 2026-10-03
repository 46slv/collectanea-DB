---
title: Warped Transform
description: 画像を引き伸ばす、押し縮める、回すといった変形を行う。
doc_type: node
term_id: warped-transform
term_short: 画像の伸縮・押し縮め・回転を扱うKrokodoveの画像変形ツール。
verification: partial
aliases: [Warped Transform]
nodes: [Warped Transform]
node_family: krokodove
inputs: [image]
outputs: [image]
tasks: [warp-image]
product_scope: fusion
suite_surfaces: [fusion]
updated: '2026-10-03'
---

# Warped Transform

画像を引き伸ばしたり押し縮めたり、向きを回したりするツールです。21.1 ManualではKrokodoveの`Image Warp Tools`に分類されています。

## 入力と出力

扱う対象は画像です。このページの入出力分類はManualの分類と役割に基づきます。補助マップやマスクの入力有無、端子の正式名・本数は記載されていません。

## 使う場面

画像の形を伸縮させる表現を探すときの候補です。単に位置を変える目的と、画像自体を押し縮める目的を分けて考えます。標準Transformと同じ設定項目が使える、または完全な上位互換であるとは確認していません。

## 確認用の例

格子や文字の入った画像で変形すると、どの方向へ伸び、どの部分が縮んだかを見分けやすくなります。これは確認素材の提案です。特定のInspector値や変形アルゴリズムを指定する実機レシピではありません。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 105、p.2437。伸縮・押し縮め・回転という役割を確認しました。初出バージョン、補間方法、画面外の扱い、Inspector項目、実機結果は未確認です。
