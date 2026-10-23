---
title: Planar Trackerで面を固定してPaintし、元の動きへ戻す
description: カメラが動く映像の壁を平面追跡で一度固定し、Paintで汚れを消してから、逆変形で元の動きへ戻す。
doc_type: recipe
verification: partial
aliases: [planar steady paint, invert steady transform, planar cleanup]
concepts: [tracking, image-data, coordinate-space]
nodes: [Planar Tracker, Paint, Background, Merge]
tasks: [track, cleanup, paint]
prerequisites: [image-data]
level: intermediate
product_scope: fusion
updated: "2026-10-22"
---

# Planar Trackerで面を固定してPaintし、元の動きへ戻す

## 完成するもの

カメラが横へ移動する映像で、壁の小さな汚れを周囲の模様で隠します。壁は画面内を動き、斜めから撮られると遠近も変化します。それでも補修跡が壁の同じ場所に残る映像を作ります。

平面を追う[Planar Tracker](../../nodes/tracking/planar-tracker)で映像を一時的に変形し、**壁だけがほぼ止まって見える状態でPaint**します。最後に、その変形を逆向きに適用して元のカメラの動きへ戻します。ここでの「固定」は壁面を基準にした**Steady**であり、手ぶれを滑らかにする**Stabilize**ではありません。

## ノードの接続

~~~text
【壁の動きを記録し、固定する】
元映像 → PlanarTracker_A（Track後にSteady、Clipping Mode：Domain）
                            │
                            └────────────→ Merge（Background・黄）──────────┐
                                                                          │
【透明な補修レイヤー】                                                      │
Background（Alpha 0、同じ解像度）→ Paint（Stroke / Clone）→ Merge（Foreground・緑）
                                        ↑                                 │
                      Source Tool：PlanarTracker_A                        │
                                                                          ↓
                           Merge出力 → PlanarTracker_B（Aの複製）
                                      Steady + Invert Steady Transform
                                            → MediaOut
~~~

**実線の接続は2D画像**です。Paintの**Source Tool**はクローン元画像をInspectorで指定する欄で、MergeのForegroundへ流れる画像ケーブルとは別です。

- **A**は元映像を受け取り、追跡データに従って壁の面を固定した画像を出します。
- **Background → Paint**は透明な画像に修正ストロークだけを描く枝です。Source ToolにはAの固定済み画像を指定します。透明なBackground自体には複製できる壁の画素がありません。
- **Merge**は修正ストロークを固定済み映像へ重ねます。
- **B**はAと同じ追跡データを持つ複製です。Invert Steady Transformで固定用の変形を打ち消し、修正後の画像を元の動きへ戻します。

## 手順

### 1. 壁を平面追跡する

1. 元映像をAの**Background**へ接続し、**Operation Mode：Track**を選びます。
2. 壁が大きく、できるだけ正面に近く、遮蔽物の少ないフレームで**Reference Time**をSetします。壁の模様を含む領域を**Pattern Polygon**で囲みます。
3. **Tracker**はまずPoint、**Motion Type**は実際の遠近変化に応じてPerspectiveなどを選びます。必要な区間を前後へTrackします。
4. Aを**Steady**へ切り替え、**Steady Time**を通常はReference Timeに合わせます。再生中、壁の同じ模様がほぼ止まるか確認します。壁が滑るならPaintへ進む前に追跡を直します。

Reference Timeを設定し直すと、それまでのPlanar追跡データは失われます。追跡が済んだ後に補修位置を合わせる目的で変更しないでください。

### 2. 画面外の情報を残す

AのSteady設定で**Clipping Mode：Domain**を選びます。面を固定すると映像の一部はフレームの外側へ移動しますが、Domainではその画素を保持し、後段の逆変形で使えるようにします。**Frame**では外へ出た部分が捨てられるため、元へ戻したときに欠ける場合があります。

### 3. 透明レイヤーへ補修を描く

