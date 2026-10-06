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
- 「Node数が少ない」だけでMultiMergeを選ばない。
- 分岐再利用や個別effect chainが必要なら、その構造を優先する。

## Merge chainが向く場合

- 段階ごとに別Effectを挟む。
- 中間結果を頻繁にViewerで確認する。
- 分岐構造が複雑。
- 1つずつ合成の役割を分けたい。

## MultiMergeが向く場合

- 多数のForeground Layerを1箇所で管理したい。
- Layer Listで順序を入れ替えたい。
- Layer単位でEnable / Disableや素材差し替えを行いたい。
- 各LayerのTransform / Merge controlsを同じInspectorで管理したい。
- 同種Layerを一覧的に扱う方が読みやすい。

## 失敗しやすい点

- MultiMerge内部へ役割の違う処理を押し込みすぎる。
- Merge chainが長くなり、どの段階が何をしているか名前も構造も読めない。
- 同じelementをMergeとMultiMergeの両方で二重管理する。

## この構成を使う手順

- [複数ImageをMultiMergeでまとめる](../../recipes/compositing/multi-merge-layers)
- [2つのImageを重ねる](../../recipes/compositing/two-image-merge)

## 関連Node

- [合成ノード（Compositing）](../../nodes/compositing/)
- [Merge](../../nodes/compositing/merge)
- [MultiMerge](../../nodes/compositing/multi-merge)

## 21.1で確認できる違い

DaVinci Resolve 21.1 Reference Manualでは、MultiMergeはForegroundを追加するたびにLayer Listへ新しいLayerを作り、Layer順、Enable / Disable、素材差し替え、Layerごとの独立Merge controlsを管理できます。

Merge chainでは各MergeがGraph上に独立して残るため、間へ別Nodeを挟み、中間結果を直接Viewerへ出す構造を保ちやすくなります。
