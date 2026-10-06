---
title: "Grain"
description: "粒状ノイズを付加。"
doc_type: node
term_id: "grain"
term_short: "Grainは、粒状ノイズを付加。"
verification: partial
aliases: ["Grain", "GRN"]
concepts: ["image-data"]
nodes: ["Grain"]
node_family: "effects-film"
inputs: ["image"]
outputs: ["image"]
tasks: ["stylize-image"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-03"
---
# Grain

Grainは、旧来のfilm grain emulation Nodeです。

古いcomposition互換のため残されていますが、21.1 Manualは新規作業では通常[Film Grain](./film-grain)を推奨しています。

## 主な設定
- Power: grain強度
- RGB Difference: channel別strength
- Grain Softness: grainのblur / fuzziness
- Grain Size: 粒の大きさ
- Grain Spacing: density
- Aspect Ratio: anamorphic等へのshape調整
- Alpha-Multiply: Alpha外へのgrainを抑える

## Spread tab
RGB channelごとにtone range上のgrain量をcurveで調整できます。

## 出典と確認範囲
DaVinci Resolve 21.1 Reference Manual Chapter 98 pp.2317–2320で、legacy位置づけ、Power、RGB Difference、Softness、Size、Spacing、Aspect、Alpha-Multiply、Spreadを確認しました。
