---
title: Expressionが期待どおり更新されない
description: Expression syntaxだけでなく、参照先・parameter source・type・timeを分離して診断する。
doc_type: diagnostic
verification: partial
aliases: [Expressionが効かない, expression not updating]
concepts: [expression, parameter-source, frame-evaluation]
tasks: [debug, automate, link-values]
symptoms: [expression-not-working, value-not-updating]
prerequisites: [expressions, parameter-source]
level: intermediate
product_scope: fusion
---

# Expressionが期待どおり更新されない

## Fast Checks

1. Expressionが参照するNode / parameterは現在も存在するか。
2. 参照先をrenameしていないか。
3. scalar / Point等、値のtypeは合っているか。
4. source parameterを直接変更すると値は変わるか。
5. current frameを変えたときsource側はどう評価されるか。

## Isolate

複雑な式を一度に直さず、最小の参照関係へ戻します。

```text
source parameter
      ↓
simple relation
      ↓
target parameter
```

source → targetの1段だけで期待値が出ることを確認してから計算を増やします。

## Likely Causes

### Reference pathが変わった

Node renameや構造変更で参照identityが変わった可能性があります。

### Typeが合わない

Point全体をscalar controlへ渡す等、parameter typeの不一致です。

### 別のparameter sourceが責任を持っている

Modifier / keyframe / instance等との関係を確認します。

### Time-dependent source

参照先自体がcurrent frameによって変わる場合、固定値のつもりで診断しないようにします。

## Fix

1. source parameterを単独確認。
2. expressionを最小参照へ縮める。
3. typeを確認。
4. 1つずつ演算を戻す。
5. original use caseで再確認。

## Why

Expressionは「式」だけでなくparameter value sourceの1つです。

→ [Modifier / Parameter Sources](../../learn/05-time/modifier-parameter-sources)

## Version / Exception Notes

exact Expression syntax / function availabilityはFusion 21.1 current Manual / hostを優先します。

## Related Symptoms

- 値を入力しても戻る
- Node rename後に連動しない
- animation中だけExpression結果がおかしい
