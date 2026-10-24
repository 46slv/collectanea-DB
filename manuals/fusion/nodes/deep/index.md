---
title: Deep Image / 補助チャンネルのノード
description: Deep ImageとZ・Normal・UVなどの補助チャンネルを区別し、奥行き合成・被写界深度・霧・陰影に使うFusion Nodeを選ぶ。
doc_type: index
verification: partial
product_scope: fusion
tasks: [lookup-node, deep, aov, depth-composite]
updated: "2026-10-16"
---

# Deep Image / 補助チャンネルのノード

Fusionで「Deep」と呼ばれる処理には、**奥行きの異なる画像要素を重ねる方法**と、**レンダリング済み画像に残した奥行きなどの情報で効果をかける方法**があります。名前は似ていますが、扱うデータと接続先は別です。

例えば、手前のガラス越しに奥の煙が見える映像を合成するなら、前後の情報を残して重ねられる<Term id="deep-image">Deep Image</Term>が役立ちます。すでに完成した3Dレンダリングの「奥だけをぼかしたい」なら、<Term id="auxiliary-channels">Zなどの補助チャンネル（AOV）</Term>を利用するDepth Blurが候補です。

## 何が違うのか

| | Deep Image（Chapter 95） | Deep Pixel / 補助チャンネル（Chapter 96） |
| --- | --- | --- |
| **保存しているもの** | 同じ画素の手前・奥にある複数のサンプルと、その奥行き情報 | 通常の2D画像のRGBAに付いたZ（距離）、Normal（面の向き）、UV（表面の座標）など |
| **主な用途** | CGパスの前後関係、遮蔽、半透明の重なりを保って合成する | 画像化した後にぼけ・霧・陰影・模様を調整する |
| **代表Node** | dMerge、dHoldout、dTransform、Deep to Image | Depth Blur、Fog、Ambient Occlusion、Shader、Texture |
| **入力の見分け方** | Deep Imageという専用のデータ領域を扱う | 補助情報を含んだ2D Imageを扱う |

通常の<Term id="image">2D画像</Term>では、各画素にRGBAが1組あり、必要ならZなどの追加情報が付きます。これに対してDeep Imageは、例えば同じ画素の中に「手前の薄い煙」「その後ろの人物」「さらに奥の背景」という**複数の奥行きサンプル**を持てます。後者を一枚のRGBAへまとめる前に処理できることが、Deep合成の利点です。

**Zチャンネルが付いた2D画像を、そのままDeep Imageと呼ぶわけではありません。** Chapter 96の「Deep Pixel」も章・Node分類の名称であり、必ずしもDeep Image形式を入力するという意味ではありません。

詳しい仕組みは[Deep Imageの基礎](../../learn/02-data/deep-image.md)と[補助チャンネル / AOVの基礎](../../learn/02-data/auxiliary-channels.md)で確認できます。

## 1. 奥行きを残したままCGを合成する：Deep Image

建物と、その前後を漂う半透明の煙を別々にレンダリングした例です。通常の2D Mergeでは各画像をすでに平面化された色として重ねます。一方、Deepデータがあれば、同じ画素に含まれるサンプルの奥行きを使って重なりを処理できます。

~~~text
建物のDeep EXR ────────┐
                       ├→ dMerge → dColorCorrector → Deep to Image → 2Dの仕上げ
煙のDeep EXR ─────────┘
~~~

1. **Loader / MediaIn**でDeepデータを含むEXRを読み込みます。RGB画像しか入っていないEXRを読み込んでも、複数の奥行きサンプルは発生しません。
2. **dMerge**で2つのDeep Imageを統合します。色として重ねるだけではなく、奥行きサンプルを扱う段階です。
3. **dColorCorrector**などで、Deepデータを維持したまま必要な調整をします。
4. **Deep to Image**で初めて、複数のサンプルを通常の2D画像へまとめます。この操作は *flatten（平面化）* と呼ばれます。後段では普通の2D MergeやColor系Nodeを使えます。

平面化した画像を再びImage to Deepへ入れても、失われた前後のサンプルが自動で復元されるわけではありません。**奥行きごとに変更する必要がある処理は、Deep to Imageより前**に配置します。

