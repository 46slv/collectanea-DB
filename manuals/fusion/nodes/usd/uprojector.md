---
title: uProjector
description: 2D ImageをUSD geometryへLightまたはTextureとして投影し、Color・Intensity・Projection Mode・shadow等を制御するNode。
doc_type: node
term_id: uprojector
verification: partial
aliases: [uProjector, uPj]
concepts: [usd-scene, projection, image-data, lighting]
nodes: [uProjector]
node_family: usd
controls: [Color, Intensity, Exposure, Projection Mode, Decay, Shadows, Projector ID, Transform]
inputs: [usd, image]
outputs: [usd]
tasks: [usd, projection, texture, lighting]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# uProjector

uProjectorは、2D <Term id="image">Image</Term>を<Term id="usd-scene">USD geometry</Term>へ投影するNodeです。

projectionをLightとして使う方法と、uCatcherへTextureとして渡す方法があります。

## 入力

### Scene Input

投影を受けるUSD sceneを接続します。

### Projective Image

必須の2D Image inputです。投影する画像を接続します。

## Light mode

projected RGBをdiffuse / specular lightingとしてsurfaceへ加えます。

surface normalの影響を受け、shadowも使えます。ただしAlphaでgeometryをclipしません。

## Texture mode

uCatcherをMaterialとして使うgeometryだけへtexture projectionを当てます。

Alphaを使った透明projectionや、diffuse以外のmaterial propertyへ投影したい場合に向きます。

## Color / Intensity / Exposure

ImageへColorを掛け、projectionのstrengthを調整します。

## uCamera projectionとの違い

camera-matched projectionではuCameraの方がFocal Length、Film Back、clip plane等を持つため向いています。

uProjectorはcustom light / texture projectorとしてColor、Intensity、Decay、Shadows等を直接調整したい場合に向きます。

## 最小構成

```text
Image ─────────→ uProjector
USD Geometry ──→ uProjector → uMerge → uRenderer
```

Texture mode:

```text
Image → uProjector (Texture)
             ↓
Geometry → uCatcher → uMerge → uRenderer
```

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 121 pp.2906–2911で、Scene / Projective Image inputs、Light / Texture projection、Alpha、uCatcher、uCameraとの差、Color / Intensity等を確認しました。
