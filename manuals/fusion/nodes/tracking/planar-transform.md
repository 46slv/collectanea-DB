---
title: Planar Transform
description: Planar Trackerの解析結果を画像やマスクへ適用するPlanar Transformの接続・設定・合成例を解説する。
doc_type: node
term_id: planar-transform
verification: partial
aliases: [Planar Transform, PXF]
concepts: [tracking, coordinate-space, parameter-data]
nodes: [Planar Transform]
node_family: tracking
controls: [Reference Time, Track Spline]
inputs: [image, mask]
outputs: [image]
tasks: [track, apply-track, attach-graphics, roto]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-14"
---

# Planar Transform

**Planar Transformは、Planar Trackerで解析した平面の動きを、別の画像やマスクに適用するノード**です。看板に新しいロゴを貼ったり、被写体を囲むマスクをおおまかな動きに追従させたりするときに使います。

看板・壁・スマートフォンの画面など、1枚の面として扱える領域は、カメラの移動によって位置・角度・大きさだけでなく見かけの台形の形も変わります。[Planar Tracker](./planar-tracker)がその変化を解析し、Planar Transformが**別の素材へ追跡結果を渡す**役割を担当します。Planar Transform自体には追跡点を解析する機能はありません。

## 入力・出力

| 接続 | データ | 用途 |
| --- | --- | --- |
| **Image Input**（オレンジ） | 2D画像、Polygonなどのマスク | 追跡に合わせて変形したい画像・マスクを入力する |
| **Effect Mask**（青、任意） | マスク | Planar Transformの出力を適用する範囲を制限する |
| **Output** | 変形後の画像・マスク | MergeのForegroundや、別ノードのEffect Maskへ渡す |

**動かしたいマスクはオレンジのImage Inputへ接続します。** 青いEffect Maskに接続するマスクは、Planar Transform自体の出力を制限するためのもので、目的が異なります。この違いは、マスクを追従させるロトスコープ作業で特に重要です。

グラフィックを背景映像へ重ねるには、Planar Transformの出力を[Merge](../compositing/merge)へ接続します。追跡結果を適用するだけでは、背景との合成や元の文字の除去は完了しません。

## 作成手順

1. 撮影素材をPlanar Trackerへ接続します。
2. 対象の面が大きく見えるフレームを基準にして、追跡する領域を囲みます。
3. 必要なフレーム範囲をTrackし、ずれがないか確認します。
4. Planar TrackerのInspectorにある **Create Planar Transform** を押します。
5. 作成されたPlanar TransformのImage Inputへ、動かしたい画像またはマスクを接続します。

Planar Transformは、作成元のPlanar Trackerが生成した**Track spline**を共有します。Track splineにはフレームごとの透視変形が保存され、両ノードが同じSplineを参照している場合は元のTrackerで修正した結果がPlanar Transformにも反映されます。

21.1マニュアルによると、作成されたPlanar Transformは別のCompositionにコピーできます。結果を適用する段階でPlanar Trackerをノードツリーから外す構成も可能です。ただし再解析する可能性がある作業中は、Trackerを残しておくと修正しやすくなります。

## Inspectorの主な項目

### Reference Time

Planar Trackerで追跡対象のパターンを取得した**基準時刻**です。ロゴやマスクの位置合わせを行うときは、そのフレームを基準に確認します。Reference Timeは、追跡を何フレーム実行するかを設定する項目ではありません。

### Right-Click Here for Track Spline

Planar Trackerから共有されたTrack splineの接続欄です。21.1マニュアルは、透視変形のデータが**4×4行列**として記録されると説明しています。

[Spline Editor](../../learn/05-time/keyframes-spline-time)でTrackデータが存在するフレーム範囲を確認できます。素材が途中から追従しない場合、まず解析がそのフレームまで完了しているかを調べます。

SettingsタブにはTransform系ノードと共通する設定もありますが、ここではPlanar Transform固有の項目に絞ります。

## 制作例1：動く看板へ新しい文字を貼る

入力する素材は、動く看板のFootageと、透明背景の新しい文字画像です。狙う結果は、**文字が看板の遠近変化に沿って動く映像**です。

~~~text
看板のFootage → Planar Tracker（解析用）

文字画像 → Transform（基準フレームで位置合わせ）
         → Planar Transform（追跡結果を適用）
         → MergeのForeground ──┐
