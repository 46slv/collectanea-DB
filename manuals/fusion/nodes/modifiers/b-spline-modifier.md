---
title: "B-Spline Modifier"
description: "数値ParameterをB-SplineでAnimationし、control pointのweight / tensionで滑らかさを調整するSpline Modifier。"
doc_type: node
term_id: "b-spline-modifier"
term_short: "B-Spline Modifierは、handleを使わずcontrol pointのweight / tensionで数値Parameterの時間変化を調整するAnimation Modifier。"
verification: partial
aliases: ["B-Spline Modifier", "B-Spline"]
concepts: ["parameter-data", "time"]
nodes: ["B-Spline Modifier"]
node_family: "modifiers"
inputs: ["parameter"]
outputs: ["parameter"]
tasks: ["drive-parameter", "animate"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-07"
---

# B-Spline Modifier

B-Spline Modifierは、**数値ParameterをB-SplineでAnimationし、1つのcontrol pointのweight / tensionでcurveの滑らかさを調整するModifier**です。

Bézier Splineのようにcontrol pointの前後へhandleを出して調整するのではなく、control pointそのものが値と滑らかさの両方に関わります。画像を直接加工するNodeではなく、対象Parameterへframeごとの数値を返します。

## 何をするModifierか

DaVinci Resolve 21.1 Reference Manualでは、B-Splineは主に数値Parameterへ使うAnimation Modifierとして説明されています。対象Parameterを右クリックして `Modify With > B-Spline` を選ぶと追加でき、結果はSpline Editorへ表示されます。

```text
数値ParameterのKeyframe / control point
                 ↓
            B-Spline
       └─ weight / tensionで
          curveの滑らかさを調整
                 ↓
       対象Parameterの時間ごとの値
```

B-Splineで特に重要なのは、**control pointに設定した値と、その時刻にcurveが実際に返す値が必ずしも同じにならない**ことです。

21.1 Manualの例では、2つ目のKeyframe自体の値が`0`でも、B-Splineのsmoothing / weightingによって、その位置で評価されるcurveの値が`0.33`になる例が示されています。Bézier SplineやCubic Splineのように「curveがcontrol pointを通る」前提で調整しない方が安全です。

## 入力と出力

B-Spline Modifierが扱う中心的なデータは、**数値ParameterのAnimation**です。

- 対象: 主にnumerical value
- 入力として考えるもの: Keyframe / control pointの時間と値
- 出力: 対象Parameterへ返すframeごとの数値
- 編集場所: Spline Editor
- Image input / output: なし

Centerのような2D Positionを画面上の軌道として動かしたい場合は、[Path](./path)や[XY Path](./xy-path)などpoint value向けのModifierを先に検討します。

## 追加と編集

### B-Splineを追加する

数値Parameterを右クリックし、`Modify With > B-Spline` を選びます。

21.1 ManualのModifier一覧では、B-Splineが「選択したParameterをAnimationするためのSpline」として記載されています。

### Spline Editorで編集する

B-Spline Modifierには、通常のModifierのような専用Controls tabはありません。主な編集場所は**Spline Editor**です。

control pointを選択し、`W`キーを押しながら左右へdragすると、pointのweightを変更できます。21.1 Manualでは、この操作によってcurveのtensionを下げたり上げたりすると説明されています。

複数のcontrol pointを選択した状態でも、同じ操作をまとめて適用できます。

## weight / tensionで何が変わるか

B-Splineでは、Bézier handleの代わりにcontrol pointのweight / tensionがcurveへ影響します。

- weight / tensionを変えると、そのpoint周辺のcurveの引かれ方が変わる
- control pointの値だけでなく、周辺pointとの関係から実際のcurveが計算される
- そのため、control pointの数値と、その時刻の評価値が一致しない場合がある

「Keyframeに指定した値を必ずそのframeで通過させたい」場合は、B-Splineの性質と目的が合っているかを確認します。

## B-Spline Modifier Degree

Fusion PreferencesのSplines設定には、**B-Spline Modifier Degree**があります。

21.1 Manualでは次の違いが説明されています。

- **Cubic B-Spline**: anchor pointの間で、2つのcontrol pointを使ってsegmentを決める
- **Quadratic B-Spline**: anchor pointの間で、1つのcontrol pointを使ってsegmentを決める

これはB-SplineをAnimationに使うときの設定です。Maskで使うB-Splineには別に**B-Spline Polyline Degree**があり、同じ設定ではありません。

このページでは、current runtimeでの既定Degreeやedition差までは確定していません。

## 主な用途

B-Splineは、**少ないcontrol pointから滑らかな数値変化を作り、handleを1本ずつ調整する代わりにpointのweight / tensionでcurveを整えたい**場合に候補になります。

たとえば次のような使い方です。

- TransformのSizeを複数のKeyframeで変化させ、全体を滑らかにつなぐ。
- GlowのStrengthなどの数値Parameterを、急な折れの少ないcurveでAnimationする。
- 複数のcontrol pointを選択し、`W`操作でまとめてtensionを調整する。
- Bézier Splineではhandle調整が細かすぎると感じるAnimationで、より少ない操作でcurveの傾向を整える。

## 最小構成

```text
対象の数値Parameter
        ↑
     B-Spline
        ↑
Keyframe / control point
```

B-Spline ModifierはNode EditorでImageを接続するNodeではなく、対象Parameterへ付くModifierです。

## 運用例: Sizeの変化をB-Splineで整える

TransformのSizeを複数のKeyframeでAnimationする例です。

1. Sizeを右クリックして`Modify With > B-Spline`を選びます。
2. 複数のframeでSizeの値を変え、control pointを作ります。
3. Spline EditorでB-Splineを表示します。
4. 調整したいcontrol pointを選択し、`W`キーを押しながら左右へdragします。
5. curveの形だけでなく、control pointを置いたframeで実際に返される値も確認します。

B-Splineではsmoothing / weightingによって、control pointに設定した数値とcurveの評価値がずれる場合があります。Viewer上の結果とSpline Editorのcurveを両方見ながら調整します。

## 他のSplineとの使い分け

### Bézier Spline

[Bézier Spline](./bezier-spline)は、各Keyframeの前後にhandleを持ち、入る側と出る側のcurveを個別に調整できます。

Keyframeの値を通りながら、区間ごとの傾きや直線 / 曲線を細かく決めたい場合はBézierが向いています。

### Cubic Spline

[Cubic Spline](./cubic-spline)はcontrol pointを通るsmoothなcurveを自動生成しますが、Bézier handleは表示しません。

B-Splineもhandleを使いませんが、control pointのweight / tensionがcurveへ影響し、curveがcontrol pointの値をそのまま通るとは限らない点が大きな違いです。

### Natural Cubic Spline

[Natural Cubic Spline](./natural-cubic-spline)はCubic Splineに近い自動補間ですが、21.1 Manualではcontrol point変更の影響がより局所的だと説明されています。

離れた区間への影響を抑えながら、control pointを通るCubic系のcurveが必要な場合はこちらを比較します。

## B-Spline Maskとの違い

FusionにはMask用の**B-Spline**もありますが、B-Spline Modifierとは用途が異なります。

- B-Spline Modifier: 数値Parameterを時間方向にAnimationする
- B-Spline Mask: Viewer上で輪郭を描き、画像処理へ使うMaskを作る

PreferencesにもAnimation用の`B-Spline Modifier Degree`とMask用の`B-Spline Polyline Degree`が別々に用意されています。名前が似ていても、同じものとして扱わない方が分かりやすくなります。

## 注意点

- 21.1 ManualではB-Splineは主にnumerical value向けとされ、point valueとは分けて説明されています。
- 専用Controls tabはなく、主な編集はSpline Editorで行います。
- `W` + 左右dragでweight / tensionを調整できます。
- smoothing / weightingによって、control pointの値とcurveの評価値が一致しない場合があります。
- Bézier SplineとB-Splineの間では、Keyframeのcopy / pasteができないと21.1 Manualに記載されています。
- current runtimeのREGID、内部Parameter ID、B-Spline Modifier Degreeの既定値、edition差はこのページでは確定していません。

## 関連ページ

- [Modifier Family Overview](./)
- [Bézier Spline](./bezier-spline)
- [Cubic Spline](./cubic-spline)
- [Natural Cubic Spline](./natural-cubic-spline)
- [Path](./path)
- [XY Path](./xy-path)

## バージョンと出典

DaVinci Resolve 21.1 Reference Manual（September 2026）の次の範囲を基準にしています。

- Chapter 71「Animating in Fusion's Spline Editor」pp.1544–1549
- Chapter 73「Using Modifiers, Expressions, and Custom Controls」p.1584
- Chapter 74「Preferences」pp.1621–1622
- Chapter 124「Modifiers」p.2996

21.1 Manualで、B-Splineが主に数値Parameterへ使うAnimation Modifierであること、`Modify With > B-Spline`から追加できること、専用Controls tabを持たずSpline Editorで編集すること、`W`操作でweight / tensionを調整できること、smoothing / weightingによってcontrol point値とcurve評価値が一致しない場合があることを確認しています。

current runtimeのREGID、内部Parameter ID、B-Spline Modifier Degreeの既定値、edition差は別のruntime verification対象です。
