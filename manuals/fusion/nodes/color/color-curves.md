---
title: Color Curves
description: RGB・YUV・HLS等のchannelをSpline LUTとして編集し、特定のinput valueだけを別output valueへ曲線でremapするNode。
doc_type: node
term_id: color-curves
term_short: 入力値→出力値の関係をSplineで編集するLUT型Color Node。
verification: partial
aliases: [Color Curves, CCv]
concepts: [image-data, color-adjustment, premultiplication]
nodes: [Color Curves]
node_family: color
controls: [Mode, Color Space, Color Channels, Spline Window, In, Out, Eyedropper, Match Reference, Pre-Divide/Post-Multiply]
inputs: [image, mask, image, mask]
outputs: [image]
tasks: [color-curves, tone-curve, match-reference]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-05"
---

# Color Curves

Color Curvesは、input valueとoutput valueの対応をSplineで編集するLUT型のColor Nodeです。

「0.5の明るさだけ少し上げる」「Blueのshadowだけ下げる」のように、値域を狙って非線形に補正できます。

## 入力

必須Inputのほか、Effect Mask、Reference Image、Match Maskを持ちます。

Reference ImageとMatch Maskは、別Imageの特定領域へcurveを合わせるMatch用途です。

## Color Space

RGBだけでなくYUV、YIQ、CMY、HLS等へ切り替えられます。

選択したColor Spaceに合わせて、編集対象channelの名前も変わります。

## Spline Window

横軸がinput、縦軸がoutputです。

初期状態は0→0、1→1の直線です。中間へpointを追加して上へ動かすと、その値域が明るくなります。

EyedropperでViewer上のpixelを選ぶと、その値に対応するpointをcurveへ追加できます。

## Animation / Match

Modeでcurve animationを有効にできます。

Reference Imageを使う場合はMatch Reference、Sample Reference、Number of Samples、Match Rectangle等でreferenceの値分布へ合わせます。

## Alphaを持つImage

Pre-Divide / Post-Multiplyを使うと、premultiplied Alphaの半透明edgeでRGB補正が不自然になりにくくなります。

## Hue Curvesとの違い

- **Color Curves** — input value → output valueをchannelごとにremap
- **Hue Curves** — 横軸がHueで、特定色域だけを狙う

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 93 pp.2168–2171で、4入力、Color Space、Spline、Eyedropper、Reference Match、Pre-Divide/Post-Multiplyを確認しました。
