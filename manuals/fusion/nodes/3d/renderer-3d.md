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

## At a Glance

- **Family**: 3D / Render
- **Input domain**: Classic 3D scene
- **Output domain**: 2D Image
- **Core concepts**: domain conversion、rendering
- **Common tasks**: 3D sceneを2D compositingへ戻す

## Inputs

### Classic 3D scene

Merge 3D等で構成したsceneを受け取ります。

## Output

rasterized 2D Imageを出力します。

Fusion 20以降のDeep、Fusion 21のCryptomatte関連拡張が公式資料系で記録されていますが、この初期Referenceではexact auxiliary outputs / controlsを固定しません。

## Controls

renderer selection、lighting / shadow / channel / auxiliary output等に関わる設定がありますが、exact 21.1 control surfaceは未検証です。

## Behavior / Notes

Renderer 3Dは**3D domain → 2D Image domainの境界**です。

後段の通常Merge / Blur等へ渡すには、このようなdomain conversionを意識します。

## Minimal Examples

```text
Shape3D / Text3D / Camera
        ↓
     Merge 3D
        ↓
    Renderer 3D
        ↓
     2D Merge
```

## Related Concepts

- [Data domainを辿って診断する](../../learn/07-debugging/trace-data-domain)

## Related Patterns

3D Patternは今後追加します。

## Similar / Adjacent Nodes

- uRenderer — USD scene
- pRender — Particle set

## Version / Verification Notes

Renderer 3DのClassic 3D → 2D Image roleはFusion 21系semantic baselineとcatalogで確認。exact 21.1 controls / auxiliary outputは未検証です。
