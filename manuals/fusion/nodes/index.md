---
title: Node Reference
description: Fusion Nodeをfamily別に引くReference入口。
doc_type: index
verification: partial
product_scope: fusion
tasks: [lookup-node, inspect-controls]
---

# Node Reference

Node固有の入出力・control・例外を引くためのReferenceです。

一般概念は [Learn](../learn/) に、複数Nodeへ再利用する構成は [Patterns](../patterns/) に置きます。

## Compositing

- [Merge](./compositing/merge)
- [MultiMerge](./compositing/multi-merge)

## Generators

- [Background](./generators/background)
- [Text+](./generators/text-plus)

## Transform / Format

- [Transform](./transform/transform)
- [Resize](./transform/resize)

## Masks

- [Ellipse Mask](./masks/ellipse-mask)
- [Polygon Mask](./masks/polygon-mask)

## Color / Channel

- [Brightness Contrast](./color/brightness-contrast)
- [Color Corrector](./color/color-corrector)
- [Channel Boolean](./color/channel-boolean)

## Blur / Filter

- [Blur](./blur-filter/blur)

## Matte / Keying

- [Delta Keyer](./matte-keying/delta-keyer)
- [Matte Control](./matte-keying/matte-control)
- [Alpha Divide](./matte-keying/alpha-divide)
- [Alpha Multiply](./matte-keying/alpha-multiply)

## Tracking

- [Tracker](./tracking/tracker)
- [Planar Tracker](./tracking/planar-tracker)
- [Planar Transform](./tracking/planar-transform)

## Classic 3D

- [Merge 3D](./3d/merge-3d)
- [Renderer 3D](./3d/renderer-3d)

## Particles

- [pEmitter](./particles/p-emitter)
- [pRender](./particles/p-render)

## Shapes

- [sEllipse](./shapes/s-ellipse)
- [sRender](./shapes/s-render)

## USD

- [uMerge](./usd/u-merge)
- [uRenderer](./usd/u-renderer)

## Deep

- [dMerge](./deep/d-merge)
- [Deep to Image](./deep/deep-to-image)

## Utility / I/O

- [MediaIn](./utility-io/media-in)
- [MediaOut](./utility-io/media-out)

## Current sample coverage

現在の代表Referenceは **31 Node** です。

2D Image / Mask / tracking / Shape / Particle / Classic 3D / USD / Deep / channel / matte / premultiplication / multi-layer compositingに加え、Resolve timelineとのI/O boundaryまでcross-linkを試しています。

まだ全Node catalogではありません。taxonomyはこのrepresentative setを元に育てます。
