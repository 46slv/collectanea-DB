---
title: Brightness Contrast
description: 2D ImageのGain・Lift・Gamma・Contrast・Brightness・Saturation・Black/White pointを直接調整する基本Color Node。
doc_type: node
term_id: brightness-contrast
verification: partial
aliases: [Brightness Contrast, BC]
concepts: [image-data, color-adjustment, premultiplication]
nodes: [Brightness Contrast]
node_family: color
controls: [Color Channels, Gain, Lift, Gamma, Contrast, Brightness, Saturation, Low, High, Direction, Clip Black, Clip White, Pre-Divide/Post-Multiply]
inputs: [image, mask]
outputs: [image]
tasks: [brightness, contrast, gain, color]
level: foundation
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# Brightness Contrast

Brightness Contrastは、2D <Term id="image">Image</Term>の明るさ・contrast・gamma・saturationを、基本的な数値Controlで直接調整するColor Nodeです。

単に「明るくする」だけでもGain、Lift、Gamma、Brightnessでは効くtone rangeと計算が違うため、何を動かしたいかでControlを選びます。

## 役割

入力ImageのRGB値を補正し、補正後の2D Imageを出力します。

```text
Image → Brightness Contrast → Output
                     ↑
                  Effect Mask
```

## 入力

### Input

オレンジ色の必須入力です。補正したい2D Imageを接続します。

### Effect Mask

青色の任意入力です。Maskの白い範囲だけBrightness Contrastの補正を適用します。

21.1 ManualではEffect MaskはNode処理後に適用されると説明されています。

## 出力

補正済みの2D Imageを出力します。

後段のColor Node、Merge、Saver / MediaOut等へ接続できます。

## 主な設定項目

### Color Channels（RGBA）

どのchannelを処理するか選びます。Manualでは既定でR / G / Bが処理対象です。

このchannel選択は処理前に効き、外したchannelは補正自体をskipします。Common Controls側のRGBA checkboxは処理後に適用されるため、役割が異なります。

### Gain

pixel値を乗算します。

Blackは0なのでGainを上げてもblackはblackのままです。値が大きいpixelほど変化量も大きくなるため、暗部より中〜高輝度側へ強く効きます。

### Lift

whiteを基準に値を持ち上げる方向のControlです。

Gainとは逆に、暗い値ほど影響が大きく、明るい値ほど影響が小さくなります。black付近を持ち上げたい場合にGainとは違う結果になります。

### Gamma

black 0.0とwhite 1.0を保ちながら、中間toneを非線形に動かします。

極端なblack / whiteを大きく動かさず、midtonesの見え方を調整したい場合に使います。

### Contrast

0.5付近をpivotとして、暗部と明部の差を広げたり狭めたりします。

Contrastを上げると値がblack / white側へ広がり、下げると0.5付近へ集まります。

### Brightness

全pixelへ同じ固定値を加減します。

Gainのような乗算ではないため、暗部・明部を同じ量だけ上下へ移します。

### Saturation

色の鮮やかさを調整します。

0ではRec.601 weightingを使ったgrayscaleになります。

### Low / High

入力値のblack point / white pointを再定義します。

単純なBrightness shiftやGamma curveではなく、指定rangeを0〜1へremapするControlとして使います。

### Direction

Forwardでは指定補正を通常方向に適用し、Reverseではそのcolor transformを逆方向へ適用します。

Manualでは、Forward / Reverseより上にあるColor controlsはreversibleとして説明されています。

### Clip Black / Clip White

float16 / float32 Imageで0未満・1超のout-of-range値をclipします。

8-bit / 16-bit integer Imageではそもそもそのrange外を保持できないため、同じ意味を持ちません。

### Pre-Divide / Post-Multiply

premultiplied Alphaを持つRGBA ImageをColor補正するとき、補正前にRGBをAlphaで割り、補正後に再度Alphaを掛けます。

半透明edgeのRGB / Alpha関係を保ったまま補正するために使います。

→ [プリマルチプライ（Premultiplication）](../../learn/04-compositing/premultiplication)

## 処理順

21.1 Manualでは、Controlが並んでいる順に処理され、Pre-Divide / Post-Multiplyだけは最初に適用されると説明されています。

たとえばGainの後にGamma、その後にContrastが続きます。同じ数値を使っても順序を入れ替えた別Node構成と結果が同じになるとは限りません。

## 最小構成

```text
MediaIn → Brightness Contrast → Output
```

