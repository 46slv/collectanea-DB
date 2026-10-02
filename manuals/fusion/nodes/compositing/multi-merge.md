---
title: MultiMerge
description: 多数のForeground Layerを1 Nodeで合成し、各Layerへ個別Merge/Transform controlsを持つ合成 Node。
doc_type: node
verification: partial
aliases: [MultiMerge, Multi Merge]
concepts: [compositing, foreground-background, transform-controls]
nodes: [MultiMerge]
node_family: compositing
inputs: [image]
outputs: [image]
tasks: [composite, layer, multi-layer]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
---

# MultiMerge

多数のForeground Layerを1つのNodeで合成する合成 Nodeです。

## 概要

- **分類（Family）**: 合成
- **入力データ（Input domain）**: 2D Image
- **出力データ（Output domain）**: 2D Image
- **関連概念（Core concepts）**: multi-layer 合成、per-layer transform
- **よく使う作業（Common tasks）**: 多数のgraphics / elementsを1 Nodeで管理する

## 入力

Backgroundと複数Foreground Layerを持つ系統です。

Resolve 18.5以降の公式version資料では、Backgroundが出力解像度（Output Resolution）の基準となり、各Layerに個別Merge / Transform controlsがあると説明されています。

## 出力

合成済みの2D Imageを出力します。

## 主な設定項目

各LayerごとのMerge / Transform controlを持つことはversion-primaryで確認済みです。

正確な 21.1 layer management、blend/operator inventory、初期値は現在の manual / host確認待ちです。

## 挙動と注意点

MultiMergeは「Mergeを何段も繋いだもの」と同じ結果を作れる場面があっても、Graph organizationとlayer managementの責任が異なります。

```text
Background ───────┐
Foreground A ─────┤
Foreground B ─────┼─ MultiMerge → Output
Foreground C ─────┤
                  ┘
```

## 最小例

複数のtitle / graphic / image layerをMultiMergeへまとめ、それぞれのpositionや合成設定をLayer単位で管理します。

## 関連する考え方

- [前景（Foreground）/ 背景（Background）/ マスク（Mask）](../../learn/04-compositing/foreground-background-mask)
- [Center / Pivot / Size / Angle](../../learn/03-space/center-pivot-size-angle)

## 関連パターン

- [画像を段階的に重ねる](../../patterns/compositing/stack-images-with-merge)

## 似たNode・関連Node

- Merge — 2 Imageを段階的に合成する基本Node
- Merge 3D — Classic 3D scene domain
- uMerge — USD scene
- dMerge — Deep image

## バージョンと検証状況

MultiMergeはResolve 18.5以降のBlackmagic Design公式のバージョン資料で確認。Fusion 21.1での正確な設定項目 / layer limits / UI 挙動は未検証です。
