---
title: Nukeから来た人へ
description: NukeのNode Graph・Merge・Viewer・Group/Gizmoの経験を、Fusionの対応する概念へ読み替える入口。
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

NukeとFusionはどちらもNode Graph中心の合成環境なので、AE / Photoshop / Premiereより考え方を移しやすい部分があります。

ただしNode名・input 役割・alpha semantics・Group/Gizmo パッケージ化を同一仕様だとは扱いません。

## 対応表

| Nukeで知っているもの | Fusionで読む先 |
|---|---|
| Node Graph / Viewer | [Node GraphとViewer](./node-graph-viewer) |
| Merge | [Merge / Mask / Alphaの読み替え](./merge-mask-alpha) |
| Group / Gizmo | [Group / GizmoとFusion再利用構造](./group-gizmo-vs-reuse) |
| premultiplied 合成 | [プリマルチプライ（Premultiplication）](../../learn/04-compositing/premultiplication) |
| 分岐 診断 | [Last Good / First Bad](../../patterns/debugging/last-good-first-bad) |

## 注意点

Nuke MergeのA/B input namingとFusion MergeのForeground/Background namingは同一ではありません。

Nuke Group / GizmoとFusion Group / Macroも、似た目的はあってもfile/runtime semanticsが異なります。

---

検証範囲: Foundryの現行Nuke資料（Node Graph / Group / Gizmo / Merge）と、このマニュアル内の関連するFusionページを照合しています。
