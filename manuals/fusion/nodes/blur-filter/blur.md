---
title: Blur
description: 2D Imageへ標準的なblur処理を行うFilter Node。
doc_type: node
verification: unverified
aliases: [Blur]
concepts: [image-data, filtering, domain-of-definition]
nodes: [Blur]
node_family: blur-filter
inputs: [image]
outputs: [image]
tasks: [blur, soften, filter]
level: foundation
product_scope: fusion
suite_surfaces: [fusion]
---

# Blur

2D Imageへ標準的なblur処理を行うFilter Nodeです。

## 概要

- **分類（Family）**: Blur / Filter
- **主入力（Primary input）**: 2D Image
- **出力（Output）**: 2D Image
- **関連概念（Core concepts）**: filtering、edge 挙動、DoD
- **よく使う作業（Common tasks）**: soften、blur、mask-assisted blur

## 入力

### Image

blur対象の2D Imageを受け取ります。

Effect Mask等の補助入力（auxiliary inputs）の正確な仕様は21.1で確認します。

## 出力

blur後の2D Imageを出力します。

## 主な設定項目

blur size / amount、channel、edge / clipping等に関連するcontrolを持つ系統ですが、Fusion 21.1での正確な名称・範囲・初期値は未検証です。

## 挙動と注意点

Blurは近傍ピクセルを参照するFilterなので、フレーム edgeやDomain of Definitionの扱いが見た目へ影響する場合があります。

「端だけおかしい」症状ではBlur amountだけでなくdomain / clippingも確認します。

## 最小例

```text
Image → Blur → Output
```

Maskで範囲を限定する場合は、Image 分岐とMask 分岐を別々に確認します。

## 関連する考え方

- [Resolution / Domain of Definitionを確認する](../../learn/07-debugging/resolution-domain-of-definition)
- [AlphaとMaskを分けて診断する](../../learn/07-debugging/alpha-vs-mask)

## 関連パターン

- [Maskで処理範囲を限定する](../../patterns/masking/limit-effect-with-mask)

## 似たNode・関連Node

- Defocus
- Directional Blur
- VariBlur
- Vector 動き Blur

これらは目的・入力dataが異なるため、Blurのmode違いとして扱いません。

## バージョンと検証状況

Blurの存在と標準blurという役割は旧版のBlackmagic Design公式Fusion資料で確認。Fusion 21.1での正確な設定項目・Edge挙動・Mask Portは未検証です。
