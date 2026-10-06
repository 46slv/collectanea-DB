---
title: "Probe"
description: "画像内の1 pixelまたは矩形領域を測定し、色・Lumaの変化をnumeric Parameterへ変換するModifier。"
doc_type: node
term_id: "probe"
term_short: "Probeは、画像のpixelや領域を測定し、その色や明るさを数値Parameterへ渡すModifier。"
verification: partial
aliases: ["Probe"]
concepts: ["parameter-data"]
nodes: ["Probe"]
node_family: "modifiers"
controls: ["Image to Probe", "Channel", "Position X Y", "Probe Rectangle", "Width", "Height", "Evaluation", "Scale Input", "Black Value", "White Value", "Out of Image Value"]
inputs: ["image", "parameter"]
outputs: ["parameter"]
tasks: ["drive-parameter"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-06"
---

# Probe

Probeは、**指定したImageの1 pixelまたは矩形領域を測定し、その色や明るさを数値Parameterへ渡すModifier**です。

画像を加工して別のImageを出力するNodeではありません。たとえば、映像内で点滅しているライトの明るさを読み取り、その値でBrightnessのような数値Controlを自動的に動かせます。

## 何をするModifierか

Probeでは、最初に測定元となるImageを指定し、次にImage内のどこを、どのChannelで読むかを決めます。測定した値は必要に応じて別の値域へ変換され、Probeを付けたnumeric Parameterへ返されます。

~~~text
Image to Probe
      ↓
Position / Probe Rectangle
      ↓
Channel + Evaluation
      ↓
Value mapping
      ↓
numeric Parameter
~~~

DaVinci Resolve 21.1 Reference Manualでは、特定pixelまたは矩形領域のcolor / luminosityを使って任意のnumeric Parameterを制御するModifierとして説明されています。

## 追加方法

動かしたい数値Parameterを右クリックし、`Modify With > Probe`を選びます。

追加後はInspectorのModifiers tabからProbeのControlを調整します。

Probeを付ける対象はnumeric Parameterです。Node Editor上でImage端子をつなぐのではなく、**Imageを測定して得た数値をParameter sourceとして使う**構成になります。

## 入力と出力

### Image to Probe

測定するImageを指定します。

Node Editorからsource Nodeを`Image to Probe`欄へdragすると、そのNodeのImageをProbeの測定元にできます。

~~~text
source Image ──→ Probe ──→ 対象Parameter
~~~

ここでのImageは、Probeが測定するsourceです。Probe自体がそのImageを加工して後段へ渡すわけではありません。

### 対象Parameter

Probeを追加したnumeric Parameterが、測定結果を受け取ります。

たとえばBrightness系の数値ControlへProbeを追加すれば、Imageから測った値をそのControlの変化へ使えます。

### 他のParameterから参照できる値

21.1 Manualでは、Composition内にProbeが存在すると、別NodeのParameterからProbeの値を個別に接続できると説明されています。

参照できる値は次のとおりです。

- Result
- Red
- Green
- Blue
- Alpha

`Channel`でLumaを選べる一方、Manualの個別output一覧にはLumaではなく上記5項目が記載されています。ここではその区別を保ちます。

## 主なControl

### Channel

どのChannelを測定結果として使うかを選びます。

21.1 Manualに記載されている選択肢は次のとおりです。

- Red
- Green
- Blue
- Alpha
- Luma

色Channelそのものへ反応させるのか、明るさへ反応させるのかをここで決めます。

### Position X / Y

Image内のどの位置を測定するかを指定します。

Probe Rectangleを使わない場合、Probeはこの位置にある**1 pixel**を測定します。

### Probe Rectangle

1 pixelだけでなく、一定範囲のpixelをまとめて測定したい場合に使います。

Rectangle modeを使うと、`Width` / `Height`で測定領域の大きさを決め、`Evaluation`で領域内のpixelを1つの値へまとめる方法を選べます。

### Evaluation

Rectangle内のpixelから結果を作る方法です。

- **Average** — 領域内のpixel値を平均する
- **Minimum** — 領域内で最も小さい値を使う
- **Maximum** — 領域内で最も大きい値を使う

たとえば、ライトのある小さな領域全体を1つの値として読みたい場合は、Rectangleを広げてAverageを使えます。単一点ではなく、範囲として測定したいときの選択肢です。

## Value tab

Probeで測定した値を、そのまま対象Parameterの値として使う必要はありません。Value tabでは入力値と出力値の対応を調整できます。

### Scale Input

Probeが読み取った値のうち、どの範囲をBlack ValueからWhite Valueへ対応させるかを調整します。

Manualでは既定の関係として、測定結果が`0`ならBlack Value、`1`ならWhite Valueを生成すると説明されています。Scale Inputを変えることで、反応させたい入力範囲を調整できます。

### Black Value / White Value

- **Black Value** — Scale Input側のblackに対応したときに返す値
- **White Value** — Scale Input側のwhiteに対応したときに返す値

これにより、Image側では0〜1の変化でも、対象Parameter側では別の値域へ対応させられます。

### Out of Image Value

Probeする位置がImageのframe外に出たときに返す値です。

Rectangle modeでは、矩形の一部がframe内に残っている間はOut of Image Valueへ切り替わりません。**矩形全体がImageの外へ出た時点**でこの値が使われます。

## 運用例1: 点滅するライトで数値Controlを動かす

21.1 Manualでは、shot内で点滅しているライトのpixel値をProbeし、その値でBrightness Nodeを制御する例が挙げられています。

基本構成は次のようになります。

~~~text
点滅するライトを含むImage
          ↓
        Probe
    Channel: Luma
          ↓
Brightnessのnumeric Parameter
~~~

1. Brightness側の動かしたいnumeric ParameterへProbeを追加する。
2. 元映像のNodeを`Image to Probe`へ指定する。
3. `Position X / Y`をライトの位置へ合わせる。
4. 明るさで反応させるなら`Channel`をLumaにする。
5. 必要ならValue tabで入力値と出力値の対応を調整する。

Keyframeを手で打たなくても、Image内の明暗変化をParameterのAnimation sourceとして利用できます。

## 運用例2: 一点ではなく領域を測る

測定したい対象が1 pixelに収まらない場合はProbe Rectangleを使います。

たとえば画面内の発光領域を測定するなら、矩形を対象へ合わせ、Averageで領域全体の値を1つへまとめられます。Minimum / Maximumを選べば、その範囲の最暗部または最明部を基準にできます。

この場合、`Position`は矩形の位置、`Width / Height`は測定範囲、`Evaluation`は複数pixelをどう1値へまとめるかを担当します。

## From Imageとの違い

[From Image](./from-image)もImageを参照するModifierですが、返すdataが異なります。

- **Probe** — pixelまたは矩形領域を測定し、numeric valueを作る
- **From Image** — Image上の線に沿ってcolorをsampleし、Gradientを作る

「映像の明るさや色を数値Controlへ使いたい」ならProbe、「映像からGradientそのものを作りたい」ならFrom Imageを選びます。

## Publishとの関係

[Publish](./publish)は、既存の静的Parameterを`Connect To`から参照できるようにするModifierです。Imageを測定して値を生成するProbeとは役割が異なります。

ProbeはImageから値を作ります。さらに21.1 Manualでは、Composition内にあるProbeの`Result / Red / Green / Blue / Alpha`を別Parameterから個別に参照できることが説明されています。

## 注意点

ProbeはImageの見た目を直接変えるNodeではありません。Viewerに表示するImage outputを期待するのではなく、対象Parameterへ返されるnumeric valueを確認します。

また、1 pixel samplingとRectangle samplingでは結果の意味が変わります。広い範囲のAverageと、特定pixelの値を同じ測定として扱わないようにします。

このページでは21.1 Manualで確認できるControl名、Channel、Evaluation method、Value mapping、個別outputを基準にしています。current runtimeのREGID、内部Parameter ID、Manualに記載されていないdefault / range、edition差はこのrunでは確定していません。

## 関連ページ

- [Modifier Family Overview](./)
- [From Image](./from-image)
- [Publish](./publish)
- [Expression Modifier](./expression)

## バージョンと出典

DaVinci Resolve 21.1 Reference Manual（September 2026）Chapter 124「Modifiers」pp.3022–3024を基準にしています。

同Manualで、pixel / rectangle sampling、`Image to Probe`、Red / Green / Blue / Alpha / Luma、`Position X Y`、Probe Rectangle、Width / Height、Average / Minimum / Maximum、Scale Input、Black Value、White Value、Out of Image Value、および`Result / Red / Green / Blue / Alpha`の個別参照を確認しています。

また、点滅するライトのpixel値でBrightnessを駆動する例と、graded LUTの値を測定して比較する用途が示されています。
