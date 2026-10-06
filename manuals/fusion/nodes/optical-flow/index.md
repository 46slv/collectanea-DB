---
title: Optical Flow / Motionノード
description: frame間の動きをvectorとして解析し、retime・frame repair・motion smoothing・denoise・texture warpへ使うNodeを目的から選ぶ入口。
doc_type: index
verification: partial
product_scope: fusion
tasks: [lookup-node, analyze-motion, retime, warp-image]
updated: "2026-10-05"
slug: overview
---

# Optical Flow / Motionノード

このFamilyには、motion vectorを前計算して後段へ渡すNodeと、必要なoptical flowを内部で計算して結果だけを返すNodeがあります。

## 基本の流れ

```text
Image sequence → Optical Flow → Vector / Back Vector
                            ↓
       Smooth Motion / Vector Denoise
       Vector Transform / Vector Warp

Image sequence → Repair Frame → repaired frame
                  (internal optical flow)

Previous + Next Image → Tween → interpolated Image
                         (internal optical flow)
```

Repair FrameとTweenの前にOptical Flowを置く必要はありません。どちらも内部でoptical flowを計算します。Smooth MotionやVector Warping Toolsetは、事前に用意したVector / Back Vectorを使います。

## 代表Node

- [Optical Flow](./optical-flow.md) — forward / backward motion vectorを解析する
- [Tween](./tween) — 2つの隣接Imageから内部optical flowを生成し、中間frameを作る
- [Repair Frame](./repair-frame) — 前後frameを内部解析し、欠損・異常frameを補う
- [Smooth Motion](./smooth-motion) — precomputed Vector / Back Vectorを使い、Vector / Z / Normal等のAOVを時間方向に平滑化する
- [Vector Denoise](./vector-denoise) — motion compensated averagingで時間方向のnoiseを減らす
- [Vector Transform](../warp/vector-transform) — vector / UV channel自体の位置・scale・角度・強さを整える
- [Vector Warp](../warp/vector-warp) — motion vectorを使ってTextureをsource clipの動きへ追従させる

## Vector Warping Toolset

21.1 ManualではVector Denoise、Vector Transform、Vector Warpを **Vector Warping Toolset (Studio Version Only)** としてまとめています。

Vector Transform / Vector WarpはWarp / Distort側のNode Referenceにも配置していますが、motion vectorの生成元と接続関係を理解するため、このページからも参照できます。

## 注意

motion vectorは通常のRGB Imageとは別の補助dataです。Vector Motion Blur、TimeSpeed、TimeStretcher、Vector Warp等へ渡す場合は、必要なVector / Back Vector channelと向きを確認します。

precomputed vectorを使う構成でwarpや平滑化の結果が崩れる場合は、後段のControlだけで直そうとせず、まずOptical Flowで生成されたvectorがsourceの動きを正しく捉えているか確認します。Tween / Repair Frameでは内部flowの解析設定を確認します。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 112 pp.2617–2634を基に整理しています。Repair Frame pp.2622–2624、Smooth Motion pp.2624–2626、Tween pp.2626–2628、Vector Warping Toolset pp.2629–2633で、precomputed vectorを必要とするNodeと内部計算するNodeの境界を確認しました。algorithm内部仕様、全既定値・数値範囲、Studio / GPU performanceは実機確認へ分離します。
