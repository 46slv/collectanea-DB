---
title: Alpha
description: RGBとは別に、Imageがどの程度寄与するかを持つalpha channelの役割を理解する。
doc_type: concept
verification: partial
aliases: [alpha channel, transparency]
concepts: [alpha, rgba, compositing]
nodes: [Merge, Background]
tasks: [composite, transparency, debug]
prerequisites: [image-data, foreground-background]
level: foundation
product_scope: fusion
suite_surfaces: [fusion]
---

# Alpha

## Question

「透明度」として見えるAlphaは、合成の中で何を持っているのでしょうか。

## Mental Model

2D Imageを単なるRGBではなく、**RGB + Alpha** として読みます。

AlphaはImageが合成へどの程度寄与するかを表すchannelで、Merge等のcompositing結果へ影響します。

ただしEffect MaskはAlpha channelそのものではありません。

## Minimum Example

Foreground ImageをMergeへ入れ、alphaを持つ素材と持たない素材でedgeやBackgroundの見え方を比較します。

## Invariants

- RGBとAlphaを別channelとして考える。
- Effect MaskとImage Alphaを同一視しない。
- Mergeの見た目だけでsource alphaを推測しない。
- transparent edge問題ではpremultiplicationも確認する。

## Change One Thing

Maskは外したまま、Foreground sourceのalphaだけが違う2素材を比較します。

## Transfer

### Merge

Foreground / Background roleとalpha relationshipを別々に読みます。

### Background

ColorのAlphaを含むImage sourceとして考えます。

### Key / Matte

matte生成とeffect maskを別責任にします。

## Predict

透明問題で「素材alpha」「compositing」「Mask」のどこを先に見るか決められます。

## Common Misread

**Alpha = Effect Mask** と考えること。

MaskはNodeのeffect適用範囲、AlphaはImage channelです。

## Related Patterns

- [Maskで処理範囲を限定する](../../patterns/masking/limit-effect-with-mask)

## Node Reference

- [Merge](../../nodes/compositing/merge)
- [Background](../../nodes/generators/background)

## Next

→ [Premultiplication](./premultiplication)

---

Verification note: Image AlphaとEffect Maskの役割分離はFusion 21系semantic baselineで確認。
