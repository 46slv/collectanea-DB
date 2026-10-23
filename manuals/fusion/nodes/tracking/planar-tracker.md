---
title: Planar Tracker
description: 平面領域のtranslation・rotation・scale・perspective変化を解析し、Planar Transform、Corner Pin、Steady、Stabilizeへ使うTracker。
doc_type: node
term_id: planar-tracker
verification: partial
aliases: [Planar Tracker, PTRA]
concepts: [tracking, coordinate-space, parameter-data]
nodes: [Planar Tracker]
node_family: tracking
controls: [Operation Mode, Reference Time, Tracker, Motion Type, Track Channel, Output, Tracking Controls, Create Planar Transform, Steady Time, Invert Steady Transform, Clipping Mode]
inputs: [image, image, mask, mask]
outputs: [image]
tasks: [track, planar-track, screen-replace, stabilize]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-14"
---

# Planar Tracker

**Planar Trackerは、映像に写った平面の移動と見かけの形の変化を追跡するノード**です。カメラが看板の横を通ると、看板は画面上を移動するだけでなく台形に見える形も変わります。その変化をフレームごとに解析し、新しい文字を貼る、面を固定して修正する、揺れを減らす、といった作業に使います。

追うのは四隅そのものではなく、**指定した平面領域に含まれる画像の模様**です。布のしわや肌の伸縮など面の内部変形を追うなら[Surface Tracker](./surface-tracker)、点の位置だけで足りるなら[Tracker](./tracker)も検討します。

## 入力

### Background

オレンジ色の入力です。平面領域を含む2D Imageを接続します。

### Corner Pin

緑色の入力です。Corner Pin modeで、解析した平面へ貼り付けるImageを接続します。複数のCorner Pin入力を持てます。

### Occlusion Mask

白色の任意入力です。

Maskが白い領域を解析対象から除外します。tracked planeの手前を別objectが横切る場合など、誤ったfeatureを計算へ含めたくないときに使います。

### Effect Mask

青色の任意入力です。Planar Trackerの最終outputを適用する範囲を制限します。

**Occlusion Maskは白い部分を追跡計算から除外**し、**Effect Maskはノードの最終出力の適用範囲を制限**します。例えば看板の前を人物が横切る場合、人物を追跡計算から外すのはOcclusion Maskです。人物を貼り付けた文字の手前に表示する合成処理は別に作ります。

**物理的な出力端子は2D Imageだけです。** TrackモードのInspectorにあるOutput設定は、元映像・前処理後の映像・Patternのマスク表示を切り替えるもので、追跡データ専用の出力端子を追加する設定ではありません。追跡結果は内部の**Track spline**（フレームごとの平面変形データ）に保存されます。別の画像やマスクへその動きを適用する場合は、追跡後に**Create Planar Transform**で適用用ノードを作成します。

## 基本workflow

21.1 Manualの基本手順は次の流れです。

1. lens distortionが大きい場合は先に補正する。
2. Backgroundへfootageを接続する。
3. planeが大きく見え、occlusionが少ないframeをReferenceにする。
4. Viewerで追うplaneをclosed polygonとして囲む。
5. 必要ならOcclusion Maskを接続する。
6. render rangeとTracker / Motion Type / Track Channelを確認する。
7. Reference frameから前後へ解析する。
8. Steady mode等で結果がplaneへ固定されて見えるか確認する。
9. 多くの用途ではCreate Planar Transformで適用用Nodeを作る。

## Operation Mode

Planar Trackerは4つのOperation Modeを持ちます。

### Track

planeを解析する基本modeです。

Track後にCreate Planar Transformを使い、別ImageやMaskへ同じperspective movementを適用できます。

### Steady

解析したplaneが動かないようにBackgroundを変形します。

paintやrotoを静止状態で行う前処理や、track qualityの確認に使えます。trackが正確なら、Steady中は対象planeがほぼ動かず、周囲のImageが変形して見えます。

### Corner Pin

解析したplaneへForeground Imageを直接貼り付けます。

Corner Pin modeへ切り替え、緑入力へtexture / graphicを接続してViewerの4cornerを合わせます。

### Stabilize

translation・rotation・scaleの不要な揺れをsmoothにします。

planeを完全停止させるSteadyとは目的が異なり、意図したcamera movementを残しつつ細かな振動を抑える用途です。

## Tracker：PointとHybrid Point/Area

InspectorのTrackerは、面をどう解析するかを選びます。

| Tracker | 解析方法 | 運用上の注意 |
| --- | --- | --- |
| **Point** | 領域内の小さな模様を複数追い、全体の動きから外れる点を内部で除外できる | 最初に試す方式。遮蔽物があっても自動で外れ値を扱える場合がある |
| **Hybrid Point/Area** | 領域内の画素を広く使うArea追跡とPoint追跡を組み合わせる | driftを減らせる場合があるが一般に遅く、遮蔽物には外部Occlusion Maskが特に重要 |

21.1マニュアルは、まずPointで結果を見て、不十分ならHybridを試すよう勧めています。Hybridが必ず成功する上位互換という意味ではありません。

