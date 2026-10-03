---
title: 式（Expressions）
description: パラメータを別の値から計算し、値同士の関係を保つための考え方。
doc_type: concept
term_id: expressions
term_short: parameter値を式で別の値から計算し関係を保つ仕組み。
verification: unverified
aliases: [Expression, 式, parameter link]
concepts: [expressions, parameter-linking, derived-values]
nodes: [Transform, Merge]
tasks: [automate, link-values, derive-values]
prerequisites: [parameter-data, keyframes]
level: foundation
product_scope: fusion
suite_surfaces: [fusion]
---
# 式（Expressions）

> Expressionの具体的な構文例はFusion 21.1 Reference Manual / 実機で再確認前です。ここでは既存seedをConcept構造へ移したDraftとして扱います。

## このページで分かること

複数の値を毎回手で揃えず、値どうしの関係を記述する方法を説明します。

## 基本の考え方

Expressionは、パラメータへ最終値を直接固定する代わりに、**別の値や計算から結果を導く**ための仕組みとして考えます。

```text
source value
   ↓
expression / relation
   ↓
derived parameter
```

目的は「自動化すること」より、**どの値を基準となる値にして、どの値を従属させるか**を明確にすることです。

## 最小例

既存seedでは、別NodeのPoint パラメータを参照する例を次のように記述しています。

```lua
OtherTransform.Center
```

PointのX componentだけを参照する例:

```lua
OtherTransform.Center.X
```

同じNode内の値から派生させる例:

```lua
Width * 0.5
```

これらの正確な構文（syntax）は21.1で再検証するまで `unverified` とします。

## 共通ルール

Expressionを使うとき、Node名や式より先に次を決めます。

- どのパラメータが基準値か。
- どのパラメータが派生値か。
- 派生先が期待する型は何か。
- Node名の変更や構造変更で参照が壊れないか。
- 同じ関係をInstance / <Term id="modifier-parameter-sources">Modifier</Term> / User Controlで持つ方が適切ではないか。

## 1つずつ変えて確認する

基準値を1つだけ変更し、派生値が期待した関係を保つか確認します。

式自体と複数の参照元を同時に変えないことで、「参照が正しいか」「計算が正しいか」を分離できます。

## 他のNodeにも応用する

### Position 関係

複数要素の<Term id="center-pivot-size-angle">Center</Term>を同じ参照元から導き、位置関係を保つ設計へ転用できます。

### Proportional size

基準WidthやSizeから別の値を比率で計算する設計へ転用できます。

### Repeated spacing

最小値・最大値・index・個数を分け、等間隔配置のような関係を式で表す設計へ発展させられます。

## 初見のNodeを読む

Expressionを使う前に、次を予測できる状態を目指します。

1. 参照元を変えたとき何が連動するか。
2. 参照先が消えた／名前が変わったとき何が壊れるか。
3. 値の型が合わない場合にどこを見るか。
4. 式を増やすほど保守責任がどこへ集まるか。

## よくある誤解

**「同じ値にしたい = すべてExpression」と決めること。**

必要なのは値の関係です。Instance、Modifier、User Controlsなど別の再利用手段が適切な場合もあるため、責任の置き場所で選びます。

## Deepen

- [フレーム 評価](./frame-evaluation)
- [Modifier / パラメータ Sources](./modifier-parameter-sources)

## 関連パターン

- [Expressionで値の関係を保つ](../../patterns/automation/link-values-with-expression)
- [複数要素の位置関係を共有する](../../patterns/transform/share-position-across-elements)

## 関連Node

- [Transform](../../nodes/transform/transform)
- [Merge](../../nodes/compositing/merge)

## 次に読む

次はConceptを具体的な再利用構造へ落とします。

→ [Patterns](../../patterns/)
