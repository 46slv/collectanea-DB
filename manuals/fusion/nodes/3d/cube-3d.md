---
title: Cube 3D
description: 6面を持つcube primitiveを生成し、各faceへ個別Image / Materialを割り当てられるClassic 3D geometry Node。
doc_type: node
term_id: cube-3d
term_short: Cube 3Dは、6面を個別texturingできるcube primitiveを生成するNode。
verification: partial
aliases: [Cube 3D, Cube3D, 3Cb]
concepts: [classic-3d, geometry, material]
nodes: [Cube 3D]
node_family: 3d
controls: [Lock Width/Height/Depth, Size, Width, Height, Depth, Subdivision Level, Cube Mapping, Wireframe]
inputs: [classic-3d, material]
outputs: [classic-3d]
tasks: [build-3d-scene, cube, environment-map]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# Cube 3D

Cube 3Dは、<Term id="classic-3d">Classic 3D</Term>のcube primitiveを生成するNodeです。

6面それぞれへ別の2D Image / 3D Materialを割り当てられる点が、Shape 3Dの一般的なprimitive生成と比べた特徴です。

## 入力

### Scene Input

既存3D sceneを追加する任意入力です。

### 6つのMaterial Input

各faceへ2D Imageまたは3D Materialを接続します。接続したtexture / materialはCube自身にだけ適用され、Scene Inputから来た別objectへは適用されません。

## 主な設定

### Size / Width / Height / Depth

Lockを有効にすると1つのSizeで均等scaleします。解除すると3軸を個別に設定できます。

### Subdivision Level

面を細かく分割します。

vertex lightingやDisplace / Bender等のvertex-based処理ではSubdivisionを増やすと滑らかになります。

### Cube Mapping

最初のtextureを6面へcubic mappingでwrapします。cross layoutのcube map textureを使う場合に向きます。

### Wireframe

OpenGL Renderer使用時にwireframeとしてrenderします。

## 最小構成

Cube 3D → Merge 3D → Renderer 3D

## Shape 3Dとの違い

Shape 3DはPlane / Sphere / Cylinder等を含む一般primitive generatorです。6 faceを個別にtexturingするcubeが必要ならCube 3Dを使います。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 88 pp.1928–1929で、Scene / six material inputs、size、Subdivision、Cube Mapping、Wireframeを確認しました。
