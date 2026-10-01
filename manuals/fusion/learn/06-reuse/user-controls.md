---
title: User Controlsで公開interfaceを作る
description: Graph内部の実装parameterと、操作する人へ見せるcontrolを分離する。
doc_type: concept
verification: partial
aliases: [User Controls, Edit Control, custom controls]
concepts: [user-controls, interface-design, parameter-ownership]
tasks: [reuse, expose-controls, simplify-interface]
prerequisites: [parameter-data, expressions]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
---

# User Controlsで公開interfaceを作る

## Question

複雑なGraphを再利用するとき、利用者に内部Nodeの全parameterを触らせず、必要な意味だけをどう見せればよいでしょうか。

## Mental Model

User Controlは、**実装のparameterと、利用者へ公開するinterfaceを分ける**ための層として考えます。

```text
internal nodes / parameters
        ↓
relation / expression
        ↓
public user controls
        ↓
operator edits intent
```

「どの値を触るか」ではなく、「利用者は何を決めるべきか」をinterfaceとして定義します。

Blackmagic DesignのFusion 20 Manualでは、User Controlsで既存controlの変更・非表示、新しいcontrolの追加、typeやrangeの定義ができ、変更はNode instance自体に保存されると説明されています。21.1でのexact dialog項目は再確認対象です。

## Minimum Example

内部で複数parameterが連動しているGraphに、1つの意味controlを用意します。

```text
User Control: "Spacing"
   ├─ element A offset
   ├─ element B offset
   └─ element C offset
```

利用者はSpacingだけを変更し、内部の計算式や個別offsetを直接触らない構成にします。

## Invariants

- public controlはdesign intentを表す。
- 内部parameter名をそのまま公開する必要はない。
- 1つの意味を複数の独立controlで二重管理しない。
- rangeやdefaultを公開する場合は、Graphが成立する範囲を意識する。
- User Controlを増やすほど使いやすくなるとは限らない。

## Change One Thing

内部parameterを1つ直接触る代わりに、同じ結果をUser Control経由で変更します。

どちらがGraphの意図を保ちやすいか、変更責任がどこにあるかを比較します。

## Transfer

### Macro / Template

再利用可能なMacroやTemplateでは、公開controlの選択そのものがinterface設計になります。

### Expressions

User Controlをsource of truthにし、複数parameterをExpressionで派生させられます。

### Repeated graphics

brand color、margin、stroke widthのような意味parameterを公開し、内部Node構造を隠す設計へ応用できます。

## Predict

新しい再利用Graphを作るとき、次を先に決められます。

1. 利用者が変更すべき意味は何か。
2. 内部に隠すべきparameterは何か。
3. どの値をmasterにするか。
4. invalidな組み合わせをどう避けるか。

## Common Misread

**Inspectorを短くするためだけにUser Controlを作ること。**

目的は見た目の整理だけではなく、Graphの内部実装と利用者の意思決定を分けることです。

## Related Patterns

- [Expressionで値の関係を保つ](../../patterns/automation/link-values-with-expression)

## Node Reference

User ControlsはNode固有Referenceではなく、Inspector / authoring機構として扱います。

## Next

→ [GroupでGraphをまとめる](./groups)

---

Verification note: User Controlsの追加・変更・非表示とNode instanceへの保存はBlackmagic Design公式Fusion 20 Manualで確認。Fusion 21.1のexact dialog fieldは未確認です。