### Deep Image Nodeの選び方

| したいこと | Node | 結果・使いどころ |
| --- | --- | --- |
| 複数のDeepレンダーをまとめる | [dMerge](./d-merge.md) | 前後のサンプルを扱いながら合成する |
| 手前の物体で背後を隠す | [dHoldout](./dholdout.md) | 前景の奥行きを使い、背後のサンプルの見え方を制御する |
| 特定の奥行き範囲だけを残す | [dCrop](./dcrop.md) | Zの範囲を指定してサンプルを選別する。画面の四角い領域を切り抜くCropとは異なる |
| Deepデータに色補正する | [dColorCorrector](./dcolorcorrector.md) | 平面化せず、Deep画像の色を調整する |
| 2D画像の色をDeepへ割り当てる | [dRecolor](./drecolor.md) | Deep側の奥行き情報と別のカラー画像を組み合わせる |
| Deep画像の幅・高さを変える | [dResize](./dresize.md) | 奥行きデータを使う処理の途中で解像度を調整する |
| 画面上の位置・大きさ、奥行き位置を変える | [dTransform](./dtransform.md) | XY方向の変形とZ方向の移動・拡大縮小を扱う |
| 通常の画像をDeep処理へ入れる | [Image to Deep](./image-to-deep.md) | 2D画像に奥行き位置を指定してDeep Imageへ変換する |
| Deep合成を通常画像にする | [Deep to Image](./deep-to-image.md) | 複数のサンプルを一枚の2D画像にまとめる |
| Deepの奥行きを点として観察する | [Deep to Points](./deep-to-points.md) | サンプルを3Dの点群として可視化し、配置や位置関係を確認する |

### 2D素材を一緒に使う場合

21.1 Manualによると、**Image to DeepとDeep to Imageを除くDeep合成Tool**には、2D入力をDeep Imageへ自動変換する仕組みがあります。ただし、自動変換は「元の画像に存在しなかった奥行き情報を正しく推定する」という意味ではありません。

例えば2DタイトルをDeep背景の特定の距離へ置きたい場合は、[Image to Deep](./image-to-deep.md)で意図したZ位置を指定する方法を検討します。前景と背景のどちらに表示したいのかを決めずに接続しないことが重要です。

**利用条件：** DaVinci Resolve 21.1 Reference Manualは、Deep Image Compositing Toolsetを **Studio Version Only** としています。また、**Deep合成にはlinear colorspaceが必要**と明記しています。表示用の色変換は、必要なDeep合成を終えた後の工程として設計します。

## 2. レンダリング後の画像を調整する：Deep Pixel / AOV

こちらで扱うのは、通常の2D画像に含めた補助チャンネルです。例えば3Dレンダリング時にRGBAと同時に**Z（カメラからの距離）**を保存しておけば、後から手前にピントを合わせ、奥をぼかす処理に利用できます。

~~~text
3Dシーン → Renderer 3D（RGBA + Z）→ Depth Blur → 2D出力
~~~

Depth BlurはRGBAの画素をぼかします。**Deep Imageの複数サンプルを合成しているのではありません。** 画像にZが無ければ、ぼかし量を奥行きに応じて変えるための情報もありません。

別の例では、Renderer 3DでZとNormal（面の向き）を出力し、Ambient Occlusionの画像入力へつなぎます。Ambient Occlusionはさらに、**レンダリングに使ったCamera 3D（または3Dシーン）**をCamera入力へ必要とします。RGBA画像だけでは計算できません。

### Deep Pixel Nodeの選び方

| したいこと | 必要な情報 | Node |
| --- | --- | --- |
| 物体の接触部分や奥まった部分へ陰影を足す | RGBA + Z + Normal、およびCamera入力 | [Ambient Occlusion](./ambient-occlusion-deep-pixel.md) |
| 手前にピントを合わせ、奥をぼかす | Zを含む2D画像（または別のぼけ量用画像） | [Depth Blur](./depth-blur-deep-pixel.md) |
| 遠くの建物ほど霧を濃くする | Zを含む2D画像 | [Fog](./fog-deep-pixel.md) |
| 描画済みの面へ明暗・反射の調整を加える | Normalを含む2D画像 | [Shader](./shader-deep-pixel.md) |
| 3Dの看板のロゴを描画後に差し替える | UVを含む2D画像と新しい模様の画像 | [Texture](./texture-deep-pixel.md) |

