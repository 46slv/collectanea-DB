---
title: Planar TrackerとTime Stretcherで1フレームの補修を追従させる
description: 動く人物の額の小さな傷を静止フレームで修正し、マスクを平面追跡して元映像へ重ねる手順。
doc_type: recipe
verification: partial
aliases: [planar clean plate, freeze frame patch, time stretcher]
concepts: [tracking, mask-data, alpha]
patterns: [solve-then-apply-track]
nodes: [Planar Tracker, Planar Transform, Time Stretcher, Paint, Polygon, Matte Control, Merge]
tasks: [clean-plate, paint, track]
level: intermediate
product_scope: fusion
updated: "2026-10-22"
---

# Planar TrackerとTime Stretcherで1フレームの補修を追従させる

## 作るもの

顔が動く映像で、額に写った小さな傷や撮影マーカーを隠します。きれいな額を**1フレームだけPaintで作り、その部分を切り出して元映像へ重ねる**構成です。切り出すマスクには平面追跡を適用します。

毎フレームCloneで直すと筆跡が揺れて見えることがあります。静止した修正画像なら見た目を一定に保ちやすくなります。ただし、**追従するのはマスクの輪郭で、固定画像の肌の模様そのものを変形させるわけではありません。** 大きな遠近変化や照明変化を含むショットには向かない場合があります。

## 必要な素材・ノード

額など、追跡できる模様が見える映像を用意します。**Planar Tracker**で動きを解析し、**Time Stretcher**で補修元を固定、**Paint**でClone補修します。**Polygon**で残す場所を描き、**Planar Transform**でそのマスクを動かします。**Matte Control**で領域を切り出し、**Merge**で元映像に重ねます。

## 接続

~~~text
【追跡用】
MediaIn → Planar Tracker（Track）
                     └─ Create Planar Transform（追跡データから別ノードを生成）

【補修と合成】
MediaIn → Time Stretcher（固定フレーム）
        → Paint（Clone） → Matte Control（Background） → Merge（Foreground） ┐
                                 ↑                                         ├→ MediaOut
Polygon → Planar Transform → Garbage Matte                                │
MediaIn ───────────────────────────────→ Merge（Background） ───────────────┘
~~~

Planar TrackerとPlanar Transformは**画像ケーブルで直結しません**。「Create Planar Transform」でTrackの結果を持つノードを作り、Polygonマスクを入力します。Matte Controlへ渡すのは補修済みの2D画像と、追跡で動くマスクの2系統です。

## 手順

### 1. 修正に使うフレームを選んで追跡

1. 傷の周囲が隠れず、額が比較的正面に見えるフレームを選び、フレーム番号を控えます。
2. 元映像をPlanar Trackerへ接続し、**Operation Mode：Track**を選びます。選んだフレームで**Reference Time：Set**を実行します。
3. **Pattern Polygon**で、傷だけでなく追跡の手掛かりになる模様を含む領域を囲みます。**Tracker**はまずPointを試し、必要な区間を前後へ追跡します。遠近変化には適した**Motion Type**を選びます。
4. **Steady**へ一時的に切り替え、模様が大きく滑らないか再生して確認します。その後**Track**へ戻します。

Reference Timeを設定し直すと、既存の追跡情報が失われます。

### 2. Time Stretcherで同じ画像を読み続ける

1. MediaInから別の枝を作り、Time Stretcherのオレンジの画像入力へ接続します。
2. **Source Time**の初期キーフレームを無効にし、先ほど選んだフレーム番号を一定値として入力します。
3. 再生位置を動かしても出力が同じ画像か確認します。整数フレームを固定するだけなら**Interpolate Mode：Nearest**で十分です。

Time Stretcherは画像を安定化するのではなく、出力時刻ごとに「元映像のどのフレームを読むか」を指定します。

### 3. 静止した補修画像を作る

Time Stretcherの出力をPaintへ接続します。**Stroke**の**Apply Mode：Clone**を選び、Alt / Option＋クリックで周囲のきれいな画素を参照して傷を隠します。修正後に肌の明るさと模様のつながりを確認します。

