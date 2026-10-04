---
title: Deep Image
description: 1 pixel内に複数のdepth sampleを保持するDeep Image dataを、通常の2D ImageやZ channelと区別して理解する。
doc_type: concept
term_id: deep-image
term_short: 1 pixel内に複数のdepth sampleを保持し、奥行き順を保ったまま合成できるDeep compositing data。
verification: partial
aliases: [Deep Image, deep data, Deep EXR]
concepts: [data-domain, depth, compositing]
nodes: [dMerge, Deep to Image, Image to Deep, dHoldout]
tasks: [deep, understand-domain, composite]
level: advanced
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# Deep Image

Deep Imageは、1 pixelにつき1つのRGBA値だけを持つ通常の2D Imageと違い、**同じpixel位置に複数のdepth sampleを保持できる**dataです。

たとえば半透明volumeの手前と奥、複数objectが同じpixelへ重なる場合でも、各sampleのdepth関係を保ったまま後で合成できます。

## 2D Imageとの違い

通常の2D Image:

```text
pixel (x, y)
  → RGBA 1組
  → 必要なら Z channel 1値
```

Deep Image:

```text
pixel (x, y)
  → sample A: RGBA + depth
  → sample B: RGBA + depth
  → sample C: RGBA + depth
```

そのためDeep compositingは「Z channel付きImageをMergeする」のと同じではありません。

## Deep Image workflow

```text
Deep EXR A ─┐
            ├─ dMerge → dColorCorrector → Deep to Image → 2D comp
Deep EXR B ─┘
```

dMergeはdepth sampleを保ったまま統合し、Deep to Imageで通常の2D Imageへflattenします。

## Studio限定

DaVinci Resolve 21.1 ManualではDeep Image Compositing ToolsetはStudio Version Onlyと明記されています。

Renderer 3DはDeep Image outputを生成でき、Loader / MediaInはDeep EXRを読み込み、SaverはDeep EXRを書き出せます。

## linear colorspace

ManualではDeep compositingはlinear colorspaceを要求すると明記されています。

Deep合成を行った後で必要なdelivery color spaceへ変換します。

## 自動変換

Image to Deep / Deep to Image以外のDeep compositing toolは、通常2D Image inputを自動的にDeep Imageへ変換できる場合があります。

ただし2D Imageには元々複数depth sampleが存在しないため、必要なZ配置を明示したい場合はImage to Deepを使います。

## 代表Node

- **dMerge** — 複数Deep streamのdepth sampleを統合
- **dHoldout** — foreground Deepでbackground Deep sampleをocclude
- **dCrop** — Z rangeでDeep sampleを削る
- **dTransform** — XYとZを含めDeep sample位置を変形
- **dRecolor** — 2D RGB ImageでDeep sampleをrecolor
- **Deep to Image** — Deep → 2D Imageへflatten
- **Image to Deep** — 2D ImageへDeep informationを付与
- **Deep to Points** — Deep sampleをClassic 3D point cloudへvisualize

## Deep Pixelとの違い

Chapter 96の「Deep Pixel Nodes」は名前が似ていますが、true Deep Image sampleを扱うChapter 95とは別です。

Ambient Occlusion、Depth Blur、Fog、Shader、Texture等は、Z / Normal / UV / Object ID等の**auxiliary channelを持つ2D Image**をpost-processします。

→ [補助Channel / AOV](./auxiliary-channels)

## 関連Node

- [Deepノード](../../nodes/deep/)
- [dMerge](../../nodes/deep/d-merge)
- [Deep to Image](../../nodes/deep/deep-to-image)
- [Image to Deep](../../nodes/deep/image-to-deep)

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 95 pp.2226–2254を基にしています。

Deep EXR内部sample storage、external renderer compatibility、memory costの実機値は未確認です。
