---
title: "Custom Poly"
description: "Polygon / Pathの各pointへ式を1点ずつ評価し、既存polylineを変形・再分割・別polyline参照で生成し直せるShape Modifier。"
doc_type: node
term_id: "custom-poly"
term_short: "Custom Polyは、Polygon / Pathの各pointへ式を評価し、polylineを数式で変形・生成するModifier。"
verification: partial
aliases: ["Custom Poly"]
concepts: ["shape-data", "expressions", "modifiers"]
nodes: ["Custom Poly"]
node_family: "modifiers"
controls: ["Point inputs", "Number inputs", "Connect Source Polyline here", "Show View Controls", "Number of Points", "Poly Expression X", "Poly Expression Y", "Config"]
outputs: ["shape"]
tasks: ["shape-expression", "procedural-path", "modifier"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-07"
---

# Custom Poly

Custom Polyは、**Polygon maskやPathを構成するpointごとに式を評価し、polylineの形を作り替えるModifier**です。

既存pointの位置を数式でずらすだけでなく、出力するpoint数を指定してpolylineを別の密度で作り直したり、別polyline上の位置を参照して2つの形の間を補間したりできます。

DaVinci Resolve 21.1 Reference Manualでは、Custom Tool / pCustomと似た考え方をpolylineへ適用するModifierとして説明されています。

## Expression Modifierとの違い

[Expression](./expression)は、NumberやPointを入力し、**対象Parameterへ1つの値またはPointを返す**Modifierです。

Custom Polyは、同じようにNumber / Point入力と数式を使いますが、式を**出力polylineの各pointに対して繰り返し評価**します。

~~~text
Expression
入力値 → 式 → 1つのParameter値

Custom Poly
source polyline
      ↓
各pointでX/Y式を評価
      ↓
output polyline
~~~

PositionやSizeなど1つのParameterを計算したい場合はExpression、Polygon / Pathそのものの形を数式で加工したい場合はCustom Polyを使います。

## 追加方法

PolygonのControls下部にある `Right-click here for shape animation` を右クリックし、次を選びます。

`Insert > Custom Poly`

追加後は、PolygonのInspectorにあるModifiers tabからCustom Polyを編集します。

Custom Polyは通常のImage処理Nodeではないため、Node Editor上へ単独Nodeとして追加してImage端子を接続する使い方ではありません。

## 入力と出力

Custom Polyが扱う中心データはpolylineです。

### source polyline

元になるPolygon maskやPathのpolylineを受け取り、その各pointを式の入力として使います。

Polyline tabの `Connect Source Polyline here` から、ほかのpolylineを接続して式から参照することもできます。

### Point / Number入力

Controls tabには、式へ渡すPoint入力とNumber入力があります。

21.1 Manualでは初期状態を次のように説明しています。

- Point入力: 1個
- Number入力: 4個
- Config tabからPoint / Numberとも最大9個まで拡張可能

Number入力は `n1 ... n9`、Point入力は `p1x ... p9x` / `p1y ... p9y` として式から参照できます。

### output polyline

Poly Expression X / Yの結果から新しいpolylineを作り、それをPolygon / Pathのshapeとして返します。

つまり、Custom Polyの出力は1個のnumeric valueではなく、複数pointで構成されるshapeです。

## Controls tab

Controls tabは、Custom Polyの式へ渡す外部値をまとめる場所です。

Point入力には位置Controlや別のPoint sourceを接続でき、Number入力には変形量やblend量などの数値を与えられます。

式の中へ直接すべての値を書き込まず、調整したい値をNumber入力へ出しておくと、Inspectorから変形量を変更しやすくなります。

## Polyline tab

Polyline tabでは、元polylineとの接続、Viewer表示、出力point数、X / Yの式を設定します。

### Connect Source Polyline here

ほかのpolylineをCustom Polyへ接続します。

接続した追加polylineは、`get2x()` / `get2y()`、`get3x()` / `get3y()` などから参照できます。

1つのshapeだけを加工するだけでなく、別shapeの位置を参照して出力shapeを作る場合に使います。

### Show View Controls

polylineのControlをViewerへ表示するかを切り替えます。

式で形を変えている途中にpoint位置をViewerで確認したい場合は有効にします。

### Number of Points

出力polylineのpoint数を指定します。

`0`の場合は、元のsource polylineと同じpoint数を使います。

0以外を指定すると、出力側のpoint数を固定できるため、元polylineのpoint配置とは別の密度でshapeを評価できます。21.1 Manualでは、これをpolylineのcustom subdivision量を制御するControlとして説明しています。

### Poly Expression X / Y

各output pointのX座標とY座標を計算する式です。

同じ式をpolyline全体へ1回だけ適用するのではなく、Custom Polyが各pointについて式を評価します。そのため、現在処理しているpointの位置やindex、polyline上の進行位置を式へ使えます。

## Custom Poly固有の式変数

Custom PolyではExpression Modifierの `n1 ... n9`、`p1x ... p9x`、`p1y ... p9y`、数学関数などに加え、polyline用の変数・関数を使えます。

- `px`, `py` — source polygon上で現在処理しているpointのX / Y
- `disp` — polyline上の位置。始点が0.0、終点が1.0
- `index` — 現在のoutput point番号。0始まり
- `num` — output point数
- `getx(disp)`, `gety(disp)` — source polyline上の任意の位置を取得
- `getx_at(disp, time)`, `gety_at(disp, time)` — 指定timeのpolylineから位置を取得
- `get2x()` / `get2y()`, `get3x()` / `get3y()` — 2本目・3本目のsource polylineを参照
- `get2x_at()` / `get2y_at()`, `get3x_at()` / `get3y_at()` — 2本目・3本目のpolylineを指定timeで参照

`disp`を使うと、元のpoint番号そのものではなく「polylineの始点から終点までのどこにいるか」を0〜1で扱えます。Number of Pointsで出力point数を変えた場合でも、同じ正規化位置を基準に別polylineを参照できます。

## 具体例: 2つのpolylineをNumber入力で補間する

21.1 Manualには、次のX / Y式が例として掲載されています。

~~~text
px*(1-n1)+n1*get2x(disp)
py*(1-n1)+n1*get2y(disp)
~~~

この式では、現在のsource point `px / py` と、2本目のpolylineの同じ `disp` 位置を `n1` で混ぜています。

- `n1 = 0` — 元のsource polyline
- `n1 = 1` — 2本目のpolyline
- 0〜1の途中値 — 2つの位置の中間

そのため、Number 1をAnimationすれば、2つのpolylineの間を連続的に変形する構成を作れます。

ここで重要なのは、point番号を直接1対1対応させているのではなく、`disp`を使ってpolyline上の正規化位置を参照している点です。

## Number of Pointsを使う場合

`Number of Points`を指定すると、Custom Polyが出力するpoint数を固定できます。

このとき `index` は現在のpoint番号、`num` は総point数、`disp` は始点から終点までの0〜1位置として使えます。

例えば、元のPolygonのpoint数が制作途中で変わっても、Custom Poly側では一定数のoutput pointでshapeを評価する、といった構成にできます。

具体的な変形式は用途ごとに異なるため、まず `px` / `py` をそのまま返して元shapeが維持されることを確認し、その後 `disp`、`index`、Number入力などを1つずつ加えると原因を追いやすくなります。

## Config tab

Config tabでは、Controls tabへ表示するPoint / Number入力の数と名前を設定します。

Point / Numberはいずれも最大9個まで使えます。

例えばNumber 1を `Blend`、Number 2を `Amplitude` のように用途に合わせて命名しておくと、式の `n1` / `n2` が何を表しているかInspector上で確認しやすくなります。

## 主な用途

Custom Polyが向いているのは、shape全体を1つのTransformで動かすのではなく、**polylineを構成するpointそのものを規則に沿って計算したい場合**です。

- 別polylineとの間を補間してshapeを変形する
- `disp`に応じてpolyline上の位置ごとに異なる処理を行う
- `index`を使ってpointごとに異なる規則を適用する
- Number / Point入力を外部Controlとして使い、procedural deformationを調整する
- output point数を固定してpolylineを再分割する

単にPolygon全体を移動・拡大縮小・回転したいだけなら、Custom Polyを使う必要はありません。Custom Polyは「shapeを構成する各pointを計算する」必要がある場合に使うModifierです。

## Pathとの組み合わせ

[Path](./path)にはshape animation用のpolylineがあり、21.1 ManualではCustom PolyをPolygon maskまたはPathへ追加できると説明されています。

Pathの「対象がどこを通るか」を表すpolylineそのものを数式で変形したい場合にCustom Polyを使えます。Path上を進むタイミングはPathのDisplacement側で扱うため、**経路の形を変える処理と、経路上の進行タイミングを変える処理は別**です。

## 注意点

Custom Polyの式はoutput polygonの各pointについて評価されます。通常のExpression Modifierと同じ感覚で「式を1回評価して1つの値を返す」と考えると、`px`、`disp`、`index`の意味を取り違えやすくなります。

また、`get2x()` / `get3x()`などを使う場合は、対応する追加polylineが接続されているかを先に確認します。

このページでは21.1 Manualで確認できるControl名と式変数を基準にしています。current runtimeのREGID、内部Parameter ID、Manualに記載されていないdefault / range、edition差はこのrunでは確定していません。

## 関連ページ

- [Expression](./expression)
- [Path](./path)
- [Modifier Family Overview](./)
- [Modifier / Parameter Sources](../../learn/05-time/modifier-parameter-sources)

## バージョンと出典

DaVinci Resolve 21.1 Reference Manual（September 2026）Chapter 124「Modifiers」pp.3001–3002を基準にしています。

同Manualで、Polygon mask / Pathへの追加方法、Controls tabのPoint / Number入力、Polyline tabのSource Polyline / View Controls / Number of Points / Poly Expression X・Y、`px` / `py` / `disp` / `index` / `num`、polyline参照関数、Config tabで最大9入力まで拡張・命名できることを確認しています。

current runtimeのREGID、内部Parameter ID、Manualに記載されていないdefault / range、edition差は別のruntime verification対象です。
