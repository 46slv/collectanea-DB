---
title: Mask Paint
description: 画像入力なしでマスクを直接描き、既存のマスクを部分補修するFusionノード。Paintとの違い、合成方法、表示期間を説明。
doc_type: node
term_id: mask-paint
verification: partial
aliases: [Mask Paint, PNM]
concepts: [mask-data, paint, time]
nodes: [Mask Paint]
node_family: masks
controls: [Paint Mode, Brush Shape, Apply Mode, Stroke Animation, Duration, Make Editable]
inputs: [mask]
outputs: [mask]
tasks: [create-mask, paint-mask, cleanup, roto]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-24"
---

# Mask Paint

Mask Paintは、Viewer上でブラシや図形を描き、**処理を適用する範囲を表すマスク**を作るノードです。映像の色を塗り替えるのではなく、白・黒・グレーの値で「どこに、どの程度処理をかけるか」を決めます。例えば、人物のマスクに小さな穴が開いている場合、その部分だけ白く描いて補修できます。

[Paint](../paint/paint.md)は2D画像の入力が必須ですが、**Mask Paintは画像を接続しなくてもマスクを描けます**。FusionのEffects LibraryではMaskカテゴリにあり、リファレンスマニュアルの表記は「Mask Paint [PNM]」です。S84の実機例では内部REGIDが`PaintMask`であることを確認しました。

## 入力と出力

| 端子 | データ | 役割 |
| --- | --- | --- |
| **Effect Mask（青、任意）** | 別のMaskノードが作ったマスク | 既存のマスクとMask Paintで描いた内容を合成する |
| **出力** | 1チャンネルのマスク | Blurなどの**Effect Mask入力**へ渡し、効果をかける領域を指定する |

Mask Paintには、Paintのような必須のオレンジ色の画像入力はありません。入力がない状態では新しいマスクを手で作り、青いEffect Mask入力に既存マスクをつなぐと、その結果に描き足したり、描いた領域を引いたりできます。

~~~text
MediaIn ───────────────────→ Blur ─→ MediaOut
                                ↑ Effect Mask
MediaIn → Bitmap Mask → Mask Paint ┘
                     （穴を白く補修）
~~~

上の例では、**上段のMediaInはBlurが加工する映像**、**下段のBitmap Maskは映像からマスクを作るノード**です。Mask Paintの出力をBlurのEffect Maskに接続すると、Blurはマスクの白い領域で強く、黒い領域では適用されなくなります。Bitmap Maskの画像入力とMask Paintの青いマスク入力は、接続するデータの種類が違います。

マスクの白・黒・グレーの基本は[Maskの概念](../../learn/02-data/mask)、Bitmap Maskによる画素からの抽出は[Bitmap Mask](./bitmap-mask)を参照してください。

## 既存マスクと描画をどう組み合わせるか

青いEffect Mask入力へ別のマスクをつなぐと、Inspectorの**Paint Mode**で合成方法を選べます。これは筆の**Apply Mode**とは別の設定です。

| Paint Mode | 合成結果 | 使いどころ |
| --- | --- | --- |
| **Merge（既定）** | 描いたマスクを入力マスクへ重ねる | 欠けた領域を描き足す |
| **Add** | 入力マスクと新しいマスクの値を加える | マスク値を加算したい場合 |
| **Subtract** | 重なった部分で新しいマスク値を入力側から引く | はみ出した領域を除く |
| **Minimum / Maximum** | 両方のマスク値の小さい方／大きい方を採用する | 交差部分や追加領域を値で制御する |
| **Copy** | 入力側を捨て、Mask Paintで作ったマスクだけを使う | 既存マスクを参照しても結果には使わない |
| **Ignore** | 新しい描画側を捨て、入力マスクだけを使う | 描画の影響を一時的に切り分ける |

例えば、入力マスクの内部に黒い穴があるときは、そこに白いストロークを描き、まずMergeで結果を確認します。反対に、輪郭の外へ白い領域が出てしまったときはSubtractを検討します。**接続するだけで必ず加算されるわけではない**ため、画面のマスク表示で結果を確認してください。

Paint Modeの各演算は21.1 Reference ManualのMask共通コントロールに基づきます。入力マスクがない場合、二つのマスクの合成を前提にしたPaint Modeの選択は必要ありません。

## 描画ツールと主な設定

Mask Paintの描画操作は、基本的にPaintと共通です。Viewerのペイント用ツールバーで描き方を選び、InspectorのControlsで筆先や時間設定を調整します。

