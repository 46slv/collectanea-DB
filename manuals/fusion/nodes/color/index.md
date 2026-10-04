---
title: Colorノード
description: 明るさ・contrast・色味・white balance・curve・channel・ACES / RCM / OCIOなど、2D ImageのColor処理を目的から選ぶ入口。
doc_type: index
verification: partial
product_scope: fusion
tasks: [lookup-node, color-correct, white-balance, color-space]
updated: "2026-10-05"
---

# Colorノード

Color系Nodeは、2D <Term id="image">Image</Term>の見た目を補正するものだけでなく、channelを組み替えるもの、camera / display color spaceを変換するもの、gamutを制限するものまで含みます。

最初に**look調整 / channel操作 / color management / lens補正**のどれかを分けると選びやすくなります。

## 基本補正

| やりたいこと | Node |
| --- | --- |
| Gain / Lift / Gamma / Contrast等を直接調整 | [Brightness Contrast](./brightness-contrast) |
| 最暗 / 最明値を自動でRangeへ広げる | [Auto Gain](./auto-gain) |
| Shadows / Midtones / Highlightsまで総合補正 | [Color Corrector](./color-corrector) |
| 軽量なLift / Gamma / Gain + Balance | [Color Gain](./color-gain) |
| gray / color temperatureからwhite balance | [White Balance](./white-balance) |

## Curveで補正

- [Color Curves](./color-curves) — input value → output valueをSplineでremap
- [Hue Curves](./hue-curves) — Hueを横軸に特定色域だけを補正

## Channelを組み替える

- [Channel Booleans](./channel-boolean) — RGBA / AuxをCopy・Multiply等で演算
- [Color Matrix](./color-matrix) — 4×4 matrixでRGBAを線形変換
- [Copy Aux](./copy-aux) — Z / Normal / Vector等をRGBAへ出す / Auxへ戻す
- [Swizzler](./swizzler) — 複数sourceからcustom Layer / multilayer Imageを作る

## Color management

### ACES

[ACES Transform](./aces-transform)はACES Version、IDT、ODTを使うACES専用transformです。

### Resolve Color Management系

[Color Space Transform](./color-space-transform)はInput / Output Color Space + Gammaに加えTone / Gamut Mappingを扱います。

[Chromatic Adaptation](./chromatic-adaptation)はilluminant / white point間の変換を担当します。

### Gamut / Gamma

- [Gamut](./gamut) — Source / Output SpaceとGamma add/remove
- [Gamut Mapping](./gamut-mapping) — dynamic range / saturationをroll-offしてtargetへ収める
- [Gamut Limiter](./gamut-limiter) — delivery境界をhard clip
- [Color Space](./color-space) — RGBとYUV / HLS等のalternate representationを往復

### OpenColorIO

- [OCIO CDL Transform](./ocio-cdl-transform) — CDL grade
- [OCIO Color Space](./ocio-colorspace) — configに基づくspace変換
- [OCIO Display](./ocio-display) — Display / View transform
- [OCIO File Transform](./ocio-filetransform) — LUT / file transform

## Lens色収差

[Chromatic Aberration Removal](./chromatic-aberration-removal)はRGB fringeをchannel pairごとに手動補正します。

## Canvas / DoD

[Set Canvas Color](./set-canvas-color)はImageのDoD外へどのColor / Alphaを持たせるかを設定します。

## AlphaがあるImage

premultiplied Alpha素材のColor補正では、対応NodeのPre-Divide / Post-Multiplyを確認します。

詳しくは[プリマルチプライ（Premultiplication）](../../learn/04-compositing/premultiplication)を参照してください。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 93 pp.2133–2206とChapter 106 Swizzler pp.2445–2450を基に整理しています。
