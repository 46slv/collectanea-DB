---
title: dColorCorrector
description: "Deep Imageの奥行きサンプルを保持したまま色補正するNode。入出力、4つの補正方式、具体的なDeep合成例を解説。"
doc_type: node
term_id: dcolorcorrector
term_short: Deep Imageに含まれる複数の奥行きサンプルを保ち、明るさの範囲や色成分ごとに色補正するNode。
verification: partial
aliases: [dColorCorrector, dCC]
concepts: [deep-image, color-adjustment, mask-data]
nodes: [dColorCorrector]
node_family: deep
controls: [Correction, Range, Channel, Color Wheel, Tint Mode, Hue, Saturation, Contrast, Gain, Lift, Gamma, Brightness, Levels, Histogram, Suppress, Ranges, Histogram Proxy Scale, Process Order, Apply Mask Inverted, Clipping Mode]
inputs: [deep-image, mask]
outputs: [deep-image]
tasks: [deep, color-correct, histogram]
level: advanced
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-16"
---

# dColorCorrector

**dColorCorrector [dCC]は、Deep Imageの奥行きサンプルを保ったまま色や明るさを調整するNodeです。** たとえば建物と煙を別々のDeep EXRとして用意したとき、煙の色を整えてから、奥行きの情報を失わず[dMerge](./d-merge.md)へ渡せます。

一般的な2D画像は1画素に基本的に1組の色とAlphaを持ちます。一方、<Term id="deep-image">Deep Image</Term>は同じ画素にある手前・奥の複数のサンプルを記録できます。dColorCorrectorは、**Deep Imageを1枚の2D画像にまとめる前**に色補正するためのNodeです。通常の[Color Corrector](../color/color-corrector.md)とは扱うデータの種類が違います。

## 入力と出力

| 接続 | データ | 何をするか |
| --- | --- | --- |
| **Input（黄色、必須）** | Deep Image | 色を補正する元データ。Deep EXRを読み込んだLoader / MediaInなどを接続します。 |
| **Effect Mask（青色、任意）** | <Term id="mask">Mask</Term> | 画面内のどこに色補正を適用するか限定します。Polyline、基本形状、Paint、BitmapからのMaskなどを使えます。 |
| **出力** | Deep Image | 色補正後も奥行きサンプルを持つ画像として後段へ渡します。 |

**Effect Maskは画面内の位置を限定します。** 後述のShadows / Midtones / Highlightsは**明るさの範囲**を選びます。どちらもサンプルの奥行き（Z値）を直接選ぶ機能ではありません。

~~~text
煙のDeep EXR → dColorCorrector ─┐
                  ↑             ├→ dMerge → Deep to Image → 通常の2D画像
             Effect Mask（任意） │
建物のDeep EXR ─────────────────┘
~~~

[Deep to Image](./deep-to-image.md)は複数の奥行きサンプルを1枚の2D画像にまとめるNodeです。dColorCorrectorの直後で変換する必要はなく、dMergeなどのDeep処理を続けられます。

## Correction：補正方法を切り替える

Correctionタブには**Colors / Levels / Histogram / Suppress**の4方式があり、メニューで切り替えます。これは4個の別Nodeではなく、dColorCorrector内の4種類の調整画面です。

### Range：暗部・中間調・明部・全体

Colors・Levels・Suppressでは、Rangeで補正対象の明るさを選びます。

| Range | 対象 |
| --- | --- |
| **Shadows** | 暗い部分 |
| **Midtones** | 中間の明るさ |
| **Highlights** | 明るい部分 |
| **Master** | 画像全体。Shadowsなどの補正が終わった後に適用されます。 |

各Rangeの数値は独立しています。ShadowsのGammaを変えても、HighlightsのGamma値は変わりません。**Shadowsは「Z値が大きい、奥のサンプル」という意味ではありません。** 遠くの明るい物体はHighlights側に含まれ得ます。

### Colors：色相・彩度・明るさ

