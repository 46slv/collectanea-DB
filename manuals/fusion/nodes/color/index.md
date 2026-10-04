---
title: Colorノード
description: 明るさ・contrast・色味・white balance・curve・colorspaceなど、2D ImageのColor処理を目的から選ぶ入口。
doc_type: index
verification: partial
product_scope: fusion
tasks: [lookup-node, color-correct, white-balance, color-space]
updated: "2026-10-04"
---

# Colorノード

Color系Nodeは、2D <Term id="image">Image</Term>のRGB / Alpha値を変えるNodeです。

「色を直す」という一言では範囲が広いため、まず**単純な明るさ・contrast調整なのか、Shadows / Midtones / Highlightsまで分けたいのか、white balanceなのか、curve / colorspace変換なのか**を分けると選びやすくなります。

## まず選ぶ

| やりたいこと | Node | 向いている用途 |
| --- | --- | --- |
| Gain / Lift / Gamma / Contrast / Brightness / Saturationを直接調整 | [Brightness Contrast](./brightness-contrast) | 基本的なtone・明るさ調整 |
| Shadows / Midtones / Highlightsを分けて総合的に補正 | [Color Corrector](./color-corrector) | 詳細なcolor correction、histogram matching |
| 灰色基準や色温度からwhite balance | [White Balance](./white-balance) | 色かぶり補正、色温度合わせ |
| curveでchannelごとに値を変える | [Color Curves](./color-curves) | LUT-likeなcurve調整 |
| RGBAのGain / Lift / Gammaをchannel別に調整 | [Color Gain](./color-gain) | channel balance、軽量な補正 |
| colorspace / gamutを変換 | [Gamut](./gamut) / [OCIO Color Space](./ocio-colorspace) | workflow上のcolorspace変換 |
| LUTを適用 | [OCIO File Transform](./ocio-filetransform) | OCIO経由のLUT適用 |

## Brightness Contrast

Brightness Contrastは、基本的なtone調整を1 Nodeで行います。

Gain、Lift、Gamma、Contrast、Brightness、Saturationを持ち、それぞれ画素値へ違う計算を行います。単に「明るさを上げる」場合でもGainとBrightnessでは暗部への効き方が異なります。

## Color Corrector

Color Correctorは、より総合的な補正Nodeです。

Shadows / Midtones / Highlights / Masterを分けて調整し、Colors / Levels / Histogram / Suppressの各methodを切り替えられます。Match Reference入力を使ったhistogram matchingも持ちます。

単純なGain・GammaだけならBrightness Contrastの方が目的を読みやすく、tone rangeを分ける必要がある場合はColor Correctorが候補になります。

## White Balance

White Balanceは、CustomとTemperatureの2方式を持ちます。

Customでは本来grayであるpixelを参照し、指定Result Colorへ補正します。Temperatureでは撮影時の色温度と目標色温度を指定します。

## Effect Mask

Color系Nodeの多くは青色のEffect Mask入力を持ちます。

```text
Image → Color Node → Output
           ↑
          Mask
```

MaskはColor処理の種類を変えず、処理を適用する範囲だけを制限します。

## AlphaがあるImageをColor補正するとき

premultiplied Alphaを持つRGBA ImageでRGBだけを強く補正すると、半透明edgeのRGB / Alpha関係が崩れてhaloや不自然な明るさが出る場合があります。

Brightness Contrast、Color Curves、Color Corrector等にはPre-Divide / Post-Multiply系の設定があります。これはColor処理前にRGBをAlphaで割り、補正後に再度Alphaを掛けるための処理です。

詳しくは[プリマルチプライ（Premultiplication）](../../learn/04-compositing/premultiplication)を参照してください。

## Color補正とColor Space変換は分ける

Brightness ContrastやColor Correctorは「見た目・tone・色味を補正する」Nodeです。

Gamut / OCIO Color Space等は「どのcolorspaceとして値を解釈・変換するか」を扱います。同じColorカテゴリでも役割を混ぜません。

## 関連する考え方

- [プリマルチプライ（Premultiplication）](../../learn/04-compositing/premultiplication)
- [AlphaとMaskを分けて診断する](../../learn/07-debugging/alpha-vs-mask)
- [マスク（Mask）](../../learn/02-data/mask)

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 93、pp.2148–2206、およびFusion Fundamentals Chapter 77のpremultiplication説明を基に整理しています。

このFamily OverviewではNodeの選び分けを担当します。全Color Nodeの全Control、数式、colorspace運用は個別Reference / workflow Conceptへ分けます。
