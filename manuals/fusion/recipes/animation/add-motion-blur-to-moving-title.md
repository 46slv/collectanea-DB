---
title: 移動するタイトルにTransformのMotion Blurを加える
description: Text+を48フレームで横移動させ、TransformのMotion Blurでシャッター角・サンプル数による残像の違いを比較する。
doc_type: recipe
verification: partial
aliases: [Transform Motion Blur, モーションブラー, シャッター角, 動くタイトル]
concepts: [keyframes, frame-evaluation, transform-controls]
patterns: [base-and-animation-offset]
nodes: [Text+, Transform]
tasks: [motion-blur, animate, title, motion-graphics]
prerequisites: [keyframes, transform-controls]
level: foundation
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-28"
---

# 移動するタイトルにTransformのMotion Blurを加える

## 作るもの

左から右へ動く「MOVE」という文字に、移動方向へ伸びるモーションブラーを加えます。**Text+で文字を作り、Transformで位置をアニメーションし、そのTransform自身のMotion Blurを使う**構成です。背景は動かさず、文字の移動だけをぼかします。

同じフレームでMotion Blurのオフ／オン、Shutter Angle、Qualityを比較し、**動きの距離・露光時間に相当する設定・描画の滑らかさ**を別々に調整できるようにします。

## 必要なものと入力条件

- 1920×1080のFusion Composition。**フレーム0〜48**を使えるものを想定します。動画クリップの開始番号が異なる場合は、作業範囲の先頭を0、そこから48フレーム後を48として読み替えます。
- Text+、Transform、MediaOut。文字列は「MOVE」、背景は透明で構いません。文字が移動方向に対して識別しやすい大きさにします。
- FusionページのInspector、Keyframes Editor、Spline Editor、Viewer。評価するフレームを直接指定できる状態にします。

既存の[TransformをKeyframeで動かす](./animate-transform-center)を基準構成として使えます。そこから**新しいMotion Blur設定だけ**を追加するレシピです。以下の数値は21.1公式Manualに沿って比較を行うための設定案であり、この組み合わせを実機で再現した測定結果ではありません。

## 接続

~~~text
Text1（MOVE・透明背景）
        │ 2D Image
        ▼
TransformMove（Centerのキーフレーム + SettingsのMotion Blur）
        │ 2D Image
        ▼
MediaOut1
~~~

Text1の出力をTransformMoveの**オレンジ色のInput**に接続します。Motion Blurは別の画像を入力する処理ではなく、TransformMoveの**Settings**で有効にする機能です。青いEffect Maskは今回接続しません。

## 手順

### 1. ブラーなしの移動を作る

1. Text1のStyled Textへ「MOVE」を入力し、Text1 → TransformMove → MediaOut1の順に接続します。
2. TransformMoveの**Controls → Center**をキーフレーム化します。以下は正規化座標の例です。Inspectorに960のようなピクセル座標が出る場合は、Auto Resolution／Reference Width・Heightによる表示単位を確認してください。
3. フレーム**0**でCenterを**X 0.25 / Y 0.5**にし、Center横の灰色のキーフレームボタンをクリックします。
4. フレーム**48**でCenterを**X 0.75 / Y 0.5**にします。Keyframes Editorで0と48に位置のキーがあることを確かめます。
5. Spline EditorでPathの**Displacement**をLinearにして、フレーム**24**でCenterが概ね**X 0.5 / Y 0.5**になる基準を作ります。Smoothなどで速度を変えていると中間位置とブラーの強さも変わるため、まずLinearで比較します。

この設定では、文字の中心が横方向に**960 px（1920 × 0.5）**移動します。48フレームに等速で割り当てた場合、中心の移動量は約**20 px／フレーム**です。文字の端や太さに応じて見えるブラー幅は異なります。

### 2. TransformのMotion Blurをオンにする

