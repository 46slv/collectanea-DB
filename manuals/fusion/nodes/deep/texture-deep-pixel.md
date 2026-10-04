---
title: Texture
description: U/V Map channelを持つ3D-rendered Imageへ別Texture Imageを再mappingし、Flip・Swap UV・Scale・Offsetでplacementを調整するNode。
doc_type: node
term_id: texture-deep-pixel
verification: partial
aliases: [Texture, Txr]
concepts: [auxiliary-channels, uv, image-data]
nodes: [Texture]
node_family: deep
controls: [Flip Horizontal, Flip Vertical, Swap UV, Rotate 90, U Scale, V Scale, U Offset, V Offset]
inputs: [image, image, mask]
outputs: [image]
tasks: [texture, uv, auxiliary-channels]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# Texture

Textureは、3D-rendered Imageに含まれるU / V Map channelを使い、後から別の2D Texture Imageをsurfaceへ貼り直すDeep Pixel Nodeです。

UV channelがないImageでは効果を持ちません。

## 入力

### Input

UV channelを含む2D Imageです。

### Texture

surfaceへ貼る別の2D Imageです。

### Effect Mask

Texture replacementを適用する領域を限定します。

## UV controls

### Flip Horizontal / Vertical

TextureをU / V方向へ反転します。

### Swap UV

UとV channelを入れ替えます。

### Rotate 90

texture mappingを90°回転します。

### U / V Scale

textureのmapping scaleを変更します。

### U / V Offset

surface上でtextureを移動します。

## 背景pixelの注意

Manualは、background pixelがU=V=0を持つ場合、textureのcorner pixelが背景へ出ることがあると説明しています。

特定objectだけへtextureを当てる場合は、Alpha、Object ID、Material ID等をEffect Maskへ使います。

## 最小構成

```text
Renderer 3D (RGBA + UV) → Texture → Output
Texture Image ─────────────↑
```

## uTextureとの違い

- **Texture (Deep Pixel)** — render済み2D ImageのUV channelを使ってpost-process
- **uTexture** — USD materialをrenderする前のtexture source

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 96 pp.2266–2267で、UV requirement、3 inputs、Flip / Swap / Rotate、U/V Scale / Offset、background UV注意を確認しました。
