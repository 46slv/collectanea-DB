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

## Premiere Proで知っている考え方

Premiere ProではSequence / Timeline上にclipやtrackを配置し、trim・reorder・effect適用を行うのが中心です。

## Resolveではどこで扱うか

Resolveでは、まず仕事の対象範囲を分けます。

- clip順序・trim・timeline timing → Edit
- shot内部のVFX / モーショングラフィックス / 合成 → Fusion

## Fusionでの考え方

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

## 共通する考え方

- 元クリップ（参照元 clip）を使う
- transform / effectを適用する
- nested / grouped 構造で複雑さを局所化する
- reusable effectを作る

## そのまま対応しない点

- Premiere Track = Fusion 分岐、ではない。
- Premiere clip order = Nodeの左右位置、ではない。
- timeline trim / edit pointをFusion Nodeで置き換えない。
- Fusion Flow内部のMerge chainはeditorial track stackの単純な複製ではない。

## 次に読む

- [Edit ↔ Fusionの境界](../../resolve-integration/edit-fusion-boundary)
- [Graphとして考える](../../learn/01-flow/graph-as-flow)

## 関連パターン

- [画像を段階的に重ねる](../../patterns/compositing/stack-images-with-merge)

## 関連Node

- [Merge](../../nodes/compositing/merge)
- [Transform](../../nodes/transform/transform)

## 具体例

- [2つのImageを重ねる](../../recipes/compositing/two-image-merge)

## 関連する索引

- [By Resolve Surface](../../index/by-resolve-surface)
- [By Task](../../index/by-task)

---

検証範囲: Adobeの現行Premiere Pro資料でSequence / Nested SequenceがTimeline上の構造であることを確認しています。Fusionとの役割分担は「Resolveとの連携」を基準にします。
