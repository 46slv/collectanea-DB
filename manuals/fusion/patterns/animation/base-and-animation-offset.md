---
title: Base値とアニメーション Offsetを分ける
description: 配置の基準値とアニメーションによる時間変化を別責任にし、修正しやすい動き 構造を作るPattern。
doc_type: pattern
verification: partial
aliases: [base value, animation offset, motion offset]
concepts: [keyframes, parameter-source, parameter-ownership]
patterns: [base-and-animation-offset]
nodes: [Transform]
tasks: [animate, layout, motion-graphics, debug]
level: intermediate
product_scope: fusion
---

# Base値とアニメーション Offsetを分ける

## 使う場面（Problem Family）

最終positionを直接Keyframeし続けた結果、配置変更と動き調整が同じパラメータへ混ざり、後から修正しにくくなる問題です。

## 前提となる考え方（Concepts）

- [キーフレーム / スプライン / 時間（Keyframe / Spline / Time）](../../learn/05-time/keyframes-spline-time)
- [Modifier / パラメータ Sources](../../learn/05-time/modifier-parameter-sources)
- [Center / Pivot / Size / Angle](../../learn/03-space/center-pivot-size-angle)

## 基本構成（Generic Graph）

```text
base layout
    +
animation offset
    ↓
final parameter
```

実装方法はNode構造やExpression等で変わっても、**静的な基準値と時間変化を別責任にする**ことが中心です。

## 保つべき条件（Invariant）

- base 配置はアニメーションの開始フレームに依存しない。
- アニメーションはbaseからの差分として理解できる。
- 配置修正だけで動き curveを書き直さない。
- 動き調整だけでstatic alignmentを壊さない。
- 基準となる値を二重化しない。

## バリエーション（Variants）

### Separate Transform

upstream Transformでbase 配置、downstream Transformでアニメーションを持ちます。

### Expression 関係

base パラメータとanimated offsetを計算で合成します。

### User Control

templateではbase / 動き amountを意味controlとして分けます。

## Nodeの選び方（Node Choices）

Transformを2段に分ける構成は責任を視覚化しやすい候補です。

## 失敗しやすい点（Failure Modes）

- final Centerを直接すべてKeyframeして配置修正と競合する。
- offset値とabsolute positionを混同する。
- base / アニメーションを複数Nodeへ重複して持つ。

## この構成を使う手順（Recipes）

- [TransformをKeyframeで動かす](../../recipes/animation/animate-transform-center)

## 関連Node

- [Transform](../../nodes/transform/transform)
