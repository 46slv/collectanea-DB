---
title: Tween
description: 別々に入力した前後2枚の画像から、Optical Flowで欠けた中間フレームを作るNode。
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
tasks: [frame-interpolation, frame-repair]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-22"
---

# Tween

Tweenは、欠けたフレームより前と後にある**2枚の画像**を別々に受け取り、その間の動きを推定して新しい画像を作るノードです。例えば01と03の画像を入力すると、02に相当する中間画像を生成できます。

Time Speed / Time Stretcherが連続した映像の時間を変更するのに対し、Tweenは**連番として接続されていない2枚の画像**を入力する点が異なります。どの画像を前後に使うかは入力側で用意します。

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

### Method

動きの解析方式を選びます。**Advanced**はGPUを使う方式、**Classic**は従来のCPU方式で、古いコンポジションとの互換性や一部のステレオ3D処理で使います。これは補間位置を指定する設定ではありません。解析方法を切り替えたら、被写体の輪郭と処理時間を比較します。

### Interpolation Parameter

2枚の入力画像のどの時点を作るか決めます。

- **0.0**：Input 0（前の画像）の時点
- **0.5**：2枚のちょうど中間
- **1.0**：Input 1（後の画像）の時点

01と03から02を作る場合は**0.5**を使います。中間以外の時点を生成したい場合は、その時間的位置に合わせて変更します。

### Depth Ordering

異なる速さで動く領域が重なるとき、どちらを手前に描くかを決めます。

- **Fastest On Top**：固定カメラの前を車が横切るように、車の動きが背景より速い場合。速い領域を手前に描きます。
- **Slowest On Top**：カメラが車を追ってパンし、背景の動きが車より速くなる場合。遅い領域を手前に描きます。

どちらが正しいかは「車が前景だからFastest」という固定判断では決まりません。**画面上で推定された移動量**と被写体の重なり方を見て選びます。

### Clamp Edges / Edge Softness

**Clamp Edges**は、補間によって画像の端に生じた**小さな透明の隙間**を、端の画素を伸ばして埋めます。大きく欠けた領域を修復する設定ではありません。人物が画面端を横切る場合やカメラが動く場合、伸びた輪郭が目立つことがあります。

**Edge Softness**はClamp Edgesを有効にしたときだけ表示され、引き伸ばしの見え方を調整します。21.1マニュアルでは、後述の方向チェックを**複数有効にした場合は約0.01、1つだけの場合は約0.03**を目安にしています。これは推奨される試行値であり、すべての素材に対する最適値ではありません。

### Source Frame and Warp Direction

前後どちらの画像を、どちら向きのMotion Vectorで変形して中間画像を作るかを選ぶチェック項目です。**オンにした各方法の結果が合成**されます。

| 項目 | 補間に使う画像と情報 |
| --- | --- |
| **Prev Forward** | 前の画像とForward Vector |
| **Next Forward** | 後の画像とForward Vector |
| **Prev Backward** | 前の画像と後方向のVector |
| **Next Backward** | 後の画像とBack Vector |

複数をオンにしたときに輪郭や画像端が二重に見えるなら、方法を1つずつ切り替えて比較します。特にClamp Edgesと併用すると、伸びた画像端が重なって見えることがあります。

**資料上の注意**：21.1マニュアルp.2628のPrev Backwardの説明には `Back Forward vector` という表記があり、UI項目名と一致しません。表は項目名に沿った整理です。内部で実際に使う方向の厳密な対応は21.1実機で未確認です。

## 主な用途

- **抜けた1枚を補う**：連番画像の02だけが失われた場合、残った01と03を別入力に渡して02に相当する画像を作ります。
- **中間の動きを試作する**：同じ被写体を別時点で撮った2画像から、Interpolation Parameterを変えながら中間の位置を比較します。撮影されていない部分の形が正しく復元される保証はありません。
- **一部だけ補間する**：背景は元の画像を残し、欠けた被写体の周辺だけをEffect Maskで処理します。マスク境界も前後の画像で確認します。

## 最小構成

