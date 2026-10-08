---
title: uCylinder Light
description: 長さと半径を持つcylindrical area lightをUSD sceneへ追加し、蛍光灯のようなline-shaped lightingを作るNode。
doc_type: node
term_id: ucylinder-light
verification: partial
aliases: [uCylinder Light, uCL]
concepts: [usd-scene, lighting]
nodes: [uCylinder Light]
node_family: usd
controls: [Override Selection, Color, Intensity, Exposure, Color Temperature, Diffuse Response, Specular Response, Normalize, Treat As Line, Length, Radius, Transform]
inputs: [usd]
outputs: [usd]
tasks: [usd, lighting, area-light]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# uCylinder Light

uCylinder Lightは、長さと太さを持つcylindrical lightを<Term id="usd-scene">USD scene</Term>へ追加するNodeです。

蛍光灯やtube lightのような、線状に広がるlight sourceを作る用途に向きます。

## 入力

黄色のScene InputへUSD sceneを接続できます。

import済みscene内Lightを調整する場合はOverride SelectionのPickからScene Treeで対象Lightを選びます。

## 主な設定

- Color / Intensity / Exposure
- Color Temperature
- Diffuse / Specular Response
- Normalize
- Treat As Line
- Length
- Radius

Treat As Lineを有効にすると、より単純なline lightとして扱います。

## Transform

position / rotation / scaleでscene内のlight source位置と方向を決めます。

## 最小構成

```text
uShape ─────────┐
uCylinder Light ├─ uMerge → uRenderer
uCamera ────────┘
```

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 121 pp.2930–2931で、Scene Input、Override Selection、共通Light controls、Treat As Line、Length、Radiusを確認しました。
