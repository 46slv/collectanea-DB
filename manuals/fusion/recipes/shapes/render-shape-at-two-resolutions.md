---
title: sRenderで同じ図形を2種類の解像度に画像化する
description: 1つのShapeを2つのsRenderに接続し、自動解像度と手動指定で出力寸法を比較する。
doc_type: recipe
verification: partial
aliases: [Shapeの解像度比較, sRender Auto Resolution]
concepts: [shape-data, rasterization]
patterns: [defer-domain-conversion]
nodes: [sEllipse, sRender]
tasks: [shape, render, convert-domain]
prerequisites: [shape-data]
level: foundation
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-11-24"
---

# sRenderで同じ図形を2種類の解像度に画像化する

## 作るもの

同じ円形の輪郭を1920 × 1080と960 × 540の2種類の画像として出力します。図形自体は1つだけ作り、画像化する段階で解像度を分けます。

## 必要なものと入力条件

- DaVinci Resolve / Fusion 21.1。CompositionのFrame Formatは1920 × 1080、正方形ピクセルを想定します。
- sEllipse ×1：中央の円形輪郭を作ります。
- sRender ×2：同じ図形をそれぞれの画像寸法へ変換します。

外部素材は不要です。寸法や図形の数値は比較用の提案値であり、既定値や実測値ではありません。

## 接続

~~~text
             ┌─ sRender1（自動解像度）─ 画像A
sEllipse1 ───┤
             └─ sRender2（手動解像度）─ 画像B
~~~

sEllipseのShape出力を、それぞれのsRenderのShape入力（橙色）に接続します。2つのsRenderは直列にしません。比較時には各出力を直接Viewerに表示し、Mergeを経由させないようにします。

## 手順

1. sEllipseを追加します。WidthとHeightを同じ値（例：0.4）にし、X OffsetとY Offsetを0にします。
2. Solidをオフにして輪郭だけにします。Lengthを1にし、Border Widthで見分けやすい太さに調整します。色は白、Alphaは1を目安にします。
3. sRenderを2個追加し、上図のように分岐します。
4. sRender1のImageタブでAuto Resolutionをオンにします。Width、Height、Pixel AspectがCompositionのFrame Formatに従うことを確認します。
5. sRender2のImageタブでAuto Resolutionをオフにします。Widthを960、Heightを540、Pixel Aspectを1:1にします。プログレッシブ出力を想定し、両方のProcess ModeをFull Framesに、Depthも同じ設定に揃えます。
6. 2つの出力を左右のViewerに表示し、画像情報で出力寸法を確認します。Viewerの倍率は、まず画像全体が見える状態、次に等倍（100%）にして比較します。
7. sEllipseのWidthとHeightを同じ値のまま変更します。2つの出力に共通の図形変更が反映されることを確認します。

## 期待する結果

| 確認項目 | sRender1 | sRender2 |
| --- | --- | --- |
| Auto Resolution | オン | オフ |
| 出力寸法 | 1920 × 1080 | 960 × 540 |
| Pixel Aspect | Compositionに従う（1:1） | 1:1 |
| 入力Shape | sEllipse1 | sEllipse1 |

双方の出力寸法は異なりますが、同じ図形データを画像化しています。全体表示では構図を、等倍表示では輪郭の画素表現を比較できます。Viewerの拡大率が異なると、見かけ上の線幅や鮮明さだけでは正しく比較できません。

## この構成で動く理由

[Shape](../../learn/02-data/shape)は図形のデータであり、[Image](../../learn/02-data/image)は画素で構成されます。sRenderはShapeを指定された画像寸法に描画します。そのため、図形を定義するノードと、画像の寸法を決めるノードを分離できます。

sRenderのAuto Resolutionをオンにすると、Width、Height、Pixel AspectはCompositionのFrame Formatに従います。オフにすると、それらを独立して指定できます。図形の定義を共有したまま、画像化する地点で出力条件を変える例です。

## バリエーション

- sRender2を640 × 360にして、さらに小さい画像と比較します。縦横比とPixel Aspectは揃えます。
- 円の代わりに既存のShape構成を接続します。Shape編集を終えてから画像化する考え方は[必要な境界で2Dへ戻すパターン](../../patterns/data-domain/defer-domain-conversion)を参照してください。
- 最終納品用の出力に戻す場合は、その出力のsRenderでAuto Resolutionをオンにするか、必要な寸法を明示して確認します。

## うまくいかないとき

| 症状 | 確認すること |
| --- | --- |
| WidthやHeightを編集できない | 手動指定側のAuto Resolutionがオフか。 |
| 2つの画像寸法が同じ | 両方が自動解像度になっていないか。各sRenderの出力を直接見ているか。 |
| 図形が縦長・横長に見える | 両出力の画像縦横比とPixel Aspectが一致しているか。 |
| 輪郭の見え方を比較できない | Viewer倍率、Depth、色、Alphaなどを揃えているか。 |
| 画像が出ない | sEllipseのShape出力が各sRenderのShape入力に接続されているか。 |

## 関連資料

- [sEllipse](../../nodes/shapes/s-ellipse)
- [sRender](../../nodes/shapes/s-render)
- [Shapeを画像化する基本構成](./basic-shape-render)
- [sEllipseで円形の輪郭を作る](./outline-circle-with-sellipse)

## 出典と検証範囲

Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』Chapter 117、pp.2738–2741（sEllipse）、pp.2759–2761（sRender）。公式PDF本文を照合し、sEllipseの輪郭生成と、sRenderの画像寸法、Pixel Aspect、Auto Resolutionの仕様を確認しました。

既存のsRenderノード記事にはWindows版Resolve Studio 21.1.0.14での単一出力の確認記録があります。ただし、本レシピの分岐構成、手動960 × 540出力、Viewer比較、輪郭の画素幅、性能差は実機未検証です。上記の出力表は公式仕様から導いた期待結果であり、測定値ではありません。検証状態はpartialとします。
