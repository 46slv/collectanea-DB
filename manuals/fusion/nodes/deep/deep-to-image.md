---
title: Deep to Image
description: Deep imageを通常の2D Imageへflattenするdomain変換Node。
doc_type: node
verification: partial
aliases: [Deep to Image]
concepts: [data-domain, deep-image, flatten]
nodes: [Deep to Image]
node_family: deep
inputs: [deep-image]
outputs: [image]
tasks: [deep, flatten, convert-domain]
level: advanced
product_scope: fusion
suite_surfaces: [fusion]
---

# Deep to Image

Deep imageを通常の2D ImageへflattenするNodeです。

## 概要（At a Glance）

- **分類（Family）**: Deep / Conversion
- **入力データ（Input domain）**: Deep image
- **出力データ（Output domain）**: 2D Image
- **関連概念（Core concepts）**: domain conversion、flattening
- **よく使う作業（Common tasks）**: Deep 合成結果を通常2D Flowへ戻す

## 入力（Inputs）

### Deep image

dMergeやDeep toolsetから来るDeep imageを受け取ります。

## 出力（Output）

通常の2D Imageを出力します。

## 主な設定項目（Controls）

flatten / sample resolutionに関する正確な設定項目はFusion 21.1 現在の manual / 実機確認待ちです。

## 挙動と注意点（Behavior / Notes）

Deep to Imageは**Deep image → 2D Image**のdomain boundaryです。

一度2Dへflattenした後は、Deep samplesを前提とするdMerge等へ戻す場合に同じ情報が保持されるとは考えません。

## 最小例（Minimal Examples）

```text
Deep A ─┐
        ├─ dMerge → Deep to Image → Merge / Color / Blur
Deep B ─┘
```

## 関連する考え方（Concepts）

- [データ領域（data domain）を辿って診断する](../../learn/07-debugging/trace-data-domain)

## 関連する再利用構成（Patterns）

Deep-specific Patternは今後追加します。

## 似たNode・関連Node

- Image to Deep — 2D Image → Deep image
- Renderer 3D — Classic 3D scene → 2D Image
- uRenderer — USD scene → 2D Image / AOV
- pRender — Particle set → 2D Image

## バージョンと検証状況

Deep to ImageはResolve/Fusion 20以降のDeep toolsetとしてBlackmagic Design公式バージョン資料で確認。Fusion 21.1での正確な設定項目は未検証です。
