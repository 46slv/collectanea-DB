---
title: 平面をtrackしてgraphicへ適用する
description: Planar Trackerで平面motionを解き、graphic側へ適用する責任を分けた基本Recipe。
doc_type: recipe
verification: partial
aliases: [planar track graphic, screen replacement]
concepts: [tracking, coordinate-space]
patterns: [solve-then-apply-track]
nodes: [Planar Tracker]
tasks: [track, attach-graphics, screen-replace]
prerequisites: [data-domain]
level: intermediate
product_scope: fusion
---

# 平面をtrackしてgraphicへ適用する

> Planar Trackerからtracking resultを生成・適用するexact 21.1 UI手順はcurrent manual / host確認前です。このページはGraph責任と診断順序を正本とします。

## Result

footage内の平面motionを解き、replacement graphicを同じmotionへ追従させる構造を作ります。

## Requirements

- footage
- Planar Tracker
- replacement graphic
- tracking resultを適用するstage

## Steps

1. footageをPlanar Trackerへ渡します。
2. 追跡する平面領域を決めます。
3. tracking solveを行います。
4. solve resultを単独で確認します。
5. replacement graphicへtracking dataを適用します。
6. graphicのlocal offset / scaleはtracking solveと別stageで調整します。
7. 最終compositeを確認します。

```text
Footage
  → Planar Tracker
  → tracking data
       ↓
Replacement Graphic
  → apply tracked transform
  → composite
```

## Why This Works

trackingの精度とgraphic layoutを別々に評価できるため、driftやoffsetの原因を分離できます。

## Variants / Alternatives

- Maskを追従させる。
- stabilize用途へ使う。
- planarではなくpoint / camera trackingが必要なら別Trackerを選ぶ。

## Failure Checks

- tracking source自体に十分なplanar detailがあるか。
- solve resultはgraphicを付ける前から安定しているか。
- resolution / coordinate spaceが合っているか。
- graphic側のmanual animationがtracking resultと競合していないか。

## Related Pattern

- [Trackを解いてから適用先を分ける](../../patterns/tracking/solve-then-apply-track)

## Related Nodes

- [Planar Tracker](../../nodes/tracking/planar-tracker)
