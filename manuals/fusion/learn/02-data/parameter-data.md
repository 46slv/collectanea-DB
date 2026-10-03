---
title: パラメータ / データ（Parameter / Data）
description: Center・Blend・Size等のcontrol 値をImage/Maskとは別のdataとして理解する。
doc_type: concept
verification: partial
aliases: [Parameter, Data, control value, scalar, Point]
concepts: [parameter-data, parameter-source, typed-data]
tasks: [animate, automate, link-values, debug]
prerequisites: [typed-connections]
level: foundation
product_scope: fusion
---

# パラメータ / Data

## このページで分かること

CenterやBlendのような値とImage connectionの違いを整理します。

## 基本の考え方

パラメータはNodeの挙動を決める**control data**です。

代表的な形:

- scalar number
- Point / vector
- boolean
- text/string
- choice / enum-like 値
- time-dependent evaluated 値

```text
parameter source
      ↓
  control value
      ↓
  Node behavior
```

## 最小例

TransformのCenterを考えます。

ImageはTransformのImage Inputへ入り、Centerは「そのImageをどこへ配置するか」を決めるPoint 値です。

ImageとCenterは別dataです。

## 共通ルール

- Image connectionとパラメータ 値を分ける。
- パラメータ typeを確認する。
- static値・keyframe・Expression・Modifier等、値の供給元を分ける。
- 基準となる値を複数箇所へ作らない。
- final displayed 値だけでなく「誰が値を供給しているか」を見る。

## 1つずつ変えて確認する

Centerを固定値からExpression-driven 値へ変え、Image connectionは固定したまま比較します。

## 他のNodeにも応用する

### アニメーション

Keyframe splineがtimeから値を供給します。

### Expressions

別パラメータや計算から値を導きます。

### トラッキング

トラッキング 結果をposition / transform controlへ適用します。

## 初見のNodeを読む

「値を入力しても戻る」「勝手に動く」「同期する」症状で、パラメータの供給元を確認すべきだと判断できます。

## よくある誤解

**Inspectorに見える最終数値だけがパラメータそのもの**と考えること。

Expression / Modifier / アニメーション等が値を供給している場合があります。

## 関連パターン

- [Expressionで値の関係を保つ](../../patterns/automation/link-values-with-expression)

## 関連Node

- [Transform](../../nodes/transform/transform)
- [Controls / Parameters](../../index/controls-parameters)

## 次に読む

→ [接続できるdata / 接続できないdata](./connection-compatibility)
