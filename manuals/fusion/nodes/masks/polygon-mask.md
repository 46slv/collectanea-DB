---
title: Polygon Mask
description: Bezier pathで任意形状のMaskを作る基本Mask Node。
doc_type: node
verification: unverified
aliases: [Polygon, Polygon Mask, PLY]
concepts: [mask-data, bezier-path]
nodes: [Polygon Mask]
node_family: masks
outputs: [mask]
tasks: [mask, roto, bezier, isolate-effect]
level: foundation
product_scope: fusion
suite_surfaces: [fusion]
---

# Polygon Mask

Bezier pathで任意形状のMaskを作るNodeです。

## At a Glance

- **Family**: Masks
- **Output**: Mask
- **Core concepts**: Mask data、Bezier path、point animation
- **Common tasks**: freeform mask、roto、effect範囲の制限

## Inputs

exact auxiliary input / combine behaviorはFusion 21.1で確認します。

## Output

Polygon pathで定義したMaskを出力します。

## Controls

path points、shape closure、soft edge、level / invert等に関連するcontrolがある系統ですが、exact 21.1 label・defaultは未検証です。

## Behavior / Notes

Polygon Maskの中心的な責任は「Imageを描くこと」ではなく「処理範囲となるMask shapeを定義すること」です。

point animationを扱う場合も、Mask domainと時間変化を分けて読みます。

## Minimal Examples

### Freeform effect mask

```text
Polygon Mask ──→ Effect Mask
Image ─────────→ Effect → Output
```

## Related Concepts

- [Image / Mask / Dataを分ける](../../learn/02-data/image-mask-data)
- [Keyframe / Spline / Time](../../learn/05-time/keyframes-spline-time)

## Related Patterns

- [Maskで処理範囲を限定する](../../patterns/masking/limit-effect-with-mask)

## Similar / Adjacent Nodes

- Ellipse Mask
- B-Spline Mask
- MultiPoly

MultiPolyは別Toolであり、Polygon Maskの単純な複数版として固定しません。

## Version / Verification Notes

Polygon MaskのidentityとBezier polygon maskという役割はlegacy-primary Fusion referenceで確認。21.1 exact path controls / modifiers / combine semanticsは未検証です。
