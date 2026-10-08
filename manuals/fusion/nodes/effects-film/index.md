---
title: Effect / Filmノード
description: Duplicate・Highlight・Rays等の2D Effectと、film grain・log・noise処理を目的から選ぶ入口。
doc_type: index
verification: partial
product_scope: fusion
tasks: [lookup-node, stylize, film]
updated: "2026-10-05"
---

# Effect / Filmノード

## 反復・光・stylize
- [Duplicate](./duplicate) — 2D Imageを反復複製
- [Highlight](./highlight) — star glint
- [Hot Spot](./hot-spot) — flare / spotlight / burn-dodge
- [Object Removal](./object-removal) — temporal analysisで不要物除去
- [Pseudo Color](./pseudo-color) — waveformによるfalse color
- [Rays](./rays) — 放射状light ray
- [Shadow](./shadow) — 2D drop shadow
- [Trails](./trails) — temporal afterimage
- [TV](./tv) — analog TV distortion

## Film / noise
- [Cineon Log](./cineon-log) — log ↔ linear
- [Film Grain](./film-grain) — 現行film grain
- [Grain](./grain) — legacy grain
- [Light Trim](./light-trim) — log exposure trim
- [Remove Noise](./remove-noise) — channel-based simple denoise

[Depth Map](./depth-map)はMatte familyのAI depth生成Nodeとして別系統です。

## 出典と確認範囲
DaVinci Resolve 21.1 Reference Manual Chapter 97–98を基に整理しています。
