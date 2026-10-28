---
title: "Calculation"
description: "2つのParameter値を演算し、Time Scale / Offsetで参照する時間も調整できるModifier。"
doc_type: node
term_id: "calculation"
term_short: "Calculationは、2つのOperandを演算して対象Parameterへ値を返し、各Operandの参照時間も調整できるModifier。"
verification: partial
aliases: ["Calculation", "Calculation Modifier"]
concepts: ["parameter-data", "expressions", "time"]
nodes: ["Calculation"]
node_family: "modifiers"
controls: ["First Operand", "Second Operand", "Operator", "First Operand Time Scale", "Second Operand Time Scale", "First Operand Time Offset", "Second Operand Time Offset"]
inputs: ["parameter"]
outputs: ["parameter"]
tasks: ["drive-parameter", "link-values", "derive-values", "retime-parameter"]
level: intermediate
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-28"
---

# Calculation

Calculationは、**2つのParameter値を受け取り、足し算・掛け算などの演算をして対象Parameterへ返すModifier**です。

単純に値をつなぐだけでは範囲や向きが合わないときに使います。たとえば「Text+が大きくなるほどBlurを弱くする」のように、元Parameterとは逆方向の変化を作ったり、値を100倍して別Controlの実用的な範囲へ合わせたりできます。

さらに、First / Second OperandごとにTime ScaleとTime Offsetを持つため、**現在frameとは別の時刻にあるParameter値を読み、その値で計算できる**のが大きな特徴です。

## 追加方法

対象Parameterを右クリックし、`Modify With > Calculation`を選びます。

Calculationは画像を処理するNodeではありません。Inspector内で対象Parameterの値を作るModifierとして動作します。

```text
First Operand ─┐
               ├─ Calculation ─→ 対象Parameter
Second Operand ┘
```

First / Second Operandには、数値を直接入れるほか、別Parameterを接続できます。

## 入力と出力

Calculationが扱うのは画像ではなく、数値Parameterの値です。Inspectorの特定の数値ControlへModifierを付け、そこから**最大2つのOperandを読み、演算結果を元のControlへ返します**。

| 役割 | 内容 |
| --- | --- |
| First Operand | 手入力の数値、または公開済み・Animation済みの別Parameterから読む数値 |
| Second Operand | 手入力の数値、または公開済み・Animation済みの別Parameterから読む数値 |
| Time Scale / Time Offset | Operandごとに、どのframeにある値を読み取るかを調整 |
| Operator | 2つのOperandに適用する演算。片方だけを使う`First only`も選択可能 |
| 出力先 | Calculationを付けた対象Parameterの、そのframeで評価される数値 |

Node Editorで画像を通す端子はありません。たとえば`Text+のSize`はOperandの参照元、`BlurのSize`はCalculationの出力先として使えます。画像そのものは通常の`Text+ → Blur`というNode接続を通ります。

## Calcタブ

### First Operand / Second Operand

計算に使う2つの値です。

どちらも手入力でき、別の公開済みParameterやAnimationされたParameterへ接続することもできます。

たとえばFirst OperandをText+のSizeへ接続し、Second Operandへ`100`を入れれば、Text Sizeを100倍した値を作る準備ができます。

### Operator

Second OperandをFirst Operandへどう組み合わせるかを選びます。

DaVinci Resolve 21.1 Reference Manualに記載されているOperatorは次の10種類です。

- Add
- Subtract (First - Second)
- Multiply
- Divide (First / Second)
- Divide (Second / First)
- Subtract (Second - First)
- Minimum
- Maximum
- Average
- First only

たとえばFirst Operandが`0.2`、Second Operandが`100`でOperatorがMultiplyなら、Calculationの結果は`20`です。

## Timeタブ

Calculationでは、First / Second Operandの値を「現在frameの値」だけでなく、別の時間から取得できます。

### First / Second Operand Time Scale

現在のframe番号へ倍率を掛け、その時刻のOperand値を参照します。

Time Scaleが`1`なら通常どおり現在frameを参照します。`0.5`なら、現在frame 10のときframe 5相当の値を読むため、元Animationを半分の速度でたどるような関係を作れます。

