---
title: Matte Control
description: 2つのImageのchannelをAlphaへ組み合わせ、既存matteの形、Solid / Garbage領域、spillまで後段で調整するNode。
doc_type: node
term_id: matte-control
term_short: "Matte Controlは、作成済みAlphaや別Imageのchannelを組み合わせてmatteを整えるNode。"
verification: partial
aliases: [Matte Control, MAT]
concepts: [image-data, alpha, premultiplication, matte, compositing]
nodes: [Matte Control]
node_family: matte-keying
controls: [Combine, Combine Operation, Filter, Blur, Clipping Mode, Contract/Expand, Gamma, Threshold, Restore Fringe, Invert Matte, Post-Multiply Image, Spill Color, Spill Suppression, Spill Method, Fringe Gamma, Fringe Size, Fringe Shape]
inputs: [image, image, mask, mask, mask]
outputs: [image]
tasks: [matte, alpha, combine-alpha, refine-matte, despill]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-05"
---

# Matte Control

Matte Controlは、新しくscreen keyを作るためのKeyerではなく、すでにImageやMaskが持っているchannelを組み合わせてAlphaを作り直すNodeです。別ImageのAlphaやRGB channelをBackground側のAlphaへ移したり、作成済みmatteのedge、Solid / Garbage領域、spillを後段で調整したりできます。

## 役割

たとえば、別branchで作った白黒matteをForegroundへ接続し、そのAlphaをBackground Imageへコピーできます。結果はBackgroundのRGBを保ちながら、Alphaだけを別のsourceから受け取ったImageになります。

Keyer内部の調整だけではGraphが複雑になる場合に、Alphaの合成と仕上げをMatte Controlへ分けると、どこでmatteを作り、どこで整えているかを追いやすくなります。

## 入力

### Background

オレンジ色のBackgroundへ、最終的にRGBとAlphaを持たせたい2D Imageを接続します。

### Foreground

緑色のForegroundへ、Background側へ適用したいAlphaまたはRGB channelを持つ2D Imageを接続します。どのchannelを使うかはCombineで選びます。

### Garbage Matte

灰色のGarbage MatteへMaskを接続すると、その範囲をtransparentへできます。

### Solid Matte

白色のSolid MatteへMaskを接続すると、その範囲を完全にopaqueへできます。

### Effect Mask

21.1 Manualには、Matte Controlの処理範囲を限定する任意のEffect Maskも記載されています。

Manual本文は「four inputs」と説明した直後にBackground / Foreground / Garbage Matte / Solid Matte / Effect Maskの5種類を列挙しています。本ページではdocumented connectionの役割をすべて記載し、runtime上で見える厳密な端子数は実機確認へ残します。

## 出力

Background Imageを基礎に、指定したchannel合成とmatte調整を反映した2D Imageを出力します。[Merge](../compositing/merge)のForegroundへ接続すれば、更新後のAlphaを合成に使えます。

## CombineでAlphaのsourceを決める

CombineではForegroundのどのchannelをBackground Alphaへ使うか、またはBackground Alphaを強制的にsolid / clearへするかを選びます。

- **Combine Red / Green / Blue**: Foregroundの選択channelをBackground Alphaへ組み合わせる
- **Combine Alpha**: Foreground AlphaをBackground Alphaへ組み合わせる
- **Solid**: Background Alphaを完全にopaqueへする
- **Clear**: Background Alphaを完全にtransparentへする
- **None**: ForegroundをAlpha合成へ使わない

Combine Operationでは、Foreground sourceとBackground Alphaの関係を選びます。CopyならForeground sourceでBackground Alphaを置き換え、Add / Subtract / Maximum / Minimumなどでは2つの値を演算して新しいAlphaを作ります。Merge Over / Merge Underも選択できます。

## matteの形を整える

Matte tabでは、channelを組み合わせた後のAlphaを調整できます。

- **Blur**: matte edgeを柔らかくする
- **Contract/Expand**: matteを縮小・拡大する
- **Gamma**: 半透明領域のAlphaを調整する
- **Threshold**: 低い値をtransparent、高い値をopaqueへ寄せる
- **Restore Fringe**: keyで削れたhair等のedgeを戻す
- **Invert Matte**: opaque / transparentを反転する

Solid / Garbage MatteもここでAlphaへ反映されます。Manualでは、Keyerで使ったものと逆方向のGarbage Matteを後から追加したい場合などに、Matte ControlをKeyerの後段へ置く例が説明されています。

## spillを後段で調整する

Spill tabでは、matte edgeに残ったscreen colorを調整できます。Spill Color、Spill Suppression、Spill Methodに加え、Fringe Gamma / Size / Shapeと色補正Controlを使えます。

つまりMatte ControlはAlphaだけを扱うNodeではなく、key後のedge colorまで同じ場所で仕上げられます。

## 主な用途

- 別branchで作ったAlphaを、合成したいImageへコピーする
- Red / Green / Blue channelのいずれかをAlpha sourceとして利用する
- Keyerの後段でThreshold、Gamma、Blur、Contract/Expandを使いmatteを整える
- Solid / Garbage Matteを後から追加し、残したい領域と消したい領域を明示する
- key後のedgeに残ったgreen / blue spillを補正する

## 最小構成

Alphaを別Imageへコピーする最小例です。

    Image to Composite ─→ Background
                          Matte Control → Merge
    Matte Source ───────→ Foreground

CombineをCombine Alpha、Combine OperationをCopyにすると、Foreground側のAlphaをBackground側へ移す構成になります。

Keyerの結果をそのまま仕上げるだけなら、Keyer出力をBackgroundへ接続し、Foregroundを使わずにmatte controlsやSolid / Garbage Matteを適用する構成も取れます。

## premultiplicationの注意

Post-Multiply Imageを有効にすると、結果のRGBへAlphaを乗算します。21.1 Manualでは通常有効で、既定もOnと記載されています。

無効にした結果はpremultiplied Imageとして扱えなくなるため、後段のMerge設定との組み合わせを確認する必要があります。

## 関連Node

- [Delta Keyer](./delta-keyer) — green / blue screenからAlphaを作る
- [Chroma Keyer](./chroma-keyer) — 任意色からAlphaを作る
- [Luma Keyer](./luma-keyer) — channel値からAlphaを作る
- [Difference Keyer](./difference-keyer) — clean backgroundとの差からAlphaを作る
- [Merge](../compositing/merge) — Matte Controlで整えたImageを合成する

## バージョンと検証状況

DaVinci Resolve 21.1 Reference Manual Chapter 109 pp.2539–2544で、Background / Foreground、Garbage / Solid / Effect Mask、Combine / Combine Operation、matte controls、Post-Multiply Image、Spill tabを確認しています。

Manualで確認できないruntime REGID、実機上の厳密な端子数、処理性能は断定していません。
