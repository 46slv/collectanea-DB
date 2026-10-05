---
title: "Perspective Positioner"
description: "perspectiveの付いた四辺形を4つのcornerで指定し、平面として取り出すNode。"
doc_type: node
term_id: "perspective-positioner"
term_short: "Perspective Positionerは、perspectiveの付いた領域を4点で指定して平坦化するNode。"
verification: partial
aliases: ["Perspective Positioner", "PPn"]
concepts: ["image-data"]
nodes: ["Perspective Positioner"]
node_family: "warp"
controls: ["Mapping Type", "Corners X and Y"]
inputs: ["image", "mask"]
outputs: ["image"]
tasks: ["warp-image"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-05"
---

# Perspective Positioner

Perspective Positionerは、撮影素材の中にあるperspectiveの付いた四辺形へ4つのcornerを置き、その領域からperspectiveを取り除いて平坦なImageへ変換するNodeです。Corner Positionerと逆方向の処理を担当します。

## 入力と出力

### Input

オレンジ色のInputへ、perspectiveを取り除きたい2D Imageを接続します。

### Effect Mask

青色のEffect MaskへMaskを接続すると、transformを適用する範囲を限定できます。Effect MaskはNodeの処理後に適用されます。

### Output

指定した四辺形を平坦化した2D Imageを出力します。

## 主なControl

### Mapping Type

transformの方法を選びます。

- **Perspective** — 現実のperspectiveへより正確に対応するため、21.1 Manualでは通常こちらを使うことが強く推奨されています。
- **Bi-Linear** — 古いprojectとの互換用に残されているmodeです。

### Corners X and Y

perspectiveの付いた領域を囲む4つのcontrol pointです。Viewerで各cornerを直接dragし、InspectorでもTop / Bottom / Left / Rightの値から位置を調整できます。

## 主な用途

- 看板やモニター面をいったん平坦化してPaintする
- perspectiveの付いたtextureを正面から見た状態へ戻す
- 平坦化した領域へretouchやgraphics処理を行う
- 4つのcornerをanimationしてImageをwarpする

## Corner Positionerとの往復

21.1 Manualでは、perspectiveの付いた領域をPerspective Positionerでunpinし、平坦なtextureへPaintした後、Corner Positionerで元の面へ戻す例が示されています。

```text
Footage
  ↓
Perspective Positioner
  ↓
Paint / retouch
  ↓
Corner Positioner
  ↓
Composite
```

この2つのNodeはconcatenateされないため、往復すると多少softnessが加わります。不要な変換を重ねない方が画質を保ちやすくなります。

- [Corner Positioner](./corner-positioner)
- [Paint](../paint/paint)

## Corner Positionerとの違い

- **Perspective Positioner** — perspectiveの付いた領域を選び、平坦化する（unpin）
- **Corner Positioner** — 平らなImageを4つのcornerへ合わせ、perspectiveの付いた面へ配置する（pin）

screen replacementで「いったん正面化して修正してから戻したい」場合は、この2つを対にして使えます。

## Family内での位置づけ

Warp / Distortノードの選び分けは[Family Overview](./)を参照してください。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 123 pp.2982–2983で、Input / Effect Mask、unpin用途、Mapping Type、Corners X and Y、Perspective推奨、Corner Positionerとの往復例とnon-concatenationを確認しました。

全既定値・数値範囲、内部REGID、実機performanceは未確認です。
