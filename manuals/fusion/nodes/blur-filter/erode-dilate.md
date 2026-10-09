---
title: Erode Dilate
description: 近傍pixelの明暗を広げ/縮め、negative Amountでerode・positive Amountでdilateしてmatteやedge thicknessを調整するNode。
doc_type: node
term_id: erode-dilate
verification: partial
aliases: [Erode Dilate, ErDl]
concepts: [image-data, mask-data, morphology]
nodes: [Erode Dilate]
node_family: blur-filter
controls: [Color Channels, Lock X/Y, Amount]
inputs: [image, mask]
outputs: [image]
tasks: [erode, dilate, matte, edge-thickness]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# Erode Dilate

Erode Dilateは、明るい領域を縮めたり広げたりして、matteやImage edgeのthicknessを調整するNodeです。

key matteを少し細くする、穴を埋める、bright shapeを広げる用途で使います。

## 入力

2D Imageと任意Effect Maskを受けます。

Alphaだけを処理したい場合はColor ChannelsでRGBを外し、Alphaだけを有効にします。

## Amount

- **negative** — Erode。bright領域を縮め、dark領域を広げる
- **positive** — Dilate。bright領域を広げ、dark領域を縮める

Amount = 0では変化しません。

ManualではAmountのscaleは入力Image width基準と説明されています。正確に1 pixel相当を指定する場合、widthに応じたnormalized値を使います。

## Lock X/Y

解除するとhorizontal / verticalで別Amountを使えます。

片方向だけmatteを広げたい場合に使います。

## 運用例

key edgeを少し内側へ縮める場合:

```text
Keyer → Erode Dilate → Matte Control / Merge
```

Alpha channelだけを選択し、negative Amountを少量使います。

## Blurとの違い

Soft EdgeやBlurはedgeを**ぼかす**処理です。

Erode Dilateはedge position / thicknessを**移動**させる処理なので、matte edge cleanupでは役割を分けます。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 99 pp.2337–2338で、Image / Effect Mask、RGBA selection、Lock X/Y、negative Erode / positive Dilate、normalized Amount scaleを確認しました。
