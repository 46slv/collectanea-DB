---
title: 親・追従パラメータ（Master / Follower）を作る
description: 複数の画像や文字の位置・大きさを一つの基準から動かし、個別の間隔や倍率だけを分ける設計と実装。
doc_type: pattern
verification: partial
aliases: [master follower, linked parameters, derived values]
concepts: [expressions, parameter-linking, parameter-ownership]
patterns: [master-follower-parameters]
nodes: [Transform, Text+]
tasks: [automate, link-values, layout, reuse]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-16"
---

# 親・追従パラメータ（Master / Follower）を作る

画面内の三つのタイトルを一緒に動かしたいとき、三つの`Transform`の`Center`を個別に直すと、位置関係が少しずつずれます。**親・追従（Master / Follower）**は、調整する基準を一箇所に決め、ほかの値をその基準から求める設計です。

Fusionに「Master / Follower」という専用Nodeがあるわけではありません。ここでは、`SimpleExpression`や`Publish / Connect To`などの機能を使い、どの値を誰が決めるかを整理する考え方として使います。式の基本操作は[Expressionで値の関係を保つ](./link-values-with-expression)で説明しています。

## どの値を親にするか

- **Master（親）**：利用者が直接変更する基準値。三つのタイトルなら、一つ目の`Transform1.Center`など。
- **Follower（追従先）**：Masterを読んで値を決める項目。たとえば`Transform2.Center`。
- **Offset（差）**：Masterからどれだけ離すか。位置なら座標の差、タイミングならフレーム差。
- **Ratio（比率）**：Masterの値に何倍を掛けるか。たとえば別の要素の`Size`を8割にする。

~~~text
Transform1.Center（利用者が変更）
    ├── Transform2.Center = 親の位置 + 1区間
    └── Transform3.Center = 親の位置 + 2区間
~~~

「親を一つにする」とは、**同じ意味の値を複数箇所で手作業管理しない**ということです。位置の親と間隔の親は別のParameterでも構いません。どのParameterが各値の最終的な決定元かを明確にし、追従先から親へ戻る循環参照を作らないことが重要です。

## 最小構成：三つのタイトルを横に並べて動かす

三つの`Text+`を、それぞれ`Transform`で配置してから合成します。文字の内容を別々に保ちながら、位置だけを連動させる例です。

~~~text
Text1 → Transform1 ─────────────────→ Merge1 (Foreground)
Background1 ───────────────────────→ Merge1 (Background)
                                            ↓
Text2 → Transform2 ─────────────────→ Merge2 (Foreground)
Merge1 ────────────────────────────→ Merge2 (Background)
                                            ↓
Text3 → Transform3 ─────────────────→ Merge3 (Foreground)
Merge2 ────────────────────────────→ Merge3 (Background)
                                            ↓
                                         MediaOut1
~~~

この接続線は**画像を合成する経路**です。Centerを参照する式は別の関係なので、画像の入力元まで共有する必要はありません。各`Text+`の文字、色、Alphaは独立したままです。

### 1. Masterを決める

`Transform1`の`Center`を最初のタイトルの位置として使います。例として`X = 0.30`、`Y = 0.50`へ置きます。`Center`は二つの座標を含む**Point型**のParameterです。

以下の例は、三つの`Transform`がそれぞれ異なる画像を受け取り、`Transform1`が実際のNode名であることを前提にしています。Node名が異なる場合は式の参照名も合わせてください。

### 2. 二つ目の位置を式で求める

`Transform2.Center`へSimpleExpressionを設定し、次を入力します。

~~~lua
Point(Transform1.Center.X + 0.18, Transform1.Center.Y)
~~~

これは親のX座標に`0.18`を足し、Y座標はそのまま使う式です。`Transform1.Center`が`(0.30, 0.50)`なら、二つ目は`(0.48, 0.50)`を返します。

### 3. 三つ目も同じ基準を読む

`Transform3.Center`には次の式を使います。

~~~lua
Point(Transform1.Center.X + 0.18 * 2, Transform1.Center.Y)
~~~

この場合、三つ目のCenterは`(0.66, 0.50)`です。`Transform2.Center`を参照してさらにずらすのではなく、**どちらのFollowerもTransform1を直接参照**しています。

### 4. 親を動かして確認する

`Transform1.Center.X`を`0.30`から`0.35`へ変えます。式が機能していれば、三つのCenterのXは`0.35 / 0.53 / 0.71`となり、相互の差`0.18`は変わりません。

`0.18`は**18ピクセルではなく正規化座標の差**です。また、Center間隔が同じでも文字列の幅が違えば、文字の端同士の空きは同じになりません。文字の外形を基準とする厳密な配置は、別途テキスト寸法を考慮する必要があります。

この例の式は、21.1 Manualに記載された`Point(...)`と別Node Parameter参照を組み合わせた構成案です。上記の三タイトル合成そのものを21.1実機で検証した結果ではありません。

## 間隔を一箇所で変えるには

上の式では`0.18`を二箇所に書いているため、間隔だけを変えたいときに二つの式を修正する必要があります。頻繁に変更するなら、親Nodeへ**Spacing**という数値のUser Controlを作り、その値を参照します。

[User Controls](../../learn/06-reuse/user-controls)の`Edit Control`で、たとえば`Transform1`へ数値型のControlを追加し、内部識別子（ID）を`Spacing`とします。`Name`はInspectorに表示する名前で、式が参照するのはIDです。Controlを追加しただけではFollowerは動かないため、次のように各式から値を読みます。

~~~lua
-- Transform2.Center の式
Point(Transform1.Center.X + Transform1.Spacing, Transform1.Center.Y)
~~~

