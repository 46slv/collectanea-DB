---
title: "LUT Cube Analyzer"
description: "LUT Cube Creator由来の加工済みcolor cubeを解析し、3D LUT fileとしてdiskへ書き出すNode。"
doc_type: node
term_id: "lut-cube-analyzer"
term_short: "LUT Cube Analyzerは、加工済みcolor cubeから3D LUT fileを書き出すNode。"
verification: partial
aliases: ["LUT Cube Analyzer", "LCA"]
concepts: ["image-data"]
nodes: ["LUT Cube Analyzer"]
node_family: "lut"
inputs: ["image"]
controls: ["Type", "Filename", "Write File"]
tasks: ["apply-lut"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-07"
---

# LUT Cube Analyzer

LUT Cube Analyzerは、[LUT Cube Creator](./lut-cube-creator)から始めたcolor cube Imageへ加えたColor処理を読み取り、**3D LUT fileとしてdiskへ書き出す**Nodeです。

通常の映像素材を解析して自動でlookを作るNodeではありません。入力するのは、LUT Cube Creatorが生成した既知のcolor cube pattern、またはそのpatternへColor処理を加えたImageです。

[LUTノードのFamily Overview](./)では、Creator / Apply / Analyzer / File LUTの使い分けをまとめています。

## 入力と成果物

21.1 Manualで記載されている入力は、orange Input 1系統です。

- **Input**: LUT Cube Creator由来のImage、またはそのImageへColor処理を加えた結果。

基本構成は次の通りです。

```text
LUT Cube Creator
      ↓
Color Corrector / Curves / Matrix ...
      ↓
LUT Cube Analyzer
      ↓
3D LUT file
```

Analyzerの成果物は、Inspectorで指定した場所へ書き出される3D LUT fileです。

DaVinci Resolve 21.1 Reference ManualはAnalyzerについてImage outputを記載しておらず、Creatorの元Imageをそのまま入力して1:1 LUTを作る例では「Viewerには何も表示されない」と説明しています。そのため、このページでは未確認のImage outputをfrontmatterへ記載していません。

## 何をLUTへ変換しているか

LUT Cube Creatorは、RGBの組み合わせを規則的に並べた既知のsample Imageを作ります。

そのImageへColor処理を加えると、各sample colorが「処理前のRGB → 処理後のRGB」の対応を持ちます。LUT Cube Analyzerはその対応を読み取り、3D LUT fileへ変換します。

CreatorのImageへ何も処理せず、そのままAnalyzerへ接続すると1:1 LUTになります。これは入力色と出力色が同じ対応表です。

```text
LUT Cube Creator → LUT Cube Analyzer → 1:1 LUT
```

複数のColor Nodeを通した場合は、その結果を1つの3D LUTへまとめられます。

```text
LUT Cube Creator
      ↓
Color Corrector
      ↓
Color Curves
      ↓
LUT Cube Analyzer
      ↓
combined 3D LUT
```

## 主なControls

### Type

書き出す3D LUT formatを選びます。

DaVinci Resolve 21.1 Reference Manualでは、次のformatが記載されています。

- `ALUT3`
- `ITX`
- `3DL`

必要なappやpipelineがどのformatを受け取れるか確認して選びます。

### Filename

LUT fileを保存するpathとfile名を指定します。

直接入力するほか、Browseから保存場所とfile名を選べます。

### Write File

現在の`Type`と`Filename`を使って、3D LUT fileを実際に生成します。

NodeをGraphへ置いただけではfileを書き出す操作にはなりません。保存先を決めた後、`Write File`を実行します。

## 具体的な使い方

### Fusionで作ったColor処理を別環境へ渡す

```text
LUT Cube Creator
      ↓
Color Corrector
      ↓
LUT Cube Analyzer
      ↓
look.3dl
```

たとえばFusion内で作った一定のColor変換をLUTへまとめ、別compositionやLUT対応appで再利用したい場合に使えます。

作成したfileをFusionへ戻して使う場合は、[File LUT](./file-lut)で読み込みます。

### fileを書き出す前に実写Imageで確認する

LUT fileを作る前に、加工済みcubeがTarget Imageへどう作用するか確認したい場合は[LUT Cube Apply](./lut-cube-apply)を使います。

```text
LUT Cube Creator → Color処理 ──────┐
                                  ↓ Reference Image
Target Image ─────────────────→ LUT Cube Apply → Preview
```

見た目を確認して問題なければ、同じ加工済みcubeをAnalyzerへ渡してfile化できます。

## LUTへ入れられない処理

3D LUTが保存できるのは、基本的に**入力RGBと出力RGBの対応関係**です。

そのため、次のようにpixelの色以外へ依存する処理は、通常の3D LUTだけではそのまま再現できません。

- BlurやSharpenのように周囲のpixelを見る処理
- 画面上の位置で結果が変わる処理
- Maskで場所ごとに異なる補正をする処理
- frameや時間で結果が変化する処理
- trackingやgeometryへ依存する処理

AnalyzerへつながるGraphにNodeを置けることと、その処理を3D LUTとして正しく表現できることは別です。LUT化したい場合は、処理が「同じ入力色なら常に同じ出力色になる」Color mappingとして表現できるかを確認します。

## Analyzer / Apply / File LUTの違い

- **LUT Cube Analyzer**: 加工済みcolor cubeから3D LUT fileを書き出す。
- **LUT Cube Apply**: 加工済みcolor cubeをfile化せず、別の2D Imageへ直接適用する。
- **File LUT**: すでに存在するLUT fileを2D Imageへ適用する。
- **LUT Cube Creator**: AnalyzerやApplyへ渡す基準のcolor cube Imageを生成する。

「fileを作りたい」のか、「comp内でその場で適用したい」のかでAnalyzerとApplyを分けると迷いにくくなります。

## 関連Node

- [LUT Cube Creator](./lut-cube-creator): LUT作成用の既知のcolor cube patternを生成します。
- [LUT Cube Apply](./lut-cube-apply): 加工済みcolor cubeを別Imageへ直接適用します。
- [File LUT](./file-lut): 既存のLUT fileを読み込み、Imageへ適用します。
- [LUTノードのFamily Overview](./): LUT Family全体の役割と選択基準。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual（September 2026）Chapter 107「LUT Nodes」pp.2456–2457を基準にしています。

確認した項目は、single orange Input、Creator由来のImageを入力すること、元のcubeから1:1 LUTを生成できること、Color処理後のcubeをLUT化するworkflow、`Type`、`Filename`、`Write File`、出力formatとして`ALUT3 / ITX / 3DL`が記載されていることです。

ManualはAnalyzerのImage outputを記載していないため、このページではImage outputの存在を断定していません。runtime REGID、Effects Library上のcurrent表示、edition差、各formatの完全な互換性は別verification対象として残しています。
