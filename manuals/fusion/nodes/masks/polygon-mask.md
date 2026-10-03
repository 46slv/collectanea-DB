---
title: Polygon Mask
description: Bezier pathで任意形状のMaskを作る基本Mask Node。
doc_type: node
term_id: polygon-mask
verification: unverified
aliases: [Polygon, Polygon Mask, PLY]
concepts: [mask-data, bezier-path]
nodes: [Polygon Mask]
node_family: masks
outputs: [mask]
tasks: [mask, roto, bezier, isolate-effect]
level: foundation
product_scope: fusion
suite_surfaces: [fusion]
---

# Polygon Mask

Bezier pathで任意形状のMaskを作るNodeです。

## 概要

- **分類（Family）**: Masks
- **出力（Output）**: Mask
- **関連概念（Core concepts）**: Mask data、Bezier path、point アニメーション
- **よく使う作業（Common tasks）**: freeform mask、roto、effect範囲の制限

## 入力

正確な auxiliary input / combine 挙動はFusion 21.1で確認します。

## 出力

Polygon pathで定義したMaskを出力します。

## 主な設定項目

path points、shape closure、soft edge、level / invert等に関連するcontrolがある系統ですが、正確な 21.1 label・初期値は未検証です。

## 挙動と注意点

Polygon Maskの中心的な責任は「Imageを描くこと」ではなく「処理範囲となるMask shapeを定義すること」です。

point アニメーションを扱う場合も、Mask domainと時間変化を分けて読みます。

## 最小例

### Freeform effect mask

```text
Polygon Mask ──→ Effect Mask
Image ─────────→ Effect → Output
```

## 関連する考え方

- [Image / Mask / Dataを分ける](../../learn/02-data/image-mask-data)
- [キーフレーム / スプライン / 時間（Keyframe / Spline / Time）](../../learn/05-time/keyframes-spline-time)

## 関連パターン

- [Maskで処理範囲を限定する](../../patterns/masking/limit-effect-with-mask)

## 似たNode・関連Node

- Ellipse Mask
- B-Spline Mask
- MultiPoly

MultiPolyは別Toolであり、Polygon Maskの単純な複数版として固定しません。

## バージョンと検証状況

Polygon Maskの存在とBezier polygon maskという役割は旧版のBlackmagic Design公式Fusion資料で確認。21.1 正確な path controls / modifiers / combine semanticsは未検証です。
