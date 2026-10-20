---
title: 平面追跡で看板にロゴを貼る
description: Planar Trackerで看板の動きを解析し、Planar Transformで透明ロゴを追従させて元映像へ合成する手順。
doc_type: recipe
verification: partial
aliases: [planar track graphic, screen replacement]
concepts: [tracking, coordinate-space]
patterns: [solve-then-apply-track]
nodes: [Planar Tracker, Planar Transform, Transform, Merge]
tasks: [track, attach-graphics, screen-replace]
prerequisites: [data-domain]
level: intermediate
product_scope: fusion
updated: "2026-10-21"
---

# 平面追跡で看板にロゴを貼る

## できあがるもの

カメラが横へ動き、看板が斜めに見える映像を使います。看板の表面を追跡し、透明な背景に描いたロゴを重ねることで、**ロゴが看板の移動や遠近変化に合わせて動く映像**を作ります。

追跡するのは看板に写っている模様です。追跡結果をロゴに適用した後、元映像と合成します。**既存の文字を消す作業や、看板の手前を横切る人物をロゴより前に表示する作業は別工程**です。

## 必要な素材とノード

- 看板や壁など、模様を識別できる平らな面が写った映像
- 透明背景のロゴ画像（PNGなど）。まずは元映像と同じサイズの透明キャンバスに配置すると位置合わせが分かりやすい
- <Term id="planar-tracker">Planar Tracker</Term>：看板の動きを解析する
- <Term id="planar-transform">Planar Transform</Term>：解析した動きをロゴ画像に適用する
- Transform：基準フレームでロゴの位置と大きさを合わせる
- Merge：動かしたロゴを元映像に重ねる

## ノードの接続

~~~text
【解析用：看板の動きを記録する】
看板映像 → Planar Tracker（オレンジのBackground入力）
                    └─「Create Planar Transform」で適用用ノードを作成

【合成用：ロゴを看板に重ねる】
透明ロゴ → Transform（位置・大きさ）
         → Planar Transform（オレンジのImage Input）
         → Merge（Foreground）──┐
看板映像 → Merge（Background）──┴→ MediaOut
~~~

Planar TrackerとPlanar Transformは、**画像のケーブルで直結しません**。追跡後に作成したPlanar Transformが、元のTrackerの**Track spline（フレームごとの平面変形データ）**を共有します。Planar Transformの画像入力へ入れるのは、動かしたいロゴです。

## 手順

### 1. 看板を追跡する

1. 元映像から枝分かれさせ、Planar Trackerのオレンジの**Background**へ接続します。元映像は後でMergeのBackgroundにも使います。
2. **Operation Mode**を**Track**にします。Keyframes Editorで、看板が見えている範囲にRender Rangeを合わせます。
3. 看板が大きく、正面に近く、人物などに隠れていないフレームへ移動して、**Reference Time**の**Set**を押します。このフレームが解析とロゴ配置の基準になります。
4. そのフレームで、Viewerに看板の模様や縁を含む**閉じたPolygon（Pattern）**を描きます。これは追跡する画素の領域であり、後でロゴを配置する四隅ではありません。
5. **Tracker**はまず**Point**で試します。カメラ移動により看板の台形が変わるなら、**Motion Type**を**Perspective**にします。遠近変化がほぼない場合や追跡が不安定な場合は、より単純なMotion Typeも検討します。
6. **Track Channel**はRed / Green / Blue / Luminanceから、模様が明瞭でノイズの少ないものを選びます。迷ったら**Output：Background - Preprocessed**で解析前処理後の画像を確認します。
7. 必要ならReferenceフレームに戻って**Track to end**を実行し、再びReferenceへ戻って**Track to start**を実行します。Referenceがクリップ途中なら、前後両方向の追跡が必要です。

人物が看板を横切る場合は、その人物を囲むマスクをPlanar Trackerの**白いOcclusion Mask**へ接続できます。マスクの白い領域は追跡計算から除外されます。これは**人物をロゴの手前に合成するマスクとは別**です。

**Reference Timeを設定し直すと既存の追跡情報が失われます。** 追跡後に基準フレームを不用意に変えず、まず結果を検査します。

### 2. 追跡精度を確認する

1. Planar Trackerを**Steady**モードへ切り替えます。
2. クリップを再生し、看板の模様がほぼ同じ場所に止まって見えるか確認します。周囲の背景が動いたり歪んだりするのは正常です。
3. 看板自体が滑るなら、ロゴを動かす前にPattern、遮蔽物、Track Channel、Motion Type、レンズ歪みを見直します。
4. 確認後は**Track**モードに戻します。

大きな樽型歪みなどが残った映像は、平面追跡が滑る原因になります。必要に応じて、解析前にレンズ歪みを補正します。

