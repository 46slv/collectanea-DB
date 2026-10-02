---
title: 親・追従パラメータ（Master / Follower）を作る
description: 1つの親の値（master）から複数の追従パラメータ（follower）を派生させ、同期と個別オフセットを両立するパターン。
doc_type: pattern
verification: partial
aliases: [master follower, linked parameters, derived values]
concepts: [expressions, parameter-linking, parameter-ownership]
patterns: [master-follower-parameters]
nodes: [Transform]
tasks: [automate, link-values, layout, reuse]
level: intermediate
product_scope: fusion
---

# 親・追従パラメータ（Master / Follower）を作る

## 使う場面（Problem Family）

複数Nodeへ同じ値や比率を手入力し、片方を修正するたびに他がずれる問題です。

## 前提となる考え方（Concepts）

- [Expressions](../../learn/05-time/expressions)
- [Modifier / Parameter Sources](../../learn/05-time/modifier-parameter-sources)
- [User Controlsで公開interfaceを作る](../../learn/06-reuse/user-controls)

## 基本構成（Generic Graph）

```text
master value
  ├─ follower A = master
  ├─ follower B = master + offset
  └─ follower C = master * ratio
```

## 保つべき条件（Invariant）

- 親（Master）は1つ。
- 追従側（Follower）は親との関係だけを持つ。
- オフセット（Offset）/ 比率（Ratio）は意味のあるパラメータとして分離する。
- 型の互換性を確認する。
- 循環参照を作らない。

## バリエーション（Variants）

### 完全追従

親（Master）と同じ値を使います。

### オフセット追従

親（Master）+ 個別オフセット。

### 比率追従

親（Master）× 比率（Ratio）。

### インデックス追従

index / countから規則的な値を派生させます。

## Nodeの選び方（Node Choices）

Expressionを使えるcontrol全般へ適用できます。

複雑な再利用GraphではUser Controlsをmasterとして使う構成もあります。

## 失敗しやすい点（Failure Modes）

- 追従側（Follower）同士が相互参照する。
- 親（Master）が複数存在する。
- Pointとscalarを混同する。
- Node名の変更で参照パスが壊れる。
- 個別オフセットを親（Master）側へ戻して役割が混ざる。

## この構成を使う手順（Recipes）

- [2つのTransform位置を連動する](../../recipes/automation/link-transform-centers)
- [複数要素を等間隔に配置する考え方](../../recipes/automation/equal-spacing-by-index)

## 関連Node

- [Transform](../../nodes/transform/transform)
