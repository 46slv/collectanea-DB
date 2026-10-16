---
title: 複数要素を等間隔に配置する考え方
description: 五つの画像を個別のTransformで配置し、始点・終点・番号からCenterを計算するFusion 21.1のRecipe。
doc_type: recipe
verification: partial
aliases: [equal spacing, distribute, indexed layout]
concepts: [expressions, normalized-coordinates, parameter-linking]
patterns: [master-follower-parameters, resolution-aware-positioning]
nodes: [Transform, Merge, Text+]
tasks: [layout, distribute, automate, repeat]
prerequisites: [expressions, normalized-coordinates]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-16"
---

# 複数要素を等間隔に配置する考え方

五つのタイトルや画像を横に並べるとき、それぞれの`Transform.Center`を手入力していると、並べる範囲を変えるたびにすべての位置を直す必要があります。このRecipeでは、**最初と最後のCenterを基準にし、その間を「要素数−1」個の等しい区間に分ける**構成を作ります。Fusionの`SimpleExpression`を使うため、あとで基準を変更しても位置の関係が保たれます。

ここで揃うのは**Center同士の距離**です。文字幅が違うタイトルの「字面の間の空白」や、画像の不透明部分の輪郭間隔を均等にする処理ではありません。また、式は配置を制御しますが、画像やNodeを自動複製する機能ではありません。

## できあがるもの

一つ目のCenterを`(0.20, 0.50)`、五つ目のX座標を`0.80`に指定すると、次の配置になります。

| 要素 | index（0から数える） | Center X | Center Y |
| --- | ---: | ---: | ---: |
| 1 | 0 | 0.20 | 0.50 |
| 2 | 1 | 0.35 | 0.50 |
| 3 | 2 | 0.50 | 0.50 |
| 4 | 3 | 0.65 | 0.50 |
| 5 | 4 | 0.80 | 0.50 |

始点と終点のX差`0.80 - 0.20 = 0.60`を、五要素の間にある四つの区間で割るため、隣同士のX差は`0.15`になります。`0.15`は15pxではなく、フレーム幅を1として表す[正規化座標](../../learn/03-space/normalized-coordinates)の差です。

## Node構成と入力・出力

別々の`Text+`から出る2D画像を五つの`Transform`で配置し、`Merge`で順に合成します。文字をロゴ画像や透過PNGに置き換えても構いません。

~~~text
Text1 → Transform1 ──────→ Merge1 (Foreground)
背景画像 ────────────────→ Merge1 (Background)
                                   │
Text2 → Transform2 ──────→ Merge2 (Foreground)
Merge1 ─────────────────→ Merge2 (Background)
                                   │
Text3 → Transform3 ──────→ Merge3 (Foreground)
Merge2 ─────────────────→ Merge3 (Background)
                                   │
Text4 → Transform4 ──────→ Merge4 (Foreground)
Merge3 ─────────────────→ Merge4 (Background)
                                   │
Text5 → Transform5 ──────→ Merge5 (Foreground)
Merge4 ─────────────────→ Merge5 (Background)
                                   │
                                MediaOut1
~~~

`Transform`の入力は配置したい**2D Image**、出力は位置を変えた2D Imageです。`Merge`はForeground画像をBackground画像へ合成します。上図の線は画像の流れです。一方、各`Center`の式から`Transform1`を参照する関係は、画像の接続線とは別です。

例では`Transform1`〜`Transform5`というNode名を使います。名前が異なる場合は式中の参照名も変更します。Resolve内Fusion以外では、`MediaOut1`に相当する末尾をそのCompositionの出力先へ読み替えてください。

## 手順1：始点を決める

`Transform1`のInspectorで`Center`を`X = 0.20`、`Y = 0.50`にします。これを始点として、後続の四つの`Transform`から参照します。

`Center`は二つの数値を持つPoint型Parameterです。`Pivot`は拡大や回転の中心なので、今回の位置の基準には使いません。五つの入力が同じフレーム座標を共有する構成を想定しています。

