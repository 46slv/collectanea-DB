---
title: Tracker
description: point trackingを行い、Match Move / Stabilize等へ利用する基本Tracking Node。
doc_type: node
verification: unverified
aliases: [Tracker, TRA, Point Tracker]
concepts: [tracking, parameter-data, coordinate-space]
nodes: [Tracker]
node_family: tracking
inputs: [image]
outputs: [image]
tasks: [track, point-track, match-move, stabilize]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
---

# Tracker

point trackingを行い、Match Move / Stabilize等へ利用する基本Tracking Nodeです。

## At a Glance

- **Family**: Tracking
- **Primary input**: 2D Image
- **Core concepts**: point motion、tracking data
- **Common tasks**: point tracking、match move、stabilize

## Inputs

### Image

tracking対象の2D Imageを受け取ります。

## Output

tracking resultを持つToolですが、exact 21.1 Image output / data export mechanismはcurrent verification待ちです。

## Controls

tracker points、search / pattern region、match move / stabilize等に関わるcontrolを持つ系統ですが、exact 21.1 UI / defaultsは未検証です。

## Behavior / Notes

Planar Trackerが平面motionを解くのに対し、Trackerはpoint trackingを中心に扱います。

どちらを使うかは「何を追うか」と「結果をどのspaceへ適用するか」で選びます。

## Minimal Examples

footage上の特徴点をtrackし、そのmotionを別elementへ適用する構成を検討します。

## Related Concepts

- [Data domainを辿って診断する](../../learn/07-debugging/trace-data-domain)

## Related Patterns

- [Trackを解いてから適用先を分ける](../../patterns/tracking/solve-then-apply-track)

## Similar / Adjacent Nodes

- Planar Tracker
- Planar Transform
- Camera Tracker

## Version / Verification Notes

Trackerのidentityとpoint tracking / Match Move / Stabilize roleはlegacy-primary Fusion referenceで確認。21.1 exact controls / operation modesは未検証です。
