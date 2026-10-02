---
title: Matte Control
description: Alpha / matteの結合・反転・post 処理を行うMatte utility Node。
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

Alpha / matteの結合・反転・post 処理を行うutility Nodeです。

## 概要

- **分類（Family）**: Matte / キーイング
- **入力データ（Input domain）**: 2D Image
- **出力データ（Output domain）**: 2D Image
- **関連概念（Core concepts）**: Alpha、matte、post 処理
- **よく使う作業（Common tasks）**: matte combine、invert、refine

## 入力

foreground Imageやmatte情報を扱う系統ですが、正確な 21.1 port 配置は未検証です。

## 出力

matte / alpha処理を反映した2D Imageを出力します。

## 主な設定項目

matte combine、invert、post-処理に関わるcontrolがあることはlegacy referenceから確認できます。

利用できる演算の種類・初期値は現在の 21.1 verification待ちです。

## 挙動と注意点

Matte ControlはEffect Maskそのものではありません。

Image Alpha / matteを加工する責任を持つため、Node effectの適用範囲を制限するEffect Maskとは分けます。

## 最小例

Keyer後のforegroundへMatte Controlを挟み、matte処理を合成前の独立段階として持たせます。

```text
Source → Keyer → Matte Control → Merge
```

## 関連する考え方

- [Alpha](../../learn/04-compositing/alpha)
- [AlphaとMaskを分けて診断する](../../learn/07-debugging/alpha-vs-mask)

## 関連パターン

- [Keyと合成を分ける](../../patterns/matte-keying/key-then-composite)

## 似たNode・関連Node

- Delta Keyer
- Channel Boolean
- Alpha Divide / Alpha Multiply

## バージョンと検証状況

Matte Controlの存在とAlpha/matteの結合・反転・post 処理 役割は旧版のBlackmagic Design公式Fusion資料で確認。Fusion 21.1での正確な設定項目は未検証です。
