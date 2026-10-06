---
title: dColorCorrector
description: Deep Imageのsample構造を保ったまま、Shadows・Midtones・Highlights・Master別のColors / Levels / Histogram / Suppress補正を行うColor Node。
doc_type: node
term_id: dcolorcorrector
verification: partial
aliases: [dColorCorrector, dCC]
concepts: [deep-image, color-adjustment, mask-data]
nodes: [dColorCorrector]
node_family: deep
controls: [Correction, Range, Color Wheel, Hue, Saturation, Contrast, Gain, Lift, Gamma, Brightness, Levels, Histogram, Suppress, Ranges, Histogram Proxy Scale, Process Order, Apply Mask Inverted]
inputs: [deep-image, mask]
outputs: [deep-image]
tasks: [deep, color-correct, histogram]
level: advanced
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# dColorCorrector

dColorCorrectorは、<Term id="deep-image">Deep Image</Term>のsample構造を保ったまま色補正するNodeです。

通常のColor Correctorと似たCorrection / Ranges / Options構造を持ちますが、input / outputはDeep Imageです。

## 入力

### Input

黄色の必須inputです。Deep Imageを接続します。

### Effect Mask

青色の任意inputです。補正範囲をMaskで限定します。Effect Maskは処理後に適用されます。

## Correction

Correction tabでは4種類のmethodを切り替えます。

- Colors
- Levels
- Histogram
- Suppress

### Range

Shadows / Midtones / Highlights / Masterを選びます。

各Rangeの設定は独立しており、Masterは他Rangeの補正後に適用されます。

### Colors

Color Wheel、Hue、Saturation、Contrast、Gain、Lift、Gamma、Brightness等を使います。

### Levels

black / white pointとGammaをHistogramと合わせて調整します。

### Histogram

input / reference / output Histogramを比較し、equalizationやmatchingを行います。

### Suppress

特定色成分を抑えます。

## Ranges tab

Shadows / Midtones / Highlightsの境界をSplineで定義します。

Viewerへrange matteを表示し、必要ならそのrangeをoutputとして使えます。

## Options

Histogram Proxy ScaleでHistogram精度を調整し、Process OrderでGammaとLevelsの順序を選びます。

Apply Mask InvertedでMask全体を反転できます。

## 最小構成

```text
Deep EXR → dColorCorrector → dMerge / Deep to Image
```

## Color Correctorとの違い

- **Color Corrector** — 通常2D Image
- **dColorCorrector** — Deep Image sampleを保持

Deep compの途中でflattenしたくない場合はdColorCorrectorを使います。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 95 pp.2227–2236で、Deep Input / Effect Mask、Correction 4 method、Range、Ranges / Options、Histogram、Process Order等を確認しました。

Studio限定Deep toolsetです。実機performanceと全default / rangeは未確認です。
