---
title: "Perspective Positioner"
description: "遠近の付いた平面領域を4点で指定し、その領域を正面向きのImageへ展開するunpin Node。"
doc_type: node
term_id: "perspective-positioner"
term_short: "Perspective Positionerは、遠近の付いた四辺形を4点で指定して正面向きへ展開するunpin Node。"
verification: partial
aliases: ["Perspective Positioner", "PPn"]
concepts: ["image-data"]
nodes: ["Perspective Positioner"]
node_family: "warp"
controls: ["Mapping Type", "Corners X", "Corners Y", "Top", "Bottom", "Left", "Right"]
inputs: ["image", "mask"]
outputs: ["image"]
tasks: ["warp-image", "screen-replace", "paint"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-05"
---

# Perspective Positioner

Perspective Positionerは、遠近の付いた平面領域を4点で指定し、その部分を正面向きへ展開するNodeです。Blackmagic DesignのManualでは、[Corner Positioner](./corner-positioner)と対になるNodeとして説明されています。

画面や看板を一度平らにしてからPaintや修正を行いたいときに使います。この処理は**unpin**と呼ばれ、Corner Positionerが平らなImageを遠近の付いた面へはめ込むのとは逆方向です。

## 入力と出力

### Input

オレンジ色のInputへ、遠近を取り除きたい2D Imageを接続します。

### Effect Mask

青色のEffect MaskへMaskを接続すると、Perspective Positionerの結果を必要な領域だけに限定できます。21.1 Manualでは、Effect MaskはNodeの処理後に適用されると説明されています。

### Output

4点で囲んだ領域のperspectiveを取り除き、正面向きへ展開した2D Imageを出力します。

## 主な設定項目

### Mapping Type

変形方法を選びます。

- **Bi-Linear** — 旧projectとの互換用
- **Perspective** — 遠近を考慮して変形する

21.1 Manualでは、実際の遠近をより正確に扱えるためPerspectiveの使用が強く推奨されています。

### Corners X / Y

遠近を取り除きたい平面の4隅へcontrol pointを合わせます。Viewer上で直接ドラッグできます。

InspectorではTop、Bottom、Left、Rightの各controlを使って位置を細かく調整できます。

## 主な用途

- 遠近の付いた看板や画面を正面向きへ展開して修正する
- textureを平らな状態にしてPaint / cleanupを行う
- 4点をanimationし、平面を揺らす・歪ませる表現を作る
- Corner Positionerと組み合わせ、unpin → edit → pinの流れを作る

## Paintして元の面へ戻す

21.1 Manualでは、遠近の付いた領域をPerspective Positionerで平らにし、その状態でPaintした後、Corner Positionerで元の位置へ戻す例が示されています。

```text
Footage
  ↓
Perspective Positioner
  ↓
Paint
  ↓
Corner Positioner
  ↓
Result
```

たとえば斜めから撮影された看板の汚れを消す場合、まず看板面を正面向きへ展開してから[Paint](../paint/paint.md)で修正し、最後にCorner Positionerで元の遠近へ戻せます。

## Corner Positionerとの違い

- **Perspective Positioner** — 遠近の付いた領域を平らにする
- **Corner Positioner** — 平らなImageを遠近の付いた領域へはめ込む

この2つは逆向きの処理に見えますが、21.1 Manualでは**両Nodeはconcatenateされない**と説明されています。往復させると多少softnessが加わるため、画質が重要な処理では不要な往復を増やさない方が安全です。

## 関連Node

- [Corner Positioner](./corner-positioner)
- [Paint](../paint/paint.md)
- [Planar Tracker](../tracking/planar-tracker)
- [Planar Transform](../tracking/planar-transform)

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 123 pp.2982–2983で、Input / Effect Mask、unpinの役割、Basic Node Setup、Mapping Type、Corners X / Y、Top / Bottom / Left / Right、Corner Positionerと往復した際のsoftnessを確認しました。

全既定値・数値範囲、内部REGID、実機performanceは未確認です。
