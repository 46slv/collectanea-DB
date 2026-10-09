---
title: "Bezier Spline"
description: "数値ParameterをKeyframeでAnimationし、各Keyframeの前後をBezier handleで個別に整えるSpline Modifier。"
doc_type: node
term_id: "bezier-spline"
term_short: "Bezier Splineは、KeyframeごとのBezier handleで数値Parameterの時間変化を細かく調整できるAnimation Modifier。"
verification: partial
aliases: ["Bezier Spline", "Bézier Spline"]
concepts: ["parameter-data", "time"]
nodes: ["Bezier Spline"]
node_family: "modifiers"
inputs: ["parameter"]
outputs: ["parameter"]
tasks: ["drive-parameter", "animate"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-07"
---

# Bezier Spline

Bezier Splineは、**数値ParameterをKeyframeでAnimationし、KeyframeごとのBezier handleで時間変化の曲がり方を調整するModifier**です。

DaVinci Resolve 21.1 Reference Manualでは「Bézier Spline」と表記され、数値ControlをAnimationするときの標準的なSplineとして説明されています。画像を直接加工するNodeではなく、対象Parameterへ時間ごとの値を返します。

## 何をするModifierか

Animationする数値Parameterでは、「どのframeで、どの値にするか」をKeyframeで決めます。Bezier Splineは、そのKeyframe同士をどのようなcurveでつなぐかを扱います。

```text
Keyframeの時間と値
        ↓
Bezier Spline
  └─ Keyframe前後のhandleでcurveを調整
        ↓
対象Parameterの時間ごとの値
```

各Keyframeには実際の値を表すcontrol pointがあり、その前後にあるhandleで、Keyframeへ入る区間とKeyframeから出る区間の傾きや滑らかさを調整できます。

そのため、一定速度の直線的な変化だけでなく、「ゆっくり動き始める」「途中で加速する」「終点へ滑らかに収束する」といった時間変化を、Keyframeごとに直接作れます。

## 追加方法

数値Controlを右クリックして `Animate` を選ぶと、通常はBezier Splineが作成されます。

ただし、Fusion Preferencesで既定のSpline typeを変更している場合は、`Animate`で別のSplineが使われることがあります。

21.1 Manualでは、数値Controlの右クリックメニューから `BezierSpline` を直接選ぶ方法も説明されています。この方法では現在位置にKeyframeが追加され、Spline EditorへBezier Splineが表示されます。

## 入力と出力

Bezier Splineが扱う中心的なdataは、**数値ParameterのAnimation**です。

- 対象: 主に数値Control
- 入力として考えるもの: Keyframeの時間と値
- 出力: 対象Parameterへ返す、frameごとの数値
- 編集場所: Spline Editor
- Image input / output: なし

Centerのような2D Positionを画面上の軌道として動かしたい場合は、[Path](./path)や[XY Path](./xy-path)などpoint向けのModifierも候補になります。

## どこで編集するか

Bezier Splineには、通常のModifierのような専用Controls tabはありません。curveの編集は**Spline Editor**で行います。

Keyframeを選択するとBezier handleを操作でき、前後のcurveを個別に調整できます。Inspectorへ専用のStrengthやScaleが追加される種類のModifierではありません。

## 主な操作

### Smooth

control pointを選択して `Shift-S` を押すと、そのpointをsmoothにできます。smoothにした後もhandleを動かしてcurveを細かく調整できます。

右クリックメニューの `Smooth` から同じ操作を行うこともできます。

### Linear

control pointを選択して `Shift-L` を押すとlinearにできます。右クリックメニューの `Linear` からも変更できます。

直線的な区間と曲線的な区間を組み合わせられることが、Bezier Splineの使いやすい点です。

### Ease In / Out

Spline Editorでcontrol pointを選択し、右クリックメニューの `Ease In/Out...` を使うと、Ease In / Outを数値で調整できます。

「開始時はゆっくり、途中から速くする」「終点へ近づくにつれて減速する」といった時間変化を、handle操作だけでなく数値から整えたいときに使えます。

### Smooth Points - Y Dialog

21.1 Manualでは、Spline Editorの右クリックメニューから `Smooth Points - Y Dialog` を選び、Savitzky-Golay filterによるcurve smoothingを行えることも説明されています。

複数のcontrol pointからなるcurve全体を滑らかに整えたい場合の選択肢です。

## 主な用途

Bezier Splineは、数値ParameterのAnimationを「Keyframeの値だけ」ではなく、その間の速度変化まで作り込みたいときに使います。

たとえば次のような用途があります。

- TransformのSizeを小さい値から大きい値へ動かし、開始と終了を滑らかにする。
- 数値Parameterを一度速く変化させ、その後ゆっくり目的値へ近づける。
- 一部の区間だけlinearにし、別の区間ではsmoothなcurveを使う。
- 複数Keyframeの間で、各区間へ入る速度と出る速度を個別に調整する。

## 最小構成

```text
対象の数値Parameter
        ↑
   Bezier Spline
        ↑
   Keyframe / handle
```

Bezier SplineはNode Editor上でImageを接続するNodeではなく、対象Parameterへ付くModifierです。

## 運用例: Sizeを滑らかに拡大する

例として、TransformのSizeをframe 0で`0.8`、frame 12で`1.0`にAnimationするとします。

1. Sizeを右クリックして`Animate`を選びます。
2. frame 0で`0.8`、frame 12で`1.0`のKeyframeを作ります。
3. Spline EditorでSizeのSplineを表示します。
4. Keyframeをsmoothにし、handleを動かしてcurveを調整します。

値そのものは0.8から1.0へ変わるだけですが、curveを調整すると「すぐ加速して後半でゆっくり止まる」「一定速度で拡大する」など、同じ2つのKeyframeから異なる動きを作れます。

この数値は操作を理解するための例で、21.1 Manualの固定preset値ではありません。

## 他のSplineとの使い分け

### B-Spline

[B-Spline Modifier](./b-spline-modifier)は、BezierのようにKeyframe前後へ個別のhandleを出すのではなく、control point自体のweight / tensionでcurveを調整します。

21.1 Manualでは、control pointを選択して`W`を押しながら左右へdragし、tensionを変える方法が説明されています。

### Cubic Spline

[Cubic Spline](./cubic-spline)はcontrol pointを通るsmoothなcurveを自動的に作りますが、Bezier handleは表示しません。

各Keyframeの前後をhandleで直接調整したいならBezier、handleを使わず自動的に滑らかなcurveを作りたいならCubic系、という違いがあります。

### Natural Cubic Spline

[Natural Cubic Spline](./natural-cubic-spline)もhandleを使わないSplineです。21.1 ManualではCubic Splineより影響範囲が局所的で、あるcontrol pointの変更が次または前のcontrol pointより先のtangentへ影響しないと説明されています。

## 注意点

- `Animate`で作られるSplineは通常Bezierですが、Fusion Preferencesで既定値を変更できます。
- 21.1 ManualではBezier Splineは主にnumerical valueへ適用するModifierとして説明されています。Positionのようなpoint valueとは分けて考えます。
- Bezier Splineには専用Controls tabがなく、主要な編集はSpline Editorで行います。
- current runtimeのREGID、内部Parameter ID、edition差はこのページでは確定していません。

## 関連ページ

- [Modifier Family Overview](./)
- [B-Spline Modifier](./b-spline-modifier)
- [Cubic Spline](./cubic-spline)
- [Natural Cubic Spline](./natural-cubic-spline)
- [Path](./path)
- [XY Path](./xy-path)

## バージョンと出典

DaVinci Resolve 21.1 Reference Manual（September 2026）の次の範囲を基準にしています。

- Chapter 71「Animating in Fusion's Spline Editor」pp.1543–1545
- Chapter 124「Modifiers」pp.2994–2996

21.1 Manualで、Bezier Splineが数値Parameter向けのAnimation Modifierであること、通常の`Animate`で使われる既定Splineであること、Spline EditorでBezier handle / Smooth / Linear / Ease In/Outを編集できることを確認しています。

current runtimeのREGID、内部Parameter ID、edition差は別のruntime verification対象です。
