---
title: Brightness Contrast
description: 2D Imageの明るさ・コントラスト・gain系を調整する基本Color Node。
doc_type: node
verification: unverified
aliases: [Brightness Contrast, BC]
concepts: [image-data, color-adjustment]
nodes: [Brightness Contrast]
node_family: color
inputs: [image]
outputs: [image]
tasks: [brightness, contrast, gain, color]
level: foundation
product_scope: fusion
suite_surfaces: [fusion]
---

# Brightness Contrast

2D Imageのbrightness / contrast / gain系を調整するColor Nodeです。

## At a Glance

- **Family**: Color
- **Primary input**: 2D Image
- **Output**: 2D Image
- **Core concepts**: image processing、channel adjustment
- **Common tasks**: 明るさ調整、contrast調整、gain調整

## Inputs

### Image

補正対象の2D Imageを受け取る系統としてlegacy Fusion referenceで確認されています。

Effect Mask等のexact auxiliary inputsは21.1で確認します。

## Output

補正後の2D Imageを出力します。

## Controls

Brightness / Contrast / Gain等に相当する主要adjustmentを持つことはlegacy referenceで確認されています。

channel単位control、pivot、alpha handling、default / rangeは21.1 current verification待ちです。

## Behavior / Notes

「明るくする」という見た目だけでColor Correctorと同一視せず、どのparameter familyを操作したいかで選びます。

透明edgeを持つImageで強い補正を行う場合は、alpha / premultiplicationの状態も別に確認します。

## Minimal Examples

```text
Image → Brightness Contrast → Output
```

## Related Concepts

- [AlphaとMaskを分けて診断する](../../learn/07-debugging/alpha-vs-mask)

## Related Patterns

Color adjustment Patternは今後追加します。

## Similar / Adjacent Nodes

- Color Corrector
- Color Curves
- Color Gain

## Version / Verification Notes

Brightness Contrastのidentityとbrightness / contrast / gain系という役割はlegacy-primary Fusion referenceで確認。21.1 exact controls / alpha handlingは未検証です。
