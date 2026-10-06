---
title: Color Gain
description: RGBA別のLift・Gamma・GainとSaturation / Hue、high・mid・lowの色Balanceを比較的軽量に調整するColor Node。
doc_type: node
term_id: color-gain
term_short: RGBAのLift/Gamma/Gainと色Balanceをまとめて調整するColor Node。
verification: partial
aliases: [Color Gain, Clr]
concepts: [image-data, color-adjustment]
nodes: [Color Gain]
node_family: color
controls: [Lock R/G/B, Gain RGBA, Lift RGBA, Gamma RGBA, Saturation, Balance, Hue]
inputs: [image, mask]
outputs: [image]
tasks: [color-correct, channel-balance]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-05"
---

# Color Gain

Color Gainは、RGBA別のLift / Gamma / Gainを中心に、Saturation、Hue、high / mid / lowの色Balanceをまとめて調整するNodeです。

Color Correctorより機能を絞った構成で、単純なchannel balanceやtone補正を短く組みたい場合に向きます。

## 入力

2D Imageと任意Effect Maskを受け、補正後の2D Imageを出力します。

## Gain tab

- **Gain RGBA** — bright側へ強く効く乗算
- **Lift RGBA** — dark側へ強く効く補正
- **Gamma RGBA** — black / whiteを保ちつつmidtoneを動かす
- **Lock R/G/B** — RGBをまとめて動かす

AlphaはRGB lockとは独立して調整できます。

## Balance tab

opposite color pairを使い、high / mid / lowごとに色かぶりを調整します。

単なるHue rotationではなく、明るさ帯ごとにtintを変えたい場合に使います。

## Saturation / Hue

Saturationで色の強さ、Hueで全体の色相を回します。

## Color Correctorとの違い

Color CorrectorはRange、Histogram、Suppress、Reference Matchまで含む総合Nodeです。Color Gainはより小さい役割へ絞りたい場合の候補です。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 93 pp.2171–2175で、Image / Effect Mask、Lift / Gamma / Gain、Balance、Saturation、Hueを確認しました。
