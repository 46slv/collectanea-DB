---
title: Deep / Deep Pixelノード
description: multi-sample Deep Imageを合成・変形・flattenするNodeと、Z/Normals/AOVを使うDeep Pixel post effectを分けて探す入口。
doc_type: index
verification: partial
product_scope: fusion
tasks: [lookup-node, deep, depth, aov]
updated: "2026-10-04"
---

# Deep / Deep Pixelノード

このFamilyには、名前が似ていても2種類の処理があります。

- <Term id="deep-image">Deep Image</Term> — 1 pixelに複数depth sampleを保持するdata
- **Deep Pixel / auxiliary channel処理** — 2D ImageのZ / Normals / ID等を使うpost effect

まずこの2つを分けるとNodeを選びやすくなります。

## Deep Imageを作る / 戻す

- [Image to Deep](./image-to-deep) — 2D Imageへdepth sampleを付与
- [Deep to Image](./deep-to-image) — Deep sampleをflattenして2D Imageへ
- [Deep to Points](./deep-to-points) — Deep sampleをClassic 3D Point Cloudへ

## Deep Imageを合成する

- [dMerge](./d-merge) — 複数Deep streamをdepth sample単位で統合
- [dHoldout](./dholdout) — foreground Deepでbackground sampleをocclude
- [dCrop](./dcrop) — min/max depthやMaskでsampleをcrop

## Deep Imageを変える

- [dColorCorrector](./dcolorcorrector) — Deep sampleを保ったままColor correction
- [dRecolor](./drecolor) — 2D RGB ImageでDeep sampleをrecolor
- [dResize](./dresize) — Deep ImageのWidth / Height変更
- [dTransform](./dtransform) — XYとZ depthを保ったままTransform

## Deep Pixel / AOVを使う

これらはmulti-sample Deep Imageではなく、2D renderに含まれるZ / Normals等のchannelを使います。

- [Ambient Occlusion](./ambient-occlusion-deep-pixel) — Z + Normals + CameraからAO
- [Depth Blur](./depth-blur-deep-pixel) — Z等でper-pixel blur
- [Fog](./fog-deep-pixel) — Z channelでfog量を変える
- [Shader](./shader-deep-pixel) — Normals + reflection mapでsurface shading
- [Texture](./texture-deep-pixel) — 3D-rendered auxiliary dataを使ったtexture処理

## Studio境界

Chapter 95のDeep Image Compositing Toolsetは21.1 ManualでStudio Version Onlyです。

Chapter 96のDeep Pixel Nodesについては、各NodeのEdition制約を個別Reference / current hostで確認します。Chapter見出しだけから同じStudio制約を自動適用しません。

## 関連する考え方

- [Deep Image](../../learn/02-data/deep)
- [データ領域を辿って診断する](../../learn/07-debugging/trace-data-domain)
- [画像Channel](../../learn/02-data/image-mask-data)

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 95–96を基に整理しています。
