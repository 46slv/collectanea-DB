---
title: uTextureTransform
description: uTextureのScale・Rotation・PositionをuShaderへ渡す前に変更し、USD materialのtexture placementを調整するNode。
doc_type: node
term_id: utexturetransform
verification: partial
aliases: [uTextureTransform, uTXF]
concepts: [usd-scene, texture, uv]
nodes: [uTextureTransform]
node_family: usd
controls: [Scale, Rotation, Position]
inputs: [texture]
outputs: [texture]
tasks: [usd, texture, uv-transform]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# uTextureTransform

uTextureTransformは、uTextureで読み込んだtextureの配置を調整するNodeです。

uTextureとuShaderの間へ置き、Scale、Rotation、Positionを変更します。

## 最小構成

```text
uTexture → uTextureTransform → uShader
```

## Scale

texture patternを大きく / 小さく見せます。

## Rotation

texture orientationを回転します。

## Position

textureをsurface上で移動します。

geometry自体のTransformではなく、material textureのmapping placementを変えるControlです。

## uTransformとの違い

- **uTextureTransform** — texture placement
- **uTransform** — USD prim / objectの3D transform

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 121 p.2945で、uTextureとuShaderの間に置きScale / Rotation / Positionを調整することを確認しました。
