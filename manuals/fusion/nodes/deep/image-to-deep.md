---
title: Image to Deep
description: 通常の2D ImageへZ depth情報を付け、dMerge等でDeep compositingできるDeep Imageへ変換するNode。
doc_type: node
term_id: image-to-deep
verification: partial
aliases: [Image to Deep, ITD]
concepts: [deep-image, image-data, depth]
nodes: [Image to Deep]
node_family: deep
controls: [Specify Z, Z Scale, Z Offset, Center X, Center Y]
inputs: [image]
outputs: [deep]
tasks: [deep, convert-domain, add-depth]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# Image to Deep

Image to Deepは、通常の2D <Term id="image">Image</Term>へdepth情報を付け、<Term id="deep-image">Deep Image</Term>として扱えるようにするNodeです。

## 入力 / 出力

1つの2D Imageを受け、Deep Imageを出力します。

```text
2D Image → Image to Deep → dMerge
```

## Specify Z

指定Z depthを使うかを決めます。

2D elementをDeep scene内の特定depthへ置く用途です。

## Z Scale / Z Offset

- Z Scale — source depth rangeを拡大・圧縮
- Z Offset — cameraから見た前後位置を移動

SampleからViewer上の値を拾えます。

## Center X / Y

2D Imageの位置をDeep compositing空間内でずらします。

## 最小構成

```text
Graphic → Image to Deep ─┐
                         ├─ dMerge → Deep to Image
Deep EXR ────────────────┘
```

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 95 pp.2252–2253で、2D input、Specify Z、Z Scale / Offset、Center X/Yを確認しました。Deep Image toolsetはStudio Version Onlyです。
