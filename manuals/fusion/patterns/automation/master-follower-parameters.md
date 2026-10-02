---
title: Master / Follower parameterを作る
description: 1つのmaster valueから複数parameterを派生させ、同期と個別offsetを両立するPattern。
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

# Master / Follower parameterを作る

## Problem Family

複数Nodeへ同じ値や比率を手入力し、片方を修正するたびに他がずれる問題です。

## Concepts

- [Expressions](../../learn/05-time/expressions)
- [Modifier / Parameter Sources](../../learn/05-time/modifier-parameter-sources)
- [User Controlsで公開interfaceを作る](../../learn/06-reuse/user-controls)

## Generic Graph

```text
master value
  ├─ follower A = master
  ├─ follower B = master + offset
  └─ follower C = master * ratio
```

## Invariant

- masterは1つ。
- followerは関係だけを持つ。
- offset / ratioを意味のあるparameterとして分離する。
- type compatibilityを確認する。
- circular dependencyを作らない。

## Variants

### Exact follow

masterと同じ値を使います。

### Offset follow

master + local offset。

### Ratio follow

master × ratio。

### Indexed follow

index / countから規則的な値を派生させます。

## Node Choices

Expressionを使えるcontrol全般へ適用できます。

複雑な再利用GraphではUser Controlsをmasterとして使う構成もあります。

## Failure Modes

- follower同士が相互参照する。
- masterが複数存在する。
- Pointとscalarを混同する。
- Node renameでreference pathが壊れる。
- local offsetをmasterへ戻して責任が混ざる。

## Recipes Using This Pattern

- [2つのTransform位置を連動する](../../recipes/automation/link-transform-centers)
- [複数要素を等間隔に配置する考え方](../../recipes/automation/equal-spacing-by-index)

## Related Node Reference

- [Transform](../../nodes/transform/transform)
