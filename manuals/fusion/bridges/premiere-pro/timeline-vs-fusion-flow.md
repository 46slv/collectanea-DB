---
title: TimelineとFusion Flow
description: PremiereのSequence/Timeline中心の編集から、Resolve EditとFusion Flowの責任分離へ読み替える。
doc_type: bridge
verification: partial
product_scope: resolve
familiar_apps: [premiere-pro]
familiar_terms: [Sequence, Timeline, Clip, Track]
compare_topics: [timeline, node-graph, editorial-vfx-boundary]
suite_surfaces: [edit, fusion]
tasks: [choose-surface, timeline, composite]
---

# TimelineとFusion Flow

## If you know Premiere Pro

Premiere ProではSequence / Timeline上にclipやtrackを配置し、trim・reorder・effect適用を行うのが中心です。

## First decision in Resolve

Resolveでは、まず仕事のscopeを分けます。

- clip順序・trim・timeline timing → Edit
- shot内部のVFX / motion graphics / compositing → Fusion

## Fusion mental model

FusionはTimelineの代替ではなく、shot内部の処理関係をNode Graphで表します。

```text
Edit Timeline
   ↓
  Clip
   ↓
 MediaIn
   ↓
Fusion Flow
   ↓
 MediaOut
```

## What maps cleanly

- source clipを使う
- transform / effectを適用する
- nested / grouped structureで複雑さを局所化する
- reusable effectを作る

## What does not map 1:1

- Premiere Track = Fusion branch、ではない。
- Premiere clip order = Nodeの左右位置、ではない。
- timeline trim / edit pointをFusion Nodeで置き換えない。
- Fusion Flow内部のMerge chainはeditorial track stackの単純な複製ではない。

## Learn this next

- [Edit ↔ Fusionの境界](../../resolve-integration/edit-fusion-boundary)
- [Graphとして考える](../../learn/01-flow/graph-as-flow)

## Reusable Patterns

- [画像を段階的に重ねる](../../patterns/compositing/stack-images-with-merge)

## Relevant Nodes

- [Merge](../../nodes/compositing/merge)
- [Transform](../../nodes/transform/transform)

## Example tasks

- [2つのImageを重ねる](../../recipes/compositing/two-image-merge)

## Related index entries

- [By Resolve Surface](../../index/by-resolve-surface)
- [By Task](../../index/by-task)

---

Verification scope: Adobe current Premiere nesting documentation establishes Sequence/Nested Sequence as timeline constructs; Fusion-specific boundary is owned by Resolve Integration.
