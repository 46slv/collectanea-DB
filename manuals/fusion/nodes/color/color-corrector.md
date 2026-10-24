---
title: Color Corrector
description: Shadows・Midtones・Highlights・Masterを分け、Colors・Levels・Histogram・Suppressとreference matchingを扱う総合的な2D Color Node。
doc_type: node
term_id: color-corrector
verification: partial
aliases: [Color Corrector, CC]
concepts: [image-data, color-adjustment, alpha, premultiplication]
nodes: [Color Corrector]
node_family: color
controls: [Range, Color Wheel, Tint Mode, Hue, Saturation, Contrast, Gain, Lift, Gamma, Brightness, Levels, Histogram, Suppress, Ranges, Pre-Divide/Post-Multiply, Histogram Proxy Scale, Process Order]
inputs: [image, mask, reference-image, match-mask]
outputs: [image]
tasks: [color-correct, shadows, midtones, highlights, histogram-match]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-23"
---

# Color Corrector

Color Correctorは、2D <Term id="image">Image</Term>の色とtoneを、Shadows / Midtones / Highlights / Masterへ分けて調整できる総合的なColor Nodeです。

単純なGainやGammaだけでなく、Levels、Histogram matching、Color Suppressionまで1 Node内で扱います。

## 役割

Image全体を一括で補正するだけでなく、どのtone rangeをどの色方向へ動かすかを分けて調整します。

```text
Image → Color Corrector → Output
             ↑
          Effect Mask

Reference Image ──→ Match Reference
Match Mask ───────→ Match Mask
```

## 入力

### Input

オレンジ色の必須入力です。Color補正する2D Imageを接続します。

### Effect Mask

青色の任意入力です。補正を適用する範囲を限定します。

### Match Reference

緑色の任意入力です。Histogram Matchで基準にしたい別Imageを接続します。

### Match Mask

白色の任意入力です。Histogram Matchでreferenceとして評価する範囲を限定します。

Effect Maskは「補正をどこへ適用するか」、Match Maskは「reference matchingでどこを比較するか」を担当します。

## 出力

Color補正後の2D Imageを出力します。

## Inspectorの構成

21.1 ManualではControlは大きく4つのtabに分かれます。

- **Correction**
- **Ranges**
- **Options**
- **Settings**

Correction tab内ではさらにColors / Levels / Histogram / Suppressを切り替えます。

## Correction: Colors

### Range

補正対象のtone rangeを選びます。

- Shadows
- Midtones
- Highlights
- Master

MasterはImage全体です。Shadows / Midtones / Highlightsで設定した補正の後にMaster補正が適用されます。

各RangeのControl値は独立しています。たとえばShadowsのGammaを変えてもHighlightsのGamma値は変わりません。

### Color Wheel

Hue・Saturation・Tintを視覚的に調整します。

選択中Rangeのcolor indicatorだけを直接動かせます。Master / Shadows / Midtones / Highlightsを切り替えながら、それぞれ別のcolor balanceを持たせられます。

### Hue / Saturation

Color Wheelと対応する数値Controlです。

Hueは色相を回転させ、Saturationは色の強さを変えます。Saturationを0にするとcolor componentがなくなります。

### Contrast / Gain / Lift / Gamma / Brightness

基本的なtone controlもRangeごとに持ちます。

- **Gain** — 高い値ほど強く変える乗算
- **Lift** — 暗部側への影響が大きい
- **Gamma** — black / whiteを保ちながらmidtonesを非線形に調整
- **Brightness** — pixel値へ一定値を加減
- **Contrast** — dark / lightの差を広げる・狭める

Brightness Contrastにも似たControlがありますが、Color CorrectorではRangeごとに独立して使える点が大きな違いです。

## Correction: Levels

black / white pointをremapし、Gammaでmidtonesを調整します。

Histogramを見ながらtone rangeを詰めたい場合に使います。RangeとChannelを切り替え、Masterまたは個別channel / tone rangeを対象にできます。

## Correction: Histogram

Histogram modeでは、入力ImageとReference Imageの分布を比較し、EqualizeやMatchを行います。

Matchはreference imageのhistogramへ近づける用途です。Referenceが動画でframeごとに変わる場合は補正も変化し得るため、21.1 Manualにはreference histogramをsnapshotして固定するControlもあります。

## Correction: Suppress

特定の色成分を減らします。

Suppression Wheelで対象色を選び、中心へ近づけるほどその色を抑えます。不要な色かぶりを抑える用途です。

## Ranges tab

Shadows / Midtones / Highlightsの範囲そのものをSplineで調整します。

Viewer上で各rangeを白黒表示し、どのpixelがそのrangeに含まれているか確認できます。

表示中rangeを最終outputとして出し、別NodeのMaskへ使うこともManualに記載されています。

## Options tab

### Pre-Divide / Post-Multiply

premultiplied Alphaを持つRGBA ImageをColor補正するとき、補正前にRGBをAlphaで割り、補正後に再度Alphaを掛けます。

CGやkeyed elementの半透明edgeを補正する場合に使います。

### Histogram Proxy Scale

Histogram計算の精度を調整します。Manualでは低い値ほど高精度、高い値ほど粗いHistogramになります。

### Process Order

Gamma補正をLevelsの前後どちらで行うかを選びます。

同じControl値でも処理順が変われば結果が変わるため、複雑な補正で挙動を確認するときの項目です。

## 最小構成

```text
MediaIn → Color Corrector → Output
```

