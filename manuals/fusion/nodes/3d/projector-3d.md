---
title: Projector 3D
description: 2D ImageをClassic 3D geometryへ投影し、Light / Ambient Light / Texture modeでlightingまたはmaterial textureとして使うNode。
doc_type: node
term_id: projector-3d
term_short: Projector 3Dは、2D Imageを3D geometryへprojectionするNode。
verification: partial
aliases: [Projector 3D, 3Pj]
concepts: [classic-3d, image-data, projection]
nodes: [Projector 3D]
node_family: 3d
controls: [Enabled, Color, Intensity, Decay Type, Angle, Fit Method, Projection Mode, Shadows]
inputs: [classic-3d, image]
outputs: [classic-3d]
tasks: [projection, texture-3d, image-based-rendering]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# Projector 3D

Projector 3Dは、2D <Term id="image">Image</Term>を<Term id="classic-3d">Classic 3D</Term> geometryへ投影するNodeです。

set projection、camera-like texture projection、複数objectへ1枚のImageをまたいで貼る用途に使えます。

## 入力

### Scene Input

オレンジ色の3D scene入力です。

### Projective Image

白色の必須Image入力です。投影する2D Imageを接続します。

## Projection Mode

Projector 3DはLightに近い仕組みを持ちます。

### Light / Ambient Light

projected Imageをlightingとしてgeometryへ当てます。

Lightingが有効である必要があり、surface normalやmaterialのReceives Lightingの影響を受けます。Light modeではspecular highlightやshadowも関係します。

### Texture

Imageをmaterial textureとしてprojectします。

Alphaでgeometry opacityを切りたい場合や、Diffuse以外のtexture propertyへprojectionを使う場合はTexture modeが必要です。ManualではCatcher materialと組み合わせます。

## 主な設定

### Color / Intensity

projected Imageの色を乗算し、projection strengthを調整します。

### Decay Type

distanceでprojection intensityを減らします。No Falloff / Linear / Quadraticがあります。

### Angle

projection frustumの広さを決めます。

### Fit Method

Image aspectをprojection pyramidへどう収めるか決めます。Inside / Width / Height / Outside等があります。

### Shadows

Light modeでprojectionにshadow castingを使います。

## Camera Projectionとの違い

Camera 3Dにもprojection機能があります。

- **Camera 3D projection** — live-action camera match、film back / aperture / clip planeまでcameraと一致させたい
- **Projector 3D** — custom lightとしてIntensity / Color / Decay / Shadowを細かく扱いたい

## 最小構成

Image → Projector 3D
Scene ─→ Projector 3D → Merge 3D → Renderer 3D

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 88 pp.1965–1969で、Scene / Projective Image input、Light / Ambient / Texture projection、Color / Intensity / Decay / Angle / Fit、Camera Projectionとの差を確認しました。
