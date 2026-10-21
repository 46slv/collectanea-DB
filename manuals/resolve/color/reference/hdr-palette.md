---
title: HDRパレット（HDR Wheels／Zones）
description: ColorページのHDRパレットでGlobal補正と明暗ゾーンを分け、露出・色・彩度を調整する考え方と具体的な操作。
doc_type: reference
verification: partial
product_scope: color
suite_surfaces: [color]
controls: [Global, Exposure, Color Balance, Saturation, Black Offset, Range, Falloff]
tasks: [primary-correction, hdr-grading, tone-control, shot-matching]
level: intermediate
updated: "2026-10-22"
---

# HDRパレット（HDR Wheels／Zones）

HDRパレットは、画像全体に作用するGlobal補正と、明るさに応じた複数の「ゾーン」を組み合わせて、色と露出を調整するColorページの一次補正ツールです。暗部・明部を大きく分けるだけでなく、黒に近い部分や非常に明るい反射光まで分けて調整できます。

**HDRという名称でも、HDR納品専用ではありません。** SDR映像の基本補正にも使えます。DaVinci Resolve 21.1 Reference Manualでは、HDRパレットが知覚的に均一な処理色空間を用い、特にコントラスト変更時に彩度を知覚的に保ちやすい設計であると説明されています。ただし、色域・トーンマッピング・表示条件に関係なく「彩度の数値が一切変わらない」という意味ではありません。

## Primaries・Log Wheelsとの使い分け

[Primariesのカラーホイール](./primaries-color-wheels)はLift／Gamma／Gain／Offsetを中心に補正します。Log Wheelsも明暗範囲を分けて色を調整できる別の一次補正モードです。一方、HDRパレットには次の特徴があります。

| 項目 | Primaries／Log Wheels | HDRパレット |
| --- | --- | --- |
| 明暗の分け方 | 比較的少数の領域に影響するホイールを使う | 既定の6ゾーンを重ね、Range／Falloffで影響範囲を調整する |
| 露出とコントラスト | 各モード固有のマスター調整 | Global Exposureとゾーン別Exposureを使い分ける。Black Offsetが最暗部の基準になる |
| 色の扱い | 選んだモードと処理段階に依存する | カラー管理と連携し、知覚的な色の扱いを意図した独自の演算を使う |
| 向く場面 | 素早い全体補正や慣れたワークフロー | 明部と暗部の階調・色を細かく分けて管理したい場合 |

どちらかを常に先に使う決まりはありません。公式マニュアルも、HDRパレットから一次補正を始める方法を有効な選択肢として扱っています。同じ画像を調整しても、各モードのマスター操作が同じ数式で動くとは限りません。

## ControlsとZonesという2つのパネル

HDRパレットには、色・露出を実際に動かす**Controls**と、各ゾーンが扱う明暗範囲を定義する**Zones**があります。

- ControlsではGlobalおよびゾーン別のColor Balance、Exposure、Saturationなどを操作します。
- Zonesではヒストグラムとゾーン境界、補正カーブを見ながらRangeとFalloffを調整します。
- パレット上部の切り替え操作でそれぞれを表示でき、Side-by-side表示では両パネルを並べられます。
- 6つの既定ゾーンすべてがControlsに同時表示されるとは限りません。表示されていないゾーンでも、補正自体は働いている場合があります。

## Global：画像全体の出発点

| 操作 | 変化と判断例 |
| --- | --- |
| Global Color Balance | 全体の色の偏りを調整。画面全体が暖色／寒色へ寄っているときの出発点になる |
| Global Exposure | Black Offsetを基準にした露出・コントラストの伸縮。**PrimariesのOffsetと同じ操作ではない** |
| Global Saturation | 全体の彩度を調整。ExposureやContrastと分けて判断する |
| Contrast／Pivot | 明暗差と、コントラストを拡大・圧縮する中心を調整する |
| Black Offset | 最暗部付近の基準を調整。画面全体を一律に持ち上げるOffsetとは異なる |

例えば黒が沈み過ぎたショットで、**最暗部だけを持ち上げたい**ならBlack Offsetを少量調整し、Waveformで底部がどう変わるか観察します。全体の露出感を変える場合はGlobal Exposureを試します。Black Offsetを変えるとGlobal Exposureの基準も変わるため、両者の組み合わせで判断します。

Global下部のTemp／Tint／Hue／Midtone Detailも全体補正に使用できます。個別設定の正確な操作域は21.1マニュアルで確認できますが、ここでは万能な初期値・固定値を指定しません。

## 6つの既定ゾーン

既定プリセットは、暗い側のBlack／Dark／Shadowと、明るい側のLight／Highlight／Specularから構成されます。ゾーンは硬く分離した帯ではなく、**重なりながら補正が混ざる**仕組みです。

| ゾーン | 主に扱う範囲 | 使い方の例 |
| --- | --- | --- |
| Black | 最も暗い部分 | 黒に近い部分の色と階調を微調整する |
| Dark | 深い暗部 | 暗い背景の色かぶりを補正する |
| Shadow | 広めの暗部 | 人物の影側や暗い室内の露出を調整する |
| Light | 広めの明部 | 窓際や明るい壁の階調を調整する |
| Highlight | より明るい部分 | 明るい空や照明付近を整える |
| Specular | 最も明るい反射光など | 金属反射や強い光源付近を最後に調整する |

ShadowとLightが広い範囲に作用し、Dark／BlackおよびHighlight／Specularがより限られた範囲を補います。実際の対象は画像の階調分布と各ゾーン境界によって変わるため、名称だけで対象物を決めません。