**Stroke**はブラシで描く編集可能な線です。必要に応じて**Make Editable**で経路を制御点として扱い、位置や形を後から修正できます。**Polyline Stroke**は点を打って輪郭を作る方法で、直線や曲線を後から整えたい場合に適しています。基本的な図形を使って範囲を描くこともできます。

**Multistroke**は多数の短い描画をまとめて処理する方式です。1フレームに何十箇所も穴を補修するときに向きますが、**描いた後で一本ずつ経路を編集できません**。後で輪郭を直す前提ならStrokeを選びます。これらの名称はMask Paintの内部で選ぶ描画方式であり、独立したFlowノードを追加する意味ではありません。

主な設定には、**Brush Shape**（筆先の種類）、**Size**（大きさ）、**Softness**（柔らかい筆先の縁）、**Apply Mode**（筆先で行う処理）があります。設定項目は選択した描画方式によって変わります。Mask Paintでは**Alphaチャンネルだけ**を描くため、PaintにあるRGBAの**Channel Selectorは表示されません**。色付きの線を映像へ描きたい場合はMask PaintではなくPaintを使います。

## 表示期間とアニメーション

表示期間は、マスクが**どのフレームに存在するか**を決める設定です。ストロークが移動するかどうかとは別に考えます。

- **StrokeやPolyline Stroke**は、初期状態でコンポジションの全期間に表示されます。Keyframes Editorで各ストロークの期間を後から調整できます。
- **Multistroke**は初期状態で1フレームだけ表示されます。複数フレームで使う場合は、**描く前にDurationを設定**してください。描画後に通常のStrokeと同じ方法で期間や個々の経路を変更することはできません。
- 編集可能なベクトルストロークでは、**Stroke Animation**のLimited DurationやWrite On / Write Offなど、描き方に応じた時間制御が利用できます。Write Onは線が経路に沿って現れる表現であり、マスク全体の位置を追跡する機能ではありません。

短時間だけ人物の輪郭が欠けるショットでは、欠けたフレームにだけ補修ストロークを表示します。動く輪郭に追従させたいときは、期間を伸ばすだけでは不十分です。位置や形のアニメーション、必要に応じた追跡データとの連携を別途設定します。

## 具体的な運用例

### Bitmap Maskの穴を埋める

人物のAlphaを抽出した結果、髪の一部に小さな黒い穴が残ったとします。

1. 映像を[Bitmap Mask](./bitmap-mask)の画像入力へつなぎ、人物のマスクを作ります。
2. Bitmap Maskの出力をMask Paintの**青いEffect Mask入力**へ接続します。Mask Paintの出力をViewerで表示し、白い人物領域と黒い穴を確認します。
3. Mask PaintでStrokeを選び、穴の内側へ白いマスク値を描きます。穴以外を変えないよう、筆先の大きさを調整します。
4. Paint Modeをまず**Merge**で確認します。補修跡の外側までマスクが広がったら、描いた線の経路や筆先を修正します。
5. 完成したマスクをBlurなどのEffect Maskへつなぎ、元画像に対する処理の範囲が意図どおりか確かめます。

この構成ならBitmap Maskの抽出条件を残したまま、**局所的な補修を後段へ重ねられます**。Mask Paintの結果はカラー画像ではないため、そのまま映像のForegroundとしてMergeに渡す使い方とは区別します。

### 数フレームだけ出るマスクのはみ出しを抑える

ロトスコープの輪郭が数フレームだけ背景に食い込む場合は、既存のPolygon MaskなどをMask Paintへ入力し、はみ出した領域に対応するマスクを描きます。Paint Modeを**Subtract**にして入力マスクからその範囲を引き、必要なフレームだけ補修が現れるよう表示期間を調整します。

広い区間で輪郭そのものを直す必要がある場合、Mask Paintで大量の補修を重ねるより、元の[Polygon Mask](./polygon-mask)の制御点を直す方が管理しやすいことがあります。

## Paint・他のMaskノードとの使い分け

[Paint](../paint/paint.md)は入力画像に色・クローン・補修を描いて2D画像を返します。Mask Paintは単一チャンネルのMaskを返し、ほかの効果の適用範囲を作ります。**透明BackgroundをPaintへ入れて線を描く構成**と、**画像入力なしでMask Paintからマスクを作る構成**は、出力データが異なります。

