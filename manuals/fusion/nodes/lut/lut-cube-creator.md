---
title: "LUT Cube Creator"
description: "3D LUT作成用の既知のcolor cube patternをImageとして生成し、AnalyzerやApplyへ渡すNode。"
doc_type: node
term_id: "lut-cube-creator"
term_short: "LUT Cube Creatorは、3D LUTのsampleになるcolor cube patternをImageとして生成するNode。"
verification: partial
aliases: ["LUT Cube Creator", "LCC"]
concepts: ["image-data"]
nodes: ["LUT Cube Creator"]
node_family: "lut"
controls: ["Type", "Size"]
outputs: ["image"]
tasks: ["apply-lut"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-07"
---

# LUT Cube Creator

LUT Cube Creatorは、3D LUTを作るときの基準になる**既知のcolor cube pattern**を2D Imageとして生成するNodeです。

映像素材を受け取って加工するNodeではありません。Creatorが出したpatternへColor処理を加え、その結果を[LUT Cube Analyzer](./lut-cube-analyzer)で解析して3D LUT fileへ書き出すか、[LUT Cube Apply](./lut-cube-apply)へReference Imageとして渡して別のImageへ直接適用します。

[LUTノードのFamily Overview](./)では、File LUTを含む4 Nodeの使い分けを確認できます。

## 入力 / 出力

入力はありません。

出力はcolor cube patternを持つ2D Imageです。このImageは通常の映像ではなく、RGBの組み合わせを規則的に並べたLUT作成用のsampleです。

```text
LUT Cube Creator
      ↓
color cube pattern Image
```

CreatorをGraphの途中に挟んで既存Imageを変換するのではなく、LUT作成用branchのsourceとして使います。

## Type

`Type`は、color cubeのsampleを2D Image上へどのように並べるかを選びます。

- `Horizontal`: color cubeを長い横方向のstripとして配置します。
- `Vertical`: color cubeを長い縦方向のstripとして配置します。
- `Rect`: color cubeを長方形のImageとして配置します。

どのTypeでも目的は同じで、後段のColor処理が各sample colorをどう変えたかをAnalyzerやApplyが読み取れる形にします。

## Size

`Size`はcolor cubeの1辺あたりのsample数、つまりcubeのresolutionを決めます。

DaVinci Resolve 21.1 Reference Manualでは、代表的な設定として33と65が挙げられています。33なら`33 × 33 × 33 = 35,937`個のcolor sampleを持ちます。

Sizeを大きくするとsample密度が上がり、より細かなcolor mappingを記録できます。その代わり、生成するImageと後段処理で必要なmemoryと計算量も増えます。

## 3D LUT fileを作る

Fusion内のColor処理を3D LUT fileとして保存するときは、Creatorから始めてAnalyzerで終わります。

```text
LUT Cube Creator
      ↓
Color Corrector / Curves / Matrix ...
      ↓
LUT Cube Analyzer
      ↓
3D LUT file
```

CreatorのpatternへColor補正やgradeを加えると、各sample colorが処理前後でどう対応したかをAnalyzerが読み取れます。

Creatorを何も加工せずAnalyzerへ接続した場合、Manualでは変化のない1:1 LUTになると説明されています。

## fileへ書かずに別Imageへ適用する

LUT fileを作らず、同じcomposition内で加工済みcubeをそのまま使う場合はLUT Cube Applyへ渡します。

```text
LUT Cube Creator → Color処理 ──────┐
                                  ↓ Reference Image
Target Image ─────────────────→ LUT Cube Apply → Result
```

この構成では、加工済みcubeがLUT Cube ApplyのReference Imageになります。Target ImageはCreatorへ接続せず、LUT Cube Applyのorange Inputへ入れます。

## Fusion外で加工するとき

Creatorの出力を別appへ渡して加工し、Fusionへ戻してAnalyzerやApplyで使うこともできます。

21.1 Manualは、この場合にcolor accuracyを保つため**32-bit floating point**を維持するよう注意しています。bit depthを落とすとsample値が丸められ、作成したLUTへその誤差が入る可能性があります。

## 使うときの注意

LUT Cube Creatorが作るのはLUT用のcolor sampleです。通常の映像素材を見ながらlookを判断するNodeではありません。

実際の素材で見た目を確認したい場合は、加工したcubeを[LUT Cube Apply](./lut-cube-apply)でTarget Imageへ適用するか、[LUT Cube Analyzer](./lut-cube-analyzer)でLUT fileへ書き出して適用します。

## 関連Node

- [LUT Cube Analyzer](./lut-cube-analyzer): 加工済みcolor cubeから3D LUT fileを書き出します。
- [LUT Cube Apply](./lut-cube-apply): 加工済みcolor cubeをfile化せず、別の2D Imageへ直接適用します。
- [File LUT](./file-lut): すでに存在するLUT fileを2D Imageへ適用します。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual（September 2026）Chapter 107 pp.2458–2460を基準にしています。

確認した項目は、入力なし、CreatorがImageを生成すること、Analyzer / Applyとの接続用途、Fusion外で加工するときの32-bit floating point注意、`Type`の`Horizontal / Vertical / Rect`、`Size`、代表値33 / 65、sample密度とmemory / calculation costの関係です。

runtime REGID、Effects Library上のcurrent表示、edition差はこのページでは未確認です。
