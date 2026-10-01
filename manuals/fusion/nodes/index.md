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
- Channel Boolean — 未作成

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

## Current sample coverage

現在の代表Referenceは10件です。

```text
Compositing  1
Generators   2
Transform    2
Masks        2
Color        2
Blur/Filter  1
             ──
Total       10
```

この10件で、次のmetadata vocabularyを実地に試しています。

- node family
- data domain / input / output
- concepts
- tasks
- controls
- verification state
- adjacent node links

まだtaxonomyを固定しません。設計上は10〜20 Node程度を使って検索・Indexのfacetが実際に役立つことを確認してから、生成Indexへ移行します。
