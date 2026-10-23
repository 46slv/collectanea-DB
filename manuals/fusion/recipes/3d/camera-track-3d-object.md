---
title: Camera Trackerで実写に3Dオブジェクトを固定する
description: 実写のカメラ移動を解析し、書き出したCamera 3Dと点群を使ってCGを配置し、Renderer 3D経由で元映像へ合成するRecipe。
doc_type: recipe
verification: partial
aliases: [camera track 3d object, 3D match move, カメラトラッキング]
concepts: [classic-3d, tracking-data]
patterns: [solve-then-apply-track]
nodes: [Camera Tracker, Camera 3D, Point Cloud 3D, Cube 3D, Merge 3D, Renderer 3D, Merge]
tasks: [camera-track, solve-camera, 3d-match-move, composite-3d]
prerequisites: [classic-3d, data-domain]
level: intermediate
product_scope: fusion
updated: "2026-10-21"
---

# Camera Trackerで実写に3Dオブジェクトを固定する

## できあがるもの

廊下を歩きながら撮影した映像に、CGの立方体を床へ置きます。カメラが移動しても立方体が同じ場所に立って見えるよう、**実写のカメラ移動を解析してから、その動きで3Dシーンを描画**します。最後に、元映像へCGだけを重ねます。

この手順で復元するのは、撮影カメラの動きと実景の特徴点を表す点群です。映像から壁や床の完全な3Dモデルが生成されるわけではありません。

## 用意するもの

- **実写映像**：手前と奥の景色が異なる量だけ動くショット。床の目地、壁の角など、静止した模様が複数の奥行きにあるものを使います。
- **Camera Tracker**：映像を追跡し、カメラの動きと3Dの点群を計算します。
- **Cube 3D**：実景へ置く試験用の立体。慣れたらText 3Dや別の3Dモデルに置き換えられます。
- **Merge 3D / Renderer 3D / Merge**：立体を3Dシーンへ加え、画像に変換し、元映像と重ねます。

カメラが固定された映像や、三脚で向きだけを変えたパンは、奥行きの違いを推定するための**視差**が不足します。平らな看板に2Dのロゴを貼るだけなら、[Planar Trackerを使うRecipe](../tracking/planar-track-graphic)の方が適しています。

## ノードの接続

~~~text
【解析】                                        【3Dの配置・描画】
MediaIn ─→ Camera Tracker ── Track → Solve → Export
                                   │
                      Exportで作成されたノード
                      Camera 3D ──────────┐
                      Point Cloud 3D ─────┤
                      Ground Plane ───────┤
                      Cube 3D（追加） ────┤
                                         ↓
                                     Merge 3D
                                         ↓
                                  Renderer 3D ──→ Merge（Foreground）
MediaIn（元映像）───────────────────────────────→ Merge（Background）→ MediaOut
~~~

**解析用と合成用で画像の接続を分けます。** Camera Trackerの2D出力は追跡点を確認するための表示で、Solve後には別の3D出力も使えます。ただし、このRecipeではInspectorの**Export**によって独立したCamera 3D・Point Cloud 3D・Ground Plane・Merge 3D・Renderer 3Dを作り、その3DシーンへCube 3Dを加えます。

上図の2D Mergeを使う構成では、**書き出すカメラのImage Planeを無効にして、背景を二重に描かない**ようにします。詳しくは手順4を参照してください。

## 手順

### 1. 静止した特徴点を追う

1. 元映像のMediaInをCamera Trackerのオレンジ色の**Background**入力へ接続し、2D Viewerで確認します。
2. **Preview AutoTrack Locations**を有効にし、特徴点が床、壁、奥の景色などに偏りなく分布するか見ます。少ないときは**Detection Threshold**や**Minimum Feature Separation**を調整します。
3. 人物や車などが通る場合は、その領域のPolygonなどを白い**Occlusion Mask**入力へ接続します。この入力では**マスクの白い部分を追跡対象から除外**します。マスクは被写体の動きに合わせておきます。
4. **Auto Track**を実行します。特徴点が模様に留まっているか、ショットの前半・中盤・後半を見て確認します。

