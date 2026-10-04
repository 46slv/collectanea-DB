---
title: Relight
description: Imageから人物・物体のSurface Mapを解析し、その曲面に沿うような疑似lightを追加して既存lightingを補強するNode。
doc_type: node
term_id: relight
term_short: 2D footageのsurface解析から疑似的に追加lightを作るNode。
verification: partial
aliases: [Relight, RLT]
concepts: [image-data, lighting, mask-data]
nodes: [Relight]
node_family: matte-keying
inputs: [image, mask, image]
outputs: [image]
tasks: [relight, lighting, day-for-night]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-05"
---

# Relight

Relightは、2D footageから人物や物体の形状を解析してSurface Mapを作り、そのsurfaceに沿うように追加lightを当てるNodeです。

固定screen-space gradientを重ねるのではなく、objectの曲面を推定してhighlight / shadowへ追従する見え方を狙います。

## 使う場面

- 既存lightを強調して別shotと合わせる
- day-for-nightで方向性のあるlightを足す
- objectの曲面に沿うhighlightを追加する

## できないこと

Relightは本当の3D sceneを復元するNodeではありません。object同士の3D関係、shadow casting、depth data生成は行いません。

## 3D Lightとの違い

Directional / Point / Spot LightはClassic 3D scene内のgeometryへ作用します。Relightは通常2D footageへ直接作用します。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 109 pp.2557–2560で、Surface Map解析、用途、3D relationshipを計算しない制約を確認しました。
