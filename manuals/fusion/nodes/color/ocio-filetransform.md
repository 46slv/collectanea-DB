---
title: OCIO File Transform
description: OCIO経由でLUT / file transformを読み込み、Forward / ReverseとInterpolationを指定してImageへ適用するNode。
doc_type: node
term_id: ocio-filetransform
term_short: LUT等のfile transformをOCIO pipelineで適用するNode。
verification: partial
aliases: [OCIO File Transform, OCF]
concepts: [image-data, color-space, ocio, lut]
nodes: [OCIO File Transform]
node_family: color
controls: [LUT File, CCC ID, Direction, Interpolation]
inputs: [image, mask]
outputs: [image]
tasks: [ocio, lut]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-05"
---

# OCIO File Transform

OCIO File Transformは、LUT等のfile-based color transformをOpenColorIO経由でImageへ適用するNodeです。

OCIO Color Spaceがconfig内のspace変換を選ぶのに対し、こちらは外部LUT / transform fileを直接読み込みます。

## LUT File

適用するfileを選びます。

ASC CDL XML内の特定transformを選ぶ場合はCCC IDを使います。

## Direction

Forwardでtransformを適用、Reverseで逆向きのtransformを試みます。

不可逆なLUT / transformでは完全に元へ戻らない場合があります。

## Interpolation

LUT sample間の補間方法を選びます。

Nearestは高速、Bestは高品質側です。preview speedとfinal qualityで使い分けます。

## 最小構成

```text
Image → OCIO File Transform → Output
```

linear workflowでは、必要に応じて前段のGamut等でsourceを適切なworking stateへ揃えます。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 93 pp.2196–2197で、LUT File、CCC ID、Direction、Interpolation、OCIOの役割を確認しました。
