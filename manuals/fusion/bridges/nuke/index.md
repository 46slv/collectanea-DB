---
title: Nukeから来た人へ
description: NukeのNode Graph・Merge・Viewer・Group/Gizmo経験をFusionのcanonical conceptsへ翻訳する入口。
doc_type: index
verification: partial
product_scope: fusion
familiar_apps: [nuke]
familiar_terms: [Node Graph, Merge, Viewer, Group, Gizmo]
compare_topics: [node-graph, merge, viewer, grouping, reusable-tools]
suite_surfaces: [fusion]
tasks: [translate-mental-model]
---

# Nukeから来た人へ

NukeとFusionはどちらもNode Graph中心のcompositing環境なので、AE / Photoshop / Premiereよりmental modelを移しやすい部分があります。

ただしNode名・input role・alpha semantics・Group/Gizmo packagingを同一仕様だとは扱いません。

## Map

| Nuke starting point | Fusionへ進む |
|---|---|
| Node Graph / Viewer | [Node GraphとViewer](./node-graph-viewer) |
| Merge | [Merge / Mask / Alphaの読み替え](./merge-mask-alpha) |
| Group / Gizmo | [Group / GizmoとFusion再利用構造](./group-gizmo-vs-reuse) |
| premultiplied compositing | [Premultiplication](../../learn/04-compositing/premultiplication) |
| branch debugging | [Last Good / First Bad](../../patterns/debugging/last-good-first-bad) |

## Important

Nuke MergeのA/B input namingとFusion MergeのForeground/Background namingは同一ではありません。

Nuke Group / GizmoとFusion Group / Macroも、似たgoalはあってもfile/runtime semanticsが異なります。

---

Verification scope: Foundry current Nuke Node Graph / Group / Gizmo / Merge documentation and canonical Fusion pages.
