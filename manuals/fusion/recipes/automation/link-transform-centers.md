---
title: 2つのTransform位置を連動する
description: 1つのTransform位置をmasterにし、別Transformをfollowerとして同期する構造を作る。
doc_type: recipe
verification: unverified
aliases: [link centers, sync position, linked transform]
concepts: [expressions, parameter-linking]
patterns: [master-follower-parameters]
nodes: [Transform]
tasks: [link-values, position, automate]
prerequisites: [expressions, transform-controls]
level: intermediate
product_scope: fusion
---

# 2つのTransform位置を連動する

> exact Expression syntaxはFusion 21.1 current Manual / host verification待ちです。このRecipeはmaster/follower structureを正本とします。

## Result

Transform Aのpositionを変更すると、Transform Bも同じposition関係を保つ構造を作ります。

## Requirements

- Transform A
- Transform B
- parameter linking method

## Steps

1. Transform Aをmasterと決めます。
2. Transform Bをfollowerと決めます。
3. followerのposition sourceをmasterへ向けます。
4. masterだけを変更し、followerが追従することを確認します。
5. local offsetが必要なら、master relationとは別にoffsetを持たせます。

```text
Transform A.Center = master

Transform B.Center
  = master
  + optional offset
```

## Why This Works

値そのものを複製するのではなく、parameter ownershipとrelationを1箇所へ集約します。

## Variants / Alternatives

- exact follow
- Xだけ共有
- Yだけ共有
- local offset付き
- User Controlをmasterにする

## Failure Checks

- master / followerが逆転していないか。
- circular referenceになっていないか。
- Point / scalar typeを混同していないか。
- Node rename後にreferenceが切れていないか。

## Related Pattern

- [Master / Follower parameterを作る](../../patterns/automation/master-follower-parameters)

## Related Nodes

- [Transform](../../nodes/transform/transform)