## 手順2：終点のXを一箇所で指定する

`Transform1`のInspectorに独自の数値Controlを一つ追加します。

1. Inspectorヘッダーの`Transform1`というNode名を右クリックし、`Edit Control`を開きます。
2. 新規Controlの**IDを`EndX`**、表示名（Name）を`End X`、型を`Number`、表示タブを`Controls`に設定します。
3. 追加した`End X`へ`0.80`を入力します。

`EndX`はここで作る**User Control**であり、標準のTransformに最初から付属する項目ではありません。式で使うのは表示名ではなく内部のIDです。追加しただけでは画像は動かず、次の手順で各Centerから参照させます。操作の詳細は[User Controls](../../learn/06-reuse/user-controls)を参照してください。

## 手順3：二つ目以降のCenterを計算する

`Transform2`の`Center`に`SimpleExpression`を追加します。21.1 Manualでは、Parameterの数値欄へ`=`を入力してReturnを押すと式欄とPick Whip（`+`）が現れる操作を説明しています。**X欄だけではなく、Center全体にPoint値を返す式**として扱います。

`Transform2.Center`（index = 1）：

~~~lua
Point(Transform1.Center.X + (Transform1.EndX - Transform1.Center.X) * (1/4), Transform1.Center.Y)
~~~

`Transform3.Center`（index = 2）：

~~~lua
Point(Transform1.Center.X + (Transform1.EndX - Transform1.Center.X) * (2/4), Transform1.Center.Y)
~~~

`Transform4.Center`（index = 3）：

~~~lua
Point(Transform1.Center.X + (Transform1.EndX - Transform1.Center.X) * (3/4), Transform1.Center.Y)
~~~

`Transform5.Center`（index = 4）：

~~~lua
Point(Transform1.Center.X + (Transform1.EndX - Transform1.Center.X) * (4/4), Transform1.Center.Y)
~~~

`Transform1.Center.X`が始点、`Transform1.EndX`が終点です。その差に`1/4`、`2/4`、`3/4`、`4/4`を掛けて始点へ足します。Yはすべて`Transform1.Center.Y`を参照するため、一つ目のYを動かせば全体が上下します。

Fusion 21.1 Manualには別NodeのParameter参照や`Point(Text1.Center.X, Text1.Center.Y-.1)`の例があります。ここで示した`EndX`と四つの式は、その構文を組み合わせた**Recipe用の設計例**であり、21.1実機でこの五Node構成を動作確認した結果ではありません。

## 手順4：値を変更して確かめる

初期値が`Transform1.Center = (0.20, 0.50)`、`EndX = 0.80`なら、五つのXは`0.20 / 0.35 / 0.50 / 0.65 / 0.80`です。

`EndX`を`0.90`に変えると、`0.20 / 0.375 / 0.55 / 0.725 / 0.90`となり、Center同士の差は`0.175`へ揃います。始点のXを動かしても、終点に向けて間隔を再計算します。始点にKeyframeを付ける場合は、各式はそのフレームにおける始点の値を参照する設計になります。

## 個数や並びを変える

要素数を`count`、0始まりの番号を`index`、始点と終点を`startX`と`endX`とした概念式は次です。

~~~text
t = index / (count - 1)
x = startX + (endX - startX) * t
~~~

`count=5`ならindexは`0,1,2,3,4`で、最後は`4/4=1`になります。`count=3`なら三つの式には`0/2`、`1/2`、`2/2`を使います。**`count=1`では分母が0になるため、この式を使いません。** 一要素なら始点へ直接配置します。

`index`と`count`はこの数式での説明用の変数名です。Fusionの`Transform`に同名の標準Parameterがあるわけではありません。Nodeを増減する場合は、必要な画像・`Transform`・`Merge`を追加または削除し、式の分子と分母も揃えてください。`count`の数値だけ変えればNodeが自動生成される、と考えないでください。

### 終点より間隔を優先したい場合

終点を指定する代わりに、始点から`0.15`ずつ並べたい場合、二つ目のCenterには次の式を使えます。