負の値を使うと、時間方向を反転して参照できます。

### First / Second Operand Time Offset

参照するframe位置を前後へずらします。

Manualでは、正の値で先のframe、負の値で前のframeを読む例が説明されています。

Time Scaleと組み合わせると、元Animationを逆方向へ読んだり、開始位置を合わせたりできます。

## 具体例: Textが大きくなるほどBlurを弱くする

21.1 Manualには、Text+のSize AnimationとBlur SizeをCalculationで関連づける例があります。

前提として、Text+のSizeをframe 0で`0.05`、frame 100で`0.50`へ大きくし、その後ろにBlurを接続します。

### 1. Blur SizeへCalculationを追加

Blur Sizeを右クリックして`Modify With > Calculation`を選びます。

### 2. First OperandへText+のSizeを接続

First Operandを`Connect To > Text 1 > Size`でText+のSizeへ接続します。

この時点ではTextが大きくなるほどBlur Sizeも大きくなるため、目的とは逆です。また、Text Sizeの値は0.05〜0.50程度なので、そのままBlurへ使うには値の範囲も小さすぎます。

### 3. 値の範囲を合わせる

OperatorをMultiplyにし、Second Operandを`100`へ設定します。

これでText Sizeの値を100倍してBlurへ渡せます。

### 4. 時間方向を反転する

First Operand Time Scaleを`-1.0`へ設定します。

これだけでは現在frame 10でframe -10を読むようになるため、Manualの例ではFirst Operand Time Offsetを`100`へ設定します。

結果として、Text SizeのAnimationを後ろから読む関係になります。

```text
Text Size
小 ─────────────→ 大
frame 0          frame 100

Calculationから見る参照方向
frame 100        frame 0
大 ←───────────── 小
```

Textが大きくなるにつれて、Calculationが参照するText Sizeは小さくなるため、Blur Sizeも弱くなります。

この例ではCalculationが2つの問題を同時に処理しています。

- Multiplyで値の範囲をBlur向けに拡大する
- Time Scale / OffsetでAnimationの時間方向を反転する

## 応用例：現在値と10フレーム前の値の差を取る

Calculationは、**同じParameterを2つのOperandへ接続し、異なる時刻の値を引き算する**使い方もできます。これは「今の値が10フレーム前からどれだけ増えたか」を別の数値Controlへ渡す構成です。別の時刻を直接参照できることは21.1 ManualのTime tabで確認できますが、以下の数値例はその仕様から組み立てた確認案です。

1. Text+のSizeに、frame 0で`0.10`、frame 20で`0.30`のキーフレームを置き、**Linear補間**にします。途中の値を計算で予測しやすくするためです。
2. 後段のBlurのSizeを右クリックし、`Modify With > Calculation`を選びます。
3. Modifiersタブで、**First OperandとSecond Operandの両方**を`Connect To > Text 1 > Size`から同じSizeへ接続します。
4. CalcタブのOperatorを`Subtract (First - Second)`にします。
5. TimeタブでFirst Operandを`Time Scale = 1`、`Time Offset = 0`、Second Operandを`Time Scale = 1`、`Time Offset = -10`にします。Secondだけが10フレーム前のSizeを参照します。

上記の2キーをLinear補間した場合、計算上は次の値になります。

| 出力frame | First（現在のSize） | Second（10フレーム前） | 差（Blur Sizeへの値） |
| --- | ---: | ---: | ---: |
| 10 | 0.20 | 0.10（frame 0） | 0.10 |
| 20 | 0.30 | 0.20（frame 10） | 0.10 |

この`0.10`は**10フレーム間の差分**であり、1フレームあたりの変化量や速度をそのまま表す値ではありません。値が減少する区間では差分が負になり得ます。Blur Sizeなど出力先Controlの許容範囲を確認し、必要なら別の演算・値域調整を行ってください。またframe 0〜9では10フレーム前の参照が作例のキーフレーム範囲外になるため、ここでは結果を予測しません。

二つのOperandのTime Offsetを個別に変えられる点は21.1 Manual Chapter 124 pp.2997–2999に基づきます。**上の表は計算による予測であり、21.1実機でのParameter readback・Blur描画・範囲外評価は未検証**です。元のText+のキーフレーム自体は変更しません。

