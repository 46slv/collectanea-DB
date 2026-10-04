---
title: Deep Image
description: 1 pixelに複数depth sampleを持つDeep Imageと、Z/Normals等のauxiliary channelを扱うDeep Pixel処理を区別して理解する。
doc_type: concept
term_id: deep-image
term_short: 1 pixelに複数のdepth sampleを保持し、前後関係をflatten前に合成できるDeep Image data。
verification: partial
aliases: [Deep Image, deep compositing, deep data]
concepts: [data-domain, depth, multilayer]
nodes: [Image to Deep, Deep to Image, dMerge, dColorCorrector]
tasks: [deep, compositing, understand-domain]
level: advanced
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# Deep Image

Deep Imageは、1 pixelにつき1つの色・depthだけを持つ通常Imageと違い、同じpixel位置に複数のdepth sampleを保持できます。

手前の煙、奥のgeometry、その間の半透明sampleなどをdepth順のまま保持し、flatten前に合成できるのがDeep compositingの特徴です。

DaVinci Resolve 21.1 ManualではDeep Image toolsetは**Studio Version Only**と明記されています。

## 基本の流れ

Deep EXR等を直接読み込む場合:

```text
Deep source A ─┐
               ├─ dMerge → Deep to Image → 2D Image
Deep source B ─┘
```

通常の2D ImageをDeepへ参加させる場合:

```text
2D Image → Image to Deep ─┐
                          ├─ dMerge → Deep to Image
Deep Image ───────────────┘
```

## d* NodeはDeep sampleを保つ

dMerge、dCrop、dTransform、dColorCorrector等はDeep Image domainのまま処理します。

通常のMergeやTransformへ変換する前に、depth sampleを保ったまま必要な処理を済ませます。

## Deep to Image

Deep sampleをflattenし、通常の2D Imageへ戻します。

この地点以降はBlur、Merge、Color Corrector等の通常2D Nodeを使えますが、flatten前の複数depth sampleは失われます。

## Deep to Points

Deep sampleを3D Point Cloudへ変換し、depth分布を3D Viewerで確認できます。

Cameraを接続すると元scene camera perspectiveに合わせてpointを配置できます。

## Deep ImageとDeep Pixelは別

Chapter 95の**Deep Image Nodes**と、Chapter 96の**Deep Pixel Nodes**は同じものではありません。

Deep Pixel Nodesは通常の2D Imageに含まれるZ、Normals、Object ID等のauxiliary channel / AOVを使うpost effectです。

```text
Deep Image:
1 pixel → multiple depth samples

Deep Pixel / auxiliary:
1 pixel → RGBA + Z / Normal / ID 等のchannel
```

たとえばDepth BlurはZ channelでblur量を変えますが、dMergeのようなmulti-sample Deep compositingではありません。

## linear workflow

Deep compositingではdepth sample同士を正しく合成するため、sourceのcolor interpretationも重要です。

Deep to ImageにはSource Color Space / Source Gamma Space等があり、flatten後の2D output metadata / curve handlingを設定できます。

## 関連Node

- [Deep / Deep Pixelノード](../../nodes/deep/)
- [Image to Deep](../../nodes/deep/image-to-deep)
- [dMerge](../../nodes/deep/d-merge)
- [Deep to Image](../../nodes/deep/deep-to-image)
- [Deep to Points](../../nodes/deep/deep-to-points)

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 95 pp.2226–2254とChapter 96 pp.2255–2270を基に、Deep ImageとDeep Pixel/AOV処理の境界を整理しています。

Deep EXR writer/reader互換性、sample storage内部形式、実機performanceは未確認です。
