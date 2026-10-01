---
title: Resolutionを跨いでも位置関係を保つ
description: pixel距離とnormalized positionを分離し、resolution変更時にもlayout intentを保つPattern。
doc_type: pattern
verification: partial
aliases: [resolution-aware layout, pixel to normalized]
concepts: [normalized-coordinates, resolution, aspect-ratio]
patterns: [resolution-aware-positioning]
nodes: [Transform, Resize]
tasks: [position, layout, resize, align]
level: intermediate
product_scope: fusion
---

# Resolutionを跨いでも位置関係を保つ

## Problem Family

同じGraphを別resolutionで使うと、margin・offset・配置が意図せず変わる問題です。

## Concepts

- [Normalized Coordinates](../../learn/03-space/normalized-coordinates)
- [Resolution / Aspect](../../learn/03-space/resolution-aspect)

## Generic Graph

pixel基準のdesign intentを1箇所でnormalized valueへ変換します。

```text
desired pixel offset
      + reference width/height
              ↓
     normalized relation
              ↓
      Transform / layout
```

## Invariant

- pixel値とnormalized値を同じparameterとして扱わない。
- reference resolutionのownerを1箇所に置く。
- 複数Nodeで個別にpixel→normalized換算しない。
- Resize後のImage extentを明示する。

## Variants

### Relative layout

frame比率を保つことを優先し、normalized valueを直接使います。

### Fixed-pixel layout

一定pixel marginを保ちたい場合、current reference dimensionsからnormalized offsetを導きます。

### Mixed layout

major positionはrelative、stroke/marginはpixel intentとして分離します。

## Node Choices

Transformはposition/layout、Resizeはresolution contractを所有する候補です。

## Failure Modes

- 1920×1080前提の数値を4Kでもそのまま使う。
- ResizeとTransform Sizeを混同する。
- X/Yのreference dimensionsを逆にする。
- Pixel Aspect / non-square pixelを無視する。

## Recipes Using This Pattern

- [TransformでImageを移動する](../../recipes/layout/move-image-with-transform)

## Related Node Reference

- [Transform](../../nodes/transform/transform)
- [Resize](../../nodes/transform/resize)
