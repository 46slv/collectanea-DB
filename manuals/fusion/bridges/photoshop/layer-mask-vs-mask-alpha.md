---
title: Layer MaskとFusion Mask / Alpha
description: Photoshop Layer Maskのhide/reveal modelから、FusionのMask data・Effect Mask・Image Alphaを分離して読む。
doc_type: bridge
verification: partial
product_scope: resolve
familiar_apps: [photoshop]
familiar_terms: [Layer Mask, transparency, mask]
compare_topics: [masking, alpha, effect-mask]
suite_surfaces: [fusion]
tasks: [mask, transparency, composite]
---

# Layer MaskとFusion Mask / Alpha

## If you know Photoshop

PhotoshopのLayer Maskは、Layerの一部をhide / revealするために使います。

Layer本体のpixelを直接削除せず、visibilityを非破壊に制御できるのが基本mental modelです。

## First decision in Resolve

Fusionで「どこを見せるか」を扱うとき、まず次を分けます。

- Image自身のAlpha
- Nodeのeffect範囲を制限するEffect Mask
- matte / keyingで作るalpha情報

## Fusion mental model

```text
Image RGB + Alpha
        ↓
   effect node
        ↑
  Effect Mask
```

Photoshop Layer Maskの経験は「処理範囲を別dataとして持つ」という発想には役立ちます。

ただしFusionではEffect MaskとImage Alphaは別責任です。

## What maps cleanly

- source Imageを直接破壊せず、範囲を別に持つ
- mask shapeを後から編集する
- visibility / effect areaを分離して考える

## What does not map 1:1

- Photoshop Layer Mask = Fusion Effect Mask、ではない。
- Fusion Effect Maskは必ずしもImage Alphaを書き換えない。
- keyingで作るmatteとEffect Maskも同一ではない。
- Mask Node自体は通常2D Imageではない。

## Learn this next

- [Image / Mask / Dataを分ける](../../learn/02-data/image-mask-data)
- [Alpha](../../learn/04-compositing/alpha)
- [AlphaとMaskを分けて診断する](../../learn/07-debugging/alpha-vs-mask)

## Reusable Patterns

- [Maskで処理範囲を限定する](../../patterns/masking/limit-effect-with-mask)

## Relevant Nodes

- [Ellipse Mask](../../nodes/masks/ellipse-mask)
- [Polygon Mask](../../nodes/masks/polygon-mask)
- [Merge](../../nodes/compositing/merge)

## Example tasks

- [Mergeの適用範囲をMaskで限定する](../../recipes/masking/limit-merge-with-mask)

## Related index entries

- [Connection / Data Types](../../index/connection-data-types)
- [By Symptom](../../index/by-symptom)

---

Verification scope: Adobe current Layer Mask documentation confirms hide/reveal behavior; Fusion-specific Mask / Alpha separation is owned by canonical Fusion concepts.
