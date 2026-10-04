---
title: Fog (Deep Pixel)
description: Z channelを使い、Near / Far depthに応じてColorまたはNoise Imageのfogを2D renderへ追加するNode。
doc_type: node
term_id: fog-deep-pixel
verification: partial
aliases: [Fog, Fog (Deep Pixel)]
concepts: [auxiliary-channels, image-data, depth]
nodes: [Fog]
node_family: deep
controls: [Z-Buffer Near Plane, Z-Buffer Far Plane, Z Depth Scale, Fog Color, Fog Opacity]
inputs: [image, image, mask]
outputs: [image]
tasks: [aov, fog, depth-atmosphere]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# Fog (Deep Pixel)

Fogは、2D <Term id="image">Image</Term>のZ channelを使い、cameraから遠いpixelほどfogを濃くするpost-process Nodeです。

true <Term id="deep-image">Deep Image</Term>ではなく、<Term id="auxiliary-channels">Z AOV</Term>付きImageを処理します。

## 入力

### Input

Z channelを含む2D Imageです。

### Fog Image

緑色の任意Image inputです。

接続しない場合は単色Fog、接続した場合はNoise等のImageをfog sourceとして使えます。

### Effect Mask

Fogを適用する画面範囲を限定します。

## Near / Far Plane

Near Planeはfogがほぼ無いdepth、Far Planeはfogが最大になるdepthを決めます。

Viewer SampleからZ値を取って設定できます。

## Z Depth Scale

入力Z値をscaleし、fogのdepth変化を誇張 / 圧縮します。

## Fog Color / Opacity

Fogの色と全体の透明度を調整します。

Fog Imageを接続している場合も、Color / Opacityで最終見た目を整えます。

## 最小構成

```text
Renderer 3D (RGBA + Z) → Fog → Output
```

variationを加える場合:

```text
Fast Noise ─────────────→ Fog Image
Renderer 3D (RGBA + Z) ─→ Fog → Output
```

## Fog 3Dとの違い

- **Fog (Deep Pixel)** — render後の2D Image + Z channelを処理
- **Fog 3D** — Classic 3D scene内で扱う3D Node

domainと処理timingが違います。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 96 pp.2261–2263で、Z input、Fog Image、Mask、Near / Far、Z Scale、Color / Opacityを確認しました。
