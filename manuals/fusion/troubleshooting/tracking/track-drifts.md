---
title: トラッキング結果がずれる / driftする
description: 追跡自体の滑りと、ロゴ・マスクへの適用後だけ生じる位置ずれを分けて診断する。
doc_type: diagnostic
verification: partial
aliases: [track drift, trackingずれ, planar drift]
concepts: [tracking, coordinate-space]
patterns: [solve-then-apply-track]
nodes: [Tracker, Planar Tracker, Planar Transform, Surface Tracker]
tasks: [debug, track, attach-graphics]
symptoms: [tracking-drift, tracking-offset]
prerequisites: [tracking]
level: intermediate
product_scope: fusion
updated: "2026-10-21"
---

# トラッキング結果がずれる / driftする

看板のロゴが滑るときは、**元の追跡点・追跡平面が対象から外れる場合**と、**追跡は正しくてもロゴを動かす段階でずれる場合**を区別します。ロゴ側の手動キーで追跡誤差を隠す前に、追跡の精度を確認します。

## まず確認すること

| 症状 | 最初に調べる箇所 |
| --- | --- |
| 追跡点が途中から違う模様へ移る | Trackerの特徴点、探索範囲、遮蔽 |
| Planar Trackerの平面がゆっくり滑る | 参照フレーム、Pattern、Motion Type、レンズ歪み |
| 追跡は合うのにロゴだけ一定量ずれる | ロゴの初期配置、Pivot、Reference Time |
| 正面では合うが斜めになるほどずれる | 平面の成立条件とPerspective変形 |
| 途中からロゴが止まる | Render RangeとTrack splineの追跡済み区間 |
| Stabilize後に端が透明になる | 安定化で生じた画面外領域。追跡ずれとは別の現象 |

基準フレーム、最も動きの大きい中間フレーム、終盤の**3か所をViewerで比較**してください。1か所だけ合っていても、全区間が合っているとは限りません。

## 追跡そのものを検査する

### Trackerで点を追っている場合

最初に選んだ特徴（目尻、ドアノブ、模様の角など）から追跡点が外れていないか確認します。DaVinci Resolve 21.1のTrackerはIntelliTrackが既定ですが、従来のPoint方式も選べます。

Point方式では、特徴を収める**Pattern Rectangle**と、次フレームでその模様を探す**Search Rectangle**が別々です。速い移動で失敗するならSearch Rectangleがフレーム間の移動量を含むか確認します。広げすぎると計算が重くなるため、必要な範囲に留めます。途中で遮蔽物に隠れた区間は、ロゴのTransformではなく追跡側の修正対象です。

### Planar Trackerで平面を追っている場合

Track完了後、Operation Modeを**Steady**へ切り替えて再生します。看板など、追跡した面の模様がその場に留まり、背景のほうが動いて見えるなら、追跡の評価がしやすくなります。選んだ面の模様が滑る場合は、ロゴを接続する前にTrackを見直します。**Steadyは追跡精度の検査**にも使えますが、手持ちの揺れを平滑化する**Stabilize**とは役割が違います。

21.1 Manualに沿った主な確認項目は次のとおりです。

1. **Reference TimeとPattern**：模様が大きく写り、なるべく正面から見え、手前の物体に隠れていないフレームを選びます。少ない画素や特徴のない面は、揺れや滑りの原因になります。Reference Timeを設定し直すと**既存の追跡データが破棄**されるため、変更する場合は再解析を前提にします。
2. **Motion Type**：遠近で台形に変わる面はPerspectiveを検討します。Translationなど単純なモデルでは変形を表しきれない場合があります。ただし、小さな面や特徴点が偏る素材では、単純なモデルへ戻したほうが安定することもあります。
3. **Track Channel**：Red / Green / Blue / Luminanceのうち、模様のコントラストが高くノイズの少ないものを選びます。OutputのBackground - Preprocessedは、解析前処理後の画像を確かめる用途です。
4. **遮蔽物**：人が看板の前を横切る場合は**Occlusion Mask**で追跡から除外します。Planar Trackerでは白い部分が除外領域です。**Effect Mask**は処理結果の範囲を制限する別の入力なので、混同しません。
5. **歪みと範囲**：レンズ歪みが強い映像では追跡前の歪み補正を検討します。また、Keyframes EditorのRender Rangeと、Track splineに追跡が記録された区間を確認します。

Planar TrackerはPointとHybrid Point/Areaを選べます。まずPointで解析し、十分でない場合にHybridを検討します。Hybridは面内の画素を広く使う一方、遮蔽を除外するマスクの準備が重要で、計算も重くなります。

## 追跡は合っているのにロゴだけずれる

Planar TrackerでSteadyの検査に合格したら、次は**追跡データの適用**を確認します。Planar Trackerの画像出力が追跡データ用の端子を兼ねているわけではありません。**Create Planar Transform**で生成したPlanar TransformがTrack splineの遠近変形を参照し、接続されたロゴやマスクに適用します。