| Inspector項目 | 役割 |
| --- | --- |
| **Color Wheel** | 選択したRangeの色味・彩度・色かぶりを視覚的に変えます。 |
| **Tint Mode** | 色相と彩度を調整する処理の速度・品質を選びます。Manualにある既定値は**Better**です。 |
| **Hue** | 色相を回転させます。Manualの例では0.25が90度に相当します。 |
| **Saturation** | 色の強さ。0で無彩色、1.0で入力時の彩度を維持します。 |
| **Channel** | Masterまたは個別色チャンネルを選んで、その設定を表示・調整します。ほかのチャンネルの設定は残ります。 |
| **Contrast** | 暗部と明部の差を広げる・狭める調整です。 |
| **Gain** | 色の数値へ倍率を掛けます。暗い値より中間・明るい値で影響が大きくなります。 |
| **Lift** | 主に暗部へ強く影響する調整です。 |
| **Gamma** | 黒点・白点を保ちながら中間の明るさを非線形に変えます。 |
| **Brightness** | 色の数値へ一定量を加減します。 |

最初は**Master / Colors**を選び、1項目だけ動かすと全体への影響を確認しやすくなります。暗い煙を青くしたい場合はShadowsに切り替えてColor Wheelを青方向へ動かします。Color Wheelの操作点はRangeごとにあり、直接動かせるのは選択中のRangeです。

### Levels：黒点・白点・中間調

Levelsは入力の黒点・白点とGamma、出力レベルを調整する方法です。Histogram（画像の明るさがどこに分布するかを示すグラフ）を見ながら調整できます。

**入力側のLow / High**は値の分布を移動・拡張します。一方、**Output LevelのLow / High**は出力の範囲を圧縮します。例えばOutput LevelのHighを下げると、もとの白が灰色に近づきます。入力の白点を動かすこととは結果が異なります。

### Histogram：分布の均等化・参照比較

Histogramモードは**Equalize / Match**を使い、明るさの分布を均等化したり、参照画像の分布に近づけたりするための画面です。Input / Reference / Output HistogramやCorrective Curveの表示を切り替えられます。

ここには仕様上の注意があります。21.1 ManualのdColorCorrectorの**Inputs節に明記されている端子はInputとEffect Maskの2つ**ですが、Histogramの説明には「参照画像が与えられた場合」と書かれています。**参照画像の具体的な接続方法や専用端子は、この節だけでは確定できません。** 通常の2D Color CorrectorのMatch Reference端子をそのまま流用して案内しないでください。

### Suppress：特定の色を減らす

Suppressには6つの色方向の操作点を持つWheelがあります。抑えたい色の点を**中心へ近づけるほど、その色成分を減らします**。Saturationを全体に下げるのとは異なり、特定の色かぶりを抑えたいときに使います。

**Suppression Angle**はWheelの操作点の方向を回転させる項目です。

## Ranges：補正する明暗の境界を決める

Rangesタブは、どこまでをShadowsとし、どこからをHighlightsとするかをSplineで調整する画面です。Midtonesはその間として計算され、独立した境界ハンドルはありません。

- **Range**をShadowsなどへ切り替えると、該当部分をViewerに白黒で表示できます。白は範囲内、黒は範囲外、灰色は部分的に含まれる状態です。
- **Channel**ではチャンネルごとの範囲を確認できます。既定ではLuminanceを表示します。
- **4つのSpline点とBézierハンドル**で、暗部・明部の境界と移り変わりを調整できます。**Preset Simple / Smooth Ranges**で直線的・滑らかな設定に戻せます。
- **Output the Range You See Now as Final Render**をオンにすると、表示中の白黒範囲を最終出力へ使用できます。Manualは別NodeのEffect Maskに利用する例を挙げています。

**Viewerで白黒のRange表示にしただけでは、通常の色補正結果が白黒で出力されるとは限りません。** 出力に範囲表示を反映したい場合は、上のオプションを確認します。

RangesのSplineは**Z値の境界ではありません**。奥行きの条件でサンプルを分けるなら[dCrop](./dcrop.md)を使います。

## OptionsとSettings

| 項目 | 役割・注意点 |
| --- | --- |
| **Histogram Proxy Scale** | Histogram計算の精度。**値が低いほど高精度**で、高いほど粗い分布になります。 |
| **Process Order** | GammaとLevelsのどちらを先に処理するか選びます。処理順で結果が変わり得ます。 |
| **Apply Mask Inverted** | Maskを組み合わせた結果全体を反転します。 |
| **Clipping Mode（Settings）** | Domain of Definition（処理対象となる画像領域）の境界をFrame / Domain / Noneから選びます。画面の端で処理が切れる場合に確認します。 |

