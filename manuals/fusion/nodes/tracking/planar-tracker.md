---
title: Planar Tracker
description: 平面領域を追跡し、Corner PinやPlanar Transform等へ利用するトラッキング Node。
doc_type: node
verification: unverified
aliases: [Planar Tracker]
concepts: [tracking, coordinate-space, parameter-data]
nodes: [Planar Tracker]
node_family: tracking
inputs: [image]
tasks: [track, planar-track, screen-replace, stabilize]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
---

# Planar Tracker

平面として扱える領域の動きを追跡するトラッキング Nodeです。

## 概要

- **分類（Family）**: トラッキング
- **主な参照元（Primary 参照元）**: 2D Image
- **関連概念（Core concepts）**: planar 動き、トラッキング data、coordinate transfer
- **よく使う作業（Common tasks）**: screen / sign replacement、planar match move、stabilize、Corner Pin

## 入力

### Image

追跡対象の2D Imageを受け取ります。

## 出力

Image処理とトラッキング 結果を扱うToolですが、21.1 正確な Output port / exported data 仕組みはこのReferenceでは未固定です。

## 主な設定項目

トラッキング region、動き model、track 範囲、reference time等に相当するcontrolがありますが、正確な 21.1 UIは未検証です。

## 挙動と注意点

重要なのは「追跡した」ことより、**どのspaceのトラッキング dataを、どのdownstream controlへ適用するか**です。

Planar Trackerの結果をPlanar TransformやCorner Pinへ使う場合も、トラッキングとapplicationを別責任として読みます。

## 最小例

```text
Footage
  → Planar Tracker
  → tracking data / derived transform
  → replacement graphic
```

## 関連する考え方

- [データ領域（data domain）を辿って診断する](../../learn/07-debugging/trace-data-domain)
- [Center / Pivot / Size / Angle](../../learn/03-space/center-pivot-size-angle)

## 関連パターン

トラッキング Patternは今後追加します。

## 似たNode・関連Node

- Tracker
- Planar Transform
- Camera Tracker

## バージョンと検証状況

Planar Trackerの存在と平面領域のトラッキング（planar region tracking） → Corner Pin / Planar Transform用途は旧版のBlackmagic Design公式Fusion資料で確認。Fusion 21.1での正確な設定項目 / data exportは未検証です。
