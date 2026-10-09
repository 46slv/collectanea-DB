---
title: 補助Channel / AOV
description: RGBA以外のZ・Normal・UV・Object ID・Material ID等を、Deep Imageとは別の2D Image補助dataとして理解する。
doc_type: concept
term_id: auxiliary-channels
term_short: Z・Normal・UV・Object ID等、RGBA以外にrenderから持ち出す補助channel / AOV。
verification: partial
aliases: [Auxiliary Channels, AOV, Deep Pixel, Z channel, Normal channel, UV channel]
concepts: [image-data, aov, depth]
nodes: [Ambient Occlusion, Depth Blur, Fog, Shader, Texture]
tasks: [aov, post-process, depth, relight]
level: advanced
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# 補助Channel / AOV

Fusionの2D ImageはRGBA以外に、Z、Normal、UV、Object ID、Material ID等の補助channelを持てます。

Rendererからbeautyだけでなく追加dataを出しておくと、render後の2D段階でDepth Blur、Fog、re-lighting、texture replacement等を行えます。

## Deep Imageとは別

補助channel付きImageは、1 pixelに複数depth sampleを持つDeep Imageとは別です。

```text
Auxiliary-channel Image
  RGBA + Z + Normal + UV + IDs

Deep Image
  pixel内に複数 RGBA + depth sample
```

Chapter 96のDeep Pixel Nodesはauxiliary channelを使う2D post-effectです。

Chapter 95のd* NodeはDeep Image domainを扱います。

## よく使うchannel

### Z / Depth

cameraからの距離を表します。

Depth BlurやFogが、近いpixelと遠いpixelへ違うEffectを適用できます。

### Normal

surfaceがどちらを向いているかをvectorとして保持します。

Ambient OcclusionやShader等が、render後のlighting / shading計算へ使います。

### UV

3D surfaceのtexture coordinateです。

Texture Nodeでrender済みobjectへ別textureをmappingする場合に使います。

### Object ID / Material ID

object / materialを識別する整数IDです。

Effectを特定objectだけへ限定するMask sourceとして使えます。

## channelが無いと効かないNode

Deep Pixel Nodeは必要channelが欠けるとEffectが成立しません。

例:

- Depth Blur → Z channelが必要
- Fog → Z channelが必要
- Ambient Occlusion → Z + Normal + Cameraが必要
- Shader → Normal channelが必要
- Texture → UV channelが必要

「Nodeが壊れている」のではなく、必要AOVが入力Imageに無い可能性を最初に確認します。

## Rendererで準備する

Classic Renderer 3Dや外部3D rendererから、必要なauxiliary channelを含めてrenderします。

後段で必要になるchannelを予測して出すことが重要です。

## 関連Node

- [Ambient Occlusion](../../nodes/deep/ambient-occlusion-deep-pixel)
- [Depth Blur](../../nodes/deep/depth-blur-deep-pixel)
- [Fog](../../nodes/deep/fog-deep-pixel)
- [Shader](../../nodes/deep/shader-deep-pixel)
- [Texture](../../nodes/deep/texture-deep-pixel)

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 96 pp.2255–2270と、Chapter 77 Understanding Image Channelsを基に整理しています。

rendererごとのAOV naming / encoding差はsource renderer側資料を確認する必要があります。