追跡点が多いだけでは成功しません。動く人物や反射に付いた点、途中から別の模様へ滑った点は、カメラ移動の推定を誤らせます。

**マスクの資料差に注意。** 21.1 Reference ManualのChapter 119（Camera Trackerの入力説明）は「白い領域を追跡から除外」と記載していますが、Chapter 85（p.1879、Track Maskの手順）には白い領域を解析対象として説明する逆の記述があります。このRecipeはノード個別の入力説明に従っています。実際には**Preview AutoTrack Locations**で、マスクをかけた領域に追跡点が生成されないことを確認してください。マスクの実機挙動は未検証です。

### 2. カメラ条件を設定してSolveする

1. Cameraタブで撮影時の**Focal Length**と**Film Gate**（撮像面の大きさ）を分かる範囲で指定します。Film Gateの寸法を手入力する場合、**Aperture Width / Heightの単位はインチ**です。
2. Solveタブの**Solve**を実行します。実写カメラに対応する3Dの仮想カメラと点群が計算されます。
3. **Average Solve Error**とViewerの追跡点・再投影位置を確認します。これは3Dの点を仮想カメラから画像へ戻した位置と、実際に追跡した2D点のずれを表します。
4. ずれが大きければ**Clean Tracks by Filter**や手動選択で不良点を整理し、少数ずつ削除して再Solveします。**Auto Delete Tracks by Filter**を有効にすると、選択と同時に点が削除されるため注意します。

21.1マニュアルでは、HD映像のAverage Solve Errorは1ピクセル未満が良い結果の目安です。ただし**平均誤差が小さくても、置きたいCGの近くで点が滑っていれば合成はずれます**。数値だけで完了判定しないでください。

### 3. 床面と原点を決めてExportする

1. Camera Trackerの**Export**タブを開き、**3D Scene Transform**を**Unaligned**にします。
2. 3Dの点群から床にあると判断できる点を、広い範囲で複数選択します。**Orientation**の**Selection Is**が床を表す向きになっていることを確認し、**Set from Selection**を押します。
3. 立方体を置きたい場所に近い、Solve誤差の小さい点を選び、**Origin**の**Set from Selection**で基準位置を設定します。実寸の目安がある場合は**Scale**も調整します。
4. **Aligned**に戻して向きと原点を固定します。**Export Options**では、実写カメラの動きがCamera 3Dへ付くよう**Animation**を確認します。
5. 今回は後段の2D Mergeへ元映像を入れるため、**Enable Image Plane in the camera**を**無効**にしてから**Export**します。

通常のExportでは**Camera 3D / Point Cloud 3D / Ground Plane / Merge 3D / Renderer 3D**の5ノードが生成されます。Point Cloud 3Dは実景を丸ごと立体化したメッシュではなく、CGの配置を判断するための位置の目安です。

### 4. CGを点群に合わせて配置し、元映像へ重ねる

1. Exportされた**Merge 3D**を3D Viewerへ表示します。書き出されたカメラと点群、床面を見て、位置関係を把握します。
2. **Cube 3D**を追加し、同じMerge 3Dへ接続します。床に相当する点群を目安にCube 3Dの位置と大きさを調整します。Cube 3Dをつないだ順序によって前後関係が決まるわけではありません。
3. Exportされた**Renderer 3D**を別Viewerへ表示します。Renderer 3Dの**Camera**が書き出されたCamera 3Dを使用しているか、Cube 3Dが画面に入っているか確認します。
4. 最終合成で位置決め用の**Ground Plane**が見えてしまう場合は、レンダリングに含めないよう表示・接続を見直します。点群もCGの代わりに実写へ合成する素材ではありません。
5. Renderer 3Dの**2D出力**を通常のMergeの**Foreground（前景）**へ、元のMediaInを同じMergeの**Background（背景）**へ接続します。Mergeの出力をMediaOutへ渡します。
6. カメラ移動の前半・中盤・後半で、Cube 3Dが床から浮いたり、滑ったりしていないか確認します。

