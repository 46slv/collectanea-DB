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
updated: "2026-10-22"
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

4点の位置に基づいて遠近を取り除いた2D Imageを出力します。後段へ[Paint](../paint/paint)を接続して平らな状態で修正できます。ただし、これだけで撮影画像の元の遠近へ戻るわけではありません。戻す場合は後段にCorner Positionerを使います。

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

## 動く看板を修正する：Steadyで固定して戻す

Perspective Positionerの4点はアニメーションできますが、**自動追跡する機能はありません**。1フレームで看板を正面に展開しても、撮影中に面が動けば次のフレームでは角の位置を合わせ直す必要があります。

**動く面の傷や汚れを消す**場合は、[Planar Tracker](../tracking/planar-tracker)で面を追い、Steadyで一時的に静止させてPaintし、逆変形で撮影時の動きに戻す方法があります。21.1マニュアルでは、移動する車のナンバープレートを修正する例にこの方式を使っています。これはPerspective Positionerを自動追従させる方法とは別です。

~~~text
撮影素材 → Planar Tracker（Track後にSteady）→ Paint
         → Planar Tracker（同じ追跡に対応した逆Steady）→ 出力
~~~

1. 撮影素材をPlanar Trackerへ接続し、看板の模様を囲んで基準フレーム（Reference Time）を決め、必要な区間を前後にTrackします。
2. **Steady**に切り替え、Viewerで看板がほぼ動かなくなるか確認します。平面が流れる場合は、修正前に追跡範囲や精度を見直します。
3. **Steady Time**は基準フレームに合わせ、**Clipping ModeをDomain**にします。固定中に画面外へ押し出された画素を保持しておくためです。
4. 後段のPaintで傷や文字を修正します。対象の面が固定されているため、同じ位置を使って作業できます。
5. 2つ目のPlanar Trackerで、対応する追跡結果を使って**Invert Steady Transform**を有効にします。使用する追跡データと基準時刻が両側で一致しているか確認します。
6. 再生し、修正した部分が元の看板へ戻るか、画面端に欠けがないかを元映像と比較します。

固定と逆変形で**画像の再サンプリングが2回**発生し、細い文字や線が少しぼやける場合があります。必要に応じて修正範囲だけをマスクで取り出して元映像へ重ね、背景全体を再処理しない構成にします。新しい画像を貼るだけなら、[Planar Tracker](../tracking/planar-tracker)のCorner Pinか、[Planar Transform](../tracking/planar-transform)と[Corner Positioner](./corner-positioner)による配置を優先します。これらは**追跡して別素材を配置する**作業で、看板自体の画素を平らにして修正する作業とは異なります。

## 関連Node

- [Corner Positioner](./corner-positioner)
- [Paint](../paint/paint)
- [Planar Tracker](../tracking/planar-tracker)
- [Planar Transform](../tracking/planar-transform)

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 123 pp.2982–2983で、Input / Effect Mask、unpinの役割、Basic Node Setup、Mapping Type、Corners X / Y、Top / Bottom / Left / Right、Corner Positionerと往復した際のsoftnessを確認しました。動く面のSteady→Paint→逆Steady、Steady Time、Invert Steady Transform、Domainによる画面外画素の保持、2回の再サンプリングについてはChapter 119 pp.2826–2827を参照しています。

全既定値・数値範囲、内部REGID、実機performanceは未確認です。
