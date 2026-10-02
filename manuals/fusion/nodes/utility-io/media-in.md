---
title: MediaIn
description: Resolve timeline / Media Pool側のsourceをFusion Flowへ渡すResolve-integrated input Node。
doc_type: node
verification: partial
aliases: [MediaIn, Media In]
concepts: [image-data, resolve-integration, source-boundary]
nodes: [MediaIn]
node_family: utility-io
outputs: [image]
tasks: [source, import, cross-page-workflow]
level: foundation
product_scope: resolve
suite_surfaces: [edit, fusion]
---

# MediaIn

Resolve側のmedia / timeline clipをFusion Flowへ渡すinput Nodeです。

## At a Glance

- **Family**: Utility / I/O
- **Output domain**: 2D Image / source media result
- **Core concepts**: Resolve integration、source boundary
- **Common tasks**: timeline clipをFusionで処理する入口

## Inputs

通常はResolve側のclip / media contextから供給されるため、Fusion Flow上で別Imageをprimary inputへ接続するsource Nodeとしては扱いません。

exact host-generated controlsはcurrent Resolve / Fusion contextを確認します。

## Output

Fusion Flowで処理するImage sourceを出力します。

## Controls

clip / media / trim / global in-out等に関するhost-linked surfaceがありますが、exact 21.1 Inspector / control availabilityはcontext依存として扱います。

## Behavior / Notes

Blackmagic Designの現行Fusion documentationでは、MediaInはEdit Page timeline上のclipを表す入口として説明されています。

```text
Edit Timeline Clip
      ↓
   MediaIn
      ↓
 Fusion Flow
```

Fusion StudioのLoaderと、Resolve-integrated MediaInを同一Nodeとして扱いません。

## Minimal Examples

```text
MediaIn → Transform → MediaOut
```

## Related Concepts

- [Graphとして考える](../../learn/01-flow/graph-as-flow)
- [Image / Mask / Dataを分ける](../../learn/02-data/image-mask-data)

## Related Patterns

- [Last Good / First BadでGraphを切る](../../patterns/debugging/last-good-first-bad)

## Similar / Adjacent Nodes

- Loader — Fusion Studio / file source系
- MediaOut — Resolveへのoutput boundary

## Version / Verification Notes

MediaInがEdit timeline clipをFusionへ渡すboundaryであることはBlackmagic Design現行Fusion documentationで確認。exact 21.1 host controlsはproject/context依存として未固定です。
