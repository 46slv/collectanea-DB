---
title: 式（Expressions）
description: FusionでParameterを式から計算し、別Parameter・時間・画像情報と関係づけるSimpleExpressionの基本。
doc_type: concept
term_id: expressions
term_short: Parameter値を計算式・別Parameter・時間から求める仕組み。
verification: partial
aliases: [Expression, SimpleExpression, 式, parameter link]
concepts: [expressions, parameter-linking, derived-values]
nodes: [Transform, Merge, Text+]
tasks: [automate, link-values, derive-values, procedural-animation]
prerequisites: [parameter-data, keyframes]
level: foundation
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-09"
---

# 式（Expressions）

FusionのExpressionは、Parameterへ固定値を入れる代わりに、**別の値、時間、画像の情報などから結果を計算して、そのParameterへ返す**ための仕組みです。

たとえば、別NodeのBlendへ連動する、Text+のCenterから少し下へずらす、時間に合わせてSizeを周期的に変える、といった関係をKeyframeを大量に置かずに作れます。

## このページで分かること

このページでは、Fusionで「Expression」と呼ばれる機能のうち、主に**SimpleExpression**を扱います。

読後に次を判断できることを目標にします。

- 数値欄での一回だけの計算とSimpleExpressionの違い
- 別Node / 別Parameterを参照する基本形
- `time`や`GetValue()`を使った時間参照
- Number / Point / Textで戻り値の型が違うこと
- `iif()`による条件分岐
- SimpleExpressionとExpression Modifierをどちらにするか

## 基本の考え方

Fusionでは、「式」のように見える操作が少なくとも3種類あります。

### 数値欄で一度だけ計算する

多くの数値欄では、その場で計算できます。

```text
2.0 + 4.0
```

入力後は結果の`6.0`がParameter値になります。別Parameterとの関係は残りません。

「今だけ計算したい」ならこれで十分です。

### SimpleExpressionで関係を残す

Parameterの数値欄へ`=`を入力してReturnを押すと、そのParameterの下へSimpleExpression欄が追加されます。

SimpleExpressionには1行のLua式とFusion固有の省略記法を書けます。

```lua
Merge1.Blend
```

この場合、対象ParameterはMerge1のBlendを参照し続けます。Merge1.Blendを変えると、SimpleExpression側の結果も変わります。

### Expression Modifierで入力を整理する

Parameterを右クリックして`Modify With > Expression`を選ぶと、Expression Modifierを追加できます。

Expression ModifierはSimpleExpressionとは別の仕組みです。最大9個のNumber入力と9個のPoint入力をControls側へまとめ、Number Out / Point Outで結果を返します。

入力が増えて式が長くなる場合、Control名を付けて整理したい場合はExpression Modifierが向いています。

→ [Expression Modifier](../../nodes/modifiers/expression)

## 最小例：別Parameterへ追従させる

Merge1のBlendを、別の数値Parameterへそのまま連動させる例です。

1. 連動させたい数値ParameterへSimpleExpressionを追加します。
2. 式に次を書きます。

```lua
Merge1.Blend
```

3. Merge1のBlendを動かします。
4. SimpleExpressionを付けたParameterも同じ値へ変化することを確認します。

基本形は次です。

```text
Node名.Parameter名
```

Node Editorの接続線とは別に、**ParameterからParameterへ一方向の値の関係**を作っていると考えると理解しやすくなります。

## 共通ルール

### `time`は現在frameを返す

```lua
time
```

は現在のframe番号を返します。

時間に応じて値を変えたい場合は、`time`を計算へ入れます。21.1 Manualには、Sizeを周期的に動かす例として次の式が掲載されています。

```lua
sin(time/20)/2+.5
```

この式は0〜1の範囲を往復します。

### 別frameを読むときは`GetValue()`

SimpleExpressionでは、別のframeにあるParameter値も取得できます。

```lua
Merge1:GetValue("Blend", time-5)
```

これはMerge1のBlendを、現在より5frame前から読みます。

