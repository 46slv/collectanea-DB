---
title: Background
description: 色やalphaを持つImageを生成するGenerator Node。
doc_type: node
verification: unverified
aliases: [Background, BG]
concepts: [image-data, mask-data]
patterns: [limit-effect-with-mask]
nodes: [Background]
node_family: generators
controls: [Color, Width, Height, Gradient Type]
inputs: [mask]
outputs: [image]
tasks: [generate-image, create-background, mask]
level: foundation
product_scope: fusion
suite_surfaces: [fusion]
---

# Background

色やalphaを持つImageを生成するGenerator Nodeです。

> control名・default・gradient behaviorはFusion 21.1 Reference Manual / hostで再確認前です。現時点では既存seedの構造化Referenceです。

## At a Glance

- **Family**: Generators
- **Inputs**: Effect Mask
- **Output**: Image
- **Core concepts**: Image generation、Mask、resolution
- **Common tasks**: 背景色を作る、shapeの塗りを作る、alpha付きImageを作る

## Inputs

### Effect Mask

生成／処理範囲をMaskで制限する用途として既存seedに記録されています。

## Output

生成したImageを出力します。

## Controls

### Color

RGBとAlphaを指定するcontrolとして既存seedに記録されています。

### Width / Height

生成Imageのsizeに関わるcontrolです。frame formatとの関係、default、Domain of Definitionへの厳密な影響は再検証します。

### Gradient Type

Solid / Linear / Radial等の塗りを選ぶcontrolとして既存seedに記録されています。利用可能modeは21.1で再確認します。

## Behavior / Notes

Backgroundはupstream Imageを加工するのではなく、新しいImage sourceとしてGraphへ入れられるため、Generatorとして読むとFlowを理解しやすくなります。

Maskと組み合わせる場合は、「色やImageを作る責任」と「範囲を作る責任」を分けて考えます。

## Minimal Examples

### Solid source

```text
Background → Merge / downstream node
```

### Masked source

```text
Mask ──────↑
       Background → downstream
```

## Related Concepts

- [Graphとして考える](../../learn/01-flow/graph-as-flow)
- [Image / Mask / Dataを分ける](../../learn/02-data/image-mask-data)

## Related Patterns

- [Maskで処理範囲を限定する](../../patterns/masking/limit-effect-with-mask)

## Similar / Adjacent Nodes

Text+など他のGeneratorも「上流Imageを必要とせずImageを作る」という観点で比較できますが、出力構造やcontrolは個別Referenceで確認します。

## Version / Verification Notes

このページは `unverified`。既存seedのclaimをNode Reference形式へ移した段階で、Fusion 21.1 Reference Manual / hostでのcontrol-level検証を残しています。
