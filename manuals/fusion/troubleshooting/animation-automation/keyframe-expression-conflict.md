---
title: KeyframeとExpressionが競合している
description: 同じparameterへ複数sourceが関与しているとき、最終valueのownerを特定してanimation競合を診断する。
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

## Fast Checks

1. 同じparameterにKeyframeとExpressionの両方が関わっていないか。
2. Modifier / tracking / instance等、別sourceも存在しないか。
3. Inspector上の値を手入力すると戻るか。
4. sourceを1つ外すと期待どおり動くか。
5. base layoutとanimation offsetを同じparameterへ押し込んでいないか。

## Isolate

parameter sourceを1つずつ減らします。

```text
static
keyframe
expression
modifier
tracking
```

最終valueを誰が所有するかを特定します。

## Likely Causes

### Expressionが最終valueを決めている

手入力やKeyframeの期待がExpression relationと競合しています。

### Modifier / trackingが駆動している

別sourceがvalueを供給している可能性があります。

### baseとmotionが混在

static layout変更とanimationが同じownerへ集中しています。

## Fix

1. 必要なsourceを1つ決める。
2. base / animation / derived relationを分離する。
3.不要なsourceを外す。
4. 1 parameterだけで確認する。
5. 元のGraphへ戻す。

## Why

parameter valueは複数source候補を持つため、「見えている数値」だけではownershipを判断できません。

→ [Modifier / Parameter Sources](../../learn/05-time/modifier-parameter-sources)

## Version / Exception Notes

exact UI上のsource表示・Expression解除操作はFusion 21.1 current documentationを優先します。

## Related Symptoms

- 値を入力しても戻る
- Keyframeを打っても動かない
- Expressionを追加したら既存animationが変わった
