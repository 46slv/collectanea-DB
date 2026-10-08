---
title: Repair Frame
description: 前後のframeを内部Optical Flowで解析し、一時的な映像ノイズや欠損を隣接frameの情報から補間するNode。
doc_type: node
term_id: repair-frame
term_short: "Repair Frameは、前後frameを解析して一時的な映像ノイズや欠損を補間するNode。"
verification: partial
aliases: [Repair Frame, REP]
concepts: [image-data, motion-vectors, mask]
nodes: [Repair Frame]
node_family: optical-flow
controls: [Method, Depth Ordering, Clamp Edges, Edge Softness, Prev Forward, Next Forward, Prev Backward, Next Backward]
inputs: [image, mask]
outputs: [image]
tasks: [frame-repair, frame-interpolation]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-05"
---

# Repair Frame

Repair Frameは、対象frameとその前後frameを比較し、隣接Imageから動きを推定して、一時的な映像ノイズや欠損部分を補間するNodeです。

外部のOptical Flowを前段へ置く必要はありません。Repair Frame自身が必要なmotion vectorを内部で計算します。

## 役割

1 frameだけに現れる一時的な映像異常を、前後frameの情報から補間する用途に向いています。

```text
Image sequence → Repair Frame → repaired Image
                     ↑
                Effect Mask
```

内部では対象frameと前後2 frame、合計3 frameの関係を使います。

## 入力

### Input

オレンジ色の入力へ、処理したい2D Image sequenceを接続します。

### Effect Mask

青色のMask入力です。補間する範囲だけへ処理を限定できます。

## 出力

補間後の2D Imageを出力します。

Repair Frameは内部でOptical Flowを計算しますが、そのaux channelを出力へ保持しません。Manualでは処理後にinputのaux channelも破棄すると説明されています。

## 主な設定項目

### Method

Optical Flow解析はAdvanced GPU方式またはClassic CPU方式を選べます。解析側の詳細ControlはOptical Flowと共通です。

### Depth Ordering

motion vectorの速さを使い、どちらの領域を手前として扱うかを選びます。

- **Fastest On Top** — 速く動くobjectを手前として扱う
- **Slowest On Top** — camera panなどでbackground側のvectorが速い場合に、遅いobjectを手前として扱う

固定cameraで移動objectだけが動くshotではFastest On Top、cameraがobjectを追ってpanするshotではSlowest On Topが候補になります。

### Clamp Edges

補間でframe端に透明なgapが出る場合、edgeを伸ばして埋めます。代わりに引き伸ばしartifactが出るため、Manualは小さなedge gapの補正に限定して使うことを勧めています。

### Edge Softness

Clamp Edgesを有効にしたとき、edge stretchingを和らげます。

### Source Frame and Warp Direction

どの隣接frameとvector方向を補間へ使うか選びます。

- Prev Forward
- Next Forward
- Prev Backward
- Next Backward

複数を有効にすると、それぞれの結果がblendされます。

## 主な用途

- 1 frameだけに現れる映像ノイズを前後frameから補間する
- 一時的なpixel dropoutや小さな欠損を補う
- film scan等で単発の映像異常を局所Mask付きで補間する
- object通過時に一瞬だけ生じるartifactを時間方向の情報で置き換える

## 最小構成

```text
MediaIn → Repair Frame → MediaOut
              ↑
        optional Mask
```

## 運用例

1 frameだけ小さな映像ノイズが出たshotを補う場合:

1. 問題frameを確認します。
2. Repair FrameをMediaInの後へ追加します。
3. 必要なら対象範囲だけを囲うsoft MaskをEffect Maskへ接続します。
4. objectとbackgroundの動きが重なる場合はDepth Orderingを切り替えます。
5. frame端にgapが出る場合だけClamp Edgesを試します。

## 挙動と注意点

- Repair FrameはOptical Flowを毎回内部生成するため、事前計算済みvectorを使う単純な後段Nodeより処理が重くなります。
- 前後frameで色や明るさが大きく変わると、別frameから取ったpixelが目立つことがあります。Manualはdeflicker、color correction、soft Maskを候補に挙げています。
- Clamp Edgesはgapを埋めてもstretch artifactを作るため、必要な場面だけ使います。
- inputに含まれていたaux channelは処理後に保持されません。

## Optical Flowとの違い

- **Optical Flow** — motion vectorを生成して後段へ残す
- **Repair Frame** — 内部でvectorを生成してframe補間まで行い、vectorは残さない

## 関連Node

- [Optical Flow](./optical-flow.md)
- [Tween](./tween)
- [Smooth Motion](./smooth-motion)

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 112 pp.2621–2623で、Image / Effect Mask入力、内部Optical Flow、aux channel破棄、Depth Ordering、Clamp Edges、Edge Softness、Source Frame / Warp Direction、Optical Flow Optionsを確認しました。

全既定値・全数値範囲、実機でのartifact傾向、内部REGIDは未確認です。