幾何学的な輪郭を最初から作るなら[Polygon Mask](./polygon-mask)や[Ellipse Mask](./ellipse-mask)、画像のAlphaや輝度から抽出するなら[Bitmap Mask](./bitmap-mask)を先に検討します。Mask Paintは手描きが必要な部分や、**既存のマスクを少しだけ直す作業**で特に有効です。選択基準の全体像は[Maskノードの概要](./index.md)を参照してください。

## 実機例：手描きの線と1フレームのMultistroke

<!-- capture-case:S84 -->

Resolve Studio21.1.0.14／Windows、1920×1080、Viewer40%で撮影しました。画像入力なしのMask PaintをBackgroundのEffect Maskへ接続しています。内部REGIDは`PaintMask`でした。Flowに見えるのはMask Paint、Background、MediaOutの3ノードです。

[![画像入力のないMask PaintからGold BackgroundのEffect Maskへ接続する実機Graph](/img/fusion/captures/S84/graph.png)](/img/fusion/captures/S84/graph.png)

[![Soft BrushのSize0.02、Softness1、Alpha1、Opacity1、ストロークの長さ1のInspector](/img/fusion/captures/S84/inspector.png)](/img/fusion/captures/S84/inspector.png)

[![フレーム0でMask Paintの白い水平線が右のオレンジの線として現れる](/img/fusion/captures/S84/compare.png)](/img/fusion/captures/S84/compare.png)

実機Viewerで水平にドラッグして線を描きました。左に白いMask、右に同じ位置のオレンジの線が現れます。色は後段のBackgroundが持ち、Mask Paintは表示する範囲を渡しています。

この状態では内部にMultistrokeが作られ、Soft Brush、Size0.02、Softness1、Apply ModeのColor、Alpha1、Opacity1、Duration1を読み戻しました。Inspectorの「ストロークの長さ」はこのDurationです。描いた線のデータはフレーム0に保存されています。

同じ状態でフレーム1へ進めると、線が消え、左は黒いMask、右は全面透明になりました。初期Multistrokeの1フレームという期間を、フレーム0と1の出力で確認した例です。Durationを変更してから描く操作は、まだ確認していません。

[![同じMultistrokeはフレーム1で消え、左が黒、右が全面透明になっている](/img/fusion/captures/S84/frame1.png)](/img/fusion/captures/S84/frame1.png)

フレーム0へ戻し、Maskタブを開くと、Level1、Fast Gaussian、Soft Edge0、Invertオフを確認できます。

[![Level1、Fast Gaussian、Soft Edge0、InvertオフのMask Paint Maskタブ](/img/fusion/captures/S84/mask-inspector.png)](/img/fusion/captures/S84/mask-inspector.png)

Invertだけをオンにすると、左は白地に黒い線、右はオレンジの面に透明な線となり、表示する範囲が入れ替わりました。

[![InvertをオンにしたMask Paintの実機Maskタブ](/img/fusion/captures/S84/inverse-inspector.png)](/img/fusion/captures/S84/inverse-inspector.png)

[![Invertオンでは左が白地に黒線、右がオレンジ地に透明な線へ反転する](/img/fusion/captures/S84/inverse.png)](/img/fusion/captures/S84/inverse.png)

最後はフレーム0、Invertオフ、Show View Controlsオフへ戻し、Controlsタブと両Viewer40%の状態で保存しました。

Stroke／Polyline Strokeへの切り替え、Durationの変更、Make Editable、Write On／Write Off、別Brush・Apply Mode、既存Maskの穴補修、実写と性能は未確認です。

[再現用Graph](/img/fusion/captures/S84/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S84/capture.json)

## バージョン・出典・未確認範囲

Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月）を基準にしています。

- Chapter 80「Paint」p.1747：Paint／Mask Paintの違い、画像入力の要否、Alpha専用のChannel Selector。
- Chapter 108「Mask Nodes」pp.2475–2476：Mask Paint [PNM]、青いEffect Mask入力、描画ツール、期間、Bitmap Maskの穴補修。pp.2465–2466：Mask共通のPaint Mode演算。
- Chapter 113「Paint Node」pp.2639–2645：StrokeとMultistrokeの編集可能範囲、Brush／Apply／Stroke Controls、Duration、Keyframes Editor。

S84で内部REGID `PaintMask`、初期Multistrokeの描画、フレーム0／1の表示、MaskタブのInvertを実機確認しました。全描画ツール、各値域、Duration変更、Free／Studio差は未確認のため、`verification: partial`を維持します。
