---
title: "Depth Map"
description: "AIで深度マップを推定。21で最大6x高速化。Edition/Neural Engine条件を確認。"
doc_type: node
term_id: "depth-map"
term_short: "Depth Mapは、AIで深度マップを推定。21で最大6x高速化。Edition/Neural Engine条件を確認。"
verification: partial
aliases: ["Depth Map"]
concepts: ["image-data"]
nodes: ["Depth Map"]
node_family: "effects-film"
inputs: ["image"]
outputs: ["image"]
tasks: ["stylize-image"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-03"
---
# Depth Map

Depth Mapは、2D footageからforeground / backgroundの奥行き関係を推定し、grayscaleのdepth mapを生成するStudio限定Nodeです。

white / blackの意味は用途側で確認し、生成したmapをDepth Blur、Fog、Relight等のcontrol sourceとして使えます。

## 役割
通常のMaskのように「選択範囲」だけを作るのではなく、画面内のpixelごとに相対depthを推定します。

## 使う場面
- Depth Blurで疑似DoF
- Fog量を距離で変える
- depth-aware effectのcontrol map
- foreground / background分離の補助

## 制約
AI推定なので、transparent object、reflection、fine hair、複雑なocclusion等では必ず正確な3D depthになるとは限りません。

## Deep Imageとの違い
Depth Mapは1 pixelに1つのdepth値を持つ2D mapです。1 pixelに複数sampleを持つDeep Imageとは別です。

## 出典と確認範囲
DaVinci Resolve 21.1 Reference Manual Chapter 109 pp.2524以降で、Depth Mapの独立Node sectionとStudio限定depth推定用途を確認しました。
