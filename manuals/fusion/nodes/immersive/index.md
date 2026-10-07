---
title: Immersive / 360°ノード
description: lat-long・spherical camera・360°patch・stabilizeなど、equirectangular / immersive映像を処理するNodeの入口。
doc_type: index
verification: partial
product_scope: fusion
tasks: [lookup-node, immersive, 360-video]
updated: "2026-10-05"
---

# Immersive / 360°ノード

Immersive系Nodeは、通常のflat 2D frameではなく、lat-long / spherical projectionを前提とした360°映像を扱います。

## 代表Node

- PanoMap — projection formatを変換
- LatLong Patcher — lat-long panoramaの一部をflat viewとしてpatch / restore
- Immersive Patcher — 360°surface上のpatch作業
- Spherical Camera — spherical / panoramic view
- Spherical Stabilizer — 360°footageのorientationをstabilize

## 注意

通常のTransformでequirectangular edgeを越えて移動するとseamやprojection distortionが出る場合があります。360°専用Nodeでは球面上の座標として処理します。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference ManualのSpherical / Immersive sectionと旧Fusion Tool Referenceを基に整理します。
