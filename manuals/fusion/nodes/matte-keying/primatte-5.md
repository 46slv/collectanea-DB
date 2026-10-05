---
title: Primatte
description: green / blue screenのRGBを4つのzoneへ分類し、matte、semi-transparent detail、spillを段階的に調整するFusion Studio専用Keyer。
doc_type: node
term_id: primatte-5
term_short: "Primatteは、green / blue screenを4つのzoneへ分類し、matteとspillを段階的に整えるFusion Studio専用Keyer。"
verification: partial
aliases: [Primatte, Primatte 5, Pri]
concepts: [image-data, alpha, premultiplication, keying]
nodes: [Primatte]
node_family: matte-keying
controls: [View Mode, Lock Color Picking, Auto Compute, Select Background Color, Clean Background Noise, Clean Foreground Noise, Spill Sponge, Matte Sponge, Restore Detail, Make Foreground Transparent, Spill, Matte, Detail, Algorithm, Hybrid Rendering, Hybrid Blur, Hybrid Erode, Adjust Lighting, Lighting Threshold, Crop, Fine Tuning, Replace Mode, Grain Size, Grain Tolerance, Filter, Blur, Blur Inward, Contract/Expand, Gamma, Threshold, Restore Fringe, Invert Matte, Post-Multiply Image]
inputs: [image, image, image, mask, mask, mask]
outputs: [image]
tasks: [create-matte, keying, green-screen, blue-screen, despill]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-05"
---

# Primatte

Primatteは、green / blue screen素材から被写体を分離するFusion Studio専用Keyerです。RGB pixelを複数の領域へ分類し、背景を透明にする処理、被写体の半透明部分、screen colorのspillを段階的に調整します。

単純に「この色なら透明」と1つのthresholdで切るのではなく、背景からforegroundへ近づくにつれて扱いを変えます。髪、煙、motion blurのように完全なopaque / transparentへ分けにくい部分を残しながらkeyを詰めたいshotで使います。

## 4つのzone

21.1 Manualでは、PrimatteがRGB pixelを次の4つのzoneへ分類すると説明されています。

- **Zone 1** — 完全なbackground。透明として扱う領域
- **Zone 2** — spill suppressionとtransparencyの両方を持つforeground
- **Zone 3** — spill suppressionだけを持つforeground
- **Zone 4** — 完全なforeground。不透明として扱う領域

screenに近い色とforegroundに近い色の間を段階的に扱うため、半透明edgeを残したままscreenを除去できます。

## 入力

PrimatteはNode Editor上に6つの入力を持ちます。

### Foreground Input

オレンジ色のForeground Inputへ、green / blue screenで撮影した2D Imageを接続します。

Primatteでは、他の多くのFusion Nodeと異なり、主入力が**Foreground**として明示されています。

### Background Input

緑色のBackground Inputへ、最終的に合成したい背景Imageを接続できます。これはoptionalです。

未接続ならPrimatteはkey済みforegroundを出力します。Backgroundを接続すると、Primatte内部で最終compositeを確認でき、advanced edge blendingも利用できます。

### Replacement Image

magentaのReplacement Image Inputへ、spill suppressionで置換色の参照に使う2D Imageを接続できます。

Replace ModeをImageにした場合、このImageまたはBackground Imageをぼかした色からspill replacementを作ります。Replacement Imageを接続せずBackgroundだけを接続した場合、ManualではBackground Imageがspill replacementにも使われると説明されています。

### Garbage Matte

灰色のGarbage MatteへMaskを接続すると、その範囲を透明にできます。screen外に写った機材や、key処理で残す必要がない領域を先に除外する用途に使います。

### Solid Matte

白色のSolid MatteへMaskを接続すると、その範囲を完全に不透明へできます。screen色に近い衣服や目など、keyで削れてほしくない領域を保護するときに使います。

### Effect Mask

青色のEffect MaskへMaskを接続すると、Primatteのkey処理を適用する範囲を限定できます。21.1 Manualでは、Node処理後に適用されるMaskとして説明されています。

## 出力とView Mode

PrimatteはAlphaを持つ2D Imageを出力します。Background Inputを接続した場合は、View ModeのCompositeで内部compositeも確認できます。

View Modeには、最終結果だけでなく途中段階を確認する表示があります。

- **Black** — foregroundをblack / transparent background上で表示
- **Composite** — spill suppression後のforegroundをBackground Inputへ合成した結果
- **Defocus Foreground** — Pre Matte keyの結果
- **Processed Foreground** — Solid / Garbage Matteを組み合わせる前のkey Alpha
- **Hybrid Matte** — Hybrid Renderingで作られたmatte
- **Lighting Foreground** — Adjust Lightingが作った人工的なbacking screen上のforeground
- **Lighting Background** — Adjust Lightingが作ったbacking screen

