---
title: Trackを解いてから適用先を分ける
description: トラッキング計算と、その結果をgraphic / mask / transformへ適用する責任を分離するPattern。
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

## 使う場面

トラッキングとgraphic配置を同じ段階で調整し続け、driftの原因がtrackなのか適用側なのか分からなくなる問題です。

## 前提となる考え方

- [データ領域（data domain）を辿って診断する](../../learn/07-debugging/trace-data-domain)
- [Center / Pivot / Size / Angle](../../learn/03-space/center-pivot-size-angle)

## 基本構成

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

## 保つべき条件

- トラッキング 参照元を先に確定する。
- solve結果を、適用先の見た目調整と分離する。
- トラッキング spaceとapplication spaceを確認する。
- driftをgraphic側のmanual keyframeで隠さない。
- reference フレーム / 範囲の責任を明示する。

## バリエーション

### Attach graphic

トラッキング dataをgraphic transformへ適用します。

### Stabilize

トラッキング 動きの逆方向を使う構成を検討します。

### Mask follow

Maskのposition / transformへトラッキング dataを適用します。

## Nodeの選び方

Planar Trackerは平面領域のトラッキング（planar region tracking）の代表Nodeです。

トラッキング 結果をどのNode / controlへ渡すかは、正確な 21.1 作業の流れを確認して選びます。

## 失敗しやすい点

- solveが悪いのにgraphic offsetで補正する。
- トラッキング dataのspaceを確認せず別resolutionへ適用する。
- reference timeを変えながらsolve結果も同時に調整する。
- Planar TrackerとCamera Trackerの目的を混同する。

## この構成を使う手順

- [平面をtrackしてgraphicへ適用する](../../recipes/tracking/planar-track-graphic)

## 関連Node

- [Planar Tracker](../../nodes/tracking/planar-tracker)
