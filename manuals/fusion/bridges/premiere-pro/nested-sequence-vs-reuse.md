---
title: Nested SequenceとResolve/Fusionの再利用境界
description: Premiere Nested Sequenceのtimeline reuseを、Fusion Group / Macro / Templateと単純等価せず整理する。
doc_type: bridge
verification: partial
product_scope: resolve
familiar_apps: [premiere-pro]
familiar_terms: [Nested Sequence, Nest, Sequence]
compare_topics: [nesting, reuse, timeline-structure, graph-structure]
suite_surfaces: [edit, fusion]
tasks: [reuse, nest, template]
---

# Nested SequenceとResolve/Fusionの再利用境界

## If you know Premiere Pro

Nested Sequenceは、別Sequenceをanother Sequence内へ置き、複数trackを含むsourceを1つのlinked clipとして扱う仕組みです。

source Sequenceを変更するとnested instanceへ反映されます。

## First decision in Resolve

PremiereでNestしていた理由を分類します。

- timelineを整理したい
- 複数clipを1単位でtrim / moveしたい
- 同じtimeline structureを再利用したい
- shot内部のVFX Graphをまとめたい
- reusable effect/titleとして配布したい

前半はEdit側、後半はFusion側の候補です。

## Fusion mental model

Fusion内では:

```text
editable graph boundary
  → Group

shared node settings
  → Instance

reusable packaged graph
  → Macro / Template
```

という別の責任があります。

## What maps cleanly

- complexityを局所化する
- repeated structureを再利用する
- 外側から扱いやすい単位を作る

## What does not map 1:1

- Nested Sequence = Fusion Group、ではない。
- Premiere Nestはtimeline/source Sequence relationship。
- Fusion GroupはNode Graph内部structure。
- Macro / Templateはpublic controlsとpackagingが中心。
- Instanceはparameter sharingであり、timeline nestingではない。

## Learn this next

- [GroupでGraphをまとめる](../../learn/06-reuse/groups)
- [Macro / Templateで再利用単位を作る](../../learn/06-reuse/macros-templates)
- [Fusion assetをResolveで再利用する](../../resolve-integration/reusable-fusion-assets)

## Reusable Patterns

- [再利用の境界を選ぶ](../../patterns/reuse/choose-reuse-boundary)

## Relevant Nodes

単一Nodeの比較ではありません。

## Example tasks

- [Text+をImageへ重ねる](../../recipes/text-graphics/text-over-image)

## Related index entries

- [By Familiar App](../../index/by-familiar-app)
- [By Resolve Surface](../../index/by-resolve-surface)

---

Verification scope: Adobe current nested-sequence documentation confirms nested Sequences act as linked clips and source changes propagate to nested instances.
