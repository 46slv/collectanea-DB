---
title: Ellipse Mask
description: 円・楕円形状のMaskを生成する基本Mask Node。
doc_type: node
verification: unverified
aliases: [Ellipse, Ellipse Mask, ELP]
concepts: [mask-data, normalized-coordinates]
nodes: [Ellipse Mask]
node_family: masks
outputs: [mask]
tasks: [mask, circle, ellipse, isolate-effect]
level: foundation
product_scope: fusion
suite_surfaces: [fusion]
---

# Ellipse Mask

円・楕円形状のMaskを生成するNodeです。

## 概要

- **分類（Family）**: Masks
- **出力（Output）**: Mask
- **関連概念（Core concepts）**: Mask data、2D coordinates、shape boundary
- **よく使う作業（Common tasks）**: 円形Mask、楕円Mask、effect範囲の制限

## 入力

正確な auxiliary input / combine 挙動はFusion 21.1で確認します。

## 出力

楕円形状を表すMaskを出力します。

## 主な設定項目

位置・幅・高さ・境界／softness／invert等に相当するcontrol群を持つ系統ですが、21.1の正確な label・初期値・範囲は未検証です。

このReferenceでは確認前のcontrol名を網羅表として固定しません。

## 挙動と注意点

Ellipse MaskはImage generatorではなくMask domainとして扱います。

```text
Ellipse Mask ──→ Effect Mask input
```

Imageとして表示したい場合は、MaskをどのImage処理へ渡すかを別に設計します。

## 最小例

### Limit an effect

```text
Image → Effect → Output
          ↑
       Ellipse
```

## 関連する考え方

- [Image / Mask / Dataを分ける](../../learn/02-data/image-mask-data)
- [正規化座標（Normalized Coordinates）](../../learn/03-space/normalized-coordinates)

## 関連パターン

- [Maskで処理範囲を限定する](../../patterns/masking/limit-effect-with-mask)

## 似たNode・関連Node

- Polygon Mask
- Rectangle Mask
- B-Spline Mask

## バージョンと検証状況

Ellipse Maskの存在と「楕円／円形Mask」という役割は旧版のBlackmagic Design公式Fusion資料で確認。21.1 現在の presence、正確な Inspector controls、border/solid/invert semanticsは実機 / マニュアル再確認対象です。
