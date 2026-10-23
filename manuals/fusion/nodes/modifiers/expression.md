---
title: "Expression"
description: "最大9個のNumber入力と9個のPoint入力を式で組み合わせ、別Parameterの値を計算するModifier。"
doc_type: node
term_id: "expression"
term_short: "Expressionは、Number / Point入力を式で組み合わせてParameterへ値を返すModifier。"
verification: partial
aliases: ["Expression", "Expression Modifier"]
concepts: ["parameter-data", "expressions"]
nodes: ["Expression"]
node_family: "modifiers"
controls: ["Controls", "Number Out", "Point Out", "Config", "Random Seed"]
inputs: ["parameter"]
outputs: ["parameter"]
tasks: ["drive-parameter", "link-values", "derive-values", "procedural-animation"]
level: intermediate
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-13"
---

# Expression

Expressionは、別Parameterへ直接画像を渡すNodeではなく、**複数の数値や位置を入力として受け取り、数式で計算した結果を対象Parameterへ返すModifier**です。

Inspectorで対象Parameterを右クリックし、`Modify With > Expression`から追加します。数値Controlへ付けた場合はNumber Out、CenterのようなPoint Controlへ付けた場合はPoint Outの式が最終値になります。

SimpleExpressionとは別の仕組みです。SimpleExpressionはParameterの横へ1行の式を直接書きますが、Expression Modifierは専用のControls / Number Out / Point Out / Configを持ち、入力値を整理して再利用しやすくできます。

→ [式（Expressions）の基本](../../learn/05-time/expressions)

## 入力と出力

Expression Modifierには、最大9個のNumber入力と9個のPoint入力があります。

- Number 1〜9 → 式では`n1 ... n9`
- Point 1〜9のX → `p1x ... p9x`
- Point 1〜9のY → `p1y ... p9y`

各入力は手入力だけでなく、別Parameterへ接続したり、Animationを付けたり、別のExpression / Calculationへ接続したりできます。

最終的な出力形式は、Expressionを付けた対象Parameterで決まります。

```text
Number入力 / Point入力
          ↓
      Expression
          ↓
対象Parameterの値
```

画像端子をつなぐNodeではないため、Node Editor上のImage Input / Outputとして考えるより、**Parameterの値を作る小さな計算系**として読む方が分かりやすくなります。

## Number Out

Sliderなど、単一の数値を返すParameterへExpressionを付けた場合に使います。

例えば、Point In 1へPathなどの位置情報を接続し、そのY座標だけを数値として使う場合は次の式です。

```text
p1y
```

21.1 Manualでは、Number In 1と2の大きい方にNumber In 3のcosineを掛け、Point In 1のXを加える例も示されています。

```text
max(n1, n2) * cos(n3) + p1x
```

このように「入力を受ける部分」と「計算式」を分離できるのがExpression Modifierの利点です。

## Point Out

Centerのような2次元位置を返すParameterではPoint Outを使います。

Point OutにはXとYそれぞれの式欄があり、上側がX、下側がYです。Number入力とPoint入力の両方を使って位置を作れます。

Numberを返す式とPointを返す式を混同すると期待した結果にならないため、まず対象ParameterがNumberかPointかを確認します。

## Controls

Controlsタブでは、式へ渡すNumber / Pointを設定します。Number入力は`n1 ... n9`、Point入力は`p1x ... p9x`と`p1y ... p9y`として式から参照します。

入力側へ別Parameterを接続しておけば、元の値が変わったときにExpressionの結果も更新されます。複数Nodeから値を集める場合でも、式の中へNode名を大量に直接書かず、Controls側へ入力をまとめられます。

## Config

Configタブでは、9個ずつ用意されたNumber / Point入力について、使うものだけ表示し、ラベルを変更できます。

例えば`Number 1`を`Amplitude`、`Number 2`を`Speed`のように変更すると、後から見たときに何のための値か分かりやすくなります。再利用するExpressionでは、未使用Controlを隠し、入力名を用途に合わせて変更しておくと読みやすくなります。

## 運用例：別のTransformの動きを少し右へずらして再利用する

たとえば2つのText+を別々のTransformで動かし、片方の文字がもう片方の少し右を追いかける動きを作れます。**Expressionで制御するのはTransformのCenterの値**であり、文字画像そのものをExpressionへ入力するわけではありません。

1. 2つのText+をそれぞれ`Transform1`、`Transform2`へ通し、Mergeで重ねます。
2. `Transform1.Center`にKeyframeを打ち、左側の文字の動きを作ります。
3. `Transform2.Center`を右クリックし、`Modify With > Expression`を選びます。
4. ExpressionのControlsタブにある`Point In 1`へ、`Transform1.Center`を接続します。
5. Point Outタブの上側（X）へ`p1x + 0.1`、下側（Y）へ`p1y`を入力します。

```text
Transform1.Center ──→ Point In 1
                          │
                      Expression
                     X: p1x + 0.1
                     Y: p1y
                          ↓
                    Transform2.Center
```

これでTransform1のCenterが動くと、Transform2のCenterも同じ軌道をたどります。ただしX座標には常に0.1が加わります。Centerが正規化座標である通常の2D構成では、同じ画面幅を基準にした右方向へのずれです。2つの枝の画像サイズや座標系が違う場合は、表示上の間隔が変わるため、まず両方のTransformの入力画像とViewer上の座標を確認してください。

**Point Outは2つの式欄**です。`(p1x + 0.1, p1y)`を1つの欄に入れるのではなく、XとYを個別に記述します。逆に、`Size`のような数値ParameterにはNumber Outを使います。

