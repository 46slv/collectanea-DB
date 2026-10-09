---
title: Trackingノード
description: Point・Planar・3D Cameraの追跡方法と、得たtracking dataを別要素へ適用するNodeを目的から選ぶ入口。
doc_type: index
verification: partial
product_scope: fusion
tasks: [lookup-node, track, match-move, stabilize, camera-track]
updated: "2026-10-04"
---

# Trackingノード

FusionのTrackingには、**特徴点を追うPoint Tracking、平面のperspective変化を追うPlanar Tracking、2D footageから3D camera motionを復元するCamera Tracking**があります。

どのTrackerを使うかは、「画面の何を追うか」と「結果を何へ使うか」で決めます。

## まず選ぶ

| 追いたいもの / 目的 | Node | 得られるもの |
| --- | --- | --- |
| 1点または複数の特徴点 | [Tracker](./tracker) | Position / Angle / Size等のtracking data、Match Move / Stabilize |
| 看板・壁・画面など平面 | [Planar Tracker](./planar-tracker) | 平面のperspective distortionを含むtrack |
| Planar trackをImage / Maskへ再利用 | [Planar Transform](./planar-transform) | Planar Trackerの動きを別要素へ適用 |
| 実写cameraの3D movementを復元 | [Camera Tracker](./camera-tracker) | 3D CameraとPoint Cloudを含むscene data |

## Tracker

Trackerは、Image内の特徴点を追います。

Fusion 21.1ではIntelliTrackが既定のpoint trackerで、従来のPoint trackerも選べます。追跡結果はTracker内でMatch Move / Stabilizeへ使えるほか、Steady PositionやUnsteady Position等を別NodeへConnect Toして再利用できます。

## Planar Tracker

Planar Trackerは、1点ではなく平面領域の見え方全体を追います。

license plate、看板、壁、screenなど、camera movementによってperspectiveが変わる面へgraphicを貼る場合に向きます。

Track / Steady / Corner Pin / Stabilizeの4 Operation Modeを持ちます。

## Planar Transform

Planar TrackerでTrackした後、Create Planar Transformを使うとPlanar Transform Nodeを作れます。

このNodeはtracking dataをImageやMaskへ適用する側を担当します。Track計算とgraphic / rotoへの適用を別Nodeへ分けられるため、再利用と診断がしやすくなります。

## Camera Tracker

Camera Trackerは、画面内の固定featureを多数追跡し、実写cameraの3D movementとpoint cloudを復元します。

基本flowは **Track → Camera設定 → Solve → Export** です。2D graphicを平面へ貼るだけならPlanar Trackerの方が直接的で、3D objectを実写sceneへ入れたい場合にCamera Trackerを検討します。

## 「Track」と「適用」を分ける

Trackingの問題は、追跡そのものと、追跡結果を別要素へ適用する処理を分けると原因を確認しやすくなります。

```text
Footage
  ↓
Track / Solve
  ↓
tracking data
  ↓
Apply
  ↓
Graphic / Mask / 3D scene
```

→ [Trackを解いてから適用先を分ける](../../patterns/tracking/solve-then-apply-track)

## 追跡がずれる場合

- Point Trackerで十分な特徴を選べているか
- Planar Trackerなら本当に平面として扱える領域か
- lens distortionが大きくないか
- occlusionがtracking regionへ入っていないか
- PlanarのMotion Typeがshotに合っているか
- track自体ではなく、apply側のoffset / resolution / coordinate spaceでずれていないか

を分けて確認します。

## 関連する考え方

- [Center / Pivot / Size / Angle](../../learn/03-space/center-pivot-size-angle)
- [データ領域（data domain）を辿って診断する](../../learn/07-debugging/trace-data-domain)

## 関連パターン

- [Trackを解いてから適用先を分ける](../../patterns/tracking/solve-then-apply-track)

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 119 pp.2803–2857、Chapter 120 pp.2870–2872、およびFusion Fundamentals Chapters 81 / 82 / 85を基に整理しています。

このFamily OverviewはTrackerの選び分けを担当します。各trackerの全tracking parameter、solver内部仕様、実機性能は個別Referenceへ分けます。
