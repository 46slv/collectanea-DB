---
title: dColorCorrector
description: Deep Imageのdepth sample構造を保持したまま、Shadows・Midtones・Highlights・MasterへColor Corrector相当の補正を適用するNode。
doc_type: node
term_id: dcolorcorrector
verification: partial
aliases: [dColorCorrector, dCC]
concepts: [deep-image, color-adjustment, premultiplication]
nodes: [dColorCorrector]
node_family: deep
controls: [Range, Color Wheel, Hue, Saturation, Contrast, Gain, Lift, Gamma, Brightness, Levels, Histogram, Suppress, Ranges, Histogram Proxy Scale, Process Order]
inputs: [deep, mask]
outputs: [deep]
tasks: [deep, color-correct, shadows, midtones, highlights]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# dColorCorrector

dColorCorrectorは、<Term id="deep-image">Deep Image</Term>のsample構造を保ったままColor correctionを行うNodeです。

通常のColor Correctorに近いShadows / Midtones / Highlights / Master、Colors / Levels / Histogram / SuppressをDeep domainで扱えます。

## 入力 / 出力

Deep Imageと任意Effect Maskを受け取り、Color補正後のDeep Imageを出力します。

```text
Deep EXR → dColorCorrector → dMerge → Deep to Image
```

## Range

補正対象をShadows / Midtones / Highlights / Masterから選びます。

各RangeのControlは独立しており、Masterはrange別補正の後へ全体補正として適用されます。

## Colors

Color Wheel、Hue、Saturation、Contrast、Gain、Lift、Gamma、Brightness等を使います。

通常のColor Correctorと同様、Gain / Lift / Gammaはtone rangeへの効き方が異なります。

## Levels / Histogram / Suppress

- Levels — black / white pointとGammaを調整
- Histogram — histogramのdistributionを使う補正
- Suppress — 特定色成分を抑える

## Ranges

Shadows / Midtones / Highlightsの範囲をSplineで定義します。

現在のrangeを白黒表示し、どのpixelが補正対象か確認できます。

## Options

Histogram Proxy Scale、Process Order、Mask Invert等を持ちます。

Deep sampleを2DへflattenせずColor correctionを済ませたい場合に使います。

## 通常Color Correctorとの違い

- **dColorCorrector** — Deep Image domainを保持
- **Color Corrector** — 2D Image

見た目のColor controlは近くても入力domainが違います。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 95 pp.2227–2236で、Deep input、Color Corrector系Controls、Ranges / Optionsを確認しました。Deep Image toolsetはStudio Version Onlyです。
