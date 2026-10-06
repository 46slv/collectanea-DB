---
title: Frame Average
description: 指定frame rangeの複数Imageを平均化して1枚の結果を作り、noise低減やmoving objectを薄くする時間方向の平均Node。
doc_type: node
term_id: frame-average
term_short: 複数frameを平均して1枚のImageへまとめるNode。
verification: partial
aliases: [Frame Average, Avg]
concepts: [image-data, time]
nodes: [Frame Average]
node_family: time-metadata
inputs: [image]
outputs: [image]
tasks: [frame-average, temporal-denoise, average]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-05"
---

# Frame Average

Frame Averageは、時間方向に複数frameを読み、pixel値を平均して1枚のImageを作るNodeです。

静止backgroundに対するrandom noiseを減らしたり、動くobjectを平均化して薄くする用途に使えます。

## 使う判断

camera / sceneが固定され、frameごとの差が主にnoiseである場合、平均化によってnoiseが減ります。

camera movementやsubject movementがあると、動いた部分はghost / blurとして平均されます。

## Optical Flow系との違い

Frame Averageはmotionを追跡してalignするNodeではありません。動きがある素材ではmotion-compensatedな別手段を検討します。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 111 p.2596で、Frame Averageの独立Node sectionを確認しました。exact Inspector controlsはruntime verification対象です。
