---
title: sMergeとsTransformで複数の図形をまとめて動かす
description: 2つの図形の相対位置を保ったまま、合流後のsTransformだけで移動をアニメーションさせる。
doc_type: recipe
verification: partial
aliases: [Shapeの一括移動, グループ移動, shape group animation]
concepts: [shape-data, transform, keyframes]
patterns: [defer-domain-conversion]
nodes: [sRectangle, sMerge, sTransform, sRender]
tasks: [animation, layout, shape]
level: beginner
product_scope: fusion
suite_surfaces: [fusion]
---

# sMergeとsTransformで複数の図形をまとめて動かす

## 作るもの

青い四角形と黄色い四角形を横に並べ、その間隔を保ったまま画面の右側へ移動させます。

それぞれの図形で位置をアニメーションさせる代わりに、sMergeの後ろに置いた1つのsTransformで全体を動かします。複数の図形からなるロゴや装飾を一緒に登場させたいときに応用できる構成です。

## 必要なものと入力条件

- Fusion Composition（24フレーム以上の間隔で2つのキーフレームを設定できる長さ）。
- sRectangle 2個、sMerge、sTransform、sRender。
- 例では1920×1080、正方形ピクセルを想定します。背景素材は不要です。

以下の数値は作例のために選んだ設定であり、ノードの初期値ではありません。

| 設定 | 四角形A | 四角形B |
| --- | --- | --- |
| Width | 0.12 | 0.08 |
| Height | 0.12 | 0.08 |
| X Offset | -0.10 | 0.10 |
| Y Offset | 0 | 0 |
| Solid | オン | オン |
| Styleの色 | 青 | 黄 |
| Alpha | 1 | 1 |

## 接続

~~~text
sRectangle A ──→ sMerge Input1 ─┐
                                ├→ sTransform → sRender → Viewer
sRectangle B ──→ sMerge Input2 ─┘
~~~

図形を合流させる時点ではまだShapeデータです。最後のsRenderで画像に変換します。

## 手順

1. 2つのsRectangleを作り、表の値を設定します。図形AとBの位置、色、寸法を区別できるようにします。
2. AとBをsMergeの別々の入力に接続します。sMergeからsTransformへ接続し、その先にsRenderを置きます。
3. sRenderのImageタブで出力解像度を確認し、Viewerで2つの四角形が横に並んでいることを確認します。
4. sTransformのX OffsetとY Offsetを0、X SizeとY Sizeを1、Rotationを0にします。sMergeのOverride AxisとsTransformのTransform Axisは比較中に切り替えません。
5. 開始フレームを表示し、sTransformのX Offsetに値0のキーフレームを設定します。
6. 24フレーム後へ移動し、同じX Offsetを0.20に変更します。2つ目のキーフレームが設定されていることを確認します。
7. 開始、途中、終了のフレームを順に表示します。AとBを個別に動かすキーフレームは設定しません。

## 期待される結果と確認ポイント

| 確認する時点 | 期待される状態 |
| --- | --- |
| 開始 | Aが左、Bが右。両者の間に隙間がある |
| 途中 | 両方が同じ方向へ移動する |
| 終了 | 両方が右へ移動し、元の間隔と大きさを保つ |

Viewerのズームを揃えて比較し、図形の中心間の距離、上下のずれ、色、大きさが変わっていないか確認します。

開始と終了だけでなく途中の動きを見ると、移動速度や補間の違いにも気づけます。途中の位置はキーフレーム間の補間設定によって変わるため、ここでは特定の速度や座標を保証しません。

## この構成で動く理由

sMergeは複数のShapeを1つの出力にまとめます。その出力をsTransformに渡すことで、図形AとBの個別の位置設定とは別に、全体へ追加の変形を適用する構成になります。

X Offsetはフレーム幅に対する相対的な値です。0.20は0.20ピクセルという意味ではありません。各図形の位置はsRectangle、全体の移動はsTransformで管理すると、図形同士の配置を調整しても移動のキーフレームを個別に作り直す必要がありません。

[Shapeの基本](../../learn/02-data/shape)と[画像への変換を後段に置くパターン](../../patterns/data-domain/defer-domain-conversion)も参照してください。

## バリエーション

sTransformをsMergeより前に置き、図形Aだけを通すように接続すると、全体の移動ではなくAだけを移動させる比較ができます。Bを固定したい場合はこちらの構成が候補になります。

全体を回転させたいときは、元の移動とは別にsTransformのRotationとPivotを使います。今回の直線移動と異なり、回転中心や軸の設定によって見え方が変わるため、別の条件として確認します。

## うまくいかないとき

- 一方の図形だけが動く場合は、両方の出力がsMergeを通り、sTransformが合流後に接続されているか確認します。
- 図形同士の距離が変わる場合は、個々のsRectangleのOffsetにキーフレームがないか、sTransformで拡大縮小や回転も変化していないか確認します。
- 移動が見えない場合は、sRenderをViewerで表示し、開始と終了でX Offsetの値が異なることを確認します。
- 図形が画面からはみ出す場合は、X Offsetの終了値を小さくするか、元の配置を中央に寄せます。

## 関連資料

- [sRectangle](../../nodes/shapes/srectangle)
- [sMerge](../../nodes/shapes/smerge)
- [sTransform](../../nodes/shapes/stransform)
- [sRender](../../nodes/shapes/s-render)
- [sMergeで複数の図形の重ね順を制御する](../shapes/layer-three-shapes-with-smerge)
- [sTransformで星の自転と公転を分ける](./animate-star-spin-and-orbit-with-stransform)

## 出典と検証範囲

Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月）、Chapter 117 Shape Nodes の次のページを確認しました。

- pp.2746–2747：sMergeの複数のShape入力と合流、Override Axis。
- pp.2757–2760：sRectangleの寸法・位置・塗り・色とsRenderの画像出力。
- pp.2766–2767：sTransformのShape入力、追加の変形、Offsetの座標単位、回転中心、Transform Axis。

上記のノードの役割と設定項目は公式資料に基づきます。2図形の具体的な配置とキーフレームは、このレシピのために組み立てた構成案です。

Resolve 21.1の実機での描画、中心間距離の画素計測、補間、軸設定による差異、エディション差は未検証です。実機確認済みの作例としては扱わず、検証状態をpartialとします。
