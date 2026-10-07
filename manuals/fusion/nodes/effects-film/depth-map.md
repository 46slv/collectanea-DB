---
title: "Depth Map"
description: "2D footageの見かけ上の奥行きを解析し、距離に応じたAlpha matteを作るNode。"
doc_type: node
term_id: "depth-map"
term_short: "Depth Mapは、2D Imageの見かけ上の奥行きを解析し、距離に応じたAlpha matteを作るNode。"
verification: partial
aliases: ["Depth Map", "DMp"]
concepts: ["image-data", "alpha", "mask-data"]
nodes: ["Depth Map"]
node_family: "effects-film"
controls: ["Mode", "Depth Map Preview", "Invert", "Adjust Map Levels", "Far Limit", "Near Limit", "Gamma", "Isolation", "Target Depth", "Tolerance", "Softness", "Post Processing", "Post-Filter", "Contract/Expand", "Blur"]
inputs: ["image", "mask"]
outputs: ["image"]
tasks: ["create-matte", "stylize-image"]
level: intermediate
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-06"
---

# Depth Map

Depth Mapは、2D <Term id="image">Image</Term>に写っている物体の**見かけ上の距離**を解析し、cameraに近い領域と遠い領域をAlphaとして分けるNodeです。

通常のMaskが「この形の内側」という2値的な範囲を作るのに対し、Depth Mapはpixelごとに相対的なdepthを持つ連続したmapを作ります。背景だけをぼかす、foregroundだけを強調する、遠景だけ色補正する、といった「距離で処理を分けたい」場面で使います。

21.1 ManualではMatte Nodesの一つとして説明されています。生成されるのは実際の3D geometryやcamera-space Zではなく、2D Imageから推定したAlpha matteです。

## 入力

Depth Mapには2つの入力があります。

### Input

黄色の必須入力です。depthを解析したい2D Imageを接続します。

### Effect Mask

青色の任意入力です。<Term id="mask">Mask</Term>を接続すると、Depth Mapの結果を適用する範囲を限定できます。

21.1 ManualではEffect MaskはNodeの処理後に適用されると説明されています。解析対象そのものをcropする入力ではありません。

## 出力

Depth Mapは、入力Imageに距離情報から作ったAlpha channelを持たせて出力します。

Depth Map Previewを有効にしている間は、生成中のmapを白黒Imageとして確認できます。既定の向きではNear側が白、Far側が黒へ対応し、Invertで逆転できます。

白い領域は後段の処理が強く適用される側、黒い領域は適用されない側として使えます。

## 基本workflow

背景だけをぼかす場合は、Depth MapをBlurのEffect Maskとして使うと役割を分けやすくなります。

```text
MediaIn ─────────────→ Blur ─→ Output
   └─→ Depth Map ─────→ Blur (Effect Mask)
```

1. MediaInをBlurとDepth Mapへ分岐します。
2. Depth Map Previewを有効にしたまま、背景が白くなるようmapを調整します。
3. 必要ならInvert、Isolation、Target Depthを使って遠景側だけを選びます。
4. 調整が終わったらDepth Map Previewを無効にします。
5. Depth Mapの出力をBlurのEffect Maskへ接続します。
6. Blur Sizeを上げると、Depth Mapで白く選ばれたdepth rangeだけをぼかせます。

Manualでも、遠い背景だけへBlurを適用してdepth of fieldを模擬する例が挙げられています。

## Mode

Depth Mapは計算負荷が高いため、quality modeを切り替えられます。

- **Faster** — 調整中のresponsivenessを優先
- **Better** — 既定。最終結果向けの高品質mode

作業中はFasterでdepth rangeを決め、最後にBetterへ戻してedgeや細部を確認する使い方ができます。

## Depth Map Preview

既定で有効です。

有効中は現在のDepth Mapを白黒表示し、Near / FarやIsolationの結果を確認できます。無効にすると、生成したAlphaを後段のgradeやeffectで利用する通常outputへ戻ります。

「Previewを切るとdepth解析が無効になる」という設定ではありません。

## Invert

Depth Mapのopaque / transparent側を反転します。

たとえば既定mapでforegroundが白、backgroundが黒になっている場合、Invertを有効にするとbackground側を白として扱えます。

## Resulting Map Adjustment

### Adjust Map Levels

既定では無効です。

無効時はDepth Mapのfull rangeをそのまま調整します。有効にするとlevelsを0〜1へclipした状態を確認でき、Alphaとして使ったときの結果へ近い状態でNear / Far / Gammaを追い込めます。

有効にするとFar Limit、Near Limit、Gammaが使えるようになります。

### Far Limit

Depth Mapのblack levelを調整します。

どのdepthから「十分に遠い側」として黒へ寄せるかを詰めるときに使います。

### Near Limit

Depth Mapのwhite levelを調整します。