### 4. 補修範囲を切り出して追従させる

1. Paintを**Matte ControlのBackground**へ接続します。
2. 基準フレームでPolygonを描き、補修した額の部分だけを囲みます。境界が硬ければPolygonの**Soft Edge**を少し調整します。
3. Planar TrackerをTrackモードにし、**Create Planar Transform**を押します。
4. **Polygon → Planar Transform → Matte ControlのGarbage Matte**の順につなぎます。
5. Garbage Matteは通常、指定領域を透明にするため、この例では**Matte Control ＞ Garbage Matte ＞ Invert**を有効にします。補修した部分だけが不透明で、周りが透明になったかViewerで確認します。

この操作で動くのはPolygonのマスクです。静止した補修画像の画素を遠近変形させているわけではありません。

### 5. 元映像へ合成

Mergeの**Background（黄）**にMediaIn、**Foreground（緑）**にMatte Controlを接続してMediaOutへ送ります。最初・中間・最後のフレームを確認し、補修領域が傷を覆い、境界に不自然なずれがないか調べます。

Planar Trackerの画像出力はMergeへ渡す必要がありません。追跡を再調整する可能性があるなら解析用の枝を残しておきます。

## なぜこの構成で動くか

Paintで修正したフレームはTime Stretcherで固定されています。一方、Planar Transformは追跡データでPolygonの位置と形を変え、Matte Controlがその領域だけを残します。Mergeは動く元映像の上に修正済みの静止画像の一部を置きます。修正領域が小さく、被写体の形や照明が大きく変わらない場合に使いやすい方法です。

## 別の方法

補修画像の模様ごと動きに合わせて変形したい場合は、[Planar Trackerで固定・Paint・逆変形する方法](./planar-steady-paint-rewarp)を検討します。そちらはSteadyとInvert Steady Transformを使って画像を往復変形するため、再サンプリングによる画質変化にも注意します。看板へロゴを貼る用途なら[Planar Transformでグラフィックを追従させる方法](./planar-track-graphic)が直接的です。

## うまくいかないとき

| 症状 | 確認 |
| --- | --- |
| 固定したはずのフレームが変わる | Source Timeのキーフレームが残っていないか、フレーム番号が正しいか。 |
| 補修画像が全画面を覆う | Matte ControlのGarbage Matte、Invert、出力Alphaを確認する。 |
| 補修範囲が傷から外れる | Trackの精度、Reference Time、PolygonからPlanar Transformへの接続を確認する。 |
| 輪郭は追従するが中の模様がずれる | 固定画像は変形していない。動きが大きいなら別の補修構成を使う。 |
| 境界だけ浮く | PolygonのSoft Edge、Clone元、固定フレームの照明を調整する。 |
| 髪や手が補修部分の前を通る | 別の前景マスクとMergeで遮蔽物を手前に戻す。 |

## 関連資料

- [Planar Tracker](../../nodes/tracking/planar-tracker)
- [Planar Transform](../../nodes/tracking/planar-transform)
- [Time Stretcher](../../nodes/time-metadata/time-stretcher)
- [Paint](../../nodes/paint/paint)
- [Polygon Mask](../../nodes/masks/polygon-mask)
- [Matte Control](../../nodes/matte-keying/matte-control)
- [Merge](../../nodes/compositing/merge)
- [追跡と適用を分ける](../../patterns/tracking/solve-then-apply-track)

## バージョン・出典・確認範囲

**一次資料：** Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 80「Paint」**pp.1768–1772**（Clean Plate、Time Stretcher、Matte ControlのGarbage Matte／Invert、PolygonへPlanar Transformを挿入する手順）、Chapter 111「Miscellaneous Nodes」**pp.2610–2611**（Source Time）、Chapter 119「Tracking Nodes」**pp.2823–2825**（Planar Tracker、Create Planar Transform）。

マニュアルに記載された接続と手順を基に構成しています。**21.1実機での映像結果、内部ポートID、Free / Studio差は未検証**のため、`verification: partial`です。
