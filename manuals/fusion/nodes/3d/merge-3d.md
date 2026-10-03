---
title: Merge 3D
description: 複数のClassic Fusion 3D scene/object streamを1つの3D sceneへ統合するNode。
doc_type: node
verification: unverified
aliases: [Merge3D, Merge 3D, 3MG]
concepts: [data-domain, classic-3d, scene-graph]
nodes: [Merge 3D]
node_family: 3d
inputs: [classic-3d-scene]
outputs: [classic-3d-scene]
tasks: [combine-3d, scene, composite-3d]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
---

# Merge 3D

複数のClassic Fusion 3D scene / object streamを統合するNodeです。

## 概要

- **分類（Family）**: 3D
- **入力データ（Input domain）**: Classic 3D scene
- **出力データ（Output domain）**: Classic 3D scene
- **関連概念（Core concepts）**: scene graph、typed data
- **よく使う作業（Common tasks）**: geometry / camera / light等を1 sceneへまとめる

## 入力

複数のClassic 3D scene / object inputを受ける系統です。動的入力（dynamic input）の正確な挙動は21.1で確認します。

## 出力

統合したClassic 3D sceneを返します。

2D Imageではありません。

## 主な設定項目

3D sceneのmerge / ordering / lighting関連controlがある場合も、正確な 21.1 UIを確認してから固定します。

## 挙動と注意点

```text
3D object ─┐
Camera ────┼─ Merge 3D → Renderer 3D → 2D Image
Light ─────┘
```

Merge 3Dと2D Mergeは名前が似てもデータ領域（data domain）が異なります。

## 最小例

Classic 3D objectsをMerge 3Dへまとめ、Renderer 3Dで2D Imageへ変換します。

## 関連する考え方

- [データ領域（data domain）を辿って診断する](../../learn/07-debugging/trace-data-domain)

## 関連パターン

3D Patternは今後追加します。

## 似たNode・関連Node

- Merge — 2D Image 合成
- uMerge — USD scene
- dMerge — Deep image
- sMerge — Shape stream

## バージョンと検証状況

Merge 3Dの存在と複数3D scene/object統合という役割は旧版のBlackmagic Design公式Fusion資料で確認。