どのdepthから「十分に近い側」として白へ寄せるかを調整します。

### Gamma

black / white pointを固定したまま、その中間depthの明るさを調整します。

Near / Farだけでは選択が急すぎる、または中間距離の影響量を変えたい場合に使います。

## Isolate Specific Depth

画面全体をNear→Farのgradientとして使うのではなく、**特定の距離帯だけ**を選びたいときのControlです。

### Isolation

depth isolationを有効にします。

### Target Depth

選択したい中心depthを決めます。

21.1 Manualでは、**1がforeground、0がbackground**です。

### Tolerance

Target Depthの前後へどこまでdepth rangeを広げるかを決めます。

値を広げると、中心距離だけでなくその前後も白側へ含められます。

### Softness

Toleranceで選んだrangeの入口と出口へ緩やかなtransitionを作ります。

人物と背景の境界などでgradeやBlurが急に切り替わる場合に調整します。

## Map Finesse

depth推定後のAlpha matteを、実際のgradeやeffectへ使いやすい形へ整えるControlです。

### Post Processing

Map Finesseの処理を有効にします。

### Post-Filter

mapを元Imageのsmooth areaやedgeへなじませ、後段のgradeが同じregion内で細かくばらつくのを抑えます。

### Contract/Expand

matteのedgeを縮小・拡張します。

foregroundとbackgroundの境界でDepth Mapが少しはみ出す場合や、逆に不足する場合の微調整に使います。

### Blur

Depth Mapの境界を柔らかくします。

Blur NodeでImage自体をぼかすControlではなく、ここでぼかすのは**Depth MapのAlpha edge**です。

## 遠景だけ色補正する例

窓の外やbackgroundだけ色温度を変えたい場合は、Color CorrectorへDepth MapをMaskとして渡せます。

```text
MediaIn ─────────────→ Color Corrector ─→ Output
   └─→ Depth Map ─────→ Color Corrector (Effect Mask)
```

1. Depth Mapでbackground側を白くします。
2. 必要ならIsolationで対象depth rangeを絞ります。
3. Color CorrectorのEffect MaskへDepth Mapを接続します。
4. Color CorrectorでGain、Saturation、color balanceなどを調整します。

21.1 Manualでは、daylightの窓付近にいるbackground actorだけ青く見えるshotをdepthで分離し、foreground subjectを保ったまま補正する例が挙げられています。

## 通常のMaskとの違い

PolygonやEllipseなどのMaskは、描いた形やtracked shapeを基準に範囲を作ります。

Depth MapはImageの内容から距離関係を推定するため、subjectが動いても「同じdepth帯」という条件で処理範囲を作れます。一方で、これは実測した3D depthではありません。境界の精度が重要な場合は、生成したmapをMap Finesseで整えるか、別Maskと組み合わせます。

## Z / Deep Imageとの違い

Depth Mapは、2D Imageから推定した結果を**Alpha matte**として出すNodeです。

Renderer 3DやEXRに入っているZ channelを直接使う[Depth Blur](../deep/depth-blur-deep-pixel)とは入力dataが異なります。また、1 pixelに複数のdepth sampleを持つtrue [Deep Image](../../learn/02-data/deep-image)でもありません。

実際のZ / Auxiliary Channelが既にあるrender素材では、それを使うNodeの方が元の3D情報を直接利用できます。Depth Mapは、そのようなdepth passがない通常の2D footageから距離ベースのmatteを作りたい場合に向いています。

## 関連Node

- [Blur](../blur-filter/blur) — Depth MapをEffect Maskにして、距離でBlur範囲を分ける
- [Color Corrector](../color/color-corrector) — Near / Farや特定depthだけをgradeする
- [Relight](../matte-keying/relight) — Surface Mapからlighting用のAlphaを作る。Depth Mapとは解析対象が異なる
- [Depth Blur](../deep/depth-blur-deep-pixel) — Z / Auxiliary Channelを使ってdepth-dependent blurを行う

## Editionと検証範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 109、pp.2524–2526で、2入力、Depth Map Alpha、Faster / Better、Depth Map Preview、Invert、Adjust Map Levels、Far / Near Limit、Gamma、Isolation、Target Depth、Tolerance、Softness、Post Processing、Post-Filter、Contract/Expand、Blurを確認しました。

Blackmagic Designの現行DaVinci Resolve Studioページでは、DaVinci AI Neural EngineがStudio-only機能を駆動すると説明され、その機能例として「3D深度マップ」が掲載されています。一方、21.1 ManualのFusion Chapter 109ではDepth Map見出し自体に「Studio Version Only」の表記がありません。そのため、このページではFusion Nodeのedition境界を確定扱いせず、`verification: partial`のままにしています。

内部のdepth推定algorithm、runtime REGID、実機上の端子表示順、処理性能はこのrunでは確認していません。
