---
title: Parameter / Data
description: Center・Blend・Size等のcontrol valueをImage/Maskとは別のdataとして理解する。
doc_type: concept
verification: partial
aliases: [Parameter, Data, control value, scalar, Point]
concepts: [parameter-data, parameter-source, typed-data]
tasks: [animate, automate, link-values, debug]
prerequisites: [typed-connections]
level: foundation
product_scope: fusion
---

# Parameter / Data

## Question

CenterやBlendのような値は、Image connectionと同じものなのでしょうか。

## Mental Model

ParameterはNodeの挙動を決める**control data**です。

代表的な形:

- scalar number
- Point / vector
- boolean
- text/string
- choice / enum-like value
- time-dependent evaluated value

```text
parameter source
      ↓
  control value
      ↓
  Node behavior
```

## Minimum Example

TransformのCenterを考えます。

ImageはTransformのImage Inputへ入り、Centerは「そのImageをどこへ配置するか」を決めるPoint valueです。

ImageとCenterは別dataです。

## Invariants

- Image connectionとparameter valueを分ける。
- parameter typeを確認する。
- static値・keyframe・Expression・Modifier等、value sourceを分ける。
- source of truthを複数箇所へ作らない。
- final displayed valueだけでなく「誰が値を供給しているか」を見る。

## Change One Thing

Centerをstatic valueからExpression-driven valueへ変え、Image connectionは固定したまま比較します。

## Transfer

### Animation

Keyframe splineがtimeからvalueを供給します。

### Expressions

別parameterや計算からvalueを導きます。

### Tracking

tracking resultをposition / transform controlへ適用します。

## Predict

「値を入力しても戻る」「勝手に動く」「同期する」症状で、parameter sourceを確認すべきだと判断できます。

## Common Misread

**Inspectorに見える最終数値だけがparameterの正本**と考えること。

Expression / Modifier / animation等が値を供給している場合があります。

## Related Patterns

- [Expressionで値の関係を保つ](../../patterns/automation/link-values-with-expression)

## Node Reference

- [Transform](../../nodes/transform/transform)
- [Controls / Parameters](../../index/controls-parameters)

## Next

→ [接続できるdata / 接続できないdata](./connection-compatibility)
