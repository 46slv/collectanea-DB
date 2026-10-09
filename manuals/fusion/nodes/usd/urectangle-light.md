---
title: uRectangle Light
description: 幅と高さを持つrectangular area lightをUSD sceneへ追加し、window / softboxのようなlightingを作るNode。
doc_type: node
term_id: urectangle-light
verification: partial
aliases: [uRectangle Light, uRL]
concepts: [usd-scene, lighting]
nodes: [uRectangle Light]
node_family: usd
controls: [Override Selection, Color, Intensity, Exposure, Color Temperature, Diffuse Response, Specular Response, Normalize, Shaping Focus, Shaping Cone Angle, Width, Height, Transform]
inputs: [usd]
outputs: [usd]
tasks: [usd, lighting, area-light, softbox]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# uRectangle Light

uRectangle Lightは、windowやsoftboxのようなrectangular area lightを<Term id="usd-scene">USD scene</Term>へ追加するNodeです。

## 主な設定

共通Light controlsに加えて:

- Shaping Focus
- Shaping Cone Angle
- Width
- Height

を持ちます。

Width / Heightでsource面の形を直接作れるため、縦長window lightや横長softboxを作れます。

## Transform

position / rotationでscene内のlight sourceを配置します。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 121 pp.2936–2938で、Scene Input、共通Light controls、Shaping、Width / Heightを確認しました。
