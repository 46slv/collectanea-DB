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

## 概要（At a Glance）

- **分類（Family）**: Matte / キーイング
- **入力データ（Input domain）**: 2D Image
- **出力データ（Output domain）**: 2D Image
- **関連概念（Core concepts）**: Alpha、premultiplication
- **よく使う作業（Common tasks）**: transparent edgeを持つImageのcolor 処理前処理

## 入力（Inputs）

### Image

Alphaを持つ2D Imageを受け取る系統です。

## 出力（Output）

RGB / Alpha 関係をAlpha Divide処理した2D Imageを出力します。

## 主な設定項目（Controls）

正確な 現在の controls / zero-alpha 挙動 / optionsはFusion 21.1 現在の資料または実機での確認待ちです。

## 挙動と注意点（Behavior / Notes）

典型考え方:

```text
premultiplied Image
  → Alpha Divide
  → color operation
  → Alpha Multiply
  → composite
```

ただしColor Node自身に同等のpre-divide/post-multiply機能がある場合は二重処理しません。

## 最小例（Minimal Examples）

透明edgeを持つforegroundへ強い色処理（Color operation）を行う前段に置く構成を検討します。

## 関連する考え方（Concepts）

- [プリマルチプライ（Premultiplication）](../../learn/04-compositing/premultiplication)

## 関連する再利用構成（Patterns）

- [Keyと合成を分ける](../../patterns/matte-keying/key-then-composite)

## 似たNode・関連Node

- Alpha Multiply
- Color Corrector
- Matte Control

## バージョンと検証状況

Alpha Divideの存在とRGBをAlphaで除算する役割は旧版のBlackmagic Design公式Fusion資料で確認。21.1 数値処理の正確な挙動・設定は未検証です。
