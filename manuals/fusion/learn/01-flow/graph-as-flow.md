---
title: Graphとして考える
description: FusionのNode Graphを、処理の順番ではなく接続されたデータフローとして読む。
doc_type: concept
term_id: graph-as-flow
term_short: Node接続を処理順ではなくdata flowとして読む考え方。
verification: partial
aliases: [Flow, Node Graph, ノードグラフ]
concepts: [node-graph, evaluation-flow]
nodes: [Merge, Transform, Background]
tasks: [read-graph, debug]
level: foundation
product_scope: fusion
suite_surfaces: [fusion]
---
# Graphとして考える

## このページで分かること

FusionのFlowで「何がどこから来て、どこへ渡るか」を読む方法を説明します。

## 基本の考え方

Flowは、**Node同士の接続でデータの流れを記述するGraph**です。

画面上で左にあるか右にあるかより、どの出力がどの入力へ接続されているかを先に見ます。Blackmagic Designの現行Fusion紹介でも、Node treeはフローチャートとして説明され、各Nodeはeffect・generator・transform・maskなどの役割を持ち、出力と入力を接続して処理を組み立てます。

## 最小例

```text
MediaIn1 → Transform1 → MediaOut1
```

1. `<Term id="media-in">MediaIn</Term>1` が画像を供給する。
2. `<Term id="transform">Transform</Term>1` がその画像を受け取る。
3. `MediaOut1` へ結果を渡す。

選択したNodeをViewerで確認しながら、中間結果を1段ずつ見ると、Graphのどこで結果が変わったかを切り分けやすくなります。

## 共通ルール

Nodeが変わっても、まず次を確認します。

- upstreamのどの出力が来ているか。
- downstreamのどの入力へ渡しているか。
- そのNodeは画像を作るのか、変形するのか、合成するのか、範囲を制限するのか。
- Viewerで確認しているのはGraphのどの地点か。

**接続が処理関係を表し、配置位置は説明のためのレイアウトにすぎない**という読み方は、複雑なFlowでも変わりません。

## 1つずつ変えて確認する

`Transform1` の後に別のNodeを1つ追加し、そのNodeの前後をViewerで見比べます。

変えるのは1箇所だけにします。結果が変わる境界を特定できれば、「このNodeが何をしたか」をNode名だけに頼らず観察できます。

## 他のNodeにも応用する

### Transform family

1入力・1出力のNodeでは、まず「入力画像に何を加えて次へ渡すか」を読みます。

### Merge

複数入力を持つNodeでは、単に「前のNode」ではなく、**それぞれの入力が何の役割か**を確認します。MergeではForegroundとBackgroundの役割が分かれます。

### Generator

BackgroundのようなGeneratorは、必ずしも上流画像を必要とせず、Graphの途中から新しい画像を供給できます。

## 初見のNodeを読む

初見Nodeでも、次を予測してからInspectorを開けます。

1. 入力はいくつあるか。
2. 出力は何を返すか。
3. 画像を作る／変える／組み合わせる／制限する、のどれに近いか。
4. 前後をViewerで比べれば、どこまで挙動を特定できるか。

## よくある誤解

**Nodeを左から右へ並べた見た目そのものが処理順だと思うこと。**

読み取るべきなのは線で結ばれた接続です。整理されたFlowでは左右方向に並ぶことが多くても、Graphの意味は接続が持ちます。

## 関連パターン

- [画像を段階的に重ねる](../../patterns/compositing/stack-images-with-merge)

## 関連Node

- [Merge](../../nodes/compositing/merge)
- [Transform](../../nodes/transform/transform)
- [Background](../../nodes/generators/background)

## 次に読む

→ [Image / Mask / Dataを分ける](../02-data/image-mask-data)

---
検証メモ: 2026-10-02時点のBlackmagic Design公式Fusion紹介で、Node tree、接続、Viewerによる確認の基本を照合済み。Nodeごとの厳密な評価規則は別途Reference Manual / host検証対象です。
