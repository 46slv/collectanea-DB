---
title: sEllipse
description: Shape domainで円・楕円shapeを生成するFusion Shape Node。
doc_type: node
verification: partial
aliases: [sEllipse, Shape Ellipse]
concepts: [data-domain, shape-domain, vector-shape]
nodes: [sEllipse]
node_family: shapes
outputs: [shape]
tasks: [shape, ellipse, procedural-graphics]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
---

# sEllipse

Shape domainで円・楕円shapeを生成するNodeです。

## 概要（At a Glance）

- **分類（Family）**: Shapes
- **出力データ（Output domain）**: Shape
- **関連概念（Core concepts）**: vector/path domain、deferred rasterization
- **よく使う作業（Common tasks）**: procedural graphics、shape composition、repeated vector forms

## 入力（Inputs）

shape生成用のパラメータ / modifier入力を持つ系統ですが、Fusion 21.1の正確な入力仕様はこのReferenceでは固定しません。

## 出力（Output）

Shape streamを出力します。

これは2D ImageでもMaskでもありません。

## 主な設定項目（Controls）

position・size・shape styling等に関わるcontrolを持つ系統ですが、正確な 21.1 label / 初期値 / 範囲は現在の manual / 実機確認待ちです。

## 挙動と注意点（Behavior / Notes）

Shape systemでは、可能な限りShape domainのまま変形・複製・結合し、必要な段階でsRenderを使って2D Imageへ変換します。

```text
sEllipse
  → sTransform / sDuplicate / sMerge
  → sRender
  → 2D Image
```

通常のEllipse Maskとはデータ領域（data domain）も用途も異なります。

## 最小例（Minimal Examples）

```text
sEllipse → sRender → Merge
```

## 関連する考え方（Concepts）

- [データ領域（data domain）を辿って診断する](../../learn/07-debugging/trace-data-domain)

## 関連する再利用構成（Patterns）

Shape-specific Patternは今後追加します。

## 似たNode・関連Node

- Ellipse Mask — Mask domain
- sRectangle
- sPolygon
- sText

## バージョンと検証状況

sEllipseはResolve 17以降のShape systemとしてBlackmagic Design公式バージョン資料で確認されています。21.1 正確な設定項目は未検証です。
