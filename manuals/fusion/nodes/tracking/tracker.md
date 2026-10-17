---
title: Tracker
description: 2D Image内の特徴点の動きを解析し、Match MoveやStabilize、別Nodeの位置Controlへ使う基本Tracker。
doc_type: node
term_id: tracker
verification: partial
aliases: [Tracker, Point Tracker]
concepts: [tracking, parameter-data, coordinate-space]
nodes: [Tracker]
node_family: tracking
controls: [IntelliTrack, Point, Tracker List, Pattern Rectangle, Search Rectangle, Track Buttons, Frames Per Point, Adaptive, Path Center, Operation, Merge, Pivot Type, Reference Time, Filter Method, Edges]
inputs: [image, image, mask]
outputs: [image, tracking]
tasks: [track, point-track, match-move, stabilize]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-14"
---

# Tracker

Trackerは、2D <Term id="image">Image</Term>内の特徴点の動きを解析し、その結果をMatch Move、Stabilize、Corner Positioning、別Nodeの位置Controlなどへ使うNodeです。

Planar Trackerが面全体のperspective変化を扱うのに対し、Trackerは比較的小さく識別しやすいfeatureやpatternを基準にします。

## 入力

### Background

オレンジ色の入力です。解析対象の2D Imageを接続します。

### Foreground

緑色の任意入力です。Tracker自身でMatch MoveやCorner / Perspective Positioningを行う場合、Backgroundへ合わせるImageを接続します。

### Effect Mask

青色の任意入力です。解析対象の範囲を限定します。Foreground画像の透明部分を定義するAlphaとは別の役割です。

Trackerの画像出力は処理後の2D Imageです。これに加えて、追跡した座標などの値を別NodeのControlへ公開できます。後者を使うだけならTrackerの画像出力を別Nodeへ接続する必要はありません。

## IntelliTrackとPoint

DaVinci Resolve 21.1ではIntelliTrackが既定です。従来のPoint trackerもPoint buttonから選択できます。

Point trackerではViewerに2つの矩形が表示されます。

- **Pattern Rectangle** — 基準として比較するpixel pattern
- **Search Rectangle** — 次frameでpatternを探す範囲

速いmovementではSearch Rectangleを広げる必要がありますが、広げるほど計算量も増えます。

## Trackersタブと追跡手順

1. Backgroundへ映像を入力し、追跡したいフレームでTrackerをViewerに表示します。
2. IntelliTrackなら十字を高コントラストの特徴へ置きます。PointならPattern Rectangleへ追跡対象を収め、Search Rectangleをフレーム間移動より広く設定します。
3. Track Forward / Reverse、またはCurrent TimeからのForward / Reverseで追跡します。途中で失敗したらStop Trackingで止め、失敗区間をTrimしてやり直します。
4. 再生して追跡点が本来の対象を外れていないか確認し、必要な点を追加します。画像への適用はその後に決めます。

**Frames Per Point**は追跡パスのキーフレーム間隔で、既定の1では各フレームに記録します。値を大きくすると細かな動きを取りこぼす可能性があります。

**Adaptive**はPoint方式専用です。Noneは最初のPatternを使い続け、Every Frameは各フレームの模様へ更新し、Best MatchはMatch Toleranceを基準に不適切な模様への更新を抑制します。照明の緩やかな変化と、手前を通過する別の物体では適した設定が変わります。

**Path Center**は追跡点を途中で別の模様へ置き直す際の扱いです。Pattern Centerは新しい中心を使い、Track Center (append)は既存パスにつなぐためにオフセットを付けます。元の特徴が隠れた場合は後者が使えますが、奥行きが異なる場所へ移すと視差のずれが生じます。

**X and Y Offset**は、直接追いにくい位置の近くにある模様を追いながら、出力する位置を目的の場所へずらすためのControlです。

## 複数pattern

1つのTracker Node内へ複数patternを追加できます。

