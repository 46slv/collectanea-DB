---
title: Color Space
description: RGB ImageをYUV・YIQ・CMY・HLS等のalternate color spaceへ変換し、処理後にRGBへ戻すための変換Node。
doc_type: node
term_id: color-space
term_short: RGBとalternate color spaceの間を往復する旧来型Color Space変換Node。
verification: partial
aliases: [Color Space, CS]
concepts: [image-data, color-space]
nodes: [Color Space]
node_family: color
controls: [Conversion, Color Type]
inputs: [image, mask]
outputs: [image]
tasks: [color-space, channel-processing]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-05"
---

# Color Space

Color Spaceは、Fusion内部のRGB ImageをYUV、YIQ、CMY、HLS等のalternate color spaceへ変換し、必要なら再びRGBへ戻すNodeです。

「別color spaceのchannelで処理してから戻す」ための単純な変換に使います。

## Conversion

- **None** — 変換しない
- **To Color** — RGBからColor Typeで選んだspaceへ
- **To RGB** — 選んだspaceからRGBへ戻す

## Color Type

YUV、YIQ、CMY、HLS等、変換対象のcolor spaceを選びます。

## 最小構成

```text
RGB Image → Color Space (To Color)
          → channel処理
          → Color Space (To RGB)
```

途中のNodeが「今どのcolor spaceのchannelを扱っているか」を理解していることが重要です。

## CST / Gamutとの違い

Color Spaceはchannel representationを切り替える旧来型のNodeです。

camera / display color managementやInput / Output Gammaを含む変換には[Color Space Transform](./color-space-transform)、[Gamut](./gamut)、OCIO系を使い分けます。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 93 pp.2180–2181で、ConversionとColor Type、alternate color spaceへの往復を確認しました。
