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

## 使う場面

3枚以上の画像・Text・graphicを重ねると、どこで結果が崩れたか追いにくくなります。

## 前提となる考え方

- [Graphとして考える](../../learn/01-flow/graph-as-flow)
- [前景（Foreground）/ 背景（Background）/ マスク（Mask）](../../learn/04-compositing/foreground-background-mask)

## 基本構成

```text
Base ─────────────┐
                  ├─ Merge A ────────┐
Element A ────────┘                  ├─ Merge B → Output
Element B ────────────────────────────┘
```

各Mergeを1つの合成判断として扱います。

## 保つべき条件

- 1段ごとにBackground / Foregroundを説明できる。
- 途中結果をViewerで確認できる。
- 新しい要素を足しても、既存段の責任を曖昧にしない。

## バリエーション

### Linear chain

順番に1枚ずつ追加します。最も追跡しやすい基本形です。

### Pre-built 分岐

複数要素を別分岐でまとめてから、main chainへ合流させます。分岐内部と合流点を別々に検証します。

### Masked 段階

特定のMergeだけMaskで適用範囲を制限します。

## Nodeの選び方

このPatternの基本Nodeは[Merge](../../nodes/compositing/merge)です。1段ずつ中間結果を確認したい場合に向きます。

多数の同種Layerを1か所で管理したい場合は[MultiMerge](../../nodes/compositing/multi-merge)も候補になります。Node数の少なさだけで選ばず、どこで中間結果を確認したいか、Layer順をどこで管理したいかで決めます。

## 失敗しやすい点

- Foreground / Backgroundを途中で取り違える。
- 複数の変更を1段へ押し込み、中間結果を確認できない。
- Maskの問題とImageの問題を同時に調べる。
- 見た目のNode配置だけで合成順を判断する。

## この構成を使う手順

- [2つのImageを重ねる](../../recipes/compositing/two-image-merge)
- [複数ImageをMultiMergeでまとめる](../../recipes/compositing/multi-merge-layers)

## 関連Node

- [合成ノード（Compositing）](../../nodes/compositing/)
- [Merge](../../nodes/compositing/merge)
- [MultiMerge](../../nodes/compositing/multi-merge)
