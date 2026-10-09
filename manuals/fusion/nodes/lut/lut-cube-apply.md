---
title: "LUT Cube Apply"
description: "LUT Cube Creator由来の加工済みcolor cubeをReference Imageとして使い、その色変換を別の2D Imageへ直接適用するNode。"
doc_type: node
term_id: "lut-cube-apply"
term_short: "LUT Cube Applyは、加工済みcolor cubeをfile化せず別のImageへ直接適用するNode。"
verification: partial
aliases: ["LUT Cube Apply", "LCP"]
concepts: ["image-data"]
nodes: ["LUT Cube Apply"]
node_family: "lut"
inputs: ["image"]
outputs: ["image"]
tasks: ["apply-lut"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-07"
---

# LUT Cube Apply

LUT Cube Applyは、[LUT Cube Creator](./lut-cube-creator)から始めたcolor cube Imageを**色変換の参照（Reference Image）**として使い、その変換を別の2D Imageへ適用するNodeです。

[LUT Cube Analyzer](./lut-cube-analyzer)のように3D LUT fileを書き出す必要はありません。CreatorのcubeへColor処理を加え、そのImageをそのままFusion composition内でLUTとして使えます。

[LUTノードのFamily Overview](./)では、Creator / Apply / Analyzer / File LUTの使い分けをまとめています。

## 入力と出力

21.1 Manualでは、3つの入力が記載されています。

- **Input**（orange）: LUTを適用したい2D Image。
- **Reference Image**（green）: LUT Cube Creatorの出力、またはそのcolor cubeへColor処理を加えたImage。
- **Effect Mask**（blue、任意）: LUTを適用する範囲を制限するMask。

出力は、Reference Imageが表す色変換をInputへ適用した2D Imageです。

```text
Target Image ─────────────────────────┐
                                     ↓ Input
LUT Cube Creator → Color処理 ───→ LUT Cube Apply → Result
                                     ↑ Reference Image
```

Target ImageはCreator側へ接続しません。通常の映像はorange Inputへ、LUTの基準になる加工済みcubeはgreen Reference Imageへ接続します。

## 何が起きるか

LUT Cube Creatorは、RGBの組み合わせを規則的に並べた既知のcolor cube patternを生成します。そのpatternへColor処理を加えると、各sample colorに「処理前のRGB → 処理後のRGB」という対応ができます。LUT Cube Applyは、その対応をReference Imageから読み取り、orange InputのImageへ適用します。

Creatorの出力を何も加工せずReference Imageへ接続した場合、21.1 Manualでは1:1の結果になると説明されています。つまり、LUT Cube Applyを通してもInputの色は変化しません。

```text
LUT Cube Creator ────────────────→ Reference Image
Target Image ───────────────────→ Input
                                  ↓
                           LUT Cube Apply
                                  ↓
                       Target Imageと同じ色
```

この1:1構成は、接続が正しいかを確認するときにも使えます。

## 固有Controlはない

DaVinci Resolve 21.1 Reference Manualでは、LUT Cube Apply固有のControlsはありません。色変換の内容はInspectorのparameterで作るのではなく、green Reference Imageへ何を接続するかで決まります。

たとえばCreatorのcubeへColor CorrectorやCurvesなどを通した場合、その処理後のcubeがReference Imageになります。LUT Cube Apply自体でlookを編集するのではなく、Reference Imageを作るbranch側でColor処理を組み立てます。

## Effect Maskで適用範囲を限定する

blue Effect MaskへMaskを接続すると、LUTの適用範囲を制限できます。

```text
LUT branch ───────────────→ Reference Image
Target Image ─────────────→ Input
Ellipse / Polygon Mask ───→ Effect Mask
                             ↓
                      LUT Cube Apply
```

21.1 Manualでは、Effect Maskはpolyline、基本Shape、Paint stroke、他のtoolから作ったbitmapなどを受け取れると説明されています。また、Effect Maskはtoolの処理後に適用されます。

「Image全体へlookを適用する」のではなく、人物、画面内の一部、特定領域だけへ限定したい場合に使えます。

## 主な用途

### LUT fileを書き出す前に実写Imageで確認する

Creatorから作ったColor処理が実際の素材へどう作用するか確認できます。

```text
LUT Cube Creator → Color処理 ──────┐
                                  ↓ Reference Image
Footage ───────────────────────→ LUT Cube Apply → Preview
```

見た目を確認して問題なければ、同じ加工済みcubeを[LUT Cube Analyzer](./lut-cube-analyzer)へ渡して3D LUT fileとして書き出せます。

### composition内だけで色変換を再利用する

LUT fileを作る必要がなく、同じcomposition内でColor mappingを使うだけなら、加工済みcubeを直接Reference Imageとして使えます。file pathの管理や書き出しを挟まず、Creator branchとTarget Image branchを同じFlow内で完結できます。

### Mask付きで限定的に適用する

Effect Maskを使えば、Reference Imageで定義したColor mappingをImage全体ではなく一部だけへ適用できます。ただし、MaskそのものはLUTへ焼き込まれる情報ではありません。MaskはLUT Cube Applyでの適用範囲を制限しています。

## LUT Cube Analyzerとの違い

[LUT Cube Analyzer](./lut-cube-analyzer)もCreator由来の加工済みcolor cubeを受け取りますが、成果物が異なります。

- **LUT Cube Apply**: color cubeをFusion内で直接使い、別のImageへ色変換を適用する。
- **LUT Cube Analyzer**: color cubeを解析し、3D LUT fileとしてdiskへ書き出す。

「いまのcompositionで使う」のか、「fileとして保存して別環境へ渡す」のかで選びます。

## File LUTとの違い

[File LUT](./file-lut)は、すでに存在するLUT fileを読み込んでImageへ適用します。LUT Cube Applyはfileを読み込むのではなく、Fusion内にあるcolor cube ImageをReferenceとして使います。

- LUT fileがすでにある → File LUT
- Creatorから作ったcubeをその場で使う → LUT Cube Apply
- Creatorから作ったcubeをfile化する → LUT Cube Analyzer

## 挙動と注意点

Reference Imageには、通常の映像ではなく、LUT Cube Creatorが生成したcolor cube、またはそのcolor cubeを加工したImageを使います。

LUTで表現できるのは基本的に入力色と出力色の対応です。Blur、位置変形、時間変化など、周囲のpixel・画面位置・frameへ依存する処理は、通常の3D LUTとしてそのまま再現できません。Creator branchへ何でも追加すれば同じ処理をTarget Imageへ移せる、という意味ではありません。

## 関連Node

- [LUT Cube Creator](./lut-cube-creator): LUT作成用の既知のcolor cube patternを生成します。
- [LUT Cube Analyzer](./lut-cube-analyzer): 加工済みcolor cubeから3D LUT fileを書き出します。
- [File LUT](./file-lut): 既存のLUT fileを読み込み、Imageへ適用します。
- [LUTノードのFamily Overview](./): LUT Family全体の役割と選択基準。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual（September 2026）Chapter 107「LUT Nodes」pp.2457–2458を基準にしています。

確認した項目は、green Reference Image / orange Input / blue Effect Maskの3入力、Creator由来のImageをReferenceとして使うこと、未加工のCreator Imageでは1:1結果になること、加工済みcubeをfile化せず直接適用できること、Effect Maskの適用、LUT Cube Apply固有のControlsがないことです。

runtime REGID、Effects Library上のcurrent表示、edition差、特定Color処理をLUT化したときの実機結果は、このページでは別verification対象として残しています。