## Motion Type：5種類の変形

| 選択肢 | 追う変形 | 向く例 |
| --- | --- | --- |
| **Translation** | X/Y方向の移動 | 向きと大きさがほぼ変わらない面 |
| **Translation, Rotation** | 移動と回転 | 画面上で回る面 |
| **Translation, Rotation, Scale** | 移動・回転・均一な拡大縮小 | 正面向きの看板に近づくカメラ |
| **Affine** | 上記にskewを加えた平行四辺形への変形 | 遠近変化が比較的小さな斜めの面 |
| **Perspective** | 台形など四隅の遠近変化 | 看板の横を移動するカメラ |

下の方式ほど表現できる変形が増えます。まずPerspectiveを試し、領域が小さい、特徴が少ない、追跡点が片側に偏る場合は単純な方式も試します。実際に遠近変化が大きいのにTranslationだけを使うと滑る原因になります。

## Track ChannelとOutput

Track Channelは**Red / Green / Blue / Luminance**から選びます。模様のコントラストが大きく、ノイズの少ないチャンネルを選びます。TrackモードのOutputは4種類です。

| Output | 何を表示するか |
| --- | --- |
| **Background** | 入力映像をそのまま表示 |
| **Background - Preprocessed** | 追跡の前処理後の画像。チャンネル選択の参考 |
| **Mask** | Patternを白黒マスクで表示 |
| **Mask Over Background** | Patternマスクを背景へ重ねて表示 |

これらは**Trackモードでの確認用出力**です。貼り付ける画像を自動的に合成する設定ではありません。

## Tracking ControlsとSpline

Track to start / Track to endは現在位置からRender Rangeの端まで解析します。前後へ1フレームずつ進める操作と停止操作もあります。**Trim to start / Trim to end**は現在フレームより前・後の追跡データを削り、**Delete**は全追跡データを削除します。

**Show Splines**からSpline Editorを開けます。Track splineは各時刻の変形を4×4行列として保存します。Stabilizeには別の**Stable Track spline**が使われます。いずれも通常のXY座標だけのキーフレームとは異なります。

## Create Planar Transform

Track後にこのbuttonを押すと、現在のtrack dataを使うPlanar Transform Nodeが作られます。

full-frame Imageを直接Corner Pinする場合を除き、graphicやMaskへtrackを再利用する用途ではPlanar Transformへ分ける構成が扱いやすくなります。

## Operation ModeごとのInspector設定

**新しい追跡を計算できるのはTrackモードだけ**です。Steady / Corner Pin / StabilizeはTrackで得た結果を使います。1つのPlanar Trackerでこれらの処理を同時選択することはできません。

### Steady：面を止めて修正する

Steadyは追った面をほぼ静止させるため、面の周りの映像が逆方向に動き、変形して見えるのは正常です。**Steady Time**は固定先の基準時刻で、通常はReference Timeと同じにします。**Invert Steady Transform**はSteadyの逆変形で、固定した面にPaintなどを行った後、元の動きへ戻す用途です。

**Clipping Mode**のDomainは画面外へ移動した画像データを保持し、Frameは破棄します。後から逆変形するならDomainを使います。Steadyと逆Steadyで画像の再サンプリングが2回発生するため、多少の軟化が起こり得ます。

### Corner Pin：別素材を追跡面に直接貼る

緑色の**Corner Pin 1**へ画像や動画を入れ、Viewerの四隅を貼り付け先に合わせます。Corner Pinの四隅は、解析に使う**Pattern Polygon**とは別です。

**Number of Corner Pins**の+ / -で素材の数を増減できます。**Merge Mode**はBG only / FG only / FG over BG / BG over FGから選び、複数のCorner Pinで共通です。各素材の**Enable**は表示切替、**Show Grid**は位置合わせ補助、**Merge Options**は合成設定です。**Reference Time Positions**で四隅を調整し、必要ならキーフレームで追跡誤差を補います。

### Stabilize：不要な揺れを滑らかにする

Steadyとは異なり、Stabilizeは大きなカメラ移動をなるべく残し、細かな揺れを抑えます。Track後にモードを切り替え、設定してから**Compute Stabilization**を実行します。切り替えただけでは計算されません。

| 設定 | 動作 |
| --- | --- |
| **Parameters to Smooth** | X Translation / Y Translation / Rotation / Scaleから滑らかにする要素を選ぶ |
| **Smoothing Window** | BoxまたはGaussianで周辺フレームの重みを選ぶ |
| **Smoothing Radius (Frames)** | 周辺何フレームを平均するか。大きくすると滑らかになるが透明端が増えやすい |
| **Compute Stabilization** | 上記設定でStable Trackを再計算する |
| **Clipping Mode** | Domainは画面外データを保持、Frameは破棄する |
| **Frame Mode** | Fullは透明端を残す、Cropは切り落とす、Zoomは拡大して隠す |

