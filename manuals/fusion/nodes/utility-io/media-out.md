---
title: MediaOut
description: Fusion Flowの最終2D ImageをResolve timeline / downstream workflowへ返すResolve-integrated output Node。
doc_type: node
verification: partial
aliases: [MediaOut, Media Out]
concepts: [image-data, resolve-integration, output-boundary]
nodes: [MediaOut]
node_family: utility-io
inputs: [image]
tasks: [output, cross-page-workflow]
level: foundation
product_scope: resolve
suite_surfaces: [fusion, edit]
---

# MediaOut

Fusion Flowの最終ImageをResolve側へ返すoutput Nodeです。

## At a Glance

- **Family**: Utility / I/O
- **Input domain**: 2D Image
- **Core concepts**: Resolve integration、output boundary
- **Common tasks**: Fusion resultをtimelineへ返す

## Inputs

### Image

Fusion compositionの最終resultとしてResolve側へ返す2D Imageを受け取ります。

## Output

Flow上の通常Image outputを下流Nodeへ渡すためのNodeというより、Resolve hostへresultを返すboundaryとして扱います。

## Controls

exact host-linked controlsはcurrent Resolve / Fusion contextで確認します。

## Behavior / Notes

Resolve 20 VFX Guideでは、MediaOutはfinal Fusion resultをEdit timelineへ送るoutputとして説明されています。

```text
MediaIn
  ↓
Fusion processing
  ↓
MediaOut
  ↓
Resolve Timeline
```

MediaOutを外した状態でViewerにImageが見えていても、それだけでtimelineへ正しくresultが返っているとは限りません。

## Minimal Examples

```text
MediaIn → Transform → MediaOut
```

## Related Concepts

- [Graphとして考える](../../learn/01-flow/graph-as-flow)

## Related Patterns

- [Last Good / First BadでGraphを切る](../../patterns/debugging/last-good-first-bad)

## Similar / Adjacent Nodes

- Saver — file/sequence output系
- MediaIn — ResolveからFusionへのinput boundary

## Version / Verification Notes

MediaOutがFusion resultをResolve timelineへ返すboundaryであることはBlackmagic Design公式Resolve 20 VFX Guideで確認。21.1 host-specific controlsは未固定です。
