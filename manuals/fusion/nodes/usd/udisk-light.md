---
title: uDisk Light
description: 円形のflat area lightをUSD sceneへ追加し、Radius・Shaping Focus・Cone Angleでsoftlightの広がりを調整するNode。
doc_type: node
term_id: udisk-light
verification: partial
aliases: [uDisk Light, uDi]
concepts: [usd-scene, lighting]
nodes: [uDisk Light]
node_family: usd
controls: [Override Selection, Color, Intensity, Exposure, Color Temperature, Diffuse Response, Specular Response, Normalize, Shaping Focus, Shaping Cone Angle, Radius, Transform]
inputs: [usd]
outputs: [usd]
tasks: [usd, lighting, area-light, soft-light]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# uDisk Light

uDisk Lightは、円形のflat area lightを<Term id="usd-scene">USD scene</Term>へ追加するNodeです。

umbrella / softlightに近い広がりを持つlight sourceとして使います。

## 主な設定

共通Light controlsに加えて:

- Shaping Focus
- Shaping Cone Angle
- Radius

を持ちます。

Radiusを上げるとlight source自体を大きくし、Shaping controlsで照射方向の広がりを調整します。

## Override Selection

import済みUSDに既存Disk Lightがある場合、PickからScene Treeで対象を選び設定をoverrideできます。

## 最小構成

```text
uShape ─────┐
uDisk Light ├─ uMerge → uRenderer
uCamera ────┘
```

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 121 pp.2931–2933で、Scene Input、共通Light controls、Shaping Focus / Cone Angle、Radiusを確認しました。
