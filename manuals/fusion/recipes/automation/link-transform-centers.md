---
title: 2つのTransform位置を連動する
description: 2つの画像に別々のTransformを置き、SimpleExpressionでCenterを同期する。位置差を保つ構成と確認手順。
doc_type: recipe
verification: partial
aliases: [link centers, sync position, linked transform]
concepts: [expressions, parameter-linking, normalized-coordinates]
patterns: [master-follower-parameters, share-position-across-elements]
nodes: [Transform, Merge]
tasks: [link-values, position, automate]
prerequisites: [expressions, transform-controls]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-16"
---

# 2つのTransform位置を連動する

2枚のロゴや2つのタイトルを一緒に移動したい場合、各`Transform`の`Center`を手作業で合わせ続ける必要はありません。片方の位置を基準にして、もう片方がその値を読む`SimpleExpression`を設定します。

このRecipeでは、**同じ位置へ重ねる方法**と、**一定の距離を空けたまま一緒に動かす方法**を作ります。二つの画像は独立していて構いません。画像をつなぐ線と、位置を参照する関係は別です。

## できあがるもの

`Transform1.Center`を変更すると、`Transform2.Center`が追従します。例えば、最初のCenterを`(0.40, 0.50)`に置き、二つ目を右へ`0.15`だけ離すと、二つ目は`(0.55, 0.50)`になります。最初を`(0.45, 0.60)`へ動かせば、二つ目も`(0.60, 0.60)`へ移動します。

`0.15`は15ピクセルではなく、[正規化座標](../../learn/03-space/normalized-coordinates)で表した位置の差です。この例では両方のTransformが同じ大きさの2D画面で使われているものとします。

## 用意するNodeと画像の流れ

別々の画像を二つのTransformに入れ、`Merge`で重ねます。例えばResolve内のFusionページなら次の構成です。

~~~text
Text1 ──→ Transform1 ─────────────→ Merge1 [Foreground]
Background1 ─────────────────────→ Merge1 [Background]
                                       │
Text2 ──→ Transform2 ─────────────→ Merge2 [Foreground]
Merge1 ──────────────────────────→ Merge2 [Background]
                                       │
                                    MediaOut1
~~~

`Text1`と`Text2`は例であり、ロゴ画像などでも構いません。`Transform1`と`Transform2`には、それぞれ**別の画像**を入力します。上図の線は画像の接続です。`Center`を参照する式のために、Transform同士を画像で直列接続する必要はありません。

このあと使う式は、Node名が実際に`Transform1`と`Transform2`であることを前提にしています。名前が異なる場合は式中の参照名を合わせてください。

## 手順1：基準となる位置を決める

1. `Transform1`を選び、Inspectorの`Center X / Y`を確認します。
2. `Center`を`X = 0.40`、`Y = 0.50`にします。
3. `Transform2`にはまだ位置のKeyframeや別の連動を設定せず、どちらの画像もViewerに表示できることを確認します。

`Center`はXとYを持つ**Point型**のParameterです。画像の拡大縮小や回転を決める`Size`や`Angle`とは別なので、このRecipeでは`Center`だけを連動させます。

## 手順2：同じ位置へ連動する

1. `Transform2`の`Center`へ`SimpleExpression`を追加します。21.1 Manualでは、Parameterの数値欄に`=`を入力してReturnを押すと、式欄とPick Whip（`+`）が現れる操作を説明しています。**Xだけの数値式ではなく、Center全体のPointを返す式**を作ります。
2. 式欄に次を入力します。

~~~lua
Transform1.Center
~~~

3. `Transform1.Center`を動かし、`Transform2.Center`も同じ座標になるかを確認します。

これは一方向の参照です。`Transform2`で値を独立に編集したいなら、後述の方法で式を変更するか削除します。`Transform1`の画像、色、Alphaなどは連動しません。

Node名・Parameter名の入力ミスを避けるには、`Transform2`の式欄にある`+`を`Transform1`の`Center`へドラッグする**Pick Whip**も使えます。作られた参照が`Transform1.Center`になっていることを確認します。

## 手順3：位置の差を保ったまま連動する

二つの要素を完全に重ねるのではなく、右へ一定量ずらしたい場合は、`Transform2.Center`の式を次に変更します。

~~~lua
Point(Transform1.Center.X + 0.15, Transform1.Center.Y)
~~~

式の`Point(X, Y)`は、XとYをまとめて位置として返します。Xは基準から`+0.15`、Yは基準と同じです。`Transform1`をアニメーションしても二つの要素のCenter間の差が残ります。

