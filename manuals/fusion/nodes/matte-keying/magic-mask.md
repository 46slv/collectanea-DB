---
title: "Magic Mask"
description: "AIで人物やobjectを指定し、追跡付きAlpha matteを作るNode。"
doc_type: node
term_id: "magic-mask"
term_short: "Magic Maskは、人物やobjectをpointで指定し、追跡可能なAlpha matteを作るNode。"
verification: partial
aliases: ["Magic Mask", "MagM"]
concepts: ["image-data", "alpha", "mask-data", "tracking"]
nodes: ["Magic Mask"]
node_family: "matte-keying"
controls: ["Use Legacy Magic Mask", "Mode", "Point Mode", "Tracking Controls", "Clear Points", "Go To Frame", "Disk Cache", "Reference Time", "Processed Frames", "Post-Multiply Image", "Filter", "Blur", "Erode/Dilate", "Gamma", "Threshold", "Restore Fringe", "Invert Matte"]
inputs: ["image", "mask", "mask", "mask"]
outputs: ["image"]
tasks: ["create-matte", "isolate-subject", "track-mask", "refine-matte"]
level: intermediate
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-06"
---

# Magic Mask

Magic Maskは、Viewer上で人物やobjectをpointで指定し、DaVinci AI Neural Engineで対象を認識してAlpha matteを作るNodeです。単純な色差だけで抜くのではなく、人物全体、服、顔、髪など「何を対象にするか」を指定して分離できます。

Fusion 21.1ではMagic Mask v2が既定です。旧projectとの互換性が必要な場合は、Inspector下部の**Use Legacy Magic Mask**で旧方式へ切り替えられます。

## 何ができるか

Magic Maskは、対象を指定したReference Frameからmaskを作り、その対象が動くshotではbuilt-in trackingを使ってpointを追従させます。

典型的な用途は次のようなものです。

- 人物だけを分離してColor Correctorをかける
- 服や肌など、人物の一部分だけを別処理する
- objectだけをMask化し、BlurやGlowなどのEffect Maskへ渡す
- green / blue screenがない素材から、人物や物体のmatteを作る

Magic Maskだけで常に完全なedgeが得られるわけではありません。髪、motion blur、細い隙間などはMatte tabや外部Maskで補正します。

## 入力

Magic Maskには4つの入力があります。

### Input

オレンジ色のInputへ、分離したい2D Imageを接続します。

### Garbage Matte

灰色のGarbage MatteへMaskを接続すると、その範囲をtransparentへできます。画面端の不要物や、Magic Maskの解析結果から明示的に除外したい領域に使います。

### Solid Matte

白色のSolid MatteへMaskを接続すると、その範囲を完全にopaqueへできます。AI maskで抜けた領域を強制的に残したい場合に使えます。

### Effect Mask

青色のEffect MaskへMaskを接続すると、Magic Maskの処理結果を適用する範囲を限定できます。21.1 ManualではNode処理の後に適用されるMaskとして説明されています。

## 基本操作

まず、対象ができるだけはっきり見えていて、遮られていないframeを選びます。

Viewer上で対象を左クリックするとpositive pointが置かれ、青で表示されます。positive pointは「この人物 / objectを含める」という指定です。

除外したいものにはnegative pointを置きます。negative pointは赤で表示され、「この部分は対象に含めない」という指定になります。

複雑な対象でも、同じobjectへ大量のpointを置くことが必須ではありません。21.1 Manualでは、まず少数のpointで対象を認識させ、誤って含まれた領域だけnegative pointで修正する流れが説明されています。

## Tracking

pointを置いたframeがReference Timeになります。そこから前後へtrackingし、人物やobjectの動きにpointを追従させます。

Tracking Controlsには、前後へ連続trackingする操作に加えて、1frameずつ進める操作があります。複雑なmotionでpointが外れる場合は、正常だったframeへ戻し、point位置を修正してからframe単位でtrackingできます。

Reference Timeはtracking開始の基準です。21.1 Manualでは、いったんReference Timeを設定した後に変更すると既存tracking情報が失われるため、Reference Frame選びはtracking前に決める必要があります。

Processed Framesでは、すでにtracking済みのframe rangeを確認できます。

## Faster / Better

Modeではqualityとperformanceを切り替えます。

- **Faster** — 低品質だが高速。粗いmaskや作業中の確認向け
- **Better** — よりdetailを残す高品質mode。処理負荷は高い

