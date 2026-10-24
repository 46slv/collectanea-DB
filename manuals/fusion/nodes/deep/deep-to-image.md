---
title: Deep to Image
description: "複数の奥行きサンプルを持つDeep Imageを通常の2D画像へまとめるNode。入出力、Flip Depth、Volumetric Composition、色・Alpha設定と合成例を解説。"
doc_type: node
term_id: deep-to-image
term_short: 複数の奥行きサンプルを1枚の2D画像へまとめ、通常の画像処理へ渡すDeep変換Node。
verification: partial
aliases: [Deep to Image, DTI]
concepts: [deep-image, image-data, flatten]
nodes: [Deep to Image]
node_family: deep
controls: [Flip Depth, Volumetric Composition, Process Mode, Depth, Source Color Space, Source Gamma Space, Remove Curve, Pre-Divide/Post-Multiply]
inputs: [deep-image]
outputs: [image]
tasks: [deep, flatten, convert-domain]
level: advanced
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-24"
---

# Deep to Image

**Deep to Image [DTI]は、奥行きの異なる複数のサンプルを持つ画像を、通常の2D画像へまとめるNodeです。** たとえば3Dレンダーの手前に半透明の煙があり、その後ろに建物が見えている場合、手前から奥への重なりや透け方を考慮して最終的な1枚の画像を作ります。

<Term id="deep-image">Deep Image</Term>には、同じ画素（ピクセル）の位置に複数の色・Alpha・奥行きのサンプルを持たせられます。通常の<Term id="image">2D Image</Term>へ変換する処理を**フラット化（Flatten）**と呼びます。変換後は、Fusionの一般的なColor Corrector、Blur、Mergeなどに接続できます。

## 入力・出力

| 接続 | データ | 役割 |
| --- | --- | --- |
| **Input（オレンジ、必須）** | Deep Image | 奥行きサンプルを残したまま合成された画像を受け取る。21.1 Manualに記載された入力はこの1つ。 |
| **出力** | 2D Image | 複数の奥行きサンプルを1枚へまとめ、通常の画像処理Nodeへ渡す。 |

~~~text
Deep EXR（背景） ─┐
                 ├→ dMerge → Deep to Image → Color Corrector → MediaOut
Deep EXR（煙） ──┘
~~~

[dMerge](./d-merge.md)は複数のDeep Imageを統合し、各画素の奥行き情報を維持します。一方、Deep to Imageは**Deepの処理を終えて2D画像へ移る場所**です。複数の素材を直接入力して混ぜるNodeではありません。

## Inspector：出力の重なり方を決める

### Flip Depth

**Flip Depth**は、奥行き情報の向きを反転します。ソースの深度の扱いと合成時の前後関係が食い違い、手前にあるはずのものが奥へ回って見える場合に確認する項目です。

この設定は画面内の画像を左右反転したり、3Dオブジェクトの位置を動かしたりするものではありません。21.1 Manualは「depth informationを反転する」と説明していますが、内部のZ符号や値の変換式まではこの節に記載していません。合成結果を比較して判断してください。

### Volumetric Composition

**Volumetric Composition**は、奥行き方向で重なるサンプルを、薄い板のような平面としてだけではなく、**光を通す半透明の体積**として合成するための設定です。

たとえば霧や煙のような素材では、手前のサンプルを通して奥の色が少しずつ見えます。ManualはfogやVDBを例に挙げており、重なった半透明の要素をより自然に合成する用途を示しています。普通の不透明な物体を並べる処理と、半透明の体積を積み重ねる処理を区別して考えると、この設定の役割が分かりやすくなります。

ただし、**2Dの煙画像を入力するだけで体積データが作られるわけではありません**。元データに必要なDeepサンプルがあることが前提です。設定の有無による見た目の差は、半透明のDeep素材を使って比較します。

## Image tab：2D画像に変換した後の設定

Image tabには、出力画像の解像度、画素精度、ピクセル縦横比などを扱う設定があります。21.1 Manualで確認できる主な項目は次のとおりです。

