---
title: Trackingノード
description: Point・Planar・Surface・3D Cameraの追跡方法と、得たtracking dataを別要素へ適用するNodeを目的から選ぶ入口。
doc_type: index
verification: partial
product_scope: fusion
tasks: [lookup-node, track, surface-track, match-move, stabilize, camera-track]
updated: "2026-10-22"
---

# Trackingノード

FusionのTrackingには、**画像内の特徴点を追うTracker、平面の動きを追うPlanar Tracker、布などの変形する面を追うSurface Tracker、実写映像から3Dカメラの動きを復元するCamera Tracker**があります。

どのTrackerを使うかは、「画面の何を追うか」と「結果を何へ使うか」で決めます。

## まず選ぶ

| 追いたいもの / 目的 | Node | 得られるもの |
| --- | --- | --- |
| 1点または複数の特徴点 | [Tracker](./tracker) | Position / Angle / Size等のtracking data、Match Move / Stabilize |
| 看板・壁・画面など平面 | [Planar Tracker](./planar-tracker) | 平面のperspective distortionを含むtrack |
| しわの寄る布・伸縮する肌など柔らかい面 | [Surface Tracker](./surface-tracker) | 面内のメッシュ変形を追い、Overlay合成・安定化・再変形に利用 |
| Planar trackをImage / Maskへ再利用 | [Planar Transform](./planar-transform) | Planar Trackerの動きを別要素へ適用 |
| 実写cameraの3D movementを復元 | [Camera Tracker](./camera-tracker) | 3D CameraとPoint Cloudを含むscene data |

## 用途別の制作手順

同じ追跡ノードでも、追跡後に画像を貼るのか、マスクだけを渡すのか、元映像を安定化するのかで接続が変わります。必要な素材と完成させたい映像から選んでください。

| 作りたい結果 | 入力から出力まで | 手順 |
| --- | --- | --- |
| **車のドアノブに説明ラベルを追従させる** | 車の映像をTrackerで1点追い、Connect ToでText+のTransformへ位置を渡してから、Mergeで元映像へ重ねる。 | [Trackerで文字を追従させる](../../recipes/tracking/point-track-text-callout) |
| **動く看板へロゴを貼る** | 看板の実写をPlanar Trackerで解析し、別入力の透明ロゴをPlanar Transformで動かしてMergeで合成する。 | [平面追跡で看板にロゴを貼る](../../recipes/tracking/planar-track-graphic) |
| **カメラが動く映像の壁の汚れを消す** | 壁をPlanar Trackerで追跡・固定し、透明レイヤーのPaintで補修してから、同じ追跡データで逆変形し元の動きへ戻す。 | [Planar Trackerで固定・Paint・逆変形](../../recipes/tracking/planar-steady-paint-rewarp) |
| **看板のロゴを通行人の背後へ隠す** | Planar Trackerでロゴを追従させた後、人物を切り抜いた元映像を別のMergeで前景へ戻す。追跡除外用マスクだけでは前後関係は作れない。 | [平面追跡したロゴの前景遮蔽](../../recipes/tracking/planar-foreground-occlusion) |
| **シャツのしわにロゴをなじませる** | シャツの映像と透明ロゴをSurface Trackerへ入力し、布のメッシュ変形に沿ってロゴを変形・合成する。 | [Surface Trackerでシャツへロゴを貼る](../../recipes/tracking/surface-track-shirt-logo) |
| **動く肌の小さな傷を直す** | 肌をSurface Trackerで固定した映像にPaintで修正を加え、同じ追跡データで再変形して元の動きへ戻す。 | [Surface Trackerで固定・修正・再変形](../../recipes/tracking/surface-track-stabilize-rewarp-skin-fix) |
| **動く服の一部分だけ色補正する** | Surface TrackerのメッシュまたはPolygonから追従アルファを作り、元映像を補正するColor CorrectorのEffect Maskへ渡す。 | [追従マスクを色補正へ使う](../../recipes/tracking/surface-track-alpha-effect-mask) |
| **実写の床へ3Dオブジェクトを置く** | Camera Trackerでカメラの動きと3Dの点群を求め、ExportしたCamera 3Dを使ってCGをレンダリングし実写と合成する。 | [Camera Trackerから3Dオブジェクトを合成](../../recipes/3d/camera-track-3d-object) |

