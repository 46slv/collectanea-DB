---
title: Planar Tracker
description: 平面領域のtranslation・rotation・scale・perspective変化を解析し、Planar Transform、Corner Pin、Steady、Stabilizeへ使うTracker。
doc_type: node
term_id: planar-tracker
verification: partial
aliases: [Planar Tracker, PTRA]
concepts: [tracking, coordinate-space, parameter-data]
nodes: [Planar Tracker]
node_family: tracking
controls: [Operation Mode, Reference Time, Tracker, Motion Type, Track Channel, Output, Tracking Controls, Create Planar Transform, Steady Time, Invert Steady Transform, Clipping Mode]
inputs: [image, image, mask, mask]
outputs: [image, tracking]
tasks: [track, planar-track, screen-replace, stabilize]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# Planar Tracker

Planar Trackerは、看板・壁・画面など、平面として扱える領域の動きとperspective変化を解析するNodeです。

1点の位置だけでなく、面の傾きやscale変化までまとめて追えるため、screen replacementやsign replacement、planar rotoで使います。

## 入力

### Background

オレンジ色の入力です。平面領域を含む2D Imageを接続します。

### Corner Pin

緑色の入力です。Corner Pin modeで、解析した平面へ貼り付けるImageを接続します。複数のCorner Pin入力を持てます。

### Occlusion Mask

白色の任意入力です。

Maskが白い領域を解析対象から除外します。tracked planeの手前を別objectが横切る場合など、誤ったfeatureを計算へ含めたくないときに使います。

### Effect Mask

青色の任意入力です。Planar Trackerの最終outputを適用する範囲を制限します。

Occlusion Maskはanalysis対象を除外するMask、Effect MaskはNode出力を制限するMaskなので役割が異なります。

## 基本workflow

21.1 Manualの基本手順は次の流れです。

1. lens distortionが大きい場合は先に補正する。
2. Backgroundへfootageを接続する。
3. planeが大きく見え、occlusionが少ないframeをReferenceにする。
4. Viewerで追うplaneをclosed polygonとして囲む。
5. 必要ならOcclusion Maskを接続する。
6. render rangeとTracker / Motion Type / Track Channelを確認する。
7. Reference frameから前後へ解析する。
8. Steady mode等で結果がplaneへ固定されて見えるか確認する。
9. 多くの用途ではCreate Planar Transformで適用用Nodeを作る。

## Operation Mode

Planar Trackerは4つのOperation Modeを持ちます。

### Track

planeを解析する基本modeです。

Track後にCreate Planar Transformを使い、別ImageやMaskへ同じperspective movementを適用できます。

### Steady

解析したplaneが動かないようにBackgroundを変形します。

paintやrotoを静止状態で行う前処理や、track qualityの確認に使えます。trackが正確なら、Steady中は対象planeがほぼ動かず、周囲のImageが変形して見えます。

### Corner Pin

解析したplaneへForeground Imageを直接貼り付けます。

Corner Pin modeへ切り替え、緑入力へtexture / graphicを接続してViewerの4cornerを合わせます。

### Stabilize

translation・rotation・scaleの不要な揺れをsmoothにします。

planeを完全停止させるSteadyとは目的が異なり、意図したcamera movementを残しつつ細かな振動を抑える用途です。

## Motion Type

どの種類の変形まで解析するかを決めます。

shotにperspective変化があるのに単純なmotion modelへ制限すると、slideやwobbleが出ることがあります。一方、小さなregionやtrackable featureが少ないshotでは単純なmodelの方が安定する場合もあります。

## Track Channel

Red / Green / Blue / Luminanceから解析するchannelを選びます。

高contrastでfeatureが多く、noiseの少ないchannelを選びます。OutputをBackground - Preprocessedへすると、tracking前処理後のImageを確認できます。

## Create Planar Transform

Track後にこのbuttonを押すと、現在のtrack dataを使うPlanar Transform Nodeが作られます。

full-frame Imageを直接Corner Pinする場合を除き、graphicやMaskへtrackを再利用する用途ではPlanar Transformへ分ける構成が扱いやすくなります。

## 保存時の注意

21.1 Manualでは、Planar Trackerは最終trackはcompositionへ保存しますが、解析途中の個別point trackerなど一時dataは保存しません。

保存・再読込後は途中からtrackingを再開できない場合があるため、1つのplanar analysisは可能なら同じsession内で完了させます。

## 最小構成

```text
Footage → Planar Tracker
               ↓ Create Planar Transform

Graphic → Planar Transform → Merge
```

## 運用例

看板へ別graphicを貼る場合:

1. 看板面をReference frameで囲みます。
2. Track modeで前後へ解析します。
3. Steady modeでdriftを確認します。
4. Create Planar Transformを作ります。
5. GraphicへPlanar Transformを適用してMergeします。
6. Graphic固有の位置調整はtrack dataと分けて行います。

## Trackerとの違い

- **Tracker** — point / small featureのmotion
- **Planar Tracker** — plane全体のperspective movement
- **Camera Tracker** — 3D camera motionとpoint cloudを復元

## 関連する考え方

- [Trackを解いてから適用先を分ける](../../patterns/tracking/solve-then-apply-track)
- [トラッキング結果がずれる / driftする](../../troubleshooting/tracking/track-drifts)

## 関連Node

- [Planar Transform](./planar-transform)
- [Tracker](./tracker)
- [Camera Tracker](./camera-tracker)

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 119 pp.2819–2828とFusion Fundamentals Chapter 82で、4入力、basic workflow、4 Operation Mode、Track Channel、Create Planar Transform、Steady / Corner Pin、保存されるtracking dataの範囲を確認しました。

全Motion Typeの数式、各tracker engineの内部仕様、実機精度・速度は未確認のため `verification: partial` としています。
