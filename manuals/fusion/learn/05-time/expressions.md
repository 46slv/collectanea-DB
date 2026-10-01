---
title: Expressions
description: parameterを別の値から計算し、値同士の関係を保つための考え方。
doc_type: concept
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

# Expressions

> Expressionの具体的な構文例はFusion 21.1 Reference Manual / hostで再確認前です。ここでは既存seedをConcept構造へ移したDraftとして扱います。

## Question

複数の値を「毎回手で合わせる」のではなく、関係そのものをどう記述すればよいでしょうか。

## Mental Model

Expressionは、parameterへ最終値を直接固定する代わりに、**別の値や計算から結果を導く**ための仕組みとして考えます。

```text
source value
   ↓
expression / relation
   ↓
derived parameter
```

目的は「自動化すること」より、**どの値をsource of truthにして、どの値を従属させるか**を明確にすることです。

## Minimum Example

既存seedでは、別NodeのPoint parameterを参照する例を次のように記述しています。

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

これらのexact syntaxは21.1で再検証するまで `unverified` とします。

## Invariants

Expressionを使うとき、Node名や式より先に次を決めます。

- どのparameterが基準値か。
- どのparameterが派生値か。
- 派生先が期待する型は何か。
- Node renameや構造変更で参照が壊れないか。
- 同じ関係をInstance / Modifier / User Controlで持つ方が適切ではないか。

## Change One Thing

基準値を1つだけ変更し、派生値が期待した関係を保つか確認します。

式自体と複数のsourceを同時に変えないことで、「参照が正しいか」「計算が正しいか」を分離できます。

## Transfer

### Position relation

複数要素のCenterを同じsourceから導き、位置関係を保つ設計へ転用できます。

### Proportional size

基準WidthやSizeから別の値を比率で計算する設計へ転用できます。

### Repeated spacing

最小値・最大値・index・個数を分け、等間隔配置のような関係を式で表す設計へ発展させられます。

## Predict

Expressionを使う前に、次を予測できる状態を目指します。

1. sourceを変えたとき何が連動するか。
2. 参照先が消えた／名前が変わったとき何が壊れるか。
3. 値の型が合わない場合にどこを見るか。
4. 式を増やすほど保守責任がどこへ集まるか。

## Common Misread

**「同じ値にしたい = すべてExpression」と決めること。**

必要なのは値の関係です。Instance、Modifier、User Controlsなど別の再利用手段が適切な場合もあるため、責任の置き場所で選びます。

## Related Patterns

- [Expressionで値の関係を保つ](../../patterns/automation/link-values-with-expression)
- [複数要素の位置関係を共有する](../../patterns/transform/share-position-across-elements)

## Node Reference

- [Transform](../../nodes/transform/transform)
- [Merge](../../nodes/compositing/merge)

## Next

次はConceptを具体的な再利用構造へ落とします。

→ [Patterns](../../patterns/)
