---
title: uRenderer
description: USD sceneをHydraベースで2D Image / AOVへrenderするUSD renderer Node。
doc_type: node
verification: partial
aliases: [uRenderer, USD Renderer]
concepts: [data-domain, usd-scene, rendering, aov]
nodes: [uRenderer]
node_family: usd
inputs: [usd-scene]
outputs: [image]
tasks: [usd, render-3d, convert-domain, aov]
level: advanced
product_scope: fusion
suite_surfaces: [fusion]
---

# uRenderer

USD sceneをrenderし、2D ImageやAOVへ変換するUSD pipelineのRenderer Nodeです。

## 概要（At a Glance）

- **分類（Family）**: USD / Render
- **入力データ（Input domain）**: USD scene
- **出力データ（Output domain）**: 2D Image / AOV
- **関連概念（Core concepts）**: USD、Hydra、domain conversion
- **よく使う作業（Common tasks）**: USD sceneを通常の2D 合成へ戻す

## 入力（Inputs）

### USD scene

uMerge、uLoader、uShape等で構成したUSD sceneを受け取ります。

## 出力（Output）

2D Imageおよびrendererが提供するAOVを扱う系統です。

Resolve 21系ではUSD SDK 25.11 / Hydra 2.0 Storm対応と、camera-relative normalのNeye AOV追加が公式version資料に記録されています。

## 主な設定項目（Controls）

renderer / camera / AOV / render quality等のcontrolがありますが、21.1 正確な設定項目は未検証です。

## 挙動と注意点（Behavior / Notes）

uRendererは**USD scene → 2D Image / AOV**のdomain boundaryです。

Classic Fusion 3D用Renderer 3Dとは別Nodeです。

## 最小例（Minimal Examples）

```text
uShape / uLoader
      ↓
    uMerge
      ↓
   uRenderer
      ↓
2D Image / AOV
```

## 関連する考え方（Concepts）

- [データ領域（data domain）を辿って診断する](../../learn/07-debugging/trace-data-domain)

## 関連する再利用構成（Patterns）

USD Patternは今後追加します。

## 似たNode・関連Node

- Renderer 3D — Classic Fusion 3D
- pRender — Particle set
- sRender — Shape domain

## バージョンと検証状況

uRendererはResolve 18.5以降のUSD toolsetとして確認され、Resolve 21でUSD SDK 25.11 / Hydra 2.0 Storm・Neye AOVの更新が公式バージョン資料で確認されています。Fusion 21.1での正確な設定項目は未検証です。
