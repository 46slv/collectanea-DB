---
title: "Coordinate Space"
description: "2D Imageの座標をRectangularとPolarの間で変換し、円形・放射状のmotion graphicsや座標変換を使ったwarpを作るNode。"
doc_type: node
term_id: "coordinate-space"
term_short: "Coordinate Spaceは、Imageの座標系をRectangularとPolarの間で変換するNode。"
verification: partial
aliases: ["Coordinate Space", "CdS"]
concepts: ["image-data"]
nodes: ["Coordinate Space"]
node_family: "warp"
controls: ["Shape"]
inputs: ["image", "mask"]
outputs: ["image"]
tasks: ["warp-image", "motion-graphics"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-22"
---

# Coordinate Space

Coordinate Spaceは、2D Imageの座標系を**Rectangular（通常のX/Y座標）**と**Polar（中心からの距離と角度で表す座標）**の間で変換するNodeです。

通常の横・縦方向の動きや模様を、円周方向・放射方向の動きへ読み替えられるため、円形パターンやトンネル表現、座標変換を挟んだ特殊なwarpに使えます。

## 役割

    2D Image → Coordinate Space → transformed Image

Imageそのものの色を作り直すのではなく、pixelを参照する座標系を組み替えて見え方を変えます。

## 入力

### Input

オレンジ色のInputへ、変換したい2D Imageを接続します。

### Effect Mask

青色のEffect MaskへMaskを接続すると、Coordinate Spaceの結果を必要な領域だけに限定できます。MaskはNodeの処理後に適用されます。

## 出力

座標変換された2D Imageを出力します。後段では通常のImageとしてTransform、Drip、Mergeなどへ接続できます。

## 主な設定項目

### Shape

座標変換の方向を選びます。

- **Rectangular to Polar** — 通常のX/Y配置を、中心からの距離と角度で表す配置へ変換する
- **Polar to Rectangular** — Polar配置を通常のX/Y配置へ戻す

同じImageでも、変換方向によって「横方向の移動が回転に見える」「縦方向の移動が中心から外側への移動に見える」など、動きの意味が変わります。

## 主な用途

- 直線的なpatternを円形・放射状のmotion graphicsへ変換する
- Text+を縦方向へ動かし、奥から手前へ伸びるようなトンネル表現を作る
- Coordinate Spaceを2つ使い、その間にDripやTransformを挟んで、元の座標系では作りにくい歪みを作る
- Fast Noiseやmosaic状の素材を円形patternへ変換して背景graphicsを作る

<!-- capture:S304 -->

## 実機例：文字を極座標へ変換する

`Text+` の文字を `Coordinate Space` に接続し、形状を「直交座標から極座標」に設定します。左Viewerは入力、右Viewerは出力です。

この静止例では横に並んだ文字が弧状に変形して見えます。逆方向の変換、座標の数値対応やアニメーションは確認していません。[接続と設定の記録](/img/fusion/captures/S304/readback.json)に条件を記載しています。

[![Text+をCoordinate SpaceとMediaOutへ接続した構成](/img/fusion/captures/S304/graph.png)](/img/fusion/captures/S304/graph.png)

文字画像をCoordinate Spaceへ入力します。

[![直交座標から極座標を選択したCoordinate Space](/img/fusion/captures/S304/controls.png)](/img/fusion/captures/S304/controls.png)

直交座標から極座標を選択します。

[![横書き文字と弧状に変形した出力](/img/fusion/captures/S304/result.png)](/img/fusion/captures/S304/result.png)

左は入力、右は変換後の出力です。

[再現用Graph](/img/fusion/captures/S304/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S304/capture.json)

<!-- /capture:S304 -->

## 運用例1：Text+でトンネル状の文字を作る

21.1 Reference Manual pp.2961–2962に掲載された、文字の上下移動を遠方から手前へ迫るような動きに変える例です。

~~~text
Text+（上から下へ動く文字）
  ↓
Coordinate Space（Polar to Rectangular）
  ↓
MediaOut
~~~

1. [Text+](../generators/text-plus)で文字を作り、画面の上から下へ移動するように位置をアニメーションさせます。まずText+だけをViewerで確認し、動いていることを確かめます。
2. Text+の出力をCoordinate Spaceのオレンジ色のInputへつなぎ、その出力をMediaOutへ接続します。
3. Controlsタブの**ShapeをPolar to Rectangular**にします。元の上下移動が、遠くから近くへ迫るような動きとして見えるか再生して確認します。
4. 文字の向きが不自然なら、Text+とCoordinate Spaceの**間**に[Transform](../transform/transform)を入れて向きを調整します。前段で向きを変える場合と、変換後の向きを変える場合では見え方が異なります。
5. 文字が途中で欠ける場合は、最初にText+の移動範囲を確認し、変換後のViewerと見比べます。

入力は透明背景に描かれた動く**2Dの文字画像**です。Coordinate Spaceが変えるのは画素の配置であり、3Dカメラや文字の奥行き形状を作るわけではありません。Shapeだけでは時間方向の動きは生まれないため、Text+側のアニメーションが必要です。

## 運用例2：2つのCoordinate Spaceの間で変形する

21.1 Reference Manualでは、Shape設定が異なる2つのCoordinate Spaceの間へDripやTransformを置く構成が紹介されています。**中間の画像を編集してから、通常の座標へ戻す**方法です。

~~~text
撮影素材 / Image
  ↓
Coordinate Space A（Rectangular to Polar）
  ↓
Transform（中間座標で位置を調整）
  ↓
Coordinate Space B（Polar to Rectangular）
  ↓
MediaOut
~~~

1. Coordinate Space AのShapeを**Rectangular to Polar**にします。まずAの出力をViewerで見て、画像の配置がどのように変わったか確認します。
2. AとBの間にTransformを入れ、位置を少しずつ動かします。変換された画像の横・縦方向を操作すると、元画像にTransformを直接使う場合とは異なる変形になります。
3. Coordinate Space BのShapeを**Polar to Rectangular**にします。中間座標で行った編集が、通常の2D画像へ戻ったときにどの部分へ作用するか確認します。
4. Transformを一度無効にして、2つのCoordinate Spaceだけを通った結果と比較します。続いてTransformを有効にし、円周方向・放射方向の変化を見比べます。
5. 波紋状の歪みを中間座標で作りたい場合は、Transformを[Drip](./drip)に置き換えます。画像端に伸びや欠けがあれば、中間画像の端と変形範囲を確認します。

2つのCoordinate Spaceは「座標を変える」「元の座標へ戻す」という組み合わせです。中間に変形がなければ元画像に近い結果になりますが、**再サンプリングや画面端の扱いで、往復後の全画素が完全一致するとは限りません**。

## 運用例3：ノイズを円形の背景グラフィックに変える

21.1マニュアルは、[Fast Noise](../generators/fast-noise)、Mosaic Blur（DaVinci Resolve Resolve FXのみ）、Transform、Coordinate Space、[Crop](../transform/crop)を使う円形パターンの例も紹介しています。

Fast Noiseで模様を作り、Mosaic Blurなどで模様の大きさを調整した素材をCoordinate Spaceで変換すると、直線的なノイズ模様を円形・放射状の背景へ利用できます。Cropは最終的な出力解像度を設定するために使います。Mosaic Blurの実際の利用可能範囲はResolve FXの搭載状況を確認してください。

この場合のFast Noiseは**変換される入力画像**であり、青いEffect Mask入力へつないで適用範囲を制限するケースとは用途が異なります。

## うまくいかないとき

| 症状 | 確認すること |
| --- | --- |
| トンネル状の動きにならない | Text+単体が時間とともに移動しているか、Shapeが**Polar to Rectangular**か。 |
| 文字の向きが違う | Text+とCoordinate Spaceの間のTransformで、変換前の向きを試す。 |
| 2つのNodeをつないでも変化が分かりにくい | A/Bが逆方向のShapeか、間のTransformやDripが有効か。中間Nodeを無効にした画と比較する。 |
| 画像端が欠ける・伸びる | 元画像と中間画像の外側を参照していないか、後段のCropで切っていないか。 |
| Effect Maskを接続したら変化しない | Maskが全黒になっていないか、変形したい範囲を覆っているか。Maskは処理後に適用される。 |

## Dent / Drip / Vortexとの違い

- **Coordinate Space** — Imageを扱う座標系そのものをRectangular / Polar間で変換する
- **Dent** — 中心を基準に局所的な膨らみ・凹みを作る
- **Drip** — 波紋形状でImageを歪ませる
- **Vortex** — 指定領域を渦状に回転させる

特定形状のwarpを直接作りたい場合はDent / Drip / Vortex、別の座標系へ一度変換して処理したい場合はCoordinate Spaceを使います。

## 関連Node

- [Drip](./drip)
- [Dent](./dent)
- [Vortex](./vortex)
- [Transform](../transform/transform)
- [Text+](../generators/text-plus)

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 123 pp.2961–2962で、Input / Effect Mask、Rectangular to Polar / Polar to Rectangular、Text+を使うtunnel例、Coordinate Spaceを2つ使いDripまたはTransformを間へ挟む構成を確認しました。

全既定値・内部REGID・実機performanceは未確認です。
