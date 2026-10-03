---
title: KeyframeとExpressionが競合している
description: 同じパラメータへ複数の供給元が関与しているとき、最終的な値の管理元を特定してアニメーションの競合を診断する。
doc_type: diagnostic
verification: partial
aliases: [keyframe expression conflict, animation conflict]
concepts: [parameter-source, keyframes, expressions]
patterns: [master-follower-parameters, base-and-animation-offset]
tasks: [debug, animate, automate]
symptoms: [animation-conflict, value-overridden]
prerequisites: [parameter-source]
level: intermediate
product_scope: fusion
---

# KeyframeとExpressionが競合している

## まず確認すること

1. 同じparameterにKeyframeとExpressionの両方が関わっていないか。
2. Modifier / トラッキング / instance等、別参照元も存在しないか。
3. Inspector上の値を手入力すると戻るか。
4. 参照元を1つ外すと期待どおり動くか。
5. base 配置とアニメーション offsetを同じparameterへ押し込んでいないか。

## 原因の切り分け

parameter 参照元を1つずつ減らします。

```text
static
keyframe
expression
modifier
tracking
```

最終値を誰が所有するかを特定します。

## 主な原因

### Expressionが最終値を決めている

手入力やKeyframeの期待がExpression 関係と競合しています。

### Modifier / トラッキングが駆動している

別参照元が値を供給している可能性があります。

### baseと動きが混在

static 配置変更とアニメーションが同じ管理元へ集中しています。

## 修正方法

1. 必要な参照元を1つ決める。
2. base / アニメーション / derived 関係を分離する。
3.不要な参照元を外す。
4. 1 parameterだけで確認する。
5. 元のGraphへ戻す。

## なぜ起きるか

parameter 値は複数参照元候補を持つため、「見えている数値」だけでは管理関係を判断できません。

→ [Modifier / Parameter Sources](../../learn/05-time/modifier-parameter-sources)

## バージョン・例外

正確なUI表記上の参照元表示・Expression解除操作はFusion 21.1 現在の資料を優先します。

## 関連する症状

- 値を入力しても戻る
- Keyframeを打っても動かない
- Expressionを追加したら既存アニメーションが変わった
