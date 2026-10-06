---
title: "Dent"
description: "中心と範囲を指定して2D Imageへ円形の膨らみ・凹みを作るWarp Node。"
doc_type: node
term_id: "dent"
term_short: "Dentは、中心と範囲を指定してImageへ円形の変形を作るNode。"
verification: partial
aliases: ["Dent", "Dnt"]
concepts: ["image-data"]
nodes: ["Dent"]
node_family: "warp"
controls: ["Type", "Center", "Size", "Strength"]
inputs: ["image", "mask"]
outputs: ["image"]
tasks: ["warp-image"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-05"
---

# Dent

Dentは、Imageの指定した位置を中心に、円形の膨らみ・凹みなどを作るNodeです。6種類のTypeを切り替え、Center、Size、Strengthで変形の位置・範囲・強さを調整します。

## 入力と出力

オレンジ色のInputへ変形したい2D Imageを接続します。青色のEffect MaskへMaskを接続すると、効果を必要な領域だけに限定できます。出力はDentの設定に従って変形された2D Imageです。

## 主な設定項目

### Type

21.1 Manualでは6種類のDent filterが説明されています。

- **Dent 1** — bulge状の変形
- **Kaleidoscope** — Dentをmirrorして反転を加える
- **Dent 2** — displacement系の変形
- **Dent 3** — deform系の変形
- **Cosine Dent** — 中心へ集まる形の変形
- **Sine Dent** — 滑らかで丸い変形

### Center X / Y

効果の中心位置を決めます。

### Size

Dentが影響する範囲を調整します。animationすると効果範囲を広げたり縮めたりできます。

### Strength

Dent全体の変形量を調整します。

## 主な用途

- Imageの一部を局所的に膨らませる
- 円形の変形をanimationし、pulse状のmotion graphicsを作る
- Kaleidoscope Typeでmirrorを含むdistortionを作る
- 背景素材へ局所的な変形を加える

## 最小構成

    MediaIn → Dent → MediaOut

Sizeを小さめにして影響範囲を確認し、Centerを対象へ移動します。その後StrengthとTypeを変え、変形の違いを比較します。

## Drip / Vortex / Displaceとの違い

- **Dent** — 中心と範囲を指定し、単発の円形変形を作る
- **Drip** — rippleの形・周波数・Phaseで波紋状に歪ませる
- **Vortex** — 指定範囲を渦状に回転させる
- **Displace** — 別Imageのchannel値を変位mapとして使う

別のmap Imageを用意せず、局所的な円形warpを作りたい場合はDentを先に検討します。

## 挙動と注意点

21.1 ManualではDentの各parameterをkeyframe可能としています。Center、Size、Strengthを動かすことで、移動・拡大するwarpを作れます。

## 関連Node

- [Drip](./drip)
- [Vortex](./vortex)
- [Displace](./displace)
- [Coordinate Space](./coordinate-space)

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 123 pp.2965–2966で、Input / Effect Mask、6種類のDent Type、Center、Size、Strength、Basic Node Setupを確認しました。

全既定値・数値範囲、内部REGID、実機performanceは未確認です。