1. Aの出力をMergeの**Background（黄）**へ接続します。
2. 元映像と同じサイズの**Background**を作り、**Alphaを0**にします。その出力へ**Paint**をつなぎ、PaintをMergeの**Foreground（緑）**へ接続します。
3. PaintのInspectorの**Source Tool**へAを指定します。これでクローン元は固定済みの壁の画像になります。
4. Paintの**Stroke**ツールを選び、Apply Controlsを**Clone**にします。汚れの近くにある似た模様をAlt / Optionクリックで参照し、小さなストロークで汚れを覆います。
5. 再生して、汚れに対するストローク位置が保たれるか、明るさや模様のつながりが不自然にならないか確認します。

透明な画像へ描くため、MergeのForegroundは元映像全体を置き換えません。**Paintを直接Aの直後へ置く構成も可能**ですが、透明レイヤーへ分けると補修部分を独立して確認・調整しやすくなります。

### 4. 同じ追跡データで逆変形する

1. Aを**追跡データごと複製**してBを作ります。新しい空のPlanar Trackerを置いただけでは、AのTrack splineは引き継がれません。
2. BをMergeの後段へ接続し、**Steady**の**Invert Steady Transform**を有効にします。BのSteady Timeと追跡データがAに対応していることを確認します。
3. Bの出力をMediaOutへつなぎます。補修した壁が撮影時の動きへ戻り、汚れを隠すストロークは壁に付いて動くはずです。

AとBの間の画像だけをPaintで修正するのがポイントです。Bを独立に追跡し直したり、別のReference Timeにしたりすると、逆変形が一致しません。

## うまくいかない場合

| 症状 | 確認する場所 |
| --- | --- |
| Steady中でも壁の模様が滑る | AのPattern、Motion Type、遮蔽物、レンズ歪み、追跡済み区間。 |
| Paintで周囲の壁を複製できない | Source ToolがAか。透明Backgroundをそのまま参照していないか。 |
| 逆変形後に壁の端が欠ける | AのClipping ModeがDomainか。逆変形前に画像を切り落としていないか。 |
| 画面が元の動きに戻らない | BがAの複製か。Invert Steady Transform、Steady Time、接続順が正しいか。 |
| 補修がフレームごとにちらつく | 追跡の残差、Clone元の照明変化、Strokeの表示期間を確認する。 |
| 動く人が壁の前に来ると補修が前景へはみ出す | 追跡除外用マスクと完成画像の前景合成は別。必要なら人物を別のマスク・Mergeで手前へ戻す。 |

**Steady → 逆Steadyは画像を2回再サンプリングする**ため、細部が多少軟らかくなることがあります。単に看板へロゴを貼るだけなら、[Planar Transformを使う方法](./planar-track-graphic)の方が直接的です。補修ストロークがフレームごとに揺れて見える場合は、マニュアルが示す**1枚の修正済みフレームを固定して貼り戻すClean Plate方式**も候補になります。ただし、このRecipeの手順とは別の構成です。

伸び縮みする布や肌は1枚の平面としては追いきれない場合があります。その場合は[Surface Trackerで固定・修正・再変形する方法](./surface-track-stabilize-rewarp-skin-fix)を検討します。

## 関連資料

- [Planar Tracker](../../nodes/tracking/planar-tracker)：Track / Steady / Stabilizeの違い、Clipping Mode、Invert Steady Transform。
- [Paint](../../nodes/paint/)：Stroke、Clone、Source Tool、透明レイヤー。
- [平面追跡で看板にロゴを貼る](./planar-track-graphic)：逆変形を使わない適用方法。
- [トラッキング結果がずれる](../../troubleshooting/tracking/track-drifts)：追跡自体のずれと適用結果のずれ。

## バージョン・出典・確認範囲

**一次資料：** Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Fusion Page Effects Chapter 119「Tracking Nodes」pp.2823–2826（Reference Time、Track、Steady Time、Invert Steady Transform、Domain / Frame）、Fusion Fundamentals Chapter 80「Paint」pp.1763–1768（Steady → 透明Background / Paint / Merge → 複製Planar Trackerによる逆変形、Source Tool、Clone、Clean Plate）。

接続構成と主要設定は上記の21.1マニュアルに記載された方法を基にしています。**21.1実機での特定映像の仕上がり、Free / Studio差、Cloneの画素品質は未検証**のため、`verification: partial`です。
