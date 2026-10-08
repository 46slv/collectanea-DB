---
title: USDノード
description: USD sceneを読み込む・作る・選択する・変形する・materialを差し替える・renderする流れからu* Nodeを探す入口。
doc_type: index
verification: partial
product_scope: fusion
tasks: [lookup-node, usd, build-usd-scene, render-usd]
updated: "2026-10-04"
---

# USDノード

USD系Nodeは、<Term id="usd-scene">USD scene</Term>を読み込み、編集し、lighting / materialを加え、uRendererで2D Image / AOVへrenderします。

USDの考え方から確認する場合は[USD scene](../../learn/02-data/usd)を参照してください。

## 基本の流れ

```text
uLoader / uShape
      ↓
uTransform / uVariant / uVisibility
      ↓
uMerge ← uCamera / uLight
      ↓
uRenderer
      ↓
2D Image / AOV
```

## 読み込む・書き出す

- [uLoader](./uloader) — USD fileを読み込む
- [uExport](./uexport) — USD sceneを.usd / .usda / .usdc / .usdzへ書き出す
- [uMaterialX](./umaterialx) — MaterialX .mtlxをmaterial-only USD dataとして読み込む

## Geometry / assetを作る

- [uShape](./ushape) — Capsule / Cone / Cube / Cylinder / Ico sphere / Plane / Sphere / Torus
- [uImage Plane](./uimage-plane) — 2D ImageをUSD cardへする
- [uVolume](./uvolume) — VDB volumeをUSD environmentへ読み込む

## Sceneをまとめる

- [uMerge](./u-merge) — USD asset / camera / light / sceneを統合
- [uSwitch](./uswitch) — 複数USD sourceから1つを選ぶ
- [uDuplicate](./uduplicate) — USD assetを連続複製する

## 一部Primを編集する

Scene TreeのPickを使うNode:

- [uTransform](./utransform) — selected primを移動・回転・scale
- [uVariant](./uvariant) — assetに定義済みvariantを切り替える
- [uVisibility](./uvisibility) — selected prim / branchを表示・非表示
- [uReplaceMaterial](./ureplacematerial) — selected primのmaterialを差し替える

## Camera / Projection

- [uCamera](./ucamera) — USD camera
- [uProjector](./uprojector) — custom projector / lightとしてImageを投影
- [uCatcher](./ucatcher) — Texture mode projectionをmaterial textureとして受ける

camera-matched projectionはuCamera、lighting / texturing用のcustom projectorはuProjectorから検討します。

## Material

```text
uTexture → uTextureTransform / uNormalMap → uShader
                                           ↓
USD scene ───────────────────────→ uReplaceMaterial
```

- [uTexture](./utexture)
- [uTextureTransform](./utexturetransform)
- [uNormalMap](./unormalmap)
- [uShader](./ushader)
- [uMaterialX](./umaterialx)
- [uReplaceMaterial](./ureplacematerial)

## Light

- [uCylinder Light](./ucylinder-light)
- [uDisk Light](./udisk-light)
- [uDistant Light](./udistant-light)
- [uDome Light](./udome-light)
- [uRectangle Light](./urectangle-light)
- [uSphere Light](./usphere-light)

## Render

- [uRenderer](./u-renderer) — USD scene → 2D Image / AOV

## Classic 3Dとの区別

Classic 3DはMerge 3D / Renderer 3D、USDはuMerge / uRendererです。

同名に近いCamera、Light、Transformがあっても、data domainが異なります。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 121 pp.2886–2946を基に、現行Manualに記載されたUSD Nodeを役割別に整理しています。
