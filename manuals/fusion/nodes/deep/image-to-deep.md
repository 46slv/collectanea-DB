---
title: Image to Deep
description: 通常2D Imageへ指定Z・Z Scale / Offsetを付与し、dMerge等へ渡せるDeep Imageへ変換するNode。
doc_type: node
term_id: image-to-deep
verification: partial
aliases: [Image to Deep, ITD]
concepts: [image-data, deep-image, depth]
nodes: [Image to Deep]
node_family: deep
controls: [Specify Z, Z Scale, Z Offset, Center X/Y]
inputs: [image]
outputs: [deep-image]
tasks: [deep, convert-domain, insert-2d]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# Image to Deep

Image to Deepは、通常の2D <Term id="image">Image</Term>へdepth情報を付け、<Term id="deep-image">Deep Image</Term>としてdMerge等へ渡すNodeです。

2D graphicやrender elementをDeep compositeの特定Z位置へ挿入したい場合に使います。

## 入力 / 出力

1つの2D Image inputを受け、Deep Imageを出力します。

```text
2D Image → Image to Deep ─┐
                           ├─ dMerge → Deep to Image
Deep EXR ─────────────────┘
```

## Specify Z

有効にするとcurrent Z depthを明示的に指定します。

2D elementを「cameraからどの距離へ置くか」を決める基本Controlです。

## Z Scale

sourceに既存depth情報がある場合、そのdepth rangeを拡大 / 圧縮します。

## Z Offset

depth全体を前後へ移動します。

## Center X/Y

2D ImageをDeep canvas上でXY位置調整します。

## 注意点

Image to Deepを通したからといって、単一の2D Imageから本物のmulti-layer depth構造が自動生成されるわけではありません。

与えたZ情報を持つDeep sampleとして扱えるようにするNodeです。

## Deep to Imageとの関係

- **Image to Deep** — 2D → Deep
- **Deep to Image** — Deep → 2D flatten

往復しても、flatten前の複数sample構造が自動復元されるわけではありません。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 95 pp.2252–2253で、2D Image input、Deep conversion、Specify Z、Z Scale、Z Offset、Center X/Yを確認しました。
