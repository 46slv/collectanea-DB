---
title: "Day Sky"
description: "指定した場所・日時の昼光分布をHDR画像として生成するFusion Node。空や雲の完成画像を描くGeneratorとは異なる。"
doc_type: node
term_id: "day-sky"
term_short: "Day Skyは、場所・日時・大気の状態から昼光の分布をHDR画像として生成する2D Generator。"
verification: partial
aliases: ["Day Sky", "DS"]
concepts: ["image-data", "effect-mask"]
nodes: ["Day Sky"]
node_family: "generators"
controls: ["Latitude", "Longitude", "Day", "Month", "Time", "Turbidity", "Do Tone Mapping", "Exposure", "Horizon Brightness", "Luminance Gradient", "Circumsolar Region Intensity", "Circumsolar Region Width", "Backscattered Light"]
inputs: ["mask"]
outputs: ["image"]
tasks: ["generate-image"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-14"
---

# Day Sky

**Day Sky [DS]は、地球上の場所と日時を指定して、昼光の明るさ・色の分布を高ダイナミックレンジ（HDR）の2D Imageとして作るGenerator**です。緯度・経度、月日、時刻、大気の濁りをもとに光の状態をシミュレーションします。

名前にSkyとありますが、**DaVinci Resolve 21.1 Reference Manualは「空そのものを生成するNodeではない」と明記**しています。雲の形や風景を描く機能はなく、雲のある空を作るには[Fast Noise](./fast-noise)などの別のGeneratorで模様を作って合成します。

## 入力と出力

| 接続 | データ | 役割 |
| --- | --- | --- |
| **Effect Mask**（青、任意） | Mask | Day Skyの生成結果が現れる範囲を制限する。 |
| **出力** | 2D Image（HDR） | 生成した昼光のマップを後段へ渡す。 |

通常のImage入力はありません。Day Sky自体が画像を生成するため、Graphの先頭に配置できます。21.1 Manualに記載されている入力は**任意のEffect Maskが1つ**です。Polygon、Ellipse、画像から作ったMaskなどで生成範囲を限定できます。

たとえば背景として使うなら、出力を[Merge](../compositing/merge)のBackgroundへ接続します。Text+で作った文字画像をForegroundへ接続すれば、日照の分布を持つ背景にタイトルを合成できます。撮影した映像をDay Skyの入力に入れて加工する構成ではありません。

## Controls tab

| Inspector項目 | 作用 |
| --- | --- |
| **Latitude / Longitude** | 昼光の計算に使う緯度・経度を指定する。 |
| **Day / Month / Time** | 日・月・時刻を指定する。 |
| **Turbidity** | 大気による光の散乱・吸収の程度を変える。大きくすると、煙や大気の霞を思わせる濁った見え方へ近づく。 |
| **Do Tone Mapping** | 生成した広い輝度範囲を圧縮するTone Mappingの有効／無効を切り替える。 |
| **Exposure** | Tone Mapping時の露出を調整する。 |

まず場所と日時を決めてから、時刻を変えたときの光の変化をViewerで比較します。Turbidityは雲を増減させる項目ではなく、**大気中で光が散乱・吸収される状態**を変えます。

### HDRとTone Mappingの違い

Day Skyは32-bit floating-pointで計算し、Manualによると生成値は**1.0を大きく超える場合や0.0を下回る場合**があります。Do Tone Mappingを有効にすると、この広い範囲を露出に応じて圧縮し、ハイライトやシャドウの詳細をできるだけ保持しながら表示・合成に使いやすくします。

後段で浮動小数点のカラー処理を行い、そこで露出や出力変換を決める場合は、**Do Tone Mappingを無効**にして扱う方法があります。Manualもこの使い分けに言及しています。無効にした場合は後段でHDR値を意図せず切り捨てないよう、処理順序と最終出力を確認します。

## Advanced tab

| Inspector項目 | 作用 |
| --- | --- |
| **Horizon Brightness** | 空全体に対する地平線付近の明るさを変える。 |
| **Luminance Gradient** | 地平線から空へ移る輝度勾配の幅を変える。 |
| **Circumsolar Region Intensity** | 太陽の周囲にある領域の明るさを変える。 |
| **Circumsolar Region Width** | 太陽の周囲に影響が広がる範囲を変える。 |
| **Backscattered Light** | シミュレーション中の後方散乱光の量を調整する。 |

Circumsolarは「太陽の周囲」という意味です。Intensityはその範囲の光の強さ、Widthは影響範囲を調整します。単純に「太陽の直径」を変える項目ではありません。

共通のImage / Settings tabもありますが、各項目の既定値や数値範囲はここでは断定しません。

<!-- capture:S155 -->

## 実機例：時刻とEffect Maskを比較する

`DaySky1` をMergeのBackground、白い文字をForegroundへ接続します。緯度41.38、経度2.15、January 1、Tone Mapping有効の状態で、frame 0のTimeを `12.0 → 9.0` に変え、光の分布を比較しました。時刻はNodeに入力した値であり、実際の地域や観測時刻との一致を検証したものではありません。

Timeを12.0へ戻し、別の `SkyMasked` にEllipseをEffect Maskとして接続します。Scriptを除いて取得した数値・Point・Text・FuIDの入力102項目は一致しましたが、円内の色分布は左の対応位置と異なって見えました。原因と画像値の同一性は未検証です。右ViewerのAlphaを確認し、撮影後にColorへ戻しています。[接続と設定の記録](/img/fusion/captures/S155/readback.json)に値を記録しています。

WindowsのResolve Studio 21.1.0.14での静止frame表示です。画面画像からHDR値や光の物理的な正確さは測定していません。

[![Day Skyに文字を合成する枝とEllipseで別のDay Skyを制限する枝](/img/fusion/captures/S155/graph.png)](/img/fusion/captures/S155/graph.png)

上はDay Skyと文字の合成、下は別のDay SkyへEllipseをEffect Maskとして渡す比較枝です。

[![Day Skyの位置と日時、Time 12を示すInspector](/img/fusion/captures/S155/time12-controls.png)](/img/fusion/captures/S155/time12-controls.png)

緯度41.38、経度2.15、January 1、Time 12.0。Tone Mappingは有効です。

[![Time 12のDay Skyと文字を重ねた表示](/img/fusion/captures/S155/time12.png)](/img/fusion/captures/S155/time12.png)

Time 12.0。左はDay Sky、右は文字を重ねたMediaOutです。

[![Day SkyのTimeを9に変更したInspector](/img/fusion/captures/S155/time9-controls.png)](/img/fusion/captures/S155/time9-controls.png)

場所・日付などを固定し、Timeを9.0に変更します。

[![Time 9で光の分布が変わったDay Skyと文字合成](/img/fusion/captures/S155/time9.png)](/img/fusion/captures/S155/time9.png)

同じframeのTime 9.0では、明るい領域の配置と色が変わりました。

[![マスクなしとEllipseを接続した別のDay Skyの比較](/img/fusion/captures/S155/effect-mask.png)](/img/fusion/captures/S155/effect-mask.png)

左はマスクなし、右は同じ主な設定でEllipseを接続した別のDay Skyです。円内の光の分布も異なって見え、原因は未検証です。

[![ViewerのチャンネルメニューでAlphaが選択されている](/img/fusion/captures/S155/alpha-menu.png)](/img/fusion/captures/S155/alpha-menu.png)

右ViewerのチャンネルメニューでAlphaが選択されていることを確認しました。

[![左にマスクなしのColor表示、右にEllipse付き出力のAlpha表示](/img/fusion/captures/S155/mask-alpha.png)](/img/fusion/captures/S155/mask-alpha.png)

左はマスクなしのColor、右はEllipse付き出力のAlpha表示です。黒は透明、白は不透明を表します。

[再現用Graph](/img/fusion/captures/S155/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S155/capture.json)

<!-- /capture:S155 -->

## 制作例

### 時刻に応じた光の背景とタイトル

1. Day SkyでLatitude / Longitude、Day / Month / Timeを設定します。
2. Timeを朝・昼・夕方で変え、光の分布を比較します。
3. TurbidityとHorizon Brightnessで大気と地平線付近の見え方を調整します。
4. Day SkyをMergeのBackground、Text+の文字をForegroundに接続します。
5. 文字の読みにくい明るさになった場合は、Do Tone MappingとExposure、文字の配色を調整します。

この出力は日照のマップなので、雲・建物・地形などの形は別に作ります。

### Fast Noiseで雲を足す

~~~text
Day Sky ──────────────────────────→ Merge（Background）→ Output
Fast Noise → 模様をMaskへ加工 ────→ Background（Effect Mask）
雲色を設定したBackground ───────→ Merge（Foreground）
~~~

Fast Noiseの明暗を雲の領域を示すMaskとして使い、雲色の[Background](./background)に適用してからDay Skyに重ねます。Fast Noiseを不透明な画像のまま全面に重ねると、Day Skyの分布が覆われます。Maskの階調を残すと半透明の雲にもできます。

これはManualが示す「Noise等と組み合わせて空を作れる」という説明を展開した合成例であり、Day Skyが単独で雲を生成するという意味ではありません。

### HDR値を後段で仕上げる

Tone Mappingを無効にしたDay Skyをカラー調整へ送り、そこで露出と最終表示を決めます。生成段階でTone Mappingし、さらに後段でも同じ圧縮を重ねる構成とは使い分けます。高い輝度値を保持したい場合は、途中のNodeが意図せずクリップしていないかを確認します。

## 関連Nodeと選択基準

- [Background](./background)：指定した単色やGradientを作る。色の配置を直接決めたい場合に使う。
- **Day Sky**：地理的な場所・日時と大気条件に基づく昼光のHDR分布を作る。
- [Fast Noise](./fast-noise)：雲・霞などの不規則な模様やMaskの元を作る。
- [Merge](../compositing/merge)：Day Skyと文字・雲・その他の画像を合成する。
- [Mask](../../learn/02-data/mask)：Effect Maskの役割を確認する。
- [Generatorノード](./)：他のGeneratorとの使い分け。

## 出典・確認範囲

Blackmagic Design『**DaVinci Resolve 21.1 Reference Manual**』（September 2026）、**Chapter 103「Generator Nodes」、pp.2360–2363、Day Sky [DS]**。目的、Effect Mask、HDR、Controls / Advanced tabの項目を照合しています。Manualによれば、Preetham、Shirley、Smitsの論文 *A Practical Analytical Model for Daylight* の実用的な実装です。

WindowsのResolve Studio 21.1.0.14ではruntime REGID `DaySky`、Effect Mask入力、時刻を変えた静止表示とViewer Alphaを確認しました。全Controlのdefault値・数値range、HDR値の測定、edition差は未確認のため、**verification: partial**のままです。
