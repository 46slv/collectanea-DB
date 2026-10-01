---
title: Expressionで値の関係を保つ
description: 手動同期をやめ、master parameterとderived parameterの関係として設計するPattern。
doc_type: pattern
verification: unverified
aliases: [Expression link, derived value]
concepts: [expressions, parameter-linking, derived-values]
patterns: [link-values-with-expression]
nodes: [Transform, Merge]
tasks: [automate, link-values, derive-values]
level: foundation
product_scope: fusion
---

# Expressionで値の関係を保つ

> Expressionのexact syntaxは21.1 Reference Manual / hostで再確認前です。このPatternは関係設計をcanonical ownerとします。

## Problem Family

同じ変更を複数controlへ繰り返し入力しており、片方を直すたびに他がずれる状態です。

## Concepts

- [Expressions](../../learn/05-time/expressions)
- [Image / Mask / Dataを分ける](../../learn/02-data/image-mask-data)

## Generic Graph

```text
master parameter
      ↓
relation / expression
      ↓
derived parameter(s)
```

## Invariant

- master valueは1箇所に置く。
- followerは「同じ値」ではなく「どんな関係か」を持つ。
- reference pathと期待typeを確認する。
- relationが複雑になったらUser Controlsなど、より明示的なownerへ昇格することを検討する。

## Variants

### Direct relation

masterと同じ値を使います。

### Ratio

masterに係数を掛けて派生値を作ります。

### Offset

masterへ一定量を加減します。

### Indexed distribution

indexと個数を使い、複数要素へ規則的な値を割り当てます。

## Node Choices

Expressionが使えるcontrolなら広く応用できますが、Instance / Modifier / User Controlsなど別の構造が適切な場合もあります。選択基準は「誰が値を所有するか」です。

## Failure Modes

- 参照先Nodeをrenameしてpathが壊れる。
- scalarとPointなど、期待typeを無視する。
- master / followerが逆転し、循環参照に近い構造になる。
- 1行の式へ複数責任を押し込み、変更理由が読めなくなる。

## Recipes Using This Pattern

Recipesは次バッチで追加予定です。

## Related Node Reference

- [Transform](../../nodes/transform/transform)
- [Merge](../../nodes/compositing/merge)
