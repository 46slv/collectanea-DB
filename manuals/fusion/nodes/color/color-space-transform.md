---
title: Color Space Transform
description: Input / Output Color SpaceとGammaを指定し、Resolve Color Management系のmathでtone / gamut mappingも含む変換を行うNode。
doc_type: node
term_id: color-space-transform
term_short: RCM系のmathでInput spaceからOutput spaceへ変換するNode。
verification: partial
aliases: [Color Space Transform, CST]
concepts: [image-data, color-space, tone-mapping]
nodes: [Color Space Transform]
node_family: color
controls: [Input Color Space, Input Gamma, Output Color Space, Output Gamma, Tone Mapping, Gamut Mapping, Apply Forward OOTF, Apply Inverse OOTF, Use White Point Adaptation]
inputs: [image, mask]
outputs: [image]
tasks: [color-space, tone-map, gamut-map]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-05"
---

# Color Space Transform

Color Space Transformは、Input Color Space / GammaからOutput Color Space / GammaへImageを変換するNodeです。

LUTを参照するのではなく、Resolve Color Managementと同系統のmathを使い、dynamic rangeやgamut差が大きい場合のtone / gamut mappingも扱えます。

## Input / Output

4つのmenuでInput Color Space、Input Gamma、Output Color Space、Output Gammaを指定します。

Swapで入力と出力を入れ替え、逆方向のtransformをすばやく設定できます。

## Tone Mapping

HDR→SDR等、dynamic range差が大きい変換でhighlight / shadowをoutput rangeへ収めます。

None / Clip / Simple / Luminance Mapping / DaVinci / Saturation Preserving等のmethodがあります。

## Gamut Mapping

Input gamutとOutput gamutの差を処理します。

None、Saturation Mapping、Clip等を使い、out-of-gamut colorをどう収めるか決めます。

## Advanced

Forward / Inverse OOTFとWhite Point Adaptationを切り替えられます。

scene-referred / display-referredの変換や、異なるwhite pointを持つspace間の変換で使います。

## ACES Transformとの違い

ACES workflowでは、Academy指定IDT / ODTを使う[ACES Transform](./aces-transform)が正規の選択です。CSTは汎用のspace / gamma変換として使います。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 93 pp.2138–2141で、4 space/gamma menu、Tone Mapping、Gamut Mapping、OOTF、White Point Adaptationを確認しました。
