---
title: sRender
description: Shape domainを2D ImageへrasterizeするShape renderer Node。
doc_type: node
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

Shape streamを2D Imageへ変換するRenderer Nodeです。

## At a Glance

- **Family**: Shapes / Render
- **Input domain**: Shape
- **Output domain**: 2D Image
- **Core concepts**: domain conversion、rasterization
- **Common tasks**: procedural Shapeを通常の2D compositingへ渡す

## Inputs

### Shape

sEllipse、sText、sMerge等のShape streamを受け取ります。

## Output

rasterized 2D Imageを出力します。

## Controls

render size、style、sampling等に関わるcontrolを持つ可能性がありますが、exact 21.1 UIはcurrent verification待ちです。

## Behavior / Notes

sRenderは**Shape domain → 2D Image domain**の境界です。

Shapeを通常のMerge / Blur / Color Nodeへ渡す前に、この変換が必要な構成として読みます。

## Minimal Examples

```text
sEllipse → sRender → Merge
```

## Related Concepts

- [Data domainを辿って診断する](../../learn/07-debugging/trace-data-domain)

## Related Patterns

Shape-specific Patternは今後追加します。

## Similar / Adjacent Nodes

- pRender — Particle set → 2D Image
- Renderer 3D — Classic 3D scene → 2D Image
- uRenderer — USD scene → 2D Image / AOV

## Version / Verification Notes

sRenderのShape → 2D Image roleはBlackmagic Design公式version資料系で確認。21.1 exact controlsは未検証です。
