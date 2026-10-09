---
title: Smooth Motion
description: Optical FlowのForward / Back Vectorを使い、AOV channelをframe間で平滑化するNode。
doc_type: node
term_id: smooth-motion
term_short: "Smooth Motionは、motion vectorを参照してAOVを時間方向に平滑化するNode。"
verification: partial
aliases: [Smooth Motion, SM]
concepts: [image-data, auxiliary-channels, motion-vectors]
nodes: [Smooth Motion]
node_family: optical-flow
controls: [Channel]
inputs: [image, vector]
outputs: [image, vector]
tasks: [smooth-motion, smooth-aov, stereo, motion-vectors]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-05"
---

# Smooth Motion

Smooth Motionは、Forward / Back Vectorを使い、Disparity、Vector、Normal、Zなどの補助channelをframe間で平滑化するNodeです。

## 役割

Optical Flowで解析したframe間の対応関係を使い、選択したAOV channelの時間方向の変化を整えます。

```text
MediaIn → Optical Flow → Smooth Motion → Result
```

## 入力

2D ImageをInputへ接続します。入力ImageにはOptical Flowまたはvector付きEXRから得たVector / Back Vectorが必要です。

## 出力

元のImageと、選択したchannelを時間方向に平滑化した結果を出力します。

## Channel

Controls tabで平滑化するchannelを選びます。ManualではDisparity、Vector、Normal、ZなどのAOVが例示されています。

必要なVector / Back Vectorがない場合は処理に必要なmotion dataが不足します。一方、選択した個別AOVが存在しない場合は、そのchannelについて処理されません。

## 主な用途

- Stereo 3DのDisparityをframe間で滑らかにする
- Forward / Back Vectorを後段処理の前に整える
- NormalやZなどのAOVを時間方向に平滑化する

## 運用例

Stereo clipのDisparityを平滑化する場合は、Optical FlowでVector / Back Vectorを用意し、Smooth MotionでDisparityを選びます。vector自体を先にSmooth Motionで処理し、その後でもう1つのSmooth MotionでDisparityを処理する構成もManualにあります。

## 直列に使う場合

Manualでは、1 Nodeで3 frame、2 Nodeで5 frame、3 Nodeで7 frameを参照する例が示されています。frame間の変化が複雑なshotでは結果を見ながら調整します。

## 関連Node

- [Optical Flow](./optical-flow.md)
- [Vector Denoise](./vector-denoise)
- [Tween](./tween)
- [Repair Frame](./repair-frame)

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 112 pp.2623–2625およびFusion Fundamentals Chapter 87 p.1903で、precomputed Vector / Back Vector要件、AOV smoothing、Channel選択、直列使用時の3 / 5 / 7 frame例を確認しました。

実機での全channel、既定値、性能、内部REGIDは未確認です。