Normalは「表面がどちらを向くか」、UVは「物体の表面のどこに模様を貼るか」を示します。画像の見た目が似ていても、**NormalやUVの値を普通のRGBに表示しただけでは、Fusionの補助チャンネルとして使えるとは限りません**。

補助データの取り出しや確認には[Copy Aux](../color/copy-aux.md)、別画像からチャンネルを組み込む場合には[Channel Booleans](../color/channel-boolean.md)を使います。Z・Normal・UVがどこに格納されているか分からないときは、効果量を上げる前に元データを確かめます。

## 接続できない・効果が出ないとき

- **Deepと書いてあるNode同士なのにつながらない**：Deep Imageと、補助チャンネル付きの2D Imageは異なる形式です。Node名ではなく入力・出力のデータ領域を確認します。
- **Depth BlurやFogで奥行きの差が出ない**：ZのないRGBA画像を渡していないか、Renderer 3DのOutput ChannelsやEXRの読み込み設定を確認します。単なる白黒のZ画像と、2D画像のZ補助チャンネルは同じ配線ではありません。
- **Deep合成後に普通のMergeへ渡したい**：[Deep to Image](./deep-to-image.md)で2D Imageへ変換します。後から前後のサンプルを調整するなら、変換前のDeep経路へ戻ります。
- **透明物や物体の境界で不自然になる**：補助チャンネルは、RGBAと同じように平均すると不適切な値になる場合があります。Z・Normal・UVなどの出力条件を確認し、必要に応じて元のレンダリング方法も見直します。
- **製品によってNodeが見つからない**：少なくともChapter 95のDeep Image ToolsetはStudio限定です。Chapter 96の全Nodeに同じEdition条件が適用されるとは、この章名だけで判断できません。

## 実機例：補助Zを使う2D後処理

<!-- capture-reuse:R168 -->

Depth BlurはRendererが出した通常のRGBA画像と補助Zを使っています。右の出力では手前をほぼ鮮明に保ち、奥をぼかしました。このGraphのCopy AuxはZ確認用の分岐です。複数サンプルを保持するDeep Imageや、その平面化を実証した例ではありません。

[![実機例：補助Zを使う2D後処理：graphの実機画面](/img/fusion/captures/S116/graph.png)](/img/fusion/captures/S116/graph.png)

[![実機例：補助Zを使う2D後処理：compareの実機画面](/img/fusion/captures/S116/compare.png)](/img/fusion/captures/S116/compare.png)

[撮影条件・設定値と未確認範囲](./depth-blur-deep-pixel)を参照してください。

## 関連する考え方と出典

- [Deep Image：1画素に複数の奥行きサンプルを持つ形式](../../learn/02-data/deep-image.md)
- [補助チャンネル / AOV：Z・Normal・UVなどの意味](../../learn/02-data/auxiliary-channels.md)
- [データ領域を辿って診断する](../../learn/07-debugging/trace-data-domain.md)

**一次資料：** Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）。

- **Chapter 95「Deep Image Nodes」pp.2226–2254**：Deep Imageの複数サンプル、Studio限定、Deep EXRの入出力、2D入力の自動変換、linear colorspace、各Deep Node。
- **Chapter 96「Deep Pixel Nodes」pp.2255–2268**：補助チャンネルを利用する2D後処理と、Ambient Occlusion / Depth Blur / Fog / Shader / Texture。
- **Chapter 88「Renderer3D」pp.1970–1975**：Z・Normal・TexCoordなどの出力設定。詳細は[公式サポート](https://www.blackmagicdesign.com/jp/support)から確認できます。

用途と接続例はこれらの説明を組み合わせたものです。Resolve / Fusion 21.1実機での各入力形式、レンダラー差、すべてのEdition差を確認したものではないため、記事全体の検証状態は partial としています。
