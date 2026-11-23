---
title: sGridで重なる半透明ドットの濃さを比較する
description: sEllipseのAllow Combiningを切り替え、sGridで重なった円のAlphaがどう変わるか確認する。
doc_type: recipe
verification: partial
aliases: [半透明ドット, 重なりの濃さ, Allow Combining, sGrid Alpha]
concepts: [shape-domain, data-domain]
patterns: [defer-domain-conversion]
nodes: [sEllipse, sGrid, sRender]
tasks: [shape, grid, transparency, overlap, graphic]
prerequisites: [data-domain]
level: foundation
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-11-23"
---

# sGridで重なる半透明ドットの濃さを比較する

## 作るもの

半透明の円を格子状に並べ、円同士が重なる場所の濃さを比較します。**Allow Combiningをオンにすると重なっても元のAlphaを維持**し、オフにすると重なりでAlphaが強くなることがあります。同じ配置で両者を比較する小さな図形教材です。

円の個数・間隔を変えるのはsGrid、個々の円の色と重なり方を指定するのはsEllipseです。最後にsRenderで2D Imageにします。

## 必要なものと入力条件

- DaVinci Resolve / Fusion 21.1のFusionページ。Fusion Compositionなど、Shapeを表示できる作業領域。
- **sEllipse**：塗りのある半透明の円を1つ作る。
- **sGrid**：円を複数の行・列へ複製する。
- **sRender**：Shapeを2D Imageへ変換してViewerへ表示する。
- 必要なら比較用の背景画像と通常のMerge。

以下の数値は重なりを見つけるための**提案値**であり、この組み合わせを実機で測定したものではありません。サイズと間隔はViewerを見て調整してください。

## 接続

~~~text
sEllipse（Solid ON / Alpha 0.5）
    ↓ Shape
sGrid（5列 × 3行、円が重なる間隔）
    ↓ Shape
sRender
    ↓ 2D Image
Viewer / MediaOut（必要な場合）
~~~

Shape出力を通常のMergeへ直接つながず、sRenderで画像化します。映像へ重ねる場合はsRenderの**後ろ**にMergeを置きます。

## 手順

### 1. 半透明の円を作る

1. sEllipseを追加し、**Controls → Solidをオン**にします。今回は輪郭ではなく面を重ねます。
2. Width / Heightを同じ値、例えば両方 **0.22** にします。X Offset / Y Offsetは0.0を目安にします。
3. **Style → Color**で好きな色を選び、**Alphaを0.5**に設定します。
4. **Style → Allow Combiningをオン**にします。まずこの状態で構成を完成させます。

### 2. sGridで円を重ねる

1. sEllipseのShape出力をsGridの**Input1（オレンジ）**へ接続します。
2. sGridの**Grid Cells Xを5、Yを3**にして、5列×3行の配列を作ります。
3. X Offset / Y Offsetを調整し、隣の円が一部重なるようにします。例えば両方 **0.10** から試し、重なりが小さければ間隔を狭くします。
4. sGridをsRenderへ接続し、**sRenderの出力**をViewerで表示します。円が重なる場所があることを確認します。

sGridのOffsetはピクセル数ではありません。**0.0ではすべての複製が重なる**ため、1つの円にしか見えない場合はOffsetを増やします。

### 3. Allow Combiningだけを切り替える

1. sEllipseの**Allow Combiningがオン**の状態で、円1個の部分と2個以上が重なった部分を比べます。
2. **Allow Combiningをオフ**にし、sGridの行数・列数・間隔やsEllipseの色とAlphaを変えず、同じ場所を比較します。
3. 必要ならViewerのAlpha表示や背景画像との合成で差を確かめます。市松模様や黒い背景の見え方だけを、Alphaの数値測定と扱わないでください。
4. 均一な半透明ドット模様ならオン、重なりを強調する模様ならオフが候補です。

## 期待される結果