## 運用例：小さい入力値を無視して数値を動かす

たとえば音声解析などで得た数値を`Number In 1`へ接続し、その値が小さい間は別の数値Parameterを動かしたくないとします。Number Outへ次の式を入れます。

```text
max(0, n1 - 0.2)
```

`n1`が0.1なら結果は0、0.5なら0.3です。入力の0.2以下を0にし、それを超えた分だけを出力します。`0.2`は例示用のしきい値であり、入力の実際の値域に合わせて調整します。これは**取得済みの数値を整形する計算**で、音声の周波数成分を選び出すフィルターではありません。

入力値をそのまま複数箇所へ配るだけなら[Publish](./publish)、時間をずらして値を使うなら[Calculation](./calculation)と比べて選びます。

## Random Seed

`rand(x, y)`はx〜yのrandom値を生成し、frameごとに新しい値を返します。Random Seedはそのrandom系列の開始値を決めます。

同じSeedなら同じframeで同じ結果を再現でき、Seedを変えると別のrandom系列になります。明示的なseedを式側で指定したい場合は、21.1 Manualに`rands(x, y, s)`も記載されています。

## 使える値と関数

21.1 Manualでは、次のような値・関数がExpression Modifier用として記載されています。

- `n1 ... n9` — Number入力
- `p1x ... p9x`, `p1y ... p9y` — Point入力
- `time` — 現在frame
- `pi`, `e`
- `log`, `ln`, `sqrt`, `abs`, `int`, `frac`
- `sin`, `cos`, `tan`, `asin`, `acos`, `atan`, `atan2`
- `min`, `max`
- `dist`, `dist3d`
- `noise`, `noise2`, `noise3`
- `rand`, `rands`
- `if(c, x, y)`

Expression Modifierの三角関数はManual上、角度をdegreeとして扱います。

SimpleExpressionでは条件分岐の例として`iif(...)`が使われますが、Expression ModifierのChapter 124では`if(c, x, y)`が記載されています。似た名前でも同じ入力欄の構文だと決めつけず、どのExpression機能を使っているかを先に確認します。

## 時間の制約

Expression Modifierでは`time`を使って現在frameを計算へ入れられますが、21.1 Manualでは**現在時刻以外のParameter値へアクセスできない**とされています。

「5frame前の値を読む」「2つの入力を別々にtime offsetする」用途では、Expression Modifierだけで無理に組まず、SimpleExpressionの`GetValue()`やCalculation Modifierを検討します。

CalculationはExpressionより式の自由度が低い一方、各OperandにTime Scale / Time Offsetを持ち、時間をずらした値を扱いやすいModifierです。

→ [Calculation](./calculation)

## 使い分け

Expression Modifierが向いているのは、複数のNumber / Pointを整理したうえで、現在frameの値から結果を計算したい場合です。

- 2つ以上のParameterから1つの値を作る
- PointのX / Yを別々に加工する
- `min` / `max`で値域を選ぶ
- `noise`や`rand`でproceduralな変化を作る
- 1つのModifierへ入力をまとめ、名前を付けて再利用する

単純に別Parameterと同じ値へリンクしたいだけならSimpleExpressionやPublish / Connect Toの方が短く済む場合があります。自然な揺れを作るだけならShake / Perturbの方がInspector上で調整しやすい場合もあります。

## 確認するときの順序

Expressionが期待どおり動かない場合は、式全体を一度に直すより次の順で確認します。

1. 対象ParameterがNumberかPointか確認する。
2. Controlsタブで入力値が期待どおり変化しているか見る。
3. `n1`や`p1x`など、1入力だけをそのまま返して接続を確認する。
4. 計算を1項ずつ追加する。
5. 時間差が必要ならExpression Modifierの範囲外ではないか確認する。

## 症状から確認する

| 症状 | 最初に確認する点 |
| --- | --- |
| 式を入れたのに見た目が変わらない | 数値ParameterならNumber Out、Centerのような位置ParameterならPoint Outを編集しているか。 |
| 追従先が動いても位置が変わらない | Controlsの`Point In 1`が元のCenterを参照しているか。まずX欄を`p1x`、Y欄を`p1y`だけにして接続を切り分ける。 |
| 位置は動くが画面上の間隔が想定と違う | 正規化座標と、2つの画像の解像度・縦横比が一致しているか。値の差と画面上の距離を混同しない。 |
| 数値を小さくしても完全に0にならない | `max(0, n1 - 0.2)`のように0へ切り上げる式を使っているか。逆に最大値を制限したいときは`min`で上限を指定する。 |
| Random Seedを固定しても値が毎frame変わる | `rand(x, y)`はframeごとに値を変える仕様。同じframeの再現性と、連続するframeで値を固定することは別。滑らかな変化が目的なら`noise`系の式を検討する。 |

## 関連ページ

- [式（Expressions）の基本](../../learn/05-time/expressions)
- [Calculation](./calculation)
- [Modifier Family Overview](./)
- [Modifier / Parameter Sources](../../learn/05-time/modifier-parameter-sources)

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 124「Modifiers」pp.3002–3007を基準にしています。

21.1 Manualで、最大9個のNumber / Point入力、Number Out / Point Out、Config、Random Seed、関数と演算子、`p1y`と`max(n1, n2) * cos(n3) + p1x`の作例、current time以外の値へアクセスできない制約を確認しました。

current runtimeのREGID、内部Parameter ID、実機上の全Control default / range、すべての式関数のruntime差はこのrunでは確認していません。
