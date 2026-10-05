---
title: "Corner Positioner"
description: "4つのcornerを動かして、平面画像を看板・画面などの四辺形へ配置するNode。"
doc_type: node
term_id: "corner-positioner"
term_short: "Corner Positionerは、Imageの4つのcornerを動かして四辺形へはめ込むNode。"
verification: partial
aliases: ["Corner Positioner", "CPn"]
concepts: ["image-data"]
nodes: ["Corner Positioner"]
node_family: "warp"
controls: ["Mapping Type", "Corners X and Y", "Offset X and Y"]
inputs: ["image", "mask"]
outputs: ["image"]
tasks: ["warp-image"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-05"
---

# Corner Positioner

Corner Positionerは、入力Imageの4つのcornerをViewer上で動かし、看板・モニター・ポスターなどの四辺形へ合わせるNodeです。平らな素材を、撮影された面のperspectiveに合わせて配置するときに使います。

## 入力と出力

### Input

オレンジ色のInputへ、配置したい2D Imageを接続します。

### Effect Mask

青色のEffect MaskへMaskを接続すると、warpを適用する範囲を限定できます。Effect MaskはNodeの処理後に適用されます。

### Output

4つのcornerに合わせて変形された2D Imageを出力します。

## 主なControl

### Mapping Type

変形方法を選びます。

- **Bi-Linear** — 2Dのwarpとして変形します。
- **Perspective** — cornerのoffsetを2D空間で計算し、3D perspectiveとしてImageをmappingします。

### Corners X and Y

4つのcorner位置です。Viewerで直接dragでき、Inspectorでも位置を調整できます。PathやTrackerなどのModifierへ接続してanimationさせることもできます。

### Offset X and Y

corner位置へ追加offsetを与えます。Trackerへcornerを接続したとき、tracking patternの位置と実際に合わせたいcornerが少しずれている場合の微調整に使えます。

## 主な用途

- 看板やポスターを別画像へ差し替える
- モニターやディスプレイへ画面素材をはめ込む
- 四角いgraphicsを撮影素材のperspectiveへ合わせる
- 4つのcornerをanimationしてImageをwarpする

## Trackingと組み合わせる

21.1 Manualの例では、背景の平面をPlanar Trackerで追跡し、作成したPlanar TransformでCorner Positionerを背景の動きへ追従させています。trackingが済んだ後は、Planar Trackerそのものを最終Graphへ残さず、生成したPlanar Transformを利用できます。

- [Planar Tracker](../tracking/planar-tracker)
- [Planar Transform](../tracking/planar-transform)

Corner Positionerは**平らなImageをperspectiveの付いた面へ置く側**です。逆に、撮影済みのperspective付き領域をいったん平坦化して編集したい場合は[Perspective Positioner](./perspective-positioner)を使います。

## 最小構成

```text
Graphic → Corner Positioner → Composite
             ↑
         Effect Mask（任意）
```

静止画でまず4つのcornerを対象面へ合わせます。対象面が動くshotでは、その後にtracking結果を使って動きを追従させます。

## 注意

Perspective PositionerでunpinしたImageをCorner Positionerで戻す使い方では、2つのNodeはconcatenateされません。往復すると多少softnessが増える場合があります。

## Family内での位置づけ

Warp / Distortノードの選び分けは[Family Overview](./)を参照してください。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 123 pp.2963–2964で、Input / Effect Mask、Mapping Type、Corners X and Y、Offset X and Y、Planar Tracker / Planar Transformを使うBasic Node Setupを確認しました。

全既定値・数値範囲、内部REGID、実機performanceは未確認です。
