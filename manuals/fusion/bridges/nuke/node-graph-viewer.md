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

## Resolveではどこで扱うか

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

### 実機の参考例

<!-- capture-reuse:R39 -->

Loader1の画像をTransform1へ渡し、左右Viewerで入力と変形後を表示しています。Viewer上部の対象名も接続と対応させて読みます。

[![S06の実機Node Editorの接続](/img/fusion/captures/S06/graph.png)](/img/fusion/captures/S06/graph.png)

[![S06の左右Viewerの比較](/img/fusion/captures/S06/compare.png)](/img/fusion/captures/S06/compare.png)

Resolve Studio 21.1.0.14／Windowsで撮影したS06の参考例です。Nukeの画面・ショートカットやGroup内部の操作は含みません。 [撮影条件と確認範囲](/img/fusion/captures/S06/capture.json)

## 共通する考え方

- 明示的なNode接続
- 分岐-based 合成
- intermediate Viewer inspection
- Groupで複雑さを局所化する
- Mergeで複数Imageを合成する

## そのまま対応しない点

- node class / input namingは同一ではない。
- shortcut / scripting identityを移植しない。
- Nuke Viewer controlsとFusion Viewer UIを同一操作として扱わない。
- Group implementation / saved-tool formatは別。

## 次に読む

- [Graphとして考える](../../learn/01-flow/graph-as-flow)
- [分岐を分離して原因範囲を狭める](../../learn/07-debugging/isolate-branches)

## 関連パターン

- [Last Good / First BadでGraphを切る](../../patterns/debugging/last-good-first-bad)

## 関連Node

- [Merge](../../nodes/compositing/merge)

## 具体例

- [Viewerに何も表示されない](../../troubleshooting/viewer/nothing-visible)

## 関連する索引

- [By Symptom](../../index/by-symptom)

---

検証範囲: Foundryの現行Viewer資料でNode出力をViewerで確認する考え方を確認しています。Fusion Viewerの具体的な挙動は、このマニュアル内のFusionページを基準にします。
