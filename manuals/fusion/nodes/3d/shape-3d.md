---
title: Shape 3D
description: Plane・Cube・Sphere・Cylinder・Cone・Torus等の基本primitive geometryを生成し、MaterialとTransformを設定するClassic 3D Node。
doc_type: node
term_id: shape-3d
verification: partial
aliases: [Shape 3D, Shape3D, 3Sh]
concepts: [classic-3d, geometry, material]
nodes: [Shape 3D]
node_family: 3d
controls: [Shape, Size, Width, Height, Depth, Radius, Top Radius, Start/End Angle, Start/End Latitude, Caps, Section, Subdivision Level, Wireframe]
inputs: [classic-3d, image, material]
outputs: [classic-3d]
tasks: [build-3d-scene, primitive, geometry]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# Shape 3D

Shape 3Dは、Plane、Cube、Sphere、Cylinder、Cone、Torus等の基本geometryを作る<Term id="classic-3d">Classic 3D</Term> Generatorです。

外部3D modelを用意しなくても、sceneの床、壁、球、簡易object、projection surfaceを作れます。

## 入力

### Scene Input

オレンジ色の任意inputです。別の3D scene / geometryを同じoutputへ加えます。

### Material Input

緑色のinputです。2D Imageまたは3D Materialを受け取ります。

2D Imageならbuilt-in materialのdiffuse textureとして使い、3D Materialならbuilt-in materialを置き換えます。

## Shape

選択したprimitiveに応じてInspectorのControlが変わります。

代表例:

- Plane
- Cube
- Sphere
- Cylinder
- Cone
- Torus

## Size / Radius

Plane / CubeではWidth / Height / Depth、Sphere / Cylinder / Cone / TorusではRadius等を使います。

Lockを外すと各axisを個別に調整できます。

## Angle / Latitude / Caps

Sphere、Cylinder、Cone、Torus等ではStart / End Angleで一部分だけを生成できます。

Sphere / TorusのLatitude、Cylinder / ConeのTop / Bottom Capもgeometry shapeを変えるControlです。

## Subdivision

Subdivisionを上げるとmesh vertexが増えます。

smoothなlighting、Displace、deformationが必要な場合に増やします。単純な固定primitiveで無闇に高くする必要はありません。

## 最小構成

```text
Shape 3D → Renderer 3D → Image
```

Camera / Lightを使う場合:

```text
Shape 3D ──┐
Camera 3D ─┼─ Merge 3D → Renderer 3D
Light ─────┘
```

## Cube 3Dとの違い

Shape 3DでもCubeを作れます。

Cube 3Dは6面へ個別texture / material inputを持てるため、面ごとに違うImageを貼る用途で選びやすくなります。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 88 pp.1990–1992で、Scene / Material input、primitive種類、Size / Radius / Angle / Latitude / Caps / Subdivision / Wireframeを確認しました。

mesh topologyの詳細、実機performanceは未確認です。
