---
title: uShape
description: Capsule・Cone・Cube・Cylinder・Ico sphere・Plane・Sphere・Torusを生成し、textureとPBR-like materialを持つUSD primitive Node。
doc_type: node
term_id: ushape
verification: partial
aliases: [uShape, uSh]
concepts: [usd-scene, geometry, material, image-data]
nodes: [uShape]
node_family: usd
controls: [Shape, Double Sided, Width, Height, Depth, Radius, Top Radius, Subdivision, Subdivision Scheme, Angle, Latitude, Cap Bottom, Cap Top, Section, Matte, Diffuse, Emissive, Workflow Mode, Roughness, Clearcoat, Opacity]
inputs: [image]
outputs: [usd]
tasks: [usd, primitive, geometry]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# uShape

uShapeは、Fusion内で基本primitiveを作るUSD Geometry Nodeです。

生成したgeometryは<Term id="usd-scene">USD scene</Term>としてuMerge / uRendererへ渡せます。

## Shape

Manual記載のprimitive:

- Capsule
- Cone
- Cube
- Cylinder
- Ico sphere
- Plane
- Sphere
- Torus

選択shapeに応じてSize / Radius / Height / Angle等のControlが変わります。

## Image Input

2D Imageを接続するとdiffuse textureとして使えます。

Image Inputはfile textureより優先され、動画やFusion-generated graphicをanimated textureとして使えます。

## Geometry controls

Plane / CubeはWidth / Height / Depth、丸いprimitiveはRadius、Cone / CylinderはHeight等を使います。

Subdivision LevelとSubdivision Schemeでmesh tessellationを調整します。

Angle / Latitude / Cap / Sectionを使い、sphereやtorusの一部だけを生成したり、cylinderをopen-endedにできます。

## Material

uShape自身に基本Material controlsがあります。

- Diffuse Color / Texture
- Emissive
- Metallic / Specular workflow
- Roughness
- Clearcoat
- Opacity
- Matte

より複雑なmaterialを別Nodeで構成する場合はuShader + uReplaceMaterialへ分けます。

## 最小構成

```text
uShape ──┐
uCamera ─┼─ uMerge → uRenderer
uLight ──┘
```

## Shape 3Dとの違い

- **uShape** — USD scene
- **Shape 3D** — Classic 3D scene
- **sRectangle等** — Shape vector domain

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 121 pp.2917–2921で、Image Input、primitive種類、geometry controls、Subdivision、Material controlsを確認しました。
