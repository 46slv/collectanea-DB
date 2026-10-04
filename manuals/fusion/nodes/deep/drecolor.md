---
title: dRecolor
description: Deep Imageのdepth sampleへ2D RGB / RGBA Imageの色を対応づけ、sample構造を保ったままrecolorするNode。
doc_type: node
term_id: drecolor
verification: partial
aliases: [dRecolor, dRc]
concepts: [deep-image, image-data, alpha]
nodes: [dRecolor]
node_family: deep
controls: [Center X/Y, Target Input Alpha, Drop Input Zero Alpha]
inputs: [deep-image, image]
outputs: [deep-image]
tasks: [deep, recolor, texture]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# dRecolor

dRecolorは、<Term id="deep-image">Deep Image</Term>のsampleへ、通常2D <Term id="image">Image</Term>のRGB / RGBA値を使って色を付け直すNodeです。

Deep側の奥行きsampleを保持しつつ、beauty / color sourceだけを別Imageから与えたい場合に使います。

## 入力

### Depth

Deep Image inputです。

### Color

緑色の2D RGB / RGBA Image inputです。

```text
Deep data ──┐
            ├─ dRecolor → dMerge / Deep to Image
2D Color ───┘
```

## Center X/Y

Color inputをDeep Imageに対してXY方向へ位置合わせします。

Deepと2D beautyが同じframe / resolutionでない場合、まずalignmentを確認します。

## Target Input Alpha

Color inputのAlphaも使い、Deep sampleのtransparencyへ影響させます。

無効時はRGBだけをrecolorへ使います。

## Drop Input Zero Alpha

Color inputのAlphaが0のpixelをrecolor計算から除外します。

透明領域がDeep sampleへ不要なRGBを持ち込むのを避けたい場合に使います。

## 使う場面

外部rendererからDeep dataとbeauty / multi-layer RGBを別々に受け取り、depthを維持したまま色だけ差し替える構成で使えます。

## Deep to Image後のColor補正との違い

Deep to Image後に2D Color Correctorを使うと、すでにsampleはflatten済みです。

dRecolorはDeep sampleを維持したまま2D color sourceを対応づけます。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 95 pp.2247–2248で、Depth / Color inputs、Center、Target Input Alpha、Drop Input Zero Alphaを確認しました。
