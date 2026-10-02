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

## 概要（At a Glance）

- **分類（Family）**: 合成
- **入力（Inputs）**: Background Image / Foreground Image / Effect Mask
- **出力（Output）**: Image
- **関連概念（Core concepts）**: Foreground / Background、Mask、合成
- **よく使う作業（Common tasks）**: 画像を重ねる、Textやgraphicsを合成する、Maskで合成範囲を限定する

## 入力（Inputs）

### Background

合成の基準になるImageです。Blackmagic Designの現行Fusion紹介では黄色inputとして案内されています。

### Foreground

Backgroundへ重ねるImageです。現行Fusion紹介では緑inputとして案内されています。

### Effect Mask

Mergeの処理を適用する範囲を制限します。Maskの一般的な役割は [Image / Mask / Dataを分ける](../../learn/02-data/image-mask-data) を参照してください。

## 出力（Output）

ForegroundとBackgroundを合成したImageを出力します。

## 主な設定項目（Controls）

### Blend

Foregroundの寄与を調整するcontrolとして既存seedに記録されています。正確な 初期値 / 範囲 / alpha挙動は21.1 manual / 実機で再確認します。

### Apply Mode

合成演算を選ぶcontrolとして既存seedに記録されています。各modeの数式・alpha処理はこの初期Referenceでは未検証です。

### Operator

Foreground / Backgroundのalpha関係に関わるcontrolとして既存seedに記録されています。premultiplicationを含む厳密な挙動は別検証対象です。

## 挙動と注意点（Behavior / Notes）

Foreground / Backgroundの役割はNode配置ではなく接続先で決まります。

複雑な合成では1段ずつMergeを分け、中間結果をViewerで確認できる構造にすると診断しやすくなります。

## 最小例（Minimal Examples）

### Two-image 合成

```text
Foreground ─┐
            ├─ Merge → Output
Background ─┘
```

### Masked 合成

```text
Foreground ─┐
Background ─┼─ Merge → Output
Mask ───────↑
```

## 関連する考え方（Concepts）

- [前景（Foreground）/ 背景（Background）/ マスク（Mask）](../../learn/04-compositing/foreground-background-mask)
- [Image / Mask / Dataを分ける](../../learn/02-data/image-mask-data)

## 関連する再利用構成（Patterns）

- [画像を段階的に重ねる](../../patterns/compositing/stack-images-with-merge)
- [Maskで処理範囲を限定する](../../patterns/masking/limit-effect-with-mask)

## 似たNode・関連Node

特殊な合成Node・channel操作Nodeは、個別Referenceが追加されるまでここでは等価扱いしません。

## バージョンと検証状況

2026-10-02時点のBlackmagic Design公式Fusion紹介で、Foreground / Background inputとMask inputの基本を確認済みです。

Blend / Apply Mode / Operatorの正確な仕様、初期値、範囲、premultiplicationとの関係はFusion 21.1 Reference Manual / ホスト上での確認待ちです。
