---
title: Tween
description: 前後2枚の非連続Imageを内部Optical Flowで比較し、その間に位置する新しいframeを補間生成するNode。
doc_type: node
term_id: tween
term_short: "Tweenは、前後2枚のImageから中間frameをOptical Flowで生成するNode。"
verification: partial
aliases: [Tween, Tw]
concepts: [image-data, motion-vectors, mask]
nodes: [Tween]
node_family: optical-flow
controls: [Method, Interpolation Parameter, Depth Ordering, Clamp Edges, Edge Softness, Prev Forward, Next Forward, Prev Backward, Next Backward]
inputs: [image, image, mask]
outputs: [image]
tasks: [analyze-motion]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-05"
---

# Tween

Tweenは、前後2枚のImageを比較してmotionを推定し、その間にある新しいframeを生成するNodeです。

連続clip全体を入力するTime Speed / Time Stretcherと違い、2枚の非連続Imageを直接入力して中間Imageを作ることが中心です。

## 役割

```text
Previous Image ─┐
                ├→ Tween → interpolated Image
Next Image ─────┘
        Mask ───↑
```

Tween自身がOptical Flow解析を行うため、前段にOptical Flow Nodeは不要です。

## 入力

### Input 0

オレンジ色の入力です。生成したいframeより前のImageを接続します。

### Input 1

緑色の入力です。生成したいframeより後のImageを接続します。

### Effect Mask

青色のMask入力です。補間を適用する範囲を限定します。

## 出力

2枚の入力から補間した2D Imageを出力します。

Tweenが内部生成したmotion vectorは結果へ保持されません。またManualではinputに含まれていたaux channelも処理後に破棄すると説明されています。

## 主な設定項目

### Interpolation Parameter

Input 0とInput 1の間のどこを生成するか指定します。

- 0.0 — Input 0
- 0.5 — 2枚のちょうど中間
- 1.0 — Input 1

frame 01と03からframe 02相当を作る場合、0.5が基本の確認値になります。

### Depth Ordering

移動量の大きい領域と小さい領域が重なる場合、どちらを手前として合成するか選びます。Fastest On TopとSlowest On Topをshotのmotion関係に応じて使い分けます。

### Clamp Edges / Edge Softness

補間でframe端に透明gapが出る場合、Clamp Edgesでedgeを伸ばして埋められます。stretch artifactが出るため必要な場合だけ使い、Edge Softnessで境界を調整します。

### Source Frame and Warp Direction

Previous / Next frameとForward / Backward vectorの組み合わせを選びます。複数methodを有効にすると、その結果をblendして中間frameを作ります。

## 主な用途

- 前後2 frameから欠けた中間frameを作る
- 連番から1枚だけ不足したframeを再構築する
- 非連続な2枚のImageから途中のmotion状態を作る
- 局所的なframe補間を行う

## 最小構成

```text
Frame 01 ─→ Input 0
                     Tween → Frame 02相当
Frame 03 ─→ Input 1
```

Interpolation Parameter = 0.5から確認します。

## 運用例

欠落した1 frameを前後frameから補う場合:

1. 欠落frameの直前ImageをInput 0へ接続します。
2. 直後ImageをInput 1へ接続します。
3. Interpolation Parameterを0.5にします。
4. objectの重なりがおかしい場合はDepth Orderingを切り替えます。
5. 局所的な範囲だけを処理したい場合はEffect Maskを追加します。

## 挙動と注意点

- Optical Flowは色のmatchingを使うため、2枚の色や露出が大きく違う場合は事前のcolor correctionが候補になります。
- noiseが強いImageでは事前denoiseが助けになる場合があります。
- Tweenは内部でflowを毎回生成するため計算量が大きくなります。
- input aux channelは出力へ保持されません。

## Repair Frame / Time系との違い

- **Tween** — 任意の2枚を直接入力して中間Imageを作る
- **Repair Frame** — sequence上の対象frameとその前後を内部的に使って補間する
- **Time Speed / Time Stretcher** — clip sequenceを時間軸上でretimeする

## 関連Node

- [Optical Flow](./optical-flow.md)
- [Repair Frame](./repair-frame)
- [Smooth Motion](./smooth-motion)

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 112 pp.2625–2628で、Input 0 / Input 1 / Effect Mask、内部Optical Flow、Interpolation Parameter、Depth Ordering、Clamp Edges、Edge Softness、Source Frame / Warp Direction、aux channel破棄を確認しました。

全既定値・全数値範囲、実機性能、内部REGIDは未確認です。