下へ`0.10`ずらす場合は、21.1 Manualにある`Point(Text1.Center.X, Text1.Center.Y-.1)`と同じ考え方で、次のように指定できます。

~~~lua
Point(Transform1.Center.X, Transform1.Center.Y - 0.10)
~~~

両軸を動かす場合は、XとYのそれぞれに必要な差を加えます。

~~~lua
Point(Transform1.Center.X + 0.15, Transform1.Center.Y - 0.10)
~~~

ここで保たれるのは**Center同士の差**です。画像や文字の幅が異なると、見えている輪郭同士の距離まで一定になるとは限りません。また、Reference SizeでCenterがピクセル表示されている場合も、式で扱う値と表示単位を混同しないようにします。

## 手順4：実際に動かして確認する

| `Transform1.Center` | `Transform2.Center`（右へ`0.15`） | 確認すること |
| --- | --- | --- |
| `(0.40, 0.50)` | `(0.55, 0.50)` | Yが同じで、X差が`0.15` |
| `(0.45, 0.60)` | `(0.60, 0.60)` | 基準を動かしても同じ差 |
| `(0.30, 0.40)` | `(0.45, 0.40)` | 別の位置でも式が反映される |

`Transform1.Center`にKeyframeを付けて動かす場合、`Transform2`は現在フレームの`Transform1.Center`から位置を求めます。時間による動きはSpline Editorでも確認できます。式の基本操作は[式（Expressions）](../../learn/05-time/expressions)を参照してください。

## 同期方法の選び分け

- **同じCenterを一方向に使う**：`Transform1.Center`。基準を編集する場所を一つにできます。
- **位置差を加える**：`Point(Transform1.Center.X + 0.15, Transform1.Center.Y)`。個別の配置を残せます。
- **Xだけ追従し、Yは固定する**：`Point(Transform1.Center.X, 0.50)`。横移動だけを共有します。
- **値を双方向に共有する**：`Publish / Connect To`。21.1 Manualでは、接続したどちらのParameterからも値を変更できると説明しています。位置差を計算するならSimpleExpressionのほうが適しています。
- **同じ種類のNodeの多数の設定を共有する**：[Instance](../../learn/06-reuse/instances)。Centerだけを異なる式で配置したい今回の目的とは共有範囲が違います。

基準位置と複数のOffsetを再利用する場合は、[親・追従パラメータ](../../patterns/automation/master-follower-parameters)で、SpacingなどをUser Controlsに分離する設計を紹介しています。

## うまくいかないとき

| 症状 | 確認する箇所 |
| --- | --- |
| 二つ目の位置が変わらない | 式欄が残っているか。実際のNode名が`Transform1`か。Pick Whipで参照先を作り直せるか。 |
| Xだけが変わる／式の結果がおかしい | Center全体のPointではなく、XだけのNumberに式を入れていないか。`Point(X, Y)`を返しているか。 |
| 二つの画像が重ならない | Centerだけでなく、元の画像内容・Alpha・Pivot・Size・各画像のキャンバスを確認する。 |
| 位置差が想定したピクセル数と違う | 正規化座標とReference Sizeでの表示単位を区別する。 |
| 連動が循環する | `Transform1`側から`Transform2`へ戻る参照を作らない。 |
| 式を消したい | 21.1 Manualの操作はParameter名の右クリック → `Remove Expression`。 |

より一般的な診断は[Expressionが更新されないとき](../../troubleshooting/animation-automation/expression-does-not-update)、複数要素の配置設計は[位置関係を共有するPattern](../../patterns/transform/share-position-across-elements)を参照してください。

## 関連Nodeと前提

- [Transform](../../nodes/transform/transform)：2D Imageの位置・サイズ・回転を変更するNode。
- [Merge](../../nodes/compositing/merge)：別々のImageをForeground / Backgroundとして合成するNode。
- [正規化座標](../../learn/03-space/normalized-coordinates)：`Center`に入力する位置の考え方。

## 出典と検証範囲

Blackmagic Design『**DaVinci Resolve 21.1 Reference Manual**』（2026年9月）、Chapter 73「Using Modifiers, Expressions, and Custom Controls」**pp.1583–1588**。SimpleExpressionの追加、別NodeのParameter参照、`Point()`と`.X / .Y`、Pick Whip、Publish / Connect To、Remove Expressionを確認しました。Transform自体のCenterとReference Sizeは同Manual Chapter 120（pp.2879–2883）に基づきます。

`Point(Transform1.Center.X + 0.15, Transform1.Center.Y)`などの具体例は、Manualに記載された構文を組み合わせたRecipeです。21.1の実機でこのGraphを再生・検証した結果ではないため、`verification: partial`としています。
