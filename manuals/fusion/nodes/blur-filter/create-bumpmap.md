---
title: Create Bump Map
description: grayscale height mapからRGB bump vector imageを生成し、Filter Size・Height Source・Wrap Mode・Height Scaleでsurface detail用mapを作るNode。
doc_type: node
term_id: create-bumpmap
verification: partial
aliases: [Create Bump Map, CBu]
concepts: [image-data, normal-map, texture]
nodes: [Create Bump Map]
node_family: blur-filter
controls: [Filter Size, Height Source, Clamp Normal.Z, Wrap Mode, Height Scale, Bump Map Texture Depth]
inputs: [image, mask]
outputs: [image]
tasks: [bump-map, height-map, texture-processing]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# Create Bump Map

Create Bump Mapは、grayscaleのheight informationから**RGBにnormal-like bump vectorを格納した2D Image**を作るNodeです。

Bump Map Material Nodeのように直接3D materialへ変換するのではなく、後段でBlurやColor処理もできる通常Imageとしてbump dataを出力します。

## 入力

### Input

height sourceになる2D Imageです。

Fast Noise、grayscale texture、painted height map等を使えます。

### Effect Mask

bump map作成を適用する範囲を限定します。

## Height Source

どのchannelをheight valueとして読むかを選びます。

sourceがRGB Imageでも、heightとして使うchannelを明示できます。

## Filter Size

3×3または5×5の近傍pixelからgradientを計算します。

大きいfilterはより広い近傍を使うため、render costも増えます。

## Height Scale

height differenceをどれだけ強くbump vectorへ反映するかを調整します。

上げるほどsurface detailが強く見えるmapになります。

## Wrap Mode

Image edgeをどう扱うか決めます。

seamless tiling textureで端同士をつなげたい場合に重要です。

## Clamp Normal.Z

output bump textureのblue / Z成分の下限側をclipします。

## Texture Depth

output Imageのbit depthを指定します。

後段処理や3D material workflowに必要なprecisionへ合わせます。

## Height / Bump / Normalの違い

Manualでは次の区別をしています。

- **Height Map** — 1 pixelのheightをgrayscaleで持つ
- **Bump Map** — existing normalを変化させるvectorをRGBへ持つ
- **Normal Map** — surface normalそのものをRGBへ持つ

Create Bump Mapはheight → bump vector Imageの変換です。

## 最小構成

```text
Fast Noise / Height Image → Create Bump Map → 2D processing / Bump material
```

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 99 pp.2328–2329で、Image / Mask input、Filter Size、Height Source、Clamp Normal.Z、Wrap Mode、Height Scale、Texture Depthと用語区分を確認しました。
