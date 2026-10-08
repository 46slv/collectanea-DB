---
title: Texture (Deep Pixel)
description: UV channelを持つrender済み2D Imageへ別Texture Imageをmappingし、Flip・Swap UV・Scale・Offsetで貼り方を変更するNode。
doc_type: node
term_id: texture-deep-pixel
verification: partial
aliases: [Texture, Txr, Texture (Deep Pixel)]
concepts: [auxiliary-channels, image-data, uv]
nodes: [Texture]
node_family: deep
controls: [Flip Horizontal, Flip Vertical, Swap UV, Rotate 90, U Scale, V Scale, U Offset, V Offset]
inputs: [image, image, mask]
outputs: [image]
tasks: [aov, texture-replace, uv]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# Texture (Deep Pixel)

Textureは、2D <Term id="image">Image</Term>に含まれるUV channelを使い、render後に別Texture Imageを3D surfaceへ貼り直すNodeです。

<Term id="auxiliary-channels">UV AOV</Term>が入力Imageに無い場合はEffectがありません。

## 入力

### Input

UV channelを含むrender済み2D Imageです。

### Texture

緑色のImage inputです。新しくmappingするtextureを接続します。

### Effect Mask

texture replacementを適用する範囲を限定します。

## Texture controls

### Flip Horizontal / Vertical

texture ImageをU / V方向へ反転します。

### Swap UV

UとV coordinateを入れ替えます。

### Rotate 90

textureを90°回転してmappingします。

### U / V Scale

UV coordinate scaleを変え、surface上でtextureが大きく / 小さく見えるようにします。

### U / V Offset

UV coordinateをずらし、surface上のtexture位置を移動します。

## 背景pixelへの注意

Manualではbackground pixelのUVが0,0の場合、textureのcorner pixel色がbackgroundへ出る可能性があると説明しています。

Object Alpha、Object ID、Material ID等で対象objectだけへEffectを限定します。

## 最小構成

```text
Renderer 3D (RGBA + UV) → Texture → Output
New Texture Image ───────→ Texture input
```

## 3D Material textureとの違い

3D Materialへtextureを設定するとrender前のsurface shadingへ参加します。

Texture (Deep Pixel)はrender済みImageのUV AOVを使ってpost-processでtextureを差し替えます。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 96 pp.2266–2268で、UV requirement、Texture / Mask inputs、Flip、Swap UV、Rotate、Scale / Offset、background注意を確認しました。
