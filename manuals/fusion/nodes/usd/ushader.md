---
title: uShader
description: uTexture等をvariable inputで受け、USDまたはMaterialX shader modelからmaterialを構築してuReplaceMaterialへ渡すNode。
doc_type: node
term_id: ushader
verification: partial
aliases: [uShader, uSd]
concepts: [usd-scene, material, texture]
nodes: [uShader]
node_family: usd
controls: [Shader Model, Diffuse, Emissive, Workflow Mode, Metallic, Specular Color, Roughness, Clearcoat, Clearcoat Roughness, Opacity]
inputs: [texture]
outputs: [usd-material]
tasks: [usd, material, shader, lookdev]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# uShader

uShaderは、USD sceneで使うmaterial / lookをFusion内で構築するNodeです。

Shader ModelとしてUSDまたはMaterialXを選べます。

## Variable Inputs

uTexture等をuShaderへ接続すると、接続先propertyを選ぶmenuが表示されます。

textureを接続したpropertyでは対応sliderが無効になり、Channel / Scale / Bias等のtexture制御が表示されます。

```text
uTexture → uTextureTransform → uShader → uReplaceMaterial
uTexture → uNormalMap ────────↑
```

## USD Shader Model

代表Control:

- Diffuse
- Emissive
- Metallic / Specular workflow
- Roughness
- Clearcoat
- Clearcoat Roughness
- Opacity

surfaceのbase color、metallic appearance、roughness、coat等を組み合わせます。

## MaterialX Shader Model

MaterialXはplatform-independentなmaterial descriptionです。

uShader内でMaterialX toolsetを使う方法と、外部.mtlxを[uMaterialX](./umaterialx)で読み込む方法を分けます。

## uReplaceMaterialとの関係

uShader単体でscene objectのmaterialが自動的に置き換わるわけではありません。

uReplaceMaterialで対象primを選び、uShader materialをMaterial Inputへ渡します。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 121 pp.2941–2943で、variable input、Shader Model、USD material controls、MaterialX mode、uReplaceMaterial workflowを確認しました。

material rendererの内部実装、完全なMaterialX compatibilityは未確認です。
