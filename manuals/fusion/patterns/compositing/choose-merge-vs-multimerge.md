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

## 使う場面

複数要素を重ねるとき、Mergeを何段も繋ぐべきか、MultiMergeへまとめるべきか判断できない状態です。

## 前提となる考え方

- [前景（Foreground）/ 背景（Background）/ マスク（Mask）](../../learn/04-compositing/foreground-background-mask)
- [Graphとして考える](../../learn/01-flow/graph-as-flow)

## 基本構成

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

## 保つべき条件

- 1 段階ごとの合成責任を説明できる。
- per-layer transform / blend 役割の管理元を明示する。
- 診断で中間結果を観察できる。
-「Node数が少ない」だけでMultiMergeを選ばない。
- 分岐再利用や個別effect chainが必要なら、その構造を優先する。

## When Merge chain fits

- 段階ごとに別effectを挟む。
- intermediate 結果を頻繁に確認する。
- 分岐構造が複雑。
- 1つずつ合成 reasonを分離したい。

## When MultiMerge fits

- 多数のForeground Layerを1箇所で管理したい。
- per-layer transform / merge controlをまとめたい。
-同種Layerを一覧的に扱う方が読みやすい。

## 失敗しやすい点

- MultiMerge内部へ役割の違う処理を押し込みすぎる。
- Merge chainが長くなり、どの段階が何をしているか名前も構造も読めない。
- 同じelementをMergeとMultiMergeの両方で二重管理する。

## この構成を使う手順

- [複数ImageをMultiMergeでまとめる](../../recipes/compositing/multi-merge-layers)
- [2つのImageを重ねる](../../recipes/compositing/two-image-merge)

## 関連Node

- [Merge](../../nodes/compositing/merge)
- [MultiMerge](../../nodes/compositing/multi-merge)
