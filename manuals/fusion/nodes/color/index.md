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

### 実機の参考例：基本の明るさと彩度を調整する

<!-- capture-reuse:R101 -->

Brightness ContrastのGain、Contrast、Saturationを個別に変える固定例です。下はContrast0.3です。

[![LoaderからBrightnessContrast1とMediaOut1へ接続した実機Graph](/img/fusion/captures/S60/graph.png)](/img/fusion/captures/S60/graph.png)

[![Brightness ContrastのGain1、Contrast0.3、Saturation1、Low0、High1を示すInspector](/img/fusion/captures/S60/inspector.png)](/img/fusion/captures/S60/inspector.png)

[![左の元画像に対し、右ではContrast0.3で暗部と明部の差が強くなる](/img/fusion/captures/S60/compare.png)](/img/fusion/captures/S60/compare.png)

Resolve Studio21.1.0.14／Windows、両Viewer Color／40%。固定チャートでの表示確認です。全Control、Mask、Alpha、性能は未確認。 [再現用Graph](/img/fusion/captures/S60/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S60/capture.json)

### 実機の参考例：RGBの一つの成分だけを調整する

<!-- capture-reuse:R102 -->

Color GainのRGBロックをオフにし、赤のGain／Lift／Gammaを個別に比較しました。下は赤Gamma1.5です。

[![LoaderからColorGain1とMediaOut1へ接続した実機Graph](/img/fusion/captures/S61/graph.png)](/img/fusion/captures/S61/graph.png)

[![RGBロックオフで赤Gamma1.5、ほかのGain1、Lift0、Gamma1を示すInspector](/img/fusion/captures/S61/inspector.png)](/img/fusion/captures/S61/inspector.png)

[![赤Gamma1.5だけを変えた右のチャートで中間調が赤くなる比較](/img/fusion/captures/S61/compare.png)](/img/fusion/captures/S61/compare.png)

Resolve Studio21.1.0.14／Windows、両Viewer Color／40%。固定チャートでの表示確認です。全Control、Mask、Alpha、性能は未確認。 [再現用Graph](/img/fusion/captures/S61/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S61/capture.json)

### 実機の参考例：LowとHighで出力の値域を変える

<!-- capture-reuse:R111 -->

左は入力、右は処理結果です。 [接続・Inspector・比較条件](./auto-gain)は個別記事に掲載しています。

[![High0.5の右側では、入力に比べて白いパネルや色パッチが暗くなる](/img/fusion/captures/S70/compare.png)](/img/fusion/captures/S70/compare.png)

Resolve Studio21.1.0.14／Windows、Color／40%。個別記事に記載した範囲だけを確認しています。

### 実機の参考例：赤と青を入れ替える

<!-- capture-reuse:R112 -->

左は入力、右は処理結果です。 [接続・Inspector・比較条件](./color-matrix)は個別記事に掲載しています。

[![右の色パッチは赤と青が入れ替わり、白いパネルと灰色段階は灰色を保つ](/img/fusion/captures/S71/compare.png)](/img/fusion/captures/S71/compare.png)

Resolve Studio21.1.0.14／Windows、Color／40%。個別記事に記載した範囲だけを確認しています。

### 実機の参考例：YUVからRGBへ戻す

<!-- capture-reuse:R113 -->

左はYUVの中間表示、右はRGBへ戻した結果です。 [接続・Inspector・比較条件](./color-space)は個別記事に掲載しています。

[![左はYUV成分をColor表示した中間画像、右はRGBへ戻したチャート](/img/fusion/captures/S72/compare.png)](/img/fusion/captures/S72/compare.png)

Resolve Studio21.1.0.14／Windows、Color／40%。個別記事に記載した範囲だけを確認しています。

### 実機の参考例：参照と結果の色温度を分ける

<!-- capture-reuse:R114 -->

左は入力、右は処理結果です。 [接続・Inspector・比較条件](./white-balance)は個別記事に掲載しています。

[![参照3200と結果6500では、右の白いパネルと灰色段階が青寄りになる](/img/fusion/captures/S73/compare.png)](/img/fusion/captures/S73/compare.png)

Resolve Studio21.1.0.14／Windows、Color／40%。個別記事に記載した範囲だけを確認しています。

### チャンネル・ガンマ・Layerを扱う実機例

<!-- capture-reuse:R147 -->

[![RGBとAlphaを別入力から取り、後段のAlpha Multiplyを通した楕円の切り抜きの実機画面](/img/fusion/captures/S97/compare.png)](/img/fusion/captures/S97/compare.png)

[channel-booleanの接続・Inspector・比較条件](./channel-boolean)を参照してください。

<!-- capture-reuse:R148 -->

[![SourceをBT.709 sceneにしてRemove GammaをONにした比較の実機画面](/img/fusion/captures/S98/compare.png)](/img/fusion/captures/S98/compare.png)

