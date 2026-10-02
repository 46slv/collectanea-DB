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

## Nukeで知っている考え方

NukeではNode Graphの任意Node outputをViewerへ接続し、tree途中の結果を確認できます。

Group内のNodeもGroup View等から編集・Viewer接続できます。

## Resolveで最初に決めること

Fusionへ入ったら、Timeline layer stackへ戻して考えるより、Nukeと同じくGraphのdata flowを先に読みます。

## Fusionでの考え方

```text
source
  → processing
  → branch
  → Merge
  → output
```

選択NodeをViewerへ送り、中間結果を観察する診断 habitはFusionでもそのまま役立ちます。

## そのまま活かしやすい考え方

- 明示的なNode接続
- 分岐-based 合成
- intermediate Viewer inspection
- Groupで複雑さを局所化する
- Mergeで複数Imageを合成する

## そのまま一対一対応しない部分

- node class / input namingは同一ではない。
- shortcut / scripting identityを移植しない。
- Nuke Viewer controlsとFusion Viewer UIを同一操作として扱わない。
- Group implementation / saved-tool formatは別。

## 次に読む

- [Graphとして考える](../../learn/01-flow/graph-as-flow)
- [分岐を分離して原因範囲を狭める](../../learn/07-debugging/isolate-branches)

## 関連する再利用構成（Patterns）

- [Last Good / First BadでGraphを切る](../../patterns/debugging/last-good-first-bad)

## 関連Node

- [Merge](../../nodes/compositing/merge)

## 具体例

- [Viewerに何も表示されない](../../troubleshooting/viewer/nothing-visible)

## 関連する索引

- [By Symptom](../../index/by-symptom)

---

検証範囲: Foundryの現行Viewer資料でNode出力をViewerで確認する考え方を確認しています。Fusion Viewerの具体的な挙動はFusionの正本ページを基準にします。
