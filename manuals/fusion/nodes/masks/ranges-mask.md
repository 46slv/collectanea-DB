---
title: Ranges Mask
description: 2D ImageのShadows・Midtones・HighlightsをSplineで範囲定義し、指定channelのtone rangeからMaskを生成するNode。
doc_type: node
term_id: ranges-mask
verification: partial
aliases: [Ranges Mask, RNG]
concepts: [mask-data, image-data, tonal-range]
nodes: [Ranges Mask]
node_family: masks
controls: [Level, Soft Edge, Paint Mode, Invert, Channel, Shadows/Midtones/Highlights, Mini Spline Editor, Presets]
inputs: [image, mask]
outputs: [mask]
tasks: [create-mask, tonal-mask, isolate-luminance]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# Ranges Mask

Ranges Maskは、2D <Term id="image">Image</Term>のtoneをShadows / Midtones / Highlightsへ分け、その範囲から<Term id="mask">Mask</Term>を作るNodeです。

単純なluminance thresholdではなく、Splineで各rangeの境界とfalloffを調整できます。

## 入力

### Input

オレンジ色の2D Image inputです。Maskのsourceになります。

### Effect Mask

青色の任意Mask inputです。生成したRanges Maskと前段MaskをPaint Modeで組み合わせます。

## Channel

Mask作成に使うImage channelを選びます。

RGB、Alpha、Hue、Luminance、Saturation、Coverage等から選べます。Range selectionでは既定でLuminanceを使います。

## Shadows / Midtones / Highlights

どのtone rangeをMaskとして出力するか選びます。

- 白 — rangeに含まれる
- 黒 — range外
- gray — 部分的にrangeへ含まれる

## Mini Spline Editor

4つのSpline pointとBézier handleでShadowsとHighlightsの境界 / falloffを調整します。

MidtonesはShadowsとHighlightsの間として自動的に決まります。

### Presets

- Simple — linearなrange
- Smooth — より滑らかなfalloff

から基準shapeへ戻せます。

## 最小構成

```text
Image → Ranges Mask → Color Corrector Effect Mask
```

highlightだけ色を変える、shadowだけBlurする、といったtone-based isolationに使えます。

## Bitmap Maskとの違い

- **Bitmap Mask** — channel valueやthresholdからMask化
- **Ranges Mask** — Shadows / Midtones / HighlightsをSplineで設計

toneのtransitionを視覚的に調整したい場合はRangesが向きます。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 108 pp.2485–2489で、Image / Effect Mask inputs、Channel、tone range selection、Mini Spline、Simple / Smooth presetを確認しました。
