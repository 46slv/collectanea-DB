---
title: Planar Tracker
description: 平面領域を追跡し、Corner PinやPlanar Transform等へ利用するTracking Node。
doc_type: node
verification: unverified
aliases: [Planar Tracker]
concepts: [tracking, coordinate-space, parameter-data]
nodes: [Planar Tracker]
node_family: tracking
inputs: [image]
tasks: [track, planar-track, screen-replace, stabilize]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
---

# Planar Tracker

平面として扱える領域のmotionを追跡するTracking Nodeです。

## At a Glance

- **Family**: Tracking
- **Primary source**: 2D Image
- **Core concepts**: planar motion、tracking data、coordinate transfer
- **Common tasks**: screen / sign replacement、planar match move、stabilize、Corner Pin

## Inputs

### Image

追跡対象の2D Imageを受け取ります。

## Output

Image処理とtracking resultを扱うToolですが、21.1 exact Output port / exported data mechanismはこのReferenceでは未固定です。

## Controls

tracking region、motion model、track range、reference time等に相当するcontrolがありますが、exact 21.1 UIは未検証です。

## Behavior / Notes

重要なのは「追跡した」ことより、**どのspaceのtracking dataを、どのdownstream controlへ適用するか**です。

Planar TrackerのresultをPlanar TransformやCorner Pinへ使う場合も、trackingとapplicationを別責任として読みます。

## Minimal Examples

```text
Footage
  → Planar Tracker
  → tracking data / derived transform
  → replacement graphic
```

## Related Concepts

- [Data domainを辿って診断する](../../learn/07-debugging/trace-data-domain)
- [Center / Pivot / Size / Angle](../../learn/03-space/center-pivot-size-angle)

## Related Patterns

Tracking Patternは今後追加します。

## Similar / Adjacent Nodes

- Tracker
- Planar Transform
- Camera Tracker

## Version / Verification Notes

Planar Trackerのidentityとplanar region tracking → Corner Pin / Planar Transform用途はlegacy-primary Fusion referenceで確認。21.1 exact controls / data exportは未検証です。
