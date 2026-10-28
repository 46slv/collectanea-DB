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
updated: "2026-10-13"
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

<!-- capture:S325 -->

## 実機例：Text+のSizeを2つのキーで変える

`Text+` のSizeにBezier Splineを接続し、0フレームを0.06、48フレームを0.18に設定しました。両フレームのViewerでは文字の大きさが変化し、SDKの読み戻しでは24フレームの値は0.12でした。

この例は直線的な補間です。Spline Editorでの曲線選択・fit・ハンドル編集は確認していません。操作はaccessibilityとglobal inputを使い、物理入力は確認していません。表示には編集ガイドと透明市松が含まれます。[接続と設定の記録](/img/fusion/captures/S325/readback.json)に条件を記載しています。

[![Text+をMediaOutへ接続した構成](/img/fusion/captures/S325/graph.png)](/img/fusion/captures/S325/graph.png)

Text+のSizeにSplineを接続しています。

[![48フレームでSizeが0.18のText+](/img/fusion/captures/S325/controls.png)](/img/fusion/captures/S325/controls.png)

48フレームのSizeは0.18です。

[![48フレームの大きい文字](/img/fusion/captures/S325/frame48-result.png)](/img/fusion/captures/S325/frame48-result.png)

48フレームの文字です。

[![0フレームの小さい文字](/img/fusion/captures/S325/frame0-result.png)](/img/fusion/captures/S325/frame0-result.png)

0フレームの文字です。

[再現用Graph](/img/fusion/captures/S325/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S325/capture.json)

<!-- /capture:S325 -->

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

## Keyframeとcurveを別々に確認する

Keyframeは「そのframeで何の値にするか」を決める点で、Bézier handleは**その値へどのような速さで近づき、次の値へどう離れるか**を決めるための操作です。

たとえばSizeをframe 0で`0.8`、frame 24で`1.0`に設定した場合、Keyframeの時刻と値を変えなくても、handleを変えると途中のframeでの拡大率と変化速度が変わります。まず指定frameで狙った値になっているかを確認し、次に中間frameでの動きを調整すると、原因を切り分けやすくなります。

**値をしばらく変えずに保ちたい場合**は、Spline Editorのgraph領域を右クリックし、`Set Key Equal To`の前後Keyframeと同じ値にする選択肢を使えます。これは新しいKeyframeに既存と同じ値を設定する操作です。Ease In/Outで減速させることと、同じ値のKeyframeを置いて値が変わらない区間を作ることは区別してください。DaVinci Resolve 21.1 Reference ManualのChapter 71（p.1545）に記載されています。

## Animationが期待どおりにならないとき

| 状況 | 確認すること |
| --- | --- |
| `Animate`を選んだのにBézierにならない | Fusion PreferencesでDefault Animateが変更されている可能性があります。21.1 ManualではBézierが通常の既定値ですが、他のSplineにも変更できます。 |
| 別のframeで値を変えてもKeyframeが増えない | 対象ParameterがAnimation状態か、playheadを別frameへ移してそのParameterの値を変更したか確認します。Spline Editorではcurve上をクリックしてKeyframeを追加する操作もあります。 |
| 曲線を見失った | 対象Splineが表示されているか確認し、graph領域の`Scale > Scale to Fit`で表示範囲を合わせます。これはcurveやKeyframeの値を変更する操作ではありません。 |
| Smoothにしたのに変化速度が意図と違う | 対象のcontrol pointを選び、`Shift-S`または`Smooth`を適用したうえで、入る側・出る側のhandleを調整します。`Shift-L`/`Linear`は直線的な区間に戻したいときの操作です。 |
| 特定の値で止めたいのに滑らかに通過してしまう | Easeだけで停止区間を作ろうとせず、必要な区間の両端に同じ値のKeyframeを設ける方法も検討します。`Set Key Equal To`はその補助になります。 |
| ParameterからAnimationを外したのに共有Splineが残る | Inspectorで対象Controlを右クリックし、`Remove [Parameter名]`を選ぶ操作は、そのParameterとSplineの接続を外します。ほかのToolが同じSplineへ接続している場合、Spline自体は削除されません。 |

これはManualに記載された操作・挙動から組み立てた確認手順であり、表内の各症状を21.1実機で再現した結果ではありません。

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

- Chapter 71「Animating in Fusion's Spline Editor」pp.1540–1545
- Chapter 124「Modifiers」pp.2994–2996

21.1 Manualで、Bezier Splineが数値Parameter向けのAnimation Modifierであること、通常の`Animate`で使われる既定Splineであること、Spline EditorでBezier handle / Smooth / Linear / Ease In/Outを編集できることを確認しています。

current runtimeのREGID、内部Parameter ID、edition差は別のruntime verification対象です。
