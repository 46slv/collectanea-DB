---
title: LUTノード
description: LUT fileの適用、Fusion内での3D LUT生成・適用、Viewer LUTとの違いを目的から選ぶ入口。
doc_type: index
verification: partial
product_scope: fusion
tasks: [lookup-node, lut, color-management]
updated: "2026-10-07"
---

# LUTノード

LUT（Lookup Table）は、**入力された色の値を、あらかじめ用意した別の色の値へ対応付ける表**です。FusionのLUT Familyには、既存LUT fileをImageへ適用するNodeと、3D LUT用のcolor cube Imageを作ってFusion内で適用したり、LUT fileへ書き出したりするNodeがあります。

DaVinci Resolve 21.1 Reference ManualのChapter 107では、次の4 NodeがLUT Familyとして掲載されています。

| やりたいこと | Node |
| --- | --- |
| 既存の1D / 3D LUT fileを2D Imageへ適用する | [File LUT](./file-lut) |
| color cube Imageを作る | [LUT Cube Creator](./lut-cube-creator) |
| 加工したcolor cubeを別のImageへ直接適用する | [LUT Cube Apply](./lut-cube-apply) |
| 加工したcolor cubeから3D LUT fileを書き出す | [LUT Cube Analyzer](./lut-cube-analyzer) |

## LUTで何を記録しているか

LUTは「この入力色が来たら、この出力色へ変える」という対応関係を持ちます。1D LUTは比較的単純な入出力の表、3D LUTはRGBの組み合わせをcolor cubeとしてsampleした表です。

そのため、LUTへ変換しやすいのは、入力pixelの色から出力pixelの色を一意に決められるColor処理です。たとえばcurve、gain、matrix、一定のcolor correctionをまとめて3D LUTへ焼き込む、といった使い方ができます。

一方、Blur、Sharpen、Glow、位置変形、Maskによる局所処理、時間変化など、**同じ入力色でも周囲のpixel・画面上の位置・frameによって結果が変わる処理**は、1つのLUTだけではそのまま表せません。LUT Cube Creator → Color処理 → Analyzerという構成では、color cubeへ加えた処理のうち、color mappingとして表現できる部分をLUT化すると考えると分かりやすくなります。

## すでにLUT fileがある場合

既存のLUTをFusionのnode treeへ組み込むなら[File LUT](./file-lut)を使います。

```text
MediaIn / Loader
      ↓
   File LUT
      ↓
後段のcomposite / Color処理
```

File LUTには、LUTを適用する2D Image用のorange Inputと、適用範囲を制限するEffect Maskがあります。21.1 ManualではFusionのLUT / ALUT、DaVinci ResolveのCUBEなど、対応するLUT fileをpathから読み込む構成が説明されています。

File LUTはLUT file本体をcompositionへ埋め込まず、file pathを参照します。同じLUT fileを複数のFile LUT Nodeから参照している場合は、元fileを更新することで、それらのNodeが参照する内容もまとめて変えられます。

premultiplied Alphaを持つ素材へColor処理する場合は、File LUTの`Pre-Divide/Post-Multiply`も確認します。LUT適用前にRGBをAlphaで割り、処理後に再度Alphaを掛けることで、key edgeや3D renderの半透明部分で不正な加算結果が生じるのを避けるためのControlです。Alpha処理の前提は[プリマルチプライ（Premultiplication）](../../learn/04-compositing/premultiplication)を参照してください。

## Fusion内で3D LUTを作る

3D LUTを作るときは[LUT Cube Creator](./lut-cube-creator)から始めます。Creatorは映像素材を受け取るNodeではなく、3D LUTのsampleになる**既知のcolor cube patternをImageとして生成するNode**です。

```text
LUT Cube Creator
      ↓
Color Corrector / Curves / Matrix ...
      ↓
LUT Cube Analyzer
      ↓
3D LUT file
```

Creator自身にはImage inputがありません。出力したcolor cubeへColor処理を加え、その結果を[LUT Cube Analyzer](./lut-cube-analyzer)へ渡します。Analyzerは、その変化をもとに3D LUT fileを書き出します。

21.1 ManualではCreatorの`Size`として33や65が代表例に挙げられています。Sizeを大きくするとsample密度が増えますが、memory使用量と計算量も増えます。CreatorのImageをFusion外で加工する場合は、color accuracyを保つため32-bit floating pointで扱うようManualに記載されています。