```text
Frame 01 ─→ Input 0
                     Tween → Frame 02相当
Frame 03 ─→ Input 1
```

Interpolation Parameter = 0.5から確認します。

## 運用例：連番の02だけが欠けた場合

撮影した画像連番に01・03は残っているのに、02だけが欠けているケースです。

1. **01と03をそれぞれ独立した画像入力として用意**します。元の連続クリップを単に1本接続するだけでは、前後2入力にはなりません。
2. **01をInput 0（オレンジ）、03をInput 1（緑）**につなぎます。
3. **Interpolation Parameter = 0.5**にして、生成される02相当の画像を確認します。
4. 画面内の車が背景より速い固定カメラなら**Fastest On Top**を、車を追うパン撮影で背景が速いなら**Slowest On Top**を試します。被写体の前後関係に沿う方を選びます。
5. 補間で画面端に小さな透明の隙間ができた場合だけ**Clamp Edges**を検討し、人物や車の輪郭が伸びていないか確認します。
6. 前後画像で色や明るさが大きく違う場合、入力側を補正してから再度比較します。ノイズが強ければ前処理でノイズを減らす方法も試します。
7. 必要なら**Effect Mask**で補間範囲を限定します。生成した画像を元の連番の02の位置へ差し込む処理は、Tweenとは別に行います。

補間結果はあくまで動きからの**推定画像**です。被写体が前の画像では完全に隠れ、次の画像でも見えない領域は、両入力に復元元の情報がありません。

## 挙動と注意点

| 症状 | 最初に確かめること |
| --- | --- |
| 車や人物の輪郭が背景と入れ替わる | **Depth Ordering**を切り替え、前景と背景の推定移動量に合う方を選びます。 |
| 画面端が透明になる | 小さな隙間なら**Clamp Edges**を試し、伸びた画素が不自然でないか比較します。 |
| 画面端や輪郭が二重に伸びる | **Source Frame and Warp Direction**の複数チェックを減らし、Edge Softnessを調整します。 |
| 被写体の形が崩れる | 2枚の色・露出・ノイズを比べ、入力側の補正と**Method**の切り替えを検討します。 |
| 後段でVector / Back Vectorが見つからない | Tweenの内部計算で作られたベクトルと、入力にあった補助チャンネルは**出力されません**。 |

Tweenは必要なOptical Flowを内部計算するため、長尺や高解像度で複数回使う場合は計算コストに注意します。前後2枚から一度の欠損を埋める目的と、連続した映像全体の時間を変更する目的は分けて考えます。

## Repair Frame / Time系との違い

- **Tween** — 任意の2枚を直接入力して中間Imageを作る
- **Repair Frame** — sequence上の対象frameとその前後を内部的に使って補間する
- **Time Speed / Time Stretcher** — clip sequenceを時間軸上でretimeする

## 関連Node・基礎概念

- [Optical Flow](./optical-flow) — Motion Vectorを出力し、後段で再利用したい場合
- [Repair Frame](./repair-frame) — 連続した映像の前後フレームを内部参照して欠損を補う場合
- [Smooth Motion](./smooth-motion) — Vectorなどの補助チャンネルを時間方向に平滑化する場合
- [補助チャンネル（AOV）](../../learn/02-data/auxiliary-channels.md) — Tweenが出力へ保持しないVectorなどのデータを理解する

## 出典と確認範囲

一次資料：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月）、Chapter 112 **pp.2626–2628**。2画像・Mask入力、内部Optical Flow、Interpolation Parameter、Depth Orderingの固定カメラ／パン撮影例、Clamp Edges、Edge Softnessの調整目安、4方向チェック、補助チャンネル破棄を確認しました。MethodのAdvanced / Classicについては同Chapter **p.2619**とChapter 87 **p.1904**に基づきます。

[Blackmagic Design公式Reference Manual](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_21.1_Reference_Manual.pdf)

**未確認**：21.1実機における全既定値・全数値範囲、実際の補間品質・処理時間、内部REGID、およびp.2628のPrev Backward表記不一致の実挙動。
