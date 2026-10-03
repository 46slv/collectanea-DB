---
title: 平面をtrackしてgraphicへ適用する
description: Planar Trackerで平面動きを解き、graphic側へ適用する責任を分けた基本Recipe。
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

> Planar Trackerからトラッキング 結果を生成・適用する正確な 21.1 UI手順は現在の manual / host確認前です。このページでは、Graph上の役割と診断順序を扱います。

## 作るもの

footage内の平面動きを解き、replacement graphicを同じ動きへ追従させる構造を作ります。

## 必要なもの

- footage
- Planar Tracker
- replacement graphic
- トラッキング 結果を適用する段階

## 手順

1. footageをPlanar Trackerへ渡します。
2. 追跡する平面領域を決めます。
3. トラッキング solveを行います。
4. solve 結果を単独で確認します。
5. replacement graphicへトラッキング dataを適用します。
6. graphicの個別オフセット / scaleはトラッキング solveと別段階で調整します。
7. 最終合成を確認します。

```text
Footage
  → Planar Tracker
  → tracking data
       ↓
Replacement Graphic
  → apply tracked transform
  → composite
```

## この構成で動く理由

トラッキングの精度とgraphic 配置を別々に評価できるため、driftやoffsetの原因を分離できます。

## 別の方法

- Maskを追従させる。
- stabilize用途へ使う。
- planarではなくpoint / camera トラッキングが必要なら別Trackerを選ぶ。

## うまくいかないとき

- トラッキング 参照元自体に十分なplanar detailがあるか。
- solve 結果はgraphicを付ける前から安定しているか。
- resolution / coordinate spaceが合っているか。
- graphic側のmanual アニメーションがトラッキング 結果と競合していないか。

## 関連パターン

- [Trackを解いてから適用先を分ける](../../patterns/tracking/solve-then-apply-track)

## 関連Node

- [Planar Tracker](../../nodes/tracking/planar-tracker)
