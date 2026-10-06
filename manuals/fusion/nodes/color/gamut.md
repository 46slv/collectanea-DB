---
title: Gamut
description: Source / Outputのcolor spaceとGammaを指定し、gamut変換・Gamma remove/add・linear workflowの入出力変換を行うNode。
doc_type: node
term_id: gamut
term_short: SourceとOutputのgamut / gammaを変換するColor Management Node。
verification: partial
aliases: [Gamut, Gmt]
concepts: [image-data, color-space, premultiplication]
nodes: [Gamut]
node_family: color
controls: [Source Space, Output Space, Remove Gamma, Add Gamma, Pre-Divide/Post-Multiply]
inputs: [image, mask]
outputs: [image]
tasks: [color-space, linear-workflow, gamut-convert]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-05"
---

# Gamut

Gamutは、入力Imageをどのcolor space / gammaとして解釈し、どのspaceへ変換するかを指定するNodeです。

Fusion StudioでLoader直後にlinearizeし、Saver直前にdelivery spaceへ戻すようなcolor managementに使います。

## Source Space

source Imageのgamutを指定します。

Remove Gammaを併用すると、source gammaを外してlinearへ変換できます。

## Output Space

最終的に変換したいgamutを指定します。

linear compの最後でdelivery gamutへ戻す場合に使います。

## Remove / Add Gamma

gamut conversionとは別に、gamma curveだけを外す / 加えることができます。

「gamutを変えること」と「transfer curveを変えること」を分けて操作します。

## Pre-Divide / Post-Multiply

premultiplied Alphaを持つImageをcolor transformする場合、透明edgeのRGB / Alpha関係を保つために使います。

## CST / OCIOとの違い

- **Gamut** — Fusionの内蔵space / gammaを明示して変換
- **Color Space Transform** — Resolve Color Managementと同系統のtransform / tone mapping / gamut mapping
- **OCIO Color Space** — OCIO configを基準に変換

pipelineのauthorityに合わせて選びます。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 93 pp.2185–2187で、Source / Output Space、Remove / Add Gamma、Pre-Divide/Post-Multiplyを確認しました。
