---
title: Matte / Keyingノード
description: Alpha処理、green/blue screen keying、AI / ID matte、Clean Plate、Relightを目的から選ぶ入口。
doc_type: index
verification: partial
product_scope: fusion
tasks: [lookup-node, keying, matte, alpha]
updated: "2026-10-05"
---

# Matte / Keyingノード

## Alpha state

- [Alpha Divide](./alpha-divide) / [Alpha Multiply](./alpha-multiply) — premultiplied ↔ straight RGB
- [Matte Control](./matte-control) — 既存Alphaを整える

## Keyer

- [Delta Keyer](./delta-keyer) — green / blue screenの主要keyer
- [Primatte 5](./primatte-5) — Primatte algorithm。Fusion Studio専用
- [Ultra Keyer](./ultra-keyer) — pre-matte + color-difference
- [Chroma Keyer](./chroma-keyer) — 任意色
- [Luma Keyer](./luma-keyer) — luminance
- [Difference Keyer](./difference-keyer) — clean backgroundとの差分

## 補助

- [Clean Plate](./clean-plate) — screen背景色を再構成
- [Cryptomatte](./cryptomatte) — EXR embedded ID matte
- [Magic Mask](./magic-mask) — Neural Engineによるsubject mask
- [Relight](./relight) — surface解析から疑似light

[Depth Map](../effects-film/depth-map)はAI depth map生成として関連します。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 109を基に整理しています。