大まかな対象指定やtracking確認ではFasterを使い、edgeを詰める段階でBetterへ切り替えると作業しやすくなります。

## Matteを整える

Magic Maskで作ったAlphaはMatte tabで調整できます。ViewerをAlpha表示にして、実際のmatteを見ながら詰めます。

### Filter / Blur

Blurでmatte edgeを柔らかくします。FilterではBox Blur、Bartlett、Multi-Box、Gaussian、Fast Gaussianからblur方式を選べます。

### Erode/Dilate

matteを縮小・拡張します。edgeが背景側へはみ出している場合は少し縮め、被写体のedgeが欠けている場合は拡張方向へ調整します。

### Gamma

半透明領域のAlphaを調整します。完全なblack / whiteは保ったまま、中間Alphaをopaque寄り / transparent寄りへ動かせます。

### Threshold

lower thresholdより下をtransparent、upper thresholdより上をopaqueへします。その間のAlphaは相対値を保ちます。

### Restore Fringe

keyingで失われたhairなどのedgeを戻すためのControlです。matte本体を単純に膨らませるのではなく、fringe領域を復元したい場合に使います。

### Invert Matte

Alphaのopaque / transparentを反転します。

## Solid / Garbage Matteを併用する

AI maskがほぼ正しくても、一部だけ確実に残したい / 消したい場合は外部Maskを併用できます。

たとえば人物maskで手の一部が欠ける場合、PolygonやPaintで補助Maskを作りSolid Matteへ接続します。逆にframe端の機材や不要物が誤認識される場合はGarbage MatteへMaskを入れて除外できます。

Magic Maskで全部を解決しようとせず、AIで大部分を作り、局所的な修正だけ別Maskへ任せる構成も有効です。

## Color Correctorへ使う例

人物だけをgradeする場合は、Magic Maskの出力をColor CorrectorのEffect Maskへ接続できます。

```text
MediaIn ─────────────→ Color Corrector ─→ Output
   └─→ Magic Mask ───→ Color Corrector (Effect Mask)
```

1. MediaInをColor CorrectorとMagic Maskへ分岐します。
2. Magic Maskで人物へpositive pointを置きます。
3. shot全体をtrackingします。
4. Alpha表示でedgeを確認し、Matte tabで調整します。
5. Magic MaskをColor CorrectorのEffect Maskへ接続します。
6. Color Correctorで人物だけをgradeします。

Manualでも、Magic Maskの出力を別NodeのMask入力へ渡す構成が基本例として示されています。

## Post-Multiply Image

Post-Multiply Imageを有効にすると、生成したAlphaをRGBへ乗算してpremultiplied Imageとして扱える状態にします。21.1 Manualでは通常有効で、既定もOnです。

無効にした場合はpremultiplicationの扱いが変わるため、後段MergeのOperatorなどを確認する必要があります。

## Delta Keyerとの違い

[Delta Keyer](./delta-keyer)はgreen / blue screenの色差からAlphaを作ります。

Magic Maskは人物やobjectの形と見た目をAIで認識してmatteを作ります。screen撮影ではDelta Keyerの方がedgeやspillを細かく管理しやすい場合があり、通常footageから対象を抜きたい場合はMagic Maskが候補になります。

## 関連Node

- [Delta Keyer](./delta-keyer) — green / blue screenからAlphaを作る
- [Matte Control](./matte-control) — Magic Maskで作ったAlphaを後段で調整・合成する
- [Depth Map](../effects-film/depth-map) — 距離に応じたAlpha matteを作る
- [Relight](./relight) — surface方向を解析してlighting用Alphaを作る
- [Color Corrector](../color/color-corrector) — Magic MaskをEffect Maskとして使い対象だけをgradeする

## バージョンと検証状況

DaVinci Resolve 21.1 Reference Manual Chapter 109 pp.2534–2539で、Magic Mask v2がFusionで既定であること、Use Legacy Magic Mask、positive / negative point、4入力、Faster / Better、tracking controls、Reference Time、Processed Frames、Post-Multiply Image、Matte tabのFilter / Blur / Erode-Dilate / Gamma / Threshold / Restore Fringe / Invert Matteを確認しています。

このManual sectionではFusion Magic Maskのedition境界を明示していないため、このページではStudio限定とは断定していません。current runtime REGID、実機上の端子配置、処理速度、AI model内部仕様はこのrunでは確認していません。
