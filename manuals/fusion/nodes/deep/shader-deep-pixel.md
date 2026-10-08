---
title: Shader (Deep Pixel)
description: Normal channelを使ってrender済み2D ImageのAmbient・Diffuse・Specular・Reflectionをpost-processで再調整するNode。
doc_type: node
term_id: shader-deep-pixel
verification: partial
aliases: [Shader, Shd, Shader (Deep Pixel)]
concepts: [auxiliary-channels, image-data, normals, relighting]
nodes: [Shader]
node_family: deep
controls: [Ambient, Diffuse, Specular, Reflection, Reflection Type, Equator Angle, Polar Height, Diffuse Curve, Specular Curve, Specular Color]
inputs: [image, image, mask]
outputs: [image]
tasks: [aov, relight, reflection, shading]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# Shader (Deep Pixel)

Shaderは、2D <Term id="image">Image</Term>に含まれるNormal channelを使い、render後にlighting / reflection / shadingを調整するNodeです。

<Term id="auxiliary-channels">Normal AOV</Term>が無いImageではEffectがありません。

## 入力

### Input

Normal channelを含む2D Imageです。

### Reflection Map Image

緑色の任意inputです。

environment / reflectionとして使うImageを接続します。Manualは32-bit floatのequirectangular Imageを適した形式として挙げています。

### Effect Mask

Effect範囲を限定します。

Object / Material IDによる選択もCommon Settingsで利用できます。

## Light controls

### Ambient

shadow部にも加わるbase illuminationです。

### Diffuse

surfaceから全方向へ散乱するbase color / light成分を調整します。

### Specular

view方向へ反射するhighlight成分を調整します。

### Reflection

Reflection Mapの寄与量です。Reflection inputが無い場合は効果を持ちません。

## Reflection Type

- Screen
- Spherical
- Refraction

からmapping方式を選びます。

Equator Angle / Polar Heightでenvironmentの向きを調整します。

## Shader tab

Diffuse / Specular curveをSplineで編集し、surface normal angleに対するshading responseを変えます。

Specular Colorでhighlight colorを調整します。

## 最小構成

```text
Renderer 3D (RGBA + Normal) → Shader → Output
HDR / LatLong Image ─────────→ Reflection Map
```

## 3D Materialとの違い

OpenPBRやPhongは3D sceneをrenderする前のMaterialです。

Shader (Deep Pixel)はrender後の2D Image + Normal channelへpost-processを行います。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 96 pp.2263–2266で、Normal requirement、Reflection Map、Ambient / Diffuse / Specular / Reflection、mapping type、Shader curvesを確認しました。
