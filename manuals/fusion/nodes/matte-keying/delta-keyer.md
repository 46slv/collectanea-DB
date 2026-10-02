---
title: Delta Keyer
description: green/blue screen等のkeyingでforeground matteを作る主要Keying Node。
doc_type: node
verification: unverified
aliases: [Delta Keyer]
concepts: [alpha, matte, keying]
nodes: [Delta Keyer]
node_family: matte-keying
inputs: [image]
outputs: [image]
tasks: [key, matte, green-screen, composite]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
---

# Delta Keyer

Fusionの主要なhigh-quality keying Toolとして使われるNodeです。

## At a Glance

- **Family**: Matte / Keying
- **Primary input**: 2D Image
- **Primary result**: foreground / alphaを含む2D Image
- **Core concepts**: matte、alpha、foreground extraction
- **Common tasks**: green screen / blue screen keying、matte作成

## Inputs

### Image

keying対象の2D Imageを受け取る系統としてlegacy-primary Fusion referenceで確認されています。

Clean Plate等の補助入力、exact port構成は21.1 current verification待ちです。

## Output

keying結果を含む2D Imageを返す用途です。exact output / auxiliary outputsはcurrent 21.1で確認します。

## Controls

background color selection、matte refinement、fringe / spill handling等に関わるcontrolを持つ系統ですが、exact tab / label / defaultはここでは固定しません。

## Behavior / Notes

Keyerは「Mask Node」そのものではありません。

source Imageからforeground / matte情報を作り、後段compositingで使う処理として読みます。

## Minimal Examples

```text
Green-screen Image
  → Delta Keyer
  → Merge as Foreground
```

## Related Concepts

- [Alpha](../../learn/04-compositing/alpha)
- [Premultiplication](../../learn/04-compositing/premultiplication)

## Related Patterns

- [画像を段階的に重ねる](../../patterns/compositing/stack-images-with-merge)

## Similar / Adjacent Nodes

- Chroma Keyer
- Ultra Keyer
- Luma Keyer
- Matte Control

## Version / Verification Notes

Delta Keyerのidentityと主要high-quality keying Toolという役割はlegacy-primary Fusion referenceで確認。21.1 exact controls / portsは未検証です。
