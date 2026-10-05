---
title: Luma Keyer
description: Luminanceなど選択したchannelの値をThresholdで分け、Alpha matteを作るChannel Keyer。
doc_type: node
term_id: luma-keyer
term_short: "Luma Keyerは、明るさなどのchannel値からAlpha matteを作るKeyer。"
verification: partial
aliases: [Luma Keyer, LKy]
concepts: [image-data, alpha, premultiplication]
nodes: [Luma Keyer]
node_family: matte-keying
controls: [Channel, Threshold, Filter, Blur, Clipping Mode, Contract/Expand, Gamma, Invert, Post-Multiply Image]
inputs: [image, mask, mask, mask]
outputs: [image]
tasks: [create-matte, luminance-key, channel-key]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-05"
---

# Luma Keyer

Luma Keyerは、Imageの明るさを基準にAlpha matteを作るNodeです。名前はLuma Keyerですが、21.1 ManualではRed / Green / Blue / Alpha / Hue / Luminance / Saturation / Depthから判定に使うchannelを選べます。

## 役割

色そのものを指定する[Chroma Keyer](./chroma-keyer)とは違い、選んだchannelの値をThresholdで分けて透明・不透明を決めます。Luminanceを使えば、暗い部分を透明にして明るい部分を残すmatteを作れます。

## 入力

### Input

オレンジ色のInputへ、matteの元にする2D Imageを接続します。

### Garbage Matte

Garbage MatteへMaskを接続すると、その範囲を透明へできます。

### Solid Matte

Solid MatteへMaskを接続すると、その範囲を不透明へできます。

### Effect Mask

Effect MaskへMaskを接続すると、Luma Keyerの処理を適用する範囲を限定できます。21.1 ManualではNode処理の後に適用されると説明されています。

## 出力

選択したchannelから作ったAlphaを含むImageを出力します。Manualの基本例では、この出力をMergeのEffect Maskへ接続して、明暗差から合成範囲を作っています。

    Source Image → Luma Keyer → Merge Effect Mask

Post-Multiply Imageを有効にすると、生成したAlphaをRGBへ乗算します。21.1 Manualでは通常有効で、既定もOnと記載されています。

## Channel

ChannelではRed、Green、Blue、Alpha、Hue、Luminance、Saturation、Depth (Z-buffer)から基準値を選べます。

通常はLuminanceで明暗差を使い、別channelの方が対象と背景を分けやすい場合は切り替えて比較します。

## Threshold

Thresholdには下限と上限があります。

- 下限より低い値は黒、つまりtransparent側
- 上限より高い値は白、つまりopaque側
- その間はgrayscale matteとして半透明

逆方向のmatteが必要ならInvertで透明・不透明を反転できます。

## matteを整える

FilterとBlurでmatte edgeを柔らかくできます。Contract/Expandは半透明edgeを縮小・拡張し、Gammaは中間Alphaをopaque側またはtransparent側へ寄せます。

大きなBlurを使うときはClipping Modeも確認します。Frame / Domain / NoneでDomain of Definition外の扱いが変わります。

## 主な用途

- 明るい文字やlight elementをmatteとして取り出す
- 暗い背景上の明るい素材をEffect Maskとして再利用する
- RGBやSaturationなど、Luminance以外のchannel差からmatteを作る
- Depth channelを持つImageからZ値の範囲を選ぶ

## 最小構成

    MediaIn → Luma Keyer → MergeのEffect Mask

最初はChannelをLuminanceにし、明暗差が大きい素材でThresholdの両端を動かすと挙動を確認しやすくなります。

## Keyerの選び分け

- **Luma Keyer**: channel値の大小をThresholdで分ける
- **Chroma Keyer**: Viewerで選んだ色域を基準に抜く
- **Difference Keyer**: subject入りshotとclean backgroundの差を基準にmatteを作る

## 関連Node

- [Chroma Keyer](./chroma-keyer)
- [Difference Keyer](./difference-keyer)
- [Matte Control](./matte-control)
- [Merge](../compositing/merge)

## バージョンと検証状況

DaVinci Resolve 21.1 Reference Manual Chapter 109 pp.2530–2533で、Input / Garbage Matte / Solid Matte / Effect Mask、Channel、Threshold、Filter / Blur、Contract/Expand、Gamma、Invert、Post-Multiply Imageを確認しています。

Manualで確認できないruntime REGID、実機上の端子表示、処理性能は断定していません。