### ゾーン別の操作

各ゾーンにはColor Balance、Exposure、Saturationがあります。ExposureはRange境界を起点として、暗い側または明るい側へコントラストを伸縮します。Rangeは作用が始まる明るさの境界、Falloffは隣のゾーンとの重なり方を調整します。

同じ「明部を明るくする」でも、Lightなら明部を広く、Highlightならさらに明るい部分を重点的に、Specularなら非常に明るい部分を細かく調整します。ただし、画像内にSpecularの対象となる明るさの信号がなければ、動かしても目立った変化は出ません。

## 実践例：窓のある室内ショット

室内の人物はほぼ適正に見える一方、窓際の明るさが単調で、暗い背景には少し青い色かぶりがあるショットを想定します。これは**操作を理解するための例**であり、すべての素材へ同じ値を入れる処方ではありません。

1. [最初のグレーディング](../learn/first-grade)を参考に入力色空間、カラー管理、出力条件を確認し、[Waveform／Parade](./scopes)とViewerを表示します。
2. Global Exposureを少量動かし、人物と窓の相対的な明るさを確認します。黒の基準が問題ならBlack Offsetとの関係も確かめます。
3. 窓の明るい階調を区別したい場合は、LightのExposureを少量調整し、さらに明るい部分だけを変えたいときにHighlightを試します。
4. Specularで変化が見えなければ、Zonesで境界がヒストグラムと重なっているかを確認します。**効かないままExposureを大きく増やさず**、必要ならRangeを移動します。
5. 暗い背景の青味を整える場合はShadowのColor Balanceを少し動かし、必要に応じてDarkで深い暗部を補います。人物の色が意図せず変化したらRangeとFalloffを見直します。
6. 補正の有効／無効を切り替え、人物の階調、窓、暗部の色を確認します。隣接するショットとも比較します。

目的は、**広いゾーンで大きな方向を決め、狭いゾーンで必要な範囲だけ補う**ことです。Black／Dark／Shadowを必ず全部使う必要はありません。

## Range／Falloffを調整するとき

Zonesパネルには、入力画像の明暗分布を示すヒストグラムと、ゾーン境界が表示されます。公式マニュアルでは、境界が画像の階調分布から外れると、そのゾーンの補正が効かないことを説明しています。

- **Range**：ゾーンの補正が始まる明るさの境界。暗い側／明るい側のどちらへ作用するかによって、最大または最小境界として使われます。
- **Falloff**：隣のゾーンへのなめらかな遷移。境界付近の急な明暗・色変化を抑えるために使います。
- **影響範囲の確認**：21.1マニュアルではRangeアイコンのクリックで、対象部分を色付き、それ以外を黒としてViewerに一時的に表示する操作が紹介されています。

効果が弱い場合は、補正量を増やす前にゾーン境界を確認します。範囲を狭め過ぎて階調のつながりが不自然になっていないか、グラデーションや壁面で確かめます。

## カラー管理との関係

HDRパレットはResolve Color Management（RCM）またはACESと組み合わせると、ソースのInput Color Spaceと作業用Timeline Color Spaceの対応情報を利用し、色空間を意識した補正を行います。公式マニュアルは、異なるカメラ素材でも操作感を近づけ、グレードを他素材へ転用しやすくする仕組みとして説明しています。

**カラー管理を使わない場合は設定を確認します。** HDRパレットのOptionメニューにはColor Space／Gammaの指定があり、既定はTimelineです。素材の色空間と作業条件を把握せず、推測で設定しません。

HDRパレットの使用と、ノードをHDRモードにすることも別の操作です。公式マニュアルによれば、RCM／ACES環境でHDRパレットを使うためだけにノードHDRモードを有効化する必要はありません。

## よくある誤解

- **HDR映像だけに使う**：SDR素材にも使用できます。
- **Global ExposureはOffsetと同じ**：Black Offsetを基準にした伸縮で、同じではありません。
- **Specularが効かないのは故障**：境界が対象画像のヒストグラム外にある可能性があります。
- **コントラストを動かしても彩度の数値は必ず不変**：知覚的な維持を意図した処理であり、実際の数値変化が皆無という意味ではありません。
- **表示されないゾーンは無効**：表示／非表示と、ゾーンの有効／無効は異なります。

## 次に読む

- [Primaries（カラーホイール）](./primaries-color-wheels)
- [Scopes（Waveform／RGB Parade／Vectorscope）](./scopes)
- [ColorページのNode Graph](../learn/color-node-graph)

## 出典・対象版・検証範囲

- **対象**：DaVinci Resolve 21.1。Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』Color / Chapter 132「HDR Palette」p.3160–3182。主要参照：p.3161–3164（全体とパネル）、p.3166–3170（GlobalとBlack Offset）、p.3171–3179（ZonesとExposure）、p.3180–3181（Zonesの編集）。
- **公式機能紹介**：[Blackmagic Design – DaVinci Resolve Color](https://www.blackmagicdesign.com/jp/products/davinciresolve/color)「HDRカラーホイール」「次世代のHDRグレーディング」。マニュアル入手元：[Blackmagic Design Support](https://www.blackmagicdesign.com/support/)。
- **確認済み**：21.1マニュアルの記述に基づく機能区分、操作の考え方、記載したControl名と関係。
- **未確認**：21.1実機でのボタン位置・ショートカット・エディション別の使用感・素材別の出力結果。実機キャプチャや数値プリセットは含めません。公式マニュアルにはHDRパレットが無料版でも使用可能との記載がありますが、当該環境での動作確認はしていません。