---
title: uDistant Light
description: 太陽のような遠方光源をUSD sceneへ追加し、rotationとAngular Sizeで平行光の方向と見かけの広がりを調整するNode。
doc_type: node
term_id: udistant-light
verification: partial
aliases: [uDistant Light, uDL]
concepts: [usd-scene, lighting]
nodes: [uDistant Light]
node_family: usd
controls: [Override Selection, Color, Intensity, Exposure, Color Temperature, Diffuse Response, Specular Response, Normalize, Angular Size, Transform]
inputs: [usd]
outputs: [usd]
tasks: [usd, lighting, sun-light]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# uDistant Light

uDistant Lightは、太陽のような遠方light sourceを<Term id="usd-scene">USD scene</Term>へ追加するNodeです。

positionよりrotationが照射方向を決めます。

## 主な設定

- Color
- Intensity / Exposure
- Color Temperature
- Diffuse / Specular Response
- Normalize
- Angular Size

Angular Sizeでlightの見かけ上の広がりを調整します。

## Transform

rotationで光の方向を決めます。

## Classic Directional Lightとの違い

- **uDistant Light** — USD
- **Directional Light** — Classic 3D

役割は近いですが別domainです。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 121 pp.2933–2934で、Scene Input、rotation、Angular Sizeと共通Light controlsを確認しました。
