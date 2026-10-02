---
title: 特殊domainのまま処理し、必要な境界で2Dへ戻す
description: Shape・Particle・3D・USD・Deepを早くrasterize/flattenせず、domain固有処理を終えてから2Dへ変換するPattern。
doc_type: pattern
verification: partial
aliases: [defer rasterization, domain conversion boundary]
concepts: [data-domain, rendering, conversion]
patterns: [defer-domain-conversion]
nodes: [sRender, pRender, Renderer 3D, uRenderer, Deep to Image]
tasks: [convert-domain, optimize-graph, debug]
level: intermediate
product_scope: fusion
---

# 特殊domainのまま処理し、必要な境界で2Dへ戻す

## Problem Family

Shape・Particle・3D・USD・Deepを、途中ですぐ2D Imageへ変換してしまい、そのdomainでしか使えない編集・複製・depth関係を失う問題です。

## Concepts

- [Data domainを辿って診断する](../../learn/07-debugging/trace-data-domain)
- [Graphとして考える](../../learn/01-flow/graph-as-flow)

## Generic Graph

```text
specialized source
      ↓
domain-specific processing
      ↓
domain-specific processing
      ↓
conversion / renderer
      ↓
2D Image processing
```

代表的な境界:

```text
Shape        → sRender       → 2D Image
Particle set → pRender       → 2D Image
Classic 3D   → Renderer 3D   → 2D Image
USD scene    → uRenderer     → 2D Image / AOV
Deep image   → Deep to Image → 2D Image
```

## Invariant

- domain固有処理は可能な限りdomain内で完了する。
- conversion boundaryをGraph上で明示する。
- conversion後に失われる情報を意識する。
- 2D Nodeへ接続できないからといって、特殊domain側を壊して無理にImage化しない。

## Variants

### Vector-first

ShapeをsRender直前までShape domainのまま扱います。

### Scene-first

Classic 3D / USDはrendererまでscene domainを維持します。

### Sample-aware first

Deep imageはDeep compositingを終えてから2Dへflattenします。

### Particle-first

Particle setをpRenderまで維持し、force / behavior等をImage化前に適用します。

## Node Choices

domainごとの変換Nodeを使います。

- sRender
- pRender
- Renderer 3D
- uRenderer
- Deep to Image

## Failure Modes

- Shapeを通常Mergeへ直接つなぐ。
- Particle setをBlur等のImage filterへ入れようとする。
- USD sceneをClassic 3D Nodeへ渡す。
- dMergeを通常Mergeの上位版として使う。
- renderer / flatten後にdomain固有情報が残っている前提で後段処理する。

## Recipes Using This Pattern

- [Shapeを2D Imageへrenderする](../../recipes/shapes/basic-shape-render)
- [USD sceneを2Dへrenderする](../../recipes/usd/basic-usd-render)
- [Deep compositeを2Dへ戻す](../../recipes/deep/deep-merge-to-image)
- [最小Particle chainを作る](../../recipes/particles/basic-particle-chain)

## Related Node Reference

- [sRender](../../nodes/shapes/s-render)
- [pRender](../../nodes/particles/p-render)
- [Renderer 3D](../../nodes/3d/renderer-3d)
- [uRenderer](../../nodes/usd/u-renderer)
- [Deep to Image](../../nodes/deep/deep-to-image)
