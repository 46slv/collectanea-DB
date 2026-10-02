---
title: Planar Transform
description: Planar Trackerのtracking dataを任意のImage / Maskへ適用するNode。
doc_type: node
verification: unverified
aliases: [Planar Transform]
concepts: [tracking, coordinate-space, parameter-data]
nodes: [Planar Transform]
node_family: tracking
inputs: [image]
outputs: [image]
tasks: [track, apply-track, attach-graphics]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
---

# Planar Transform

Planar Trackerで得たtracking dataを、任意のImage / Maskへ適用するためのNodeです。

## At a Glance

- **Family**: Tracking
- **Primary input**: Image / applicable data
- **Output**: transformed result
- **Core concepts**: tracking data、coordinate application
- **Common tasks**: replacement graphic追従、tracked transformの再利用

## Inputs

tracking transformを適用する対象を受け取る系統です。

exact Image / Mask compatibility、tracking data binding mechanismはFusion 21.1 current verification待ちです。

## Output

Planar tracking transformを反映したresultを出力します。

## Controls

tracking result / reference / transform-related controlsを持つ系統ですが、exact current UIは未検証です。

## Behavior / Notes

Planar Trackerが「solve」、Planar Transformが「apply」と責任分離できる構成として読むとdebugしやすくなります。

```text
Footage → Planar Tracker
                ↓ tracking data
Graphic → Planar Transform → Merge
```

## Minimal Examples

replacement graphicへPlanar Transformを適用し、tracking solveとgraphic local offsetを分けます。

## Related Concepts

- [Data domainを辿って診断する](../../learn/07-debugging/trace-data-domain)
- [Center / Pivot / Size / Angle](../../learn/03-space/center-pivot-size-angle)

## Related Patterns

- [Trackを解いてから適用先を分ける](../../patterns/tracking/solve-then-apply-track)

## Similar / Adjacent Nodes

- Planar Tracker
- Tracker
- Transform

## Version / Verification Notes

Planar TransformのidentityとPlanar Tracker dataを任意Image/Maskへ適用するroleはlegacy-primary Fusion referenceで確認。21.1 exact workflow / controlsは未検証です。
