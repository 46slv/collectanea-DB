---
title: Alpha Multiply
description: RGBへAlphaを乗算し、straight RGBをpremultiplied状態へ戻すためのNode。
doc_type: node
verification: unverified
aliases: [Alpha Multiply, AML, premultiply]
concepts: [alpha, premultiplication]
nodes: [Alpha Multiply]
node_family: matte-keying
inputs: [image]
outputs: [image]
tasks: [premultiply, composite, alpha]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
---

# Alpha Multiply

RGBへAlphaを乗算し、premultiplied colorの関係へ戻すNodeです。

## At a Glance

- **Family**: Matte / Keying
- **Input domain**: 2D Image
- **Output domain**: 2D Image
- **Core concepts**: Alpha、premultiplication
- **Common tasks**: Alpha Divide後のcolor operationを再premultiplyしてcompositeへ戻す

## Inputs

### Image

Alphaを持つ2D Imageを受け取る系統です。

## Output

RGBへAlpha Multiplyを適用した2D Imageを出力します。

## Controls

exact 21.1 controls / optionsはcurrent manual / host verification待ちです。

## Behavior / Notes

Alpha Divideと対になるmental model:

```text
Alpha Divide
  → color operation
  → Alpha Multiply
  → Merge
```

常にこのpairが必要なわけではありません。Node側にpremultiplication-aware optionがある場合は、その責任と二重にしません。

## Minimal Examples

straight / unpremultiplied状態でcolor operationを行った後、通常compositingへ戻す前段として使う構成を検討します。

## Related Concepts

- [Premultiplication](../../learn/04-compositing/premultiplication)

## Related Patterns

- [KeyとCompositeを分ける](../../patterns/matte-keying/key-then-composite)

## Similar / Adjacent Nodes

- Alpha Divide
- Matte Control
- Merge

## Version / Verification Notes

Alpha MultiplyのidentityとRGBへAlphaを乗算してpremult状態へ戻す役割はlegacy-primary Fusion referenceで確認。21.1 exact numerical behavior / optionsは未検証です。
