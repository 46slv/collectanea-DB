---
title: Fog 3D
description: Cameraからのdistanceを使ってClassic 3D geometryへfog colorを加え、Linear / Exp / Exp2 falloffやdensity textureで大気感を作るNode。
doc_type: node
term_id: fog-3d
term_short: Fog 3Dは、cameraからのdepth distanceに応じて3D sceneへfogを加えるNode。
verification: partial
aliases: [Fog 3D, 3Fo]
concepts: [classic-3d, depth, atmosphere]
nodes: [Fog 3D]
node_family: 3d
controls: [Enable, Show Fog in View, Color, Radial, Type, Near Fog Distance, Far Fog Distance]
inputs: [classic-3d, image]
outputs: [classic-3d]
tasks: [fog-3d, atmosphere, depth]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# Fog 3D

Fog 3Dは、<Term id="classic-3d">Classic 3D scene</Term>内のgeometryへ、cameraからのdistanceに応じたfogを加えるNodeです。

2DのFog effectを後段Imageへ掛けるのではなく、3D space上のdepthを使ってgeometryをretextureします。

## 入力

- **Scene Input** — 必須。fogを適用する3D scene。
- **Density Texture** — 任意の2D Image。Fog colorへ掛け合わせ、場所ごとのdensity variationを作ります。cameraからsceneへ投影されるように使われます。

## 主な設定

### Color

fogの色です。Density Textureがある場合はそのImage値と乗算されます。

### Radial

無効時はcamera near planeに平行なplaneからのperpendicular distanceを使います。有効時はcamera eye pointからのradial distanceを使います。

cameraを横へ動かしたとき、画面端objectのfog量が不自然に変わる場合はRadialを検討します。

### Type

- Linear
- Exp
- Exp2

distanceに対するfog falloff curveを選びます。

### Near / Far Fog Distance

Nearでfog開始位置、Farで最大fogになるdistanceを決めます。

## 最小構成

Scene → Merge 3D → Fog 3D → Renderer 3D

## Soft Clipとの違い

Fog 3Dはdistanceに応じてfog colorを加えます。Soft Clipはcamera近傍のgeometry / particleを透明へfadeします。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 88 pp.1950–1952で、Scene / Density Texture input、Color、Radial、falloff Type、Near / Far Distanceを確認しました。
