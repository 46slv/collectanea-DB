---
title: Glow
description: Imageをblurして明るくし元Imageへ戻すことでhaloを作り、Glow Mask・Filter・Size・Apply Mode・Color Scaleで発光を制御するNode。
doc_type: node
term_id: glow
verification: partial
aliases: [Glow, Glo]
concepts: [image-data, mask-data, filtering, domain-of-definition]
nodes: [Glow]
node_family: blur-filter
controls: [Filter, Color Channels, Lock X/Y, Glow Size, Num Passes, Glow, Clipping Mode, Blend, Apply Mode, Color Scale]
inputs: [image, mask, mask]
outputs: [image]
tasks: [glow, bloom, light-effect]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# Glow

Glowは、2D <Term id="image">Image</Term>をblurして明るくし、その結果を元Imageへ重ねて発光のhaloを作るNodeです。

明るい文字、light、neon、highlightへ広がる光を足す用途に向きます。

## 入力

### Input

Glowを適用する2D Imageです。

### Effect Mask

青色のMaskです。Glow処理後の最終結果をどこへ適用するかを限定します。

### Glow Mask

白色のpre-maskです。**Glowのsourceになるpixel**を処理前に限定します。

Glow Maskならmask境界の外へhaloを広げられます。Effect Maskでは最終結果自体をmaskするため、haloも境界で切れます。

```text
Bright source ─→ Glow ─→ Output
                 ↑
              Glow Mask
```

## Filter

Box / Bartlett / Multi-box / Gaussian / Fast Gaussian / Blend / Hilight / Solarize等を選べます。

単なるquality順ではなく、haloの形や計算方法が異なります。

## Glow Size / Glow

- **Glow Size** — haloの広がり
- **Glow** — haloの強さ

「大きい弱い光」と「小さい強い光」を分けて作れます。

## Apply Mode

- **Normal** — glowを元Imageへ通常合成
- **Merge Under** — Alphaを基準にglowをImageの下側へ置く
- **Threshold** — glow値をLow / High rangeでclip

Threshold modeでは、弱いglowを切り捨てたり強い部分を明確にできます。

## Color Scale

RGBA channelごとにglow量をscaleし、発光色をtintできます。

## Clipping Mode

大きなGlowではDoD edgeから外側のpixelも参照するため、Frame / Domain / NoneのClipping Modeが見た目へ影響します。

edgeだけhaloが切れる場合はGlow SizeだけでなくClipping Modeも確認します。

## Soft Glowとの違い

- **Glow** — 明確なhalo、複数Apply Mode、強いgraphic lightにも向く
- **Soft Glow** — より柔らかく自然なhaze / dream-like glow

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 92 pp.2116–2119で、3 inputs、pre-maskとEffect Maskの違い、Filter、Glow Size / Glow、Apply Mode、Color Scale、Clipping Modeを確認しました。
