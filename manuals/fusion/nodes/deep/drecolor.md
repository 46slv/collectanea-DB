---
title: dRecolor
description: Deep Imageの色を別の2D RGB / RGBA画像から変更し、奥行きサンプルの合成を続けるためのNode。
doc_type: node
term_id: drecolor
term_short: 2D画像の色をDeep Imageのサンプルへ適用し、Deep合成を続けるためのNode。
verification: partial
aliases: [dRecolor, dRc]
concepts: [deep-image, image-data, alpha]
nodes: [dRecolor]
node_family: deep
level: advanced
controls: [Center X/Y, Target Input Alpha, Drop Input Zero Alpha]
inputs: [deep-image, image]
outputs: [deep-image]
tasks: [deep, recolor, texture]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-16"
---

# dRecolor

**dRecolor [dRc]は、Deep Imageの奥行き情報を使った合成を続けながら、別の2D画像の色を適用するNodeです。** 例えば、CGのDeepデータと2Dカラー画像を別々に受け取った場合に使います。

<Term id="deep-image">Deep Image</Term>は、1画素の中に手前と奥の複数のサンプルを持てる画像データです。普通の2D <Term id="image">Image</Term>には画素ごとのRGB / RGBAがありますが、それだけで同じ画素内の複数の奥行きサンプルを表すわけではありません。

dRecolorは**色を2D画像から受け取る**ためのNodeです。物体をZ方向へ動かすNodeでも、複数のDeep画像を統合するNodeでもありません。

## 入力と出力

| 端子 | データ | 役割 |
| --- | --- | --- |
| **Depth**（オレンジ色） | Deep Image | 色を変更したいDeepデータ。 |
| **Color**（緑色） | 2D RGB / RGBA Image | Deepへ適用する色。 |
| **出力** | Deep Image | 色の変更後もDeep合成を続けるためのデータ。 |

~~~text
Deep EXR（Loader / MediaIn）─→ Depth ─┐
                                      ├→ dRecolor → dMerge → Deep to Image
2D Color Image ──────────────→ Color ─┘
~~~

ManualのdRecolor節で説明される固有入力は**DepthとColorの2つ**です。[dColorCorrector](./dcolorcorrector.md)にあるEffect Mask入力を、dRecolorにもあると推測して追加しないでください。


### Depth

Deep Image inputです。

### Color

緑色の2D RGB / RGBA Image inputです。

```text
Deep data ──┐
            ├─ dRecolor → dMerge / Deep to Image
2D Color ───┘
```

## Center X/Y

Color inputをDeep Imageに対してXY方向へ位置合わせします。

Deepと2D beautyが同じframe / resolutionでない場合、まずalignmentを確認します。

## Target Input Alpha

Color inputのAlphaも使い、Deep sampleのtransparencyへ影響させます。

無効時はRGBだけをrecolorへ使います。

## Drop Input Zero Alpha

Color inputのAlphaが0のpixelをrecolor計算から除外します。

透明領域がDeep sampleへ不要なRGBを持ち込むのを避けたい場合に使います。

## 使う場面：Deep EXRの色を別の2D画像へ差し替える

人物CGのDeepレンダーと、その人物の2Dカラー画像が別々にあるとします。背景のCGもDeepデータで受け取っており、人物と背景を奥行きの関係を残したまま合成したい場合です。

1. 人物の**Deep EXR**をLoaderまたはMediaInから読み込み、dRecolorの**Depth**へ接続します。通常のRGBだけのEXRを、Deep EXRと取り違えないようにします。
2. 人物の**2Dカラー画像**を別のLoaderまたはMediaInから読み込み、**Color**へ接続します。
3. まず両画像が同じフレーム、フレーミング、画素位置を表しているか比較します。ずれている場合は**Center X/Y**で2D側を調整します。
4. Color画像のAlphaをDeepの透明度に反映する必要があれば**Target Input Alpha**を有効にします。完全に透明な画素の色が不要なら**Drop Input Zero Alpha**も確認します。
5. dRecolorの出力を[Deep to Image](./deep-to-image.md)へつなぎ、色と透明部分を確認します。背景Deepと合成する場合は、その前に[dMerge](./d-merge.md)を置きます。

