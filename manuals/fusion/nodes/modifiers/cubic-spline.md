---
title: "Cubic Spline"
description: "数値Parameterのcontrol pointを通りながら、handleなしで自動的に滑らかなAnimation curveを作るSpline Modifier。"
doc_type: node
term_id: "cubic-spline"
term_short: "Cubic Splineは、control pointを通る滑らかなcurveをhandleなしで自動生成する数値Parameter向けAnimation Modifier。"
verification: partial
aliases: ["Cubic Spline"]
concepts: ["parameter-data", "time"]
nodes: ["Cubic Spline"]
node_family: "modifiers"
inputs: ["parameter"]
outputs: ["parameter"]
tasks: ["drive-parameter", "animate"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-07"
---

# Cubic Spline

Cubic Splineは、**数値Parameterのcontrol pointを通りながら、handleを手動調整せず滑らかなAnimation curveを作るModifier**です。

DaVinci Resolve 21.1 Reference Manualでは、Bézier Splineと同じようにcurveがcontrol pointを通る一方、Bézier handleは表示せず、可能な限り滑らかなcurveを自動的に作るSplineとして説明されています。画像を直接加工するNodeではなく、対象Parameterへframeごとの数値を返します。

## 何をするModifierか

数値ParameterをAnimationすると、Spline Editorでは各Keyframeがcontrol pointとして表されます。Cubic Splineは、そのpointを通るcurveを自動計算します。

```text
Keyframeの時間と値
        ↓
   Cubic Spline
  └─ handleなしで滑らかなcurveを作る
        ↓
対象Parameterの時間ごとの値
```

Bézier SplineではKeyframe前後のhandleを動かしてcurveを作り込みますが、Cubic Splineにはそのhandleがありません。各control pointの時間と値を決めると、その間を滑らかにつなぐ形をFusion側が決めます。

21.1 ManualはこのSplineを「almost never used」とも説明しています。通常のAnimationで最初に選ぶSplineではなく、handleを使わずcontrol pointを通る自動補間が必要な場合に選ぶもの、と考えると位置づけが分かりやすくなります。

## 入力と出力

Cubic Splineが扱う中心的なdataは、**数値ParameterのAnimation**です。

- 対象: 主にnumerical value
- 入力として考えるもの: Keyframeの時間と値
- 出力: 対象Parameterへ返すframeごとの数値
- 編集場所: Spline Editor
- Image input / output: なし

Centerのような2D Positionを画面上の軌道として動かしたい場合は、[Path](./path)や[XY Path](./xy-path)などpoint向けのModifierを先に検討します。

## 追加と編集

DaVinci Resolve 21.1 Reference Manual Chapter 71では、数値Parameterのcontextual menuから `Modify With > Cubic Spline` を選ぶ方法が説明されています。

Cubic Splineには、通常のModifierのような専用Controls tabはありません。結果は**Spline Editor**に表示され、control pointの時間や値を動かしてcurveへ影響を与えます。

### Manual内の名称不一致

21.1 Manualには、追加方法の表記に食い違いがあります。

- Chapter 71では `Modify With > Cubic Spline` と記載
- Chapter 124の「Cubic Spline」節では `Modify With > Natural Cubic Spline` と記載

同じManualの中で記述が一致していないため、このページでは「Cubic SplineとNatural Cubic Splineが同一である」とは扱いません。現在のResolve 21.1のcontextual menuで実際に表示される名称と内部REGIDは、runtime verification対象として残します。

## 主な用途

Cubic Splineは、数値Parameterを複数のKeyframeでAnimationし、**各値を通りながら滑らかにつなぎたいが、Bézier handleを個別に調整したくない**場合に候補になります。

たとえば次のような使い方です。

- TransformのSizeを複数の値でAnimationし、各Keyframeを通る滑らかな変化を自動で作る。
- 数値Parameterの中間Keyframeを動かし、handleを触らずにcurve全体がどう変わるか比較する。
- 既存CompositionでCubic Splineが使われているときに、Spline Editor上でKeyframeの時間や値を修正する。
- Bézier / B-Spline / Natural Cubicとの補間の違いを確認し、目的に合うSpline typeを選ぶ。

## 最小構成

```text
対象の数値Parameter
        ↑
   Cubic Spline
        ↑
 Keyframe / control point
```

Cubic SplineはNode EditorでImageを接続するNodeではなく、対象Parameterへ付くModifierです。

## 運用例: Sizeを3点で変化させる

TransformのSizeを3つのKeyframeで変化させる例です。

1. Sizeの数値ControlからCubic Splineを追加します。
2. frame 0、12、24にKeyframeを置き、それぞれ異なるSize値を設定します。
3. Spline EditorでSizeのcurveを表示します。
4. 中央のKeyframeの値や時間を動かし、前後のcurveが自動的に滑らかにつながり直すことを確認します。

ここで確認するポイントは、Bézier Splineのようなhandle操作をしなくても、curveが各control pointを通りながら滑らかに再計算されることです。

frame番号は挙動を確認するための例で、21.1 Manualの固定presetではありません。

## 他のSplineとの使い分け

### Bézier Spline

[Bézier Spline](./bezier-spline)は、各Keyframeに前後のhandleを持ちます。直線区間とcurveを混ぜたり、Keyframeへ入る傾きと出る傾きを細かく調整したりしたい場合はこちらが向いています。

21.1では、数値Parameterを通常の `Animate` でAnimationするとBézier Splineが使われるのが既定です。ただしFusion PreferencesのDefault Animate設定で既定Modifierは変更できます。

### B-Spline

[B-Spline Modifier](./b-spline-modifier)はhandleを使わず、control pointのweight / tensionでcurveの滑らかさを調整します。21.1 Manualでは、control pointを選択して `W` を押しながら左右へdragする操作が説明されています。

Cubic Splineはcontrol pointを通るcurveを自動的に作るのに対し、B-Splineではpointのweightingがcurveへ影響します。

### Natural Cubic Spline

[Natural Cubic Spline](./natural-cubic-spline)はCubic Splineに似ていますが、21.1 Manualでは**変更の影響がより局所的**だと説明されています。

あるcontrol pointを変更しても、その影響は次または前のcontrol pointより先のtangentへ及びません。Cubic系の自動的な滑らかさを使いつつ、離れた区間への影響を抑えたい場合の違いとして確認できます。

## 注意点

- Cubic Splineは主に数値Parameter向けで、Imageを処理するNodeではありません。
- Bézier handleは表示されません。curveの形はcontrol pointの時間と値を変えて調整します。
- 21.1 Manual自身が、このSpline typeはほとんど使われないと説明しています。通常の数値AnimationではBézier Splineが既定です。
- Chapter 71とChapter 124で追加menuの名称が一致しないため、current runtimeのcontextual menu表記は未確定として扱います。
- current runtimeのREGID、内部Parameter ID、edition差はこのページでは確定していません。

## 関連ページ

- [Modifier Family Overview](./)
- [Bezier Spline](./bezier-spline)
- [B-Spline Modifier](./b-spline-modifier)
- [Natural Cubic Spline](./natural-cubic-spline)
- [Path](./path)
- [XY Path](./xy-path)

## バージョンと出典

DaVinci Resolve 21.1 Reference Manual（September 2026）の次の範囲を基準にしています。

- Chapter 71「Animating in Fusion's Spline Editor」pp.1544–1545
- Chapter 73「Using Modifiers, Expressions, and Custom Controls」pp.1584–1585
- Chapter 124「Modifiers」p.3000
- Chapter 74「Fusion Preferences」p.1600（Default Animate）

21.1 Manualで、Cubic Splineが主に数値Parameterへ使うAnimation Modifierであること、control pointを通ること、Bézier handleを表示せず滑らかなcurveを自動生成すること、専用Controls tabを持たずSpline Editorで編集することを確認しています。

Chapter 71とChapter 124で追加menu名が食い違うため、current runtimeのmenu表記、REGID、内部Parameter ID、edition差は別のruntime verification対象です。
