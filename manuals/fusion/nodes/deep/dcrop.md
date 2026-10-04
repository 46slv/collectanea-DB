---
title: dCrop
description: Deep ImageのsampleをMinimum / Maximum ZとEffect Maskで切り分け、depth range内外だけを後段へ渡すNode。
doc_type: node
term_id: dcrop
verification: partial
aliases: [dCrop, dCr]
concepts: [deep-image, depth, mask-data]
nodes: [dCrop]
node_family: deep
controls: [Use Minimum Z, Minimum Z, Use Maximum Z, Maximum Z, Keep Outside Depth Range]
inputs: [deep, mask]
outputs: [deep]
tasks: [deep, crop-depth, isolate-depth]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# dCrop

dCropは、<Term id="deep-image">Deep Image</Term>のsampleをZ depth rangeで切り分けるNodeです。

2D Cropのようにframe rectangleを切るのではなく、cameraからのdepthでsampleを残す / 除外します。

## 入力

Deep Imageと任意Effect Maskを受け取ります。

## Depth Crop

- Use Minimum Z / Minimum Z
- Use Maximum Z / Maximum Z
- Keep Outside Depth Range

で通過させるdepth範囲を決めます。

Keep Outside Depth Rangeは選択rangeを反転します。

## 最小構成

```text
Deep EXR → dCrop → dMerge
```

foreground付近のsampleだけ、background depthだけ等を分離して別処理へ渡す用途です。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 95 p.2237で、Deep / Effect Mask inputs、Minimum / Maximum Z、invert相当のKeep Outside Depth Rangeを確認しました。
