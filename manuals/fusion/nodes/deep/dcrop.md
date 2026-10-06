---
title: dCrop
description: Deep ImageのsampleをMinimum / Maximum ZとMaskで選別し、指定depth rangeだけを残すまたはrange外を残すNode。
doc_type: node
term_id: dcrop
verification: partial
aliases: [dCrop, dCr]
concepts: [deep-image, depth, mask-data]
nodes: [dCrop]
node_family: deep
controls: [Use Minimum Z, Minimum Z, Use Maximum Z, Maximum Z, Keep Outside Depth Range]
inputs: [deep-image, mask]
outputs: [deep-image]
tasks: [deep, crop-depth, isolate-depth]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# dCrop

dCropは、<Term id="deep-image">Deep Image</Term>内のsampleをZ depthで選別するNodeです。

画面の矩形を切る通常Cropではなく、cameraからの奥行きrangeでDeep sampleを残す / 除外します。

## 入力

Deep Image inputと任意Effect Maskを受け取ります。

Maskはpixel範囲を限定し、Z controlsはそのpixel内にあるDeep sampleのdepth rangeを限定します。

## Depth Crop

### Use Minimum Z / Minimum Z

最小depthを有効にし、それより手前 / 奥のsampleをrange条件で選別します。

ViewerからSampleしてZ値を取得できます。

### Use Maximum Z / Maximum Z

最大depthを有効にします。

MinimumとMaximumを両方使うと、特定のdepth sliceだけを残せます。

### Keep Outside Depth Range

選択を反転し、設定したrangeの外側sampleを残します。

## 最小構成

```text
Deep EXR → dCrop → dMerge / Deep to Image
```

## 運用例

background renderのうち、ある奥行きより遠いDeep sampleだけを別処理へ回したい場合:

1. Use Minimum / Maximum Zを有効にします。
2. Viewer Sampleで境界depthを取得します。
3. Deep to Imageで一度確認します。
4. 必要ならKeep Outside Depth Rangeで反転します。

## 通常Cropとの違い

- **Crop** — 2D canvas / pixel rectangle
- **dCrop** — Deep sampleのZ range

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 95 pp.2237–2238で、Deep / Effect Mask input、Minimum / Maximum Z、Sample、Keep Outside Depth Rangeを確認しました。