```text
【追跡】看板映像 → Planar Tracker（Track → Steadyで検査）
                       └─ Create Planar Transform（追跡データの共有）

【合成】透明ロゴ → Transform（基準フレームの配置）
                → Planar Transform → Merge（Foreground） ┐
        看板映像 ────────────────────→ Merge（Background） ┴→ MediaOut
```

**常に同じ量だけずれる**場合は、まず基準フレームでロゴの位置・大きさ・Pivotを確認します。Planar TransformのReference Timeは元の平面追跡の基準に対応する値です。配置補正のために追跡基準をむやみに変えず、ロゴ側に置くTransformで初期位置を調整すると原因を分離できます。

**時間とともにずれが増える**場合は、Steadyで追跡誤差を再確認したうえで、ロゴを貼る場所が本当に追跡した面と同一平面かを確かめます。違う奥行きの物体を追うと視差が生じます。布・肌のように面自体が伸び縮みする場合は、単一の平面変形では合いません。[Surface Tracker](../../nodes/tracking/surface-tracker)も候補です。

Tracker（点追跡）を別ノードへ使う場合は、対象のCenterなどのパラメーターから**Connect To → Tracker → Offset Position**を選びます。これはTrackerの画像出力を配線する操作とは違います。位置を接続しただけでは、回転・拡大率まで同時に合うとは限りません。詳しくは[Tracker](../../nodes/tracking/tracker)を参照してください。

### 実機の参考例

<!-- capture-reuse:R52 -->

追跡解析の枝と、PlanarTransformで文字へ動きを適用する枝を分けた例です。フレーム0と60で、文字が既知の右移動3px/frameへ追従した結果を示します。

[![S10の実機Node Editorの接続](/img/fusion/captures/S10/graph.png)](/img/fusion/captures/S10/graph.png)

[![S10の基準フレーム0の合成](/img/fusion/captures/S10/reference.png)](/img/fusion/captures/S10/reference.png)

[![S10のViewer出力](/img/fusion/captures/S10/result.png)](/img/fusion/captures/S10/result.png)

Resolve Studio 21.1.0.14／Windowsで撮影したS10の参考例です。正常なTranslationの参照例です。実写driftの再現・修復、Point、Perspective、Steadyの精度は未確認です。 [撮影条件と確認範囲](/img/fusion/captures/S10/capture.json)

## Stabilizeだけ結果が変わらない場合

Planar TrackerのStabilizeは、モードを変えただけでは安定化を計算しません。Smoothing RadiusやParameters to Smoothを設定した後、**Compute Stabilization**を実行します。

また、動く車の側面を追えば車自身の動きも安定化の対象に含まれます。カメラの揺れを抑えたいなら、可能なら建物の壁など静止した背景の面を選びます。安定化で露出する透明端は撮影されていない領域なので、追跡ずれと混同せずFrame ModeのCrop / Zoomなどを確認します。

## 修正する順序

1. ロゴとマスクの補正を一時的に外し、追跡点またはSteadyの面が対象を追えているか確認します。
2. 追跡自体が悪ければ、特徴点・Pattern・遮蔽・Motion Type・解析範囲を修正します。Reference Time変更は再追跡が必要です。
3. 追跡が正しければPlanar TransformまたはConnect Toで適用し、基準フレームで位置を合わせます。
4. 最後に全区間を再生し、追加の配置調整と遮蔽処理を行います。

看板への具体的な作業例は[平面をtrackしてgraphicへ適用する](../../recipes/tracking/planar-track-graphic)を参照してください。

## なぜ起きるか・関連資料

動きを求める**追跡**と、その動きを別の画像・マスクへ与える**適用**は別の処理です。前者が合っていなければ追跡範囲や特徴点を直し、後者だけがずれるなら座標・基準フレーム・配置用Transformを確認します。

- [Trackを解いてから適用先を分ける](../../patterns/tracking/solve-then-apply-track)
- [Center / Pivot / Size / Angle](../../learn/03-space/center-pivot-size-angle)
- [Planar Tracker](../../nodes/tracking/planar-tracker) / [Planar Transform](../../nodes/tracking/planar-transform)

## バージョンと確認範囲

**一次資料：** Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 119 pp.2821–2828（Planar Tracker、Occlusion Mask、Reference Time、Motion Type、Steady、Stabilize）、pp.2839–2842（Tracker、Pointの探索範囲）、Chapter 120 pp.2871–2872（Planar Transform、Track spline）、Fusion Fundamentals Chapter 81 pp.1793–1795（Connect Toと公開追跡値）。

ここでの診断順序と看板の接続図は、Manualの記述に沿った構成例です。各素材での追跡精度や21.1実機での詳細挙動は未検証のため、`verification: partial`を維持します。
