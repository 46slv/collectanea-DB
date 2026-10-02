---
title: Base値とAnimation Offsetを分ける
description: layoutの基準値とanimationによる時間変化を別責任にし、修正しやすいmotion structureを作るPattern。
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

# Base値とAnimation Offsetを分ける

## Problem Family

最終positionを直接Keyframeし続けた結果、layout変更とmotion調整が同じparameterへ混ざり、後から修正しにくくなる問題です。

## Concepts

- [Keyframe / Spline / Time](../../learn/05-time/keyframes-spline-time)
- [Modifier / Parameter Sources](../../learn/05-time/modifier-parameter-sources)
- [Center / Pivot / Size / Angle](../../learn/03-space/center-pivot-size-angle)

## Generic Graph

```text
base layout
    +
animation offset
    ↓
final parameter
```

実装方法はNode構造やExpression等で変わっても、**静的な基準値と時間変化を別責任にする**ことが中心です。

## Invariant

- base layoutはanimationの開始frameに依存しない。
- animationはbaseからの差分として理解できる。
- layout修正だけでmotion curveを書き直さない。
- motion調整だけでstatic alignmentを壊さない。
- source of truthを二重化しない。

## Variants

### Separate Transform

upstream Transformでbase layout、downstream Transformでanimationを持ちます。

### Expression relation

base parameterとanimated offsetを計算で合成します。

### User Control

templateではbase / motion amountを意味controlとして分けます。

## Node Choices

Transformを2段に分ける構成は責任を視覚化しやすい候補です。

## Failure Modes

- final Centerを直接すべてKeyframeしてlayout修正と競合する。
- offset値とabsolute positionを混同する。
- base / animationを複数Nodeへ重複して持つ。

## Recipes Using This Pattern

- [TransformをKeyframeで動かす](../../recipes/animation/animate-transform-center)

## Related Node Reference

- [Transform](../../nodes/transform/transform)
