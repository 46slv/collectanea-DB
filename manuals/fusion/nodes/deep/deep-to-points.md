---
title: Deep to Points
description: Deep ImageのsampleをClassic 3D point cloudへ変換し、Cameraを使って元sceneとの位置関係を再現・可視化するNode。
doc_type: node
term_id: deep-to-points
verification: partial
aliases: [Deep to Points, DTP]
concepts: [deep-image, classic-3d, depth]
nodes: [Deep to Points]
node_family: deep
controls: [Style, Size, Antialiasing, Density, Default Color, Use Per-Point Colors, Make Renderable, Unseen by Camera, Scale, Depth Scale, Flip Depth, Transform]
inputs: [deep-image, camera]
outputs: [classic-3d]
tasks: [deep, visualize-depth, point-cloud, convert-domain]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# Deep to Points

Deep to Pointsは、<Term id="deep-image">Deep Image</Term>のdepth sampleを<Term id="classic-3d">Classic 3D point cloud</Term>へ変換するNodeです。

Deep dataの奥行きを3D Viewerで確認したり、元3D sceneとの位置関係を見ながらelementを配置する用途に使います。

## 入力

### Input

Deep Image inputです。

### Camera

元sceneをrenderしたCamera 3Dを接続すると、そのperspectiveを使ってpointを元の3D位置へ配置します。

camera無しでもpoint cloudは作れますが、元sceneとの正確な対応を確認する場合にCamera inputが重要です。

## 表示Control

- Style — Cross Hair / Point等の表示
- Size
- Antialiasing
- Density
- Default Color
- Use Per-Point Colors

source Imageの色をpointへ持たせるか、一定colorで表示するか選べます。

## Make Renderable

有効にするとRenderer 3Dでpoint cloudを2D Imageへrenderできます。

Unseen by Cameraを有効にすると3D Viewerには見せつつ、最終Renderer outputからは除外できます。

## Scale / Depth Scale / Flip Depth

Scaleはpoint cloud全体、Depth ScaleはZ方向の広がりを調整します。

Flip Depthでdepth方向を反転できます。

## Transform tab

Translation / Rotation / Pivot / Scale / Use Target等、Classic 3D共通Transformを持ちます。

## 最小構成

```text
Deep EXR ─────→ Deep to Points ─┐
Camera 3D ─────→ Camera input   ├─ Merge 3D → Renderer 3D
Other 3D object ────────────────┘
```

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 95 pp.2241–2244で、Deep / Camera inputs、point display controls、Make Renderable、Depth Scale、Transformを確認しました。
