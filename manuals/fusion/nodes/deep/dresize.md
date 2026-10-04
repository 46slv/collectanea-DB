---
title: dResize
description: Deep ImageのWidth / Heightを変更し、depth sampleを保持したまま出力解像度を変えるNode。
doc_type: node
term_id: dresize
verification: partial
aliases: [dResize, dRz]
concepts: [deep-image, resolution]
nodes: [dResize]
node_family: deep
controls: [Width, Height]
inputs: [deep]
outputs: [deep]
tasks: [deep, resize, resolution]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# dResize

dResizeは、<Term id="deep-image">Deep Image</Term>のWidth / Heightを変更するNodeです。

通常のResizeへflattenする前に、Deep domainのままresolutionを変えます。

## 入力 / 出力

1つのDeep Imageを受け、resize後のDeep Imageを出力します。

## Width / Height

outputの横・縦sizeを設定します。

## dTransformとの違い

- **dResize** — Imageのpixel dimensionsを変更
- **dTransform** — Deep sampleのXY配置やZ rangeを変形

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 95 p.2249で、Deep input、Width、Heightを確認しました。
