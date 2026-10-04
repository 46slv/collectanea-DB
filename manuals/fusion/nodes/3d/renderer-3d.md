---
title: Renderer 3D
description: Classic 3D sceneを2D Imageへ変換し、Camera・renderer engine・lighting・AA・auxiliary channel・multilayer passを管理するrender boundary。
doc_type: node
term_id: renderer-3d
verification: partial
aliases: [Renderer3D, Renderer 3D, 3Rn]
concepts: [classic-3d, image-data, rendering]
nodes: [Renderer 3D]
node_family: 3d
controls: [Camera, Eye, Renderer Type, Output Channels, Anti-Aliasing, Supersampling, Filter Type, Lighting, Texturing, Transparency, Shading Model, Cryptomatte]
inputs: [classic-3d, mask]
outputs: [image]
tasks: [render-3d, convert-domain, composite-3d]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# Renderer 3D

Renderer 3Dは、<Term id="classic-3d">Classic 3D scene</Term>を2D <Term id="image">Image</Term>へ変換するrender boundaryです。

Geometry、Camera、Light、MaterialをMerge 3D等で組んだ後、通常のBlur / Color / Merge / MediaOutへ戻る地点になります。

## 入力

### Scene Input

オレンジ色の必須入力です。renderする3D sceneを接続します。

### Effect Mask

青色の任意入力です。render後の2D ImageをMaskで制限します。

## Camera

scene内のどのCameraでrenderするかを選びます。

Defaultでは最初に見つかったCameraを使い、Cameraがなければdefault perspective viewを使います。

## Renderer Type

Fusion 21.1 ManualではSoftware、OpenGL、OpenGL UVのrendererが説明されています。

### Software

CPU rendererです。platform間で結果を揃えやすく、soft shadow等、OpenGLで扱えないfeatureがあります。

### OpenGL

GPU rendererです。高速なpreview / render、supersampling、3D depth of field等を使えますが、hardware / driverで結果差が出る場合があります。soft shadowは生成できません。

### OpenGL UV

UV関連のrender用途です。

## Output Channels

RGBA以外のauxiliary dataもImageへ埋め込めます。

代表例:

- Z
- Coverage
- Background Color
- Normal
- Texture Coordinate
- Object ID
- Material ID

後段でdepth、normal、ID matte等を使う場合に必要なchannelだけ有効にします。

## Multilayer

Renderer 3Dはlighting passをlayerとして出力できます。

ManualではShadow、Diffuse、Specular、Ambient、Reflect、Refract、Fogの7 layerが説明されています。必要なら2D compositing側でpassを再構成します。

## Anti-Aliasing

rendererごとにsupersamplingとfilterを設定します。

qualityを上げるほど計算量も増えるため、Viewer作業とfinal renderで必要な精度を分けます。

## Particleとの注意

3D particleでMotion Blurを使う場合、pRenderとRenderer 3DのMotion Blur設定を一致させる必要があります。subframe設定が違うと正しくない結果になります。

## 最小構成

Shape 3D / Camera / Light → Merge 3D → Renderer 3D → 2D Merge

## pRender / uRendererとの違い

- **Renderer 3D** — Classic 3D scene → 2D Image
- **pRender** — Particle set → 2D ImageまたはClassic 3D
- **uRenderer** — USD scene → 2D Image

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 88 pp.1970–1978で、Scene / Effect Mask input、Software / OpenGL / OpenGL UV、Camera / Eye、auxiliary channels、multilayer、AA、Particle Motion Blur上の注意を確認しました。

GPU別performanceとdriver差は実機未検証です。