Tracker Listでは各patternを選択・renameし、Enabled / Suspended / Disabledを管理します。**Enabled**は再追跡とデータ利用が可能、**Suspended**は再追跡せず現在のデータを保持して利用可能、**Disabled**は追跡もデータ利用も対象外です。正確に追えた点だけSuspendedにしておけば、残りの点を再解析できます。

複数patternを使うと位置だけでなくrotationやscaleの変化も利用できます。Steady Angle / Steady Sizeには少なくとも2つのpatternが必要です。

## 結果の使い方

Trackerは解析結果をNode内部のMatch Moveへ使うだけでなく、別NodeのControlへ公開できます。

代表的な出力:

- **Offset Position** — 元のmotion path
- **Steady Position** — movementを打ち消すposition
- **Unsteady Position** — Stabilize後に元のmovementを戻すposition
- **Steady Angle / Size** — rotation / scale変化を打ち消す値

```text
Footage → Tracker
            └─ Offset Position → Transform Center
```

## Operation / Reference Time

Trackerの**Operation**は、解析した動きを画像へどう適用するかを決めます。

| Operation | 動作と用途 |
| --- | --- |
| **None** | 追跡だけ行い、別NodeのCenterなどへ値を渡すときに使います。 |
| **Match Move** | Foregroundを接続すると、その画像をBackgroundの動きへ追従させます。Foregroundがない場合はBackgroundのStabilizeに使えます。 |
| **Corner Positioning** | 4点の追跡位置に対応する四隅へForegroundを貼り込み、看板・画面を差し替えます。 |
| **Perspective Positioning** | 4点の対応を逆方向へ使い、斜めに撮られた平面の遠近を整えます。 |

Match Moveで位置を求めるには最低1点、回転と拡大縮小も推定するには2点以上の追跡が必要です。Corner / Perspective Positioningは4点を使い、不足する場合はTrackerが点を追加するため、対象の四隅へ配置し直します。

OperationがNone以外の場合は**Merge**設定が表示されます。BG OnlyはForegroundを使わずBackgroundの結果のみを出すため安定化向け、FG Onlyは変形されたForegroundだけを出す設定です。FG Over BGは動きを合わせたForegroundを背景に重ね、BG Over FGは背景を手前へ重ねます。合成のApply Mode / OperatorはMerge Nodeと同種の設定です。

**Pivot Type**では回転の支点をTracker Average（点の平均）、Selected Tracker（指定点）、Manual（手動XY）から選びます。追跡位置は正しいのに回転の中心だけが不自然なら、支点を確認します。

**Reference Time**は動きをそろえる基準です。Select Time、Start、End、Custom Timeは特定フレームを基準にします。Start and Endは始点・終点を結ぶ動きを基準にし、完全固定ではなく動きを滑らかに残したい場合に使います。Custom TimeはSetでフレームを指定できます。

Match Move時の**Position / Rotation / Scaling**は補正する成分を選択します。**Filter Method**は変形時の画素補間方式で、Linearは比較的軽量、Lanczosなどは細部の保持を試す候補ですが、Sinc等は輪郭にリンギングが出る場合もあります。素材の解像度と結果を見て選びます。

安定化によって露出した画面端は**Edges**で処理します。Black Edgesは黒、Wrapは反対側の画素、Duplicateは端の画素を延長、Mirrorは鏡像です。どれも撮影されていない画面外の情報を復元するものではありません。

Corner Positioningの**Mapping Type**はBi_LinearとPerspectiveです。遠近を考慮して平面へ貼り込む場合はPerspectiveを選び、四隅と元画像の対応が正しいか確認します。

## 最小構成

```text
Footage → Tracker

Graphic → Transform → Merge
             ↑
       Tracker Offset Position
```

解析するbranchと、graphicへ適用するbranchを分けると、解析結果のずれとgraphic側のoffsetを別々に確認できます。

## 制作例

### 車の動きへ矢印を追従させる

