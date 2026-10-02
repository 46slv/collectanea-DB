---
title: 画像を段階的に重ねる
description: 複数素材の合成を、1段ずつ検証可能なMerge chainへ分解するPattern。
doc_type: pattern
verification: partial
aliases: [Merge chain, image stack]
concepts: [node-graph, foreground-background, compositing]
patterns: [stack-images-with-merge]
nodes: [Merge]
tasks: [composite, layer, debug]
level: foundation
product_scope: fusion
---

# 画像を段階的に重ねる

## Problem Family

3枚以上の画像・Text・graphicを重ねると、どこで結果が崩れたか追いにくくなります。

## Concepts

- [Graphとして考える](../../learn/01-flow/graph-as-flow)
- [Foreground / Background / Mask](../../learn/04-compositing/foreground-background-mask)

## Generic Graph

```text
Base ─────────────┐
                  ├─ Merge A ────────┐
Element A ────────┘                  ├─ Merge B → Output
Element B ────────────────────────────┘
```

各Mergeを1つの合成判断として扱います。

## Invariant

- 1段ごとにBackground / Foregroundを説明できる。
- 途中結果をViewerで確認できる。
- 新しい要素を足しても、既存段の責任を曖昧にしない。

## Variants

### Linear chain

順番に1枚ずつ追加します。最も追跡しやすい基本形です。

### Pre-built branch

複数要素を別branchでまとめてから、main chainへ合流させます。branch内部と合流点を別々に検証します。

### Masked stage

特定のMergeだけMaskで適用範囲を制限します。

## Node Choices

このPatternのcanonical nodeはMergeです。特殊な合成目的では別Nodeを使う場合がありますが、「1段の責任を説明できる」ことは維持します。

## Failure Modes

- Foreground / Backgroundを途中で取り違える。
- 複数の変更を1段へ押し込み、中間結果を確認できない。
- Maskの問題とImageの問題を同時に調べる。
- 見た目のNode配置だけで合成順を判断する。

## Recipes Using This Pattern

Recipesは次バッチで追加予定です。

## Related Node Reference

- [Merge](../../nodes/compositing/merge)