1. **フレーム24**へ移動し、TransformMoveの出力を右Viewer、Text1の出力を左Viewerに表示します。
2. TransformMoveのInspectorで**Settings → Motion Blur**を有効にします。オフのときは関連スライダーが表示されません。
3. **Quality = 2、Shutter Angle = 180**を比較の出発点にします。**Center Bias、Sample Spreadは変更せず**、現状の値を控えておきます。
4. 同じフレーム24でMotion Blurを**オフ → オン**と切り替え、右Viewerの文字の左右端が移動方向へ広がるか見ます。左ViewerのText1は元画像として比較用に残します。

180はこのレシピで選んだ比較値であり、全環境での既定値を示しません。21.1 Manualは、**Shutter Angle 360が1フレーム全体の露光に相当する**と説明しています。したがって180を選ぶ理由は、360より短い時間幅で動きを確認するためです。約20 px／フレームという数値からブラーの実際の画素幅や輪郭値を保証するものではありません。

### 3. Shutter Angleだけを変える

1. Qualityを2に固定し、フレーム24のまま**Shutter Angle 90 → 180 → 360**と順に切り替えます。
2. 同じViewer倍率で輪郭の伸びと、文字を読み取れる度合いを比較します。
3. 360で文字の輪郭が大きく流れる場合は180または90へ戻します。最終値は素材の移動速度と読みやすさを基準に決めます。

| Shutter Angle | Manualに基づく期待 | 観察するもの |
| --- | --- | --- |
| 90 | 比較的短い時間幅のブラー | 輪郭がどの程度残るか |
| 180 | 90より長い時間幅のブラー | 動きと文字の可読性の両立 |
| 360 | 1フレーム分の露光に相当 | 移動方向へさらに広がるか |

**これは予測・比較項目であり、今回の文字素材での実機測定表ではありません。** フレーム0や48ではキー範囲の端のため比較条件が変わる可能性があります。中間の24で比較してから、必要なら各フレームの見え方を確認してください。

### 4. Qualityだけを変える

1. Shutter Angleを180に固定し、**Quality 2 → 4**で比較します。
2. 輪郭の段差や残像の滑らかさ、描画の重さを見ます。ManualではQualityを上げるほどサンプル数が増え、滑らかになりやすい代わりに処理時間も増えると説明されています。
3. 違いが分からない場合はQualityを2へ戻し、まずMotion Blurオン／オフとShutter Angleの差が出るか確認します。比較のためにCenter BiasとSample Spreadまで同時に変えないでください。

Center Biasはブラーの中心を前後へずらして残像の位置を変える設定、Sample Spreadはサンプルごとの重みを変える設定です。どちらも必要になった段階で**1項目ずつ**調整します。

## なぜこの構成で動くか

Transformは画像の**Centerに設定された時間変化**を使って動きの方向と量を予測できます。TransformのMotion Blurは、設定した仮想シャッター時間内の複数時点をサンプリングして動きによるにじみを作ります。したがって、停止中の文字にMotion Blurをオンにするだけで、横移動の残像が自動生成されるわけではありません。

**Shutter Angleはブラーの時間幅、Qualityはサンプルの多さ**という役割の違いを保つと、結果を切り分けやすくなります。[キーフレームとSpline](../../learn/05-time/keyframes-spline-time)は時間ごとの位置を決め、[Center / Pivot / Size / Angle](../../learn/03-space/center-pivot-size-angle)はTransformが変える空間上の値を説明しています。

## バリエーション

**背景映像の上へタイトルを重ねる場合：** Text1 → TransformMoveをMergeのForeground（緑）へ接続し、映像のMediaInをBackground（黄）へ接続します。**背景まで含めた合成画像の後段にTransformを置くと背景も移動対象**になり得るため、文字の枝だけへMotion Blurを置きます。

**移動の緩急を付ける場合：** LinearをSmoothへ変更してフレーム24付近の速度を比較します。同じShutter Angleでも速度が変われば残像の長さも変わり得ます。位置のアニメーションとブラー設定は別の要因として記録してください。

