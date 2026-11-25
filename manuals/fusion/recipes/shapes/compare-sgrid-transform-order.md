---
title: sGridの前後でsTransformを使い分ける
description: 同じ楕円を3列2行に複製し、個々の図形を回す場合と配列全体を回す場合の接続順を比較する。
doc_type: recipe
verification: partial
aliases: [図形と配列の回転, Shapeの変形順, grid transform order]
concepts: [shape-data, transform, rasterization]
patterns: [defer-domain-conversion]
nodes: [sEllipse, sGrid, sTransform, sRender]
tasks: [shape, layout, motion-graphics]
level: foundation
product_scope: fusion
suite_surfaces: [fusion]
---

# sGridの前後でsTransformを使い分ける

## 作るもの

横長の楕円を3列2行に並べたパターンを作ります。楕円1個ずつの向きを変えたい場合と、並べたパターン全体の向きを変えたい場合で、sTransformを置く位置を比較します。

例えば、画面に整列した装飾の向きだけを変えたい場合と、装飾の列そのものを斜めに配置したい場合では、操作対象が異なります。

## 必要なものと入力条件

- Fusion Composition。任意の1フレームで作業します。
- sEllipse 1個、sGrid・sTransform・sRenderをそれぞれ2個。
- 1920×1080、正方形ピクセル。両方のsRenderで同じ画像設定を使用します。

| ノード | 項目 | 作例の設定 |
| --- | --- | --- |
| sEllipse | Width / Height | 0.08 / 0.035 |
| sEllipse | X Offset / Y Offset | 0 / 0 |
| sEllipse | Solid / 色 / Alpha | オン / 白 / 1 |
| sGrid A・B | Grid Cells X / Y | 3 / 2 |
| sGrid A・B | X Offset / Y Offset | 0.16 / 0.16 |
| sTransform A・B | X Offset / Y Offset | 0 / 0 |
| sTransform A・B | X Size / Y Size | 1 / 1 |
| sTransform A・B | X Pivot / Y Pivot | 0 / 0 |
| sTransform A・B | Rotation | 最初は0°、比較時は90° |
| sTransform A・B | Transform Axis | 両方オンで固定 |

数値は比較用の提案値です。公式の初期値や実機で計測した値ではありません。

## 接続

~~~text
          ┌→ sTransform A → sGrid A      → sRender A → Viewer 1
sEllipse ─┤
          └→ sGrid B      → sTransform B → sRender B → Viewer 2
~~~

元の楕円は1つのノードから分岐させます。枝Aは複製前、枝Bは複製後に変形します。

## 手順

1. sEllipseを追加して表の設定にします。正円では90°回転させても見た目が変わらないため、横長の楕円にします。
2. 枝Aと枝Bを図のように接続します。両方のsGridとsTransformに同じ数値を設定します。
3. 両方のsRenderで同じ解像度とピクセルアスペクトを指定します。それぞれの出力をViewerに表示し、ズームも揃えます。
4. Rotationが0°の状態で、両方とも6個の楕円が3列2行に並ぶことを確認します。重なっていたらGridのOffsetを確認します。
5. 両方のsTransformのRotationを90°にします。その他の設定は変えません。
6. 各楕円の長軸の方向に加え、楕円の中心が作る行列の向きを比較します。

## 期待される結果と確認ポイント

| 条件 | 楕円の長軸 | 中心の配列 |
| --- | --- | --- |
| 基準：A・BともRotation 0° | 横向き | 3列2行 |
| A：複製前に90°回転 | 縦向き | 元の3列2行を維持 |
| B：複製後に90°回転 | 縦向き | 配列自体が回転し、2列3行に見える |

上の表は、複製前に元図形を回す構成と、複製後にまとまりを回す構成から立てた幾何学的な予測です。Resolve実機で得た結果ではありません。

特にTransform AxisとsGridの軸の扱いによって予測と異なる場合は、下の切り分けを行います。画面内の絶対座標や画素単位の間隔までは規定しません。

## この構成で動く理由

sGridは入力Shapeを行と列に複製します。sTransformは入力されたShapeに変形を追加します。

複製前のsTransformにはまだ元図形しか届いていません。一方、複製後のsTransformには配列のShapeが届きます。変形の対象を接続順によって分けられることが、この比較の要点です。

どちらの枝もsRenderまでは図形データを扱います。通常の画像用ノードを途中に挟まず、最後に画像へ変換する構成です。[Shapeの基本](../../learn/02-data/shape)と[画像への変換を後段に置くパターン](../../patterns/data-domain/defer-domain-conversion)を参照してください。

## バリエーション

90°で差を確認した後、両方のRotationを30°にして、個々の図形の傾きと配列の傾きを観察します。

また、複製前のsTransformで図形自体の向きを決め、複製後にもう1個のsTransformを置いて配列の向きを調整する構成も試せます。軸の設定による相互作用がないか、片方ずつ変更して確認します。

## うまくいかないとき

- 円形の図形で向きが分からない場合は、WidthとHeightを異なる値にします。
- 図形が6個に見えない場合は、Grid CellsとOffset、Viewerに表示した枝を確認します。Offsetが0の場合は図形が重なる可能性があります。
- 配列が想定外の方向に回った場合は、Rotationを0°に戻して基準を再確認します。両枝のPivotやTransform Axisが一致しているか確かめます。
- 軸の扱いを切り分ける場合は、両枝のTransform Axisを同じ状態でオンからオフへ変更し、0°と90°の比較を繰り返します。結果をそれぞれ記録し、内部の変形順を見た目だけから断定しません。
- 画面からはみ出す場合は、両枝で同じようにGridのOffsetを小さくします。別々の値にして比較条件を崩さないようにします。

## 関連資料

- [sEllipse](../../nodes/shapes/s-ellipse)
- [sGrid](../../nodes/shapes/sgrid)
- [sTransform](../../nodes/shapes/stransform)
- [sRender](../../nodes/shapes/s-render)
- [sMergeとsTransformで複数の図形をまとめて動かす](../animation/move-shape-group-with-stransform)
- [sTextとsGridで文字を格子状に並べた背景を作る](./repeat-text-with-stext-sgrid)

## 出典と検証範囲

Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月）、Chapter 117 Shape Nodesの以下のページを参照しました。

- pp.2738–2740：sEllipseの寸法、位置、塗り、色。
- pp.2743–2744：sGridのShape入力、複製数、X/Y Offset。
- pp.2759–2761：sRenderの画像出力と画像設定。
- pp.2766–2767：sTransformの追加変形、回転中心、Transform Axis。

公式資料でノードの役割と設定項目を確認しました。2枝の回転結果は比較用の構成案です。Resolve 21.1実機での描画、Transform Axisによる差、正確な中心間隔、画素位置、エディション差は未検証です。検証状態はpartialとします。