| Inspector項目 | 何を変えるか・何を確認するか |
| --- | --- |
| **Process Mode** | フィールド（インターレース）処理の方式を選ぶ。初期選択はFrame Format環境設定のHas Fieldsの影響を受ける。 |
| **Depth** | 出力する**画素の色の精度**を選ぶ。Z方向の奥行き距離を変える項目ではない。 |
| **Source Color Space** | 入力の色空間情報を指定・引き継ぐ。色空間メタデータがない場合に情報を付けられるが、**これだけでは実際の色変換はしない**。 |
| **Source Gamma Space** | Gamma情報を自動取得するか、指定するか、Logとして扱うかを選ぶ。 |
| **Remove Curve** | 指定または検出したGamma曲線を除去し、必要な場合はLogからLinearへの変換を行う。 |
| **Pre-Divide/Post-Multiply** | 直線Alpha（Straight）と乗算済みAlpha（Premultiplied）の扱いを調整するための項目。 |

**Depthは「奥行きのZ値」ではなく、出力画像のbit depthです。** Manualは8-bitと32-bit floatの違いを例示し、floatでは通常の0～1の範囲外の明るさも扱えると説明しています。精度を上げるほどメモリ負荷が増えるため、後段の処理や納品形式と合わせて選びます。

### 色空間のメタデータと実際の変換は別

**Source Color Space**で色空間を選んでも、それだけで画像のRGB値が別の色空間へ変換されるわけではありません。21.1 Manualによると、ここで設定した情報は、後段のGamutなどが入力画像の色空間を判断するために利用できます。

一方、**Source Gamma Space**と**Remove Curve**は、Gamma曲線やLog/Linear変換に関係します。メタデータの指定と画素値の変換を同一視しないでください。元の素材ですでにLinear化されている場合、さらに曲線除去を重ねると見た目が変わる可能性があります。

Alphaにも同様の注意が必要です。StraightとPremultipliedの扱いが不一致だと、半透明部分や輪郭が不自然になる場合があります。[Alphaの乗算と解除](../../learn/04-compositing/premultiplication.md)も参照してください。

## 実例：Deepで煙と建物を合成し、最後に文字を載せる

前提は、建物と煙のDeep EXRを別々に用意しており、両方の奥行きの基準と画面サイズを合わせられることです。

1. **LoaderまたはMediaIn**で2つのDeep EXRを読み込みます。通常のRGBA画像ではなく、Deepサンプルを含むことを確認します。
2. **dMerge**で建物と煙をまとめます。この段階では、画素ごとの奥行き情報を保持しています。
3. **Deep to Image**へつなぎます。半透明の煙が重なる素材なら、Volumetric Compositionのオン・オフを比較し、意図した透け方になる方を選びます。
4. 建物と煙の前後関係が逆に見える場合は、ソースの深度規約を確認したうえでFlip Depthの結果を比較します。
5. Image tabのDepth、色・Gamma、Alphaの設定を、後段の画像処理に合うよう確認します。Deep合成自体はLinearで行います。
6. 出力された2D ImageにColor CorrectorやBlurを適用し、通常のMergeで2Dタイトルを重ねます。

~~~text
建物のDeep EXR ──┐
                 ├→ dMerge → Deep to Image → Color Corrector ─┐
煙のDeep EXR ────┘                                            ├→ Merge → MediaOut
2Dタイトル ───────────────────────────────────────────────────┘
~~~

この接続例は21.1 Manualで確認したNodeの役割を組み合わせた**運用例**であり、個々の素材による実機レンダーを確認した結果ではありません。煙の重なり方は、元のDeepデータとAlphaの状態によっても変わります。

## フラット化する前・後で変わること

Deep to Imageの手前では、1画素に複数の奥行きサンプルが残っているため、[dCrop](./dcrop.md)でZ範囲を選んだり、[dTransform](./dtransform.md)で奥行きを変更したりできます。

Deep to Imageを通過すると、出力は通常の2D Imageになります。色補正、ブラー、通常のMergeを扱いやすくなる一方、**元の複数の奥行きサンプルは出力画像には残りません**。

[Image to Deep](./image-to-deep.md)を後からつないでも、隠れた物体や失われたサンプルが自動で復元されるわけではありません。奥行きを使った再合成が必要なら、Deep to Imageより**前**のNode構成へ戻って調整します。

## 似たNodeとの違い

| Node | 用途 |
| --- | --- |
| **Deep to Image** | Deep Imageを1枚の2D画像へ変換する。 |
| [Image to Deep](./image-to-deep.md) | 2D画像に奥行き情報を与え、Deep処理へ渡す。 |
| [dMerge](./d-merge.md) | Deepサンプルを保持したまま複数素材を統合する。 |
| [dColorCorrector](./dcolorcorrector.md) | サンプル構造を保持したままDeep画像を色補正する。 |
| **通常のMerge** | 2D画像のForegroundとBackgroundをAlpha合成する。 |

