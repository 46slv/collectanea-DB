---
title: Nested SequenceとResolve/Fusionの再利用境界
description: Premiere ProのNested Sequenceによるtimeline再利用を、Fusion Group / Macro / Templateと単純に対応づけず整理する。
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

## Premiere Proで知っている考え方

Nested Sequenceは、別のSequenceをSequence内へ配置し、複数trackを含む参照元を1つのリンクされたClipとして扱う仕組みです。

参照元 Sequenceを変更するとnested instanceへ反映されます。

## Resolveではどこで扱うか

PremiereでNestしていた理由を分類します。

- timelineを整理したい
- 複数clipを1単位でtrim / moveしたい
- 同じtimeline 構造を再利用したい
- shot内部のVFX Graphをまとめたい
- reusable effect/titleとして配布したい

前半はEdit側、後半はFusion側の候補です。

## Fusionでの考え方

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

## 共通する考え方

- complexityを局所化する
- repeated 構造を再利用する
- 外側から扱いやすい単位を作る

## そのまま対応しない点

- Nested Sequence = Fusion Group、ではない。
- Premiere Nestはtimeline/参照元 Sequence relationship。
- Fusion GroupはNode Graph内部構造。
- Macro / Templateでは、利用者へ見せるControlとパッケージ化が中心です。
- Instanceはパラメータ sharingであり、timeline nestingではない。

## 次に読む

- [GroupでGraphをまとめる](../../learn/06-reuse/groups)
- [Macro / Templateで再利用単位を作る](../../learn/06-reuse/macros-templates)
- [Fusion assetをResolveで再利用する](../../resolve-integration/reusable-fusion-assets)

## 関連パターン

- [再利用の境界を選ぶ](../../patterns/reuse/choose-reuse-boundary)

## 関連Node

単一Nodeの比較ではありません。

## 具体例

- [Text+をImageへ重ねる](../../recipes/text-graphics/text-over-image)

## 関連する索引

- [By Familiar App](../../index/by-familiar-app)
- [By Resolve Surface](../../index/by-resolve-surface)

---

検証範囲: Adobeの現行Nested Sequence資料で、Nested SequenceがリンクされたClipとして扱われ、元Sequenceの変更が反映されることを確認しています。
