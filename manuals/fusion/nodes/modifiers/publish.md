---
title: "Publish"
description: "静的Parameterを公開し、Connect Toで他Parameterと同じ値を双方向に共有するためのModifier。"
doc_type: node
term_id: "publish"
term_short: "Publishは、静的ParameterをConnect Toから参照できるようにし、複数Parameterを同じ値へ双方向接続するModifier。"
verification: partial
aliases: ["Publish", "Publish Modifier"]
concepts: ["parameter-data", "parameter-linking", "modifiers"]
nodes: ["Publish"]
node_family: "modifiers"
inputs: ["parameter"]
outputs: ["parameter"]
tasks: ["link-values", "share-parameter", "drive-parameter"]
level: foundation
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-06"
---

# Publish

Publishは、**静的なParameterを他のParameterから接続できるようにする**ためのModifierです。

通常、AnimationされたParameterは`Connect To`の候補として使えます。一方、Keyframeなどを持たない静的Parameterを別のParameterと直接つなぎたい場合は、まずPublishして接続先として公開します。

```text
公開するParameter
      ↓ Publish
published value
      ↓ Connect To
別のParameter
```

Publish自体が数式を計算したり、時間変化を作ったりするわけではありません。複数のParameterへ同じ値を使わせたいときの、直接的な共有方法として使います。

## 基本操作

### 1. 基準にするParameterをPublishする

値を基準にしたいParameterを右クリックし、`Publish`を選びます。

Publishすると、そのParameterはModifiersタブへPublished Valueとして表示され、互換性のある別Parameterから接続できるようになります。

### 2. 別のParameterをConnect Toで接続する

同じ値を使わせたい別Parameterを右クリックし、`Connect To`サブメニューから公開したParameterを選びます。

21.1 Manualでは、接続できる候補だけが`Connect To`に表示されると説明されています。数値、Pointなど型が合わないParameterを無理に接続するための機能ではありません。

## 接続するとどうなるか

Publish / Connect ToでつないだParameterは、同じ値を共有します。

21.1 Manualではこの接続は**双方向**で、接続後はどちら側を編集しても、もう一方の値も変わると説明されています。

たとえば2つのTransformのSizeを同じ値で操作したい場合、片方のSizeをPublishし、もう片方のSizeを`Connect To`で接続できます。以後はどちらのSizeを変更しても、2つが同じ値になります。

複数のParameterを同じpublished valueへ接続することもできます。

```text
Transform1.Size
      ↓ Publish
  Published Size
    ↙    ↓    ↘
Size A Size B Size C
```

1つの値を動かして複数箇所をまとめて調整したいときに使えます。

## 入力と出力：映像ではなくParameterの値を共有する

Publishが受け取るのは、元のNodeのInspectorにあるParameterの値です。接続先が受け取るのも、画像ではなく**同じ種類のParameterの値**です。たとえばTransformのSizeなら数値を、Centerのような位置Controlなら位置を共有することになります。接続可能な組み合わせは`Connect To`のメニュー側で絞り込まれます。

Publishを追加しても、Node Editorに新しい映像用Input / Output端子ができるわけではありません。映像の流れは元のNode構成のままで、Inspectorで使う値の参照関係だけが変わります。

## 操作例：別々の映像にある2つのTransformを同じSizeにする

2枚の画像を別々のTransformで縮小するとき、後から両方の大きさを揃えて変更できる構成を作ります。次は21.1 Manualに記載されたPublish / Connect Toの動作を確かめるための操作例です。

```text
Background1 → Transform1 → Viewer 1
Background2 → Transform2 → Viewer 2
                  ↑
        Transform1のSizeを共有
```

1. 2つのBackgroundを用意し、それぞれの後ろにTransformを接続します。2つのTransformを別々のViewerへ表示します。
2. `Transform1`のInspectorで`Size`を`0.5`に設定します。`Size`を右クリックして`Publish`を選びます。
3. `Transform2`の`Size`を右クリックし、`Connect To`から公開した`Transform1`のSizeに対応する項目を選びます。
4. `Transform1`のInspectorで`Modifiers`タブを開き、`Published Value`を変更します。`Transform2`のSizeも同じ値になり、両方の縮小率が一緒に変わることを確認します。
5. 必要なら3つ目のTransformも同じ公開元へ接続します。公開元を追加で作る必要はありません。

**同じSizeでも、見える画像が同じ大きさ・位置になるとは限りません。** Sizeが揃うのは拡大縮小率であり、入力画像の内容や解像度、Center / Pivotなどのほかの設定まで揃える機能ではありません。

