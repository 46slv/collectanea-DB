---
title: Optical Flow / Motionノード
description: frame間の動きをvectorとして解析し、retime・frame repair・motion smoothing・denoiseへ使うNodeを目的から選ぶ入口。
doc_type: index
verification: partial
product_scope: fusion
tasks: [lookup-node, analyze-motion, retime]
updated: "2026-10-05"
---

# Optical Flow / Motionノード

このFamilyでは、前後frameを比較してmotion vectorを推定し、そのvectorをframe生成や修復へ使います。

## 基本の流れ

```text
Image sequence → Optical Flow → motion vectors
                            ↓
              Tween / Repair Frame / Smooth Motion
```

## 代表Node

- Optical Flow — forward / backward motion vectorを解析
- Tween — vectorから中間frameを生成
- Repair Frame — 欠損 / 異常frameを前後frameから補間
- Smooth Motion — temporal motionを滑らかにする
- Vector Denoise — vector fieldのnoiseを減らす

## 注意

motion vectorは通常のRGB Imageとは別の補助dataです。Vector Motion Blur等へ渡す場合は、vector channelの向き・scale・格納先を確認します。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference ManualのOptical Flow / motion-vector関連sectionを基に整理します。algorithm内部仕様とStudio / GPU performanceは実機確認へ分離します。
