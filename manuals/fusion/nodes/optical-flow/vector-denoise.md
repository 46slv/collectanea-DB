---
title: Vector Denoise
description: Forward / Back Vectorでframe間の対応位置を合わせながら複数frameを平均し、時間方向のnoiseを減らすNode。
doc_type: node
term_id: vector-denoise
term_short: "Vector Denoiseは、motion vectorでframe間を合わせながら複数frameを平均するNode。"
verification: partial
aliases: [Vector Denoise, VDn]
concepts: [image-data, auxiliary-channels, motion-vectors]
nodes: [Vector Denoise]
node_family: optical-flow
controls: [Average, Threshold]
inputs: [image, vector]
outputs: [image]
tasks: [analyze-motion]
product_scope: fusion-studio
suite_surfaces: [fusion]
updated: "2026-10-05"
---

# Vector Denoise

Vector Denoiseは、frame間のmotion vectorを使って同じ被写体位置を対応させ、そのうえで複数frameのpixel値を平均するNodeです。

同じ画面座標だけを平均する方法より、cameraや被写体が動くshotで時間方向のaverageを使いやすくします。

## 役割

```text
Image → Optical Flow → Vector Denoise → output Image
```

Optical FlowがForward / Back Vectorを生成し、Vector Denoiseがその情報を使って複数frameを平均します。

## 入力

オレンジ色のInputへ2D Imageを接続します。

入力Imageには事前計算済みのVector / Back Vector channelが必要です。Optical Flowの出力、またはvector channelを保持したEXRを使えます。

## 出力

motion compensated averagingを適用した2D Imageを出力します。

## 主な設定項目

### Average

平均へ使う時間windowをframe数で指定します。

参照frameを増やすほど時間方向の平均範囲が広がるため、結果を見ながら調整します。

### Threshold

短いflashや一時的なhighlightなど、周囲frameと大きく異なるpixelを平均へ含めにくくする上限thresholdです。

## 主な用途

- moving subjectを含むshotで時間方向のnoiseを減らす
- static temporal averageよりframe間の位置ずれを考慮して平均する
- Optical Flowで得たmotion vectorをnoise reductionへ再利用する
- vector付きEXRから解析済みmotionを使ってdenoiseする

## 最小構成

```text
MediaIn → Optical Flow → Vector Denoise → MediaOut
```

Optical Flowのvectorが安定していることを確認してからAverageを調整すると、原因を分けて確認しやすくなります。

## 運用例

低照度shotの時間方向noiseを減らす場合:

1. MediaInをOptical Flowへ接続し、Forward / Back Vectorを生成します。
2. Vector Denoiseへ接続します。
3. Averageで参照frame数を調整します。
4. 一瞬だけ明るいpixelが平均へ混ざる場合はThresholdを調整します。
5. moving edgeで結果が不安定なら、denoise量だけでなく元のvectorも確認します。

## Smooth Motionとの違い

- **Vector Denoise** — Imageのpixel値を複数frameで平均する
- **Smooth Motion** — Disparity、Vector、Normal、Zなど選んだAOV channelを時間方向に平滑化する

## Studio制約

21.1 Manual Chapter 112では、Vector Denoise、Vector Transform、Vector Warpを **Vector Warping Toolset (Studio Version Only)** の節で説明しています。

## 関連Node

- [Optical Flow](./optical-flow.md)
- [Smooth Motion](./smooth-motion)

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 112 pp.2628–2629で、Studio-only Vector Warping Toolset、precomputed Vector / Back Vector要件、motion compensated averaging、Average、Thresholdを確認しました。

全既定値・数値範囲、実機performance、内部REGIDは未確認です。
