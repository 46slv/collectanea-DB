---
title: 複数要素の位置関係を共有する
description: 複数Nodeのpositionを独立調整せず、1つの基準から関係を保つPattern。
doc_type: pattern
verification: unverified
aliases: [shared position, linked center]
concepts: [normalized-coordinates, parameter-linking]
patterns: [share-position-across-elements]
nodes: [Transform, Merge]
tasks: [align, layout, link-values]
level: foundation
product_scope: fusion
---

# 複数要素の位置関係を共有する

> 具体的なExpression構文・各Nodeのspace互換性は21.1 host / manualで再検証前です。

## Problem Family

複数要素を同じ位置へ置く、または一定のoffsetを保ちたいのに、それぞれのCenterを手で直している状態です。

## Concepts

- [Normalized Coordinates](../../learn/03-space/normalized-coordinates)
- [Expressions](../../learn/05-time/expressions)

## Generic Graph

```text
master position
   ├─ element A
   ├─ element B
   └─ element C + offset
```

重要なのはExpressionそのものではなく、**位置のsource of truthを1つにする**ことです。

## Invariant

- masterがどれか説明できる。
- follower側はmasterとの関係だけを持つ。
- offsetが必要なら独立した意味として表す。
- 異なるNode family間ではspaceが本当に互換か確認する。

## Variants

### Exact shared position

複数要素が同じPointを参照します。

### Shared position + offset

master positionから一定量だけずらします。

### Distributed positions

min / max / index / countのような基準から、複数位置を計算します。

## Node Choices

Transformを位置責任のownerにすると読みやすい場合があります。Merge側のtransform controlを使う場合は、どこで配置責任を持つかをFlow全体で統一します。

## Failure Modes

- masterが複数あり、相互参照になる。
- Nodeごとにspaceが違うのに同じPointをそのまま流用する。
- offsetを各followerへ手入力し、再び同期が崩れる。
- 位置・scale・rotationを一度に連動させ、原因を切り分けられなくする。

## Recipes Using This Pattern

Recipesは次バッチで追加予定です。

## Related Node Reference

- [Transform](../../nodes/transform/transform)
- [Merge](../../nodes/compositing/merge)
