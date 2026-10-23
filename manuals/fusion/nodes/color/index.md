---
title: Colorノード
description: 明るさ・contrast・色味・white balance・curve・channel・ACES / RCM / OCIOなど、2D ImageのColor処理を目的から選ぶ入口。
doc_type: index
verification: partial
product_scope: fusion
tasks: [lookup-node, color-correct, white-balance, color-space]
updated: "2026-10-24"
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

### 実機の参考例

<!-- capture-reuse:R28 -->

ColorCorrectorのInspectorと、左の入力チャート・右の補正後の比較です。基本色補正を画像の処理として読む参考例です。

[![S14の実機撮影例。Inspectorの設定値](/img/fusion/captures/S14/inspector.png)](/img/fusion/captures/S14/inspector.png)

[![S14の実機撮影例。左右Viewerの比較](/img/fusion/captures/S14/compare.png)](/img/fusion/captures/S14/compare.png)

Resolve Studio 21.1.0.14／Windowsで撮影済みのS14を再利用した参考例です。色管理の変換、Channel操作や全Controlの検証は含めていません。 [元の撮影条件と確認範囲](/img/fusion/captures/S14/capture.json)

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

### 実機の参考例：Canvas colorの指定

<!-- capture-reuse:R91 -->

S52ではTransformの後でSet Canvas Colorを使い、DoD外を紺色・Alpha1へ変えました。チャート内部の色補正とは分けて確認できます。

[![LoaderのチャートをTransformで0.5倍にしてSetCanvasColor1へ接続。上段は後で参照するGold1とGoldCanvas1で、緑入力は未接続](/img/fusion/captures/S52/graph.png)](/img/fusion/captures/S52/graph.png)

[![Set Canvas ColorのRGBを0.03、0.12、0.3、Alphaを1にした実機Inspector](/img/fusion/captures/S52/inspector.png)](/img/fusion/captures/S52/inspector.png)

[![左の縮小チャート周辺は透明、右は紺色で埋まる。チャートの内容と1920×1080の寸法は保たれる](/img/fusion/captures/S52/compare.png)](/img/fusion/captures/S52/compare.png)

Resolve Studio21.1.0.14／Windows、両Viewer Color／40%。固定チャートの手入力例。後段合成や書き出しの色は未確認。 [再現用Graph](/img/fusion/captures/S52/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S52/capture.json)

## AlphaがあるImage

premultiplied Alpha素材のColor補正では、対応NodeのPre-Divide / Post-Multiplyを確認します。

詳しくは[プリマルチプライ（Premultiplication）](../../learn/04-compositing/premultiplication)を参照してください。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 93 pp.2133–2206とChapter 106 Swizzler pp.2445–2450を基に整理しています。
