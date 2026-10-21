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
updated: "2026-10-20"
---

# Perspective Positioner

Perspective Positionerは、斜めから撮影された看板や画面などの平面を4隅で指定し、その部分を正面から見たように展開するNodeです。この操作を**unpin**と呼びます。斜めに写った文字や模様を、一度平らな画像として扱ってから修正するときに使います。

[Corner Positioner](./corner-positioner)は逆に、平らな画像を遠近の付いた四辺形へはめ込むNodeです。2つを組み合わせると、撮影された面をunpinして編集し、元の遠近へ戻せます。

## 入力と出力

### Input

オレンジ色のInputへ、遠近を取り除きたい2D Imageを接続します。

### Effect Mask

青色のEffect MaskへMaskを接続すると、変形の効果を適用する画素を限定できます。21.1 Manualによると、このMaskはNodeの処理後に適用されます。

**Effect Maskは4隅を指定するための入力ではありません。** 平面の位置と遠近はCornersで決め、Maskは処理をどこに効かせるかを決めます。両者の違いは[Maskの基礎](../../learn/02-data/mask)を参照してください。

### Output

4点の位置に基づいて遠近を取り除いた2D Imageを出力します。後段へ[Paint](../paint/paint.md)を接続して平らな状態で修正できます。ただし、これだけで撮影画像の元の遠近へ戻るわけではありません。戻す場合は後段にCorner Positionerを使います。

## 主な設定項目

### Mapping Type

変形方法を選びます。

- **Bi-Linear** — 旧projectとの互換用
- **Perspective** — 遠近を考慮して変形する

21.1 Manualでは、実際の遠近をより正確に扱えるためPerspectiveの使用が強く推奨されています。

### Corners X / Y

遠近を取り除きたい平面の4隅へcontrol pointを合わせます。Viewer上で直接ドラッグできます。

InspectorではTop、Bottom、Left、Rightの各controlを使って位置を細かく調整できます。たとえば看板を直すなら、看板の外枠の4角を目印に合わせます。異なる奥行きにある点を混ぜず、1枚の平面として扱いたい四辺形を指定するのが基本です。

## 主な用途

- 遠近の付いた看板や画面を正面向きへ展開して修正する
- textureを平らな状態にしてPaint / cleanupを行う
- 4点をanimationし、平面を揺らす・歪ませる表現を作る
- Corner Positionerと組み合わせ、unpin → edit → pinの流れを作る

## 運用例：斜めに写った看板を修正して戻す

21.1 Manualには、Perspective Positionerで平らにした画像をPaintで編集し、Corner Positionerで元の遠近へ戻す構成が示されています。

```text
MediaIn（斜めから撮った看板）
  ↓
Perspective Positioner（unpin）
  ↓
Paint（汚れや文字を修正）
  ↓
Corner Positioner（元の面へpin）
  ↓
MediaOut
```

1. 看板が写っている素材をPerspective PositionerのInputへ接続します。
2. Viewerで看板の4角にCornersの点を合わせます。Mapping Typeは、遠近のある面を扱うため**Perspective**を選びます。
3. 展開された結果をViewerで確認します。文字や枠が想定外の形なら、4点が同じ平面の角を指しているか見直します。
4. 後段のPaintで汚れを消す、欠けた文字を直すなどの修正を行います。この段階は平らになった画像に対する作業です。
5. Corner Positionerで修正した画像を元の四辺形へ合わせ直します。必要なら元の撮影素材との合成結果を比較します。

これは**平面の編集手順**であり、動いている看板を自動追跡する仕組みではありません。撮影中に四隅の位置が変わる場合は、フレームごとの位置合わせや別途トラッキングが必要です。

## Corner Positionerとの違い

- **Perspective Positioner** — 遠近の付いた領域を平らにする
- **Corner Positioner** — 平らなImageを遠近の付いた領域へはめ込む

この2つは逆向きの処理に見えますが、21.1 Manualでは**両Nodeはconcatenateされない**と説明されています。往復させると多少softnessが加わるため、画質が重要な処理では不要な往復を増やさない方が安全です。

## 動く画像で使う場合

Perspective Positionerの4点は時間方向にアニメーションできます。21.1 Manualでは、4点を動かして画像を揺らす・歪ませる表現にも使えるとされています。

実写の動く面を正面向きへ保ちたい場合は、単に4点を置くだけでは別フレームへ追従しません。[Planar Tracker](../tracking/planar-tracker)などで平面の動きを調べる工程と、unpin後の編集・再配置を区別してください。自動追従の接続方式と結果は、素材と作業構成に合わせて検証する必要があります。

## 関連Node

- [Corner Positioner](./corner-positioner)
- [Paint](../paint/paint.md)
- [Planar Tracker](../tracking/planar-tracker)
- [Planar Transform](../tracking/planar-transform)

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 123 pp.2982–2983で、Input / Effect Mask、unpinの役割、Basic Node Setup、Mapping Type、Corners X / Y、Top / Bottom / Left / Right、Corner Positionerと往復した際のsoftnessを確認しました。

全既定値・数値範囲、内部REGID、実機performanceは未確認です。
