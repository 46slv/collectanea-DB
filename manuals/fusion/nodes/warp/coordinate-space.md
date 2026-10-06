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
updated: "2026-10-05"
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

## 最小構成

    Text+ → Coordinate Space → MediaOut

Text+を上下へanimationし、Coordinate Spaceを**Polar to Rectangular**にすると、元の上下移動が中心から遠近方向へ動くように見えます。

必要に応じて前段または後段へTransformを置き、文字の向きやscaleを整えます。

## 運用例

座標変換の途中でだけwarpを加える場合:

    Image
      ↓
    Coordinate Space 1
      ↓
    Drip / Transform
      ↓
    Coordinate Space 2
      ↓
    Result

1つ目で別の座標系へ変換し、その状態で歪みやTransformを加え、2つ目で元の座標系へ戻します。これにより、通常のX/Y空間では作りにくい円周方向・放射方向の変形を作れます。

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
