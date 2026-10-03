---
title: Krokodoveの画像・Shape・3D・Region
description: Krokodoveを扱うデータと役割で分け、21.1 Manualの掲載項目から探す。
doc_type: index
verification: partial
product_scope: fusion
tasks: [lookup-node]
updated: '2026-10-03'
---

# Krokodoveの画像・Shape・3D・Region

Krokodoveは一種類のデータだけを扱うツール群ではありません。画像を加工するもの、輪郭を持つShapeを加工するもの、3D形状を作るもの、別のツールへ作用範囲を渡すRegionに分かれます。

画像は画素の集まりです。<Term id="shape-data">Shape</Term>は図形の輪郭などを扱うデータで、詳しい考え方は[シェイプ（Shape）](../../learn/02-data/shape)、標準Shape Nodeの案内は[Shapeノード](../shapes/)で確認できます。画像として使う工程では[sRender](../shapes/s-render)を使います。Regionは作用範囲を表し、Region入力を持つ対応ツールへ接続します。形状を作る3DノードとRegionを同じ入力へつなぐことは前提にしません。

## 3D配置と形状生成

- [Mapped Duplicate 3D](./mapped-duplicate-3d): 同じ3DオブジェクトをX・Y・Zへ並べ、画像で変化を制御する。
- [Fold Create 3D](./fold-create-3d): 分割した平面を区画ごとに折る。
- [Heightfield Create 3D](./heightfield-create-3d): 画像の明るさを使って平面に起伏を付ける。
- [Tube Create 3D](./tube-create-3d): 経路に沿う管状の形を作る。
- [Connect 3D](./connect-3d): 頂点間に接続を作る。これはManualの表ではなく、公式21.1発表で確認した項目。

## Shapeを作る

- [sPrimitiveCreate](./sprimitive-create): 十字・多角形・長方形・星形などを作る。
- [sSpiral Create](./sspiral-create): 中心を巻く曲線を作る。
- [sTrace Create](./strace-create): 2Dの文字や図形をShape環境で扱う。

## Shapeを加工する

| 目的 | ツール |
| --- | --- |
| 輪郭を広げる・縮める | [sOffset](../shapes/soffset) |
| 辺を保って角を丸める | [sRound](./sround) |
| 角を保って辺を滑らかにする | [sSmooth](./ssmooth) |
| 輪郭のサンプリングを変える | [sResample](./sresample) |
| 塗りや線の見た目を上書きする | [sRestyle](./srestyle) |
| 輪郭を描いて現す・隠す | [sWriteOn](./swriteon) |
| 条件に一致する線分を取り除く | [sKill](./skill) |
| 線で三角形に分ける | [sTriangulate](./striangulate) |
| 各線分を波形へ変える | [sZigZag](./szigzag) |
| 押し出し処理を加える | [sExtrude](./sextrude)。出力型と方式は追加確認が必要 |

## Regionで作用範囲を指定する

[rCube](./rcube)は立方体、[rSphere](./rsphere)は球、[rPlane](./rplane)は平らなカード、[rNoise](./rnoise)はPerlinノイズを使う領域です。

できた領域をまとめる[rMerge](./rmerge)、変更する[rModify](./rmodify)、変形する[rTransform](./rtransform)もあります。受け手にRegion入力が必要であり、すべての3Dツールが対応するとは確認していません。

## 画像用ツールを探す

画像の加工は引き続き[ノードA–Z](../../index/node-a-z)から探せます。21.1 Manualで新たに照合した[Warped Transform](./warped-transform)は、画像の伸縮・押し縮め・回転を扱います。[Connect](./connect)は2Dの点を線でつなぐ項目で、Connect 3Dとは区別します。

## 掲載と確認の境界

September 2026版21.1 ManualのChapter 105、pp.2434–2438には85の記名項目があります。この表の名称にはすべて参照先を用意しましたが、各Inspectorや実機動作まで確認済みという意味ではありません。Connect 3Dは公式発表に基づく別枠です。

本文・図で確認した仕様、用途から考えた構成案、実機未確認の項目を各ページで区別しています。特に一行しか説明されていないツールでは、資料にない設定項目を作って記述量を増やしません。
