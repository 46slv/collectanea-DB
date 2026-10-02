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

## このページで分かること（Question）

Node同士を線で繋ぐとき、その線は何を意味しているのでしょうか。

## 基本の考え方（Mental Model）

Fusionのconnectionは、**upstream NodeのOutputをdownstream NodeのInputへ渡す依存関係**です。

```text
Node A Output
      ↓
  Connection
      ↓
Node B Input
```

「Node Aの次にNode Bが置いてある」ことより、どのOutputがどのInputへ入っているかを読みます。

## 最小例（Minimum Example）

```text
MediaIn → Transform → MediaOut
```

- MediaInがImageをOutputする。
- TransformがそのImageをInputとして受け取る。
- Transform OutputをMediaOutが受け取る。

## 共通ルール（Invariants）

- connectionはdata dependencyを表す。
- Nodeの画面上の位置は処理意味そのものではない。
- Inputごとに役割やデータ領域（data domain）がある。
- OutputとInputのdomainがcompatibleかを確認する。
- optional inputとrequired inputをNodeごとに分ける。

## 1つだけ変えて確認する（Change One Thing）

1本のconnectionだけを外し、どのdownstream 結果が変わるか確認します。

## 他のNodeへ応用する（Transfer）

### Single-input effect

Image → Effect → Imageという直列依存として読めます。

### Merge

複数Inputの役割をBackground / Foreground / Effect Maskへ分けて読みます。

### Specialized domain

Shape / Particle / 3D / USD / Deepでは、Output domainが通常Imageと異なることを確認します。

## 初見Nodeで予測する（Predict）

初見Nodeでも「何を受け取る／何を返す」を見れば、Graph内での役割を予測できます。

## よくある誤解（Common Misread）

**接続線は単に実行順を表す**と考えること。

重要なのは、何のdataがどのInputへ依存しているかです。

## 関連する再利用構成（Patterns）

- [Last Good / First BadでGraphを切る](../../patterns/debugging/last-good-first-bad)

## 関連Node

- [Node Reference](../../nodes/)
- [Connection / Data Types](../../index/connection-data-types)

## 次に読む

→ [中間結果をViewerで見る](./intermediate-results-viewer)