[gamutの接続・Inspector・比較条件](./gamut)を参照してください。

<!-- capture-reuse:R149 -->

[![Swizzlerで2入力をGoldとChartのLayerへ分け、Goldを表示した比較の実機画面](/img/fusion/captures/S99/compare.png)](/img/fusion/captures/S99/compare.png)

[swizzlerの接続・Inspector・比較条件](./swizzler)を参照してください。

### Gamma・色順応・CDLを比べる実機例

<!-- capture-reuse:R153 -->

[![CSTで入力Gamma2.4から出力Linearへ変換した表示の実機比較](/img/fusion/captures/S103/compare.png)](/img/fusion/captures/S103/compare.png)

[ColorSpaceTransformのGraph・Inspector・条件と未確認範囲](./color-space-transform)を参照してください。

<!-- capture-reuse:R154 -->

[![CAT02でSource D65からTarget D50へ変えた表示の実機比較](/img/fusion/captures/S104/compare.png)](/img/fusion/captures/S104/compare.png)

[ChromaticAdaptationのGraph・Inspector・条件と未確認範囲](./chromatic-adaptation)を参照してください。

<!-- capture-reuse:R155 -->

[![OCIO CDL Controlsで赤Slopeだけを0.5にした表示の実機比較](/img/fusion/captures/S105/compare.png)](/img/fusion/captures/S105/compare.png)

[OCIOCDLTransformのGraph・Inspector・条件と未確認範囲](./ocio-cdl-transform)を参照してください。

### ACES・輪郭の色ずれ・曲線を比べる実機例

<!-- capture-reuse:R156 -->

[![ACES2.0のsRGB入力とRec709 BT1886出力の実機比較](/img/fusion/captures/S106/compare.png)](/img/fusion/captures/S106/compare.png)

[AcesTransformのGraph・Inspector・条件と未確認範囲](./aces-transform)を参照してください。

<!-- capture-reuse:R157 -->

[![色ずれのないチャートへ赤シアンScale0.8を加えた変化の実機比較](/img/fusion/captures/S107/compare.png)](/img/fusion/captures/S107/compare.png)

[ChromaticAberrationRemovalのGraph・Inspector・条件と未確認範囲](./chromatic-aberration-removal)を参照してください。

<!-- capture-reuse:R158 -->

[![RGBの中間点を持ち上げて明るくした表示の実機比較](/img/fusion/captures/S108/compare.png)](/img/fusion/captures/S108/compare.png)

[ColorCurvesのGraph・Inspector・条件と未確認範囲](./color-curves)を参照してください。

### 色相ごとの彩度・色域制限・ファイル変換の実機例

<!-- capture-reuse:R159 -->

[![Hue Curvesで緑付近の彩度を弱めた表示の実機比較](/img/fusion/captures/S109/compare.png)](/img/fusion/captures/S109/compare.png)

[HueCurvesのGraph・Inspector・条件と未確認範囲](./hue-curves)を参照してください。

<!-- capture-reuse:R160 -->

[![Rec2020の単色赤をRec709の色域で制限した表示の実機比較](/img/fusion/captures/S110/compare.png)](/img/fusion/captures/S110/compare.png)

[GamutLimiterのGraph・Inspector・条件と未確認範囲](./gamut-limiter)を参照してください。

<!-- capture-reuse:R161 -->

[![OCIO File Transformで実機CDLをForward適用した表示の実機比較](/img/fusion/captures/S111/compare.png)](/img/fusion/captures/S111/compare.png)

[OCIOFileTransformのGraph・Inspector・条件と未確認範囲](./ocio-filetransform)を参照してください。

### ConfigとTone Mappingを比べる実機例

<!-- capture-reuse:R162 -->

[![OCIO Color SpaceのGamma2.2からlinearへの表示の実機比較](/img/fusion/captures/S112/compare.png)](/img/fusion/captures/S112/compare.png)

[OCIOColorSpaceのGraph・Inspector・条件と未確認範囲](./ocio-colorspace)を参照してください。

<!-- capture-reuse:R163 -->

[![OCIO DisplayのSource linearとView sRGBの表示の実機比較](/img/fusion/captures/S113/compare.png)](/img/fusion/captures/S113/compare.png)

[OCIODisplayのGraph・Inspector・条件と未確認範囲](./ocio-display)を参照してください。

<!-- capture-reuse:R164 -->

[![float32入力へSimpleとCompressを適用した表示の実機比較](/img/fusion/captures/S114/compare.png)](/img/fusion/captures/S114/compare.png)

[GamutMappingのGraph・Inspector・条件と未確認範囲](./gamut-mapping)を参照してください。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 93 pp.2133–2206とChapter 106 Swizzler pp.2445–2450を基に整理しています。