## 期待どおりに共有されないとき

| 症状 | まず確認すること |
| --- | --- |
| `Connect To`に公開元が見つからない | 元Parameterに`Publish`を実行したか確認します。候補は接続先と互換性のあるParameterに絞られるため、数値と位置など異なる種類を選んでいないかも確認します。 |
| `Connect To`を選んでも値が連動しない | 接続先で実際に公開元を選択したかを確認し、公開元の`Modifiers`タブにある`Published Value`を1つだけ変更して値の連動を観察します。 |
| 値は同じなのに画面の結果が違う | 両方の入力画像と、Size以外のCenter / Pivot等を確認します。Publishは映像の内容やほかのControlを同期しません。 |
| 一方を2倍・半分にしたい | Publishだけでは値を演算できません。単純な式なら[SimpleExpression](../../learn/05-time/expressions)、計算と参照時刻の調整なら[Calculation](./calculation)を検討します。 |

## AnimationされたParameterとの関係

Publishは主に**非AnimationのParameterを接続可能にする**ために使います。

DaVinci Resolve 21.1 Reference Manualでは、AnimationされたControlは自動的にpublishされ、`Connect To`から利用できると説明されています。静的Controlは必要な場合に手動でPublishします。

そのため、すでにAnimationされたParameterを別Parameterへそのまま共有したいだけなら、明示的なPublishが不要な場合があります。

## Motion Pathを共有する

Publishは単純なNumberだけでなく、Parameterの型に応じた値を共有できます。

21.1 Manualでは、Motion PathをPublishして複数Objectを同じPathへ接続する例が挙げられています。

つまりPublishは「同じ数値を使う」だけではなく、**複数Parameterが1つの既存Parameter sourceを共有する**ための仕組みとして考えると分かりやすくなります。

## Pick Whip / SimpleExpressionとの違い

[SimpleExpression](../../learn/05-time/expressions)のPick WhipでもParameter同士を接続できますが、役割は少し違います。

Publish / Connect Toは、2つ以上のParameterへ**同じ値を直接共有する**のに向いています。Manual上、この接続は双方向です。

SimpleExpressionは、参照元の値をそのまま使うだけでなく、式を足して別の値へ変換できます。

```lua
Transform1.Size * 0.5
```

「同じ値にしたい」ならPublish / Connect To、「参照元から計算した値を使いたい」ならSimpleExpressionや[Expression Modifier](./expression)を選ぶと整理しやすくなります。

## Calculationとの違い

[Calculation](./calculation)は2つのOperandを演算し、値の範囲や参照時間まで調整できます。

Publishは値を加工しません。

- そのまま同じ値を共有する → Publish / Connect To
- 足す、掛ける、範囲を合わせる → Calculation
- 複雑な式や複数入力を使う → Expression Modifier

という使い分けが基本です。

## Resolve Parameterとの違い

[Resolve Parameter](./resolve-parameter)は、Fusion transition templateのParameterをEdit / Cut page上のtransition durationへ連動させるためのModifierです。

Publishは通常のFusion comp内でParameter同士を接続するために使うため、目的が異なります。

## 注意点

Publish / Connect Toは、Node EditorのImage端子をつなぐ機能ではありません。Inspector内のParameter同士を接続します。

また、複数Parameterが同じpublished valueを共有すると、個別に別の値を持てなくなります。後から独立して調整したいParameterまでまとめて接続しないようにします。

## 関連ページ

- [Modifier](./)
- [Calculation](./calculation)
- [Expression Modifier](./expression)
- [Resolve Parameter](./resolve-parameter)
- [式（Expressions）](../../learn/05-time/expressions)
- [Modifier / Parameter Sources](../../learn/05-time/modifier-parameter-sources)

## バージョンと出典

DaVinci Resolve 21.1 Reference Manual（September 2026）Chapter 69「Editing Parameters in the Inspector」pp.1511–1512、Chapter 73「Using Modifiers, Expressions, and Custom Controls」pp.1583–1585、Chapter 124「Modifiers」p.3024を基準にしています。

静的ParameterのPublish、AnimationされたControlの自動Publish、`Connect To`の型に応じた候補表示、Publish / Connect Toの双方向接続、1つのpublished valueを複数Parameterへ接続できること、Motion Path共有の例を21.1 Manualで確認しています。

current runtime REGID、内部Parameter ID、edition差はこのページでは確認していません。