**外部Motion Vectorを使う場合：** [OpenEXRのMotion Vectorでブラーを加える](./exr-motion-vector-blur)は、入力画像とは別に画素ごとの移動ベクトルを用意する方法です。今回はTransformで生成した動きのため、その追加データは不要です。

## うまくいかないときの確認

| 症状 | 確認する場所 | 修正・比較 |
| --- | --- | --- |
| ブラーが見えない | TransformMoveのSettings、Motion Blurチェック、フレーム24、2つのCenterキー | オンか確認し、ブラーなしの状態と同じフレームで比較する |
| 文字が動かない | Centerのフレーム0・48、Keyframes Editor、右Viewerの表示Node | 異なる位置のキーを再確認し、TransformMoveを直接Viewerへ出す |
| 残像が極端に大きい | Shutter Angle、Splineでの速度、Center Bias | Shutter Angleを360→180→90の順に戻し、まずLinearで再比較する |
| 重くなる・輪郭が段状になる | QualityとShutter Angle | 片方ずつ変更し、Quality増加で処理時間が増えることを見込む |
| フレーム端だけ結果が違う | 0・24・48の時間位置、キー範囲、Render Range | まず中間の24で比較し、端のサンプリング条件を別に確認する |
| 文字ではなく背景まで動く | TransformとMergeの接続位置 | TransformをText+側の枝へ移し、背景はMergeへ直接入力する |
| 画像が一切変わらない | MediaOut接続、TransformのSettings → Blend、右ViewerのNode | Blendが0の場合は元画像が出る仕様。処理前後を直接比較する |

## 完成判定と関連ページ

フレーム0・24・48で文字の移動を確認し、**フレーム24でMotion Blurのオフ／オンに差が出る**こと、Shutter AngleとQualityをそれぞれ単独変更できること、Text1側の画像が変化していないことを確認します。ここでの確認項目は**実施手順**であり、このrunで新規実機PASSを取得したという意味ではありません。

- [TransformをKeyframeで動かす](./animate-transform-center)：位置移動の基準レシピ
- [Transform](../../nodes/transform/transform)：Center、Settings、2D Image入出力
- [Text+](../../nodes/generators/text-plus)：文字画像の生成
- [キーフレーム / スプライン / 時間](../../learn/05-time/keyframes-spline-time)：位置と速度の違い
- [Base値とAnimation Offsetを分ける](../../patterns/animation/base-and-animation-offset)：変更しやすいアニメーション構造

## 出典・バージョン・未検証範囲

一次資料：Blackmagic Design『[DaVinci Resolve 21.1 Reference Manual](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_21.1_Reference_Manual.pdf)』（2026年9月）。

- **Chapter 120、pp.2879–2880、2882–2885**：Transformの2D Image入力、Center、Reference Size、SettingsのBlend、Motion Blur、Quality、Shutter Angle、Center Bias、Sample Spread。
- **Chapter 69、p.1503**：Motion Blurは移動可能なNodeで設定可能、360は1フレーム露光相当、サンプリングと既定値の説明。
- **Chapter 70、pp.1519–1520**：InspectorのキーフレームとKeyframes Editor。
- **Chapter 72、pp.1564–1565**：TransformのCenterをPathでアニメーションする方法。
- 既存の[48フレーム移動レシピ](./animate-transform-center)：S35（Resolve Studio 21.1.0.14 / Windows）でCenterとPathの静止画を確認済み。ただし**Motion Blurの比較を実機で行った証拠ではありません**。

1920×1080、「MOVE」、フレーム0／24／48、Shutter Angle 90／180／360、Quality 2／4は**21.1公式仕様に基づく再現用の条件**です。この組み合わせでの新規Resolve/Fusion 21.1実機プレビュー、レンダー結果、輪郭の画素値、速度変化時のMotion Blur、サンプル境界・GPU、Free/Studio差、他OSは**NOT_RUN**です。検証状態は`partial`とします。
