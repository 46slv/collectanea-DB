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

> control名・初期値・gradient 挙動はFusion 21.1 Reference Manual / 実機で再確認前です。現時点では既存seedの構造化Referenceです。

## 概要（At a Glance）

- **分類（Family）**: Generators
- **入力（Inputs）**: Effect Mask
- **出力（Output）**: Image
- **関連概念（Core concepts）**: Image generation、Mask、resolution
- **よく使う作業（Common tasks）**: 背景色を作る、shapeの塗りを作る、alpha付きImageを作る

## 入力（Inputs）

### Effect Mask

生成／処理範囲をMaskで制限する用途として既存seedに記録されています。

## 出力（Output）

生成したImageを出力します。

## 主な設定項目（Controls）

### Color

RGBとAlphaを指定するcontrolとして既存seedに記録されています。

### Width / Height

生成Imageのsizeに関わるcontrolです。フレーム formatとの関係、初期値、Domain of Definitionへの厳密な影響は再検証します。

### Gradient Type

Solid / Linear / Radial等の塗りを選ぶcontrolとして既存seedに記録されています。利用可能modeは21.1で再確認します。

## 挙動と注意点（Behavior / Notes）

Backgroundはupstream Imageを加工するのではなく、新しいImage 参照元としてGraphへ入れられるため、Generatorとして読むとFlowを理解しやすくなります。

Maskと組み合わせる場合は、「色やImageを作る責任」と「範囲を作る責任」を分けて考えます。

## 最小例（Minimal Examples）

### Solid 参照元

```text
Background → Merge / downstream node
```

### Masked 参照元

```text
Mask ──────↑
       Background → downstream
```

## 関連する考え方（Concepts）

- [Graphとして考える](../../learn/01-flow/graph-as-flow)
- [Image / Mask / Dataを分ける](../../learn/02-data/image-mask-data)

## 関連する再利用構成（Patterns）

- [Maskで処理範囲を限定する](../../patterns/masking/limit-effect-with-mask)

## 似たNode・関連Node

Text+など他のGeneratorも「上流Imageを必要とせずImageを作る」という観点で比較できますが、出力構造やcontrolは個別Referenceで確認します。

## バージョンと検証状況

このページは `unverified`。既存seedのclaimをNode Reference形式へ移した段階で、Fusion 21.1 Reference Manual / 実機でのcontrol-level検証を残しています。
