---
title: Directional Light
description: scene全体へ同じ方向の平行光を当て、Color・Intensity・shadow mapを調整するClassic 3D Light。
doc_type: node
term_id: directional-light
verification: partial
aliases: [Directional Light, 3DL]
concepts: [classic-3d, lighting]
nodes: [Directional Light]
node_family: materials-lights
controls: [Enabled, Color, Intensity, Enable Shadows, Shadow Color, Density, Shadow Map Size, Shadow Map Proxy, Bias, Shadow Map Sampling, Softness, Transform]
inputs: [classic-3d]
outputs: [classic-3d]
tasks: [shade-3d, light-3d, sun-light]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# Directional Light

Directional Lightは、太陽のようにscene全体へ同じ方向から平行光を当てる<Term id="classic-3d">Classic 3D</Term> Lightです。

位置を動かしても光の見え方は変わらず、rotationで光の方向を決めます。

## 入力 / 出力

オレンジ色の任意Scene Inputへ3D sceneを接続できます。

通常はLight自体をMerge 3Dへ接続し、GeometryやCameraと同じsceneへ入れます。

```text
Geometry ──────────┐
Directional Light ─┼─ Merge 3D → Renderer 3D
Camera 3D ─────────┘
```

## 主な設定

### Color / Intensity

光の色と強さを決めます。

### Transform Rotation

Directional Lightではpositionではなくrotationが実際のlighting方向に影響します。

### Shadows

Enable Shadowsでshadowを有効にし、Shadow Color / Density / Map Size / Bias / Sampling / Softness等を調整します。

shadow mapを大きくするとdetailは増えますが、memory / render costも増えます。

## Viewer / Renderer側の設定

Lightをsceneへ追加しただけでは、ViewerやRenderer 3Dでlighting / shadowが見えない場合があります。

- 3D Viewer: Lighting / Shadowsを有効
- Renderer 3D: Enable Lighting / Enable Shadowsを有効

## Point / Spotとの違い

- **Directional Light** — 無限遠からの平行光。rotationだけが方向を決める
- **Point Light** — 1点から360°へ照射
- **Spot Light** — 位置と方向、coneを持つ

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 89 pp.2029–2032とFusion Fundamentals Chapter 84で、parallel light、Color / Intensity、rotation、shadow controlsを確認しました。

renderer別shadow差と実機performanceは未確認です。
