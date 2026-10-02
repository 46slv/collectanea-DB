---
title: Input / Output / Connection
description: Fusion FlowをNode名ではなく、typed OutputからInputへの依存関係として読む。
doc_type: concept
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

- MediaInがImageをOutputする。
- TransformがそのImageをInputとして受け取る。
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
