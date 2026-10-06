---
title: uNormalMap
description: uTextureで読み込んだnormal textureをuShaderへ渡す前に調整し、USD material用normal inputを整えるNode。
doc_type: node
term_id: unormalmap
verification: partial
aliases: [uNormalMap, uNm]
concepts: [usd-scene, material, normal-map]
nodes: [uNormalMap]
node_family: usd
inputs: [texture]
outputs: [texture]
tasks: [usd, material, normal-map]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# uNormalMap

uNormalMapは、normal textureをuShaderへ渡す前に調整するUSD Material Nodeです。

単独でscene geometryを作るNodeではなく、uTextureとuShaderの間で使います。

## 基本構成

```text
uTexture → uNormalMap → uShader → uReplaceMaterial
```

## Source Color Space

normal mapをuTextureで読み込む場合、ManualはSource Color SpaceをLinearにすることを推奨しています。

normal vectorを色としてgamma補正してしまわないためです。

## 使う判断

base color等の通常textureはuTextureからuShaderへ直接つなげます。

normal textureだけ、normal map解釈の調整が必要な場合にuNormalMapを挟みます。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 121 pp.2940–2941で、uTextureとuShaderの間に置くnormal texture processorとして確認しました。

各normal convention / channel flipの全Controlは実機未確認です。
