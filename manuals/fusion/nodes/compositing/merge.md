---
title: Merge
description: ForegroundとBackgroundを合成し、必要に応じてMaskで適用範囲を制限する基本Node。
doc_type: node
verification: partial
aliases: [Merge, 合成]
concepts: [foreground-background, effect-mask, compositing]
patterns: [stack-images-with-merge, limit-effect-with-mask]
nodes: [Merge]
node_family: compositing
controls: [Blend, Apply Mode, Operator]
inputs: [image, image, mask]
outputs: [image]
tasks: [composite, layer, mask]
level: foundation
product_scope: fusion
suite_surfaces: [fusion]
---

# Merge

ForegroundとBackgroundを1つのImageへ合成するNodeです。

## At a Glance

- **Family**: Compositing
- **Inputs**: Background Image / Foreground Image / Effect Mask
- **Output**: Image
- **Core concepts**: Foreground / Background、Mask、Compositing
- **Common tasks**: 画像を重ねる、Textやgraphicsを合成する、Maskで合成範囲を限定する

## Inputs

### Background

合成の基準になるImageです。Blackmagic Designの現行Fusion紹介では黄色inputとして案内されています。

### Foreground

Backgroundへ重ねるImageです。現行Fusion紹介では緑inputとして案内されています。

### Effect Mask

Mergeの処理を適用する範囲を制限します。Maskの一般的な役割は [Image / Mask / Dataを分ける](../../learn/02-data/image-mask-data) を参照してください。

## Output

ForegroundとBackgroundを合成したImageを出力します。

## Controls

### Blend

Foregroundの寄与を調整するcontrolとして既存seedに記録されています。exact default / range / alpha挙動は21.1 manual / hostで再確認します。

### Apply Mode

合成演算を選ぶcontrolとして既存seedに記録されています。各modeの数式・alpha処理はこの初期Referenceでは未検証です。

### Operator

Foreground / Backgroundのalpha関係に関わるcontrolとして既存seedに記録されています。premultiplicationを含む厳密な挙動は別検証対象です。

## Behavior / Notes

Foreground / Backgroundの役割はNode配置ではなく接続先で決まります。

複雑な合成では1段ずつMergeを分け、中間結果をViewerで確認できる構造にすると診断しやすくなります。

## Minimal Examples

### Two-image composite

```text
Foreground ─┐
            ├─ Merge → Output
Background ─┘
```

### Masked composite

```text
Foreground ─┐
Background ─┼─ Merge → Output
Mask ───────↑
```

## Related Concepts

- [Foreground / Background / Mask](../../learn/04-compositing/foreground-background-mask)
- [Image / Mask / Dataを分ける](../../learn/02-data/image-mask-data)

## Related Patterns

- [画像を段階的に重ねる](../../patterns/compositing/stack-images-with-merge)
- [Maskで処理範囲を限定する](../../patterns/masking/limit-effect-with-mask)

## Similar / Adjacent Nodes

特殊な合成Node・channel操作Nodeは、個別Referenceが追加されるまでここでは等価扱いしません。

## Version / Verification Notes

2026-10-02時点のBlackmagic Design公式Fusion紹介で、Foreground / Background inputとMask inputの基本を確認済みです。

Blend / Apply Mode / Operatorのexact仕様、default、range、premultiplicationとの関係はFusion 21.1 Reference Manual / host verification待ちです。