## 期待どおりにならないとき

| 症状 | 先に確認すること |
| --- | --- |
| Blur SizeがText Sizeと同じ方向へ動く | `Multiply`は値域を広げるだけで変化の向きは反転しません。元Animationを後ろから参照したいなら、Manualの作例どおりFirst Operandの`Time Scale = -1`と`Time Offset = 100`を組み合わせます。`100`は元がframe 0〜100の作例用です。 |
| 参照元の動きを遅くしたいのに結果が速くなる | どちらのOperandへTime Scaleを設定したか確認します。21.1 Manualでは`0.5`でそのOperandのframe参照を半分の速度にする例があります。 |
| 元Animationの範囲外を読んでしまう | Time Scaleを負にしたときは、Time Offsetも確認します。Manualの例では現在frame 10からframe -10を参照してしまうため、Offsetを追加しています。範囲外での補間・保持挙動はここでは断定しません。 |
| 参照するframeが前後逆になる | **正のTime Offsetは未来、負のTime Offsetは過去**のframeの値を読む、とManualに記されています。 |
| 演算後の数値が期待と違う | `Subtract`と`Divide`にはFirst/Secondの順序を逆にした選択肢があります。まずFirst Operand、Second Operandの値とOperatorを確認します。除数に0を与えた場合の実装上の挙動は未検証です。 |
| CalculationがNode graphに出てこない | Calculationは画像NodeではなくParameter Modifierです。対象Controlに付けた後、Inspectorの**Modifiers** tabを確認します。 |
| 参照元を変えても結果が変わらない | `First only`ではSecond Operandが計算に使われません。両Operandの参照元、選択Operator、対象Parameterの接続を確認します。 |

この表はReference ManualのCalc / Time Controlsと作例から作った切り分け手順です。各症状の実機再現結果ではなく、21.1実行環境での確認余地を残しています。

## Expressionとの違い

[Expression Modifier](./expression)は、最大9個のNumber入力と9個のPoint入力を使い、より複雑な数式を組めます。複数値をまとめて計算するならExpressionの方が柔軟です。

一方、21.1 ManualではExpression Modifierはcurrent time以外のParameter値へアクセスできないと説明されています。CalculationはOperandごとにTime Scale / Time Offsetを持つため、**入力値を別frameから読む処理はCalculationの方が組みやすい**です。

[SimpleExpression](../../learn/05-time/expressions)では`GetValue()`を使って別frameを明示的に参照することもできます。短い式で済むか、専用Controlとして時間調整を見せたいかで使い分けます。

## 使うときの判断

Calculationが向いているのは、次のような場合です。

- 2つのParameterを単純な演算で関係づけたい
- 元Parameterと対象Parameterで値の範囲が合わない
- Animationの参照時間をずらしたい
- 元Animationを逆方向や別速度で読みたい
- 複雑な式を書くより、Inspector上で演算と時間関係を見える形にしたい

3個以上の値やPointを含む複雑な関係ならExpression Modifier、単純な追従だけならPublish / Connect To、自然な揺れならShake / Perturbなども候補になります。

## 注意点

Calculationは対象Parameterへ値を供給するModifierなので、Node Editor上でImage端子を接続するNodeではありません。

また、Time Scale / Time Offsetは元Animationそのものを書き換えるのではなく、Calculationが**どの時刻のOperand値を読むか**を変えます。元ParameterのKeyframeはそのまま残ります。

## 関連ページ

- [Modifier](./)
- [Expression Modifier](./expression)
- [式（Expressions）](../../learn/05-time/expressions)
- [Modifier / Parameter Sources](../../learn/05-time/modifier-parameter-sources)

## バージョンと出典

DaVinci Resolve 21.1 Reference Manual（September 2026）Chapter 124「Modifiers」pp.2996–2999を基準にしています。

First / Second Operand、10種類のOperator、各OperandのTime Scale / Time Offset、Text+のSizeとBlur Sizeを逆方向に連動させる作例、Expression Modifierとの時間参照上の違いを21.1 Manualで確認しています。

current runtime REGID、内部Parameter ID、edition差はこのページでは確認していません。
