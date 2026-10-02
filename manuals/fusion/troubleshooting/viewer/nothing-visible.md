---
title: Viewerに何も表示されない
description: GraphのどこまでImageが届いているかを上流から分離して確認する診断手順。
doc_type: diagnostic
verification: partial
aliases: [何も表示されない, blank viewer, no output]
concepts: [node-graph, image-data]
tasks: [debug, inspect-output]
symptoms: [nothing-visible, no-output]
prerequisites: [node-graph]
level: foundation
product_scope: fusion
---

# Viewerに何も表示されない

## まず確認すること（Fast Checks）

1. Viewerへ表示しているNodeは、確認したいGraph地点か。
2. upstreamのImage 参照元を単体でViewerに出すと見えるか。
3. 1つdownstreamへ進めるたびに、どこで表示が消えるか。
4. Maskや合成を一旦外すとImageだけは見えるか。

Blackmagic Designの現行Fusion紹介では、選択したNodeを左右のViewerへ送って各地点の結果を確認する基本操作が案内されています。

## 原因を切り分ける（Isolate）

Graph全体を一度に直そうとせず、Image 参照元からOutputへ1段ずつ進みます。

```text
source
  ↓  見える？
node A
  ↓  見える？
node B
  ↓  見える？
output
```

「最後に正常だった地点」と「最初に壊れた地点」の間まで範囲を狭めます。

## 主な原因（Likely Causes）

### 見ているNodeが違う

Graphは正しくても、Viewerが別Nodeを表示している可能性があります。

### upstreamですでにImageがない

downstreamのNodeを調整する前に、参照元側から確認します。

### Maskで適用範囲を失っている

Maskを一時的に外し、Image 分岐自体が正常か確認します。

### 合成 役割が意図と違う

MergeのForeground / Backgroundを確認します。

## 修正方法（Fix）

原因が見つかった地点だけを修正し、前後のViewer結果を再確認します。

複数のNode・Mask・パラメータを同時に変更しないことが重要です。

## なぜ起きるか（Why）

Fusionは接続されたGraphとして読めるため、症状から推測するより「どの接続まではImageが存在するか」を観察した方が原因を小さくできます。

→ [Graphとして考える](../../learn/01-flow/graph-as-flow)

## バージョン・例外（Version / Exception Notes）

このページはGraph診断の一般手順です。Node固有のblank / alpha / Domain of Definition問題は、各Referenceまたは個別diagnosticへ分離します。

## 関連する症状（Related Symptoms）

- Maskを接続すると結果が消える
- Merge後だけ想定と違う
- Outputはあるが透明に見える
