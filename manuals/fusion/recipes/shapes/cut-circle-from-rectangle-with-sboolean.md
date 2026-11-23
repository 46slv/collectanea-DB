---
title: sBooleanで長方形に円形の穴を開ける
description: sRectangleとsEllipseをSubtractで組み合わせ、長方形の中央を円形にくり抜く。
doc_type: recipe
verification: partial
aliases: [円形のくり抜き, 円穴のあるカード, sBoolean Subtract, Shapeの差集合]
concepts: [shape-domain, data-domain]
patterns: [defer-domain-conversion]
nodes: [sRectangle, sEllipse, sBoolean, sRender]
tasks: [shape, cutout, transparency, graphic]
prerequisites: [data-domain]
level: foundation
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-11-23"
---

# sBooleanで長方形に円形の穴を開ける

## 作るもの

色の付いた長方形の中央を、円形にくり抜きます。円を別の色で塗って隠すのではなく、**長方形の領域から円と重なる部分を取り除く**構成です。丸い窓のあるカードや、映像の一部をのぞかせる図形に応用できます。

使うのは、長方形を作るsRectangle、円を作るsEllipse、2つのShapeを演算するsBoolean、Shapeを画像化するsRenderです。

## 必要なものと入力条件

- DaVinci Resolve / Fusion 21.1のFusionページ。例として1920×1080のFusion Compositionを想定します。
- **sRectangle**：残す長方形を作ります。
- **sEllipse**：取り除く円形の領域を作ります。
- **sBoolean**：OperationのSubtractで2つの図形の差を取ります。
- **sRender**：Shapeを2D Imageへ変換します。MediaOutはタイムラインへ出す場合のみ必要です。

以下の寸法は操作を始めるための提案値です。実機で測定したピクセル寸法や表示結果ではありません。

## 接続

~~~text
sRectangle（長方形・Solid ON） → Input1 ┐
                                      ├→ sBoolean（Subtract）→ sRender → MediaOut（任意）
sEllipse（円・Solid ON） ─────→ Input2 ┘
~~~

**Input1（オレンジ）が残す図形、Input2（緑）が取り除く図形**です。sBooleanの出力はShapeなので、Viewerで完成結果を見るときはsRenderの出力を表示します。

## 手順

### 1. 長方形を作る

1. sRectangleを追加し、Inspectorの**Controls → Solid**をオンにします。輪郭ではなく面全体を用意します。
2. Widthを**0.70**、Heightを**0.40**から始めます。角のある長方形にするならCorner Radiusは0.0を開始値にします。
3. X Offset / Y Offsetは0.0を目安に中央へ置きます。
4. このShape出力をsBooleanの**Input1**へ接続します。

### 2. 穴の形を作る

1. 別のsEllipseを追加し、こちらも**Solidをオン**にします。円の輪郭だけを作ると、円の内部をくり抜く目的と異なります。
2. Width / Heightをともに**0.18**から始め、X Offset / Y Offsetを0.0の目安で長方形の中央へ重ねます。
3. sEllipseのShape出力をsBooleanの**Input2**へ接続します。
4. 円が長方形の内側に重なっている状態を目標に配置を調整します。2つが離れている場合は穴になる部分がありません。

### 3. Subtractでくり抜く

1. sBooleanのInspectorで**Controls → OperationをSubtract**にします。
2. sBooleanの出力をsRenderにつなぎ、sRenderをViewerに表示します。
3. sBooleanの**Style → Color**で表示色を指定し、Alphaを1.0から始めます。21.1 Manualに記載されているStyle Modeは**Replace**で、入力元それぞれの色をそのまま維持する設定ではありません。
4. 長方形の内部に円形の抜けができるか確認します。背景の市松模様は透過の手がかりですが、**それだけでAlpha値を測定したことにはなりません**。
5. 実写へ合成する場合はsRenderの2D Image出力を通常のMergeへ送ります。タイムラインへの出力にはMediaOutへ接続します。

## 期待される結果

