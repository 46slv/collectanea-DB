---
title: Node GraphとViewer
description: NukeのNode Graph / Viewer経験をFusion Flow / Viewerへ移すときの共通点と差分。
doc_type: bridge
verification: partial
product_scope: fusion
familiar_apps: [nuke]
familiar_terms: [Node Graph, Viewer, node tree]
compare_topics: [node-graph, viewer, debugging]
suite_surfaces: [fusion]
tasks: [debug, inspect-output, translate-mental-model]
---

# Node GraphとViewer

## If you know Nuke

NukeではNode Graphの任意Node outputをViewerへ接続し、tree途中の結果を確認できます。

Group内のNodeもGroup View等から編集・Viewer接続できます。

## First decision in Resolve

Fusionへ入ったら、Timeline layer stackへ戻して考えるより、Nukeと同じくGraphのdata flowを先に読みます。

## Fusion mental model

```text
source
  → processing
  → branch
  → Merge
  → output
```

選択NodeをViewerへ送り、中間結果を観察するdebugging habitはFusionでもそのまま役立ちます。

## What maps cleanly

- explicit node connections
- branch-based compositing
- intermediate Viewer inspection
- Groupで複雑さを局所化する
- Mergeで複数Imageをcompositeする

## What does not map 1:1

- node class / input namingは同一ではない。
- shortcut / scripting identityを移植しない。
- Nuke Viewer controlsとFusion Viewer UIを同一操作として扱わない。
- Group implementation / saved-tool formatは別。

## Learn this next

- [Graphとして考える](../../learn/01-flow/graph-as-flow)
- [Branchを分離して原因範囲を狭める](../../learn/07-debugging/isolate-branches)

## Reusable Patterns

- [Last Good / First BadでGraphを切る](../../patterns/debugging/last-good-first-bad)

## Relevant Nodes

- [Merge](../../nodes/compositing/merge)

## Example tasks

- [Viewerに何も表示されない](../../troubleshooting/viewer/nothing-visible)

## Related index entries

- [By Symptom](../../index/by-symptom)

---

Verification scope: Foundry current Viewer documentation confirms node-output-to-Viewer inspection; Fusion Viewer behavior is owned by canonical Fusion pages.
