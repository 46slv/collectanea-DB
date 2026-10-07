---
title: "Natural Cubic Spline"
description: "数値ParameterのAnimationを、handleを手動調整せずcontrol point間で滑らかにつなぐSpline Modifier。"
doc_type: node
term_id: "natural-cubic-spline"
term_short: "Natural Cubic Splineは、数値Parameterのcontrol point間を自動的に滑らかなcurveでつなぐAnimation Modifier。"
verification: partial
aliases: ["Natural Cubic Spline"]
concepts: ["parameter-data", "time"]
nodes: ["Natural Cubic Spline"]
node_family: "modifiers"
inputs: ["parameter"]
outputs: ["parameter"]
tasks: ["drive-parameter", "animate"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-07"
---

# Natural Cubic Spline

Natural Cubic Splineは、**数値ParameterのAnimationを、control point間で自動的に滑らかなcurveとしてつなぐModifier**です。

DaVinci Resolve 21.1 Reference Manualでは、Point / Positionのようなpoint valueではなく、主に数値Controlへ使うAnimation Modifierとして説明されています。curveの形はSpline Editorで編集します。

## 何をするModifierか

数値ParameterへNatural Cubic Splineを追加すると、そのParameterの時間変化をSplineとして扱えます。

```text
control point / keyframe
        ↓
Natural Cubic Spline
        ↓
数値Parameterの時間変化
```

21.1 Manualでは、このSplineには他のSpline typeのようなcontrol handleがなく、**control pointを通る滑らかなcurveを自動的に作る**と説明されています。

そのため、各pointの時間と値を決めたうえで、区間のcurveをhandleで細かく作り込むより、point間を自動的に滑らかにつなぎたい場合に向いています。

## 追加方法

数値Controlを右クリックし、`Modify With > Natural Cubic Spline`を選びます。

Natural Cubic SplineはImageを処理するNodeではありません。対象Parameterへ直接付くModifierです。

## どこで編集するか

Natural Cubic Splineには、通常のModifierのような専用Controls tabがありません。

Animationの結果は**Spline Editor**に表示され、そこでcontrol pointを編集してcurveへ影響を与えます。つまり、Inspectorで専用のStrengthやScaleを調整する種類のModifierではなく、Spline Editor上のAnimation curveそのものを扱う仕組みです。

## control handleを使わない意味

21.1 ManualはNatural Cubic Splineについて、control handleを持たず、control pointを通るsmooth curveを自動的に作ると説明しています。

たとえば複数frameに数値を置いた場合、各pointの間を滑らかにつなぐcurveをFusion側に任せられます。

一方で、区間ごとの接線をhandleで直接作り込みたい場合は、handleを使うSpline方式と操作感が異なります。Natural Cubic Splineでは、まずpointの位置と値を編集して結果を整える、と考えると分かりやすくなります。

## 入力と出力

Natural Cubic Splineが扱う中心的なdataは**数値ParameterのAnimation**です。

- 対象: 主にnumerical value
- 出力: 対象Parameterへ返す時間ごとの数値
- 編集場所: Spline Editor
- Image input / output: なし

21.1 Manualはpoint valueではなくnumerical valueへ通常適用すると説明しています。Positionのようなpoint animationを作りたい場合は、[Path](./path)や[XY Path](./xy-path)などpoint向けのModifierを先に検討します。

## 使うときの判断

Natural Cubic Splineが候補になるのは、数値Parameterを複数のcontrol pointでAnimationし、その間を滑らかにつなぎたい場合です。

特に、次のように考えると選びやすくなります。

- 数値Parameterを時間で変化させたい
- point間を滑らかなcurveでつなぎたい
- curveの接線をhandleで逐一調整するより、自動補間を使いたい
- Inspectorの専用ControlではなくSpline EditorでAnimationを編集したい

逆に、Positionを画面上の軌道として動かしたい場合はPath / XY Path、式や他Parameterから値を計算したい場合はExpression / Calculationの方が目的に合います。

## Cubic Splineとの関係

COLLECTANEAには[Cubic Spline](./cubic-spline)も別項目としてあります。

21.1 ManualではCubic SplineとNatural Cubic Splineが別の見出しで掲載されていますが、Cubic Spline側の追加手順にも`Modify With > Natural Cubic Spline`という記述があります。このページでは、その記述だけから両者のruntime上のidentityや違いを推測して統合しません。

現在のEffects Library / contextual menu上での名称、内部REGID、両項目の厳密な差はruntime verification対象として残します。

## 関連ページ

- [Modifier Family Overview](./)
- [Cubic Spline](./cubic-spline)
- [Bezier Spline](./bezier-spline)
- [Path](./path)
- [XY Path](./xy-path)
- [Calculation](./calculation)
- [Expression Modifier](./expression)

## バージョンと出典

DaVinci Resolve 21.1 Reference Manual（September 2026）Chapter 124「Modifiers」p.3015を基準にしています。

同Manualで、Natural Cubic Splineが主に数値Controlへ適用されるAnimation Modifierであること、`Modify With > Natural Cubic Spline`から追加すること、control handleを持たずcontrol point間に滑らかなcurveを自動生成すること、専用Controls tabを持たずSpline Editorで結果を編集することを確認しています。

current runtimeのREGID、内部Parameter ID、edition差、およびManual内のCubic Splineとの厳密なruntime上の違いはこのrunでは確定していません。
