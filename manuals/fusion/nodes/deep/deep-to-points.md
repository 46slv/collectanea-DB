---
title: Deep to Points
description: Deep Imageのdepth sampleをClassic 3D Point Cloudへ変換し、Cameraに合わせてZ分布を可視化・render可能にするNode。
doc_type: node
term_id: deep-to-points
verification: partial
aliases: [Deep to Points, DTP]
concepts: [deep-image, classic-3d, point-cloud]
nodes: [Deep to Points]
node_family: deep
controls: [Style, Size, Antialiasing, Density, Default Color, Use Per-Point Colors, Make Renderable, Unseen by Camera, Scale, Depth Scale, Flip Depth, Transform]
inputs: [deep, camera]
outputs: [classic-3d]
tasks: [deep, visualize-depth, point-cloud]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# Deep to Points

Deep to Pointsは、<Term id="deep-image">Deep Image</Term>のsampleを<Term id="classic-3d">Classic 3D Point Cloud</Term>へ変換するNodeです。

Deep dataのZ分布を3D Viewerで確認したいときや、point cloudとしてRenderer 3Dへ渡したいときに使います。

## 入力

### Input

Deep Imageを接続します。

### Camera

元renderに使ったCamera / 3D sceneを接続すると、そのperspectiveを使ってPointを正しい3D位置へ配置できます。

## Point表示

- Style — Crosshair / Point
- Size
- Antialiasing
- Density
- Default Color
- Use Per-Point Colors

でViewer内のpoint cloudを見やすく調整します。

## Make Renderable

有効にするとRenderer 3DでPoint Cloudを2Dへrenderできます。

Unseen by Cameraを有効にすると3D Viewerには見せつつ、Renderer 3Dの出力から外せます。

## Depth Scale / Flip Depth

Depth ScaleでZ方向の広がりを拡大・圧縮します。

Flip Depthでdepth方向を反転できます。

## Transform

Classic 3Dと同様のTranslation / Rotation / Pivot / Scaleを持ち、Point Cloud全体を3D space内で配置できます。

## 最小構成

```text
Deep Image ─────→ Deep to Points → Merge 3D → Renderer 3D
Camera 3D ──────↑
```

## Deep to Imageとの違い

- **Deep to Image** — Deepを2D pixelへflatten
- **Deep to Points** — Deep sampleを3D Point Cloudへ変換

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 95 pp.2240–2244で、Deep / Camera inputs、Point display controls、Make Renderable、Depth Scale、Flip Depth、Transformを確認しました。
