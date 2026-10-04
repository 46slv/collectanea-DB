---
title: Fog
description: Z-Depth channelを使い、Near/Far Plane・Z Depth Scale・Fog Color・Opacityで3D-rendered Imageへdepth fogを追加するNode。
doc_type: node
term_id: fog-deep-pixel
verification: partial
aliases: [Fog]
concepts: [auxiliary-channels, depth, image-data]
nodes: [Fog]
node_family: deep
controls: [Z-Buffer Near Plane, Z-Buffer Far Plane, Z Depth Scale, Fog Color, Fog Opacity]
inputs: [image, image, mask]
outputs: [image]
tasks: [fog, depth, atmosphere]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# Fog

Fogは、3D-rendered 2D ImageのZ-Depth channelを使い、cameraからの距離に応じてfogを加えるDeep Pixel post effectです。

Deep Imageのmulti-sample volume compositingではなく、通常ImageのZ channelからfog量を計算します。

## 入力

### Input

Z channelを含む2D Imageを接続します。

### Fog Image

任意の2D Imageです。

接続すると単色Fogではなく、Fast Noise等のImageをfog textureとして使えます。

### Effect Mask

Fogを適用する最終領域を限定します。

## Near / Far Plane

### Near Plane

fogがほぼ0になる近距離depthです。

### Far Plane

fogがopaqueになる遠距離depthです。

ViewerのPickからscene内objectのdepthを直接sampleできます。

## Z Depth Scale

Z channelのdistance rangeを拡大・圧縮し、fogのdepth感を強調・緩和します。

## Fog Color / Fog Opacity

fogの色と全体opacityを調整します。

Fog Imageを使う場合でも最終的なdensity / colorの調整に使います。

## 最小構成

```text
Renderer 3D (RGBA + Z) → Fog → Output
                           ↑
                     optional Fast Noise
```

## Volume Fogとの違い

Volume FogはWorld Position等を使う別Nodeです。

FogはZ channelを使う2D post effectなので、source Imageに正しいZがあることが前提です。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 96 pp.2261–2262で、Z input、Fog Image、Effect Mask、Near/Far Plane、Z Depth Scale、Fog Color / Opacityを確認しました。