~~~text
背景Deep ────────────────────────────────┐
                                         ├→ dMerge → Deep to Image → 2D確認
人物Deep ─→ Depth ─┐                    │
                   ├→ dRecolor ─────────┘
人物2D色 ─→ Color ─┘
~~~

**解像度が同じだけでは位置合わせが完了したことになりません。** 2つのレンダーでカメラや画角、クロップ、フレーム番号が違う場合は別途確認します。Center X/Yは2D画像の位置調整であり、カメラ投影やDeepのZ値の修正機能として説明されていません。

また、2Dカラー画像自体は画素内の手前・奥の物体を別々の色として保持する形式ではありません。元のDeep画像のすべての奥行き層を、独立した材質パスのように個別指定できると考えないでください。Deepサンプルと2D色の**厳密な対応アルゴリズム**は、このManualの節には記載されていません。

## Alphaを変更するか、透明画素を無視するか

Target Input AlphaとDrop Input Zero Alphaは別の目的の設定です。

| 確認したいこと | 見る設定 |
| --- | --- |
| Color画像の**RGBだけ**を使い、Color側のAlphaは透明度へ反映したくない | Target Input Alphaをオフ |
| Color画像のAlphaも、Deepサンプルの透明度へ影響させたい | Target Input Alphaをオン |
| Color画像でAlphaが**完全に0**の画素を色変更に使いたくない | Drop Input Zero Alphaをオン |

「Alphaが0ではない半透明画素にどの計算式を使うか」「元のAlphaと入力Alphaをどの順番で掛け合わせるか」などは、21.1 ManualのdRecolor節だけでは確定できません。数値結果が重要な場合は、実機で透明度の違うテスト画像を使って確認してください。

## Deep to Image後のカラー補正との違い

- **dRecolor**：別の2D RGB / RGBA画像をDeepの色として使い、Deep処理を続けます。
- **[dColorCorrector](./dcolorcorrector.md)**：DeepサンプルのHue・Levelsなどを調整したい場合に使います。
- **[Deep to Image](./deep-to-image.md)の後の通常Color Corrector**：Deepを2Dへまとめた後で色を調整します。その段階では、元の複数の奥行きサンプルを個別に扱えません。
- **[dTransform](./dtransform.md)**：XYの変形やZの位置調整が必要な場合に使います。dRecolorのCenter X/Yとは目的が異なります。

## 結果が期待と違うとき

- **色がずれる**：DepthとColorの撮影・レンダー条件、フレーム、画像位置を確認します。Center X/Yで補正できるのは2Dカラー画像の位置です。
- **透明な画素から意図しない色が出る**：Color側のRGBAを確認し、Target Input AlphaとDrop Input Zero Alphaを別々に切り替えて比較します。
- **奥行きの重なりがおかしい**：色ではなくDeepのZ値や[dMerge](./d-merge.md)への入力が原因でないかを調べます。
- **2DのMerge / Colorへつなぎたい**：Deep合成が終わった時点でDeep to Imageを使います。
- **Nodeが見当たらない**：21.1 Reference ManualではDeep Image Compositing Toolsetを**Studio Version Only**としています。

Deep compositingは**linear colorspaceで行う必要があります**。dRecolorが表示用の色空間へ自動変換する前提にはせず、色管理は合成フロー全体で確認します。

## バージョンと出典

**一次資料**：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月）、Chapter 95「Deep Image Nodes」。

- **pp.2247–2248**：dRecolor [dRc]、Depth / Color入力、Center X/Y、Target Input Alpha、Drop Input Zero Alpha。
- **p.2227**：Deep Imageの概要、Studio限定、linear colorspace要件、Loader / MediaInからのDeep EXR読み込み。
- **pp.2238–2240、2246–2247**：Deep to ImageとdMergeの入出力・役割。

データ形式の基本は[Deep Image](../../learn/02-data/deep-image.md)、ほかの関連Nodeは[Deep / Auxiliary Channelノード一覧](./index.md)を参照してください。

本記事の接続例はManualで確認できる仕様を組み合わせた運用例です。21.1実機でのAlphaの内部合成式、Deep sampleへの厳密な色の割り当て、各Controlの初期値・数値範囲は未検証のため、`verification: partial`のままにしています。
