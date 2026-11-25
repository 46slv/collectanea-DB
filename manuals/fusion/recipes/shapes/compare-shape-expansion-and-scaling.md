---
title: sExpandの膨張とsTransformの拡大を比較する
doc_type: recipe
verification: partial
aliases: [Shape Expansion vs Scaling, 図形の膨張と拡大]
concepts: [shape-data, transform, rasterization]
patterns: [defer-domain-conversion]
nodes: [sRectangle, sExpand, sTransform, sRender]
tasks: [shape, graphic, build-shape]
level: foundation
product_scope: fusion
suite_surfaces: [fusion]
---

# sExpandの膨張とsTransformの拡大を比較する

## 作るもの

同じ横長の長方形を、輪郭から外側へ膨らませる場合と、中心を基準に拡大する場合で比較します。横幅をほぼ同じに揃えても、高さと角の形が異なることを観察するための構成です。

背景パネルの余白を増やしたい場合は膨張、ロゴや図形の縦横比を維持したい場合は等倍比率の拡大が候補になります。

## 必要なものと入力条件

- Fusionコンポジション。比較用の出力は1920 × 1080、ピクセルアスペクト比1:1に統一する。
- sRectangle、sExpand、sTransform、sRenderを使用する。
- sRectangleは塗りつぶしの単一図形とし、Width 0.30、Height 0.10、X Offset / Y Offset 0、Angle 0、Corner Radius 0を初期案とする。
- Solidを有効にし、Border Widthを0、色のAlphaを1とする。
- 外部画像やマスクは不要。

数値は比較を始めるための提案値であり、実機で確定したプリセットではありません。

## 接続

~~~text
sRectangle ──────────────────────────────> sRender_Reference
           ├──> sExpand_A ───────────────> sRender_A
           └──> sTransform_B ────────────> sRender_B
~~~

三つの枝で同じShapeを共有します。各枝の末端にsRenderを置き、画像化してViewerで比較します。途中に画像用TransformやMergeを挟まない構成です。

## 手順

1. sRectangleを作成して上記の初期案を入力し、sRender_Referenceへ接続する。
2. sRectangleのShape出力を分岐させ、sExpand_Aの入力へ接続する。Amountを0にして基準と比較する。
3. Amountを正の値へ変更する。まず0.02を候補とし、変化が見づらい場合はViewerで確認しながら調整する。Border StyleはRoundにする。
4. 別の分岐をsTransform_Bへ接続する。X SizeとY Sizeを同じ値にし、初期値1から増やす。X/Y Pivot、X/Y Offset、Rotationは0とし、Transform Axisは有効のまま固定する。
5. 各sRenderのWidth、Height、Pixel Aspect、Depthを揃える。Auto Resolutionを利用する場合は三つとも同じコンポジション設定を参照させる。
6. sRender_ReferenceとsRender_Aを同じViewer倍率で切り替え、左右および上下の境界がどのように移動するかを見る。
7. sRender_AとsRender_Bを比較し、BのX SizeとY Sizeを同じ比率で増減させ、中央を通る水平線上の幅をAに近づける。1.15は調整の出発点であり、一致を保証する値ではない。
8. 横幅が近くなった時点で、垂直方向の高さ、角、元の縦横比を比較する。

## 期待される結果と確認ポイント

| 比較項目 | A: sExpand | B: sTransform |
| --- | --- | --- |
| 操作 | 輪郭の膨張 | Shapeの等比拡大 |
| 横幅 | 増加 | 増加 |
| 高さ | 輪郭の移動量に応じて増加 | 元の高さに対する倍率で増加 |
| 角 | Border Styleに依存 | 元の角の形状を拡大 |
| 縦横比 | 変化し得る | 等比設定では維持されることを期待 |

横幅を揃えた後は、高さの差を優先して確認します。角丸の差だけを見て、膨張と拡大の違いを判断しないようにします。

上表は公式資料の機能説明と幾何学から導いた期待結果であり、この構成の実機観察結果ではありません。

## この構成で動く理由

幅をW、高さをHとする長方形の各辺が外向きに距離dだけ移動すると仮定すると、膨張後の外接寸法はW + 2d、H + 2dになります。

一方、中心を基準とする等比拡大では、倍率kによって幅も高さもk倍になります。横幅を膨張後に揃えた場合、倍率は(W + 2d) / Wです。

WがHより大きい横長の図形では、正の膨張と横幅を揃えた等比拡大を比較すると、幾何学モデル上は膨張した図形の方が高くなります。

これは輪郭距離と倍率の違いを説明するためのモデルです。sExpandのAmountが距離dや画素数にどのように対応するかは、ここでは仮定しません。

Shapeのまま処理を分岐させ、sRenderで最後に画像化することで、画像の拡大や再サンプリングを比較条件から切り離します。

## バリエーション

- Amountを負にし、輪郭の収縮と等比縮小を比較する。図形が消えるまで値を増やす必要はない。
- Border StyleをBevel、Miter、Miter Clipへ切り替え、同じAmountに対する角の違いを見る。Miter系ではMiter Limitも確認する。
- 正方形でも横幅を揃えて比較する。横長長方形で生じる高さの差が目立たなくなる条件を考える。

## うまくいかないとき

| 症状 | 確認する箇所 |
| --- | --- |
| Shapeが表示されない | 比較対象の枝の末端にsRenderがあるか、入力Shapeが接続されているか |
| AとBの幅が一致しない | AmountとSizeは別の量なので、同じ数値で揃えずViewer上の幅を基準にする |
| Bの縦横比が変わる | X SizeとY Sizeが同じ値か、元Shapeや前段に非等比変形がないか |
| 図形が片側に動く | 元ShapeのOffset、BのPivotとOffset、Transform Axisの設定を確認する |
| Aの角が想定と違う | Border Styleと、該当する場合はMiter Limitを確認する |
| Viewer間の寸法が比較しづらい | sRenderの出力寸法、ピクセルアスペクト比、Viewer倍率を揃える |

## 関連資料

- [sRectangle](../../nodes/shapes/srectangle)
- [sExpand](../../nodes/shapes/sexpand)
- [sTransform](../../nodes/shapes/stransform)
- [sRender](../../nodes/shapes/s-render)
- [Shapeデータ](../../learn/02-data/shape)
- [ドメイン変換を後段に置く](../../patterns/data-domain/defer-domain-conversion)
- [sExpandによるステッカーの縁](./star-sticker-border-with-sexpand)
- [sGridとsTransformの順序の比較](./compare-sgrid-transform-order)

## 出典と検証範囲

Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』Chapter 117「Shape Nodes」の以下のページを参照しました。

- pp.2741–2742: sExpandのAmount、Border Style、Miter Limit
- pp.2757–2761: sRectangleの形状・Style設定、sRenderの画像出力設定
- pp.2766–2767: sTransformのSize、Offset、Pivot、Rotation、Transform Axis

公式資料の機能と操作項目は照合済みです。分岐構成、数値例、幾何学モデルおよび比較手順はこのレシピの提案です。

Resolve / Fusion実機での描画、Amountと輪郭移動距離の対応、厳密な画素寸法、境界のアンチエイリアス、Transform Axisによる差、Edition差は未検証です。これらは実機確認が必要なため、verificationはpartialとしています。
