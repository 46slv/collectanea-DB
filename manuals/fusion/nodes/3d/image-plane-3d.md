---
title: Image Plane 3D
description: 2D Image / Materialをaspect比付きの平面geometryへ載せ、Classic 3D sceneへ「card」として配置するNode。
doc_type: node
term_id: image-plane-3d
term_short: Image Plane 3Dは、2D Imageを3D空間の平面cardとして扱うNode。
verification: partial
aliases: [Image Plane 3D, ImagePlane3D, 3Im]
concepts: [classic-3d, image-data, geometry]
nodes: [Image Plane 3D]
node_family: 3d
controls: [Lock Width/Height, Subdivision Level, Wireframe]
inputs: [classic-3d, material]
outputs: [classic-3d]
tasks: [image-plane, card, build-3d-scene]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# Image Plane 3D

Image Plane 3Dは、2D <Term id="image">Image</Term>を平面geometryへ載せ、<Term id="classic-3d">Classic 3D scene</Term>の「card」として扱うNodeです。

video clip、still、graphic等を3D空間へ配置するときの基本Nodeです。

## 入力

### Scene Input

任意のClassic 3D scene入力です。

### Material Input

主に使う入力です。2D Imageまたは3D Materialを接続します。

2D Imageを接続すると、そのImageがdiffuse textureになり、Image aspect比がplane geometryにも反映されます。

## 主な設定

### Subdivision Level

planeを細かく分割します。

lightingやDisplace 3D / Bender 3Dでvertex-based deformationを使う場合、Subdivisionを増やすと滑らかになります。

### Lock Width / Height

SubdivisionのX / Y分割を同じ値にするか分けるかを決めます。

### Wireframe

OpenGL Rendererでwireframe表示 / renderします。

## 最小構成

MediaIn → Image Plane 3D → Merge 3D → Renderer 3D

## Shape 3Dとの違い

Image aspect比に合わせた平面cardが欲しい場合はImage Plane 3Dが直接的です。

Image aspectにgeometry sizeを支配されたくない場合はShape 3DのPlaneへMaterialを接続する方法を検討します。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 88 pp.1953–1954で、Scene / Material input、Image aspect、Subdivision、Wireframeを確認しました。