一方、21.1 ManualではExpression Modifierは**current time以外のParameter値へアクセスできない**とされています。別frameの値が必要なら、SimpleExpressionの`GetValue()`やCalculation Modifierを検討します。

### 戻り値の型を合わせる

Expressionは、対象Parameterに合う型を返す必要があります。

数値ParameterならNumberを返します。

```lua
Merge1.Blend
```

Centerのような2次元位置ならPointを返します。

```lua
Point(Text1.Center.X, Text1.Center.Y-.1)
```

この例はText1のCenterからY方向へ0.1下げたPointを返します。

Numberが必要な場所へPointを返したり、Pointが必要な場所へNumberを返したりすると、期待した結果になりません。式を見る前に、対象Parameterが何の型かを確認します。

## 現在のNode自身を参照する

21.1 Manualでは、Node名を書かずに`Input`と書いた場合、現在のNodeのInputを参照すると説明されています。

```lua
Input.Metadata.ColorSpaceID
```

これは次と同じ考え方です。

```lua
self.Input.Metadata.ColorSpaceID
```

ImageからはWidth、Depth、Metadataなどのmemberを参照できます。

たとえば、現在のNodeへ入っているImageのColorSpaceIDが`sRGB`かどうかで0 / 1を返す例がManualにあります。

```lua
iif(Input.Metadata.ColorSpaceID == "sRGB", 0, 1)
```

ここでの`Input`は、Node Editor上の「オレンジ入力なら必ずInput」という意味ではありません。21.1 Manualも、main image inputがInputであることが多いが、すべてのNodeで同じではないと注意しています。

## 条件で値を切り替える

SimpleExpressionでは`iif(条件, trueの値, falseの値)`を使えます。

```lua
iif(Merge1.Blend == 0, 0, 1)
```

この式は、Merge1.Blendが0なら0、それ以外なら1を返します。

一定値を境にON / OFFのような値へ切り替えたい場合の基本です。

たとえば「0.1未満の反応を0へ落とす」という構成なら、次のように組み立てられます。

```lua
iif(Merge1.Blend < 0.1, 0, Merge1.Blend)
```

これは`iif()`と比較演算を組み合わせた運用例です。実際の閾値は入力値の範囲に合わせて決めます。

## Pick Whipで参照を作る

SimpleExpression欄を開くと、左側に`+`ボタンが表示されます。

この`+`を別Parameterへドラッグすると、そのParameterへの参照式を作れます。ManualではこれをPick Whipと呼んでいます。

手入力でNode名やParameter名を書くより、最初はPick Whipで正しい参照を作り、必要ならその後に式を編集すると入力ミスを減らせます。

Connect Toとの違いは、Pick Whipで作ったSimpleExpressionは**参照式を後から編集できる**ことです。

## 1つだけ変えて確認する

周期運動の例を使って、`time`の効き方を確認します。

まず次をSizeへ入れます。

```lua
sin(time/20)/2+.5
```

次に`20`だけを`40`へ変えます。

```lua
sin(time/40)/2+.5
```

Manualの説明どおり、timeを大きな値で割るほど変化は遅くなります。

式全体を一度に複雑化せず、1つの項だけ変えてSpline Editorで結果を見ると、どの部分が動きへ影響しているか判断しやすくなります。

## Spline Editorで結果を見る

SimpleExpressionが時間で変化する場合、その結果をSpline Editorで表示できます。

21.1 Manualでは、SimpleExpressionで生成された値をSpline Editorにplotして、時間変化を確認できると説明されています。

Inspectorの式だけを見て原因が分からないときは、Spline Editorで「値が滑らかに変わっているか」「0〜1の範囲に収まっているか」「急に跳んでいないか」を確認します。

SimpleExpressionはSpline Editor側からも`Set SimpleExpression`で追加・編集できます。

## 他のNodeへ応用する

### Transform / Text+

位置を別のNodeから少しずらしたい場合は、Pointを返します。

```lua
Point(Text1.Center.X, Text1.Center.Y-.1)
```

「別のTextへ追従するが、少し下に置く」といった関係を作れます。

### Merge

Blendを別Parameterへ直接連動させるなら、次の形が最小です。