**Auto Crop**は透明端を除いた最大の切り抜き範囲を、**Auto Zoom**は透明端を隠す拡大率を求めます。Cropは画像の出力範囲が小さくなりますが再サンプリングせず、Zoomは拡大によるわずかな軟化があり得ます。

動く車の側面をPatternにすると車自体の動きも安定化に含まれます。カメラの揺れだけを抑えたいときは、可能なら建物の壁など静止した背景の面を選びます。

## 保存時の注意

21.1 Manualでは、Planar Trackerは最終trackはcompositionへ保存しますが、解析途中の個別point trackerなど一時dataは保存しません。

保存・再読込後は途中からtrackingを再開できない場合があるため、1つのplanar analysisは可能なら同じsession内で完了させます。

## 運用例1：看板に新しい文字を貼る

元の看板映像と、背景が透明な文字画像を用意します。カメラが看板の横を移動しても、文字が台形の変化に沿って動く合成が目的です。

~~~text
看板映像 → Planar Tracker（Trackして解析）

文字画像 → Transform（Referenceで位置合わせ）
         → Planar Transform（追跡の遠近変化を適用）
         → MergeのForeground ──┐
看板映像 → MergeのBackground ┴→ MediaOut
~~~

1. 看板の模様や縁をPatternで囲み、必要区間をTrackします。
2. Steadyへ切り替え、模様が画面内で止まるか確認します。
3. Create Planar Transformを押します。
4. 基準フレームで文字画像をTransformで配置し、Planar TransformのImage Inputへ渡します。
5. Mergeで元映像に重ね、斜めに写ったフレームを中心に滑りを確認します。

**古い文字の除去と、手前を横切る人物の前後関係は別工程**です。Occlusion Maskは解析から人物を除外するためのもので、人物を切り抜いて手前に合成する機能ではありません。

## 運用例2：スマートフォンの画面に動画をはめる

スマートフォンが映る実写をTrackしたら、差し替える動画を緑色のCorner Pin 1に接続し、Corner PinモードでViewerの四隅を画面内側へ合わせます。Show Gridを使い、斜めに動いたフレームでも四隅が合うか確認します。画面に一つの素材を貼るだけなら、このモードで変形とBackgroundへの合成をまとめられます。指の遮蔽や画面の反射は必要に応じて別途合成します。

## 運用例3：動く面にPaintを固定する

動く壁の汚れを消すなら、先に面をTrackしてSteadyで固定し、その状態でPaintを行います。後段では**同じ追跡に対応する逆Steady変形**を使って映像を元の動きに戻します。フレームごとにPaint位置を合わせ直す手間を減らせますが、画像の再サンプリングが2回必要です。

## 運用例4：手持ち撮影の揺れを減らす

建物の壁など固定された面をPatternにしてTrackし、StabilizeでTranslationを中心に平滑化します。必要ならRotation・Scaleも選び、Smoothing Radiusを調整してCompute Stabilizationを押します。透明な端が増えたらFrame ModeのCropまたはZoomを試し、**安定化の強さと残る画角**を確認します。

## トラブルシューティング

| 症状 | 確認すること |
| --- | --- |
| 解析が止まる | Pattern内の特徴や画素数、Render Rangeと開始フレーム |
| 遠近変化で滑る | Perspectiveを使っているか、レンズ歪みが残っていないか |
| 人が横切ると乱れる | Occlusion Maskを使っているか。Hybridなら特に重要 |
| Trackは正しいのに文字がずれる | Referenceでの文字画像の位置合わせとPlanar Transformへの接続 |
| Steadyで周囲が変形する | 面を止めると背景は逆変形する。Pattern自体の静止を確認 |
| Stabilizeの出力が変わらない | Compute Stabilizationを実行したか |
| 安定化後に透明端が出る | Frame ModeとSmoothing Radius |
| 再読込後に追跡点が消えた | 一時データは保存されない。Track splineが残っているか |

## Trackerとの違い

- **Tracker** — point / small featureのmotion
- **Planar Tracker** — plane全体のperspective movement
- **Camera Tracker** — 3D camera motionとpoint cloudを復元

## 関連する考え方

- [Trackを解いてから適用先を分ける](../../patterns/tracking/solve-then-apply-track)
- [トラッキング結果がずれる / driftする](../../troubleshooting/tracking/track-drifts)

## 関連Node

- [Planar Transform](./planar-transform)
- [Tracker](./tracker)
- [Camera Tracker](./camera-tracker)

## 出典と確認範囲

**一次資料：** Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 119「Tracking Nodes」**pp.2820–2829**（Planar Tracker Node [PTRA]）とFusion Fundamentals Chapter 82「Planar Tracking」。配布元：[Blackmagic Design Support](https://www.blackmagicdesign.com/support/)。

4入力、2 Tracker方式、5 Motion Type、Track Channel、4 Operation Mode、Track / Stable Track spline、Output、Inspector主要項目、保存仕様を21.1マニュアルと照合しました。制作例はその仕様を基にした構成例です。**追跡精度・速度、内部アルゴリズム、Free / Studioの差は実機未確認**のため、`verification: partial`を維持します。
