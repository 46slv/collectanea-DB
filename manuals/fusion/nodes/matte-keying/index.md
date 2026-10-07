---
title: Matte / Keyingノード
description: Alpha処理、screen keying、channel key、difference key、AI / ID matteを目的から選ぶ入口。
doc_type: index
verification: partial
product_scope: fusion
tasks: [lookup-node, keying, matte, alpha]
updated: "2026-10-05"
---

# Matte / Keyingノード

Matte / Keying familyは、素材のどこを残すかをAlphaへ変換したり、すでにあるAlphaを整えたりするNode群です。まず、何を手掛かりに分離できるかを決めます。

## Keyerの選び方

- **green / blue screen**: [Delta Keyer](./delta-keyer)を第一候補にし、Fusion Studioでは[Primatte](./primatte-5)も比較します。
- **任意の色**: [Chroma Keyer](./chroma-keyer)でViewer上の色域を選びます。
- **明るさやchannel値**: [Luma Keyer](./luma-keyer)でLuminance、RGB、Alpha、Hue、Saturation、Depth等からThresholdを作ります。
- **clean backgroundとの差**: [Difference Keyer](./difference-keyer)で、被写体入りshotと背景だけのImageを比較します。
- **作成済みAlphaの整理**: [Matte Control](./matte-control)でSolid / Garbage Matte、Threshold、Gamma等を調整します。

Chroma / Luma / Differenceは、それぞれ「色」「channel値」「別Imageとの差」を基準にmatteを作ります。

## Alpha state

- [Alpha Divide](./alpha-divide) / [Alpha Multiply](./alpha-multiply) — premultiplied ↔ straight RGB
- [Matte Control](./matte-control) — 既存Alphaを整える

## Screen keyer

- [Delta Keyer](./delta-keyer) — green / blue screenの主要Keyer
- [Primatte](./primatte-5) — Primatte algorithm。Fusion Studio専用
- [Ultra Keyer](./ultra-keyer) — pre-matteとcolor-differenceを組み合わせるKeyer
- [Chroma Keyer](./chroma-keyer) — 任意色を選ぶ汎用Keyer

## Channel / reference keyer

- [Luma Keyer](./luma-keyer) — Luminanceなど選んだchannel値からmatteを作る
- [Difference Keyer](./difference-keyer) — clean backgroundとの差からmatteを作る

## 補助

- [Clean Plate](./clean-plate) — screen背景色を再構成
- [Cryptomatte](./cryptomatte) — EXR embedded ID matte
- [Magic Mask](./magic-mask) — Neural Engineによるsubject mask
- [Relight](./relight) — surface解析から疑似light

[Depth Map](../effects-film/depth-map)はAI depth map生成として関連します。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 109を基に整理しています。Chroma Keyer pp.2506–2511、Difference Keyer pp.2527–2530、Luma Keyer pp.2530–2533を今回の選択案内へ反映しました。
