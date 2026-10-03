---
title: Alpha
description: RGBとは別に、Imageがどの程度寄与するかを持つalpha channelの役割を理解する。
doc_type: concept
term_id: alpha
term_short: Imageが合成へどの程度寄与するかを表すalpha channel。
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

## このページで分かること

合成でAlphaが何を表しているかを整理します。

## 基本の考え方

2D Imageを単なるRGBではなく、**RGB + Alpha** として読みます。

AlphaはImageが合成へどの程度寄与するかを表すchannelで、Merge等の合成結果へ影響します。

ただしEffect MaskはAlpha channelそのものではありません。

## 最小例

前景画像（Foreground Image）をMergeへ入れ、Alphaを持つ素材と持たない素材で、エッジ（Edge）や背景（Background）の見え方を比較します。

## 共通ルール

- RGBとAlphaを別channelとして考える。
- Effect MaskとImage Alphaを同一視しない。
- Mergeの見た目だけで参照元 alphaを推測しない。
- 透明エッジ（transparent edge）の問題では<Term id="premultiplication">premultiplication</Term>も確認する。

## 1つずつ変えて確認する

Maskは外したまま、前景（Foreground）の参照元でAlphaだけが違う2素材を比較します。

## 他のNodeにも応用する

### Merge

前景（Foreground）/ 背景（Background）の役割とAlphaの関係を別々に読みます。

### Background

ColorのAlphaを含むImage 参照元として考えます。

### Key / Matte

matte生成とeffect maskを別責任にします。

## 初見のNodeを読む

透明問題で「素材alpha」「合成」「Mask」のどこを先に見るか決められます。

## よくある誤解

**Alpha = Effect Mask** と考えること。

MaskはNodeのeffect適用範囲、AlphaはImage channelです。

## 関連パターン

- [Maskで処理範囲を限定する](../../patterns/masking/limit-effect-with-mask)

## 関連Node

- [Merge](../../nodes/compositing/merge)
- [Background](../../nodes/generators/background)

## 次に読む

→ [プリマルチプライ（Premultiplication）](./premultiplication)

---

検証メモ: Image AlphaとEffect Maskの役割分離はFusion 21系semantic baselineで確認。