Deep to Imageは「高品質なMerge」ではなく、**扱うデータの種類を変えるNode**です。

## 期待した結果にならないとき

- **Deepの後でdCropなどに接続できない**：Deep to Imageの出力は2D Imageです。奥行きサンプルを操作するNodeはその手前に置きます。
- **煙の透け方が不自然**：素材に半透明のDeepサンプルがあるか、Volumetric Compositionの有無で違いが出るか確認します。Alphaの扱いも確認します。
- **手前と奥が逆に見える**：元データの深度方向とFlip Depthを比較します。数値の正負規則を一律に決めつけないでください。
- **Depthを変更しても奥行きが動かない**：Image tabのDepthは出力の画素精度です。奥行き調整はDeep to Imageより前の[dTransform](./dtransform.md)などで行います。
- **色や明るさが変わる**：Source Color Spaceの情報指定と、Source Gamma Space / Remove Curveによる実際の変換を分けて確認します。不要な二重変換に注意します。
- **Nodeが見つからない**：21.1 ManualではDeep Image Compositing Toolsetは**Studio Version Only**とされています。使用Editionを確認します。

## 実機例：2つの深度から2D出力を作る

<!-- capture-reuse:R176 -->

Resolve Studio21.1.0.14／Windows、1920×1080、フレーム0、右Viewer40%で撮影しました。赤と青はそれぞれ不透明な単色の楕円です。外部Deep EXRは使っていません。

[![赤と青をImage to Deepへ渡し、dMergeからdCrop、Deep to Image、MediaOutへつないだ実機Graph](/img/fusion/captures/S121/graph.png)](/img/fusion/captures/S121/graph.png)

Image to Deepで赤をZ＝2、青をZ＝5に置き、dMergeでまとめています。dCropの深度制限を両方OFFにし、Deep to ImageのFlip DepthとVolumetric CompositionもOFFにしました。実機で観測した画像入力IDはImage、データ型はDeepImageです。

[![Deep to Imageの深度反転とVolumetric CompositionをOFFにした実機Inspector](/img/fusion/captures/S121/flatten-inspector.png)](/img/fusion/captures/S121/flatten-inspector.png)

Deep to Imageの出力をMediaOutへつなぐと、赤が青を覆う2D画像として表示されました。dCropで奥の青を選ぶ操作は、この平面化より前で行っています。

[![深度範囲を制限しない出力で赤が青の重なりを覆う実機結果](/img/fusion/captures/S121/compare.png)](/img/fusion/captures/S121/compare.png)

Flip Depthの切替比較、Volumetric Compositionの半透明素材での比較、Image tabの精度・色・Alpha設定は未確認です。

この例は、一定のZを持つ不透明な2枚の入力に限った確認です。外部Deep EXR、半透明・体積の合成、境界値ちょうどの扱い、サンプル数や入力数の上限、Edition差と性能は未確認です。色の数値精度を評価した例ではありません。

[再現用Graph](/img/fusion/captures/S121/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S121/capture.json)

## バージョン・出典・確認範囲

一次資料はBlackmagic Design『**DaVinci Resolve 21.1 Reference Manual**』（2026年9月）、Chapter 95「Deep Image Nodes」です。

- **pp.2238–2239**：Deep to Image [DTI]の入力、フラット化、Flip Depth、Volumetric Composition、Image tab。
- **p.2240**：Process Mode、Depth、Source Color Space、Source Gamma Space、Remove Curve、Pre-Divide/Post-Multiply。色空間情報の指定と実変換の違い。
- **pp.2226–2227**：Studio限定、Deep画像の入出力経路、Deep合成にLinear colorspaceが必要なこと。

S121でREGID＝DeepToImage、DeepImage入力、Flip Depth／Volumetric CompositionがOFFの不透明2層からの2D出力を実機確認しました。初期値と数値範囲、深度反転の計算、半透明素材の体積合成、出力Alphaの計算は未確認のため、`verification: partial`を維持します。

関連概念：[Deep Imageの基本](../../learn/02-data/deep-image.md) / [補助チャンネルとAOV](../../learn/02-data/auxiliary-channels.md)。
