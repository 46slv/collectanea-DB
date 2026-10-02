---
title: Graphが評価される依存関係
description: FusionがOutput requestから必要なupstream dataを評価するGraphとして動くことを理解する。
doc_type: concept
verification: partial
aliases: [evaluation, dependency graph, render request]
concepts: [evaluation-flow, dependency, render-request]
tasks: [read-graph, debug, performance]
prerequisites: [typed-connections]
level: intermediate
product_scope: fusion
---

# Graphが評価される依存関係

## このページで分かること

Flow内のNodeが、どの順序・依存関係で評価されるかを整理します。

## 基本の考え方

Fusionを、**downstream 結果に必要なupstream dataを依存関係に従って評価するGraph**として考えます。

```text
requested output
      ↓ needs
Node C
      ↓ needs
Node B
      ↓ needs
Node A
```

Nodeの画面位置や作成順より、connectionとrender requestが重要です。

## 最小例

分岐が2本あるFlowで、一方だけがMediaOutへ繋がっている状態を考えます。

「Flowに存在する」ことと「現在のOutput計算に必要」ということを分けます。

## 共通ルール

- connectionがdependencyを作る。
- 現在の Viewer / MediaOut / render requestによって必要段階が決まる。
- フレーム/timeも評価条件の一部。
- rendererが常にフレーム順に評価するとは仮定しない。
- 性能を見るときも「Node数」より実際に要求されるdata / region / フレームを考える。

## 1つずつ変えて確認する

unused 分岐をMediaOut側へ接続／切断し、どの結果が依存するかを比較します。

## 他のNodeにも応用する

### アニメーション

現在の フレームによってパラメータ 評価が変わります。

### DoD / RoI

必要なImage regionが評価範囲に影響します。

### Specialized domain

renderer / converterまでdomain dependencyを維持します。

## 初見のNodeを読む

「Flowにあるのに効かない」「一部分岐だけ重い」等の症状で、connection / request / 現在の timeを確認できます。

## よくある誤解

**NodeがFlowに置かれていれば必ず最終Outputへ影響する**と考えること。

Outputへのdependency chainに入っているかを確認します。

## 関連パターン

- [Last Good / First BadでGraphを切る](../../patterns/debugging/last-good-first-bad)

## 関連Node

- [MediaOut](../../nodes/utility-io/media-out)

## 次に読む

時間方向の評価:
→ [フレーム 評価](../05-time/frame-evaluation)