## LUT fileへ書かず、その場で適用する

3D LUTをfileへ書き出す必要がなく、Fusion comp内だけで使いたい場合は[LUT Cube Apply](./lut-cube-apply)を使えます。

```text
LUT Cube Creator → Color処理 ──────┐
                                  ↓ Reference Image
Target Image ─────────────────→ LUT Cube Apply → Result
```

LUT Cube Applyには、LUTを適用するorange Input、加工済みcolor cubeを受け取るgreen Reference Image、必要に応じて適用範囲を制限するEffect Maskがあります。

21.1 ManualではLUT Cube Apply固有のControlsはありません。green Reference Imageの内容を、そのままorange InputのImageへLUTとして適用します。

これは「LUTの見た目を確認してからfileへ書き出したい」「同じcomp内でだけ再利用したい」ときに便利です。[LUT Cube Analyzer](./lut-cube-analyzer)はLUT fileの生成、LUT Cube Applyはcomp内での直接適用という違いがあります。

## Viewer LUTとは別物

Fusion ViewerにもLUT機能がありますが、このFamilyのNodeとは役割が違います。

Viewer LUTは、linear Imageなどを**作業中に見やすい表示へ変換するためのpreview**として使えます。Viewer上の見え方を変えるもので、node treeの後段へ渡すImageそのものをColor処理するNodeではありません。

一方、File LUTやLUT Cube ApplyをFlowへ置くと、そのNodeを通過したImageのpixel値が変わり、後段NodeやMediaOut / Saverへその結果が渡ります。

「作業中のmonitor表示だけを変えたい」のか、「composite結果そのものへLUTを適用したい」のかを先に分けると、Viewer LUTとLUT Nodeを取り違えにくくなります。

## Color Space変換との違い

LUTは有限個のsampleから作られたlookup tableです。[Colorノード](../color/)にあるGamut、Color Space Transform、OpenColorIO系など、数学的な変換やconfigに基づいてColor Spaceを変換するNodeとは仕組みが異なります。

technical LUTでColor Space / gamma変換を行うこと自体はできます。ただし21.1 ManualのColor Management章では、camera-original Imageをlinearへ変換する用途について、File LUTよりGamutやCineonLogなど専用Nodeを使う方が、より正確なgamma / color-space変換になると説明されています。Resolve Color Managementを使うworkflowでは、MediaIn / MediaOut間の変換をprojectのColor Management側で扱う選択肢もあります。

そのため、LUTを見つけたらすぐ適用するのではなく、まずそのLUTが次のどちらなのかを確認します。

- **technical transform**: camera / working / display space間の変換を目的にしたLUT
- **creative look**: contrastや色味など、見た目を作るためのLUT

Color Managementで既に同じ変換を行っている場合、さらにtechnical LUTを重ねると二重変換になることがあります。

## 迷ったときの選び方

1. すでにLUT fileがある → [File LUT](./file-lut)
2. Fusion内のColor処理を3D LUTとして保存したい → [LUT Cube Creator](./lut-cube-creator) → Color処理 → [LUT Cube Analyzer](./lut-cube-analyzer)
3. LUT fileへ書かず、加工したcubeを別Imageへ使いたい → Creator → Color処理 → [LUT Cube Apply](./lut-cube-apply)
4. Viewerでのpreviewだけ変えたい → Viewer LUT。LUT Nodeは置かない
5. Color Spaceを正確に管理したい → LUTだけで決めず、[Colorノード](../color/)やResolve Color Managementも確認する

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual（September 2026）を基準にしています。

- Chapter 107「LUT Nodes」pp.2453–2461 — File LUT、LUT Cube Analyzer、LUT Cube Apply、LUT Cube Creator、各Input、主要Control、cube workflow、common Settings
- Chapter 68「Using Viewers」pp.1482–1487 — Viewer LUT / Buffer LUT、1D / 3D LUTの基本、preview用途、Viewer上のLUT処理
- Chapter 76「Managing Color for Visual Effects」pp.1656–1659 — File LUTとdedicated color transform、Viewer LUT、Resolve Color Managementとの関係

ここではFamily全体の役割と選択基準を整理しています。各LUT formatの完全な対応一覧、runtime REGID、Effects Library上のcurrent表示、edition差は別verification対象として残しています。
