---
title: uReplaceMaterial
description: USD scene内のselected primへColor・Texture・MaterialX・uShader等のmaterialを上書きするNode。
doc_type: node
term_id: ureplacematerial
term_short: uReplaceMaterialは、USD primのmaterialを別materialへ差し替えるNode。
verification: partial
aliases: [uReplaceMaterial, uReplace Material, uRM]
concepts: [usd-scene, material, scene-tree]
nodes: [uReplaceMaterial]
node_family: usd
controls: [Prim Selection, Invert Prim Selection, Type, Diffuse, Emissive, Workflow Mode, Roughness, Clearcoat, Opacity]
inputs: [usd, usd-material, image]
outputs: [usd]
tasks: [usd, replace-material, lookdev]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# uReplaceMaterial

uReplaceMaterialは、<Term id="usd-scene">USD scene</Term>内のobject / materialを選び、別materialへ置き換えるNodeです。

元USD fileを外部DCCで編集し直さず、Fusion内でlookを差し替えられます。

## 入力

### Scene Input

対象USD sceneを接続します。

### Material Input

uMaterialX、uShader、別USD sceneから選んだmaterial等を接続します。

### Image Input

2D Imageをanimated textureとして使えます。

Image Inputが接続されるとFile Nameより優先され、動画やFusion-generated Imageをdiffuse textureへ使えます。

## Prim Selection

PickからScene Treeを開き、materialを変更するprimだけを選びます。

Invert Prim Selectionで「選択したもの以外」を対象にもできます。

## Type

material sourceを選びます。

Manualでは代表的に:

- Color
- Texture
- MaterialX

があります。

uShader / uMaterialXをMaterial Inputへ接続した場合は、外部Nodeで組んだmaterialを使います。

## 最小構成

```text
uTexture → uShader ─────────┐
                            ↓
uLoader → uReplaceMaterial → uMerge → uRenderer
```

## 運用例

importしたcar modelのbodyだけmaterialを変える場合:

1. uLoaderのsceneをuReplaceMaterialへ接続します。
2. Pickからcar body primを選びます。
3. uShaderまたはMaterialXをMaterial Inputへ接続します。
4. Invert Prim Selectionが無効か確認します。
5. uRendererで結果を確認します。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 121 pp.2914–2917で、Scene / Material / Image input、Prim Selection、Type、Material controls、animated Image textureを確認しました。

複雑なUSD material inheritance、MaterialX compatibilityは未確認です。
