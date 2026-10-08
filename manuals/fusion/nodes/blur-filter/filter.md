---
title: Filter
description: Relief・Emboss・Noise・Defocus・Sobel・Laplacian・Grain等の標準filterをmenuから選び、edge matteやstylizeを作るmulti-purpose Node。
doc_type: node
term_id: filter
verification: partial
aliases: [Filter, Fltr]
concepts: [image-data, filtering, convolution]
nodes: [Filter]
node_family: blur-filter
controls: [Filter Type, Color Channels, Power, Angle, Median, Seed, Animated]
inputs: [image, mask]
outputs: [image]
tasks: [filter, edge-detect, stylize, grain]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# Filter

Filterは、複数の標準image filterを1 Nodeから選ぶmulti-purpose Filter Nodeです。

edge detection、emboss、noise / grain、defocus等、目的の異なるalgorithmがFilter Typeにまとめられています。

## 入力

2D Imageと任意Effect Maskを受けます。

## Filter Type

21.1 Manualで説明される代表例:

- **Relief** — metalへ押し込んだようなrelief
- **Emboss Over** — 元Imageへembossを重ねる
- **Noise** — uniform noise
- **Defocus** — blur
- **Sobel** — edge detection
- **Laplacian** — Sobelより細かいedge detection
- **Grain** — film grain風noise
- **Median** — neighborhood rankを使うmedian系processing

Sobel / Laplacianはedge matte作成に使えます。

## Power

filter effectの強さです。

Sobel / Laplacianには適用されないとManualに記載されています。

## Angle

Relief / Embossのlight / direction感を45° stepで変更します。

## Median

Median typeで選択rankを調整します。

0.5がtrue median、0がminimum、1がmaximumです。

## Seed / Animated

Noise / Grain typeでrandom patternを制御します。

Animatedを有効にするとframeごとにpatternを変え、無効にするとstatic noiseになります。

## 運用例

keyed foregroundのedgeだけをglowさせる場合:

```text
Foreground → Filter (Sobel) → edge matte
                           ↓
                       Glow Mask
```

Image本体へFilter結果を直接使わず、edge detectionを別EffectのMask sourceにする構成です。

## Custom Filterとの違い

Filterはpreset algorithmを選びます。

kernel weightを自分で設計する必要がある場合は[Custom Filter](./custom-filter)を使います。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 99 pp.2338–2341で、Image / Effect Mask、Filter Type、RGBA、Power、Angle、Median、Seed、Animatedを確認しました。
