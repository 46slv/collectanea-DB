---
title: TransformをKeyframeで動かす
description: Text+を48フレームで左右に移動させ、Centerの2キーフレーム、Motion Path、Splineの進行度を確認する制作例。
doc_type: recipe
verification: partial
aliases: [animate transform, keyframe center, 位置アニメーション]
concepts: [keyframes, frame-evaluation, transform-controls]
patterns: [base-and-animation-offset]
nodes: [Text+, Transform]
tasks: [animate, move, motion-graphics]
prerequisites: [keyframes, transform-controls]
level: foundation
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-27"
---

# TransformをKeyframeで動かす

## できあがるもの

画面左寄りに置いた文字「MOVE」を、48フレームかけて右寄りまで移動させます。位置を決めるのはTransformの**Center**、いつその位置を通るかを決めるのは**キーフレーム**です。Spline Editorでは、移動経路に沿って進む速さを調整します。

~~~text
Text1（「MOVE」） → TransformMove → MediaOut1
                       Centerをアニメーション
~~~

今回は**1920×1080・フレーム0～48を使えるFusion Composition**を前提にします。画像サイズは変えず、文字の中心位置だけを動かします。通常の動画クリップではFusion画面の開始フレームが0とは限りません。その場合は、画面下のTime Rulerで使用範囲を確認し、先頭・24フレーム後・48フレーム後の位置へ読み替えてください。

## 必要なもの

- 0～48フレームを表示・編集できるFusion Composition
- 文字を発生させるText+、位置を変更するTransform、出力先のMediaOut
- Centerの座標を読み取りやすいViewerとInspector

撮影素材でも同じ操作はできますが、画面全体を埋める映像を大きく動かすと、移動した側の反対端に透明領域が現れます。まずは透明背景の文字で、移動そのものを確認します。

## 手順

### 1. 動かす画像を用意する

1. 1920×1080のFusion Compositionを開き、フレーム0～48が作業範囲に入ることを確認します。
2. Text+を追加し、InspectorのStyled Textへ「MOVE」と入力します。読み取れるように文字の大きさと色を調整します。
3. Text1の出力をTransformへ、Transformの出力をMediaOutへつなぎます。以後、このTransformを「TransformMove」と呼びます。
4. 左ViewerへText1、右ViewerへTransformMoveを割り当てます。右Viewerで動く文字を確認し、左Viewerを変形前の比較用に残します。

### 2. フレーム0と48へ位置のキーを置く

1. TransformMoveを選び、InspectorのCenter X/Yを表示します。以下の数値は**正規化座標**です。ピクセル単位で表示されている場合は、TransformのAuto Resolutionをオフにし、Reference Width / Heightをそれぞれ1にしてから進めます。この変更はCenterの表示単位を変えるもので、画像をリサイズしません。
2. フレーム**0**へ移動し、Centerを**X 0.25 / Y 0.5**にします。Centerの右側にある灰色のキーフレームボタンを押し、現在フレームのキーを作ります。
3. フレーム**48**へ移動し、Centerを**X 0.75 / Y 0.5**に変更します。すでにアニメーション中のCenterなので、この位置に次のキーが追加されます。
4. Keyframes EditorでTransformMoveのトラックを展開し、位置のキーがフレーム0と48にあることを確認します。Viewerでは左寄りから右寄りへの移動経路（Motion Path）が現れます。

~~~text
フレーム0             フレーム48
Center (0.25, 0.5)  → Center (0.75, 0.5)
       左                     右
~~~

ここではYを固定し、Xだけを変えています。斜めの移動を作りたい場合は、終点のYも変えます。**Pivotは回転・拡大縮小の支点**なので、位置移動のためにPivotを動かす必要はありません。

### 3. Splineで進み方を確認する

1. Spline Editorを開き、TransformMoveに作られたPathの**Displacement**を表示します。項目が見えなければ、左側のNode / Parameter一覧を展開します。
2. 始点と終点のキーを選び、まず**Linear**の補間にします。ここでは直線の移動経路に対し、時間あたりの進行割合が一定になる基準を作ります。
3. フレーム0・24・48を順に指定し、InspectorのCenterと右Viewerの文字位置を比較します。

