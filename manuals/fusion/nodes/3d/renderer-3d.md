---
title: Renderer 3D
description: Classic 3D sceneをSoftwareまたはOpenGL rendererで2D Imageへ変換し、lighting・shadow・camera・render layerを出力するNode。
doc_type: node
term_id: renderer-3d
verification: partial
aliases: [Renderer3D, Renderer 3D, 3Rn]
concepts: [classic-3d, rendering, image-data]
nodes: [Renderer 3D]
node_family: 3d
controls: [Renderer Type, Camera, Enable Lighting, Enable Shadows, Image, Multilayer, Depth of Field, Motion Blur]
inputs: [classic-3d, mask]
outputs: [image]
tasks: [render-3d, convert-domain, composite-3d]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# Renderer 3D

Renderer 3Dは、<Term id="classic-3d">Classic 3D scene</Term>を通常の2D Imageへ変換するNodeです。

3D scene内のGeometry、Camera、Light、Materialを最終的なpixelへrenderするdomain boundaryです。

## 入力

### Scene Input

オレンジ色の必須inputです。Merge 3Dや単独Geometry等のClassic 3D sceneを接続します。

### Effect Mask

青色の任意inputです。render後の2D outputへMaskを適用します。

## 出力

2D Imageを出力します。

```text
Classic 3D scene → Renderer 3D → Blur / Color / Merge / MediaOut
```

## Renderer Type

### Software Renderer

CPUでrenderします。

OpenGLより遅いことが多い一方、machine間で結果を揃えやすく、soft shadow等、一部機能で必要になります。

### OpenGL Renderer

GPUを使って高速にrenderします。

interactiveな3D作業やsupersampling、3D Depth of Field等で有利ですが、GPU / driverによって結果差が出る可能性があり、soft shadowには制約があります。

## Camera

scene内のCamera 3Dを選ぶか、default perspective cameraを使います。

実写cameraと合わせた3D compositeでは、Camera TrackerからexportしたCamera 3Dなどを指定します。

## Lighting / Shadows

Light Nodeをsceneへ入れただけでは最終renderに反映されない場合があります。

Renderer 3D側のEnable Lighting / Enable Shadowsも確認します。

## Multilayer output

21.1 ManualではRenderer 3DがShadow、Diffuse、Specular、Ambient、Reflect、Refract、Fog等のlayerを出力できると説明されています。

beautyだけでなくlighting componentを後段で個別調整したい場合に使います。

## Motion Blur

3D particleをpRenderの3D mode経由でrenderする場合、pRenderとRenderer 3DのMotion Blur設定を一致させる必要があります。

subframe設定が一致しないとparticle motion blurが正しくならない可能性があります。

## 最小構成

```text
Shape 3D → Renderer 3D → Image
```

より実用的には:

```text
Geometry ───┐
Camera 3D ──┼─ Merge 3D → Renderer 3D → Merge
Light ──────┘
```

## pRender / uRendererとの違い

- **Renderer 3D** — Classic 3D scene → 2D Image
- **pRender** — Particle set → 2D Image / Classic 3D
- **uRenderer** — USD scene → Image / AOV

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 88 pp.1969–1978とFusion Fundamentals Chapter 84で、Scene / Mask input、Software / OpenGL renderer、Lighting / Shadows、Multilayer output、particle Motion Blur注意を確認しました。

renderer engineごとの完全なfeature matrix、GPU差、実機性能は未確認です。
