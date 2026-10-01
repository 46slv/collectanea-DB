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

## Generators

- [Background](./generators/background)
- [Text+](./generators/text-plus)

## Transform / Format

- [Transform](./transform/transform)
- [Resize](./transform/resize)

## Masks

- [Ellipse Mask](./masks/ellipse-mask)
- [Polygon Mask](./masks/polygon-mask)

## Color

- [Brightness Contrast](./color/brightness-contrast)
- [Color Corrector](./color/color-corrector)

## Blur / Filter

- [Blur](./blur-filter/blur)

## Matte / Keying

- [Delta Keyer](./matte-keying/delta-keyer)

## Tracking

- [Planar Tracker](./tracking/planar-tracker)

## Classic 3D

- [Merge 3D](./3d/merge-3d)
- [Renderer 3D](./3d/renderer-3d)

## Particles

- [pEmitter](./particles/p-emitter)
- [pRender](./particles/p-render)

## Current sample coverage

現在の代表Referenceは **16 Node** です。

```text
Compositing   1
Generators    2
Transform     2
Masks         2
Color         2
Blur/Filter   1
Matte/Keying  1
Tracking      1
3D            2
Particles     2
              ──
Total        16
```

このsampleで、2D ImageだけでなくMask / tracking data / Classic 3D scene / Particle set / domain conversionまでmetadataとcross-linkを試しています。

まだ全Node catalogではありません。taxonomyはこのrepresentative setを元に育てます。
