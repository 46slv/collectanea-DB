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
updated: "2026-10-22"
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

### Clamp Edges / Edge Softness

**Clamp Edges**は、フレーム補間で画面端にできた透明な隙間を、端の画像を引き伸ばして埋める設定です。隙間が消える代わりに、人物や車が画面端を横切ると形が伸びて見える場合があります。大きな欠損を直す機能ではなく、**小さな端の隙間**に限って検討します。

**Edge Softness**はClamp Edgesを有効にしたときだけ現れ、引き伸ばし部分の見え方を和らげます。21.1 Manual（p.2623）は、後述のSource Frame and Warp Directionを**複数オンにした場合は約0.01、1つだけの場合は約0.03**を調整の目安として挙げています。これは固定の正解値ではありません。端に動く物体があるフレームを確認し、二重の伸びや不自然なぼけが出ない範囲に調整してください。

### Source Frame and Warp Direction

Repair Frameは前後のフレームから補修候補を作ります。この4項目は、**どちらのフレームを参照し、どちら向きのMotion Vectorでワープするか**を選ぶチェックボックスです。

| 項目 | 補修に利用する情報 |
| --- | --- |
| **Prev Forward** | 前のフレームとForward Vector |
| **Next Forward** | 次のフレームとForward Vector |
| **Prev Backward** | 前のフレームと後方向のVector |
| **Next Backward** | 次のフレームとBack Vector |

チェックした方法の結果は合成されます。複数の方法を有効にすれば必ず良くなるわけではなく、**Clamp Edgesと組み合わせたときに画面端の引き伸ばしが重なる**場合があります。まず問題のあるフレームとその前後を比較し、候補を切り替えて重なりや輪郭の伸びが少ない組み合わせを選びます。

なお、21.1 Manual p.2624の**Prev Backward**の説明本文には`Back Forward vector`という表記があり、チェックボックス名と一致しません。本記事の表はUI項目名に基づく整理であり、この項目の内部的なベクトル参照方向は実機未検証です。

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

## 運用例：1フレームだけ現れた傷を消す

例えば120フレーム目だけに白い傷が映り、119・121フレーム目には傷がないフィルムスキャンを補修します。

1. `MediaIn → Repair Frame → MediaOut`と接続し、**119・120・121フレーム目**を行き来して、傷が120にだけ存在することを確認します。Repair Frameは補修対象と前後の計3フレームを使います。
2. 傷が小さい場合はPolygonなどで傷の周囲を囲み、**青いEffect Mask入力**へ接続します。マスクの境界は少しぼかし、補修と元画像の境目を比較します。大きく動く被写体まで囲まないようにします。
3. 120フレーム目で結果を確認し、車や人物の輪郭が前景と背景の間で入れ替わる場合は**Fastest On Top / Slowest On Top**を比較します。固定カメラで速く移動する車と、車を追うパン撮影では、適した判定が異なります。
4. 前後フレームからの補間が二重像になる場合は**Source Frame and Warp Direction**のチェックを切り替え、どの候補が傷を目立たせずに輪郭を保つか比較します。
5. 画面端に小さな透明の隙間が生じるときだけ**Clamp Edges**を試します。使う場合はEdge Softnessも調整し、傷の周辺だけでなく画面端の人物・車の形を確認します。
6. 最後に処理を一時的に無効にして、120フレーム目の補修具合と**119→120→121**の時間的なつながりを比較します。

傷が複数フレームにわたって同じ位置に残る場合や、前後フレームでも補修元が隠れている場合は、この3フレーム補間だけでは十分な情報がありません。別フレームからのClean PlateやPaintを使う方法も検討します。

## 挙動と注意点

- Repair FrameはOptical Flowを毎回内部生成するため、事前計算済みvectorを使う単純な後段Nodeより処理が重くなります。
- 前後frameで色や明るさが大きく変わると、別frameから取ったpixelが目立つことがあります。Manualはdeflicker、color correction、soft Maskを候補に挙げています。
- Clamp Edgesはgapを埋めてもstretch artifactを作るため、必要な場面だけ使います。
- inputに含まれていたaux channelは処理後に保持されません。

## Optical Flowとの違い

- **Optical Flow** — motion vectorを生成して後段へ残す
- **Repair Frame** — 内部でvectorを生成してframe補間まで行い、vectorは残さない

## 関連Node

- [Optical Flow](./optical-flow)
- [Tween](./tween)
- [Smooth Motion](./smooth-motion)

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 112 pp.2622–2624で、Image / Effect Mask入力、内部Optical Flow、aux channel破棄、Depth Ordering、Clamp Edges、Edge Softness、Source Frame / Warp Direction、Optical Flow Optionsを確認しました。

全既定値・全数値範囲、実機でのartifact傾向、内部REGIDは未確認です。
