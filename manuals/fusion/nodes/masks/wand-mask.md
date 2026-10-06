---
title: Wand Mask
description: Viewerでsampleしたpixel colorから、連続してつながる近似色領域をRange / Soft Rangeで拡張しMask化するcolor-selection Node。
doc_type: node
term_id: wand-mask
verification: partial
aliases: [Wand Mask, Wnd]
concepts: [mask-data, image-data, color-selection]
nodes: [Wand Mask]
node_family: masks
controls: [Level, Filter, Soft Edge, Paint Mode, Invert, Selection Point, Color Space, Channel, Range, Range Soft Edge]
inputs: [image, mask]
outputs: [mask]
tasks: [create-mask, select-color, isolate-color]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# Wand Mask

Wand Maskは、Viewer上の1 pixelをsampleし、その色と近く、**連続してつながっている領域**を広げながら<Term id="mask">Mask</Term>にするNodeです。

Adobe PhotoshopのMagic Wandに近い選択方法です。色補正したい領域が明確な色でまとまっている場合に向きます。

## 入力

### Input

オレンジ色の2D <Term id="image">Image</Term> inputです。color sampleと領域探索のsourceです。

### Effect Mask

青色の任意Mask inputです。Wand結果と別MaskをPaint Modeで組み合わせます。

## Selection Point

Viewerにcrosshairとして表示されます。

その位置のpixel colorを初期sampleとして、周囲へ連続している近似色pixelを探索します。

Selection Pointは手動移動だけでなく、Tracker、Path、Expression等へ接続できます。

## Color Space

色の距離をどのspaceで判定するか選びます。

21.1 ManualではRGB、YUV、HLS、LABを確認できます。

## Channel

All color、Alpha、または個別channelを選びます。

個別channel名は選択Color Spaceによって変わり、RGBならR/G/B、YUVならY/U/Vになります。

## Range

sample colorからどの程度離れた色まで100% Maskへ含めるかを決めます。

0ではsampleと同色のpixelだけが完全選択対象です。上げるほど似た色まで含めます。

## Range Soft Edge

Range外側の近似色をgray Maskとして段階的に含めます。

hard thresholdではなくcolor selectionにfalloffを作れます。

## Soft Edgeとの違い

- **Range Soft Edge** — 色の近さに対するsoftness
- **Soft Edge** — 生成済みMask shapeの空間edge feather

何がsoftになっているかを分けて調整します。

## 最小構成

```text
Image → Wand Mask → Color Corrector Effect Mask
```

## Bitmap / Rangesとの違い

- **Bitmap Mask** — channel value全体からMaskを作る
- **Ranges Mask** — tonal rangeをSplineで選ぶ
- **Wand Mask** — 1点から連続する近似色領域をgrowする

同色が画面内の離れた場所にもあるが、その一部だけを選びたい場合はWandのconnected-region性が有効です。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 108 pp.2496–2499で、Image / Effect Mask inputs、connected color selection、Selection Point、Color Space、Channel、Range、Range Soft Edgeを確認しました。