~~~lua
-- Transform3.Center の式
Point(Transform1.Center.X + Transform1.Spacing * 2, Transform1.Center.Y)
~~~

Spacingを`0.12`へ変更すれば、親を動かさずに二つの位置差を同時に調整できる構成になります。上の`Spacing`というIDと式は**新たに追加するControlを前提にした設計例**であり、標準のTransformにその項目が最初から存在するという意味ではありません。実機ではControl追加後にInspectorで値と参照結果を確かめてください。

この仕組みを他のCompositionでも再利用するなら、Controlを追加したNodeの設定を保存するか、[Macro / Template](../../learn/06-reuse/macros-templates)にして必要な操作を公開します。

## 同じ値・異なる値をどう扱うか

### すべて同じ値でよい場合

位置差や倍率を計算しないのであれば、`Publish / Connect To`で複数Parameterを一つの公開値へ接続する方法があります。21.1 Manualの`Connect To`は、適合するParameter同士の**双方向の連動**として説明されています。一つのParameterを触ると、同じ接続先の値も変わる使い方です。

### 親から計算した値が必要な場合

`SimpleExpression`は、参照元を読み、追従先の値を**一方向**に求めます。位置の差・倍率・条件・時間差を残す場合はこちらを使います。例として、`Transform2.Size`を親の8割にしたいなら、数値Parameterへ次の式を設定できます。

~~~lua
Transform1.Size * 0.8
~~~

`Size`の数値が8割になっても、異なる素材の画面上の見た目まで必ず8割の大きさになるわけではありません。入力画像や前段の変形を含めて確認します。

### 同種Nodeの多くの設定を共有したい場合

ぼかしや色補正Nodeを複製し、多数の設定を一緒に変えたいなら[Instance](../../learn/06-reuse/instances)が向いています。`Paste Instance`で作ったNodeでは、多くの設定を共有しながら、必要なParameterだけ`Deinstance`して独立させることもできます。単一の位置関係を作りたいだけなら、全設定を共有する必要はありません。

### 計算する値が増えた場合

MasterがCenter、Spacing、Opacityなど複数になり、各式の参照が読みにくくなったら、[Expression Modifier](../../nodes/modifiers/expression)で入力を整理する方法もあります。式の長さを減らすことより、どの値が何を操作するかが分かる配置を優先します。

## 保つべき条件

1. **決定元を明示する。** 同じ意味の値をあちこちで手入力せず、Masterを変更すれば結果が変わるようにします。
2. **循環参照を作らない。** FollowerからMasterへ値を返す式や、Follower同士を相互参照する式は避けます。
3. **型を合わせる。** `Center`はPoint、`Size`や`Blend`は数値です。Pointを必要とする場所では`Point(X, Y)`を返します。
4. **単位を混同しない。** この例のCenter差は正規化座標です。固定ピクセルの間隔や文字端の等間隔配置とは別に考えます。
5. **名前と参照を確認する。** Node名・User ControlのIDを変更した場合は、式が実際のParameterを読めているか確認します。

## うまく動かないとき

| 症状 | 確認すること |
| --- | --- |
| Followerが動かない | 参照先のNode名・Parameter名、SimpleExpression欄、`Point(...)`の戻り値を確認する。 |
| 二つの値は合っているのに見た目が違う | 各Text+の文字幅、素材のAlpha、前後のTransformやMergeを確認する。 |
| 一部の値が逆方向に変わる | `Connect To`やInstanceによる共有と、一方向のSimpleExpressionを取り違えていないか確認する。 |
| Spacingの値を変えても反映しない | User ControlのIDを確認し、各Followerが`Transform1.Spacing`を参照しているか見る。 |
| 要素を増やすたびに式が複雑になる | 手入力の`0, 1, 2…`をどこで管理するか見直す。[等間隔配置のRecipe](../../recipes/automation/equal-spacing-by-index)へ進む。 |
| キーフレームを付けた親に追従しない | 現在フレームのMaster値、式の参照先、Spline Editorに表示される値を確認する。 |

Masterを一つ変えたら、少なくとも二つの値で動作を確認します。たとえば`Center.X`を`0.30`と`0.35`へ動かし、Followerの差が保たれるかを比較します。

## 関連記事

- [Expressionで値の関係を保つ](./link-values-with-expression)：SimpleExpressionとPick Whipの追加方法、時間差の付け方。
- [2つのTransform位置を連動する](../../recipes/automation/link-transform-centers)：二つの画像の位置だけを結ぶ小さなRecipe。
- [複数要素を等間隔に配置する考え方](../../recipes/automation/equal-spacing-by-index)：個数・番号・始点・終点から位置を計算するRecipe。
- [Transform](../../nodes/transform/transform)：Center、Pivot、Size、Angleの意味。
- [式（Expressions）](../../learn/05-time/expressions)：Number / Point / Text型とSimpleExpressionの基礎。

## バージョンと確認範囲

**Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月）**を根拠としています。

- **Chapter 73「Using Modifiers, Expressions, and Custom Controls」pp.1583–1584**：Publish / Connect Toでの値の共有、適合するParameterへの接続、双方向の連動。
- **同章 pp.1586–1588**：SimpleExpressionの一方向参照、`Merge1.Blend`、`Point(Text1.Center.X, Text1.Center.Y-.1)`、Pick Whip、Spline Editor。
- **Chapter 69「Editing Parameters in the Inspector」pp.1515–1517**：User ControlsのID・Name・TypeとEdit Control。

三つのタイトルの配置、Spacing Control、`Transform1`を使った式は、Manualで説明される機能から組み立てた**制作例**です。すべてのEdition・OSでの実機動作、Controlの内部ID、Node名変更時の自動追従は未検証のため、`verification: partial`を維持しています。
