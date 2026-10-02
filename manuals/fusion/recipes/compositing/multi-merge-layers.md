---
title: 複数ImageをMultiMergeでまとめる
description: Backgroundと複数ForegroundをMultiMergeへ入れ、Layer単位で合成を管理するRecipe。
doc_type: recipe
verification: partial
aliases: [multi layer composite, MultiMerge layers]
concepts: [compositing, foreground-background]
patterns: [choose-merge-vs-multimerge]
nodes: [MultiMerge]
tasks: [composite, layer, multi-layer]
prerequisites: [foreground-background]
level: intermediate
product_scope: fusion
---

# 複数ImageをMultiMergeでまとめる

## できあがるもの（Result）

Background上へ複数Foreground Layerを1つのMultiMergeで管理します。

## 必要なもの（Requirements）

- Background Image
- 複数Foreground Image
- MultiMerge

## 手順（Steps）

1. BackgroundをMultiMergeのBackgroundへ接続します。
2. Foreground要素をLayerとして追加します。
3. 各Layerのvisibility / transform / merge settingsを1つずつ確認します。
4. outputをViewerで確認します。
5. Layerごとに別effectが必要なら、そのeffectはMultiMergeへ入る前の分岐で持たせます。

```text
Background ──────┐
Title ───────────┤
Logo ────────────┼─ MultiMerge → Output
Graphic ─────────┤
                 ┘
```

## なぜこの構成にするか（Why This Works）

MultiMergeは多数のForeground Layerを1 Nodeで管理し、Backgroundを出力解像度（Output Resolution）の基準として扱う構造を持ちます。

## 別のやり方（Variants / Alternatives）

- 段階ごとの診断を重視するならMerge chain。
- Layer単位でeffect 分岐を作り、その結果をMultiMergeへ集約する。
- repeated title systemではText+ / Transform 分岐をLayerとして入れる。

## うまくいかないときの確認（Failure Checks）

- Backgroundが意図したImageか。
- Layer orderが意図した合成 orderか。
- per-layer transform責任を別Transformと二重管理していないか。
- individual effect 分岐をMultiMerge内部だけで解決しようとしていないか。

## 関連する再利用構成（Pattern）

- [Merge chainとMultiMergeを選ぶ](../../patterns/compositing/choose-merge-vs-multimerge)

## 関連Node

- [MultiMerge](../../nodes/compositing/multi-merge)
