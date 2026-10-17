---
title: Deep Image
description: 1 pixel内に複数のdepth sampleを保持するDeep Image dataを、通常の2D ImageやZ channelと区別して理解する。
doc_type: concept
term_id: deep-image
term_short: 1 pixel内に複数のdepth sampleを保持し、奥行き順を保ったまま合成できるDeep compositing data。
verification: partial
aliases: [Deep Image, deep data, Deep EXR]
concepts: [data-domain, depth, compositing]
nodes: [dMerge, Deep to Image, Image to Deep, dHoldout]
tasks: [deep, understand-domain, composite]
level: advanced
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-17"
---

# Deep Image

Deep Imageは、1 pixelにつき1つのRGBA値だけを持つ通常の2D Imageと違い、**同じpixel位置に複数のdepth sampleを保持できる**dataです。

たとえば半透明volumeの手前と奥、複数objectが同じpixelへ重なる場合でも、各sampleのdepth関係を保ったまま後で合成できます。

## 2D Imageとの違い

通常の2D Image:

```text
pixel (x, y)
  → RGBA 1組
  → 必要なら Z channel 1値
```

Deep Image:

```text
pixel (x, y)
  → sample A: RGBA + depth
  → sample B: RGBA + depth
  → sample C: RGBA + depth
```

そのためDeep compositingは「Z channel付きImageをMergeする」のと同じではありません。

## Deep Image workflow

Deep Imageを使う理由は、**一度2Dに平坦化すると失われる、同じ画素内の前後関係を後段まで残せる**ことです。例えば手前に薄い煙があり、その向こうに車体が見えるCGでは、煙と車体のサンプルが同じ画素に重なります。通常のRGBA画像にした後では、その画素の奥に何があったかを改めて取り出せません。

### 実例：2つのDeep EXRを合成して実写へ重ねる

```text
Loader A（奥側のDeep EXR） ─→ dMerge［Background：オレンジ］
Loader B（手前側のDeep EXR） → dMerge［Foreground：白］
                                  │
                                  ↓
                         dColorCorrector → Deep to Image ─→ Merge［Foreground］ ─→ MediaOut
MediaIn（実写プレート） ─────────────────────────────────→ Merge［Background］
```

1. **Loader A / B**で別々に書き出されたDeep EXRを読み込みます。DaVinci ResolveのFusionページでは、Deepデータを含む素材をMediaInから受け取る構成もあります。最初に、読み込んだものが通常のRGBAだけのEXRではなくDeepデータを持つか確認します。
2. **dMerge**のオレンジのBackground入力へAを、白いForeground入力へBを接続します。dMergeは複数のDeepストリームの深度サンプルを統合します。Foreground入力は追加できるため、Deep素材が3つ以上でも同じ合成へ加えられます。これは2D Mergeのように、前景を単に一枚の平面画像として上へ重ねる処理とは異なります。
3. **dColorCorrector**でDeepの各サンプルを保ったまま色補正できます。Deepを平坦化する前に調整したい場合に置きます。補正が不要なら省略できます。
4. **Deep to Image**のInput（オレンジ）へ結果を渡し、深度サンプルを通常の2D Imageへ平坦化します。ここから先は通常のColor Corrector、Blur、Mergeなどの2D処理へつなげられます。
5. 実写プレートをMergeのBackground、Deep to Imageの出力をForegroundへ接続します。Deep合成の結果と実写の合成は別段階なので、Deep to Imageを抜かしたまま通常のMergeへつなぐ構成にはしません。

**半透明の煙やボリューム**を扱うときは、Deep to Imageの**Volumetric Composition**を確認します。21.1マニュアルでは、重なったDeepサンプルを平面としてではなく半透明の体積として合成する設定と説明されています。霧・VDB等に有用ですが、すべてのDeep素材で有効にすべきという意味ではありません。

### 合成ではなく手前の形状で奥を隠したいとき

**dHoldout**はdMergeと目的が異なります。オレンジのBackgroundへ隠される側のDeep Image、白いForegroundへ遮蔽物になるDeep Imageを渡し、奥側のサンプルを除去・遮蔽します。例えば別パスの人物を使って、奥側の煙のうち人物に隠れる部分を処理する用途です。

Foregroundが半透明の場合は、**Compute Occluded Samples**で隠された背景のサンプルの扱いを調整できます。奥行き位置を動かすための**Holdout Z Offset**もあります。dMergeはサンプルを一緒に合成するNode、dHoldoutは片方を使ってもう片方を遮蔽するNode、と区別します。

## 2D ImageをDeepの構成へ入れる

```text
MediaIn（通常の2D Image） → Image to Deep ──┐
                                          ├→ dMerge → Deep to Image → 通常の2D合成
Loader（Deep EXR） ────────────────────────┘
```

**Image to Deep**は2D ImageへDeep情報を加え、dMergeへ送るためのNodeです。Inspectorには**Specify Z、Z Scale、Z Offset**などがあり、2D素材をDeep空間のどの深度へ置くか調整できます（21.1マニュアル pp.2252–2253）。

