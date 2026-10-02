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

> 正確な Expression syntaxはFusion 21.1 現在の Manual / ホスト上での確認待ちです。このRecipeはmaster/follower 構造を正本とします。

## できあがるもの（Result）

Transform Aのpositionを変更すると、Transform Bも同じposition関係を保つ構造を作ります。

## 必要なもの（Requirements）

- Transform A
- Transform B
- パラメータ linking method

## 手順（Steps）

1. Transform Aをmasterと決めます。
2. Transform Bをfollowerと決めます。
3. followerのposition 参照元をmasterへ向けます。
4. masterだけを変更し、followerが追従することを確認します。
5. 個別オフセットが必要なら、master 関係とは別にoffsetを持たせます。

```text
Transform A.Center = master

Transform B.Center
  = master
  + optional offset
```

## なぜこの構成にするか（Why This Works）

値そのものを複製するのではなく、パラメータの管理関係と関係を1箇所へ集約します。

## 別のやり方（Variants / Alternatives）

- 正確な follow
- Xだけ共有
- Yだけ共有
- 個別オフセット付き
- User Controlをmasterにする

## うまくいかないときの確認（Failure Checks）

- 親（Master）/ 追従（Follower）が逆転していないか。
- circular referenceになっていないか。
- Point / scalar typeを混同していないか。
- Node名の変更後にreferenceが切れていないか。

## 関連する再利用構成（Pattern）

- [親・追従パラメータ（Master / Follower）を作る](../../patterns/automation/master-follower-parameters)

## 関連Node

- [Transform](../../nodes/transform/transform)
