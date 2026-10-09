---
title: Chroma Keyer
description: Viewerで選んだ任意の色域からAlpha matteを作り、不要な色を透明にする汎用Keyer。
doc_type: node
term_id: chroma-keyer
term_short: "Chroma Keyerは、選んだ色域を透明にしてAlpha matteを作るKeyer。"
verification: partial
aliases: [Chroma Keyer, CKy]
concepts: [image-data, alpha, premultiplication]
nodes: [Chroma Keyer]
node_family: matte-keying
controls: [Key Type, Color Range, Lock Color Picking, Soft Range, Spill Color, Spill Suppression, Spill Method, Fringe Gamma, Fringe Size, Fringe Shape, Filter, Blur, Clipping Mode, Contract/Expand, Gamma, Threshold, Restore Fringe, Invert Matte, Post-Multiply Image]
inputs: [image, mask, mask, mask]
outputs: [image]
tasks: [create-matte, keying, despill]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-05"
---

# Chroma Keyer

Chroma Keyerは、2D Imageから不要な色を選び、その色域を透明にしてAlpha matteを作るNodeです。green / blueに限らず任意の色を選べるため、特定色を基準に単純なkeyを作りたいときに使います。

## 役割

Viewer上で抜きたい色を選ぶと、そのselectionを基準にAlphaが作られます。元のImageを別素材へ置き換えるのではなく、選んだ色が透明になるようにImageのAlphaを更新します。

21.1 Manualでは、blue / green screenには専用の調整を持つ[Delta Keyer](./delta-keyer)または[Primatte](./primatte-5)を先に検討するよう案内しています。Chroma Keyerは、screen colorが典型的なblue / greenではない場合や、任意色を直接選んでkeyを作りたい場合に向きます。

## 入力

### Input

オレンジ色のInputへ、色を抜きたい2D Imageを接続します。

### Garbage Matte

灰色のGarbage MatteへMaskを接続すると、その範囲を強制的に透明へできます。撮影フレーム端の機材など、色選択だけでは消せない領域を先に除外するときに使えます。

### Solid Matte

白色のSolid MatteへMaskを接続すると、その範囲を強制的に不透明へできます。抜きたい色と似た色が被写体側にもあり、その領域だけ残したいときに使います。

### Effect Mask

青色のEffect MaskへMaskを接続すると、Chroma Keyerの処理を適用する範囲そのものを限定できます。ManualではEffect MaskはNode処理の後に適用されると説明されています。

## 出力

選択した色域から生成したAlphaを含む2D Imageを出力します。[Merge](../compositing/merge)のForegroundへ接続すれば、透明になった部分からBackgroundを見せられます。

Post-Multiply Imageを有効にすると、生成したAlphaをRGBへ乗算してpremultiplied状態にします。21.1 Manualでは通常有効で、既定もOnと記載されています。

## 色を選ぶ

### Key Type

- **Chroma**: 選択した色域のRGB値を基準にmatteを作ります。
- **Color**: 選択した色域のHueを基準にmatteを作ります。

Nodeを選択した状態でViewer上の色をドラッグして指定すると、Color Rangeがそのselectionに合わせて更新されます。

Lock Color Pickingを有効にするとViewerからの色追加を止められるため、selectionを決めた後の誤操作を防げます。Soft Rangeはselectionへ近い色を追加して境界を緩め、Reset Color Rangesは色選択だけをリセットします。

## Spillとedgeを整える

screen colorが被写体のedgeへ反射している場合は、Image tabのSpill Color、Spill Suppression、Spill Methodで色かぶりを抑えます。Fringe Gamma / Fringe Size / Fringe Shapeと色補正Controlは、半透明edgeに残った元背景色を整えるために使います。

Matte tabでは、Blurでedgeを柔らかくし、Contract/Expandで半透明部分を縮小・拡張できます。Gammaは半透明領域のAlphaを調整し、Thresholdは低い値を透明、高い値を不透明へ寄せます。髪などの細いedgeを削りすぎた場合はRestore Fringeが候補になります。

## 主な用途

- 任意色の背景を透明にし、別のBackgroundへ合成する
- ロゴやgraphicの単色背景を抜いて、映像上へ重ねる
- blue / green以外の色を基準に簡単なmatteを作る
- Garbage / Solid Matteを併用し、色だけでは判断しにくい領域を手動で保護・除外する

## 最小構成

    MediaIn → Chroma Keyer → Merge → MediaOut
                                ↑
                         Background

まずViewerで抜きたい色を選び、Mergeへ接続してedgeとspillを実際の合成背景上で確認します。

## 挙動と注意点

Chroma Keyerは「指定色に近いpixel」を基準にするため、被写体と背景で色が重なるshotでは色選択だけで完全に分離できません。その場合はSolid / Garbage Matteを併用するか、green / blue screenならDelta Keyer / Primatteを比較します。

MatteをBlurする場合、Clipping ModeによってDomain of Definition外の扱いが変わります。大きなBlurでedgeが不自然に切れる場合は、Frame / Domain / Noneの違いも確認します。

## 関連Node

- [Delta Keyer](./delta-keyer) — green / blue screen向けの主要Keyer
- [Primatte](./primatte-5) — green / blue screen用の別algorithm
- [Luma Keyer](./luma-keyer) — 色ではなく明るさやchannel値からmatteを作る
- [Matte Control](./matte-control) — 作成済みAlphaを後段で調整する
- [Merge](../compositing/merge) — keyed ImageをBackgroundへ合成する

## バージョンと検証状況

DaVinci Resolve 21.1 Reference Manual Chapter 109 pp.2506–2511で、Input / Garbage Matte / Solid Matte / Effect Mask、Chroma / Color selection、spill処理、Matte controls、Post-Multiply Imageを確認しています。

このページではManualで確認できないruntime REGID、実機上の端子表示、処理性能は断定していません。