**背景の二重表示に注意。** Camera 3Dの**Enable Image Plane**が有効だと、元映像を張った板が3Dシーン内でレンダリングされることがあります。そこでさらにMediaInを2D MergeのBackgroundへ入れると、映像が二重になります。このRecipeではImage Planeを無効にしてCGのみを描画する構成です。すでにExportしていた場合は、書き出されたCamera 3DのImage Plane設定も確認します。

3D Viewerは配置を検討する画面、Renderer 3Dの結果は実際に2D合成へ渡す画像です。両方を確認してください。最終的な光と影を合わせたい場合はライトとRenderer 3Dの**Enable Lighting / Enable Shadows**を調整します。

## うまくいかないとき

| 症状 | 切り分け方 |
| --- | --- |
| 立方体が背景の床から滑る | CGの位置だけ動かさず、近くの追跡点、再投影誤差、Solve、Orientation / Originを順に確認する。 |
| カメラが不自然に動く | 動く人物・反射・短い追跡点を除外できているか、Focal LengthとFilm Gateが正しいかを確認する。 |
| 3D Viewerにはあるのに最終映像へ出ない | Cube 3DがExport後のMerge 3Dに入っているか、Renderer 3DがExportされたCamera 3Dを使っているかを確認する。 |
| 背景が二重になる | カメラのImage Planeと2D MergeのBackgroundで同じ元映像を二度描いていないか確認する。 |
| 床の格子や追跡点が映像に残る | ExportしたGround PlaneやPoint Cloud 3Dを、仕上げのレンダリングに含める必要があるか見直す。 |
| 立方体が真っ黒になる | Renderer 3DのLightingが有効なら、3Dシーンに適切なライトがあるか確認する。 |
| 実写の人物がCGの後ろに隠れる | Camera Tracker用Occlusion Maskは**最終合成の前後関係を作らない**。人物を前景に戻すマスクなど、別の合成処理が必要。 |

Solveや床面の設定をExport後に直した場合は、元のCamera Trackerで**Update Previous Export**を実行し、書き出したノードへ新しい結果を反映します。再Solveする可能性があるうちは、元のCamera Trackerを削除しない方が安全です。

## 関連ページ

- [Camera Tracker](../../nodes/tracking/camera-tracker) — 各タブ、2D / 3D出力、SolveとExportの設定
- [Camera 3D](../../nodes/3d/camera-3d) — 書き出されたカメラとImage Plane
- [Point Cloud 3D](../../nodes/3d/point-cloud-3d) — 点群の意味と利用方法
- [Merge 3D](../../nodes/3d/merge-3d) / [Renderer 3D](../../nodes/3d/renderer-3d) — 3Dシーンから2D画像への変換
- [Classic 3Dの基本](../../learn/02-data/classic-3d) — 3Dシーンと2D画像の違い
- [Classic 3Dを2Dへ描画する最小Recipe](./basic-classic-3d-render)
- [追跡を解析してから適用先を分ける](../../patterns/tracking/solve-then-apply-track)

## バージョンと確認範囲

**一次資料：** Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Fusion Fundamentals Chapter 85「3D Camera Tracking」**pp.1873–1889**（Track / Solve、3D出力、点群、Orientation / Origin / Scale、Exportと3Dオブジェクト配置）、Fusion Page Effects Chapter 119「Tracking Nodes」**pp.2804–2818**（Camera Trackerの入力とInspector、Export Options、Update Previous Export、Image Plane）、Chapter 88「3D Nodes」のCamera 3D / Merge 3D / Renderer 3D。

手順はマニュアルで説明される機能を組み合わせた再現例です。実機による特定ショットのSolve精度、レンダリング結果、Edition差は未確認のため、`verification: partial`としています。
