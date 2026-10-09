---
title: Paint
description: 2D画像にブラシ線・クローン・消去・補修を加え、描画したストロークを後から管理できるFusionノード。
doc_type: node
term_id: paint
term_short: 2D画像上に描いた線や複製・補修の操作を、ストロークごとに管理するノード。
verification: partial
aliases: [Paint]
concepts: [paint, image-data, mask-data]
nodes: [Paint]
node_family: paint
controls: [Brush Shape, Apply Mode, Size, Softness, Spacing, Stroke Animation, Duration, Make Editable]
inputs: [image, mask]
outputs: [image]
tasks: [paint, cleanup, clone]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-10"
---

# Paint

Paintは、入力した2D画像へブラシで色を描いたり、別の場所の画素を複製して傷や不要物を隠したりするノードです。描画はストローク（1本の線や図形）として管理され、多くの種類は後から位置・形・色・表示期間を調整できます。

**Flow上のPaintは2D画像を受け取り、描画後の2D画像を返します。** StrokeやMultistrokeはPaintの内部で使う描画要素であり、別の「Paint型データ」を次のノードへ送るわけではありません。

## 入力と出力

- **Input（オレンジ）**：必須。作業する2D画像をつなぎます。MediaInなどの実写素材でも、Backgroundで作った透明画像でも構いません。入力画像の大きさがPaintの作業解像度になります。
- **Effect Mask（青）**：任意。別の<Term id="mask">マスク</Term>をつなぎ、描画結果を適用する場所を制限します。クローン元の画像を指定する端子ではありません。
- **出力**：ペイント済みの2D画像。Mergeで別の映像に重ねたり、後続のColor・Blurノードへ渡したりできます。

手描きの線を保存しているため、描き直さずにストローク単位で変更できるのが特徴です。ただし、後述するMultistroke系には個々の線を描画後に修正できない制限があります。

## 最初の接続

### 映像に直接描く

~~~text
MediaIn → Paint → MediaOut
~~~

MediaInの画像をキャンバスとして、Paintを選択した状態でViewer上に描きます。映像を補修する場合の最短構成です。

### 描画を別レイヤーにする

~~~text
Background（同じ解像度、Alpha 0）→ Paint → MergeのForeground
MediaIn ─────────────────────────────→ MergeのBackground
Merge → MediaOut
~~~

透明なBackgroundをPaintへ入れ、完成した描画だけをMergeで元映像へ重ねます。こうするとMerge側の合成方法や不透明度を後から調整しやすくなります。Backgroundの幅・高さは映像に合わせてください。

透明なキャンバスへ**CloneやSmear**を使うときは、描画先の透明画像だけでは参照する画素がありません。元映像をPaintのInspectorでSource Toolとして指定するなど、参照画像を別に与える必要があります。単にMergeの背景へ映像を接続するだけでは、Paint側のクローン元になりません。

## 描画方法を選ぶ

Paintを選択するとViewer上部に描画用ツールが現れます。ここで選ぶものは**Paint内部のストローク種類**であり、Flowへ新たなノードを挿入する操作ではありません。

| 種類 | 何ができるか | 選ぶ目安 |
| --- | --- | --- |
| [Stroke](./stroke) | ペンで描いた線を保持し、後から位置・形・アニメーションを編集する | 追従する線、部分補修、手描きアニメーション |
| [Multistroke](./multistroke) | 多数の短いブラシ操作を効率よく記録する | 1フレーム内の細かなゴミや傷を大量に修正する |
| [Clone Multistroke](./clone-multistroke) | 参照した画素を複製する短いブラシ操作をまとめる | トラッキングマーカーや小さなゴミをまとめて隠す |
| [Polyline Stroke](./polyline-stroke) | 点を打って作った曲線に沿って線を描く | 輪郭のなぞり描き、線の書き順を制御する |
| [Circle Stroke](./circle-stroke) / [Copy Ellipse](./copy-ellipse) | 円形の描画や、円形範囲の画素複製を行う | 円い印、円形の小さな補修範囲 |
| [Copy Rectangle](./copy-rectangle) / [Copy Polyline](./copy-polyline) | 四角形や自由形の範囲を別の位置から複製する | 看板の一部、直線的な物体、複雑な輪郭の置換 |
| [Fill](./fill) | 指定した色と近い、隣接する画素領域を塗る | 一続きの領域をまとめて塗り替える |
| [Paint Group](./paint-group) | 複数のストロークをまとめて動かす | 同じ被写体に付随する補修をまとめて追従させる |

**StrokeとMultistrokeの違い**は、特に時間方向の補修で重要です。通常のStrokeは初期状態でコンポジション全体に表示され、後からKeyframes Editorで表示期間を調整できます。一方、MultistrokeとClone Multistrokeは初期状態で1フレームだけに適用され、描いた線自体を後編集できません。こちらを使う場合は、描く前にDurationなどの条件を決めます。大量の線をまとめて動かしたいときはPaint Groupで扱えます。

## 主な設定項目

InspectorのControlsでは、描く前に筆先や描画方法を決めます。ストロークを選択すると、その種類に対応する設定を後から変更できます。すべての項目がすべての描画方法に表示されるわけではありません。

### Brush Shape・Size・Softness

**Brush Shape**で筆先の形を選びます。Soft Brushは縁が柔らかい円形、Circular BrushとSquare Brushは輪郭の硬い筆先です。Single Pixel Brushはアンチエイリアスなしの1ピクセル筆先です。Image Brushでは別ノードやファイルなどの画像を筆先として使えます。

