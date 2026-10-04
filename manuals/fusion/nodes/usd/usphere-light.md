---
title: uSphere Light
description: 半径を持つlocal spherical lightをUSD sceneへ追加し、Point Lightに近い全方向照明へsource sizeを持たせるNode。
doc_type: node
term_id: usphere-light
verification: partial
aliases: [uSphere Light, uSL]
concepts: [usd-scene, lighting]
nodes: [uSphere Light]
node_family: usd
controls: [Override Selection, Color, Intensity, Exposure, Color Temperature, Diffuse Response, Specular Response, Normalize, Treat as Point, Radius, Transform]
inputs: [usd]
outputs: [usd]
tasks: [usd, lighting, sphere-light, point-light]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# uSphere Light

uSphere Lightは、半径を持つlocal spherical lightを<Term id="usd-scene">USD scene</Term>へ追加するNodeです。

Point Lightに近い全方向lightingへ、source sizeを持たせたい場合に使います。

## 主な設定

- Color / Intensity / Exposure
- Color Temperature
- Diffuse / Specular Response
- Normalize
- Treat as Point
- Radius

Treat as Pointを有効にすると単純なpoint sourceとして扱います。

## Radius

sphere light sourceの大きさを決めます。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 121 pp.2938–2939で、Scene Input、共通Light controls、Treat as Point、Radiusを確認しました。
