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

## At a Glance

- **Family**: Blur / Filter
- **Primary input**: 2D Image
- **Output**: 2D Image
- **Core concepts**: filtering、edge behavior、DoD
- **Common tasks**: soften、blur、mask-assisted blur

## Inputs

### Image

blur対象の2D Imageを受け取ります。

Effect Mask等のexact auxiliary inputsは21.1で確認します。

## Output

blur後の2D Imageを出力します。

## Controls

blur size / amount、channel、edge / clipping等に関連するcontrolを持つ系統ですが、21.1 exact label・range・defaultは未検証です。

## Behavior / Notes

Blurは近傍pixelを参照するFilterなので、frame edgeやDomain of Definitionの扱いが見た目へ影響する場合があります。

「端だけおかしい」症状ではBlur amountだけでなくdomain / clippingも確認します。

## Minimal Examples

```text
Image → Blur → Output
```

Maskで範囲を限定する場合は、Image branchとMask branchを別々に確認します。

## Related Concepts

- [Resolution / Domain of Definitionを確認する](../../learn/07-debugging/resolution-domain-of-definition)
- [AlphaとMaskを分けて診断する](../../learn/07-debugging/alpha-vs-mask)

## Related Patterns

- [Maskで処理範囲を限定する](../../patterns/masking/limit-effect-with-mask)

## Similar / Adjacent Nodes

- Defocus
- Directional Blur
- VariBlur
- Vector Motion Blur

これらは目的・入力dataが異なるため、Blurのmode違いとして扱いません。

## Version / Verification Notes

Blurのidentityと標準blurという役割はlegacy-primary Fusion referenceで確認。21.1 exact controls / edge behavior / mask portsは未検証です。
