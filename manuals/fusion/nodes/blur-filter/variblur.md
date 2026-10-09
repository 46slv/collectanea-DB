---
title: Vari Blur
description: 別Imageのchannel値をpixelごとのblur量として使い、gradientやZ-like mapから場所ごとに異なるblurを作るNode。
doc_type: node
term_id: variblur
verification: partial
aliases: [Vari Blur, VBL]
concepts: [image-data, filtering, mask-data]
nodes: [Vari Blur]
node_family: blur-filter
controls: [Method, Quality, Blur Channel, Lock X/Y, Blur Size, Blur Limit]
inputs: [image, image, mask]
outputs: [image]
tasks: [variable-blur, map-driven-blur, depth-like-blur]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# Vari Blur

Vari Blurは、2D <Term id="image">Image</Term>を一様にぼかすのではなく、別のBlur Imageのpixel値を使って**場所ごとにblur量を変える**Nodeです。

gradientで奥へ行くほどぼかす、noise mapで不規則にぼかす、といったmap-driven blurに使います。

## 入力

### Input

ぼかす対象の2D Imageです。

### Blur Image

blur量を決める必須mapです。Spline、Text、still、movie等のImageを使えます。

Blur ChannelでRed / Green / Blue / Alpha / Luminance等からcontrol channelを選びます。

### Effect Mask

最終的なVari Blurの適用範囲を限定します。

Blur Imageは「pixelごとのblur量」、Effect Maskは「Effectをどこへ適用するか」なので役割が異なります。

## Method

- **Soften** — Qualityに応じてBox系からsmooth blurへ近づく
- **Multi-box** — 高QualityでGaussian近似
- **Defocus** — flat circular shapeのdefocus-like blur

## Quality

高いほどblurが滑らかになりますが、処理時間も増えます。

Blur Sizeが小さい場合は高Qualityが不要なこともあります。

## Blur Size

map値に対する全体のblur scaleです。

Lock X/Yを外すとX / Y方向を別々に設定できます。

## Blur Limit

Blur Imageの極端な値を制限します。

Z-depth等、非常に大きな値を持つmapで一部pixelだけ過大なblurになる場合に使います。

## 最小構成

```text
Image ──────────→ Vari Blur → Output
Gradient Image ─→ Blur Image
```

## Depth Blurとの違い

- **Vari Blur** — 任意Image / channelをblur mapとして使う
- **Depth Blur** — Z depthとFocal Point / Depth of Fieldを前提にしたdepth-of-field系

Z camera depthをfocus modelとして扱うならDepth Blur、任意mapで直接blur量を描きたいならVari Blurが分かりやすくなります。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 92 pp.2126–2128で、3 inputs、Method、Quality、Blur Channel、Blur Size、Blur Limitを確認しました。
