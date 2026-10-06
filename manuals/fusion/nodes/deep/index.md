---
title: Deep / Auxiliary Channelノード
description: true Deep Image compositingと、Z・Normal・UV等のauxiliary channelを使う2D post-effectを区別してNodeを選ぶ入口。
doc_type: index
verification: partial
product_scope: fusion
tasks: [lookup-node, deep, aov, depth-composite]
updated: "2026-10-04"
---

# Deep / Auxiliary Channelノード

このカテゴリには、名前が似ていても**2種類の異なる仕組み**があります。

1. Chapter 95: <Term id="deep-image">Deep Image</Term> — 1 pixelに複数depth sampleを持つtrue Deep compositing
2. Chapter 96: <Term id="auxiliary-channels">Auxiliary Channel / AOV</Term> — RGBA + Z / Normal / UV / ID等を持つ2D Image post-process

ここを分けて理解すると「dMergeとDepth Blurは同じDeep系なのか」という混乱を避けられます。

## Deep Image Node

Studio Version Onlyです。

| やりたいこと | Node |
| --- | --- |
| Deep sampleを色補正 | [dColorCorrector](./dcolorcorrector) |
| Z rangeでsampleをcrop | [dCrop](./dcrop) |
| Deepを2Dへflatten | [Deep to Image](./deep-to-image) |
| Deep sampleを3D point cloudへ | [Deep to Points](./deep-to-points) |
| foreground Deepでbackgroundをocclude | [dHoldout](./dholdout) |
| 複数Deep streamを統合 | [dMerge](./d-merge) |
| 2D RGBでDeep sampleをrecolor | [dRecolor](./drecolor) |
| Deep image resolutionを変更 | [dResize](./dresize) |
| XY + Zを含めDeep sampleをtransform | [dTransform](./dtransform) |
| 2D ImageへDeep informationを付与 | [Image to Deep](./image-to-deep) |

## Deep Pixel / Auxiliary Channel Node

通常2D Imageへ含まれるAOVを使います。

| 必要data | Node | 役割 |
| --- | --- | --- |
| Z + Normal + Camera | [Ambient Occlusion](./ambient-occlusion-deep-pixel) | screen-space AOをpost-process |
| Z / 任意channel | [Depth Blur](./depth-blur-deep-pixel) | depth-of-field / per-pixel blur |
| Z | [Fog](./fog-deep-pixel) | depthでfog量を変える |
| Normal | [Shader](./shader-deep-pixel) | post-process relighting / reflection |
| UV | [Texture](./texture-deep-pixel) | render後のtexture差し替え |

## Domain boundary

Deep Image:

```text
Deep EXR → dMerge → dTransform → Deep to Image → 2D Image
```

Auxiliary channel:

```text
Renderer 3D (RGBA + Z + Normal + UV)
  → Depth Blur / Fog / Shader / Texture
  → 2D Image
```

## Linear workflow

Deep Image compositingはManualでlinear colorspace必須と明記されています。

Color managementを後回しにするという意味ではなく、Deep sample合成をlinearで行い、その後に必要なdisplay / delivery spaceへ変換します。

## 関連する考え方

- [Deep Image](../../learn/02-data/deep-image)
- [補助Channel / AOV](../../learn/02-data/auxiliary-channels)
- [データ領域を辿って診断する](../../learn/07-debugging/trace-data-domain)

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 95 pp.2226–2254、Chapter 96 pp.2255–2270を基に整理しています。