matteを詰めるときはRGBの見た目だけで判断せず、Alpha表示とComposite表示を切り替えて確認します。

## 最初に試すAuto Compute

**Auto Compute**は、foreground Imageを解析してbacking screen colorを推定し、foreground / backgroundの分離と一部のnoise cleanupまで自動で行います。

Auto Computeだけで十分なmatteが得られた場合は、そのままspill removalへ進めます。結果が不十分なら、Select Background Color、Clean Background Noise、Clean Foreground Noiseを使って手動で詰めます。

Viewerからのsamplingが終わったら**Lock Color Picking**を有効にすると、誤操作でselectionを変えるのを防げます。

## screen colorを手動で選ぶ

**Select Background Color**を有効にし、Viewer上で被写体に近いgreen / blue screenをscrubしてsampleします。

Primatteはsampleしたbacking colorを基準にforeground / backgroundの分類を作ります。screenのshadowまでforegroundとして残したい場合は、その暗いscreen部分をbackground sampleへ含めないようにします。

## background / foreground noiseを掃除する

### Clean Background Noise

Alpha表示で、background側に白や明るいgrayとして残る領域をsampleし、transparent側へ寄せます。

すべての小さなpixelを完全にblackへする必要はありません。髪や半透明edgeの近くまで強く掃除するとdetailを失いやすいため、境界付近は後段のFine Tuningで整える余地を残します。

### Clean Foreground Noise

foreground内部に暗いgrayやtransparentな穴が残る場合、そのpixelをsampleしてopaque側へ寄せます。

screen色に近い衣服などでClean Foreground Noiseを強く使うとedgeへfringeが出る場合があり、そのようなshotではHybrid Renderingも候補になります。

## Hybrid Rendering

**Hybrid Rendering**は、foregroundのbodyとedgeを内部で別々に扱い、2つのmatteを組み合わせる処理です。

被写体内部にscreen色へ近い色があり、Clean Foreground Noiseで内部をopaqueへすると外周edgeが悪化する場合に使います。Primatteはedge用とbody用のkeyを作り、body matteへBlur / Erodeを加えてedge matteと合成します。

- **Hybrid Blur** — body matteをぼかす
- **Hybrid Erode** — Hybrid matteをerode / dilateする

View ModeをHybrid Matteへ切り替えると、調整対象を直接確認できます。

## 照明ムラのあるscreenを扱う

**Adjust Lighting**は、Auto ComputeまたはSelect Background Colorでbacking colorを決めた後に使います。

Primatteが人工的なclean plateを生成し、foregroundの背後に均一なbacking screenを作ってkeyへ利用します。screen照明のムラが大きいshotで、単一のsampleだけでは背景を分けにくい場合の補助です。

**Lighting Threshold**は、View ModeのLighting Backgroundを見ながら生成されたbacking screenを調整します。

## matteとdetailを直接調整する

Primatte tabではViewer上で色をsampleしながら、特定の色領域だけを段階的に調整できます。

- **Matte Sponge** — 本来opaqueであるforegroundがgrayになった領域をopaqueへ戻す
- **Restore Detail** — 完全にtransparentになった領域から髪や煙などを戻す
- **Make Foreground Transparent** — foreground側の特定色を少しtransparentにする
- **Matte(+) / Matte(-)** — sampleした色領域のmatteをよりopaque / transparentへ動かす
- **Detail(+) / Detail(-)** — sampleした色領域のdetailを減らす / 戻す
- **Spill(+) / Spill(-)** — spill suppressionを弱める / 強める

これらは画面全体へ一律に掛けるControlではなく、sampleした色領域へ作用します。

## Fine Tuning tab

Fine Tuning tabでは、Viewerでsampleした色を基準に3種類のsliderで細かく調整します。

- **Spill** — 選んだ色領域のspill suppression量
- **Transparency** — 選んだ色領域をよりtransparent / opaqueへ調整
- **Detail** — 選んだ色領域の失われたdetailを戻す、または減らす

操作はadditiveです。1回で足りない場合は再sampleして追加調整できます。

## spillを置き換える

**Spill Sponge**は、screen colorがforegroundへ反射して残るspillをViewer上のsampleから除去します。置換方法はReplace tabの**Replace Mode**で選びます。

- **Complement** — screen colorの補色で置換。fine detailを保ちやすい
- **Image** — BackgroundまたはReplacement Imageをぼかした色から置換
- **Color** — 指定したsolid colorで置換

強いspillでは、1つの方法だけが常に最適とは限りません。実際に使うBackgroundを見ながらedge colorを確認します。

## film grainがkeyを荒らす場合

Degrain tabは、foreground ImageのgrainがClean Background Noiseへ混ざり、edgeがjaggedになる場合に使います。

