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

## Question

FlowにNodeが並んでいるとき、常に左から右へ全Nodeが同じように実行されるのでしょうか。

## Mental Model

Fusionを、**downstream resultに必要なupstream dataを依存関係に従って評価するGraph**として考えます。

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

## Minimum Example

branchが2本あるFlowで、一方だけがMediaOutへ繋がっている状態を考えます。

「Flowに存在する」ことと「現在のOutput計算に必要」ということを分けます。

## Invariants

- connectionがdependencyを作る。
- current Viewer / MediaOut / render requestによって必要stageが決まる。
- frame/timeもevaluation条件の一部。
- rendererが常にframe順に評価するとは仮定しない。
- performanceを見るときも「Node数」より実際に要求されるdata / region / frameを考える。

## Change One Thing

unused branchをMediaOut側へ接続／切断し、どのresultが依存するかを比較します。

## Transfer

### Animation

current frameによってparameter evaluationが変わります。

### DoD / RoI

必要なImage regionがevaluation範囲に影響します。

### Specialized domain

renderer / converterまでdomain dependencyを維持します。

## Predict

「Flowにあるのに効かない」「一部branchだけ重い」等の症状で、connection / request / current timeを確認できます。

## Common Misread

**NodeがFlowに置かれていれば必ず最終Outputへ影響する**と考えること。

Outputへのdependency chainに入っているかを確認します。

## Related Patterns

- [Last Good / First BadでGraphを切る](../../patterns/debugging/last-good-first-bad)

## Node Reference

- [MediaOut](../../nodes/utility-io/media-out)

## Next

時間方向の評価:
→ [Frame Evaluation](../05-time/frame-evaluation)
