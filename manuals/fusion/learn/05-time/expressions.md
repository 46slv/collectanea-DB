---
title: 式（Expressions）
description: FusionでParameterを式から計算し、別Parameterや時間と関係づける基本。
doc_type: concept
term_id: expressions
term_short: Parameter値を計算式・別Parameter・時間から求める仕組み。
verification: partial
aliases: [Expression, SimpleExpression, 式, parameter link]
concepts: [expressions, parameter-linking, derived-values]
nodes: [Transform, Merge]
tasks: [automate, link-values, derive-values]
prerequisites: [parameter-data, keyframes]
level: foundation
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-06"
---

# 式（Expressions）

FusionのExpressionは、Parameterへ固定値を入れる代わりに、**別の値や時間から結果を計算する**ための仕組みです。

たとえば「別NodeのBlendと同じ値にする」「Centerから少し下へずらす」「時間に合わせてSizeを周期的に変える」といった関係を、Keyframeを大量に置かずに作れます。

## まず3種類を分ける

Fusionでは「式」と呼びたくなる機能がいくつかあります。

### 数値欄で計算する

多くの数値欄では、その場で簡単な計算ができます。

```text
2.0 + 4.0
```

この場合は6.0という値を求めるための計算です。別Parameterとの継続的な関係を作りたい場合はSimpleExpressionを使います。

### SimpleExpression

Parameterの数値欄へ`=`を入力してReturnを押すと、Parameterの下にSimpleExpression欄が開きます。

ここには1行のLua式とFusion固有の省略記法を書けます。

```lua
time
```

現在のframe番号を返します。

```lua
Merge1.Blend
```

別NodeのParameterを参照します。この例では`Merge1`の`Blend`です。

```lua
sin(time/20)/2+.5
```

0〜1の範囲を往復する値を作ります。SizeやBlendなどを周期的に動かすときの基本形です。

```lua
iif(Merge1.Blend == 0, 0, 1)
```

Blendが0なら0、それ以外なら1を返します。一定条件で値を切り替えたいときに使えます。

### Expression Modifier

InspectorでParameterを右クリックし、`Modify With > Expression`を選ぶ方法です。

Expression Modifierには9個のNumber inputと9個のPoint inputがあり、式では`n1 ... n9`、`p1x ... p9x`、`p1y ... p9y`として参照できます。Number ParameterではNumber Out、CenterのようなPoint ParameterではPoint Outを使います。

SimpleExpressionよりControlを整理しやすく、複数の入力値をまとめて扱いたい場合に向いています。

→ [Expression Modifier](../../nodes/modifiers/expression)

## 別Nodeの値を参照する

基本形は`Node名.Parameter名`です。

```lua
Merge1.Blend
```

Pointの一部だけを使う場合は、X / Y componentを参照できます。

```lua
Text1.Center.X
```

Pointそのものを返したい場合は`Point(x, y)`を使います。

```lua
Point(Text1.Center.X, Text1.Center.Y-.1)
```

この例ではText1のCenterを基準に、Y方向へ0.1だけずらしたPointを返します。

## 別frameの値を読む

SimpleExpressionでは`GetValue()`を使って別frameのParameter値を読むこともできます。

```lua
Merge1:GetValue("Blend", time-5)
```

これはMerge1のBlendを、現在より5frame前から取得します。

一方、21.1 ManualではExpression Modifierはcurrent time以外の値へアクセスできないとされています。時間をずらして値を読む必要がある場合は、SimpleExpressionやCalculation Modifierなど別の方法を検討します。

## Pick Whipで参照を作る

SimpleExpression欄を開くと左側に`+`が表示されます。これを別Parameterへdragすると、そのParameterへの参照を作れます。

Node名やParameter名を手入力するより、まずPick Whipで正しい参照を作ってから式を編集する方が間違いを減らせます。

## 使い分けの目安

- 値をその場で計算したい → 数値欄で計算
- 別Parameterと簡単な関係を作りたい → SimpleExpression
- 複数のNumber / Pointを入力として整理したい → Expression Modifier
- 時間差を含む2つの値を演算したい → Calculation Modifierも候補
- 自然なrandom animationが欲しい → Shake / Perturbも候補

Expressionを使うこと自体が目的ではありません。どのParameterを基準にし、どのParameterをそこから計算するかを先に決めると、後からGraphを読みやすくなります。

## 次に追加する内容

このページから、次の内容を個別記事へ分けていく予定です。

- Node / Parameter参照の書き方
- `time`と周期運動
- `iif`、`min`、`max`を使った閾値処理
- NumberとPointの違い
- Custom Toolを制御ハブとして使う方法
- Expression / Calculation / Publishの使い分け

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 73「Using Modifiers, Expressions, and Custom Controls」とChapter 124「Modifiers」を基準にしています。

SimpleExpressionの追加方法、`time`、Node Parameter参照、`GetValue()`、`sin()`、`iif()`、`Point()`、Pick Whip、Expression ModifierのNumber / Point inputsは21.1 Manualで確認済みです。実機上のすべてのLua関数、Parameter ID、Node rename時の細かな挙動まではこのページでは確認していません。

## 関連ページ

- [Modifier / Parameter Sources](./modifier-parameter-sources)
- [キーフレーム / スプライン / 時間](./keyframes-spline-time)
- [Expression Modifier](../../nodes/modifiers/expression)
- [Expressionで値の関係を保つ](../../patterns/automation/link-values-with-expression)
