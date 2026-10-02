---
title: 複数ImageをMultiMergeでまとめる
description: Backgroundと複数ForegroundをMultiMergeへ入れ、Layer単位でcompositeを管理するRecipe。
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

## Result

Background上へ複数Foreground Layerを1つのMultiMergeで管理します。

## Requirements

- Background Image
- 複数Foreground Image
- MultiMerge

## Steps

1. BackgroundをMultiMergeのBackgroundへ接続します。
2. Foreground要素をLayerとして追加します。
3. 各Layerのvisibility / transform / merge settingsを1つずつ確認します。
4. outputをViewerで確認します。
5. Layerごとに別effectが必要なら、そのeffectはMultiMergeへ入る前のbranchで持たせます。

```text
Background ──────┐
Title ───────────┤
Logo ────────────┼─ MultiMerge → Output
Graphic ─────────┤
                 ┘
```

## Why This Works

MultiMergeは多数のForeground Layerを1 Nodeで管理し、Backgroundをoutput resolutionの基準として扱う構造を持ちます。

## Variants / Alternatives

- stageごとのdebuggingを重視するならMerge chain。
- Layer単位でeffect branchを作り、その結果をMultiMergeへ集約する。
- repeated title systemではText+ / Transform branchをLayerとして入れる。

## Failure Checks

- Backgroundが意図したImageか。
- Layer orderが意図したcomposite orderか。
- per-layer transform責任を別Transformと二重管理していないか。
- individual effect branchをMultiMerge内部だけで解決しようとしていないか。

## Related Pattern

- [Merge chainとMultiMergeを選ぶ](../../patterns/compositing/choose-merge-vs-multimerge)

## Related Nodes

- [MultiMerge](../../nodes/compositing/multi-merge)