| フレーム | Center（X / Y） | 1920×1080上の中心位置 | 確認する結果 |
| --- | --- | --- | --- |
| 0 | 0.25 / 0.5 | 480 / 540 px | 左寄りに文字がある |
| 24 | 0.5 / 0.5 | 960 / 540 px | 画面中央を通る |
| 48 | 0.75 / 0.5 | 1440 / 540 px | 右寄りに文字がある |

中間の24フレーム目の値は、**この2点間の直線経路でLinear補間を指定した場合の期待値**です。Smoothや手動ハンドルなどで進行速度を変えた場合、同じフレームでも中間位置は変わり得ます。再生だけで判断せず、3か所へ再生ヘッドを直接移動して比較します。

### 4. 途中の速度だけを変える

Linearの結果を確認したら、同じキーを選んで**Smooth**を試します。始点と終点の座標はそのままにして、動き始めと終わりの速さを調整できます。Splineのハンドルを変更する場合も、左右Viewerで位置が不自然に飛ばないか確かめます。

**移動経路の形**と**経路上の進み方**は別です。Viewer上のMotion Pathを動かすと、文字が通る場所が変わります。一方、Spline EditorのDisplacementを編集すると、その経路をいつ・どれだけ進むかが変わります。どちらを直したいのか決めてから操作してください。

## 実機の参考例：Text+を48フレームで動かす

<!-- capture-reuse:R65 -->

既存のS35では、Text+→TransformAnimatedの構成でCenterをフレーム0の**(0.25, 0.5)**から48の**(0.75, 0.5)**へ動かしています。フレーム24の**(0.5, 0.5)**も確認済みです。Splineに表示されているのはCenter Xの生の値ではなく、**Path1のDisplacement（0～1）**です。

[![S35の実機撮影。画像の接続Graph](/img/fusion/captures/S35/graph.png)](/img/fusion/captures/S35/graph.png)

[![S35の実機撮影。フレーム0のCenterのキー](/img/fusion/captures/S35/frame0-inspector.png)](/img/fusion/captures/S35/frame0-inspector.png)

[![S35の実機撮影。フレーム0の入力と移動結果](/img/fusion/captures/S35/frame0.png)](/img/fusion/captures/S35/frame0.png)

[![S35の実機撮影。フレーム48のCenterのキー](/img/fusion/captures/S35/inspector.png)](/img/fusion/captures/S35/inspector.png)

[![S35の実機撮影。フレーム48の入力と移動結果](/img/fusion/captures/S35/compare.png)](/img/fusion/captures/S35/compare.png)

[![S35の実機撮影。Path1のDisplacement曲線0から1](/img/fusion/captures/S35/spline.png)](/img/fusion/captures/S35/spline.png)

撮影環境は**Resolve Studio 21.1.0.14／Windows、1920×1080、Viewer 40%**です。Viewer上の緑の線や赤い軸は操作表示で、文字画像に描き込まれた線ではありません。[S35の撮影条件と確認範囲](/img/fusion/captures/S35/capture.json)を参照してください。S35は上記の位置とキー、表示されたPathを裏付けますが、**今回記述したLinear→Smoothの切替手順を新たに実機再現した証拠ではありません**。

## この構成にする理由

Transformは2D Imageの出力解像度を変えずに、Centerで表示位置を指定します。Centerをキーフレーム化するとMotion Pathが作られ、通常のPolyline Pathでは**Viewer上の経路の形**と**Spline上のDisplacement**が組み合わさって位置が決まります。

Displacementの**0は経路の始点、1は終点**です。Center Xが0.25から0.75に変わっているのに、Splineが0～1になっているのは正常です。X/Yそれぞれの値を時間曲線で編集したい場合は、Viewer上の経路の右クリックメニューにある「Path#: Polyline > Convert to X/Y Path」を検討します。通常の2点移動では変換は不要です。

この方法は文字以外の2D Imageにも応用できます。複数画像を合成するときは、位置の責任をTransformに置くのか、後段MergeのForeground位置に置くのかを明確にしてください。

## 別の作り方

