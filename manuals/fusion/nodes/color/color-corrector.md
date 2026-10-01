---
title: Color Corrector
description: Shadows・Midtones・Highlightsを含む主要な2D color correction Node。
doc_type: node
verification: unverified
aliases: [Color Corrector, CC]
concepts: [image-data, color-adjustment, alpha]
nodes: [Color Corrector]
node_family: color
inputs: [image]
outputs: [image]
tasks: [color-correct, shadows, midtones, highlights]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
---

# Color Corrector

2D Imageのcolor correctionを行う主要Nodeです。

## At a Glance

- **Family**: Color
- **Primary input**: 2D Image
- **Output**: 2D Image
- **Core concepts**: color correction、tone ranges、alpha awareness
- **Common tasks**: shadows / midtones / highlights補正、色調整

## Inputs

### Image

補正対象の2D Imageを受け取ります。

Mask等のexact auxiliary inputsは21.1で確認します。

## Output

補正後の2D Imageを出力します。

## Controls

Shadows / Midtones / Highlightsを含む補正系を持つことはlegacy Fusion referenceで確認されています。

exact tab structure、range、channel mode、pre-divide / post-multiply相当optionは21.1 current verification待ちです。

## Behavior / Notes

Color CorrectorとDeep用の `dColorCorrector` は別domainです。

通常2D Imageを扱うColor Correctorを、Deep image向けNodeの単純な低機能版として扱いません。

透明edgeを強く補正する場合は、Node固有のalpha processing optionとmanualなAlpha Divide / Multiplyを二重適用しないよう確認します。

## Minimal Examples

```text
Image → Color Corrector → Output
```

## Related Concepts

- [AlphaとMaskを分けて診断する](../../learn/07-debugging/alpha-vs-mask)
- [Data domainを辿って診断する](../../learn/07-debugging/trace-data-domain)

## Related Patterns

Color / Matte Patternは今後追加します。

## Similar / Adjacent Nodes

- Brightness Contrast
- Color Curves
- dColorCorrector — Deep image domain

## Version / Verification Notes

Color CorrectorのidentityとShadows / Midtones / Highlights系の役割はlegacy-primary Fusion referenceで確認。21.1 exact controls、alpha option、defaultは未検証です。
