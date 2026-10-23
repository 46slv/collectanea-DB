---
title: Input / Output / Connection
description: Fusion FlowをNode名ではなく、typed OutputからInputへの依存関係として読む。
doc_type: concept
term_id: inputs-outputs-connections
term_short: typed dataをOutputからInputへ渡すNode間接続。
verification: partial
aliases: [Input, Output, Connection, port]
concepts: [node-graph, typed-connections, data-flow]
tasks: [read-graph, connect-nodes, debug]
prerequisites: [node-graph]
level: foundation
product_scope: fusion
---
# Input / Output / Connection

## このページで分かること

Node間の接続が何を表しているかを説明します。

## 基本の考え方

Fusionのconnectionは、**upstream NodeのOutputをdownstream NodeのInputへ渡す依存関係**です。

```text
Node A Output
      ↓
  Connection
      ↓
Node B Input
```

「Node Aの次にNode Bが置いてある」ことより、どのOutputがどのInputへ入っているかを読みます。

## 最小例

```text
MediaIn → Transform → MediaOut
```

- <Term id="media-in">MediaIn</Term>がImageをOutputする。
- <Term id="transform">Transform</Term>がそのImageをInputとして受け取る。
- Transform OutputをMediaOutが受け取る。

## 共通ルール

- connectionはdata dependencyを表す。
- Nodeの画面上の位置は処理意味そのものではない。
- Inputごとに役割やデータ領域（data domain）がある。
- OutputとInputのdomainがcompatibleかを確認する。
- optional inputとrequired inputをNodeごとに分ける。

## 1つずつ変えて確認する

1本のconnectionだけを外し、どのdownstream 結果が変わるか確認します。

## 他のNodeにも応用する

### Single-input effect

Image → Effect → Imageという直列依存として読めます。

#### 実機の参考例

<!-- capture-reuse:R15 -->

Loader1 → Transform1 → MediaOut1の画像接続です。左Viewerが入力、右がCenter 0.65／0.55、Size 1.25、Angle 12°の出力です。

[![S06の実機撮影例。Node Editorの接続](/img/fusion/captures/S06/graph.png)](/img/fusion/captures/S06/graph.png)

[![S06の実機撮影例。左右Viewerの比較](/img/fusion/captures/S06/compare.png)](/img/fusion/captures/S06/compare.png)

Resolve Studio 21.1.0.14／Windowsで撮影済みのS06を再利用した参考例です。本文のMediaInに相当する入力をLoaderで用意した参考例です。全端子の互換性を試したものではありません。 [元の撮影条件と確認範囲](/img/fusion/captures/S06/capture.json)

### Merge

複数Inputの役割をBackground / Foreground / Effect Maskへ分けて読みます。

### Specialized domain

Shape / Particle / 3D / USD / Deepでは、Output domainが通常Imageと異なることを確認します。

## 初見のNodeを読む

初見Nodeでも「何を受け取る／何を返す」を見れば、Graph内での役割を予測できます。

## よくある誤解

**接続線は単に実行順を表す**と考えること。

重要なのは、何のdataがどのInputへ依存しているかです。

## 関連パターン

- [Last Good / First BadでGraphを切る](../../patterns/debugging/last-good-first-bad)

## 関連Node

- [Node Reference](../../nodes/)
- [Connection / Data Types](../../index/connection-data-types)

## 次に読む

→ [中間結果をViewerで見る](./intermediate-results-viewer)
