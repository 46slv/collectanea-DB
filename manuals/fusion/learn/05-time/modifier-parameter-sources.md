---
title: Modifier / Parameter Sources
description: パラメータ 値がstatic・keyframe・expression・modifier・トラッキング等のどこから供給されるかを読む。
doc_type: concept
verification: partial
aliases: [Modifier, parameter source, driven parameter]
concepts: [parameter-source, modifier, expression, keyframes]
tasks: [animate, automate, link-values, debug]
prerequisites: [frame-evaluation, expressions]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
---

# Modifier / パラメータ Sources

## このページで分かること

Inspectorに見えるパラメータが、どの値の供給元から決まるかを整理します。

## 基本の考え方

パラメータ 値の参照元は複数あります。

代表的には:

- 固定値
- keyframe spline
- path
- expression
- modifier
- audio / probe / トラッキング data
- host-linked パラメータ

```text
source
  ↓
parameter evaluation
  ↓
Node behavior
```

問題を診断するときは、最終値だけでなく「誰がその値を供給しているか」を確認します。

## 最小例

同じCenter controlについて、

1. 固定値
2. keyframe
3. Expression

の3方式を別々に考えます。

見た目が同じ位置でも、値の管理関係は異なります。

## 共通ルール

- パラメータには基準となる値がある。
- static値とdriven値を二重管理しない。
- ExpressionとInstanceを同じ共有仕組みとして扱わない。
- トラッキング / audio等のexternal dataは、どのspace / timeで適用されるか確認する。
- 値が期待と違う場合、controlを上書きする前に参照元を確認する。

## 1つずつ変えて確認する

パラメータの供給元を1つだけ外し、固定値へ戻して結果を比較します。

## 他のNodeにも応用する

### Expressions

別パラメータから値を計算する参照元として読めます。

### Keyframes

timeから値を供給する参照元として読めます。

### Modifiers

パラメータへprocedural / external dataを供給する層として読めます。

## 初見のNodeを読む

「数値を入力しても戻る」「勝手に動く」「他Nodeと同期する」症状で、値の供給元を調べるべきだと判断できます。

## よくある誤解

**Inspectorに表示された最終数値だけ見れば、なぜその値になったか分かる**と考えること。

値の参照元を辿らないと、ExpressionやModifierを上から手修正して一時的に壊す可能性があります。

## 関連パターン

- [Expressionで値の関係を保つ](../../patterns/automation/link-values-with-expression)
- [再利用の境界を選ぶ](../../patterns/reuse/choose-reuse-boundary)

## 関連Node

Modifier inventoryは今後Reference coverageを追加します。

## 次に読む

→ [Instanceで設定を共有する](../06-reuse/instances)

---

検証メモ: static / keyframe / path / expression / modifier / audio / トラッキング等がパラメータの供給元になり得ることはFusion 21系semantic baselineで確認。個別Modifierの正確な 挙動は現在の Referenceで確認します。