- **元の配置と移動を分ける**：配置調整用Transformの後ろに、アニメーション用Transformを追加します。両方のCenterを同時に変更して移動量を追いにくくしないための方法です。
- **Mergeで前景だけ動かす**：背景の上に1つの前景を重ねるだけなら、MergeのCenterをアニメーションさせる方法もあります。背景まで動かしたくない場合は前景の担当範囲を確認します。
- **値の関係から動かす**：別Nodeと位置を連動させたいならExpressionやModifierを検討します。固定した2地点の移動には、まずキーフレームだけで十分です。

## うまくいかないとき

| 症状 | 確認する場所 | 修正の順番 |
| --- | --- | --- |
| 2フレームとも同じ位置にいる | InspectorのCenter、Keyframes Editorのキーの時刻と値 | フレーム0と48に**異なるCenter**があるか確認する |
| Inspectorの値は動くのに文字が動かない | 右ViewerのNode名、Transform→MediaOutの接続 | TransformMoveの出力を直接Viewerへ表示する |
| 予定より早く終わる・動き始めない | Time RulerのRender Range、Keyframes EditorのNode有効区間、実際のキーフレーム時刻 | プレビュー範囲とキーの位置を分けて確認する |
| Splineが0～1なので座標が間違っているように見える | Path1のDisplacement表示 | **位置のX値ではなく経路上の割合**として読み直す |
| Centerに960などの値が表示される | Auto Resolution / Reference Width・Height | Reference Sizeによるピクセル表示か確認する。内部位置を消去しない |
| 画面端で文字・画像が切れる | Center、画像サイズ、TransformのEdges | 移動先とキャンバスを確認する。Edgesはキャンバスの解像度を増やさない |
| 別の式を入れた後に動きが変わった | InspectorのModifiers / Expression、Connect To | 元の値の供給元を記録し、検証用の複製で切り分ける |

キーフレームボタンが**オレンジ色のフレームでボタンをクリックすると、そのフレームのキーが削除**されます。アニメーション全体を削除する右クリックの「Remove [パラメータ名]」とは別操作です。意図したキーを確認するまでは押し直さないでください。

より広い切り分けは[Keyframeを置いたのにアニメーションしない](../../troubleshooting/animation-automation/animation-does-not-move)にまとめています。

## 完成判定

フレーム0・24・48で、右Viewerの文字位置とInspectorのCenterが表のとおり対応し、左ViewerのText1は移動していないことを確認します。MediaOutにも同じ移動結果が届く状態が完成です。速度を調整した場合は、0と48の到達位置を保ったまま途中の位置・速さだけが変わったことを確認します。

## 関連する考え方・Node

- [キーフレーム / スプライン / 時間](../../learn/05-time/keyframes-spline-time)
- [Center / Pivot / Size / Angle](../../learn/03-space/center-pivot-size-angle)
- [正規化座標](../../learn/03-space/normalized-coordinates)
- [TransformでImageを移動する](../layout/move-image-with-transform)
- [基準値とアニメーションのオフセットを分ける](../../patterns/animation/base-and-animation-offset)
- [Transform](../../nodes/transform/transform) / [Text+](../../nodes/generators/text-plus)

## 出典・バージョン・未検証範囲

一次資料：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（**2026年9月**、[公式サポート](https://www.blackmagicdesign.com/jp/support)で配布）。本文の該当ページを確認しました。

- **Chapter 70、pp.1519–1521**：Inspectorでのキーフレーム追加・削除、Keyframes Editorによる時刻と値の確認。
- **Chapter 71、pp.1545–1546**：キーの自動追加、CenterのDisplacement Splineと0～1の意味、X/Y Pathへの変換。
- **Chapter 72、pp.1564–1565**：Transform CenterからMotion Pathを作る手順、Polyline PathとXY Path、Displacementによる速度制御。
- **Chapter 120、p.2880**：TransformのCenter、PivotとReference Size。
- **実機資料**：[S35 capture.json](/img/fusion/captures/S35/capture.json)（Resolve Studio 21.1.0.14 / Windows、0・24・48フレームとPath表示の記録）。

ここでの数値、Text+素材、Linear基準の確認手順は**公式仕様に沿った再現用の構成**です。既存S35の確認範囲を超えるSmooth切替後の位置、連続再生の滑らかさ、通常動画クリップの別開始フレームでの再現、全OS・Free/Studio間の差は新たに実機検証していません。したがって、検証状態は **partial** のままです。
