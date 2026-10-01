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
- [複数ImageをMultiMergeでまとめる](./compositing/multi-merge-layers)

## Masking

- [Mergeの適用範囲をMaskで限定する](./masking/limit-merge-with-mask)

## Text / Graphics

- [Text+をImageへ重ねる](./text-graphics/text-over-image)
- [再利用可能なTitle構造を作る](./text-graphics/reusable-title-structure)

## Layout

- [TransformでImageを移動する](./layout/move-image-with-transform)

## Animation

- [TransformをKeyframeで動かす](./animation/animate-transform-center)

## Automation

- [2つのTransform位置を連動する](./automation/link-transform-centers)
- [複数要素を等間隔に配置する考え方](./automation/equal-spacing-by-index)

## Color

- [透明Edgeを保ってColor Correctする](./color/transparent-edge-color-correction)

## Matte / Keying

- [KeyしてBackgroundを置き換える](./matte-keying/key-and-replace-background)

## Tracking

- [平面をtrackしてgraphicへ適用する](./tracking/planar-track-graphic)

## Particles

- [最小Particle chainを作る](./particles/basic-particle-chain)

## Shapes

- [Shapeを2D Imageへrenderする](./shapes/basic-shape-render)

## Classic 3D

- [Classic 3D sceneを2Dへrenderする](./3d/basic-classic-3d-render)

## USD

- [USD sceneを2Dへrenderする](./usd/basic-usd-render)

## Deep

- [Deep compositeを2Dへ戻す](./deep/deep-merge-to-image)

現在 **17 Recipe** です。

## 検証待ち

Fusion 21.1 Reference Manual / hostで操作名と挙動を確認してから個別Recipeへ昇格する候補:

- 線だけの円
- 外周を維持したまま内側を調整する構成
- ベジェ線
- PNGの内径を広げる

未検証候補を完成手順として本文へ混ぜません。
