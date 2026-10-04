---
title: Shader
description: Normals channelを持つ3D-rendered Imageへ2D post processでlighting・specular・reflection mappingを加えるDeep Pixel Node。
doc_type: node
term_id: shader-deep-pixel
verification: partial
aliases: [Shader, Shd]
concepts: [auxiliary-channels, normals, reflection, image-data]
nodes: [Shader]
node_family: deep
controls: [Ambient, Diffuse, Specular, Reflection, Reflection Type, Equator Angle, Polar Height, Diffuse Curve, Specular Curve, Specular Color]
inputs: [image, image, mask]
outputs: [image]
tasks: [shader, relight, reflection, auxiliary-channels]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# Shader

Shaderは、3D-rendered Imageに含まれるNormals channelを使い、2D post processとしてlighting、specular、reflectionを調整するNodeです。

NormalsがないImageでは効果を持ちません。

## 入力

### Input

Normals channelを含む2D Imageです。

### Reflection Map Image

reflectionに使う2D Imageです。

Manualでは32-bit floatのequirectangular Imageが適すると説明されています。

### Effect Mask

Shader効果を適用する領域を限定します。

## Light tab

### Ambient

scene全体のbase illuminationを調整します。

### Diffuse

surface normal方向に応じるdiffuse contributionを調整します。

### Specular

glossy highlight成分を調整します。

### Reflection

Reflection Mapの寄与量を調整します。

Reflection Map inputがない場合は効果を持ちません。

## Reflection Type

- Screen
- Spherical
- Refraction

からmapping方法を選びます。

Equator Angle / Polar Heightでreflection environmentの方向を調整します。

## Shader tab

Diffuse / Specular spline curveでsurface responseを調整します。

Specular Colorでhighlight色を変えられます。

## 最小構成

```text
Renderer 3D (RGBA + Normals) → Shader → Output
Reflection Map ─────────────────↑
```

## Material Nodeとの違い

OpenPBR等は3D sceneをrenderする前のMaterialです。

Shaderはrender済み2D ImageのNormals / auxiliary dataを使うpost effectです。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 96 pp.2263–2265で、Normals requirement、Reflection Map、Ambient / Diffuse / Specular / Reflection、Reflection Type、Shader curvesを確認しました。
