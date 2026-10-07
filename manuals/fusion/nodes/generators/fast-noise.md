---
title: Fast Noise
description: Perlin Noiseを高速生成し、Detail・Brightness・Contrast・Scale・Seetheやmap入力で雲・霧・displacement・mask sourceを作るGenerator。
doc_type: node
term_id: fast-noise
term_short: Fast Noiseは、制御可能なPerlin Noiseを生成し、textureや別Effectのcontrol sourceに使うNode。
verification: partial
aliases: [Fast Noise, FN]
concepts: [image-data, procedural-texture, mask-data]
nodes: [Fast Noise]
node_family: generators
controls: [Discontinuous, Inverted, Center, Detail, Brightness, Contrast, Lock X/Y, Scale, Angle, Seethe, Seethe Rate, Two Color, Gradient]
inputs: [mask, mask, mask]
outputs: [image]
tasks: [generate-image, procedural-texture, noise, mask-source, displacement-source]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# Fast Noise

Fast Noiseは、滑らかなPerlin Noiseを高速に生成する2D <Term id="image">Image</Term> Generatorです。

雲・霧・水面・caustics・煙などを直接作るだけでなく、Displace、Dissolve、particle、Maskなど別Nodeを動かすためのcontrol sourceとしてよく使います。

## 役割

「ランダムな見た目」を作るだけでなく、時間変化する連続patternをImageとして生成します。

```text
Fast Noise → Merge / Displace / Mask / Particle / Gradient Map
```

同じNoiseをImageとして見せることも、別Effectの入力dataとして使うこともできます。

## 入力

Fast Noiseには3つの任意Mask入力があります。

### Noise Detail Map

gray inputです。

接続したMaskの値で、場所ごとのDetail量を変えます。

- 黒 — detail 0
- 白 — full detail
- gray — 中間量

gradient color mappingより前に適用されます。

### Noise Brightness Map

白色inputです。

Noiseのbrightness mapを場所ごとに制御します。Detail = 0の場合は、Perlin Noise map自体をこの入力で置き換えるような使い方もManualに記載されています。

### Effect Mask

青色inputです。

Fast Noiseの最終出力を適用する範囲を制限します。

Noise Detail / Brightness MapはNoise生成**内部**を変え、Effect Maskは生成結果の適用範囲を制限するため、役割が異なります。

## 出力

生成したNoiseを2D Imageとして出力します。

Generatorなのでprimary Image inputは不要です。

## Noise tab

### Discontinuous

通常は滑らかに補間されるNoise contourへ、硬い不連続線を作ります。

自然な雲・霧とは違い、セル状・割れ目状のpatternが必要な場合に候補になります。

### Inverted

Noise patternを反転します。

Discontinuousと組み合わせると見た目の差が大きくなります。

### Center

Noise pattern全体をpan / moveします。

### Detail

Noiseへ細かいlayerを追加します。

値を上げると大きなpattern自体は保ちながら、より細かな変化が重なります。高いDetailはrender時間も増やします。

### Brightness

Gradient color mapping前のNoise map全体の明るさを調整します。

### Contrast

Gradient mapping前のNoise rangeを広げたり狭めたりします。

Contrastを上げると明暗差が強くなり、Mask sourceとして使う場合はthreshold-likeな見え方へ近づけられます。

### Lock X/Y / Scale

Noise patternの大きさを調整します。

Lock X/Yを外すとX / Yを別々にscaleでき、横長・縦長のtextureを作れます。

### Angle

Noise patternを回転します。

### Seethe

別のNoise stateへ連続的に変化させます。

値をanimateすると、位置をslideさせるのとは違う「内部patternが流動する」変化を作れます。

### Seethe Rate

keyframeを打たなくても、frameごとにSeetheを自動進行させます。

雲・煙・揺らぎを常時変化させたい場合に使います。

## Color tab

### Two Color

2色の間でNoise値をcolorへmapします。

### Gradient

Advanced GradientでNoise値に対する色を細かく設定します。

Maskやdisplacement sourceとして使う場合はgrayscaleを保ち、最終Imageとして見せる場合にColor tabで色を付ける、と役割を分けると構成を読みやすくできます。

## Image tab

Background等と同じGenerator共通Image tabを持ちます。

DaVinci Resolveでは既定でTimeline resolutionを基準に生成されます。必要ならUse Frame Format Settingsを外してWidth / Heightを個別指定できます。

大きなNoise Imageを生成してからdownsampleするより、用途に必要なresolutionを先に決める方が処理量を抑えやすい場合があります。

## 最小構成

### procedural background

```text
Fast Noise → Color Corrector → Merge
```

### DissolveのGradient Map

```text
Background ─┐
Foreground ─┼─ Dissolve → Output
Fast Noise ─↑
```

DissolveをGradient Wipeにすると、Fast Noiseの明暗で切り替え位置を変えられます。

### Displacement source

```text
Image ───────→ Displace → Output
Fast Noise ──→ map input
```

## 運用例

動く霧のtextureを作る場合:

1. Scaleで大きなnoise cellへします。
2. Detailを上げすぎず、大きな形を先に決めます。
3. Contrastでdensity差を調整します。
4. Seethe Rateでゆっくり変化させます。
5. Gradientで色を付けるか、grayscaleのまま別Effectへ渡します。

位置を横へ流したい場合はCenter、pattern自体を変化させたい場合はSeethe、と役割を分けます。

## Backgroundとの違い

- **Background** — 意図した色・gradientを明示的に配置
- **Fast Noise** — proceduralな有機patternを生成

単純なRadial GradientならBackgroundの方が読みやすく、複雑な不規則patternならFast Noiseが向きます。

## 関連する考え方

- [Generatorノード](./)
- [マスク（Mask）](../../learn/02-data/mask)
- [解像度 / アスペクト比（Resolution / Aspect）](../../learn/03-space/resolution-aspect)

## 似たNode・関連Node

- [Background](./background)
- [Mandelbrot](./mandelbrot)
- [Plasma](./plasma)
- [Dissolve](../compositing/dissolve)
- Displace

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 103 pp.2362–2365で、3つのMask入力、Discontinuous、Inverted、Center、Detail、Brightness、Contrast、Scale、Angle、Seethe / Seethe Rate、Two Color / Gradientを確認しました。Generator共通Image tabはpp.2400–2402、Resolve上の既定resolutionはFusion Fundamentals Chapter 75 p.1642を基にしています。

Perlin Noiseの内部実装、各Controlの全数値range、実機性能は未確認のため `verification: partial` としています。