看板のFootage → MergeのBackground ┴→ MediaOut
~~~

1. Planar Trackerで看板の面を囲み、必要区間を解析します。
2. Create Planar Transformで追跡結果の適用用ノードを作ります。
3. 文字画像を[Transform](../transform/transform)で、基準フレームの看板上の位置・大きさに合わせます。
4. Transformの後にPlanar Transformを接続し、その出力をMergeのForegroundへ渡します。元映像はBackgroundに接続します。
5. ショットを通して文字が看板に沿うか、特に傾きが変わるフレームで確認します。

文字だけ差し替える場合は同じ追跡結果を再利用でき、デザインの配置と追跡データの修正を分けられます。**元の看板の文字を消す処理や、前を横切る人物を手前に合成する処理は別途必要**です。Planar Transformが自動で隠れた領域を復元するわけではありません。

## 制作例2：動く服のマスクを追従させる

ロトスコープは被写体の輪郭をマスクで囲んで映像処理の範囲を分ける作業です。平面追跡を利用すれば、マスク全体の動きを先に合わせ、細部だけを補正できます。

~~~text
服のFootage → Planar Tracker（解析用）

Polygon Mask → Planar Transform → 後段ノードのEffect Mask
服のFootage ───────────────────→ 後段ノードのImage Input
~~~

1. 服の柄や縫い目など、特徴が追いやすい面をPlanar Trackerで解析します。
2. Create Planar Transformを押して追跡データを取り出します。
3. 解析済みのフレームを1つ選び、[Polygon Mask](../masks/polygon-mask)をPlanar Transformの**オレンジのImage Input**へ接続します。
4. Planar TransformをViewerで見ながら、そのフレームでPolygonの輪郭を服に合わせます。
5. フレームを動かし、ずれたところだけPolygonの頂点を調整します。
6. できたマスクを、補正したい映像処理ノードのEffect Maskへ渡します。

1枚の平面として扱える動きなら効率化できますが、**しわ・伸縮・袖の折れ曲がり**まで完全には追えません。輪郭の手動修正が必要な場合があります。柔らかい面の内部変形を扱うなら、[Surface Tracker](./surface-tracker)も選択肢です。

## 他のノードとの違い

| ノード | 主な役割 |
| --- | --- |
| [Planar Tracker](./planar-tracker) | 元映像の平面の動きを解析する |
| **Planar Transform** | 解析済みの動きを別の画像・マスクへ適用する |
| [Transform](../transform/transform) | Center・Size・Angleなどを手動やキーフレームで設定する |
| [Tracker](./tracker) | 特徴点を追跡し、位置などの動きを取得する |
| [Surface Tracker](./surface-tracker) | 柔らかい面の内部変形を追跡する |

## うまくいかないとき

| 症状 | 確認すること |
| --- | --- |
| **途中から動かなくなる** | Spline Editorで必要なフレームにTrackキーがあるか確認する |
| **最初から位置がずれる** | Reference Timeと、画像やマスクを位置合わせしたフレームが対応しているか確認する |
| **角度が変わると滑る** | Planar Trackerの解析精度と、対象が平面として扱えるかを確認する |
| **Polygonが追従しない** | PolygonをオレンジのImage Inputへ接続しているか確認する |
| **出力が一部分しか見えない** | Planar Transform自身の青いEffect Maskに接続がないか確認する |
| **服の輪郭が合わない** | 平面として表せない曲げ・伸びを、Polygonの追加調整で補う |

追跡が不安定なときは、[トラッキング結果のずれ](../../troubleshooting/tracking/track-drifts)と[解析・適用を分ける考え方](../../patterns/tracking/solve-then-apply-track)を参照してください。

## バージョン・出典と確認範囲

**一次資料：** Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 120「Transform Nodes」、**pp.2871–2872**。Planar Transformの用途、2入力、Create Planar Transform、Polygonを入力するロトスコープ手順、Reference Time、Track splineの共有と4×4行列、Spline Editor、別Compositionへのコピーを確認しました。入手先：[Blackmagic Design Support](https://www.blackmagicdesign.com/support/)。

Planar Trackerの解析手順は同マニュアルChapter 119「Tracking Nodes」を前提とします。上記制作例は仕様に基づく構成例です。**実機での位置合わせ挙動、追跡エンジンの内部仕様、処理性能、Edition差は未検証**のため、verification: partialを維持します。
