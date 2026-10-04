---
title: "Remove Noise"
description: "ノイズ除去。"
doc_type: node
term_id: "remove-noise"
term_short: "Remove Noiseは、ノイズ除去。"
verification: partial
aliases: ["Remove Noise", "RN"]
concepts: ["image-data"]
nodes: ["Remove Noise"]
node_family: "effects-film"
inputs: ["image"]
outputs: ["image"]
tasks: ["stylize-image"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-03"
---
# Remove Noise

Remove Noiseは、Imageを一度softenして元Imageとの差からnoiseを推定し、detailを戻しながらnoiseを減らす簡易denoise Nodeです。

Delta Keyer前など、grainがkeyingを不安定にする場合の前処理にも使えます。

## Method
- Color: RGB channelごとに処理
- Chroma: Luminance / Chrominanceで処理

## Softness / Detail
Softnessでnoiseが見えなくなるまでblurし、Detailで必要なedge / textureを戻します。

channelごとに別設定でき、Lockでまとめられます。

## 注意点
motion-compensated temporal denoiseではなく、channel-basedのsingle-frame noise managementです。

## 出典と確認範囲
DaVinci Resolve 21.1 Reference Manual Chapter 98 pp.2322–2324で、2 inputs、Color / Chroma method、Softness、Detail、Lockを確認しました。
