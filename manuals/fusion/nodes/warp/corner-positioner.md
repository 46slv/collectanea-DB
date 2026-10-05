---
title: "Corner Positioner"
description: "Imageの4隅をViewer上で動かし、看板・画面・紙面などの平面へ画像をはめ込む4点コーナーピンNode。"
doc_type: node
term_id: "corner-positioner"
term_short: "Corner Positionerは、Imageの4隅を動かして別の四辺形へはめ込む4点コーナーピンNode。"
verification: partial
aliases: ["Corner Positioner", "CPn"]
concepts: ["image-data"]
nodes: ["Corner Positioner"]
node_family: "warp"
controls: ["Mapping Type", "Corners X", "Corners Y", "Offset X", "Offset Y"]
inputs: ["image", "mask"]
outputs: ["image"]
tasks: ["warp-image", "screen-replace"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-05"
---

# Corner Positioner

Corner Positionerは、入力Imageの4隅をViewer上で動かし、別の四辺形へはめ込むNodeです。看板、モニター、ポスターのような平面へ別のImageを配置するときに使います。

元のImageを遠近の付いた平面へ**はめ込む（corner pinする）**方向のNodeです。すでに遠近が付いている領域を正面向きへ展開したい場合は、[Perspective Positioner](./perspective-positioner)を使います。

## 入力と出力

### Input

オレンジ色のInputへ、変形したい2D Imageを接続します。

### Effect Mask

青色のEffect MaskへMaskを接続すると、Corner Positionerの結果を必要な領域だけに限定できます。21.1 Manualでは、Effect MaskはNodeの処理後に適用されると説明されています。

### Output

4点の位置とMapping Typeに従って変形された2D Imageを出力します。

## 主な設定項目

### Mapping Type

4隅の間をどの方法で変形するかを選びます。

- **Bi-Linear** — 2D上でそのまま四辺形へ変形する
- **Perspective** — 4隅のoffsetを基に、遠近を考慮してImageを四辺形へ割り当てる

遠近の付いた看板や画面へImageを合わせる場合は、Perspectiveの方が目的に合います。

### Corners X / Y

4つのcorner pointの位置を指定します。Viewer上で直接ドラッグでき、PathやTrackerなどのmodifierへ接続してanimationすることもできます。

### Offset X / Y

各cornerの位置を少しだけ補正します。Trackerのpattern位置と、実際にImageを合わせたい角が一致していない場合の微調整に使えます。

## 主な用途

- 看板やポスターの面へ別のgraphicをはめ込む
- モニターや端末画面へUI・映像を配置する
- 4点をanimationして、四辺形の形が変わるwarpを作る
- tracking済みの平面へreplacement Imageを追従させる

## Planar Trackerと組み合わせる

背景側の平面が動く場合、21.1 Manualでは[Planar Tracker](../tracking/planar-tracker)で背景をtrackし、そこから作成した[Planar Transform](../tracking/planar-transform)でCorner Positionerの結果を背景の動きへ追従させる例が示されています。

```text
Replacement Image → Corner Positioner → Planar Transform → 合成側へ
                                ↑
                   背景をPlanar Trackerで解析
```

Planar Transformを作成した後、そのtracking dataを他に使わない場合はPlanar TrackerをGraphから外せます。

## Perspective Positionerとの違い

- **Corner Positioner** — 平らなsource Imageを、遠近の付いた四辺形へはめ込む
- **Perspective Positioner** — 遠近の付いた四辺形を指定し、その領域を正面向きへ展開する

平面を一度正面向きにしてPaintし、元の遠近へ戻す場合は、Perspective Positioner → Paint → Corner Positionerという往復構成を使えます。

## 関連Node

- [Perspective Positioner](./perspective-positioner)
- [Planar Tracker](../tracking/planar-tracker)
- [Planar Transform](../tracking/planar-transform)
- [Grid Warp](./grid-warp)

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 123 pp.2963–2964で、Input / Effect Mask、Basic Node Setup、Mapping Type、Corners X / Y、Offset X / Yを確認しました。

全既定値・数値範囲、内部REGID、実機performanceは未確認です。