走る車の映像をTrackerのBackgroundへつなぎ、ドアノブなど識別できる特徴点を追います。矢印の画像は別branchのTransformへ接続し、TransformのCenterを右クリックして**Connect To → Tracker内の追跡点のOffset Position**へ接続します。矢印をドアの少し上へ置きたい場合は、別のTransformで配置用のオフセットを設定すると、追跡パスとデザインの位置調整を独立させられます。Trackerの画像出力を合成へつなぐ必要はありません。

### 手持ち映像を安定化する

カメラが手で揺れている映像をBackgroundへ入力し、動かない建物などの特徴点を追います。ForegroundをつながずOperationをMatch Moveにし、MergeはBG Onlyを使います。位置だけ補正するならPositionを使い、複数点を追った場合はRotation / Scalingを必要に応じて加えます。Reference Timeで基準を決めた後、画面端の欠けをEdgesやCrop / Scaleで確認します。パンを保ちたい場合はStart and Endも比較します。

### 動く看板の画像を差し替える

看板の撮影映像をBackgroundへ、差し替えるポスターをForegroundへ接続します。看板の四隅を追い、OperationをCorner PositioningにしてMapping TypeをPerspectiveにします。4点とポスターの角の対応を確認してFG Over BGで合成すると、遠近の変化に沿って新しいポスターが動きます。面の一部分をまとめて追う方が適するなら[Planar Tracker](./planar-tracker)を選びます。

### 追跡点が隠れた後で別の模様へつなぐ

シャツのマークが腕に隠れて途中から追えなくなった場合、正確な区間を残し、再開位置で新しい模様へ追跡点を移します。PointのPath CenterをTrack Center (append)にして続きを追い、境界で位置が跳ばないか確認します。別の奥行きにある模様へ移すと視差の誤差が出るため、近い場所を優先します。

## Tracker Modifier

Center等のControlへTracker Modifierを直接付ける方法もあります。

Modifierは1 patternだけを扱う簡易用途向けで、複数patternを使うMatch MoveやStabilizeではTracker Nodeの方が適しています。

## 追跡がずれる場合

| 症状 | 確認するもの |
| --- | --- |
| 途中で別の模様へ乗り移る | 選んだ特徴点の識別しやすさ、PointのAdaptive、遮蔽物 |
| 速い移動で失敗する | PointのSearch Rectangleがフレーム間の移動を含むか |
| 追跡点は合うのにロゴが動かない | Tracker ListのEnabled / Suspended、Connect Toの接続先、Operation |
| 回転やScaleだけ合わない | 点数と配置、Pivot、Position / Rotation / Scaling |
| 安定化で画面端が黒くなる | Edgesと必要なCrop / Scale |
| 合成だけ位置がずれる | Foreground側の元位置、Reference Time、追加TransformのOffset |

## Planar Trackerとの違い

- **Tracker** — point / small featureのmotion
- **Planar Tracker** — 平面領域のperspective distortion
- **Camera Tracker** — 多数featureから3D camera motionを復元

## 関連する考え方

- [Trackを解いてから適用先を分ける](../../patterns/tracking/solve-then-apply-track)
- [Center / Pivot / Size / Angle](../../learn/03-space/center-pivot-size-angle)

## 関連Node

- [Surface Tracker](./surface-tracker)
- [Planar Tracker](./planar-tracker)
- [Planar Transform](./planar-transform)
- [Camera Tracker](./camera-tracker)
- [Transform](../transform/transform)

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual（September 2026）、Chapter 119 pp.2839–2857とFusion Fundamentals Chapter 81で、3入力、IntelliTrack既定、Point tracker、Pattern / Search Rectangle、Tracker Listの状態、Adaptive、Path Center、公開Control、4種類のOperation、Merge、Reference Time、Filter Method、Edgesを確認しました。制作例は各Controlの公式説明を踏まえた応用です。

tracking algorithmの内部仕様、全Controlの数値範囲、実機精度・性能は未確認のため `verification: partial` としています。
