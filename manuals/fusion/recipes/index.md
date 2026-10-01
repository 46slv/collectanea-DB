---
title: Recipes
verification: partial
description: 制作目的から具体的な手順へ進む入口。
doc_type: index
product_scope: fusion
slug: /fusion/recipes
---

# Recipes

具体的な完成結果から引く手順です。長い概念説明はここへ複製せず、Learn / Patternsへ戻します。

## Compositing

- [2つのImageを重ねる](./compositing/two-image-merge)

## Masking

- [Mergeの適用範囲をMaskで限定する](./masking/limit-merge-with-mask)

## Text / Graphics

- [Text+をImageへ重ねる](./text-graphics/text-over-image)

## Layout

- [TransformでImageを移動する](./layout/move-image-with-transform)

## Matte / Keying

- [KeyしてBackgroundを置き換える](./matte-keying/key-and-replace-background)

## Particles

- [最小Particle chainを作る](./particles/basic-particle-chain)

## Shapes

- [Shapeを2D Imageへrenderする](./shapes/basic-shape-render)

## USD

- [USD sceneを2Dへrenderする](./usd/basic-usd-render)

## Deep

- [Deep compositeを2Dへ戻す](./deep/deep-merge-to-image)

現在 **9 Recipe** です。

## 検証待ち

Fusion 21.1 Reference Manual / hostで操作名と挙動を確認してから個別Recipeへ昇格する候補:

- 線だけの円
- 外周を維持したまま内側を調整する構成
- 別NodeのCenter参照とOffset
- ベジェ線
- 複数の円を等間隔にする
- PNGの内径を広げる

未検証候補を完成手順として本文へ混ぜません。
