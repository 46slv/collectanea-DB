---
title: Alpha Multiply
description: RGBへAlphaを乗算し、ストレートRGB（straight RGB）をpremultiplied状態へ戻すためのNode。
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

## 概要

- **分類（Family）**: Matte / キーイング
- **入力データ（Input domain）**: 2D Image
- **出力データ（Output domain）**: 2D Image
- **関連概念（Core concepts）**: Alpha、premultiplication
- **よく使う作業（Common tasks）**: Alpha Divide後のcolor operationを再premultiplyして合成へ戻す

## 入力

### Image

Alphaを持つ2D Imageを受け取る系統です。

## 出力

RGBへAlpha Multiplyを適用した2D Imageを出力します。

## 主な設定項目

正確な 21.1 controls / optionsは現在の manual / ホスト上での確認待ちです。

## 挙動と注意点

Alpha Divideと対になる考え方:

```text
Alpha Divide
  → color operation
  → Alpha Multiply
  → Merge
```

常にこのpairが必要なわけではありません。Node側にpremultiplication-aware 設定がある場合は、その責任と二重にしません。

## 最小例

straight / unpremultiplied状態でcolor operationを行った後、通常合成へ戻す前段として使う構成を検討します。

## 関連する考え方

- [プリマルチプライ（Premultiplication）](../../learn/04-compositing/premultiplication)

## 関連パターン

- [Keyと合成を分ける](../../patterns/matte-keying/key-then-composite)

## 似たNode・関連Node

- Alpha Divide
- Matte Control
- Merge

## バージョンと検証状況

Alpha Multiplyの存在とRGBへAlphaを乗算してpremult状態へ戻す役割は旧版のBlackmagic Design公式Fusion資料で確認。21.1 数値処理の正確な挙動・設定は未検証です。
