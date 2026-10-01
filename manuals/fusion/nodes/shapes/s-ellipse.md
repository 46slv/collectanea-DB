---
title: sEllipse
description: Shape domainで円・楕円shapeを生成するFusion Shape Node。
doc_type: node
verification: partial
aliases: [sEllipse, Shape Ellipse]
concepts: [data-domain, shape-domain, vector-shape]
nodes: [sEllipse]
node_family: shapes
outputs: [shape]
tasks: [shape, ellipse, procedural-graphics]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
---

# sEllipse

Shape domainで円・楕円shapeを生成するNodeです。

## At a Glance

- **Family**: Shapes
- **Output domain**: Shape
- **Core concepts**: vector/path domain、deferred rasterization
- **Common tasks**: procedural graphics、shape composition、repeated vector forms

## Inputs

shape生成用のparameter / modifier入力を持つ系統ですが、Fusion 21.1のexact input surfaceはこのReferenceでは固定しません。

## Output

Shape streamを出力します。

これは2D ImageでもMaskでもありません。

## Controls

position・size・shape styling等に関わるcontrolを持つ系統ですが、exact 21.1 label / default / rangeはcurrent manual / runtime verification待ちです。

## Behavior / Notes

Shape systemでは、可能な限りShape domainのまま変形・複製・結合し、必要な段階でsRenderを使って2D Imageへ変換します。

```text
sEllipse
  → sTransform / sDuplicate / sMerge
  → sRender
  → 2D Image
```

通常のEllipse Maskとはdata domainも用途も異なります。

## Minimal Examples

```text
sEllipse → sRender → Merge
```

## Related Concepts

- [Data domainを辿って診断する](../../learn/07-debugging/trace-data-domain)

## Related Patterns

Shape-specific Patternは今後追加します。

## Similar / Adjacent Nodes

- Ellipse Mask — Mask domain
- sRectangle
- sPolygon
- sText

## Version / Verification Notes

sEllipseはResolve 17以降のShape systemとしてBlackmagic Design公式version資料系で確認されています。21.1 exact control surfaceは未検証です。