| 条件 | 期待する見え方 |
| --- | --- |
| 大きい長方形をInput1、小さい円をInput2、Subtract | 長方形の中から円の領域が取り除かれ、円形の穴ができる |
| 2つの入力を入れ替えてSubtract | 円が残す側になり、残る図形が変わる |
| OperationをIntersectionにする | 長方形と円の共通領域だけが残る |
| OperationをUnionにする | いずれかの図形が占める領域が残る |
| 円を長方形の外へ移動する | 重なりがなくなると、Subtractで除く部分もなくなる |

これらは公式Manualの領域演算の定義から導く**期待結果**です。ここで示した寸法での実機描画結果としては確認していません。

## この構成で動く理由

Subtractは、sBooleanのInput1が占める領域からInput2との重なりを除く演算です。長方形を残す側にし、円を取り除く側にすることで、2つの塗り領域の差として穴を作ります。

sRectangle・sEllipse・sBooleanまではShapeのままです。通常のMergeや画像エフェクトを追加するときだけ、sRenderで2D Imageへ変換します。このデータの違いを理解しておくと、ShapeのノードをImage用の端子へ直接つなげない理由も分かります。

## バリエーション

- **端の切り欠き**：sEllipseのX Offset / Y Offsetを変え、円の一部が長方形の外にはみ出すようにします。
- **穴の大きさ**：sEllipseのWidth / Heightを変えます。円の形を維持したい場合は、まず両方を同じように変更して比較します。
- **角丸カード**：sRectangleのCorner Radiusを上げ、長方形の外周だけを丸めます。穴の大きさとは別の設定です。
- **重なった範囲だけ表示**：OperationをIntersectionへ切り替え、Subtractとの違いを見比べます。

具体的な見た目、設定値と表示寸法の対応、動かしたときの挙動は実機で再検証してください。

## うまくいかないとき

| 症状 | 確認箇所 |
| --- | --- |
| 円に近い図形だけが残る | Input1とInput2の順序を確認する。SubtractではInput1が残す側 |
| 穴が開かない | OperationがSubtractか、両方のSolidがオンか、図形が重なっているかを調べる |
| 図形が表示されない | sRenderに接続しているか、sBooleanのStyleでAlphaが0になっていないか確認する |
| 元のShapeの色が消える | sBooleanのStyle ModeはReplace。最終的な色はsBoolean側のStyleで指定する |
| 透明な穴か分からない | 背景との重ね合わせやAlpha表示を確認する。黒いViewer背景だけで判断しない |
| Mergeに直接つなげない | Shape出力はsRenderで2D Imageへ変換してから接続する |

## 関連資料

- [sBooleanのNode Reference](../../nodes/shapes/sboolean)
- [sRectangleのNode Reference](../../nodes/shapes/srectangle)
- [sEllipseのNode Reference](../../nodes/shapes/s-ellipse)
- [sRenderのNode Reference](../../nodes/shapes/s-render)
- [Shapeを2D Imageにする最小例](./basic-shape-render)
- [塗りなしの円形アウトラインを作る](./outline-circle-with-sellipse)
- [Shapeの基本](../../learn/02-data/shape)
- [Shapeを最後にImageへ変換する考え方](../../patterns/data-domain/defer-domain-conversion)

## 出典と検証範囲

**公式資料**：Blackmagic Design, *DaVinci Resolve 21.1 Reference Manual*（2026年9月）、Chapter 117「Shape Nodes」pp.2729–2732（sBooleanの入力と4つのOperation、Style Mode、Color）、pp.2738–2741（sEllipse）、pp.2756–2760（sRectangle・sRender）。

[Blackmagic Design公式Reference Manual](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_21.1_Reference_Manual.pdf)

**既存の実機資料**：sBooleanのNode Referenceには別の円と星を使うUnion / Subtract比較があります。今回の長方形＋円の組み合わせを検証したものではありません。

**確認済み**：21.1公式Manualにある入力順、Subtractの領域演算、ShapeからsRenderへの変換、Style Modeの意味。

**未検証**：提案したWidth/Height/OffsetによるResolve 21.1実機表示、穴のAlphaピクセル測定、1920×1080以外の表示、Edition差、OS差、後段合成、アニメーション。再現試験未実施のため **verification: partial** とします。
