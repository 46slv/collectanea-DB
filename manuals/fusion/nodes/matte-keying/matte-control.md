---
title: Matte Control
description: Alpha / matteの結合・反転・post processingを行うMatte utility Node。
doc_type: node
verification: unverified
aliases: [Matte Control, MAT]
concepts: [alpha, matte, compositing]
nodes: [Matte Control]
node_family: matte-keying
inputs: [image]
outputs: [image]
tasks: [matte, alpha, key, refine-matte]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
---

# Matte Control

Alpha / matteの結合・反転・post processingを行うutility Nodeです。

## At a Glance

- **Family**: Matte / Keying
- **Input domain**: 2D Image
- **Output domain**: 2D Image
- **Core concepts**: Alpha、matte、post processing
- **Common tasks**: matte combine、invert、refine

## Inputs

foreground Imageやmatte情報を扱う系統ですが、exact 21.1 port layoutは未検証です。

## Output

matte / alpha処理を反映した2D Imageを出力します。

## Controls

matte combine、invert、post-processingに関わるcontrolがあることはlegacy referenceから確認できます。

exact operation inventory / defaultsはcurrent 21.1 verification待ちです。

## Behavior / Notes

Matte ControlはEffect Maskそのものではありません。

Image Alpha / matteを加工する責任を持つため、Node effectの適用範囲を制限するEffect Maskとは分けます。

## Minimal Examples

Keyer後のforegroundへMatte Controlを挟み、matte処理をcomposite前の独立stageとして持たせます。

```text
Source → Keyer → Matte Control → Merge
```

## Related Concepts

- [Alpha](../../learn/04-compositing/alpha)
- [AlphaとMaskを分けて診断する](../../learn/07-debugging/alpha-vs-mask)

## Related Patterns

- [KeyとCompositeを分ける](../../patterns/matte-keying/key-then-composite)

## Similar / Adjacent Nodes

- Delta Keyer
- Channel Boolean
- Alpha Divide / Alpha Multiply

## Version / Verification Notes

Matte ControlのidentityとAlpha/matteの結合・反転・post processing roleはlegacy-primary Fusion referenceで確認。21.1 exact controlsは未検証です。