最初は1つだけ変更します。

- highlights寄りを変えたい → Gain
- shadows寄りを変えたい → Lift
- midtonesを変えたい → Gamma
- 全体を同量だけ上下 → Brightness
- black / white差を広げたい → Contrast

## 運用例

少し暗いgraphics素材を明るくしつつ彩度も上げたい場合:

1. GainかBrightnessのどちらが意図に近いか1つだけ試します。
2. Gammaでmidtonesを調整します。
3. Saturationを必要量だけ上げます。
4. 透明edgeがある素材ならPre-Divide / Post-Multiplyを確認します。

複数Controlを同時に大きく動かすより、どのtone rangeを直したいかを分ける方が調整理由を追いやすくなります。

## Color Correctorとの違い

- **Brightness Contrast** — 基本的な数値ControlでImage全体を直接補正
- **Color Corrector** — Shadows / Midtones / Highlightsを分離し、Colors / Levels / Histogram / Suppressまで扱う

単純なtone補正ならBrightness Contrast、tone rangeごとに別の色・level調整をしたい場合は[Color Corrector](./color-corrector)を検討します。

## 関連する考え方

- [プリマルチプライ（Premultiplication）](../../learn/04-compositing/premultiplication)
- [マスク（Mask）](../../learn/02-data/mask)
- [AlphaとMaskを分けて診断する](../../learn/07-debugging/alpha-vs-mask)

## 実機例：明るさ・彩度・コントラストを一つずつ変える

<!-- capture-case:S60 -->

Resolve Studio21.1.0.14／Windowsで、1920×1080の固定チャートを接続しました。左が入力、右が処理後です。両ViewerはColor／40%で、書き出しや測色の比較ではありません。内部REGIDは`BrightnessContrast`です。

[![LoaderからBrightnessContrast1とMediaOut1へ接続した実機Graph](/img/fusion/captures/S60/graph.png)](/img/fusion/captures/S60/graph.png)

[![Brightness ContrastのGain1、Contrast0.3、Saturation1、Low0、High1を示すInspector](/img/fusion/captures/S60/inspector.png)](/img/fusion/captures/S60/inspector.png)

[![左の元画像に対し、右ではContrast0.3で暗部と明部の差が強くなる](/img/fusion/captures/S60/compare.png)](/img/fusion/captures/S60/compare.png)

上はGain1、Contrast0.3、Saturation1です。暗部と明部の差が強くなりました。次はContrast0へ戻し、Gainだけを0.5にした状態です。チャートの色を残したまま暗くなります。

[![Contrast0とSaturation1のままGain0.5へ設定したInspector](/img/fusion/captures/S60/gain05-inspector.png)](/img/fusion/captures/S60/gain05-inspector.png)

[![Gain0.5で右のチャートのRGBが暗くなった比較](/img/fusion/captures/S60/gain05.png)](/img/fusion/captures/S60/gain05.png)

Gainを1へ戻し、Saturationだけを0にすると色パッチがグレーになります。Lift0、Gamma1、Brightness0、Low0／High1を保ち、Clip Black／WhiteとPre-Divide/Post-Multiplyはオフです。

[![Gain1とContrast0のままSaturation0へ設定したInspector](/img/fusion/captures/S60/saturation0-inspector.png)](/img/fusion/captures/S60/saturation0-inspector.png)

[![Saturation0で右の色パッチがグレーになった比較](/img/fusion/captures/S60/saturation0.png)](/img/fusion/captures/S60/saturation0.png)

最後はGain1、Contrast0.3、Saturation1へ戻して保存しました。Mask、Alpha選択、半透明エッジ、Reverse、HDR／精度差、性能は未確認です。

[再現用Graph](/img/fusion/captures/S60/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S60/capture.json)

## 似たNode・関連Node

- [Color Corrector](./color-corrector)
- [Color Curves](./color-curves)
- [Color Gain](./color-gain)
- [White Balance](./white-balance)

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 93、pp.2150–2153で、Image / Effect Mask入力、Color Channels、Gain、Lift、Gamma、Contrast、Brightness、Saturation、Low / High、Direction、Clip Black / White、Pre-Divide / Post-Multiply、Control処理順を確認しました。

S60の内部REGIDと上記の固定値・出力表示は確認済みです。32-bit floatでの精度比較、半透明エッジ、全Control、実機性能、Edition差は未確認のため `verification: partial` を維持します。
