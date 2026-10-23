---
title: 追跡を解析してから適用先を分ける
description: 追跡精度とロゴ・マスクへの適用を分けて確認し、ずれの原因を切り分ける再利用構成。
doc_type: pattern
verification: partial
aliases: [solve then apply, tracking data]
concepts: [tracking, parameter-data, coordinate-space]
patterns: [solve-then-apply-track]
nodes: [Planar Tracker, Planar Transform, Tracker, Transform, Merge]
tasks: [track, attach-graphics, stabilize, debug]
level: intermediate
product_scope: fusion
updated: "2026-10-21"
---

# 追跡を解析してから適用先を分ける

## 使う場面

動く看板にロゴを貼ったのに、再生するとロゴが滑る。位置を手動で直しても、追跡そのものが外れたのか、正しい追跡結果をロゴへ適用する段階でずれたのか分からない。こうした問題では、**映像の動きを解析する工程**と、**別の素材にその動きを与える工程**を分けます。

平面の追跡では[Planar Tracker](../../nodes/tracking/planar-tracker)で看板などの面を解析し、[Planar Transform](../../nodes/tracking/planar-transform)でロゴやマスクを追従させます。元映像を調べるための経路と、追加素材を動かすための経路は別です。

## 前提となる考え方

Planar Trackerは入力した映像から、フレームごとの平面の変化を**Track spline**に記録します。これは画像ではなく変形の情報です。解析後にInspectorの**Create Planar Transform**を押すと、この情報を利用するPlanar Transformノードが作られます。公式21.1マニュアルによれば、両ノードはTrack splineを共有し、追跡を修正した場合は作成済みのPlanar Transformにも反映されます。

Planar Transformのオレンジの**Image Input**に入れるのは、変形したいロゴ画像やPolygonマスクです。「Track splineを参照すること」と「画像を線で接続すること」は違います。この区別を含む[データ領域の考え方](../../learn/07-debugging/trace-data-domain)を先に押さえます。

## 基本構成

~~~text
［解析用：Track splineを作る］
看板のFootage → Planar Tracker（Track）
                         └─ Create Planar Transform（ノード作成）

［合成用：別の画像に追跡結果を適用する］
ロゴ画像 → Transform（基準フレームで配置）
         → Planar Transform ────→ Merge（Foreground）┐
看板のFootage ─────────────────→ Merge（Background）┴→ MediaOut
~~~

**Planar TrackerとPlanar Transformの間に、追跡データ専用の画像ケーブルを引くわけではありません。** Planar Transformは追跡結果を内部で参照し、Image Inputから入れたロゴを各フレームで変形して出力します。Mergeで初めて背景映像に重ねます。元の看板の文字の消去や、手前を横切る人物の遮蔽は別途処理します。

### 実機の参考例

<!-- capture-reuse:R60 -->

S10は1フレームごとに右へ3px動く120フレームのチャートを解析し、Create Planar Transformで作成したNodeへ黄色いTRACKED文字を接続した例です。フレーム0と60を撮影し、60では文字も180px移動しています。解析経路と文字の画像経路は別です。

[![S10の実機撮影。Node Editorの接続](/img/fusion/captures/S10/graph.png)](/img/fusion/captures/S10/graph.png)

[![S10の実機撮影。Inspectorの設定](/img/fusion/captures/S10/inspector.png)](/img/fusion/captures/S10/inspector.png)

[![S10の実機撮影。Planar Trackerの追跡領域](/img/fusion/captures/S10/region.png)](/img/fusion/captures/S10/region.png)

[![S10の実機撮影。基準フレーム0の合成](/img/fusion/captures/S10/reference.png)](/img/fusion/captures/S10/reference.png)

[![S10の実機撮影。Viewer出力](/img/fusion/captures/S10/result.png)](/img/fusion/captures/S10/result.png)

Resolve Studio 21.1.0.14／Windowsで撮影したS10の参考例です。未確認の範囲：看板の実写、Perspective変形や遮蔽、Polygonマスクの追従、Steady/StabilizeとCompute Stabilization、Point TrackerのConnect To、追跡修正後のSpline共有の更新。 [撮影条件と確認範囲](/img/fusion/captures/S10/capture.json)

## 保つべき条件

1. **最初に解析精度を確かめる。** Planar TrackerのSteadyで追跡した面を見ます。面が止まらず滑るなら、ロゴのTransformではなく、解析領域・遮蔽・Motion Typeを直します。Steadyは追跡精度を見るのに向くモードです。
2. **配置は基準フレームで行う。** Planar TransformのReference Timeは追跡パターンを取得した時刻です。ロゴの位置と大きさは、そのフレームを確認して調整します。
3. **一定の位置ずれと経時的な滑りを区別する。** 全区間でほぼ同じ位置ずれなら追加素材の配置と[Center / Pivot / Size / Angle](../../learn/03-space/center-pivot-size-angle)を確認します。動くほどずれるなら解析精度や、貼り付け先が同じ平面にあるかを調べます。
4. **元映像と追加素材を分ける。** MergeのBackgroundには元映像、ForegroundにはPlanar Transformで動かした画像を入力します。変形と合成を同じ操作だと考えません。
5. **修正を一度に重ねない。** 追跡の再解析、Reference Time、ロゴ側の手動キーを同時に触ると、どこで直ったのか判別できなくなります。

