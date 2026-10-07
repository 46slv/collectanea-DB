---
title: dResize
description: Deep Imageのwidth / heightを変更し、depth sampleを保持したまま画像解像度をresizeするNode。
doc_type: node
term_id: dresize
verification: partial
aliases: [dResize, dRz]
concepts: [deep-image, resolution]
nodes: [dResize]
node_family: deep
controls: [Width, Height]
inputs: [deep-image]
outputs: [deep-image]
tasks: [deep, resize, resolution]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# dResize

dResizeは、<Term id="deep-image">Deep Image</Term>のwidth / heightを変更するNodeです。

通常Resizeと同様にcanvas resolutionを変えますが、outputはDeep Imageのままです。

## 入力 / 出力

1つのDeep Image inputを受け、resize後のDeep Imageを出力します。

```text
Deep EXR → dResize → dMerge / Deep to Image
```

## Width / Height

output Deep Imageの幅と高さを設定します。

21.1 ManualでdResize固有Controlとして記載されているのはこの2項目です。

## dTransformとの違い

- **dResize** — Deep Imageのresolution自体を変更
- **dTransform** — canvasを保ちながらXY位置・SizeやZ depthを変形

通常2DのResizeとTransformの違いと同様に、「output resolutionを変えたいか」で選びます。

## 注意点

Deep dataは通常2D Imageよりmemory量が大きくなりやすいため、不要に大きいresolutionへresizeすると処理負荷が増える可能性があります。

具体的なmemory倍率やperformanceはsourceとsample数に依存するため、ここでは固定値を示しません。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 95 pp.2249–2250で、Deep Image inputとWidth / Height controlsを確認しました。
