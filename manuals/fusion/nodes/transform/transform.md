---
title: Transform
description: 2D Imageの位置・大きさ・角度・変形中心を調整するTransform Node。
doc_type: node
term_id: transform
verification: unverified
aliases: [Transform, 変形]
concepts: [normalized-coordinates, coordinate-space, parameter-data]
patterns: [share-position-across-elements, link-values-with-expression]
nodes: [Transform]
node_family: transform
controls: [Center, Pivot, Size, Angle]
inputs: [image, mask]
outputs: [image]
tasks: [position, scale, rotate, layout, animate]
level: foundation
product_scope: fusion
suite_surfaces: [fusion]
slug: /fusion/nodes/transform/transform
---

# Transform

2D Imageの位置・大きさ・角度・変形中心を調整するNodeです。

> Center / Pivot / Size / Angleの正確な 範囲・space・初期値はFusion 21.1 Reference Manual / 実機で再確認前です。

## 概要

- **分類（Family）**: Transform
- **入力（Inputs）**: Image / Effect Mask
- **出力（Output）**: Image
- **関連概念（Core concepts）**: Coordinates、Point パラメータ、transform 管理関係
- **よく使う作業（Common tasks）**: 移動、拡大縮小、回転、複数要素の配置

## 入力

### Image

変形対象のImageを受け取ります。

### Effect Mask

Transformの適用範囲を制限できる入力として既存seedに記録されています。正確な 挙動は再検証します。

## 出力

変形後のImageを出力します。

## 主な設定項目

### Center

Imageの配置位置に関わるPoint controlです。Normalized Coordinatesの一般則と、Transform固有のspaceを分けて確認します。

### Pivot

回転・scaleの基準点に関わるcontrolとして既存seedに記録されています。

### Size

uniform scaleに関わるcontrolとして既存seedに記録されています。

### Angle

回転量に関わるcontrolとして既存seedに記録されています。

## 挙動と注意点

Flow全体で「位置責任をどのNodeに持たせるか」を決めると、後からExpressionや配置を組みやすくなります。

Merge側にも配置controlがある場合、同じ見た目を作れることと同じ責任を持つことを混同せず、どのNodeで扱うかを決めます。

## 最小例

### Basic placement

```text
Image → Transform → Output
```

Centerだけを変更し、他controlを固定して位置挙動を観察します。

### Shared position

複数Transformのposition関係をmaster パラメータから派生させる場合は、Pattern側へ責任を移します。

## 関連する考え方

- [正規化座標（Normalized Coordinates）](../../learn/03-space/normalized-coordinates)
- [式（Expressions）](../../learn/05-time/expressions)
- [キーフレーム / スプライン / 時間（Keyframe / Spline / Time）](../../learn/05-time/keyframes-spline-time)

## 関連パターン

- [複数要素の位置関係を共有する](../../patterns/transform/share-position-across-elements)
- [Expressionで値の関係を保つ](../../patterns/automation/link-values-with-expression)

## 似たNode・関連Node

ResizeやMerge内のtransform controlsは同じ結果を作る場面があっても、同一Node・同一spaceとは扱いません。比較は個別Referenceで行います。

## バージョンと検証状況

このページは `unverified`。既存seedをReference構造へ移行した段階で、Center / Pivot / Size / Angleの正確な 挙動をFusion 21.1 Reference Manual / 実機で検証する必要があります。
