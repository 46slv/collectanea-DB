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

## Question

Node同士を線で繋ぐとき、その線は何を意味しているのでしょうか。

## Mental Model

Fusionのconnectionは、**upstream NodeのOutputをdownstream NodeのInputへ渡す依存関係**です。

```text
Node A Output
      ↓
  Connection
      ↓
Node B Input
```

「Node Aの次にNode Bが置いてある」ことより、どのOutputがどのInputへ入っているかを読みます。

## Minimum Example

```text
MediaIn → Transform → MediaOut
```

- MediaInがImageをOutputする。
- TransformがそのImageをInputとして受け取る。
- Transform OutputをMediaOutが受け取る。

## Invariants

- connectionはdata dependencyを表す。
- Nodeの画面上の位置は処理意味そのものではない。
- Inputごとにroleやdata domainがある。
- OutputとInputのdomainがcompatibleかを確認する。
- optional inputとrequired inputをNodeごとに分ける。

## Change One Thing

1本のconnectionだけを外し、どのdownstream resultが変わるか確認します。

## Transfer

### Single-input effect

Image → Effect → Imageという直列依存として読めます。

### Merge

複数InputのroleをBackground / Foreground / Effect Maskへ分けて読みます。

### Specialized domain

Shape / Particle / 3D / USD / Deepでは、Output domainが通常Imageと異なることを確認します。

## Predict

初見Nodeでも「何を受け取る／何を返す」を見れば、Graph内での役割を予測できます。

## Common Misread

**接続線は単に実行順を表す**と考えること。

重要なのは、何のdataがどのInputへ依存しているかです。

## Related Patterns

- [Last Good / First BadでGraphを切る](../../patterns/debugging/last-good-first-bad)

## Node Reference

- [Node Reference](../../nodes/)
- [Connection / Data Types](../../index/connection-data-types)

## Next

→ [中間結果をViewerで見る](./intermediate-results-viewer)
