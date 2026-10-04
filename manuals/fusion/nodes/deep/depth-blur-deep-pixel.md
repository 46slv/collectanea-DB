---
title: Depth Blur
description: Z-Depthまたは任意channelをblur mapとして使い、Focal Point・Depth of Field・Z Scaleでdepth-dependent blurを作るDeep Pixel Node。
doc_type: node
term_id: depth-blur-deep-pixel
verification: partial
aliases: [Depth Blur, DBl]
concepts: [auxiliary-channels, depth, image-data]
nodes: [Depth Blur]
node_family: deep
controls: [Filter, Blur Channel, Lock X/Y, Blur Size, Focal Point, Depth of Field, Z Scale]
inputs: [image, image, mask]
outputs: [image]
tasks: [depth-blur, depth-of-field, auxiliary-channels]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# Depth Blur

Depth Blurは、2D Imageに含まれるZ-Depth等のchannelを使い、pixelごとにblur量を変えるNodeです。

cameraからの距離に応じてピント外れを作るDepth of Field用途が中心ですが、別ImageのchannelをBlur Mapとして使うこともできます。

## 入力

### Input

RGBA ImageにZ channel等を含む2D Imageを接続します。

### Blur Image

任意の2D Imageです。

接続すると、このImageの選択channelをblur amountのmapとして使えます。

### Effect Mask

最終的なBlur効果を適用する領域を限定します。

## Filter

- Box
- Soften
- Super Soften

からblur filterを選びます。

## Blur Channel

どのchannelをblur量の基準にするかを選びます。

Blur Imageが接続されている場合は、そのImageのchannelが使われます。

## Lock X/Y / Blur Size

横・縦のblur量を設定します。

Lockを外すとX / Yを別々に調整できます。

## Focal Point

Blur ChannelがZの場合、ピントを合わせるdepthを指定します。

Viewerからsampleして対象objectのdepthを拾えます。

## Depth of Field

Focal Pointの前後で「ピントが合っているdepth range」を決めます。

値を広げるほど、多くのdepthがsharpに残ります。

## Z Scale

Z channelの距離rangeを拡大・圧縮します。

sourceのZ値が狭すぎてblur差が出にくい場合に調整します。

## 最小構成

```text
Renderer 3D (RGBA + Z) → Depth Blur → Output
```

## Defocusとの違い

- **Depth Blur** — Z / channel値でpixelごとのblur量を変える
- **Defocus** — 通常Imageへuniformなlens-like defocusを適用

3D renderのdepthを利用してfocus planeを作りたい場合はDepth Blurが直接的です。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 96 pp.2259–2260で、Input / Blur Image / Mask、Filter、Blur Channel、Blur Size、Focal Point、Depth of Field、Z Scaleを確認しました。
