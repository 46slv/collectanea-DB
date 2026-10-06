---
title: uTexture
description: Image fileまたはFusionの2D ImageをUSD shader用textureとして読み込み、Color SpaceとU/V Address Modeを設定するNode。
doc_type: node
term_id: utexture
verification: partial
aliases: [uTexture, uTx]
concepts: [usd-scene, texture, image-data, color-space]
nodes: [uTexture]
node_family: usd
controls: [File Name, Source Color Space, U Address Mode, V Address Mode]
inputs: [image]
outputs: [texture]
tasks: [usd, texture, material]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# uTexture

uTextureは、USD materialへ使うtextureを読み込むNodeです。

fileから読むほか、Fusionの2D <Term id="image">Image</Term>をImage Inputへ接続してanimated textureにできます。

## Image Input

Image Inputが接続されるとFile Nameより優先されます。

MediaIn、Background、Fast Noise、動画等をUSD materialへ直接使えます。

## File Name

Browseからtexture imageを読み込みます。

## Source Color Space

textureをどう解釈するか指定します。

normal textureではManualはLinearを選ぶことを推奨しています。

## U / V Address Mode

scaleやposition変更でtexture edge外が露出したときの扱いを設定します。

## 基本構成

```text
uTexture → uTextureTransform → uShader → uReplaceMaterial
```

normal textureなら:

```text
uTexture → uNormalMap → uShader
```

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 121 p.2944で、Image Input、File Name、Source Color Space、U/V Address Mode、uShader workflowを確認しました。
