---
title: sTextとsGridで文字を格子状に並べた背景を作る
description: 文字列をShapeとして生成し、sGridで行と列に複製してからsRenderで画像化する。
doc_type: recipe
verification: partial
aliases: [文字の格子背景, text grid, typography pattern]
concepts: [shape-data, rasterization]
patterns: [defer-domain-conversion]
nodes: [sText, sGrid, sRender]
tasks: [shape, text, motion-graphics]
prerequisites: [shape-data]
level: foundation
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-11-24"
---

# sTextとsGridで文字を格子状に並べた背景を作る

## 作るもの

短い文字列を3列×2行に並べ、タイトルの背景やタイポグラフィのパターンに使える画像を作る。各セルに別々のテキストノードを置かず、元の文字列を一か所で変更する。

完成イメージ（配置の概念図。実機キャプチャではない）：

~~~text
HI       HI       HI

HI       HI       HI
~~~

## 必要なものと入力条件

- DaVinci Resolve 21.1 / Fusionのコンポジション。
- sText、sGrid、sRenderを各1個。
- 文字列はまず HI のような短いもの。フォントはインストール済みの読みやすい書体を使う。
- 比較条件として1920×1080の画像を想定する。素材映像は不要。

以下の数値は手順を試すための開始値であり、実機確認済みのプリセットではない。書体や画像の縦横比によって文字の大きさと配置を調整する。

## 接続

~~~text
sText1 ── Shape ──> sGrid1 ── Shape ──> sRender1
                                         │
                                         Image
                                         │
                                         v
                                       Viewer
~~~

sGridは文字の入力欄を持つテキスト生成ノードではなく、入力Shapeを規則的に複製するノード。sRenderまではShapeのまま接続する。

通常の[Text+](../../nodes/generators/text-plus.md)はImageを出力するため、この構成ではsTextを使う。

## 手順

### 1. 元になる文字列を作る

sText1を追加し、Styled Textに HI を入力する。FontはたとえばOpen Sans Bold（インストールされている場合）を選ぶ。Sizeは0.08程度から始め、塗りは見分けやすい単色にする。

まずsText1をsRender1へ直接接続し、sRender1の出力をViewerで確認する。文字の大きさやフォントが適切かを、複製前の段階で判断する。

### 2. 文字列を複製する

sText1とsRender1の間にsGrid1を挿入する。sGrid1で次の値を設定する。

| Control | 開始値 | 意図 |
| --- | --- | --- |
| X Cells | 3 | 横方向に3セル |
| Y Cells | 2 | 縦方向に2セル |
| X Offset | 0.25 | 横方向の間隔 |
| Y Offset | 0.18 | 縦方向の間隔 |

Viewerに表示するのは引き続きsRender1の出力。文字が重なる場合はSizeを小さくするか、該当方向のOffsetを調整する。端の文字が見切れる場合は間隔やサイズを小さくして収める。

上の値で特定のピクセル間隔や中央揃えになることは保証しない。配置はViewerを見ながら調整する。

### 3. 元の文字を変更する

sText1の文字列を HI から OK に変更する。sGrid1の数値は変更しない。

すべてのセルで文字列が更新されれば、1個の入力Shapeを繰り返す構造になっていることを確認できる。

### 4. 行と列を独立して調整する

- X Cellsのみを2に変更し、横方向の数が変わることを確認する。
- 3×2に戻してY Offsetのみを調整し、縦方向の間隔が変わることを確認する。
- 最後に元の値に戻し、文字の重なりや見切れがない状態へ調整する。

画像として合成する場合は、sRender1のImage出力をMergeなどの後段へ渡す。

## 期待する結果

| 比較状態 | 期待する結果 |
| --- | --- |
| sTextから直接sRender | 文字列1組 |
| sGridを挿入し3×2 | 文字列6組分の配置 |
| X Cellsを2へ変更 | 文字列4組分の配置 |
| Styled TextをOKへ変更 | 全セルの文字列がOKへ更新 |
| X / Y Offsetの一方を0へ変更 | 該当方向の複製位置が重なる |

複製数はセル数から求めた期待値であり、画面内で見える文字数とは区別する。重なりやフレーム外への配置によって、すべてのセルを個別に視認できないことがある。

## この構成で動く理由

[sText](../../nodes/shapes/stext.md)が作るのは文字のShapeで、[sGrid](../../nodes/shapes/sgrid.md)はその入力を格子状に繰り返す。今回の入力単位は HI という文字列であり、HとIを別々に格子へ配置する操作ではない。

文字の生成と配列を別ノードにすると、文字内容・書体・サイズと、行列の数・間隔を別々に管理できる。最後に[sRender](../../nodes/shapes/s-render.md)を通してImageへ変換することで、通常の画像合成へつなげられる。

データの違いについては[Shapeの基本](../../learn/02-data/shape.md)、変換する位置の考え方は[データ領域の変換を遅らせる](../../patterns/data-domain/defer-domain-conversion.md)を参照。

## バリエーション

- 短い数字や記号を元にして、規則的な背景パターンを作る。
- X Cellsを増やし、Y Cellsを1にして横一列の反復にする。
- 文字色は元のsTextで変更する。異なる文言をセルごとに配置する場合は、独立した文字列を用意する構成を検討する。
- 透明な文字パターンを映像へ重ねる場合は、sRenderの後段で合成する。sText自体のグラデーション色は21.1 Manual上で非対応とされているため、必要なら画像化後に別途処理する。

## うまくいかないとき

| 症状 | 確認すること |
| --- | --- |
| sGridへ接続できない | 入力がText+のImageではなくsTextのShapeか確認する。 |
| 文字が1組にしか見えない | X / Y CellsとOffsetを確認する。Offsetが0の方向では複製が重なる。 |
| 文字が重なる | 元のSizeと配列間隔を一方ずつ調整する。 |
| 文字が画面外に出る | 配列間隔、元のサイズ、画像寸法を確認する。 |
| Viewerで結果を確認できない | 最終のsRenderを表示しているか確認する。 |
| 別のフォントで配置が変わる | 元の文字幅や高さが変わるため、間隔を再調整する。 |

## 関連資料

- [Shapeを画像にする基本レシピ](./basic-shape-render.md)

## 出典と検証範囲

Blackmagic Design, DaVinci Resolve 21.1 Reference Manual:

- Chapter 117, pp.2743–2745: sGridの入力、X / Y Cells、Offsetと格子状複製。
- Chapter 117, pp.2759–2760: sRenderによるShapeからImageへの変換。
- Chapter 117, pp.2765–2766: sTextとText+の関係、文字生成、グラデーション色の制約。
- Chapter 103, pp.2381–2384: Text+のStyled Text、Font、SizeおよびImage出力。sTextと共通する基本操作を理解する補助資料として参照し、Text+の全機能がsTextでも使用できるとは断定しない。

公式Manualの本文を2026-11-24に照合した。既存のsTextノード記事には文字のsDuplicateによる複製、sGridノード記事にはドット配列の実機記録があるが、本レシピの文字格子の実機検証とは別の証拠である。

この接続全体の実機描画、提示値における6組の視認性、正確なセル位置・画素間隔、書体差、出力Alpha、アニメーションおよび処理性能は未検証。verification: partial とする。
