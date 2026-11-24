---
title: sBooleanで2つの円の交差領域をアニメーションする
description: 片方の円を移動し、Intersectionでレンズ形から円へ変化する図形を作る。
doc_type: recipe
verification: partial
aliases: [交差領域のアニメーション, sBoolean Intersection, レンズ形の図形]
concepts: [shape-data, keyframes, rasterization]
patterns: [defer-domain-conversion]
nodes: [sEllipse, sBoolean, sRender]
tasks: [animation, shape, motion-graphics]
level: foundation
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-11-25"
---

# sBooleanで2つの円の交差領域をアニメーションする

## 作るもの

2つの円が重なった部分だけを描画します。片方の円を横に移動すると、何もない状態からレンズ形の図形が現れ、円になり、再び消える構成です。輪郭の頂点を個別に動かさず、2つの元図形の位置から結果を作ります。

## 入力と前提

- Fusionコンポジション（1920 × 1080、正方形ピクセルを想定）
- sEllipseを2個、sBooleanとsRenderを各1個
- 作業範囲：開始から48フレーム以上。以下のフレーム番号は開始フレームからの相対値
- 両方ともSolidを有効にした円を使う

数値は公式マニュアルの座標仕様に基づく教材用の提案値です。実機から採取したプリセット値ではありません。

## ノード構成

~~~text
sEllipse A ── Input1 (orange) ─┐
                              sBoolean ── sRender ── MediaOut
sEllipse B ── Input2 (green) ──┘
~~~

sBooleanはShapeデータの領域演算を行います。ViewerではsRenderの出力を表示します。MediaOutはResolveのFusionページで最終出力を確認する場合に接続します。

## 手順

1. 2個のsEllipseを追加し、両方のWidthとHeightを0.24、Y Offsetを0にします。Solidを有効にします。AのX Offsetは-0.10に固定します。
2. BのX Offsetを0.24にし、AをsBooleanのInput1、BをInput2へ接続します。
3. sBooleanのOperationをIntersectionに設定します。Style ModeのReplaceによって出力のスタイルを指定します。StyleタブのColorで見やすい色、例えば黄色を設定し、Alphaを1にします。
4. sRenderを接続します。Imageタブで出力解像度とピクセルアスペクトを確認し、コンポジションの設定と合わせます。必要ならAuto Resolutionの状態も確認します。
5. sEllipse BのX Offsetにキーフレームを設定し、次の表の位置へ移動させます。Aの位置や両方の寸法は変更しません。

| 相対フレーム | BのX Offset | 中心間距離（横方向） | 期待する関係 |
| --- | ---: | ---: | --- |
| 0 | 0.24 | 0.34 | 離れている |
| 12 | 0.04 | 0.14 | 一部が重なる |
| 24 | -0.10 | 0 | 完全に重なる |
| 36 | 0.24 | 0.34 | 再び離れる |

6. sRenderの出力を表示して各キーフレームを確認します。透明な領域はViewerの透明表示またはAlphaチャンネルで確認します。

## 期待される結果

円の直径を0.24としたとき、中心間距離が0.34なら交差領域は存在しません。0.14なら2つの円弧に囲まれたレンズ形、0なら元の円と同じ領域になることが幾何学的に期待されます。

| フレーム | Intersectionの期待像 |
| --- | --- |
| 0 | 透明 |
| 12 | レンズ形の塗り |
| 24 | 円の塗り |
| 36 | 透明 |

これは領域演算からの予測です。実機での端点付近の画素、アンチエイリアス、完全一致時の境界処理は未確認です。

## なぜこの構成で作れるか

Intersectionは、Input1とInput2の両方に含まれる領域を残します。sEllipseのX Offsetを変更しても円の寸法を直接変更するわけではありませんが、重なる部分の形は変化します。したがって、sBooleanのOperationそのものにキーフレームを設定する必要はありません。

sMergeは複数のShapeをまとめるノードであり、このように共通領域だけを抽出する目的とは異なります。また、sBooleanのReplaceは結果の色を設定するため、2つの入力の色をそのまま混色する構成ではありません。

## 1つだけ変えて比較する

位置や寸法、キーフレーム、Styleを維持し、sBooleanのOperationだけをXorに変更します。

| 入力の関係 | Intersection | Xor |
| --- | --- | --- |
| 離れている | 領域なし | 両方の円 |
| 一部が重なる | 共通部分 | 共通部分を除いた両側 |
| 完全に重なる | 円 | 領域なし（理論上） |

同じ動きから逆方向の領域変化を作る例です。比較後はIntersectionに戻します。Subtractを使う場合は入力順が結果を左右しますが、IntersectionとXorの領域演算では入力順による違いはありません。

## うまくいかないとき

| 症状 | 確認すること |
| --- | --- |
| 開始時に何も見えない | Intersectionでは正常な場合がある。フレーム12と24も確認する |
| 全期間で表示されない | BのX Offsetのキーフレーム、両入力の接続、Solid、出力Alphaを確認する |
| 2個の円がそのまま見える | OperationがIntersectionか、sRenderがsBooleanの出力につながっているか確認する |
| 色が入力の円と異なる | Replaceの出力スタイルを確認する |
| 移動の途中で想定と異なる | Splineで補間を確認する。キーフレーム間の移動速度はこの教材では規定しない |

## 関連

- [sEllipse](../../nodes/shapes/s-ellipse)
- [sBoolean](../../nodes/shapes/sboolean)
- [sRender](../../nodes/shapes/s-render)
- [sMerge](../../nodes/shapes/smerge)
- [Shapeデータ](../../learn/02-data/shape)
- [データ領域の変換を後段に置く](../../patterns/data-domain/defer-domain-conversion)
- [sBooleanで長方形に円の穴を開ける](../shapes/cut-circle-from-rectangle-with-sboolean)
- [sOutlineで複数の図形の輪郭をまとめて描く](./draw-shape-group-with-soutline)

## 出典と検証範囲

- Blackmagic Design, *DaVinci Resolve 21.1 Reference Manual*, Chapter 117, pp. 2729–2731（sBooleanの入力・演算・Replace）、2738–2740（sEllipseのSolid・寸法・Offset）、2759–2761（sRenderの画像設定）。2026-11-25に本文を直接照合。
- [公式Reference Manual（PDF）](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_21.1_Reference_Manual.pdf)

公式仕様と領域演算に基づく手順を示しています。実機での描画、キーフレーム補間、境界の画素・Alpha、処理速度、Edition差は未検証です。記事の検証状態はpartialとします。
