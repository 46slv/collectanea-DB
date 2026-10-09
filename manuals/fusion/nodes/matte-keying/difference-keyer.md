---
title: Difference Keyer
description: 被写体入りImageとclean backgroundを比較し、画素差からforeground matteを作るKeyer。
doc_type: node
term_id: difference-keyer
term_short: "Difference Keyerは、被写体入りshotと背景だけのImageとの差からmatteを作るKeyer。"
verification: partial
aliases: [Difference Keyer, DFK]
concepts: [image-data, alpha, premultiplication]
nodes: [Difference Keyer]
node_family: matte-keying
controls: [Threshold, Filter, Blur, Clipping Mode, Contract/Expand, Gamma, Invert, Post-Multiply Image]
inputs: [image, image, mask, mask, mask]
outputs: [image]
tasks: [create-matte, difference-key, clean-plate]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-05"
---

# Difference Keyer

Difference Keyerは、被写体が写ったImageと、同じ背景だけを撮ったclean backgroundを比較し、両者の違いからAlpha matteを作るNodeです。green / blue screenがなくても使えますが、背景側の条件が2枚でよく一致していることが重要です。

## 役割

色や明るさの絶対値ではなく、2枚のImageの「差」をforeground候補として扱います。

背景だけのImageとほぼ同じpixelはtransparent側へ、差が大きいpixelはopaque側へ寄せます。そのため、固定cameraでclean backgroundを用意できるshotでは有効ですが、camera位置が少し変わるだけでも背景の構造自体が差として出やすくなります。

21.1 Manualも、Difference Keyerだけで完全なkeyを作るより、rough matteを作って他のNodeと組み合わせる使い方を案内しています。

## 入力

### Background

オレンジ色のBackgroundへ、被写体がいない背景だけの2D Imageを接続します。

### Foreground

緑色のForegroundへ、同じ背景上に被写体が写った2D Imageを接続します。

### Garbage Matte

Garbage MatteへMaskを接続すると、その領域をtransparent側へ除外できます。比較する必要がないframe端や不要物を先に切る用途に使えます。

### Solid Matte

Solid MatteへMaskを接続すると、その領域をopaque側へ固定できます。

### Effect Mask

21.1 Manualには、Difference Keyerの処理範囲を限定する任意のEffect Maskも記載されています。処理後に適用されます。

## 出力

BackgroundとForegroundの差から作ったAlpha matteを含む結果を出力します。単独で最終合成へ使うだけでなく、[Matte Control](./matte-control)などへ渡してrough matteを整える使い方ができます。

Post-Multiply Imageを有効にすると、生成したAlphaをRGBへ乗算してpremultiplied状態にします。

## Thresholdで差をmatteへ変える

Thresholdの下限と上限で、2枚のImageの差をどのAlphaへ変換するか決めます。

- 下限より小さい差は黒、つまりtransparent側
- 上限より大きい差は白、つまりopaque側
- その間の差はgrayscale matte

背景の細かな差までforegroundとして拾ってしまう場合は、Thresholdを見ながら不要な差を黒へ寄せます。ただしthresholdだけで背景の位置ずれを直すことはできません。

## matteを整える

FilterとBlurでmatte edgeを柔らかくできます。Contract/Expandは半透明部分を縮小・拡張し、Gammaは中間Alphaを調整します。逆向きのmatteが必要ならInvertを使います。

Blurを大きくしたときにedgeが切れる場合は、Clipping ModeのFrame / Domain / Noneも確認します。

## 主な用途

- 固定cameraで撮ったclean backgroundと本番shotを比較し、被写体のrough matteを作る
- blue / green screenを使えない素材で、別のkeyerやMaskを組み合わせるための初期matteを作る
- Garbage Matteで比較範囲を絞り、背景との差が明確な領域だけを抽出する

## 最小構成

    Clean Background ─→ Background
                         Difference Keyer → Matte Control → Merge
    Shot with Subject ─→ Foreground
    B-Splineなど ─────→ Garbage Matte

Manualの基本例でも、被写体入りshotとclean backgroundを比較し、B-SplineでDifference Keyerが扱う範囲を限定しています。

## Chroma / Luma Keyerとの違い

- **Difference Keyer**: clean backgroundとの差を使う
- **Chroma Keyer**: 選択した色域を使う
- **Luma Keyer**: Luminanceなど選んだchannel値を使う

背景plateを用意できるか、色差が明確か、明暗差が明確かで最初のKeyerを選びます。

## 挙動と注意点

Difference Keyerは2枚のpixel差を使うため、camera位置がずれると、本来backgroundである壁や細かな模様までmatteへ混ざります。Manualではこの制約を明示し、Difference Keyerをrough matte作成に使う例を示しています。

21.1 Manual本文には「four inputs」と書かれている一方、直後の入力説明ではBackground / Foreground / Garbage Matte / Solid Matte / Effect Maskの5種類が列挙されています。本ページでは個々の接続名はManualどおり記載し、runtime上の厳密な端子数は実機確認へ残します。

## 関連Node

- [Chroma Keyer](./chroma-keyer) — 任意色を基準にmatteを作る
- [Luma Keyer](./luma-keyer) — channel値を基準にmatteを作る
- [Matte Control](./matte-control) — rough matteを後段で整える
- [Delta Keyer](./delta-keyer) — green / blue screen向け

## バージョンと検証状況

DaVinci Resolve 21.1 Reference Manual Chapter 109 pp.2527–2530で、Background / Foreground、Garbage / Solid / Effect Mask、Threshold、Filter / Blur、Contract/Expand、Gamma、Invert、Post-Multiply Imageを確認しています。

Manualで確認できないruntime REGID、実機上の厳密な端子数、処理性能は断定していません。
