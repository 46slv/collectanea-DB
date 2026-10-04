---
title: Classic 3D
description: Fusionの従来型3D sceneを、2D ImageやUSDとは別のdata domainとして理解し、geometry・camera・light・material・Renderer 3Dの関係を読む。
doc_type: concept
term_id: classic-3d
term_short: Shape 3D、Text 3D、Camera 3D、Light等をMerge 3Dでまとめ、Renderer 3DでImageへ変換するFusion独自の3D scene domain。
verification: partial
aliases: [Classic 3D, Fusion 3D, 3D Scene]
concepts: [data-domain, scene-graph, rendering]
nodes: [Merge 3D, Renderer 3D, Camera 3D, Shape 3D, Image Plane 3D]
tasks: [build-3d-scene, render-3d, debug]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# Classic 3D

Classic 3Dは、Fusion内で長く使われている独自の3D scene systemです。

Shape 3D、Text 3D、Image Plane 3D、Camera 3D、Light、Material等を3D sceneとして扱い、Merge 3Dでまとめ、最後にRenderer 3Dで2D Imageへ変換します。

## 基本の流れ

Shape 3D / Text 3D / Camera 3D / Light → Merge 3D → Renderer 3D → 2D Image

Renderer 3Dより前は通常のRGBA Imageではありません。Blur、Color Corrector、2D Merge等へ進む場合は、Renderer 3DでImageへ変換します。

## geometry

- Shape 3D — Plane / Cube / Sphere等のprimitive
- Text 3D — 3D text
- Image Plane 3D — 2D Imageを平面geometryへ載せる
- Cube 3D — 6面を個別に扱えるcube
- FBX Mesh 3D / Alembic Mesh 3D — 外部geometryを読み込む

## sceneをまとめる

Merge 3Dは複数の3D object、Camera、Light等を同じsceneへまとめます。

2D Mergeと名前は似ていますが、画像を前後に重ねるNodeではありません。3D sceneの要素を同じ空間へ置くためのNodeです。

## camera

Camera 3DはRenderer 3Dがどこからsceneを見るかを決めます。

Focal Length、Angle of View、Near / Far Clip等を持ち、2D Imageをcamera projectionとしてsceneへ投影することもできます。

## material / texture

3D geometryへ見た目を与える層です。

Image Plane 3DやShape 3D等はMaterial入力を持ちます。Material / Texture系Nodeはgeometryとは別の役割なので、Imageを3D inputへ直接つないだだけでscene objectになるとは限りません。

## transform

3D objectにはXYZ位置・rotation・scaleがあります。

個別NodeのTransform tabで動かす方法と、Transform 3Dを追加してscene / object group全体へ追加transformをかける方法があります。

## render boundary

Renderer 3DがClassic 3Dから2D Imageへの境界です。

Classic 3D scene → Renderer 3D → Image → Blur / Color / Merge / MediaOut

## USDとの違い

Classic 3DとUSDは別のscene pipelineです。

- Classic 3D — Shape 3D / Merge 3D / Renderer 3D / Projector 3D
- USD — uShape / uMerge / uRenderer / uProjector

名前や用途が似ていても、そのまま同じscene connectionへ混ぜません。

## Shapeとの違い

Shape / s* Nodeは2D vector/path domainです。Shape 3DやText 3DのClassic 3D geometryとは別です。

## 関連Node

- [3Dノード](../../nodes/3d/)
- [Merge 3D](../../nodes/3d/merge-3d)
- [Renderer 3D](../../nodes/3d/renderer-3d)
- [Camera 3D](../../nodes/3d/camera-3d)
- [Shape 3D](../../nodes/3d/shape-3d)
- [Image Plane 3D](../../nodes/3d/image-plane-3d)

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 88 pp.1912–2026とFusion Fundamentalsの3D compositing章を基にしています。

current runtimeのREGID、GPU / Software renderer性能差、Edition差は別の実機確認対象です。
