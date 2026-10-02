---
title: Renderer 3D
description: Classic Fusion 3D sceneを2D Imageへrasterizeするdomain変換Node。
doc_type: node
verification: partial
aliases: [Renderer3D, Renderer 3D, 3RN]
concepts: [data-domain, classic-3d, rendering]
nodes: [Renderer 3D]
node_family: 3d
inputs: [classic-3d-scene]
outputs: [image]
tasks: [render-3d, convert-domain, composite-3d]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
---

# Renderer 3D

Classic Fusion 3D sceneを2D Imageへ変換するRenderer Nodeです。

## 概要

- **分類（Family）**: 3D / Render
- **入力データ（Input domain）**: Classic 3D scene
- **出力データ（Output domain）**: 2D Image
- **関連概念（Core concepts）**: domain conversion、rendering
- **よく使う作業（Common tasks）**: 3D sceneを2D 合成へ戻す

## 入力

### Classic 3D scene

Merge 3D等で構成したsceneを受け取ります。

## 出力

rasterized 2D Imageを出力します。

Fusion 20以降のDeep、Fusion 21のCryptomatte関連拡張が公式資料系で記録されていますが、この初期Referenceでは補助出力（auxiliary outputs）と設定項目の正確な仕様を固定しません。

## 主な設定項目

renderer selection、lighting / shadow / channel / auxiliary output等に関わる設定がありますが、正確な 21.1 control surfaceは未検証です。

## 挙動と注意点

Renderer 3Dは**3D domain → 2D Image domainの境界**です。

後段の通常Merge / Blur等へ渡すには、このようなdomain conversionを意識します。

## 最小例

```text
Shape3D / Text3D / Camera
        ↓
     Merge 3D
        ↓
    Renderer 3D
        ↓
     2D Merge
```

## 関連する考え方

- [データ領域（data domain）を辿って診断する](../../learn/07-debugging/trace-data-domain)

## 関連パターン

3D Patternは今後追加します。

## 似たNode・関連Node

- uRenderer — USD scene
- pRender — Particle set

## バージョンと検証状況

Renderer 3DのClassic 3D → 2D Image 役割はFusion 21系semantic baselineとcatalogで確認。正確な 21.1 controls / auxiliary outputは未検証です。
