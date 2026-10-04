---
title: Tracker
description: 2D Image内の特徴点の動きを解析し、Match MoveやStabilize、別Nodeの位置Controlへ使う基本Tracker。
doc_type: node
term_id: tracker
verification: partial
aliases: [Tracker, Point Tracker]
concepts: [tracking, parameter-data, coordinate-space]
nodes: [Tracker]
node_family: tracking
controls: [IntelliTrack, Point, Tracker List, Pattern Rectangle, Search Rectangle, Track Buttons, Operation, Pivot Type, Reference Time]
inputs: [image, image, mask]
outputs: [image, tracking]
tasks: [track, point-track, match-move, stabilize]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# Tracker

Trackerは、2D <Term id="image">Image</Term>内の特徴点の動きを解析し、その結果をMatch Move、Stabilize、Corner Positioning、別Nodeの位置Controlなどへ使うNodeです。

Planar Trackerが面全体のperspective変化を扱うのに対し、Trackerは比較的小さく識別しやすいfeatureやpatternを基準にします。

## 入力

### Background

オレンジ色の入力です。解析対象の2D Imageを接続します。

### Foreground

緑色の任意入力です。Tracker自身でMatch MoveやCorner / Perspective Positioningを行う場合、Backgroundへ合わせるImageを接続します。

### Effect Mask

青色の任意入力です。解析対象の範囲を限定します。

## IntelliTrackとPoint

DaVinci Resolve 21.1ではIntelliTrackが既定です。従来のPoint trackerもPoint buttonから選択できます。

Point trackerではViewerに2つの矩形が表示されます。

- **Pattern Rectangle** — 基準として比較するpixel pattern
- **Search Rectangle** — 次frameでpatternを探す範囲

速いmovementではSearch Rectangleを広げる必要がありますが、広げるほど計算量も増えます。

## 複数pattern

1つのTracker Node内へ複数patternを追加できます。

Tracker Listでは各patternを選択・renameし、Enabled / Suspended / Disabledを管理します。

複数patternを使うと位置だけでなくrotationやscaleの変化も利用できます。Steady Angle / Steady Sizeには少なくとも2つのpatternが必要です。

## 結果の使い方

Trackerは解析結果をNode内部のMatch Moveへ使うだけでなく、別NodeのControlへ公開できます。

代表的な出力:

- **Offset Position** — 元のmotion path
- **Steady Position** — movementを打ち消すposition
- **Unsteady Position** — Stabilize後に元のmovementを戻すposition
- **Steady Angle / Size** — rotation / scale変化を打ち消す値

```text
Footage → Tracker
            └─ Offset Position → Transform Center
```

## Operation / Reference Time

Operation tabではtracking dataをMatch MoveやStabilizeへどう適用するかを決めます。

Reference Timeは、どのframeを基準状態として扱うかを決めます。Start / End / current / custom等の選択肢があります。

## 最小構成

```text
Footage → Tracker

Graphic → Transform → Merge
             ↑
       Tracker Offset Position
```

解析するbranchと、graphicへ適用するbranchを分けると、解析結果のずれとgraphic側のoffsetを別々に確認できます。

## Tracker Modifier

Center等のControlへTracker Modifierを直接付ける方法もあります。

Modifierは1 patternだけを扱う簡易用途向けで、複数patternを使うMatch MoveやStabilizeではTracker Nodeの方が適しています。

## Planar Trackerとの違い

- **Tracker** — point / small featureのmotion
- **Planar Tracker** — 平面領域のperspective distortion
- **Camera Tracker** — 多数featureから3D camera motionを復元

## 関連する考え方

- [Trackを解いてから適用先を分ける](../../patterns/tracking/solve-then-apply-track)
- [Center / Pivot / Size / Angle](../../learn/03-space/center-pivot-size-angle)

## 関連Node

- [Planar Tracker](./planar-tracker)
- [Planar Transform](./planar-transform)
- [Camera Tracker](./camera-tracker)
- [Transform](../transform/transform)

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 119 pp.2839–2857とFusion Fundamentals Chapter 81で、3入力、IntelliTrack既定、Point tracker、Pattern / Search Rectangle、複数pattern、published outputs、Match Move settingsを確認しました。

tracking algorithmの内部仕様、全Controlの数値範囲、実機精度・性能は未確認のため `verification: partial` としています。
