---
title: Expressionで値の関係を保つ
description: 手動同期をやめ、基準（Master）パラメータと派生（Derived）パラメータの関係として設計するPattern。
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

> Expressionの正確な構文（syntax）は21.1 Reference Manual / 実機で再確認前です。このPatternは関係設計を説明の正本とします。

## 使う場面（Problem Family）

同じ変更を複数controlへ繰り返し入力しており、片方を直すたびに他がずれる状態です。

## 前提となる考え方（Concepts）

- [式（Expressions）](../../learn/05-time/expressions)
- [Image / Mask / Dataを分ける](../../learn/02-data/image-mask-data)

## 基本構成（Generic Graph）

```text
master parameter
      ↓
relation / expression
      ↓
derived parameter(s)
```

## 保つべき条件（Invariant）

- 基準値（Master）は1箇所に置く。
- followerは「同じ値」ではなく「どんな関係か」を持つ。
- 参照パスと期待typeを確認する。
- 関係が複雑になったらUser Controlsなど、より明示的な管理元へ昇格することを検討する。

## バリエーション（Variants）

### Direct 関係

親（Master）と同じ値を使います。

### Ratio

masterに係数を掛けて派生値を作ります。

### Offset

masterへ一定量を加減します。

### Indexed distribution

indexと個数を使い、複数要素へ規則的な値を割り当てます。

## Nodeの選び方（Node Choices）

Expressionが使えるcontrolなら広く応用できますが、Instance / Modifier / User Controlsなど別の構造が適切な場合もあります。選択基準は「誰が値を所有するか」です。

## 失敗しやすい点（Failure Modes）

- 参照先Nodeをrenameしてpathが壊れる。
- scalarとPointなど、期待typeを無視する。
- 親（Master）/ 追従（Follower）が逆転し、循環参照に近い構造になる。
- 1行の式へ複数責任を押し込み、変更理由が読めなくなる。

## この構成を使う手順（Recipes）

Recipesは次バッチで追加予定です。

## 関連Node

- [Transform](../../nodes/transform/transform)
- [Merge](../../nodes/compositing/merge)