## バリエーション

### 看板へロゴを貼る

まず看板の角や模様を含む領域をPlanar Trackerで囲み、必要なフレーム範囲をTrackします。Create Planar Transformで適用用のノードを作り、透過ロゴをTransformで基準フレームの看板に合わせ、その後段へPlanar Transformを接続してMergeへ渡します。追跡が合っていれば、ロゴの素材だけを交換しても解析結果を使い回せます。

ただし、追跡した面とロゴの配置先が異なる奥行きにあると、カメラ移動による視差でずれます。平面では表せない変形を無理に位置補正で隠さないでください。

### マスクを被写体に追従させる

服の柄を解析して、服にかける色補正をPolygonマスクで限定する例です。

~~~text
服のFootage → Planar Tracker（Trackで解析）

Polygon → Planar Transform（オレンジのImage Input）
        → Color Corrector（青いEffect Mask）
服のFootage → Color Corrector（画像入力） → MediaOut
~~~

Polygonを接続するのはPlanar Transformの**オレンジのImage Input**です。Planar Transform自身の青いEffect Maskはノードの出力領域を制限する別の入力で、マスク追従用の入力と混同しません。追従後もしわ・伸縮で輪郭がずれるときはPolygonの頂点を部分的に直します。面内の柔らかい変形には[Surface Tracker](../../nodes/tracking/surface-tracker)も候補です。

### 揺れを抑える

安定化も追跡結果の利用法ですが、ロゴ貼り付けと同じノード配線ではありません。Planar TrackerでTrackした後、**Stabilize**を選び、Smoothing Radiusなどを調整して**Compute Stabilization**を実行します。モードを切り替えただけでは安定化処理は計算されません。Steadyは対象面を止めて追跡を確認する用途、Stabilizeは揺れを滑らかにする用途です。

## ノードの選び方

| やりたいこと | 解析と適用 |
| --- | --- |
| 壁や看板に画像を貼る | Planar Tracker → Create Planar Transform。追加画像をPlanar Transformへ接続する |
| Polygonマスクを追従させる | Planar Tracker → Planar Transform。PolygonをオレンジのImage Inputへ入れる |
| 点の位置を別ノードのCenterに利用する | [Tracker](../../nodes/tracking/tracker)の追跡値を、対象パラメーターの**Connect To**で参照する |
| 揺れを滑らかにする | Planar TrackerのStabilizeでCompute Stabilizationを実行する |

TrackerのConnect Toは、**パラメーターの値を接続する仕組み**です。画像の出力を次のImage Inputへ配線する操作とは異なり、位置だけの接続で平面の遠近変化がすべて再現されるわけではありません。

## 失敗しやすい点

| 症状 | 確認箇所 |
| --- | --- |
| Steadyで平面が滑る | 解析領域、Motion Type、遮蔽物、追跡区間 |
| ロゴだけ同じ方向へずれる | ロゴ側TransformとReference Timeの基準フレーム |
| カメラが斜めになるとずれる | 対象が平面か、Perspective変形で解析したか |
| マスクが動かない | PolygonがPlanar TransformのオレンジのImage Inputに入っているか |
| 一部のフレームで止まる | Spline EditorでTrack splineの追跡済みフレーム範囲を確認する |
| Stabilizeに変えても変化しない | Compute Stabilizationを実行したか |
| 手前を横切る人物にロゴが重なる | 遮蔽マスク・前景合成。追跡精度とは別の問題 |

症状から調べる場合は[トラッキング結果がずれる](../../troubleshooting/tracking/track-drifts)へ進みます。

## この構成を使う手順

- [平面を追跡してグラフィックを貼る](../../recipes/tracking/planar-track-graphic)

## 関連ノード

- [Planar Tracker](../../nodes/tracking/planar-tracker)
- [Planar Transform](../../nodes/tracking/planar-transform)
- [Tracker](../../nodes/tracking/tracker)
- [Surface Tracker](../../nodes/tracking/surface-tracker)

## バージョン・出典

Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 119「Tracking Nodes」pp.2824–2828（Track spline、Create Planar Transform、Steady、Stabilize、Motion Type）、Chapter 120「Transform Nodes」pp.2871–2872（Image Input / Effect Mask、Polygon、Reference Time、Track spline共有）を確認。TrackerのConnect ToはFusion Fundamentals Chapter 81 pp.1793–1795を参照しました。

図と制作例は仕様に基づく構成例です。現行実機での個別素材の追跡精度、実際の出力画像、Edition差は未確認のため、verification: partialを維持します。
