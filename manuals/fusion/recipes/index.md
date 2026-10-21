---
title: レシピ（Recipes）
verification: partial
description: 制作目的から具体的な手順へ進む入口。
doc_type: index
product_scope: fusion
slug: /fusion/recipes
---

# レシピ（Recipes）

具体的な完成結果から引く手順です。長い概念説明はここへ複製せず、Learn / Patternsへ戻します。

## 合成（Compositing）

- [2つのImageを重ねる](./recipes/compositing/two-image-merge)
- [複数ImageをMultiMergeでまとめる](./recipes/compositing/multi-merge-layers)

## マスク（Masking）

- [Mergeの適用範囲をMaskで限定する](./recipes/masking/limit-merge-with-mask)
- [OpenEXRのObject IDで車体だけ色補正する](./recipes/masking/exr-object-id-selective-grade)

## Text / Graphics

- [Text+をImageへ重ねる](./recipes/text-graphics/text-over-image)
- [再利用可能なTitle構造を作る](./recipes/text-graphics/reusable-title-structure)

## 配置

- [TransformでImageを移動する](./recipes/layout/move-image-with-transform)

## アニメーション

- [TransformをKeyframeで動かす](./recipes/animation/animate-transform-center)
- [OpenEXRのMotion Vectorで車の動きにブラーを加える](./recipes/animation/exr-motion-vector-blur)
- [Optical FlowのベクトルをOpenEXRへ保存・再利用する](./recipes/animation/optical-flow-exr-roundtrip)

## 自動化

- [2つのTransform位置を連動する](./recipes/automation/link-transform-centers)
- [複数要素を等間隔に配置する考え方](./recipes/automation/equal-spacing-by-index)

## Color

- [透明エッジ（Edge）を保って色補正する（Color Correct）](./recipes/color/transparent-edge-color-correction)

## Matte / キーイング

- [KeyしてBackgroundを置き換える](./recipes/matte-keying/key-and-replace-background)

## トラッキング

- [Trackerで車の動きにテキストを追従させる](./recipes/tracking/point-track-text-callout)
- [平面をtrackしてgraphicへ適用する](./recipes/tracking/planar-track-graphic)
- [Planar Trackerで壁の汚れを固定・補修して元の動きへ戻す](./recipes/tracking/planar-steady-paint-rewarp)
- [Planar TrackerとTime Stretcherで1フレームの補修を追従させる](./recipes/tracking/planar-clean-plate-freeze-track)
- [看板のロゴを通行人の背後に隠す](./recipes/tracking/planar-foreground-occlusion)
- [Surface Trackerでシャツのロゴを追従させる](./recipes/tracking/surface-track-shirt-logo)
- [Surface Trackerで動く肌を修正して元の動きへ戻す](./recipes/tracking/surface-track-stabilize-rewarp-skin-fix)
- [Surface Trackerの追従マスクを色補正へ渡す](./recipes/tracking/surface-track-alpha-effect-mask)

## Particles

- [最小Particle chainを作る](./recipes/particles/basic-particle-chain)

## Shapes

- [Shapeを2D Imageへrenderする](./recipes/shapes/basic-shape-render)

## Classic 3D

- [Classic 3D sceneを2Dへrenderする](./recipes/3d/basic-classic-3d-render)
- [Camera Trackerで実写に3Dオブジェクトを固定する](./recipes/3d/camera-track-3d-object)

## USD

- [USD sceneを2Dへrenderする](./recipes/usd/basic-usd-render)

## Deep

- [Deep 合成を2Dへ戻す](./recipes/deep/deep-merge-to-image)

現在 **28 Recipe** です。

## 検証待ち

Fusion 21.1 Reference Manual / 実機で操作名と挙動を確認してから個別Recipeへ昇格する候補:

- 線だけの円
- 外周を維持したまま内側を調整する構成
- ベジェ線
- PNGの内径を広げる

未検証候補を完成手順として本文へ混ぜません。
