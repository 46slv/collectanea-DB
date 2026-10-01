---
title: Modifier / Parameter Sources
description: parameter valueがstatic・keyframe・expression・modifier・tracking等のどこから供給されるかを読む。
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

# Modifier / Parameter Sources

## Question

Inspectorに見える1つのparameterは、常に手入力したstatic valueだけから決まるのでしょうか。

## Mental Model

parameter valueのsourceは複数あります。

代表的には:

- static value
- keyframe spline
- path
- expression
- modifier
- audio / probe / tracking data
- host-linked parameter

```text
source
  ↓
parameter evaluation
  ↓
Node behavior
```

問題を診断するときは、最終値だけでなく「誰がその値を供給しているか」を確認します。

## Minimum Example

同じCenter controlについて、

1. static value
2. keyframe
3. Expression

の3方式を別々に考えます。

見た目が同じ位置でも、value ownershipは異なります。

## Invariants

- parameterにはsource of truthがある。
- static値とdriven値を二重管理しない。
- ExpressionとInstanceを同じ共有mechanismとして扱わない。
- tracking / audio等のexternal dataは、どのspace / timeで適用されるか確認する。
- valueが期待と違う場合、controlを上書きする前にsourceを確認する。

## Change One Thing

parameter sourceを1つだけ外し、static valueへ戻して結果を比較します。

## Transfer

### Expressions

別parameterから値を計算するsourceとして読めます。

### Keyframes

timeから値を供給するsourceとして読めます。

### Modifiers

parameterへprocedural / external dataを供給する層として読めます。

## Predict

「数値を入力しても戻る」「勝手に動く」「他Nodeと同期する」症状で、value sourceを調べるべきだと判断できます。

## Common Misread

**Inspectorに表示された最終数値だけ見れば、なぜその値になったか分かる**と考えること。

値のsourceを辿らないと、ExpressionやModifierを上から手修正して一時的に壊す可能性があります。

## Related Patterns

- [Expressionで値の関係を保つ](../../patterns/automation/link-values-with-expression)
- [再利用の境界を選ぶ](../../patterns/reuse/choose-reuse-boundary)

## Node Reference

Modifier inventoryは今後Reference coverageを追加します。

## Next

→ [Instanceで設定を共有する](../06-reuse/instances)

---

Verification note: static / keyframe / path / expression / modifier / audio / tracking等がparameter sourceになり得ることはFusion 21系semantic baselineで確認。個別Modifierのexact behaviorはcurrent Referenceで確認します。
