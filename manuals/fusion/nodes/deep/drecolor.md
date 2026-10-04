---
title: dRecolor
description: 通常の2D RGB/RGBA Imageを使ってDeep Image sampleのColorと必要に応じてAlphaを置き換えるNode。
doc_type: node
term_id: drecolor
verification: partial
aliases: [dRecolor, dRc]
concepts: [deep-image, image-data, alpha]
nodes: [dRecolor]
node_family: deep
controls: [Center X, Center Y, Target Input Alpha, Drop Input Zero Alpha]
inputs: [deep, image]
outputs: [deep]
tasks: [deep, recolor, combine-2d-deep]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# dRecolor

dRecolorは、<Term id="deep-image">Deep Image</Term>のsampleへ通常の2D RGB / RGBA Imageの色を適用するNodeです。

depth dataはDeep側から保ち、Colorを2D Image側から持ってくる構成です。

## 入力

- Depth — Deep Image
- Color — 2D RGB / RGBA Image

## Center X / Y

2D Color ImageをDeep Imageへ合わせる位置を調整します。

## Target Input Alpha

Color inputのAlphaもDeep sample transparencyへ反映します。

無効ならRGBだけを使います。

## Drop Input Zero Alpha

RGBA sourceでAlpha 0のpixelを無視し、Deep Imageへ影響させません。

## 最小構成

```text
Deep Image ─┐
            ├─ dRecolor → dMerge
2D Color ───┘
```

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 95 pp.2247–2248で、Deep + RGB inputs、Center、Target Input Alpha、Drop Input Zero Alphaを確認しました。
