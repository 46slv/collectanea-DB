---
title: Camera TrackerのSolveが失敗する・3D合成がずれる
description: 追跡点、カメラ解析、3Dシーンの位置合わせ、最終合成を分けて原因を調べる。
doc_type: diagnostic
verification: partial
aliases: [camera solve error, Camera Tracker失敗, camera track mismatch]
concepts: [tracking-data, classic-3d]
patterns: [solve-then-apply-track]
nodes: [Camera Tracker, Camera 3D, Point Cloud 3D, Merge 3D, Renderer 3D, Merge]
tasks: [debug, camera-track, solve-camera, 3d-match-move]
symptoms: [camera-solve-fails, camera-match-move-offset, camera-background-duplicated]
prerequisites: [classic-3d, tracking-data]
level: intermediate
product_scope: fusion
updated: "2026-10-21"
---

# Camera TrackerのSolveが失敗する・3D合成がずれる

廊下を撮影した映像にCGの立方体を置こうとして、カメラの解析が失敗したり、立方体が床から滑ったりする場合の診断手順です。**追跡点を見つけるTrack、カメラの動きを計算するSolve、3Dシーンへの書き出し、元映像との合成**を別々に確認します。

ここでいうSolveは、映像内の複数の特徴点から撮影カメラの位置・向きと点群（追跡した地点のおおよその3D位置）を求める処理です。画面上のロゴだけがずれる場合は、先に[2Dのトラッキングずれ](./track-drifts)を確認してください。

## まず確認すること

| 症状 | 最初に見る場所 | 判断の手がかり |
| --- | --- | --- |
| Auto Trackで追跡点が少ない | Camera Trackerの2D Viewer | 床・壁・遠景の静止した模様を拾えているか |
| Solveが失敗する、カメラが飛ぶ | Track結果とCamera / Solveタブ | 視差、焦点距離、Film Gate、動く物体の追跡 |
| Average Solve Errorが大きい | Solveタブと再投影点 | 元の追跡点と3Dから投影し直した位置が離れていないか |
| 数値は小さいのにCGが滑る | CG付近の再投影点とExportしたCamera 3D | その場所の追跡誤差、床面・原点、書き出し後の更新 |
| 3D Viewerでは見えるが映像に出ない | Merge 3D → Renderer 3D → 2D Merge | 3Dシーンを画像へ変換しているか、描画カメラが正しいか |
| 背景が二重になる | Camera 3DのImage Planeと2D Merge | 元映像を2回描いていないか |

まず冒頭・中盤・終盤の3フレームを比較します。**平均値が良くても、CGを置く近くの点群がずれていれば、そのCGは正しく固定されません。**

## 原因を切り分ける

### 1. Track：映像から適切な点を拾えているか

Camera Trackerを2D Viewerへ表示し、**Preview AutoTrack Locations**で追跡候補を見ます。検出点が足りなければ**Detection Threshold**や**Minimum Feature Separation**を調整します。値を下げると候補が増えますが、無闇に増やすと重くなるため、点の数よりも**画面内の分布、異なる奥行き、追跡が続く長さ**を優先します。

追跡すべきなのは、床の目地、壁の角、固定された看板など、カメラ以外の理由では動かない特徴です。人、走行中の車、反射、揺れる植物、移動するハイライトに付いた点はSolveを乱します。**Auto Track**後に点が実際の模様を追い続けているか確認します。

動く人物などを追跡から外すにはCamera Trackerのマスク入力を利用できます。ただし、**21.1 Reference Manualにはマスクの白黒に関する記述の不一致**があります。Chapter 119 p.2805は白を除外領域と説明し、Chapter 85 p.1879は白を解析対象としています。実機仕様はこの資料だけでは確定できません。マスクを接続した状態と外した状態で追跡候補を比較し、除外したい物体の上に候補が出ない向きを採用してください。このマスクは最終合成の前後関係を作るものではありません。

### 2. Solve：カメラを復元できる素材か

**視差**とは、カメラが移動したとき手前と奥の物体が画面上で異なる量だけ動くことです。固定カメラや三脚で向きを変えるだけのパンでは、奥行きを十分に推定できません。追跡点を増やしても解決しない場合があるため、実際のカメラ移動を確認します。平面への画像貼り付けだけが目的なら[Planar Trackerを使う手順](../../recipes/3d/camera-track-3d-object)の説明するCamera Tracker方式ではなく、[平面追跡のRecipe](../../recipes/tracking/planar-track-graphic)も検討します。

視差があるのにSolveが破綻する場合は、Cameraタブの**Focal Length**（焦点距離）と**Film Gate**（撮像面サイズ）を撮影情報と照合します。Film Gateが不正確だと焦点距離の推定も難しくなります。既に歪み補正した映像へLens Parametersで歪みを重ねていないかも確認します。

Solveタブの**Auto Select Seed Frames**は、最初に解析する2フレームを自動選択します。通常は有効のままにします。手動選択が必要なら、両フレームに共通の追跡点が多く、かつカメラ位置に十分な違いがある組み合わせを選びます。これらは相反する条件なので、離れたフレームを選べば必ず良くなるわけではありません。

### 3. Solveの結果：悪い追跡点を選んで修正する

**Average Solve Error**は、復元した3D点をカメラから2Dへ投影し直した位置と、映像上の追跡点との差をピクセルで表した平均値です。21.1マニュアルはHDで1.0未満、4Kで0.5未満を目標の例として挙げますが、**合成が成功することを保証する閾値ではありません**。