| 条件 | 公式Manualから予測できること |
| --- | --- |
| Alpha 0.5、Allow Combiningオン | 重なっても、そのShapeのAlpha値0.5が維持される |
| Alpha 0.5、Allow Combiningオフ | 円が重なった部分のAlphaが重複に応じて強くなる |
| Grid Cellsを増やす | 円の複製数が増える |
| X/Y Offsetを0.0にする | すべての配列要素が同じ場所へ重なる |

上記は**21.1公式ManualのAllow Combining / sGridの説明から導く期待結果**です。最終Alpha値や今回の設定によるピクセル寸法は実機で測定していません。

## この構成で動く理由

sEllipseはAlphaを持つ1つのShapeを作ります。sGridが複製すると複数の円が同じ領域を占めます。Allow Combiningは、**複製されたShapeが自身と重なったときにAlphaを保つか、重なりを反映させるか**を決めます。

この設定はsEllipseのStyleにあり、sGridで複製する前のShapeへ適用します。sRenderより後の画像合成とは異なります。[Shapeの基礎](../../learn/02-data/shape)と[最後に画像化するパターン](../../patterns/data-domain/defer-domain-conversion)も参照してください。

## バリエーション

- **密度を上げる**：sGridのGrid Cellsを増やし、X/Y Offsetと円の大きさを調整します。
- **不揃いな配置にする**：sGridの後ろへsJitterを追加し、FixedモードでShape X/Y Offsetの範囲を小さく広げます。最初はsJitterを外して比較条件を固定します。
- **実写の上に重ねる**：sRender → 通常のMerge（前景）、MediaIn → Merge（背景）とつなぎます。

## うまくいかないとき

| 症状 | 確認すること |
| --- | --- |
| 1個の円にしか見えない | sGridのGrid CellsとX/Y Offset。Offsetが0.0なら複製先は重なる |
| 濃さの違いが見えない | 円の重なり、Alpha 0.5、オン・オフ以外の設定が同一か |
| 輪郭だけになる | sEllipseのSolidをオンにする |
| 半透明ではない | sEllipseのStyle → ColorのAlphaを確認 |
| Shapeが表示できない | sGrid → sRenderの接続とsRenderのViewer表示を確認 |
| sBooleanの後で結果が変わる | sBooleanは入力ShapeのAllow Combiningを引き継がず、自身の設定が作用する。まず今回の直接接続で比較する |

## 関連資料

- [sEllipseのNode Reference](../../nodes/shapes/s-ellipse)
- [sGridのNode Reference](../../nodes/shapes/sgrid)
- [sJitterのNode Reference](../../nodes/shapes/sjitter)
- [sRenderのNode Reference](../../nodes/shapes/s-render)
- [Shapeの基礎](../../learn/02-data/shape)
- [Shapeから2D Imageへ変換する最小例](./basic-shape-render)
- [最後に画像化するパターン](../../patterns/data-domain/defer-domain-conversion)

## 出典と検証範囲

**一次資料**：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月）、Chapter 117「Shape Nodes」pp.2739–2741（sEllipseのSolid / Width / Height / Style / Allow Combining）、pp.2743–2744（sGridの入力・複製数・Offset）、pp.2729–2732（Allow CombiningとsBooleanの例外）。[Blackmagic Design公式Manual](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_21.1_Reference_Manual.pdf)。該当箇所の本文を直接照合しました。

**既存の実機記録**：[sGrid](../../nodes/shapes/sgrid)にResolve Studio 21.1.0.14 / Windowsで5列×3行を配置したS01撮影例があります。ただし本ページのAlpha 0.5とAllow Combiningの比較を実測したものではありません。

**確認済み**：21.1公式ManualによるsEllipseのAlpha / Allow Combining、sGridの複製とOffset、sRenderへの変換。

**未検証**：今回の設定でのResolve 21.1実機描画、重なり位置のAlphaピクセル実測、Free / Studio差、他OS・GPU差、画像合成結果。よって **verification: partial** を維持します。