Optionsには乗算済みAlphaの色補正に関する導入文もありますが、**dColorCorrector専用のPre-Divide / Post-MultiplyというInspector項目は、この節だけでは確認できません**。半透明のDeep素材は、元のAlphaの扱いと最後の合成結果を確認してください。

## 具体例：煙の暗い部分を青くして、建物と合成する

建物と煙を別々のDeep EXRとして用意し、両方の画面サイズ・カメラ・Z値の基準が揃っている例です。

1. LoaderまたはMediaInから**煙のDeep EXR**をdColorCorrectorのInputへつなぎます。
2. Correctionを**Colors**、Rangeを**Shadows**にし、Color Wheelを青寄りへ少し動かします。暗い部分への影響を確認します。
3. **Highlights**で明るい部分の色を調整し、必要なら最後に**Master**で彩度やGainを整えます。
4. 画面の一部だけに適用したい場合は、青い**Effect Mask**へMaskを接続し、Maskの有無で違いを確認します。
5. dColorCorrectorの出力を[dMerge](./d-merge.md)のForegroundへ、建物のDeep EXRをBackgroundへ接続します。[Deep to Image](./deep-to-image.md)で2D化し、結果を確認します。
6. **Deep合成はLinear colorspaceで行い**、表示・納品用の色変換は必要に応じて後段で行います。

~~~text
煙のDeep EXR → dColorCorrector ─┐
                                 ├→ dMerge → Deep to Image → 2D Image
建物のDeep EXR ──────────────────┘
~~~

Shadowsを選んでも、**手前の煙だけ**が自動で選ばれるわけではありません。Zで分けたい場合は[dCrop](./dcrop.md)で奥行き範囲の内側と外側を分離し、必要な側にdColorCorrectorを挟んだうえでdMergeへ戻す構成を検討します。

この例はManualで確認した各Nodeの機能を組み合わせた**運用例**であり、実際の21.1でレンダリングして得た検証結果ではありません。

## 似たNode・期待どおりにならないとき

| Node | 選ぶ場面 |
| --- | --- |
| **dColorCorrector** | Deepサンプルを残したまま色・明るさを調整したい。 |
| [Color Corrector](../color/color-corrector.md) | Deep to Image後の2D画像を補正したい。 |
| [dCrop](./dcrop.md) | 明るさではなくZ値の範囲でサンプルを選びたい。 |
| [dRecolor](./drecolor.md) | 別の2D画像の色を使ってDeepサンプルの色を変えたい。 |
| [Deep to Image](./deep-to-image.md) | Deepを2Dへ変換して通常のMergeやBlurへ渡したい。 |

- **補正が変わらない**：InputのDeepデータ、Effect Mask、選択中のRangeとChannelを確認します。
- **Viewerが白黒になった**：Rangesの範囲表示と、**Output the Range You See Now as Final Render**のオン・オフを分けて確認します。
- **奥にある物体だけ変えたい**：Shadows / Highlightsは奥行きではなく明るさです。dCropでZ範囲を分けます。
- **参照画像の接続先が分からない**：21.1 Manualは専用端子を明示していません。2D用Color Correctorの入力構造を流用しないでください。
- **Nodeが見つからない**：21.1 Manualでは**Deep Image Compositing ToolsetはStudio Version Only**です。

関連：[Deep Imageの基本](../../learn/02-data/deep-image.md) / [Maskの基本](../../learn/02-data/mask.md) / [Deep / Auxiliary Channel一覧](./index.md)。

## バージョン・出典・未検証事項

一次資料：Blackmagic Design『**DaVinci Resolve 21.1 Reference Manual**』（2026年9月）、Chapter 95「Deep Image Nodes」。

- **pp.2227–2228**：Studio限定、Linear colorspace要件、dColorCorrectorの入力2つと用途。
- **pp.2229–2234**：Correctionの4方式、Range・Channel・Color Wheel、Colors / Levels / Histogram / Suppress。
- **p.2235**：RangesのSpline、範囲表示、Simple / Smooth、白黒範囲の出力。
- **p.2236**：Histogram Proxy Scale、Process Order、Apply Mask Inverted、Clipping Mode。

**未確認**：21.1実機でのREGID、参照Histogramの接続経路、全Inspector初期値・数値範囲、半透明DeepサンプルのAlpha演算、個々の素材での描画結果。未検証値を推測で補わず、`verification: partial`を維持しています。
