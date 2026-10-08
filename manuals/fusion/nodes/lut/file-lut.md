---
title: "File LUT"
description: "外部fileの1D / 3D LUTを読み込み、2D Imageへ適用するNode。Effect Mask、前後Gain、Color Space、premultiplied Alpha処理も調整できる。"
doc_type: node
term_id: "file-lut"
term_short: "File LUTは、外部fileの1D / 3D LUTを読み込み、2D Imageへ適用するNode。"
verification: partial
aliases: ["File LUT", "FLU"]
concepts: ["image-data"]
nodes: ["File LUT"]
node_family: "lut"
inputs: ["image", "mask"]
outputs: ["image"]
controls: ["LUT File", "Pre-Gain", "Post-Gain", "Color Space", "Pre-Divide/Post-Multiply"]
tasks: ["apply-lut"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-07"
---

# File LUT

File LUT [FLU]は、computerやserver上に保存されたLUT fileを読み込み、その色変換を2D Imageへ適用するNodeです。1D LUTと対応する3D LUTを扱えます。

[Color Curves](../color/color-curves.md)のようにFusion内でSplineを編集してcurveを作るのではなく、すでに用意されたLUT fileの内容を使います。[LUTノードのFamily Overview](./index.md)では、File LUTとLUT Cube Creator / Apply / Analyzerの使い分けをまとめています。

## 入力と出力

DaVinci Resolve 21.1 Reference Manualでは、2つの入力が記載されています。

- **Input**（orange、必須）: LUTを適用する2D Image。
- **Effect Mask**（blue、任意）: LUTを適用する範囲を制限するMask。

出力は、指定したLUTをInputへ適用した2D Imageです。

```text
MediaIn / Loader → File LUT → 後段のcomposite / Color処理
                       ↑
                 Effect Mask
```

Effect MaskにはPolyline、基本Shape、Paint stroke、他のtoolから作ったbitmapなどを使えます。21.1 Manualでは、Effect MaskはFile LUTの処理後に適用されると説明されています。

## LUT fileは外部参照される

File LUTはLUTの中身をcompositionへ埋め込まず、**LUT fileへのpath**を保存します。

この方式には2つの特徴があります。

1. 大きなLUTを複数使っても、compositionにはfile本体ではなくpathだけを持つため、composition fileを小さく保ちやすい。
2. 複数のFile LUT Nodeが同じLUT fileを参照している場合、そのfileの内容を更新すると各Nodeが同じ更新後のLUTを参照できる。

一方で、別のmachineへcompositionを移す場合やLUT fileを移動した場合は、参照先へアクセスできる状態を維持する必要があります。指定したfileを見つけられない、または読み込めない場合、File LUTはConsoleへerrorを出します。

## Controls

### LUT File

適用するLUT fileのpathを指定します。Browseからfile browserを開いて選択することもできます。

21.1 Manualでは、Fusionから書き出した`.LUT` / `.ALUT`、DaVinci Resolveの`.CUBE`、そのほか複数の3D LUT formatに対応すると説明されています。このページでは、Manualに列挙されていないformatまで完全対応と推測しません。

### Pre-Gain

LUTを適用する**前**にGainを調整します。

たとえばLUTでhighlightがclipする場合、LUTへ入る前の値を下げてから変換したいときに使えます。

```text
Input → Pre-Gain → LUT → Post-Gain → Output
```

### Post-Gain

LUTを適用した**後**にGainを調整します。LUTによる変換後の明るさを補正したい場合に使います。

### Color Space

LUTをどのColor Spaceで適用するかを選びます。

21.1 ManualではRGBがdefaultで、YUV、HLS、HSVなども選択肢として挙げられています。ここで選ぶのはFile LUT内のcurveをどのspaceへ適用するかであり、project全体のColor Management設定そのものを置き換えるControlではありません。

### Pre-Divide/Post-Multiply

Alphaを持つImageへLUTを適用するときの処理です。

有効にすると、LUT適用前にpixel値をAlphaで割り、Color処理後に再びAlphaを掛けます。premultiplied AlphaのままColor処理したときに、blue / green keyのedgeや3D renderの半透明部分で不正な加算結果が出るのを避けるために使います。

AlphaとRGBの関係は[プリマルチプライ（Premultiplication）](../../learn/04-compositing/premultiplication.md)も参照してください。

## 何をするNodeか

LUTは、入力された色を別の色へ対応付けるtableです。File LUTは外部fileに記録されたその対応表を読み込み、Input Imageのpixel値へ適用します。

たとえば、次のような使い方があります。

- camera-original Imageをcompositing用のspaceへ変換するtechnical LUTを適用する。
- compositeの終段でcoloristから受け取ったlook LUTを適用する。
- Effect Maskを使い、LUTの適用をImageの一部だけへ限定する。

21.1 Manualでは、MediaIn / Loaderの直後でcamera-original Imageをlinearへ変換する例と、node treeの終段でcoloristのlookを適用する例の両方が説明されています。

ただし、technical transformをLUTで行うことが常に最適という意味ではありません。Color Space変換を目的にする場合は、[Colorノード](../color/index.md)やResolve Color Managementも含めて、workflow全体でどこが変換を担当しているか確認します。

## 運用例

### look LUTをcompositeの終段へ適用する

```text
MediaIn
  ↓
composite / graphics
  ↓
File LUT
  ↓
MediaOut
```

look用のLUTを最終Imageへ適用したい場合の基本形です。Pre-GainでLUT入力前、Post-Gainで適用後を分けて調整できます。

### Effect Maskで一部だけに適用する

```text
Image ─────────────→ File LUT → Result
                       ↑
Ellipse / Polygon ─────┘ Effect Mask
```

LUTの内容は同じまま、Maskで適用範囲だけを限定できます。Mask自体がLUT fileへ書き込まれるわけではありません。

### 同じLUT fileを複数Nodeから参照する

複数compositionや同じcomposition内の複数File LUT Nodeが同じfile pathを参照している場合、LUT file側を更新すれば参照先をまとめて更新できます。

これはLUTを外部fileとして管理する利点ですが、意図せずfileを置き換えると複数Nodeの見た目が同時に変わる点にも注意が必要です。

## LUT Cube Applyとの違い

[LUT Cube Apply](./lut-cube-apply.md)もImageへLUTを適用しますが、参照元が異なります。

- **File LUT**: disk / server上にあるLUT fileをpathから読み込む。
- **LUT Cube Apply**: Fusion内のLUT Cube Creator由来のcolor cube ImageをReference Imageとして直接使う。

すでにLUT fileがあるならFile LUT、Fusion内で加工したcolor cubeをfileへ書かずその場で使うならLUT Cube Applyを選びます。

## Viewer LUTとの違い

Fusion ViewerのLUTは、作業中の表示を見やすくするpreview用途です。Viewer LUTを変えてもnode treeを流れるImageそのものは変わりません。

File LUTはFlow内のNodeなので、適用後のpixel値が後段NodeやMediaOut / Saverへ渡ります。

「表示だけを変えたい」のか、「ImageそのものへLUTを適用したい」のかを先に分けます。

## 注意点

- LUT fileはcompositionへ埋め込まれずpath参照なので、移動・共有時は参照先fileも管理します。
- fileが見つからない、または読み込めない場合はConsole errorになります。
- `Color Space`はLUTを適用するspaceを選ぶControlであり、projectのColor Management全体を自動で整えるものではありません。
- `Pre-Divide/Post-Multiply`はAlphaを持つ素材のColor処理で重要です。premultiplied Imageを扱う場合はAlpha edgeも確認します。
- runtime REGID、Effects Library上のcurrent表示、edition差、各LUT formatの完全な対応一覧は、このページでは未確認です。

## 関連Node

- [LUTノードのFamily Overview](./index.md): LUT Family全体の役割と選択基準。
- [LUT Cube Apply](./lut-cube-apply.md): Fusion内のcolor cubeを別Imageへ直接適用します。
- [LUT Cube Analyzer](./lut-cube-analyzer.md): 加工したcolor cubeから3D LUT fileを書き出します。
- [LUT Cube Creator](./lut-cube-creator.md): LUT作成用の既知のcolor cube patternを生成します。
- [Color Curves](../color/color-curves.md): Fusion内でcurveを直接編集してColorを調整します。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual（September 2026）Chapter 107「LUT Nodes」pp.2454–2455を基準にしています。

確認した項目は、orange Inputとblue Effect Mask、1D / 3D LUT、外部fileをpath参照する仕組み、`LUT File`、`Pre-Gain`、`Post-Gain`、`Color Space`、`Pre-Divide/Post-Multiply`、対応formatとして明記された`.LUT` / `.ALUT` / `.CUBE`、file load failure時のConsole errorです。

runtime REGID、Effects Library上のcurrent表示、edition差、Manualに列挙されていないformatの完全対応は別verification対象として残しているため、`verification: partial`を維持しています。
