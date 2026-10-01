---
title: pRender
description: Particle setを2D Imageへrasterizeするparticle domainのRenderer Node。
doc_type: node
verification: unverified
aliases: [pRender, Particle Render, PRN]
concepts: [data-domain, particle-set, rendering]
nodes: [pRender]
node_family: particles
inputs: [particle-set]
outputs: [image]
tasks: [particles, render, convert-domain]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
---

# pRender

Particle setを2D Imageへ変換するRenderer Nodeです。

## At a Glance

- **Family**: Particles / Render
- **Input domain**: Particle set
- **Output domain**: 2D Image
- **Core concepts**: domain conversion、particle rendering
- **Common tasks**: particle chainを通常の2D compositingへ戻す

## Inputs

### Particle set

pEmitterやparticle modifiersを通ったParticle setを受け取ります。

## Output

rasterized 2D Imageを出力します。

## Controls

render style、motion blur、camera / depth等に関わるcontrolがある系統ですが、exact 21.1 UIは未検証です。

## Behavior / Notes

pRenderはParticle setを通常のImage Nodeへ直接渡すための**domain boundary**として読みます。

```text
pEmitter → pTurbulence → pRender → Merge
```

## Minimal Examples

Particle chainをpRenderでImageへ変換し、その後2D Mergeへ接続します。

## Related Concepts

- [Data domainを辿って診断する](../../learn/07-debugging/trace-data-domain)

## Related Patterns

Particle Patternは今後追加します。

## Similar / Adjacent Nodes

- Renderer 3D — Classic 3D scene → 2D Image
- uRenderer — USD scene → 2D Image

## Version / Verification Notes

pRenderのidentityとParticle set → 2D Image roleはlegacy-primary Fusion referenceで確認。21.1 exact controlsは未検証です。
