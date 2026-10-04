---
title: "File LUT"
description: "外部LUTを読み適用。"
doc_type: node
term_id: "file-lut"
term_short: "File LUTは、外部LUTを読み適用。"
verification: partial
aliases: ["File LUT", "FLU"]
concepts: ["image-data"]
nodes: ["File LUT"]
node_family: "lut"
inputs: ["image"]
outputs: ["image"]
tasks: ["apply-lut"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-03"
---
# File LUT

File LUTは、外部fileに保存された1D / 3D LUTを2D Imageへ適用するNodeです。

Color CurvesのようにFusion内Splineでcurveを作るのではなく、LUT fileのpathを参照します。

## 入力

- Input: LUTを適用する2D Image
- Effect Mask: LUTを適用する範囲

## LUT File

FusionのLUT / ALUT、DaVinci ResolveのCUBE等、supported LUT fileを読み込みます。fileが見つからない / 読めない場合はConsoleへerrorが出ます。

## Pre-Gain / Post-Gain

Pre-GainはLUT前、Post-GainはLUT後のGainです。

LUTでhighlightがclipする場合に、LUT前だけ少し下げる等の調整ができます。

## Color Space

LUTをRGB / YUV / HLS / HSV等のどのspaceへ適用するかを選びます。

## Pre-Divide / Post-Multiply

premultiplied Alpha素材では、LUT前にRGBをAlphaで割り、処理後に再度Alphaを掛けます。

## 最小構成

    MediaIn → File LUT → Color / MediaOut

camera-originalをworking spaceへ変換するLUTとして前段へ置く場合と、look LUTとして後段へ置く場合があります。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 107 pp.2454–2455で、2 inputs、LUT File、Pre/Post Gain、Color Space、Pre-Divide/Post-Multiplyを確認しました。
