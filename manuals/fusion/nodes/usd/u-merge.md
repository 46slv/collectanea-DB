---
title: uMerge
description: 複数のUSD scene / object streamを1つのUSD sceneへ統合するNode。
doc_type: node
verification: partial
aliases: [uMerge, USD Merge]
concepts: [data-domain, usd-scene, scene-graph]
nodes: [uMerge]
node_family: usd
inputs: [usd-scene]
outputs: [usd-scene]
tasks: [usd, combine-3d, scene]
level: advanced
product_scope: fusion
suite_surfaces: [fusion]
---

# uMerge

複数のUSD scene / object streamを統合するNodeです。

## 概要

- **分類（Family）**: USD
- **入力データ（Input domain）**: USD scene
- **出力データ（Output domain）**: USD scene
- **関連概念（Core concepts）**: USD scene graph、typed data
- **よく使う作業（Common tasks）**: USD objects / lights / camerasを1 sceneへまとめる

## 入力

複数のUSD scene inputを受ける系統として扱います。dynamic inputやlayering semanticsの正確な 21.1挙動は現在の manual / host確認待ちです。

## 出力

統合したUSD sceneを出力します。

通常の2D ImageやClassic Fusion 3D sceneではありません。

## 主な設定項目

scene merge / hierarchyに関するcontrolを持つ可能性がありますが、Inspectorの正確な設定項目は未検証です。

## 挙動と注意点

```text
uShape / uLoader ─┐
uCamera ──────────┼─ uMerge → uRenderer → 2D Image / AOV
uLight ───────────┘
```

uMergeとMerge 3Dは名前が似ても別pipelineです。

## 最小例

複数のUSD object / camera / lightをuMergeで1 sceneへまとめます。

## 関連する考え方

- [データ領域（data domain）を辿って診断する](../../learn/07-debugging/trace-data-domain)

## 関連パターン

USD Patternは今後追加します。

## 似たNode・関連Node

- Merge 3D — Classic Fusion 3D
- Merge — 2D Image
- dMerge — Deep image

## バージョンと検証状況

uMergeはResolve 18.5以降のUSD toolsetとしてBlackmagic Design公式バージョン資料で確認。21.1 正確な input / merge semanticsは未検証です。