ただし、これは**2D画像から見えない奥側の形状を復元する処理ではありません**。一枚に合成済みの画像は、複数の奥行きサンプルを元から持つDeep EXRとは異なります。深度が分からない部分の正しい前後関係を、Image to Deepだけで再現できると考えないでください。

マニュアルには、**Image to Deep / Deep to Image以外のDeep合成Nodeが2D入力を自動的にDeepへ変換できる**ことも記載されています。自動変換で十分な場合は変換Nodeを省略できますが、奥行き位置を明示して調整する場合はImage to Deepを使う方が意図を追いやすくなります。

## 入力・出力を間違えやすいNode

| Node | 主な入力 | 出力・用途 |
| --- | --- | --- |
| **dMerge** | DeepのBackground（オレンジ）、追加可能なForeground（白） | Deepサンプルを統合し、Deepのまま後段へ渡す |
| **dHoldout** | 隠す対象のBackground（オレンジ）、遮蔽物のForeground（白） | 手前のDeepを使って奥のDeepサンプルを隠す |
| **dColorCorrector** | Deep ImageのInput（黄）、任意のEffect Mask（青） | Deepを保ちながら色補正する |
| **dRecolor** | DeepのDepth入力（オレンジ）、2D RGBのColor入力（緑） | 通常の2D画像の色でDeepサンプルを再着色する |
| **Image to Deep** | 2D ImageのInput（オレンジ） | 2D画像へDeep情報を追加する |
| **Deep to Image** | Deep ImageのInput（オレンジ） | サンプルを平坦化して通常の2D Imageへ変換する |
| **Deep to Points** | Deep ImageのInput（オレンジ）、任意のCamera（緑） | 深度サンプルを3D point cloudへ変換して位置を確認する |

この表はDeep系Nodeの代表的な接続です。入力端子の色だけで判断せず、Node Editorの入力名と扱うデータを確認してください。詳しくは[接続互換性](./connection-compatibility.md)を参照してください。

## 色空間と負荷の注意点

**Deep合成の計算はリニア色空間が前提**です。21.1マニュアルはDeep compositingにlinear colorspaceが必要で、合成後に必要な色空間へ変換できると明記しています。カメラLog素材や表示用ガンマのついた2Dプレートを混ぜる場合、色空間名を設定するだけで画素値が自動的にリニアへ変換されたと考えず、実際の変換経路を確認します。Deep to ImageのImageタブには出力画像の解像度、Color Depth、Pixel Aspect等の設定があります。

Deepデータは1画素に複数サンプルを持つため、通常のRGBAだけの画像より処理が重くなる場合があります。編集が重い場合、マニュアルにある**Cache to Disk**を使ってDeep処理の途中をキャッシュし、不要な再計算を減らせます。最終的な2D合成に移れる位置でDeep to Imageを使い、それより前のDeepサンプルが必要な処理を終えておきます。

## Studio限定

DaVinci Resolve 21.1 Reference ManualのChapter 95は、**Deep Image Compositing Toolsetを「Studio Version Only」**と記載しています。ここで扱うdMerge、dHoldoutなどの利用可否はエディションに依存します。Resolve Freeでも使えると推測しないでください。
## Deep Pixelとの違い

Chapter 96の「Deep Pixel Nodes」は名前が似ていますが、true Deep Image sampleを扱うChapter 95とは別です。

Ambient Occlusion、Depth Blur、Fog、Shader、Texture等は、Z / Normal / UV / Object ID等の**auxiliary channelを持つ2D Image**をpost-processします。

→ [補助Channel / AOV](./auxiliary-channels)

## 関連Node

- [Deepノード](../../nodes/deep/)
- [dMerge](../../nodes/deep/d-merge)
- [Deep to Image](../../nodes/deep/deep-to-image)
- [Image to Deep](../../nodes/deep/image-to-deep)
- [dHoldout](../../nodes/deep/dholdout.md) — 別のDeep素材で奥を遮蔽する
- [dColorCorrector](../../nodes/deep/dcolorcorrector.md) — Deepのサンプルを保って色補正する
- [dRecolor](../../nodes/deep/drecolor.md) — 2D RGB画像の色をDeepへ渡す
- [接続互換性](./connection-compatibility.md) — Deep / Imageの接続境界を整理する
- [Image](./image.md) — 2D Imageの構造を確認する

## 出典と確認範囲

Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 95 pp.2226–2254を参照しました。特にpp.2227（Deep EXR、Studio限定、linear、cache）、2238–2240（Deep to ImageとVolumetric Composition）、2245–2247（dHoldout・dMergeの入出力）、2247–2248（dRecolor）、2252–2253（Image to DeepのZ設定）と照合しています。

Deep EXR内部sample storage、external renderer compatibility、memory costの実機値は未確認です。
