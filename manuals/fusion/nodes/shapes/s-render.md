---
title: sRender
description: Shape domainを2D ImageへrasterizeするShape renderer Node。
doc_type: node
term_id: s-render
verification: partial
aliases: [sRender, Shape Render]
concepts: [data-domain, shape-domain, rasterization]
nodes: [sRender]
node_family: shapes
inputs: [shape]
outputs: [image]
tasks: [shape, render, convert-domain]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
---

# sRender

sRenderは、<Term id="shape-data">Shape</Term>を通常の2D Imageへ変換するRenderer Nodeです。

## 概要

- **分類（Family）**: Shapes / Render
- **入力データ（Input domain）**: Shape
- **出力データ（Output domain）**: 2D Image
- **関連概念（Core concepts）**: domain conversion、rasterization
- **よく使う作業（Common tasks）**: procedural Shapeを通常の2D 合成へ渡す

## 入力

### Shape

sEllipse、sText、sMerge等のShape streamを受け取ります。

## 出力

rasterized 2D Imageを出力します。

## 主な設定項目

render size、見た目、sampling等に関わるcontrolを持つ可能性がありますが、正確な 21.1 UIは現在の資料または実機での確認待ちです。

## 挙動と注意点

sRenderは**Shape domain → 2D Image domain**の境界です。

Shapeを通常のMerge / Blur / Color Nodeへ渡す前に、この変換が必要な構成として読みます。

## 最小例

```text
sEllipse → sRender → Merge
```

## 関連する考え方

- [シェイプ（Shape）](../../learn/02-data/shape)
- [データ領域（data domain）を辿って診断する](../../learn/07-debugging/trace-data-domain)

## 関連パターン

Shape-specific Patternは今後追加します。

## 似たNode・関連Node

- pRender — Particle set → 2D Image
- Renderer 3D — Classic 3D scene → 2D Image
- uRenderer — USD scene → 2D Image / AOV

## バージョンと検証状況

sRenderのShape → 2D Image 役割はBlackmagic Design公式バージョン資料で確認。Fusion 21.1での正確な設定項目は未検証です。
