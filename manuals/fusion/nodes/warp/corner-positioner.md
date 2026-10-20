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
updated: "2026-10-20"
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

## 動く平面への配置：Planar Trackerと組み合わせる

Corner Positionerは指定した4点へ素材を変形しますが、**撮影映像の動きは解析しません**。動く看板へロゴを貼る場合は、[Planar Tracker](../tracking/planar-tracker)で背景の看板を解析し、作成した[Planar Transform](../tracking/planar-transform)にその動きを適用させます。Corner Positionerで行うのは、**基準フレームでの四隅の形合わせ**です。

~~~text
看板映像 → Planar Tracker（Trackで解析 → Create Planar Transform）
                 ※解析結果をPlanar Transformへ渡す。画像を結線する意味ではない

ロゴ画像 → Corner Positioner → Planar Transform → Merge（Foreground）─┐
看板映像 ─────────────────────────────── Merge（Background）─┴→ MediaOut
~~~

1. 看板が大きく写り、手前の遮蔽物が少ないフレームを選びます。看板映像をPlanar TrackerのBackgroundへ入力し、看板上の模様を囲んでそのフレームをReferenceに設定します。**追跡するPatternと、ロゴを貼る四隅は別の範囲**です。
2. 必要区間を前後へTrackし、Steadyモードで看板面が止まって見えるか確認します。追跡が滑る場合は、先にPattern、遮蔽物、Motion Type、レンズ歪みを見直します。
3. Planar TrackerのTrackモードで**Create Planar Transform**を押します。これで解析した平面の変形を適用するノードが作成されます。Planar TrackerとPlanar Transformをワイヤーで直接つなぐ必要はありません。
4. 参照フレームに戻り、透明背景のロゴ画像をCorner PositionerのInputへ入れます。**Mapping TypeをPerspective**にして四隅を看板の貼り付け位置へ合わせ、その出力をPlanar TransformのImage Inputへ渡します。
5. Planar Transformの出力を[Merge](../compositing/merge)のForegroundへ、元の看板映像をBackgroundへ接続します。フレームを動かし、看板の向きや遠近が変わってもロゴが滑らないか確認します。

**位置が最初からずれる**場合は、Corner Positionerの4点を合わせたフレームとPlanar TransformのReference Timeが一致しているか確かめます。**途中からずれる**場合は、元のPlanar Trackerで追跡した面とフレーム範囲、特に斜めから写ったフレームの精度を確認します。基準フレームでの形合わせと、その後の追従精度は分けて調整します。

看板の元の文字を消す処理や、看板の手前を通る人物をロゴより前に合成する処理は別に必要です。Corner Positionerの**Effect Maskは変形処理の範囲を制限する入力**で、Planar Trackerの**Occlusion Maskは追跡計算から手前の物体を除外する入力**です。どちらも人物を自動で手前に切り抜いて合成する機能ではありません。

Planar Transformの作成後は、追跡結果の再解析が不要ならPlanar TrackerをGraphから外す構成も可能です。追跡精度を調整する予定があるなら、解析用ブランチとして残しておくと作業を続けやすくなります。

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

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 123 pp.2963–2964で、Input / Effect Mask、Basic Node Setup、Mapping Type、Corners X / Y、Offset X / Yを確認しました。動く看板への追従手順はChapter 82 pp.1810–1813およびChapter 119 pp.2820–2825のPlanar Tracker / Planar Transformの説明に基づきます。

全既定値・数値範囲、内部REGID、実機performanceは未確認です。