~~~lua
Point(Transform1.Center.X + 0.15 * 1, Transform1.Center.Y)
~~~

三つ目では`0.15 * 2`、四つ目では`0.15 * 3`のように番号だけ変えます。この方式は始点を動かしても**間隔を維持**しますが、最終位置は始点と要素数に応じて動きます。複数の式で間隔を一括変更したいなら、[親・追従パラメータの設計](../../patterns/automation/master-follower-parameters)で扱う`Spacing`のUser Controlを使います。

### 縦一列やGridへ応用する場合

縦に並べるならXを共通にし、Y側へ`index / (count - 1)`を使います。Gridではindexを行番号と列番号に分け、それぞれの軸に別の間隔を割り当てます。ただし行数・列数や並び順が必要なので、今回の横一列の式だけでGridが自動生成されるわけではありません。

### 一度だけ数値を均等に並べる場合

21.1 Reference Manual Chapter 69は、複数Controlの同時編集で使える`Set Values To > Spread`を説明しています。一度だけ複数の値を範囲に広げたいなら、この操作も選択肢です。**後から始点・終点を変えた際に各Centerが追従する**ことを重視する場合は、このRecipeのSimpleExpressionが向いています。

## うまくいかないとき

| 症状 | 確認すること |
| --- | --- |
| 式が反映されない | `SimpleExpression`欄があるか。実際のNode名が`Transform1`か。User ControlのIDが`EndX`か。 |
| Xだけが動いてYが揃わない | Center全体へ`Point(X, Y)`を返しているか。Xの数値欄だけを操作していないか。 |
| 間隔が不規則 | 分子が`1, 2, 3, 4`、分母がすべて`4`になっているか。 |
| ピクセルの距離と違う | 正規化された位置と`Reference Size`によるInspectorのピクセル表示を混同していないか。 |
| 文字の端が揃わない | この式はCenter間隔を揃える。文字幅、Size、Pivot、入力画像の余白は別に確認する。 |
| 要素が追加されない | 式は既存の位置を計算するだけ。画像とNodeの追加は別の作業。 |
| 式を消したい | Parameter名を右クリックして`Remove Expression`を選ぶ。 |

`Reference Size`は`Transform`のCenterをピクセル値として表示するための設定を持ちます。標準的な相対値`0.15`と15pxを同一視しないでください。[解像度を跨ぐ配置設計](../../patterns/transform/resolution-aware-positioning)も参考になります。

## 関連記事

- [2つのTransform位置を連動する](./link-transform-centers)：Pointを参照する最小例。
- [式（Expressions）](../../learn/05-time/expressions)：SimpleExpression、Pick Whipと戻り値の型。
- [親・追従パラメータ](../../patterns/automation/master-follower-parameters)：CenterとSpacingの責任分担。
- [User Controls](../../learn/06-reuse/user-controls)：独自Controlを追加する手順。
- [正規化座標](../../learn/03-space/normalized-coordinates)：Centerと相対値の違い。
- [Transform](../../nodes/transform/transform)：Center、Pivot、Reference Size。
- [Merge](../../nodes/compositing/merge)：ForegroundとBackgroundの接続。

## 出典と検証範囲

Blackmagic Design『**DaVinci Resolve 21.1 Reference Manual**』（2026年9月）：

- Chapter 69「Editing Parameters in the Inspector」pp.1515–1517：複数Controlの`Spread`、`Edit Control`、User ControlsのIDとName、Number型。
- Chapter 73「Using Modifiers, Expressions, and Custom Controls」pp.1586–1588：SimpleExpression、別NodeのParameter参照、`Point()`、Pick Whip、Remove Expression。
- Chapter 120「Transform Nodes」pp.2880–2882：Center、Pivot、Reference Size。

五つの`Text+`と`Transform`を用いたGraph、および`EndX`と上記の配置式は公式に記載された機能を組み合わせた**設計例**です。21.1実機でのGraph全体の動作確認は未実施のため、`verification: partial`としています。