追跡点や平面が滑る場合は[追跡がずれる原因の切り分け](../../troubleshooting/tracking/track-drifts)、**Point Trackerの模様が隠れたり画面外へ出たりする場合**は[追跡パスの復旧](../../troubleshooting/tracking/point-tracker-pattern-lost)、3DカメラのSolveに失敗する場合は[Camera TrackerのSolveと3D合成の診断](../../troubleshooting/tracking/camera-solve-or-3d-composite-fails)へ進んでください。

## Tracker

Trackerは、Image内の特徴点を追います。

Fusion 21.1ではIntelliTrackが既定のpoint trackerで、従来のPoint trackerも選べます。追跡結果はTracker内でMatch Move / Stabilizeへ使えるほか、Steady PositionやUnsteady Position等を別NodeへConnect Toして再利用できます。

## Planar Tracker

Planar Trackerは、1点ではなく平面領域の見え方全体を追います。

license plate、看板、壁、screenなど、camera movementによってperspectiveが変わる面へgraphicを貼る場合に向きます。

Track / Steady / Corner Pin / Stabilizeの4 Operation Modeを持ちます。

## Surface Tracker

Surface Trackerは、布や皮膚のように**面の内部が曲がる・伸びる対象**をメッシュで追います。たとえばシャツの動画と透明ロゴを入力し、胸の表面のしわに合わせてロゴを変形・合成できます。手前の腕を追跡から除外するOcclusion Maskと、結果の適用範囲を決めるEffect Maskは別の入力です。

一枚の平面の動きだけならPlanar Trackerを選び、追跡した面を一度固定してPaint等で修正したいときはSurface TrackerのStabilize-Warp → Rewarpを使います。詳しい手順は[Surface Tracker](./surface-tracker)を参照してください。

## Planar Transform

Planar TrackerでTrackした後、Create Planar Transformを使うとPlanar Transform Nodeを作れます。

このNodeはtracking dataをImageやMaskへ適用する側を担当します。Track計算とgraphic / rotoへの適用を別Nodeへ分けられるため、再利用と診断がしやすくなります。

## Camera Tracker

Camera Trackerは、画面内の固定featureを多数追跡し、実写cameraの3D movementとpoint cloudを復元します。

基本flowは **Track → Camera設定 → Solve → Export** です。2D graphicを平面へ貼るだけならPlanar Trackerの方が直接的で、3D objectを実写sceneへ入れたい場合にCamera Trackerを検討します。

## 「Track」と「適用」を分ける

追跡が正しいかと、追跡結果が画像・マスクへ正しく適用されているかは別々に確認します。**追跡データが、画像ケーブルで次のノードへ送られるとは限りません。** たとえばPlanar Trackerの物理的な出力は2D Imageです。平面の動きは内部の**Track spline**（フレームごとの遠近変形データ）に記録され、Inspectorの**Create Planar Transform**から作成したPlanar TransformがそのSplineを参照します。

看板へロゴを貼る場合の接続例です。「Create Planar Transform」はノード作成と追跡データの共有を示し、画像同士を結ぶケーブルではありません。

```text
【追跡】看板映像 → Planar Tracker（Track実行）
                      └─ Create Planar Transform（Track splineを共有）

【合成】透過ロゴ → Transform（基準フレームで位置合わせ）
                → Planar Transform → Merge（Foreground） ┐
        看板映像 ────────────────────→ Merge（Background） ┴→ MediaOut
```

**Point Tracker**の追跡位置などを別ノードのパラメーターへ使う場合も、単に画像出力をつなぐのではなく、対象のパラメーターから**Connect To**で追跡値を参照します。**Camera Tracker**ではTrack / Solve後のExportで3Dカメラや点群を使うため、Planar Transformとは受け渡し方が異なります。個別の手順は[Planar Transform](./planar-transform)、[Tracker](./tracker)、[Camera Tracker](./camera-tracker)を参照してください。

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
