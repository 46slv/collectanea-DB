---
title: Ellipse Mask
description: 円・楕円形状のMaskを生成する基本Mask Node。
doc_type: node
verification: unverified
aliases: [Ellipse, Ellipse Mask, ELP]
concepts: [mask-data, normalized-coordinates]
nodes: [Ellipse Mask]
node_family: masks
outputs: [mask]
tasks: [mask, circle, ellipse, isolate-effect]
level: foundation
product_scope: fusion
suite_surfaces: [fusion]
---

# Ellipse Mask

円・楕円形状のMaskを生成するNodeです。

## At a Glance

- **Family**: Masks
- **Output**: Mask
- **Core concepts**: Mask data、2D coordinates、shape boundary
- **Common tasks**: 円形Mask、楕円Mask、effect範囲の制限

## Inputs

exact auxiliary input / combine behaviorはFusion 21.1で確認します。

## Output

楕円形状を表すMaskを出力します。

## Controls

位置・幅・高さ・境界／softness／invert等に相当するcontrol群を持つ系統ですが、21.1のexact label・default・rangeは未検証です。

このReferenceでは確認前のcontrol名を網羅表として固定しません。

## Behavior / Notes

Ellipse MaskはImage generatorではなくMask domainとして扱います。

```text
Ellipse Mask ──→ Effect Mask input
```

Imageとして表示したい場合は、MaskをどのImage処理へ渡すかを別に設計します。

## Minimal Examples

### Limit an effect

```text
Image → Effect → Output
          ↑
       Ellipse
```

## Related Concepts

- [Image / Mask / Dataを分ける](../../learn/02-data/image-mask-data)
- [Normalized Coordinates](../../learn/03-space/normalized-coordinates)

## Related Patterns

- [Maskで処理範囲を限定する](../../patterns/masking/limit-effect-with-mask)

## Similar / Adjacent Nodes

- Polygon Mask
- Rectangle Mask
- B-Spline Mask

## Version / Verification Notes

Ellipse Maskのidentityと「楕円／円形Mask」という役割はlegacy-primary Fusion referenceで確認。21.1 current presence、exact Inspector controls、border/solid/invert semanticsはhost/manual再確認対象です。
