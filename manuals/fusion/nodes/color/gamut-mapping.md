---
title: Gamut Mapping
description: Tone MappingとSaturation Mappingを使い、dynamic range / gamut差の大きいsourceをclipしすぎずtargetへ収めるNode。
doc_type: node
term_id: gamut-mapping
term_short: Tone / saturationを再配置して異なるdynamic rangeやgamutへ収めるNode。
verification: partial
aliases: [Gamut Mapping, GMp]
concepts: [image-data, color-space, tone-mapping]
nodes: [Gamut Mapping]
node_family: color
controls: [Gamma, Tone Mapping Method, Max Input Luminance, Max Output Luminance, Gamut Mapping Method, Saturation Knee, Saturation Max]
inputs: [image, mask]
outputs: [image]
tasks: [tone-map, gamut-map, hdr-sdr]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-05"
---

# Gamut Mapping

Gamut Mappingは、sourceとtargetでdynamic rangeやgamutが大きく異なるときに、luminanceとsaturationを再配置してoutputへ収めるNodeです。

単純clipではなく、highlight roll-offやsaturation compressionを選べます。

## Gamma

入力clipがどのGammaで表現されているかを指定します。

## Tone Mapping Method

None / Clip / Simple / Luminance Mapping / DaVinci / Saturation Preserving等から、luminanceをどうoutput rangeへ収めるか選びます。

HDR→SDRのように最大輝度差が大きい変換では、Max Input / Output Luminanceも判断材料になります。

## Gamut Mapping Method

Saturation Mappingを使うと、Saturation Kneeから上の高彩度領域をSaturation Maxへ向けて圧縮します。

Clipは境界を越えた値を切り捨てます。

## Gamut Limiterとの違い

Gamut Mappingは自然なroll-offを狙う変換、Gamut Limiterは最終QC境界を越えさせないhard limitです。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 93 pp.2143–2146で、Gamma、Tone Mapping、luminance controls、Gamut MappingとSaturation Mappingを確認しました。
