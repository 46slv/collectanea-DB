---
title: Last Good / First BadでGraphを切る
description: 長いFlowを、最後に正常な地点と最初に壊れた地点の間へ縮めるdebugging Pattern。
doc_type: pattern
verification: partial
aliases: [last known good, first known bad, graph bisection]
concepts: [branch-isolation, debugging, node-graph]
patterns: [last-good-first-bad]
tasks: [debug, isolate, inspect-output]
level: foundation
product_scope: fusion
---

# Last Good / First BadでGraphを切る

## Problem Family

長いFlowで最終Outputだけが壊れており、どのNodeを調べればよいか分からない状態です。

## Concepts

- [Branchを分離して原因範囲を狭める](../../learn/07-debugging/isolate-branches)
- [症状ではなくGraphを診断する](../../learn/07-debugging/diagnose-graph-not-symptom)

## Generic Graph

```text
A → B → C → D → E → F
        good    bad
          └─ scope ─┘
```

各地点をViewerで観察し、

- **Last Good**: 期待どおりの最後の地点
- **First Bad**: 期待から外れる最初の地点

を特定します。

## Invariant

- 観察地点を明示する。
- 同時に複数条件を変えない。
- sourceから順番に全部触る必要はない。
- branch合流点・data conversion境界を優先して確認する。
- repair後は元の最終症状で再確認する。

## Variants

### Linear chain

中間Nodeを順にViewerへ出します。

### Branching graph

各branchを単体で確認してから合流点を見る。

### Group / Macro

外部input → internal stage → external outputの順で境界を跨ぎます。

## Node Choices

Viewerで中間地点を観察できる任意のGraphへ適用します。

## Failure Modes

- Viewerが別Nodeを表示している。
- temporary bypassを戻し忘れる。
- Last Goodを確認せず、First Badだけ推測する。
- bad Nodeを見つけただけで、bad input dataの可能性を除外する。

## Recipes Using This Pattern

Troubleshooting全般から参照します。

## Related Node Reference

- [Merge](../../nodes/compositing/merge)
- [Blur](../../nodes/blur-filter/blur)
