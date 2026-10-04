---
title: "Film Grain"
description: "フィルムグレインを付加。"
doc_type: node
term_id: "film-grain"
term_short: "Film Grainは、フィルムグレインを付加。"
verification: partial
aliases: ["Film Grain", "FGR"]
concepts: ["image-data"]
nodes: ["Film Grain"]
node_family: "effects-film"
inputs: ["image"]
outputs: ["image"]
tasks: ["stylize-image"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-03"
---
# Film Grain

Film Grainは、film negativeの粒状感を再現する現行のgrain generatorです。

compositing中にdenoiseした素材へ最後に共通grainを戻し、複数elementの質感を揃える用途に向きます。

## Complexity / Log Processing
Complexityは複数scaleのgrain layerを重ねます。

Log Processingを有効にすると、blackよりhighlightでgrainが強く見えるfilm-likeな非線形responseを作ります。

## Seed / Time Lock
Seedでrandom patternを変えます。Time Lockを有効にするとframeごとのgrain更新を止めます。

## Size / Strength / Roughness
- Size: grain kernelの大きさ
- Strength: pixel variationの幅
- Roughness: low-frequency clumping

Monochromeを外すとRGB channel別に設定できます。

## Grainとの違い
旧Grain Nodeはcompatibility用として残っています。Manualは通常Film Grainを推奨しています。

## 出典と確認範囲
DaVinci Resolve 21.1 Reference Manual Chapter 98 pp.2313–2317で、Complexity、Log Processing、Seed、Time Lock、Monochrome、Size、Strength、Roughnessを確認しました。
