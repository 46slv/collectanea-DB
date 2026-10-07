---
title: Hue Curves
description: Hueを横軸にしたSplineで、特定色域だけのHue・Saturation・Luminance・RGBやsuppressionを局所調整するNode。
doc_type: node
term_id: hue-curves
term_short: Hue範囲をSplineで狙って色を局所補正するNode。
verification: partial
aliases: [Hue Curves, HCv]
concepts: [image-data, color-adjustment, premultiplication]
nodes: [Hue Curves]
node_family: color
controls: [Mode, Color Channel Checkboxes, Spline Window, In, Out, Eyedropper, Pre-Divide/Post-Multiply]
inputs: [image, mask]
outputs: [image]
tasks: [hue-selective, color-correct]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-05"
---

# Hue Curves

Hue Curvesは、**横軸をHue**として、赤・黄・緑・cyan・青・magentaのどの色域へ補正を加えるかSplineで決めるNodeです。

特定の青だけSaturationを下げる、skin付近のHueだけ少し動かす、といったcolor-selectiveな補正に向きます。

## Spline Window

横方向がHue、縦方向が選択したpropertyの補正量です。

curveは色相環として循環しており、左端と右端はつながっています。

## Channel / property

Hue、Saturation、Luminance、個別color channel、suppression用curveを切り替えて編集します。

EyedropperでViewer上の色をsampleすると、選択Hueへcontrol pointを追加できます。

## Mode

No Animationではcurveが固定です。Animated Pointsを使うと、shot内で色が変化する場合にcurve自体をanimationできます。

## Pre-Divide / Post-Multiply

premultiplied Alpha素材の透明edgeを補正する場合に使います。

## Color Curvesとの違い

- **Hue Curves** — Hueの位置を基準に「どの色」を触るか決める
- **Color Curves** — channel valueを基準に「どの明るさ / 値」をremapする

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 93 pp.2188–2190で、Hue-based Spline、animation、Eyedropper、Pre-Divide/Post-Multiplyを確認しました。