```lua
Merge1.Blend
```

別frameのBlendを使うなら`GetValue()`を使います。

### Image Metadata

現在のNodeへ入るImageのMetadataを条件に使えます。

```lua
iif(Input.Metadata.ColorSpaceID == "sRGB", 0, 1)
```

画像の属性を見て値を切り替える構成に使えます。

## 初見Nodeで予測する

初めて見るNodeでも、次の順で確認するとExpressionを作りやすくなります。

1. **どのParameterを動かしたいか**を決める。
2. そのParameterがNumber / Point / Textなど、何を返す必要があるか確認する。
3. 値の元になるNode / Parameterを決める。
4. Pick Whipで参照式を作る。
5. まず参照値をそのまま返し、接続が正しいか確認する。
6. offset、time、条件分岐などを1つずつ追加する。
7. 時間変化がある場合はSpline Editorで結果を見る。

式が動かないときに、いきなり複雑なLua構文から調べるより、**参照先と戻り値の型**を先に確認した方が原因を切り分けやすくなります。

## よくある誤解

### 数値欄の計算とSimpleExpressionは同じではない

`2+4`を数値欄で計算すると、結果の6が値として残ります。

SimpleExpressionは式そのものが残り、参照先やtimeが変わるたびに結果を再計算します。

### SimpleExpressionとExpression Modifierは同じではない

SimpleExpressionはParameterの横へ1行の式を書きます。

Expression ModifierはNumber / Point入力を専用Controlsへまとめ、Number Out / Point Outで結果を返します。式が長くなり、複数入力を整理したい場合はこちらが向きます。

### `Input`は必ずどのNodeでも同じ意味ではない

Manualでは`Input`が現在Nodeのmain image inputを指す例を示していますが、すべてのNodeが同じInput名を持つとは限りません。

Pick WhipやInspectorで実際のParameterを確認してから式を書きます。

### 別frame参照はExpression Modifierでも同じようにできるわけではない

SimpleExpressionでは`GetValue(..., time-5)`のように別frameを読めます。

Expression Modifierは21.1 Manual上、current time以外の値を直接参照できません。

## 使い分け

- その場で数値を一度だけ計算する → 数値欄で計算
- 別Parameterと短い関係を作る → SimpleExpression
- 複数のNumber / Point入力を整理して計算する → Expression Modifier
- 2つの値を演算し、入力ごとにTime Scale / Offsetを持たせる → Calculation Modifier
- 1つのParameterを複数箇所で共有する → Publish / Connect To
- 自然なランダムAnimationをInspectorで調整する → Shake / Perturb

Expressionを使うこと自体を目的にせず、**値の供給元と必要な戻り値**から方法を選びます。

## 関連する再利用構成

- [Expressionで値の関係を保つ](../../patterns/automation/link-values-with-expression)

## 関連Node

- [Expression Modifier](../../nodes/modifiers/expression)
- [Calculation](../../nodes/modifiers/calculation)
- [Publish](../../nodes/modifiers/publish)
- [Shake](../../nodes/modifiers/shake)
- [Perturb](../../nodes/modifiers/perturb)

## 次に読む

- [Modifier / Parameter Sources](./modifier-parameter-sources)
- [キーフレーム / スプライン / 時間](./keyframes-spline-time)
- [Expression Modifier](../../nodes/modifiers/expression)

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 73「Using Modifiers, Expressions, and Custom Controls」pp.1586–1588と、Chapter 124「Modifiers」のExpression / Calculation節を基準にしています。

21.1 Manualで、数値欄の計算、SimpleExpressionの追加方法、`time`、Node Parameter参照、`GetValue()`、`sin()`、`iif()`、現在Nodeの`Input` / `self.Input`、Image member、`Point()`、Pick Whip、Spline Editorでのplot、SimpleExpressionの削除方法、Expression Modifierの時間参照制約を確認しました。

このページでは、current runtimeの内部Parameter ID、Node rename時の細かな挙動、すべてのLua / Fusion関数、式の評価順序の内部実装までは確認していません。
