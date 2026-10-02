---
title: User Controlsで公開interfaceを作る
description: Graph内部の実装パラメータと、操作する人へ見せるcontrolを分離する。
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

# User Controlsで公開インターフェースを作る

## このページで分かること（Question）

複雑なGraphを再利用するとき、利用者に内部Nodeの全パラメータを触らせず、必要な意味だけをどう見せればよいでしょうか。

## 基本の考え方（Mental Model）

User Controlは、**実装のパラメータと、利用者へ公開するインターフェースを分ける**ための層として考えます。

```text
internal nodes / parameters
        ↓
relation / expression
        ↓
public user controls
        ↓
operator edits intent
```

「どの値を触るか」ではなく、「利用者は何を決めるべきか」をインターフェースとして定義します。

Blackmagic DesignのFusion 20 Manualでは、User Controlsで既存controlの変更・非表示、新しいcontrolの追加、typeや範囲の定義ができ、変更はNode instance自体に保存されると説明されています。21.1での正確なダイアログ項目は再確認対象です。

## 最小例（Minimum Example）

内部で複数パラメータが連動しているGraphに、1つの意味controlを用意します。

```text
User Control: "Spacing"
   ├─ element A offset
   ├─ element B offset
   └─ element C offset
```

利用者はSpacingだけを変更し、内部の計算式や個別offsetを直接触らない構成にします。

## 共通ルール（Invariants）

- public controlはdesign intentを表す。
- 内部パラメータ名をそのまま公開する必要はない。
- 1つの意味を複数の独立controlで二重管理しない。
- 範囲や初期値を公開する場合は、Graphが成立する範囲を意識する。
- User Controlを増やすほど使いやすくなるとは限らない。

## 1つだけ変えて確認する（Change One Thing）

内部パラメータを1つ直接触る代わりに、同じ結果をUser Control経由で変更します。

どちらがGraphの意図を保ちやすいか、変更責任がどこにあるかを比較します。

## 他のNodeへ応用する（Transfer）

### Macro / Template

再利用可能なMacroやTemplateでは、公開controlの選択そのものがインターフェース設計になります。

### Expressions

User Controlを基準となる値にし、複数パラメータをExpressionで派生させられます。

### Repeated graphics

brand color、margin、stroke widthのような意味パラメータを公開し、内部Node構造を隠す設計へ応用できます。

## 初見Nodeで予測する（Predict）

新しい再利用Graphを作るとき、次を先に決められます。

1. 利用者が変更すべき意味は何か。
2. 内部に隠すべきパラメータは何か。
3. どの値をmasterにするか。
4. invalidな組み合わせをどう避けるか。

## よくある誤解（Common Misread）

**Inspectorを短くするためだけにUser Controlを作ること。**

目的は見た目の整理だけではなく、Graphの内部実装と利用者の意思決定を分けることです。

## 関連する再利用構成（Patterns）

- [Expressionで値の関係を保つ](../../patterns/automation/link-values-with-expression)

## 関連Node

User ControlsはNode固有Referenceではなく、Inspector / authoring機構として扱います。

## 次に読む

→ [GroupでGraphをまとめる](./groups)

---

検証メモ: User Controlsの追加・変更・非表示とNode instanceへの保存はBlackmagic Design公式Fusion 20 Manualで確認。Fusion 21.1の正確なダイアログ項目は未確認です。
