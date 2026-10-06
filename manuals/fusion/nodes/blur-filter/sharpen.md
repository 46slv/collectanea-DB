---
title: Sharpen
description: convolution filterで2D Imageのdetailを強調し、RGBA channel・X/Y別Amount・Clipping Modeを直接調整する基本Sharpen Node。
doc_type: node
term_id: sharpen
verification: partial
aliases: [Sharpen, Shrp]
concepts: [image-data, filtering, domain-of-definition]
nodes: [Sharpen]
node_family: blur-filter
controls: [Color Channels, Lock X/Y, Amount, Clipping Mode, Blend]
inputs: [image, mask]
outputs: [image]
tasks: [sharpen, enhance-detail]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# Sharpen

Sharpenは、2D <Term id="image">Image</Term>へconvolution filterを適用し、detail / edge contrastを直接強くする基本Nodeです。

「ぼけたedgeを少し締める」ような単純なsharpeningでは、Unsharp Maskより設定が少なく直接的です。

## 入力

Inputと任意Effect Maskを持ちます。

Maskを使うと顔や文字等、必要な範囲だけをsharpenできます。

## Color Channels

R / G / B / Aのうち、どのchannelを処理するか選びます。

Controls tabのchannel選択は処理**前**に使われ、外したchannelは計算自体をskipします。

## Lock X/Y / Amount

Lock X/Yが有効なら水平・垂直を同じAmountでsharpenします。

解除するとX / Yを別々に設定できます。

## Clipping Mode

Frame / Domain / NoneからDoD edgeの扱いを選びます。

edge付近のfilter resultが不自然な場合はAmountだけでなくClipping Modeも確認します。

## Blend

sharpen済みImageと元Imageをmixします。

強くsharpenしてからBlendで戻す方法と、Amount自体を下げる方法では調整意図が異なるため、役割を分けます。

## Unsharp Maskとの違い

- **Sharpen** — 単純なconvolution sharpen
- **Unsharp Mask** — blurとの差分からedge detailを抽出し、Size / Gain / Thresholdで選択的に強調

low-contrast detailをThresholdで選別したい場合はUnsharp Maskが向きます。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 92 pp.2119–2121で、Image / Effect Mask、RGBA、Lock X/Y、Amount、Clipping Mode、Blendを確認しました。
