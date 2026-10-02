---
title: Expressionが期待どおり更新されない
description: Expression syntaxだけでなく、参照先・パラメータの供給元・type・timeを分離して診断する。
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

## まず確認すること

1. Expressionが参照するNode / パラメータは現在も存在するか。
2. 参照先をrenameしていないか。
3. scalar / Point等、値のtypeは合っているか。
4. 参照元 パラメータを直接変更すると値は変わるか。
5. 現在の フレームを変えたとき参照元側はどう評価されるか。

## 原因の切り分け

複雑な式を一度に直さず、最小の参照関係へ戻します。

```text
参照元パラメータ
      ↓
simple relation
      ↓
対象パラメータ
```

参照元 → 対象の1段だけで期待値が出ることを確認してから計算を増やします。

## 主な原因

### Reference pathが変わった

Node名の変更や構造変更で参照identityが変わった可能性があります。

### Typeが合わない

Point全体をscalar controlへ渡す等、パラメータ typeの不一致です。

### 別のパラメータの供給元が責任を持っている

Modifier / keyframe / instance等との関係を確認します。

### Time-dependent 参照元

参照先自体が現在の フレームによって変わる場合、固定値のつもりで診断しないようにします。

## 修正方法

1. 参照元 パラメータを単独確認。
2. expressionを最小参照へ縮める。
3. typeを確認。
4. 1つずつ演算を戻す。
5. original use caseで再確認。

## なぜ起きるか

Expressionは「式」だけでなくパラメータ 値の供給元の1つです。

→ [Modifier / パラメータ Sources](../../learn/05-time/modifier-parameter-sources)

## バージョン・例外

正確な Expression syntax / function availabilityはFusion 21.1 現在の Manual / 実機を優先します。

## 関連する症状

- 値を入力しても戻る
- Node名の変更後に連動しない
- アニメーション中だけExpression結果がおかしい
