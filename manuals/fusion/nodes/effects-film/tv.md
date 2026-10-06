---
title: "TV"
description: "TV/走査線系のスタイライズ。"
doc_type: node
term_id: "tv"
term_short: "TVは、TV/走査線系のスタイライズ。"
verification: partial
aliases: ["TV"]
concepts: ["image-data"]
nodes: ["TV"]
node_family: "effects-film"
inputs: ["image"]
outputs: ["image"]
tasks: ["stylize-image"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-03"
---
# TV

TVは、analog television風のscan line、horizontal / vertical offset、noise、distortionをImageへ加えるstylize Nodeです。

## Scan Lines
lineを一定間隔でdropし、interlace-likeな走査線を作ります。

## Horizontal / Vertical
Imageを横 / 縦方向へoffsetし、sync drift風のずれを作ります。

## 複数tab
Controls / Noise / Distortion系のtabを組み合わせ、TV signal flawを作ります。

## Grainとの違い
film grainやnoise追加だけならFilm Grain / Grainを使います。TVはscan / sync / distortionを含むvideo signal stylizeです。

## 出典と確認範囲
DaVinci Resolve 21.1 Reference Manual Chapter 97 pp.2303–2306で、TV-style flaws、Scan Lines、Horizontal / Vertical、複数Inspector tabを確認しました。