**Size**は筆先の大きさ、**Softness**は柔らかい筆先の縁のぼけ具合を調整します。細いワイヤーを隠すなら周囲の細部を消さない程度に小さくし、肌の軽い修整では境界が目立たない筆先を試します。Vary Size / Vary Opacityは対応するペンタブレットの筆圧や描く速さで変化させる設定です。

### Apply Mode

筆先を画像へどう反映するかを選びます。

- **Color**：選んだ色を描きます。文字の手描きや色付きの印に使います。
- **Clone**：同じ画像内の別の位置、または指定したSource画像から画素を複製します。時間をずらして参照することもできます。
- **Erase**：下に重なっているストロークを見せなくする方向の消去です。元の映像を破壊的に削除する操作とは分けて考えます。
- **Smear**：筆の動きに沿って画像の画素を引き伸ばします。
- **Wire**：線に沿う周辺画素を使い、ワイヤーなど細い不要物を隠します。
- **Emboss / Merge / Stamp**：それぞれ凹凸風の表現、画像ブラシを合成する描画、Alphaを無視した押印に使うモードです。

CloneやWireを使うときは、細部の多い境界や動く背景で補修跡が出ないか、実際のフレームを再生して確認します。

### Stroke Animation・Duration・Make Editable

**Stroke Animation**は線の表示の仕方を指定します。All Framesでは継続表示、Limited Durationでは指定期間だけ表示、Write On / Write Offでは線が描かれる・消える動きを作れます。Trailでは線の始点と終点を時間差で動かし、短い描画区間が経路を進むように見せます。

**Duration**は対象の描画方式で指定できる表示期間です。StrokeやPolyline Strokeなど後編集できる線は、Keyframes Editorでも期間を調整できます。

**Make Editable**は、対応するStrokeの制御点を表示して曲線の形を調整するための操作です。Viewer上部のPolyline編集ツールで制御点の追加・移動・曲線化・削減ができます。

作成したストロークはInspectorの**Modifiers**に一覧として現れ、順序・適用方法・削除などを管理できます。Multistroke系は大量の内部操作をまとめる仕組みのため、通常のStrokeと同じ細かさでは一覧編集できません。

## 運用例

### 1フレームだけ写ったゴミを消す

~~~text
MediaIn → Paint（Clone Multistroke）→ MediaOut
~~~

画面の一部にだけ現れた小さなゴミを、周辺のきれいな画素で隠します。Clone Multistrokeを選び、必要ならAlt / Optionを押しながらクリックして参照位置を指定します。最初はそのフレームだけを直し、前後のフレームには不要な補修が出ていないか確認します。後から形を細かく変えたい補修には通常のStrokeを選びます。

### 動く被写体に付いたマーカーを消す

~~~text
MediaIn → Paint（複数の補修ストローク）→ MediaOut
~~~

マーカー付近の画素をCloneで複製し、対象が動く区間ではStrokeの位置を追従させます。通常のStrokeなら中心点をTrackerと結び付ける方法があり、複数のMultistrokeをまとめて動かすならPaint Groupを使う方法があります。追従の設定だけで背景の隠れ方まで自動補正されるわけではないため、遮蔽や遠近が変わるフレームを確認します。

### 手描きの線をアニメーションにする

~~~text
Background（Alpha 0）→ Paint（Polyline Stroke）→ MergeのForeground
背景映像 ───────────────────────────────→ MergeのBackground
Merge → MediaOut
~~~

Polyline Strokeで文字の輪郭や経路を描き、Stroke AnimationのWrite Onで描画の進行を制御します。あらかじめ線の形を整えてからタイミングを付けると、途中で経路を修正しやすくなります。完成した線はMergeで元映像に重ねます。

## PaintとMask Paintの違い

PaintはRGBやAlphaを含む2D画像に描きます。色を足す、元画像の一部を複製する、線を重ねるといった作業に使います。

一方、[Mask Paint](../masks/mask-paint)は単一チャンネルのマスク値を描き、別ノードのEffect Maskなどへ渡します。透明・不透明の範囲を手で補修したい場合はこちらが適しています。Mask PaintはPaintと異なり、キャンバス用の画像入力を必須としません。
2D画像とマスクの違いは[Imageの基礎](../../learn/02-data/image)と[Maskの基礎](../../learn/02-data/mask)を参照してください。

## 注意点と確認範囲

- Paintの**入力・出力は画像**です。内部ストロークの一覧を、独立したFlowのデータ端子と混同しないでください。
- 透明なBackgroundで描く場合も、Paintは入力画像の解像度を使用します。入力の大きさが違うと、クローン位置や追跡結果を合わせにくくなります。
- Cloneの参照元、ストロークの表示期間、Effect Maskの範囲は独立して確認します。Effect MaskをつないでもClone元の画像が指定されるわけではありません。
- 数百本の個別Strokeは処理が重くなることがあるため、後編集が不要な大量の補修はMultistroke系を検討します。

**出典**：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月）、Chapter 113「Paint Node」pp.2638–2645、およびChapter 80「Paint」pp.1747–1751。入力、Stroke種別、主要Inspector項目、時間制御、透明Backgroundを使う構成を確認しました。実機21.1での描画結果・端子の内部ID・初期値の全件照合は行っていないため、verificationはpartialです。