### 3. ロゴへ動きを適用して合成する

1. TrackモードのInspectorで**Create Planar Transform**を押します。追跡結果を使う新しいPlanar Transformノードが作られます。Planar Trackerの画像出力をそこへ配線する必要はありません。
2. **Reference Timeのフレーム**に移動します。透明ロゴをTransformに接続し、位置と大きさを看板上で合わせます。
3. Transformの出力を、Planar Transformの**オレンジのImage Input**へ接続します。青いEffect Maskは、ロゴの動きを受け取る端子ではありません。
4. Planar Transformの出力をMergeの**Foreground**へ、元の看板映像をMergeの**Background**へ接続します。Mergeの出力をMediaOutへ渡します。
5. 再生して、看板が斜めになるフレームや画面端に近づくフレームでもロゴが滑らないか確認します。位置合わせをやり直すときは、まず基準フレームのTransformを調整します。

ロゴ画像と撮影素材の解像度が異なる場合は、Transformでの位置合わせだけでなく、素材の**キャンバスサイズや基準位置**も確認します。追跡の誤差と、ロゴ素材の配置の誤差を混同しないことが重要です。

## なぜこの構成で動くのか

Planar Trackerは、看板の模様からフレームごとの移動・回転・拡大縮小・遠近変形を解析し、Track splineへ記録します。Create Planar Transformで作ったノードは、その変形を**別の画像**に適用します。Mergeは変形後のロゴと元映像を合成するだけで、追跡計算は担当しません。

こうして解析と配置を分けると、ロゴのデザインを差し替えても追跡をやり直す必要がなく、ずれが出たときにも原因を確認しやすくなります。考え方は[追跡を解析してから適用先を分ける](../../patterns/tracking/solve-then-apply-track)で説明しています。

## 別の方法

看板に1枚の画像を直接貼るだけなら、Planar Trackerの**Corner Pin**モードも使えます。Track後にCorner Pinへ切り替え、差し替え画像を**緑のCorner Pin 1**へ入力し、Viewerで貼り付け先の四隅を合わせます。追跡用のPatternと貼り付け用の四隅は別物です。

画像ではなくPolygonマスクを追従させたい場合も、作成したPlanar Transformの**オレンジのImage Input**へPolygonを接続します。後段ノードのEffect Maskなどへ渡す使い方は[Planar Transform](../../nodes/tracking/planar-transform)を参照してください。

## うまくいかないとき

| 症状 | 最初に確認すること |
| --- | --- |
| Steadyで看板の模様が滑る | Patternの特徴、遮蔽物、レンズ歪み、Motion Type、Track Channel |
| ロゴが全区間でほぼ同じ位置だけずれる | Reference Timeと、基準フレームでのTransformの位置・キャンバス |
| 最初は合うのに後半で滑る | 追跡区間、Patternが隠れる箇所、平面として追える対象か |
| ロゴが動かない | Create Planar Transformで作ったノードを使用し、オレンジのImage Inputへつないだか |
| ロゴが人物の手前に出てしまう | 遮蔽用の前景合成を別途作っているか。Occlusion Maskだけでは見た目の前後関係は作れない |
| 元の看板の文字が残る | 文字消しや塗り直しは別工程。追跡と合成だけでは除去されない |

さらに詳しい原因の切り分けは[トラッキング結果がずれる](../../troubleshooting/tracking/track-drifts)を参照してください。

## 関連するページ

- [Planar Tracker](../../nodes/tracking/planar-tracker)
- [Planar Transform](../../nodes/tracking/planar-transform)
- [Transform](../../nodes/transform/transform)
- [Merge](../../nodes/compositing/merge)
- [画像とマスクのデータ](../../learn/02-data/image-mask-data)
- [追跡を解析してから適用先を分ける](../../patterns/tracking/solve-then-apply-track)

## バージョン・出典と確認範囲

**一次資料：** Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Fusion Page Effects Chapter 119「Tracking Nodes」**pp.2820–2826**（Planar Trackerの入力、Reference、Pattern、Occlusion Mask、Track / Steady、Track spline、Create Planar Transform）、Chapter 120「Transform Nodes」**pp.2871–2872**（Planar Transformの画像入力とTrack splineの共有）、Fusion Fundamentals Chapter 82「Planar Tracking」**pp.1809–1812**（画像の合成例）。入手先：[Blackmagic Design Support](https://www.blackmagicdesign.com/support/)。

接続と設定の説明は上記の21.1マニュアルを確認しました。手順中のロゴ合成例はその仕様に基づく構成例です。**実機での特定ショットの精度、Edition差、画面上の結果は未検証**のため、`verification: partial`を維持します。