**Grain Size**はNone / Small / Medium / Largeから選び、sample周辺を平均化する範囲を変えます。**Grain Tolerance**は、foreground edgeをなるべく変えずにClean Background Noiseの効果を強めるためのControlです。

これは最終Image全体の見た目をdenoiseする目的ではなく、grainがkey判定へ与える影響を抑えるための処理です。

## Matte tabで最終Alphaを整える

Matte tabは、Primatteが作ったAlphaとSolid / Garbage Matteを組み合わせた最終matteを整えます。

- **Filter / Blur** — matte edgeをぼかす。FilterはBox / Bartlett / Multi-Box / Gaussian
- **Blur Inward** — blurをforegroundの内側方向だけへ適用し、外側haloを抑える
- **Contract/Expand** — semitransparent領域を縮小 / 拡大する
- **Gamma** — semitransparent Alphaをよりopaque / transparentへ寄せる
- **Threshold** — low側より下をtransparent、high側より上をopaqueへ寄せる
- **Restore Fringe** — keyで削れたhair等のedgeを戻す
- **Invert Matte** — opaque / transparentを反転する

Contract/ExpandとGammaは、完全なblack / white領域ではなく主にsemitransparent領域へ作用します。

## Post-Multiply Image

**Post-Multiply Image**を有効にすると、Primatteが作ったAlphaをRGBへ乗算します。21.1 Manualでは通常有効で、既定もOnです。

無効にしたImageはpremultiplied Imageとして扱えなくなるため、ManualではMerge時にAdditiveではなくSubtractiveを使うよう案内されています。

## 3つのAlgorithm

Primatteには3種類のkeying algorithmがあります。

- **Primatte** — default。3つのpolyhedronでRGB colorspaceを分ける。最も高品質だが計算量が大きく、Solid Color / Complement Colorのspill suppressionに対応
- **Primatte RT** — 1つのplanar surfaceを使う最も高速な方式。低彩度screenが苦手で、Complement Color spill suppressionには非対応
- **Primatte RT+** — 6つのplanar surfaceを使い、quality / performanceともにPrimatteとRTの中間。低彩度screenとComplement Colorには同様の制約がある

速度だけで選ぶのではなく、screenの彩度、edge、spillを見て切り替えます。

## 基本的な使い方

    Foreground ─→ Primatte ─→ Merge / MediaOut
                    ↑
              Background (optional)

1. green / blue screen素材をForeground Inputへ接続します。
2. 必要なら合成先をBackground Inputへ接続します。
3. Auto Computeを試し、Alphaを確認します。
4. 不十分ならSelect Background Colorでscreenをsampleします。
5. Clean Background Noiseでbackgroundの残りを減らします。
6. Clean Foreground Noiseでforeground内部の穴を整えます。
7. hair / smoke等が失われた部分はRestore DetailやFine Tuningで戻します。
8. Spill SpongeまたはFine TuningのSpillでscreen colorのspillを除去します。
9. Matte tabでBlur、Contract/Expand、Gamma、Thresholdを必要な範囲だけ調整します。
10. 実際のBackground上でedgeとspillを確認します。

## Delta Keyerとの選び分け

[Delta Keyer](./delta-keyer)とPrimatteは、どちらもgreen / blue screenへ使えます。21.1 Manualは、shotによってどちらが適するか変わり、場合によっては2つを組み合わせることもあると説明しています。

Primatteは色を4つのzoneへ分類し、Viewerでsampleしながらbackground / foreground noise、detail、spillを局所的に調整できる点が特徴です。Delta KeyerはKey / Pre Matte / Matte / Fringe / Tuningという処理段階を持ち、Clean Plate入力も利用できます。

## 関連Node

- [Delta Keyer](./delta-keyer) — green / blue screen用の主要Keyer
- [Ultra Keyer](./ultra-keyer) — Pre-Matteとcolor-differenceを組み合わせる別Keyer
- [Matte Control](./matte-control) — key後のAlphaや追加Matteを整理する
- [Merge](../compositing/merge) — key済みforegroundを別Backgroundへ合成する

## バージョンと検証状況

DaVinci Resolve 21.1 Reference Manual（September 2026）Chapter 109 pp.2544–2557で、Fusion Studio限定、6入力、4 zone、View Mode、Primatte / Fine Tuning / Replace / Degrain / Matte各tab、3種類のalgorithm、Hybrid Rendering、Adjust Lighting、Post-Multiply Image、基本keying workflowを確認しています。

このrepoの既存URL / term IDには「Primatte 5」が残っていますが、21.1 ManualのNode名とsection titleは**Primatte [Pri]**です。このページでは現行Manualに合わせて表示名をPrimatteとし、Primatte 5はaliasとして残しています。

Manualで確認できないruntime REGID、実機上の端子表示順、処理性能は断定していません。
