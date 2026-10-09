---
title: USD scene
description: FusionのUSDを、Classic 3Dとは別のscene domainとして理解し、uLoaderからuMerge・uRendererまでの流れとPrim Selectionを読む。
doc_type: concept
term_id: usd-scene
term_short: uLoaderやuShapeなどのu* Nodeが扱い、uRendererで2D Image / AOVへrenderするUSD scene data。
verification: partial
aliases: [USD, USD scene, Universal Scene Description]
concepts: [data-domain, scene-graph, material, rendering]
nodes: [uLoader, uMerge, uRenderer, uShape, uCamera]
tasks: [usd, understand-domain, build-usd-scene]
level: advanced
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# USD scene

USDは、geometry、camera、light、material、animation等をsceneとして記述するUniversal Scene Descriptionの仕組みです。

FusionではuLoader、uShape、uCamera、uMerge、uRenderer等の`u*` Nodeが<Term id="usd-scene">USD scene</Term>を扱います。Classic 3Dとは別のscene domainです。

## 最小構成

USD fileを読む場合:

```text
uLoader ────┐
uCamera ────┼─ uMerge → uRenderer → 2D Image / AOV
uLight ─────┘
```

primitiveをFusion内で作る場合:

```text
uShape → uMerge → uRenderer
```

## uLoader

`.usd`、`.usda`、`.usdc`、`.usdz`を読み込み、USD sceneを作ります。

animationを含むUSDではTrim、Time Scale、Frame Offset、Reverse、Loopを使ってtimeを調整できます。

## Scene Tree / Prim Selection

USD sceneは多数のprimをhierarchyとして持てます。

uTransform、uVisibility、uVariant、uReplaceMaterial、uCamera、USD Light等ではPickからScene Treeを開き、特定primだけを対象にできます。

```text
USD scene
 ├─ /World/Building
 ├─ /World/Car
 └─ /World/Camera
```

「scene全体を変える」のか「一部primだけを変える」のかをPrim Selectionで分けます。

## uMerge

複数USD object、camera、light、sceneを同じUSD environmentへまとめます。

inputは動的に増え、uMerge自身のTransformは接続したobject全体へ作用するため、group / parenting相当のmovementにも使えます。

## uRenderer

USD sceneを2D Imageへrenderするdomain boundaryです。

ColorだけでなくDepth、PrimID、Camera Depth等のAOVを出せます。Output AOVs As Layersを有効にすると、1つのuRendererから複数AOVをlayerとして扱えます。

## Material

USD material workflowでは、uTexture → uNormalMap / uTextureTransform → uShader → uReplaceMaterialという構成を作れます。

MaterialX fileをそのまま使う場合はuMaterialXからuReplaceMaterialへ渡します。

## Classic 3Dとの違い

```text
Classic 3D: Shape 3D → Merge 3D → Renderer 3D
USD:        uShape   → uMerge   → uRenderer
```

似た目的でもscene representationとNode familyが違います。

Classic 3DのGeometryをそのままuMergeへ接続できると仮定せず、現在扱っているdomainを確認します。

## 21.1のUSD family

21.1 Manual Chapter 121には、scene / transform / selection / material / light / renderまでUSD専用Nodeがまとめられています。

代表的な役割:

- Load / Export: uLoader / uExport
- Generate: uShape / uImage Plane / uVolume
- Combine: uMerge
- Transform / visibility / variant: uTransform / uVisibility / uVariant
- Duplicate / switch: uDuplicate / uSwitch
- Camera / projection: uCamera / uProjector / uCatcher
- Material: uMaterialX / uTexture / uNormalMap / uTextureTransform / uShader / uReplaceMaterial
- Render: uRenderer

## 関連Node

- [USDノード](../../nodes/usd/)
- [uLoader](../../nodes/usd/uloader)
- [uMerge](../../nodes/usd/u-merge)
- [uRenderer](../../nodes/usd/u-renderer)
- [uTransform](../../nodes/usd/utransform)

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 121 pp.2886–2946を基に、USD file、Scene Tree、u* toolset、material / lighting / render flowを整理しています。

USD SDK内部仕様、Hydra内部実装、runtime REGID、external USD asset互換性は別途実機確認が必要です。
