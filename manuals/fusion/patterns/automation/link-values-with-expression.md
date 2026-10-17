---
title: Expressionで値の関係を保つ
description: SimpleExpressionで別Nodeの値を参照し、同値・比率・位置差・時間差を実際の合成へ適用する。
doc_type: pattern
verification: partial
aliases: [Expression link, derived value, linked parameters]
concepts: [expressions, parameter-linking, derived-values]
patterns: [link-values-with-expression]
nodes: [Transform, Merge, Text+]
tasks: [automate, link-values, derive-values]
level: foundation
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-16"
---

# Expressionで値の関係を保つ

二つの合成で前景の不透明度を同時に変えたいとき、それぞれのMergeのBlendに同じ数値を手入力していると、後の調整で値が食い違います。Fusionの**SimpleExpression**を使えば、一方のParameterを基準とし、他方の値をその基準から計算できます。

ここで結ぶのは**Parameterの値**です。画像を運ぶNode Editorの接続線とは別なので、二つのMergeへ異なる画像を入力しながらBlendだけを連動させられます。

## 最初に決めること

- **Master（基準）**：値を調整する元のParameter。以下では`Merge1.Blend`。
- **Derived（派生）**：Masterから計算されるParameter。以下では`Merge2.Blend`。
- **SimpleExpression**：Parameterに付ける一行の式。参照先の現在値や時間などを読み、派生値を返します。

~~~text
Merge1.Blend = 0.8 ──参照・計算──→ Merge2.Blend = 0.8
                                   （式: Merge1.Blend）
~~~

SimpleExpressionで作る参照は**一方向**です。Merge2側をMasterへ逆向きにつながないように、どこで値を変更するのかを先に決めます。

[式（Expressions）の基本](../../learn/05-time/expressions)ではSimpleExpressionの使い方とExpression Modifierとの違いを説明しています。

## 実例1：二つのMergeのBlendをそろえる

別々の画像を処理する二つの枝で、前景を同じ割合で表示したい例です。

~~~text
背景A ─→ Merge1（Background） ─→ 出力A
前景A ─→ Merge1（Foreground）

背景B ─→ Merge2（Background） ─→ 出力B
前景B ─→ Merge2（Foreground）
~~~

二つの出力を後段で合成するかどうかは、Parameterの連動とは関係ありません。

1. Merge1とMerge2を配置し、双方のBackground／Foregroundへそれぞれ画像を接続します。
2. Merge1のBlendを`0.8`にします。
3. Merge2のBlendの数値欄へ`=`を入力し、Returnを押します。数値欄の下にSimpleExpression欄が現れます。
4. その欄へ次の式を入れます。

~~~lua
Merge1.Blend
~~~

5. Merge1のBlendを`0.3`へ変え、Merge2の値も`0.3`になることを確認します。

Node名を手入力したくない場合は、SimpleExpression欄の左にある`+`ボタンをMerge1のBlendへドラッグします。これは21.1 Reference Manualで**Pick Whip**と呼ばれる操作です。生成された式を確認すれば、実際の参照先も分かります。

同じBlend値でも、前景画像のAlphaや内容が違えばViewer上の結果は一致しません。**値の連動**と**見た目の一致**は分けて確認します。

## 実例2：片方の変化量を半分にする

Merge2の前景だけを控えめにしたい場合は、同値の参照を比率へ変えます。

~~~lua
Merge1.Blend * 0.5
~~~

Merge1が`0.8`ならMerge2は`0.4`、Merge1が`0.2`ならMerge2は`0.1`です。Masterを動かすたびに二つ目の値を計算し直す必要がありません。

これはMasterの値を半分にする**計算**であり、二つの画像の見た目の強さが正確に半分になる保証ではありません。派生先のParameterの許容範囲とViewerの結果を確認します。

## 実例3：Text+の位置に追従し、下へずらす

Text1のCenterに合わせて別の文字や画像を動かし、少し下に配置する例です。追従先の**CenterのようなPoint型Parameter**へSimpleExpressionを追加します。

~~~lua
Point(Text1.Center.X, Text1.Center.Y-.1)
~~~

Text1.CenterからXとYを読み、Xはそのまま、Yは`0.1`だけ小さくしたPointを返します。Text1が移動すれば、派生側も一定の位置関係を保ちます。これは21.1 Manualに載っているPoint式の例です。

ここでの`0.1`は画素数ではありません。正規化座標の差なので、画像サイズや後段Transformによって画面上の見え方は変わり得ます。また、Blendのような**数値型**ParameterへPointをそのまま返すことはできません。

### 固定数の要素を横並びにする場合

三つの異なるCenterへ、それぞれ次の式を一つずつ設定できます。

