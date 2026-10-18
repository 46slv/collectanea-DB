---
title: sRestyle
description: 入力したShapeの塗りと輪郭線の見た目を、図形生成とは別の段階で上書きするKrokodoveツール。
doc_type: node
term_id: srestyle
term_short: Shapeの塗りや輪郭線の見た目を後段で変更するKrokodoveツール。
verification: partial
aliases: [sRestyle]
concepts: [shape-data]
nodes: [sRestyle]
node_family: krokodove
inputs: [shape]
outputs: [shape]
tasks: [build-shape, style-shape]
product_scope: fusion
suite_surfaces: [fusion]
updated: '2026-10-19'
---

# sRestyle

**sRestyle**は、すでに作った図形の**塗りと輪郭線の見た目を、後から変更する**KrokodoveのShapeツールです。図形の形を作り直すのではなく、前段で設定した外観を後段で上書きしたいときに使います。

ここでいう<Term id="shape-data">Shape</Term>は、円や四角の輪郭などを保持するデータです。まだ画面上のピクセル画像にはなっていません。sRestyleで見た目を変更した結果は、通常の画像合成へ進む前に[sRender](../shapes/s-render)で2D Imageへ変換します。

## 何を変えるのか

例えば、円の形・大きさ・色を最初のノードで決めたあと、色だけを別の場所で変更したいとします。このとき、円の形を作るノードは残したまま、後ろにsRestyleを置いて外観を管理する構成を検討できます。

- **塗り（fill）**：円や四角の内側をどう見せるか。図形の面の表現です。
- **輪郭線（outline）**：図形の境界をどう見せるか。内側の塗りとは区別して考えます。
- **上書き（override）**：上流の設定を残したまま、後段で外観の指定を置き換えることです。

Blackmagic Designの21.1 Reference Manualは、入力されたShapeの外観を、塗りまたは輪郭のプロパティで上書きできると説明しています。ただし、**色、線幅、線種、不透明度それぞれに独立したInspector項目があるか**までは、この記述から分かりません。具体的な項目名は推測していません。

sRestyleは**輪郭の形状そのものを変更するためのツールではありません**。角を丸めたいなら[sRound](./sround)、輪郭の位置を変えたいなら[sOffset](./offset-krokodove)と、目的を分けて考えます。

## 入力と出力

| 段階 | 扱うデータ | 意味 |
| --- | --- | --- |
| 入力 | Shape | 前段で生成した円・四角などの図形データを受け取る。 |
| 処理 | 外観の変更 | 塗り・輪郭線の見た目を後段で上書きする。 |
| 出力 | Shape | さらにShapeを加工するか、sRenderへ渡して画像化する。 |

**Shapeの入出力分類は既存COLLECTANEAカタログに基づきます。** 21.1 Manualの該当節は正式なポートラベル、端子数、必須／任意の違いを示していません。「入力された単数・複数のShape」という説明だけから、複数の独立した入力端子があるとは判断できません。

画像を合成したいときの通常の流れは、**Shapeを作る → Shapeのまま加工する → sRenderで画像にする → Merge等で合成する**、という順です。[Shape系の入口](../shapes/)でもこの違いを説明しています。

## 最初に試す構成

次は各ノードの役割から考えた**実機確認用の構成案**です。Krokodoveでの接続結果を検証済みのレシピではありません。

```text
sEllipse → sRestyle → sRender → MediaOut
  円を作る     外観を変える    画像化      表示
```

1. [sEllipse](../shapes/s-ellipse)で円を作り、まず**sEllipse → sRender**だけでViewerに円が出ることを確かめます。
2. sEllipseとsRenderの間にsRestyleを置きます。画像化する前のShape段階で、外観を変える位置を作ります。
3. sRestyleを選択して実際のInspectorを確認し、塗りや輪郭に関わる設定をひとつだけ変更します。正式なコントロール名・初期値・値域は未確認なので、名称は決め打ちしません。
4. sRestyleの有効／無効を比較し、円の形を定義するsEllipse側を変更せずに、見た目だけを調整できるか確かめます。
5. 結果が分からない場合は、sRestyleを外した状態のsRender出力、透明部分の表示、後段ノードの影響を順に確認します。

形を直す作業はsEllipse側、塗りや輪郭の表現を直す作業はsRestyle側、という分担ができるかを観察するのが目的です。

## 複数のShapeでの用途

タイトルの周りに円と四角を置き、両者の配色をあとから揃える場面を考えます。個々のShapeを作る処理と、まとめたあとの外観変更を分ける候補として次のような構成があります。

```text
sEllipse ────┐
             sMerge → sRestyle → sRender → Merge（背景と合成）
sRectangle ──┘
```

これは**検証前の構成案**です。標準[sMerge](../shapes/smerge)でShapeをまとめられる一方、sRestyleが結合後の各図形へどう作用するか、各図形の元の設定をどの順番で上書きするかは21.1 Manualから確定できません。最初は単一Shapeの例で挙動を確認し、その後複数に広げます。

別の使い方として、ひとつの円の形を保ったまま、カットごとに外観を変えるモーショングラフィックスも考えられます。ただしsRestyle固有のキーフレーム対応や補間方法は未確認です。アニメーション可能だと断定せず、Inspectorで確認してから制作へ使います。

## 関連ノードとの違い

| ノード | 役割 | 選ぶ目安 |
| --- | --- | --- |
| **sRestyle** | Shapeの塗り・輪郭の見た目を上書き | 図形の形と外観の調整位置を分けたい |
| [sChangeStyle](../shapes/schangestyle) | 標準Shape系で色とAllow Combiningを上書き | 色や重なり部分のAlphaの扱いを調整したい |
| [sWriteOn](./swriteon) | 輪郭線を現す・隠す | 線が描かれる／消える見せ方を作りたい |
| [sRound](./sround) | 角を曲線にする | 形そのものの角を丸めたい |
| [sOffset](./offset-krokodove) | 輪郭を外側・内側へ移動する | 図形の広がり方を変えたい |

sRestyleと標準の**sChangeStyleは別のノード**です。21.1 ManualのChapter 117は、sChangeStyleについてColorとAllow Combiningの設定を詳しく説明しています。Allow CombiningはShapeの重なりでのAlphaの扱いに関係します。しかし、**それらのInspector項目がKrokodoveのsRestyleにも存在するとは確認できません**。

また、sWriteOnは輪郭の表示・非表示に関わるツールです。線の外観を変更したいのか、線が現れていく演出を作りたいのかで使い分けます。

## 注意点と確認範囲

- **正式なInspector項目**：塗り・輪郭への作用は一次資料で確認済みです。個々の設定名・初期値・値域・キーフレーム対応は未確認です。
- **複数Shape**：Manualの「incoming shape(s)」は複数の図形を扱える可能性を示しますが、入力端子数や各Shapeへの適用規則までは示しません。
- **ShapeとImageの違い**：sRestyleを2D画像の色補正ノードと同じ位置に置かないでください。画像化後の色調整なら、sRender以降のImage系処理を検討します。
- **環境差**：内部REGID、Resolve Free／Studio／Fusion Studioの提供差、実機の描画結果は未確認です。

## バージョンと出典

一次資料：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 105「Krokodove Nodes」、p.2437「Shape Tools — sRestyle」。確認できるのは、入力Shapeの見た目を塗り・輪郭のプロパティで上書きする役割です。

比較対象のsChangeStyleは同ManualのChapter 117「Shape Nodes」、pp.2733–2734に基づきます。Shapeの意味は[シェイプ（Shape）](../../learn/02-data/shape)を参照してください。実機未確認項目が残るため、`verification: partial`を維持します。
