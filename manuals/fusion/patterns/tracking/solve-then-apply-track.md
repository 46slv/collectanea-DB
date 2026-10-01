---
title: Trackを解いてから適用先を分ける
description: tracking計算と、その結果をgraphic / mask / transformへ適用する責任を分離するPattern。
doc_type: pattern
verification: partial
aliases: [solve then apply, tracking data]
concepts: [tracking, parameter-data, coordinate-space]
patterns: [solve-then-apply-track]
nodes: [Planar Tracker]
tasks: [track, attach-graphics, stabilize, debug]
level: intermediate
product_scope: fusion
---

# Trackを解いてから適用先を分ける

## Problem Family

trackingとgraphic配置を同じstageで調整し続け、driftの原因がtrackなのか適用側なのか分からなくなる問題です。

## Concepts

- [Data domainを辿って診断する](../../learn/07-debugging/trace-data-domain)
- [Center / Pivot / Size / Angle](../../learn/03-space/center-pivot-size-angle)

## Generic Graph

```text
footage
  ↓
tracking solve
  ↓
tracking data
  ↓
application stage
  ↓
graphic / mask / transform
```

solveとapplyを別責任として観察します。

## Invariant

- tracking sourceを先に確定する。
- solve結果を、適用先の見た目調整と分離する。
- tracking spaceとapplication spaceを確認する。
- driftをgraphic側のmanual keyframeで隠さない。
- reference frame / rangeの責任を明示する。

## Variants

### Attach graphic

tracking dataをgraphic transformへ適用します。

### Stabilize

tracking motionの逆方向を使う構成を検討します。

### Mask follow

Maskのposition / transformへtracking dataを適用します。

## Node Choices

Planar Trackerはplanar region trackingの代表Nodeです。

tracking resultをどのNode / controlへ渡すかは、exact 21.1 workflowを確認して選びます。

## Failure Modes

- solveが悪いのにgraphic offsetで補正する。
- tracking dataのspaceを確認せず別resolutionへ適用する。
- reference timeを変えながらsolve結果も同時に調整する。
- Planar TrackerとCamera Trackerの目的を混同する。

## Recipes Using This Pattern

- [平面をtrackしてgraphicへ適用する](../../recipes/tracking/planar-track-graphic)

## Related Node Reference

- [Planar Tracker](../../nodes/tracking/planar-tracker)