最初はRange = Master、Correction = Colorsで、1つのControlだけを動かします。

次にShadows / Midtones / Highlightsへ分け、必要になった段階でLevelsやHistogramへ進むと、それぞれの役割を追いやすくなります。

## 運用例

CG elementのshadowを少し青くし、highlightを暖色へ寄せる場合:

1. Range = ShadowsでColor Wheelを青側へ少量動かします。
2. Range = Highlightsへ切り替え、暖色側へ少量動かします。
3. Masterで全体のGain / Gammaを整えます。
4. Alphaを持つ素材ならPre-Divide / Post-Multiplyを確認します。

Image全体へ同じ補正をかけるだけなら、[Brightness Contrast](./brightness-contrast)の方が構造を読みやすい場合があります。

## Brightness Contrastとの違い

- **Brightness Contrast** — Image全体へ基本tone Controlを直接適用
- **Color Corrector** — tone range分離、Color Wheel、Levels、Histogram Match、Suppressまで扱う

Color Correctorが常に上位互換という意味ではありません。単純な補正は単純なNodeの方がGraph上の責任を読みやすくできます。

## Deep用Color Correctorとの違い

dColorCorrectorはDeep Image domainのNodeです。

通常の2D Color Correctorと似たControlを持つ部分があっても、入力データ領域が異なるため同じNodeとして扱いません。

## 関連する考え方

- [プリマルチプライ（Premultiplication）](../../learn/04-compositing/premultiplication)
- [マスク（Mask）](../../learn/02-data/mask)
- [データ領域（data domain）を辿って診断する](../../learn/07-debugging/trace-data-domain)

## 似たNode・関連Node

- [Brightness Contrast](./brightness-contrast) — 基本tone調整
- [White Balance](./white-balance) — gray reference / color temperatureから補正
- [Color Curves](./color-curves) — curveでchannel値をremap
- dColorCorrector — Deep Image用

<!-- capture:S14 -->
## 実機で彩度とゲインでチャートがどう変わるかを見る

DaVinci Resolve Studio 21.1.0.14、Windows、日本語UI。1920×1080、フレーム0で撮影しました。画像を開くと原寸で確認できます。

[![Loader → Color Corrector → MediaOut](/img/fusion/captures/S14/graph.png)](/img/fusion/captures/S14/graph.png)

Color CorrectorのMasterを選び、Saturationを0.3、RGB Gainを1.15にしました。左は入力、右は補正後です。右の色面は彩度が下がり、明るいグレーは白に近づいています。InspectorにはColorsとRGBの階調Controlを表示しています。この比較は同じプロジェクト・同じViewer条件での見た目の確認です。測色、Histogram Match、全Rangeとメニューの出力は未確認です。

[![Color CorrectorのMaster、Saturation 0.3、RGB Gain 1.15](/img/fusion/captures/S14/inspector.png)](/img/fusion/captures/S14/inspector.png)

[![同じチャートの補正前と彩度低下・ゲイン増加後](/img/fusion/captures/S14/compare.png)](/img/fusion/captures/S14/compare.png)

Viewer倍率は40%です。市松模様は透明部分を示します。

[テストチャート](/img/fusion/captures/_fixtures/chart.png)をLoaderで読み込めます。GraphのLoaderは `Comp:/../_fixtures/chart.png` を参照します。

[再現用Graph](/img/fusion/captures/S14/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S14/capture.json)

## 実機例：Optionsの前後処理で透明部分を保つ

<!-- capture-reuse:R120 -->

柔らかい楕円前景にLevelsのMaster RGB出力下限0.2を指定しました。左はColor Corrector単体、右はAlpha Divide→Color Corrector→Alpha Multiplyです。左のOptionsでPre-Divide / Post-Multiplyをオンにすると、両方とも暗い背景を保つ同じ見た目になりました。

[![ColorDirectのOptionsで処理前に除算、処理後に乗算のチェックをオンにしたInspector](/img/fusion/captures/S74/builtin-options.png)](/img/fusion/captures/S74/builtin-options.png)

[![左のColor Corrector内蔵前後処理と、右の明示的なDivideとMultiply構成が同じ見た目になる](/img/fusion/captures/S74/builtin.png)](/img/fusion/captures/S74/builtin.png)

右のColor Correctorでは内蔵前後処理をオフにしています。数値exportによる完全一致や、全Correctionモードでの動作確認は行っていません。

Resolve Studio21.1.0.14／WindowsのFusionページで、1920×1080の合成を作りました。両ViewerはColor／40%。左のMergeNaiveは直接補正、右のMergeCorrectはAlpha Divide→補正→Alpha Multiplyの結果です。 この固定例の表示と保存Graphを確認しました。実写のキーイング素材、外部OFX、Effect Mask、Alphaが0に近い画素の数値、HDRと性能は未確認です。 詳しい[接続と比較条件](../matte-keying/alpha-divide)はAlpha Divideの実機例に記録しています。

[再現用Graph](/img/fusion/captures/S74/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S74/capture.json)

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 93、pp.2157–2167で、4入力、Correction / Ranges / Options / Settings、Colors / Levels / Histogram / Suppress、tone Range、Color Wheel、Hue / Saturation、主要tone controls、Histogram Match、Ranges、Pre-Divide / Post-Multiply、Histogram Proxy Scale、Process Orderを確認しました。

全Controlの初期値・数値範囲、Histogram Matchの内部アルゴリズム、実機性能、Edition差は未確認のため `verification: partial` としています。
