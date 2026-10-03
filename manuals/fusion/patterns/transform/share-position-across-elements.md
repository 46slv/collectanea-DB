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

## 使う場面

複数要素を同じ位置へ置く、または一定のoffsetを保ちたいのに、それぞれのCenterを手で直している状態です。

## 前提となる考え方

- [正規化座標（Normalized Coordinates）](../../learn/03-space/normalized-coordinates)
- [式（Expressions）](../../learn/05-time/expressions)

## 基本構成

```text
基準位置（Master position）
   ├─ element A
   ├─ element B
   └─ element C + offset
```

重要なのはExpressionそのものではなく、**位置の基準となる値を1つにする**ことです。

## 保つべき条件

- masterがどれか説明できる。
- follower側はmasterとの関係だけを持つ。
- offsetが必要なら独立した意味として表す。
- 異なるNode family間ではspaceが本当に互換か確認する。

## バリエーション

### 完全に同じ位置を共有する

複数要素が同じPointを参照します。

### 共有位置 + オフセット（Shared position + offset）

基準位置（Master position）から一定量だけずらします。

### Distributed positions

min / max / index / countのような基準から、複数位置を計算します。

## Nodeの選び方

Transformを位置責任の管理元にすると読みやすい場合があります。Merge側のtransform controlを使う場合は、どこで配置責任を持つかをFlow全体で統一します。

## 失敗しやすい点

- masterが複数あり、相互参照になる。
- Nodeごとにspaceが違うのに同じPointをそのまま流用する。
- offsetを各followerへ手入力し、再び同期が崩れる。
- 位置・scale・rotationを一度に連動させ、原因を切り分けられなくする。

## この構成を使う手順

Recipesは次バッチで追加予定です。

## 関連Node

- [Transform](../../nodes/transform/transform)
- [Merge](../../nodes/compositing/merge)
