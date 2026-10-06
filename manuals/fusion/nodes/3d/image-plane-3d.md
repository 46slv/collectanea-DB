---
title: Image Plane 3D
description: 2D Imageをaspect比付きの平面geometryへ貼り、Classic 3D scene内のcardとして扱うNode。
doc_type: node
term_id: image-plane-3d
verification: partial
aliases: [Image Plane 3D, ImagePlane3D, 3Im]
concepts: [classic-3d, image-data, material]
nodes: [Image Plane 3D]
node_family: 3d
controls: [Lock Width/Height, Subdivision Level, Wireframe, Transform, Materials, Lighting]
inputs: [classic-3d, image, material]
outputs: [classic-3d]
tasks: [build-3d-scene, image-card, texture]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# Image Plane 3D

Image Plane 3Dは、2D <Term id="image">Image</Term>を平面geometryへ貼り、<Term id="classic-3d">Classic 3D scene</Term>内のcardとして扱うNodeです。

映像、静止画、matte painting、screen graphic等を3D空間へ置くときに使います。

## 入力

### Scene Input

オレンジ色の任意inputです。別の3D scene / objectを同じoutputへ加えられます。

### Material Input

緑色のinputです。2D Imageまたは3D Materialを接続します。

2D Imageを接続するとbuilt-in materialのdiffuse textureとして使われ、Imageのaspect比がplane geometryにも反映されます。

専用3D Materialを接続するとbuilt-in material側は無効になります。

## 出力

Imageを貼ったplane geometryをClassic 3D sceneとして出力します。

## Subdivision

Subdivision Levelを上げるとplaneのvertex数が増えます。

通常のflat cardでは低い値で足りますが、Displace 3Dでgeometryを変形する場合やvertex lightingを細かく表現する場合は十分なsubdivisionが必要です。

## Wireframe

OpenGL rendererでplaneをwireframeとして表示します。

subdivision densityを確認する用途にも使えます。

## 最小構成

```text
MediaIn → Image Plane 3D → Merge 3D → Renderer 3D
```

## Shape 3DのPlaneとの違い

Image Plane 3Dは接続したImageのaspect比をplane geometryへ反映するため、映像card用途に向きます。

geometryのWidth / HeightをImage aspectから独立して決めたい場合はShape 3DのPlaneを使う方が直接的です。

## 運用例

2.5D parallax:

1. 複数ImageをImage Plane 3Dへ変換します。
2. Z位置を少しずつ分けます。
3. Merge 3Dへまとめます。
4. Camera 3Dを動かします。
5. Renderer 3DでImageへ戻します。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 88 pp.1952–1954で、Scene / Material input、Image aspect、Subdivision、Wireframe、built-in materialとの関係を確認しました。

実機performanceとtexture filtering差は未確認です。