~~~lua
Point(Text1.Center.X + 0.08 * 0, Text1.Center.Y)
Point(Text1.Center.X + 0.08 * 1, Text1.Center.Y)
Point(Text1.Center.X + 0.08 * 2, Text1.Center.Y)
~~~

`0, 1, 2`は**手入力した並び番号**です。Fusionが自動で`index`を与えるという意味ではありません。三つともText1へ追従しながら、X方向に差が付きます。要素数や間隔を頻繁に変えるなら、間隔の値も共有する構成を検討します。

→ [親・追従パラメータを作る](./master-follower-parameters)／[等間隔配置の考え方](../../recipes/automation/equal-spacing-by-index)

## 実例4：5フレーム前のBlendを使う

Merge1のBlendがKeyframeで変化しており、Merge2を少し遅らせたい場合は、過去フレームの値を参照します。

~~~lua
Merge1:GetValue("Blend", time-5)
~~~

`time`は現在のフレーム番号です。この式はMerge1のBlendを**5フレーム前**で読みます。`Merge1.Blend`だけでは現在フレームの値を読むため、時間差は付きません。

この構文は21.1 Manualに記載されています。一方、**Expression Modifierは現在時刻以外のParameter値へ直接アクセスできません**。SimpleExpressionとExpression Modifierを区別してください。開始フレーム付近で範囲外を参照する場合は、元のAnimationの範囲と結果を確認します。

## 作るときの順序

1. 何を変更すれば全体が変わるのか決め、Masterを一つにします。
2. 派生先がNumberかPointか確認します。
3. 最初は`Merge1.Blend`のような単純参照だけで追従を確かめます。
4. 必要になったときだけ倍率、位置差、時間差を追加します。
5. Masterを二つ以上の値に動かし、派生値とViewerを確認します。
6. 時間による変化はSpline Editorにも表示して確かめます。

式は「同じ値をコピーする」ためだけでなく、**基準からどのような関係を保ちたいか**を残す手段です。

## 期待した結果にならないとき

| 症状 | 最初に確認すること |
| --- | --- |
| Merge2が追従しない | SimpleExpression欄が残っているか。実際のNode名とBlendを参照しているか。Pick Whipで参照を作り直す。 |
| 数値は同じでも見た目が違う | Mergeへ入る前景のAlphaや画像内容。Blendと合成結果は同一概念ではない。 |
| Centerの式が反映されない | 追従先がPoint型か。`Point(X,Y)`を返す必要があるか。 |
| 時間差が出ない | Masterに時間変化があるか。`GetValue(...,time-5)`を使っているか。 |
| 想定外の値まで連動する | InstanceやPublish / Connect Toなど、式以外の共有関係がないか。 |
| 名前を変更した後に動かない | 式に残る参照名と実際のNode名を再確認する。 |

派生した値からMasterへ戻るような**循環参照**は避けます。どちらが基準か分からなくなる構成は、後から保守しにくくなります。

## 他の共有方法との違い

| 目的 | 適した方法 |
| --- | --- |
| 異なる種類のNodeを倍率・位置差・条件で関連づける | **SimpleExpression** |
| 一つの値を複数箇所で直接共有する | **Publish / Connect To**。21.1 Manualはこの接続を双方向の連動として説明します。 |
| 同種のNodeの多くの設定をまとめて同期する | [Instance](../../learn/06-reuse/instances) |
| 多数のNumber / Pointを専用Controlで整理して計算する | [Expression Modifier](../../nodes/modifiers/expression) |
| 再利用するGraphへ操作項目を公開する | [Macro / Template](../../learn/06-reuse/macros-templates)／[User Controls](../../learn/06-reuse/user-controls) |

## 関連記事

- [式（Expressions）の基本](../../learn/05-time/expressions)
- [Modifier / Parameter Sources](../../learn/05-time/modifier-parameter-sources)
- [二つのTransform位置を連動する](../../recipes/automation/link-transform-centers)
- [Expressionが更新されないとき](../../troubleshooting/animation-automation/expression-does-not-update)

## 出典と確認範囲

Blackmagic Design『**DaVinci Resolve 21.1 Reference Manual**』（2026年9月）、**Chapter 73「Using Modifiers, Expressions, and Custom Controls」pp.1583–1588**。

同章で、Publish / Connect Toの双方向リンク、SimpleExpressionの追加方法、Pick Whip、一方向のParameter参照、`Merge1.Blend`、`Merge1:GetValue("Blend", time-5)`、`Point(Text1.Center.X, Text1.Center.Y-.1)`、Spline Editorでの表示を確認しました。

比率・横並び・二つのMergeの合成は、公式に説明された式の仕組みを組み合わせた制作例です。すべてのEditionでの実機操作、個々のParameterの既定値・範囲、内部Parameter IDは独立に検証していないため、`verification: partial`としています。