Viewerで**Reprojection Locators**を表示すると、元の追跡点と再投影位置を比較できます。CGを置く床の近くで両者が離れる場合は、平均値だけを下げようとせず、その領域の点を調べます。Solve後の色分けでは緑が良好、赤は信頼度が低い点です。人物や反射についている点、途中から別の模様へ移った点を優先して見直します。

Solveタブの**Clean Tracks by Filter**は条件に合う点を選びます。**Auto Delete Tracks by Filter**を有効にしていると選択と同時に削除されるため、まず無効にして対象を確かめます。**Minimum Track Length / Maximum Track Error / Maximum Solve Error**は、短すぎる点や誤差の大きい点を選ぶための条件です。途中だけ悪い点なら**Trim Previous / Trim Next**で問題の区間を切る方法もあります。

削除は少数ずつ行い、そのたびにSolveをやり直します。マニュアルは1フレームに8点未満ではSolveに必要な情報が足りないと説明し、実際にはそれ以上の十分な点を勧めています。**誤差の大きい点を全部消すことが正解ではありません。**良い点まで減らすとSolveが悪化します。

### 4. Export：Solveは合うのにCGだけ滑る

Camera Trackerから作るPoint Cloud 3Dは実景の完全な3Dモデルではありません。床面の向き、3D空間の原点、尺度を手がかりに、CGを配置します。

1. Camera Trackerの**3D Scene Transform**を**Unaligned**にします。
2. 床面と判断できる点を広い範囲から選び、**Orientation → Set from Selection**で向きを設定します。**Origin → Set from Selection**では、CGを置きたい近くの誤差が小さい点を基準にします。
3. 必要に応じてScaleを合わせ、**Aligned**へ戻してExportします。
4. Export後にSolveや床面の設定を直した場合は、**Update Previous Export**を実行します。元のTrackerを再Solveしただけでは、書き出し済みのCamera 3Dへ必ず反映されるわけではありません。

CGだけ一定量ずれるなら配置位置や原点を、時間とともに滑るなら追跡点・Solve・書き出し済みカメラの更新を確認します。位置合わせだけを動かしてSolveの失敗を隠さないようにします。

### 5. 合成：3D Viewerの結果と完成画像を分けて調べる

CGの立方体を置く例では、Exportした**Merge 3D**へCube 3Dを追加し、**Renderer 3D**で2D画像に変えてから、通常の**Merge**のForegroundへ接続します。元映像は同じMergeのBackgroundへ接続します。

- **3D ViewerでCubeが見えるのに最終映像にない**：Merge 3DからRenderer 3Dへ接続され、Renderer 3DのCameraが書き出されたCamera 3Dを使っているか確認します。
- **元映像が二重になる**：書き出されたCamera 3Dの**Image Plane**で背景を描画し、さらに2D Mergeへ元映像を重ねていないか確認します。この2D Merge方式ではExport時の**Enable Image Plane in the camera**を無効にします。
- **人物がCGの後ろに回ってしまう**：Camera Trackerの追跡除外用マスクでは前後関係は作れません。人物を前景へ戻す合成用マスクを別途用意します。
- **点群や床面が最終画像に残る**：配置の目安に使ったPoint Cloud 3DやGround Planeを、仕上げのRenderer 3Dへ描く必要があるか見直します。

3D Viewerは位置関係を確認する画面です。**最終的に正しいかどうかはRenderer 3Dと2D Mergeの結果を再生して判断**します。

## 修正する順序

1. 元映像だけを見て視差と固定された特徴を確認します。
2. Trackの点の分布と追跡精度を確認し、誤った点を除外します。
3. Focal Length / Film Gateを確認してSolveし、平均誤差と各点の再投影を確認します。
4. 不良点を少数ずつ修正して再Solveします。
5. 3D Scene Transformを調整してExportし、変更時はUpdate Previous Exportします。
6. Renderer 3Dの出力と元映像を2D Mergeで合成し、背景の二重表示と前後関係を確認します。

具体的に最初から組み立てる場合は[Camera Trackerで実写へ3Dオブジェクトを固定する](../../recipes/3d/camera-track-3d-object)を参照してください。

## 関連資料

- [Camera Tracker](../../nodes/tracking/camera-tracker) — Track / Solve / Exportとマスク仕様の資料差
- [Camera 3D](../../nodes/3d/camera-3d) / [Renderer 3D](../../nodes/3d/renderer-3d) / [Merge 3D](../../nodes/3d/merge-3d) — 描画に必要なノード
- [Classic 3Dの基本](../../learn/02-data/classic-3d) — 3Dシーンと2D画像の違い
- [追跡を解析してから適用先を分ける](../../patterns/tracking/solve-then-apply-track) — 追跡結果を合成へ渡す考え方
- [トラッキング結果がずれる](./track-drifts) — Planar Tracker / Trackerの追跡ずれ

## バージョンと確認範囲

**一次資料：** Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Fusion Fundamentals Chapter 85 pp.1877–1885（Track、遮蔽物、撮影カメラ情報、Solve Error、点の整理）、Fusion Page Effects Chapter 119 pp.2804–2816（Camera Trackerの入力、フィルター、Seed Frames、Export、3D Scene Transform）。マスクの白黒については両章の記述が一致していません。

このページはマニュアルの機能説明に基づく診断順序です。Resolve 21.1実機での各ショットのSolve結果、マスク極性、Edition差は未確認のため、検証状態をpartialとしています。
