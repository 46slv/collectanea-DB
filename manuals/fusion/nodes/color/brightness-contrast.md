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

## 概要（At a Glance）

- **分類（Family）**: Color
- **主入力（Primary input）**: 2D Image
- **出力（Output）**: 2D Image
- **関連概念（Core concepts）**: image 処理、channel adjustment
- **よく使う作業（Common tasks）**: 明るさ調整、contrast調整、gain調整

## 入力（Inputs）

### Image

補正対象の2D Imageを受け取る系統としてlegacy Fusion referenceで確認されています。

Effect Mask等の補助入力（auxiliary inputs）の正確な仕様は21.1で確認します。

## 出力（Output）

補正後の2D Imageを出力します。

## 主な設定項目（Controls）

Brightness / Contrast / Gain等に相当する主要adjustmentを持つことはlegacy referenceで確認されています。

channel単位control、pivot、alpha 扱い、初期値 / 範囲は21.1 現在の資料または実機での確認待ちです。

## 挙動と注意点（Behavior / Notes）

「明るくする」という見た目だけでColor Correctorと同一視せず、どのパラメータ familyを操作したいかで選びます。

透明edgeを持つImageで強い補正を行う場合は、alpha / premultiplicationの状態も別に確認します。

## 最小例（Minimal Examples）

```text
Image → Brightness Contrast → Output
```

## 関連する考え方（Concepts）

- [AlphaとMaskを分けて診断する](../../learn/07-debugging/alpha-vs-mask)

## 関連する再利用構成（Patterns）

Color adjustment Patternは今後追加します。

## 似たNode・関連Node

- Color Corrector
- Color Curves
- Color Gain

## バージョンと検証状況

Brightness Contrastの存在とbrightness / contrast / gain系という役割は旧版のBlackmagic Design公式Fusion資料で確認。Fusion 21.1での正確な設定項目 / alpha 扱いは未検証です。
