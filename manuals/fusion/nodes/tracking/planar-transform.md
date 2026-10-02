---
title: Planar Transform
description: Planar Trackerのトラッキング dataを任意のImage / Maskへ適用するNode。
doc_type: node
verification: unverified
aliases: [Planar Transform]
concepts: [tracking, coordinate-space, parameter-data]
nodes: [Planar Transform]
node_family: tracking
inputs: [image]
outputs: [image]
tasks: [track, apply-track, attach-graphics]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
---

# Planar Transform

Planar Trackerで得たトラッキング dataを、任意のImage / Maskへ適用するためのNodeです。

## 概要（At a Glance）

- **分類（Family）**: トラッキング
- **主入力（Primary input）**: Image / applicable data
- **出力（Output）**: transformed 結果
- **関連概念（Core concepts）**: トラッキング data、coordinate application
- **よく使う作業（Common tasks）**: replacement graphic追従、tracked transformの再利用

## 入力（Inputs）

トラッキング transformを適用する対象を受け取る系統です。

Image / Maskの正確な互換性、トラッキング data binding 仕組みはFusion 21.1 現在の資料または実機での確認待ちです。

## 出力（Output）

Planar トラッキング transformを反映した結果を出力します。

## 主な設定項目（Controls）

トラッキング 結果 / reference / transform-related controlsを持つ系統ですが、正確な 現在の UIは未検証です。

## 挙動と注意点（Behavior / Notes）

Planar Trackerが「solve」、Planar Transformが「apply」と責任分離できる構成として読むとdebugしやすくなります。

```text
Footage → Planar Tracker
                ↓ tracking data
Graphic → Planar Transform → Merge
```

## 最小例（Minimal Examples）

replacement graphicへPlanar Transformを適用し、トラッキング solveとgraphic 個別オフセットを分けます。

## 関連する考え方（Concepts）

- [データ領域（data domain）を辿って診断する](../../learn/07-debugging/trace-data-domain)
- [Center / Pivot / Size / Angle](../../learn/03-space/center-pivot-size-angle)

## 関連する再利用構成（Patterns）

- [Trackを解いてから適用先を分ける](../../patterns/tracking/solve-then-apply-track)

## 似たNode・関連Node

- Planar Tracker
- Tracker
- Transform

## バージョンと検証状況

Planar Transformの存在とPlanar Tracker dataを任意Image/Maskへ適用する役割は旧版のBlackmagic Design公式Fusion資料で確認。21.1 正確な 作業の流れ / controlsは未検証です。
