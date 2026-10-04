---
title: Unsharp Mask
description: blurとの差分からedge detailを抽出し、Size・Gain・Thresholdで低contrast領域を除外しながらselective sharpeningするNode。
doc_type: node
term_id: unsharp-mask
verification: partial
aliases: [Unsharp Mask, USM]
concepts: [image-data, filtering]
nodes: [Unsharp Mask]
node_family: blur-filter
controls: [Color Channels, Lock X/Y, Size, Gain, Threshold]
inputs: [image, mask]
outputs: [image]
tasks: [sharpen, enhance-detail, low-contrast-detail]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# Unsharp Mask

Unsharp Maskは、source Imageとblurred versionの差からedge detailを見つけ、そのdetailだけを強調するsharpening Nodeです。

名前に「Mask」とありますが、FusionのEffect Maskを作るNodeではありません。unsharp maskingというsharpening techniqueの名前です。

## 入力

2D Imageと任意Effect Maskを受けます。

## Size

detail検出に使うblur filterのsizeです。

大きくすると、より広いscaleの差をdetailとして扱います。

## Gain

検出されたdetailをどれだけ強く戻すかを決めます。

上げるほどedge contrastが強くなります。

## Threshold

sourceとblurred Imageの差が小さいlow-contrast領域をsharpen対象から外します。

noiseやskin textureのような細かな差まで強調したくない場合に有効です。

## Color Channels

RGBAのうち処理するchannelを選びます。

## 最小構成

```text
Image → Unsharp Mask → Output
```

まずSizeでdetail scaleを決め、次にGain、最後にThresholdで不要なlow-contrast detailを除外すると調整しやすくなります。

## Sharpenとの違い

- **Sharpen** — Amount中心の単純なconvolution sharpen
- **Unsharp Mask** — Size / Gain / Thresholdでedge detection scaleとselectionを分ける

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 92 pp.2124–2126で、unsharp maskの処理概念、Image / Mask inputs、Size、Gain、Threshold、RGBAを確認しました。
