---
title: Deep to Image
description: Deep Imageの複数depth sampleをflattenし、通常の2D Imageへ変換するDeep compositingの終端Node。
doc_type: node
term_id: deep-to-image
verification: partial
aliases: [Deep to Image, DTI]
concepts: [deep-image, image-data, rendering]
nodes: [Deep to Image]
node_family: deep
controls: [Flip Depth, Volumetric Composition, Process Mode, Width, Height, Pixel Aspect, Depth, Source Color Space, Source Gamma Space, Remove Curve, Pre-Divide/Post-Multiply]
inputs: [deep]
outputs: [image]
tasks: [deep, flatten, convert-domain]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# Deep to Image

Deep to Imageは、<Term id="deep-image">Deep Image</Term>の複数depth sampleをflattenし、通常の2D <Term id="image">Image</Term>へ変換するNodeです。

## 入力 / 出力

Deep Imageを1つ受け、2D Imageを出力します。

```text
dMerge → Deep to Image → Merge / Blur / Color
```

この地点でDeep sample構造は2D pixelへflattenされます。

## Flip Depth

depth情報の向きを反転します。

sourceのdepth conventionが期待と逆の場合に確認します。

## Volumetric Composition

overlapするDeep sampleをflat surfaceではなくsemi-transparent volumeとしてblendします。

fogやVDBのようなvolumetric elementのDeep compositingで使います。

## Image tab

Process Mode、output pixel Depth、Source Color Space / Gamma等を設定します。

Pre-Divide / Post-Multiplyも持ち、flatten後のAlpha relationshipを扱えます。

## 最小構成

```text
Deep A ─┐
        ├─ dMerge → Deep to Image → MediaOut
Deep B ─┘
```

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 95 pp.2238–2240で、flatten、Flip Depth、Volumetric Composition、Image tab、Color / Gamma handlingを確認しました。Deep Image toolsetはStudio Version Onlyです。
