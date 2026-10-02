---
title: Alpha Divide
description: RGBをAlphaで除算し、premultiplied状態を解除するためのNode。
doc_type: node
verification: unverified
aliases: [Alpha Divide, ADV, unpremultiply]
concepts: [alpha, premultiplication]
nodes: [Alpha Divide]
node_family: matte-keying
inputs: [image]
outputs: [image]
tasks: [unpremultiply, color-correct, alpha]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
---

# Alpha Divide

RGBをAlphaで除算し、premultiplied colorをstraight / unpremultiplied方向へ変換するNodeです。

## At a Glance

- **Family**: Matte / Keying
- **Input domain**: 2D Image
- **Output domain**: 2D Image
- **Core concepts**: Alpha、premultiplication
- **Common tasks**: transparent edgeを持つImageのcolor processing前処理

## Inputs

### Image

Alphaを持つ2D Imageを受け取る系統です。

## Output

RGB / Alpha relationをAlpha Divide処理した2D Imageを出力します。

## Controls

exact current controls / zero-alpha behavior / optionsはFusion 21.1 current verification待ちです。

## Behavior / Notes

典型mental model:

```text
premultiplied Image
  → Alpha Divide
  → color operation
  → Alpha Multiply
  → composite
```

ただしColor Node自身に同等のpre-divide/post-multiply機能がある場合は二重処理しません。

## Minimal Examples

透明edgeを持つforegroundへ強いColor operationを行う前段に置く構成を検討します。

## Related Concepts

- [Premultiplication](../../learn/04-compositing/premultiplication)

## Related Patterns

- [KeyとCompositeを分ける](../../patterns/matte-keying/key-then-composite)

## Similar / Adjacent Nodes

- Alpha Multiply
- Color Corrector
- Matte Control

## Version / Verification Notes

Alpha DivideのidentityとRGBをAlphaで除算する役割はlegacy-primary Fusion referenceで確認。21.1 exact numerical behavior / optionsは未検証です。
