---
title: Merge chainとMultiMergeを選ぶ
description: 2枚ずつ段階的に合成するMerge chainと、多数Layerを1 Nodeで管理するMultiMergeの責任差を選ぶPattern。
doc_type: pattern
verification: partial
aliases: [Merge vs MultiMerge, multi-layer composite]
concepts: [compositing, foreground-background, parameter-ownership]
patterns: [choose-merge-vs-multimerge]
nodes: [Merge, MultiMerge]
tasks: [composite, layer, choose-structure]
level: intermediate
product_scope: fusion
---

# Merge chainとMultiMergeを選ぶ

## Problem Family

複数要素を重ねるとき、Mergeを何段も繋ぐべきか、MultiMergeへまとめるべきか判断できない状態です。

## Concepts

- [Foreground / Background / Mask](../../learn/04-compositing/foreground-background-mask)
- [Graphとして考える](../../learn/01-flow/graph-as-flow)

## Generic Graph

### Merge chain

```text
Base ────────┐
Element A ───┴─ Merge A ──┐
Element B ─────────────────┴─ Merge B → Output
```

### MultiMerge

```text
Base ────────┐
Element A ───┤
Element B ───┼─ MultiMerge → Output
Element C ───┤
             ┘
```

## Invariant

- 1 stageごとのcompositing責任を説明できる。
- per-layer transform / blend responsibilityのownerを明示する。
- debuggingで中間結果を観察できる。
-「Node数が少ない」だけでMultiMergeを選ばない。
- branch再利用や個別effect chainが必要なら、その構造を優先する。

## When Merge chain fits

- stageごとに別effectを挟む。
- intermediate resultを頻繁に確認する。
- branch構造が複雑。
- 1つずつcompositing reasonを分離したい。

## When MultiMerge fits

- 多数のForeground Layerを1箇所で管理したい。
- per-layer transform / merge controlをまとめたい。
-同種Layerを一覧的に扱う方が読みやすい。

## Failure Modes

- MultiMerge内部へ役割の違う処理を押し込みすぎる。
- Merge chainが長くなり、どのstageが何をしているか名前も構造も読めない。
- 同じelementをMergeとMultiMergeの両方で二重管理する。

## Recipes Using This Pattern

- [複数ImageをMultiMergeでまとめる](../../recipes/compositing/multi-merge-layers)
- [2つのImageを重ねる](../../recipes/compositing/two-image-merge)

## Related Node Reference

- [Merge](../../nodes/compositing/merge)
- [MultiMerge](../../nodes/compositing/multi-merge)
