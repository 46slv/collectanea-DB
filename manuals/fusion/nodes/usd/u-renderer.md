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

## At a Glance

- **Family**: USD / Render
- **Input domain**: USD scene
- **Output domain**: 2D Image / AOV
- **Core concepts**: USD、Hydra、domain conversion
- **Common tasks**: USD sceneを通常の2D compositingへ戻す

## Inputs

### USD scene

uMerge、uLoader、uShape等で構成したUSD sceneを受け取ります。

## Output

2D Imageおよびrendererが提供するAOVを扱う系統です。

Resolve 21系ではUSD SDK 25.11 / Hydra 2.0 Storm対応と、camera-relative normalのNeye AOV追加が公式version資料に記録されています。

## Controls

renderer / camera / AOV / render quality等のcontrolがありますが、21.1 exact control surfaceは未検証です。

## Behavior / Notes

uRendererは**USD scene → 2D Image / AOV**のdomain boundaryです。

Classic Fusion 3D用Renderer 3Dとは別Nodeです。

## Minimal Examples

```text
uShape / uLoader
      ↓
    uMerge
      ↓
   uRenderer
      ↓
2D Image / AOV
```

## Related Concepts

- [Data domainを辿って診断する](../../learn/07-debugging/trace-data-domain)

## Related Patterns

USD Patternは今後追加します。

## Similar / Adjacent Nodes

- Renderer 3D — Classic Fusion 3D
- pRender — Particle set
- sRender — Shape domain

## Version / Verification Notes

uRendererはResolve 18.5以降のUSD toolsetとして確認され、Resolve 21でUSD SDK 25.11 / Hydra 2.0 Storm・Neye AOVの更新が公式version資料系で確認されています。21.1 exact controlsは未検証です。
