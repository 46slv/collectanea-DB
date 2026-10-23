---
title: Trackerで動く被写体にテキストを追従させる
description: FusionのTrackerで特徴点を追い、Connect ToでText+の位置を連動させて映像へ合成する。
doc_type: recipe
verification: partial
aliases: [point tracker text callout, tracking label]
concepts: [tracking, parameter-data, image-data, coordinate-space]
nodes: [Tracker, Text+, Transform, Merge]
tasks: [point-track, attach-graphics, title]
prerequisites: [image-data, parameter-data]
level: intermediate
product_scope: fusion
updated: "2026-10-21"
---

# Trackerで動く被写体にテキストを追従させる

## 完成するもの

走行する車のドアノブを追跡し、少し上に「DOOR HANDLE」という説明ラベルを表示します。車が画面内を移動すると文字も追従します。

この構成で追うのは**1点の位置**です。車が回転した場合の文字の向きや、遠近に応じた文字の拡大縮小までは自動で行いません。

## 画像の配線と位置データの参照

~~~text
［追跡データを作る］
車の映像 → Tracker（Background・橙、Operation：None）
              └ Tracker 1 Offset position
                       ⋮ Connect To
                       ↓
［文字を画像へ合成する］
Text+ → Transform_追従 → Transform_配置 → Merge（Foreground・緑）┐
車の映像 ─────────────────────→ Merge（Background・黄）┴→ MediaOut
~~~

Trackerの追跡位置は**画像出力のケーブルではなくConnect Toで渡すパラメーター**です。Trackerの画像出力はMergeへつながなくてもかまいません。Text+は文字の2D画像を作り、Mergeはそれを元映像に重ねます。

二つのTransformの役割は異なります。**Transform_追従**はTrackerの位置を受け取り、**Transform_配置**は文字をドアノブから少し離す固定オフセットを持ちます。

## 操作手順

### 1. Trackerで特徴点を追う

1. 車の映像をMediaInから枝分かれさせ、Trackerの**Background（橙）**へ接続します。
2. Trackerの**OperationをNone**にします。追跡だけ行い、Tracker自身では画像を安定化・合成しません。
3. Viewerでドアノブなど輪郭が明瞭な模様へ追跡点を置き、必要な区間を前後へTrackします。
4. 区間の最初・中間・最後で、追跡点が同じ模様に残っているか確認します。

Resolve 21.1では**IntelliTrackが既定**です。従来の**Point**方式を選ぶ場合は、追う模様を囲む**Pattern Rectangle**と次フレームで探す**Search Rectangle**を調整します。IntelliTrackにも同じ矩形操作があるとは説明しません。

### 2. Text+を合成する

Text+で「DOOR HANDLE」と入力し、Font、Sizeなどを調整します。Text+の出力を**Transform_追従 → Transform_配置**へ順に渡し、Mergeの**Foreground（緑）**へ接続します。元の車映像はMergeの**Background（黄）**へ直接接続します。

ここで一度MergeをViewerに表示し、文字が重なっていることを確認します。文字自体が見えない場合は追跡の設定ではなく、Text+とMergeの接続を確認します。[Text+をImageへ重ねる](../text-graphics/text-over-image)も参照してください。

### 3. Centerを追跡値に接続する

1. **Transform_追従**を選び、Inspectorの**Center**を右クリックして**Connect To**を開きます。
2. Trackerの追跡点の**Offset position**へ接続します。21.1マニュアルの公開値一覧では**Position1 = Tracker 1 Offset position**です。複数点を使う場合は番号を確認します。
3. 車が動く複数フレームを再生し、文字が同じ方向へ動くか確認します。

これはTrackerの画像出力をTransformへ接続する操作ではありません。Centerの位置データが追跡値を参照する設定です。追従用Centerへ別のキーを重ねず、見た目の位置調整を後段のTransformへ分離します。

### 4. ラベルを対象から離す

**Transform_配置**のCenterを調整して、文字をドアノブの上や横へ移します。たとえば1920×1080の画像で縦54px分の差は、正規化座標で**54 / 1080 = 0.05**です。上下の増減方向はViewerで確認します。

複数フレームで、ドアノブと文字の距離を確認します。追跡点の動きが正しく、位置がいつも一定量ずれているなら、Trackerではなく**Transform_配置**を直します。

## 問題の切り分け

| 症状 | 確認すること |
| --- | --- |
| 文字が動かない | Transform_追従のCenterのConnect Toと、参照する点の番号。 |
| 動くほど文字が滑る | まずTracker単体の追跡点が対象を外れていないか。 |
| いつも同じ距離だけずれる | Transform_配置の固定オフセット。 |
| 遮蔽後に位置が跳ぶ | 追跡点が別の模様へ移った区間や追跡データの欠落。 |
| 回転・遠近が合わない | 1点の位置追従の範囲外。複数点か[Planar Tracker](../../nodes/tracking/planar-tracker)を検討する。 |
| 文字が見えない | Text+、二つのTransform、MergeのForegroundとBackground。 |

従来のPoint方式では、特徴が隠れた後に**Path Center → Track Center (append)**で別の近い模様へ追跡をつなぐ方法があります。ただし奥行きが違う点を選ぶと視差でずれます。この操作をIntelliTrackと共通とは断定しません。

## 関連資料

- [Tracker](../../nodes/tracking/tracker)：入力、IntelliTrackとPoint、追跡値の公開。
- [Transform](../../nodes/transform/transform)：Centerと正規化座標。
- [追跡を解析してから適用先を分ける](../../patterns/tracking/solve-then-apply-track)：画像とパラメーターの違い。
- [追跡がずれるとき](../../troubleshooting/tracking/track-drifts)：追跡精度と合成配置の切り分け。

## バージョン・出典・確認範囲

一次資料：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 119「Tracking Nodes」pp.2839–2841（入力、Connect To、IntelliTrack／Point）、p.2845（PointのPath Center）、pp.2848–2849（Operation／None）、pp.2854–2855（Position1等の公開値）。[公式サポート](https://www.blackmagicdesign.com/jp/support/)。

本例は公式機能の組み合わせによる応用手順です。**21.1実機でのConnect Toメニューの並び、個別素材の追跡精度、Free／Studio差は未検証**のため、verificationはpartialです。