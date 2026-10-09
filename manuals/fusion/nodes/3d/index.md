---
title: Classic 3Dノード
description: Classic Fusion 3DのGeometry・Camera・Transform・Merge・Rendererを役割から選ぶ入口。
doc_type: index
verification: partial
product_scope: fusion
tasks: [lookup-node, build-3d-scene, render-3d]
updated: "2026-10-04"
---

# Classic 3Dノード

Classic 3Dは、Geometry・Camera・Lightを同じ<Term id="classic-3d">3D scene</Term>へまとめ、Renderer 3Dで2D Imageへ戻すFusion固有の3D pipelineです。

概念から確認する場合は[Classic 3D scene](../../learn/02-data/classic-3d)を参照してください。

## 最小構成

```text
Geometry ───┐
Camera 3D ──┼─ Merge 3D → Renderer 3D → Image
Light ──────┘
```

## 作る

- [Shape 3D](./shape-3d) — Plane / Cube / Sphere / Cylinder等のprimitive
- [Cube 3D](./cube-3d) — 6面へ個別textureを割り当てられるCube
- [Text 3D](./text-3d) — extrusion / bevelを持つ3D text
- [Image Plane 3D](./image-plane-3d) — 2D Imageを3D cardへする
- [Ribbon 3D](./ribbon-3d) — line/ribbon geometry
- [FBX Mesh 3D](./fbx-mesh-3d) / [Alembic Mesh 3D](./alembic-mesh-3d) — 外部geometry

## 変える

- [Transform 3D](./transform-3d) — scene / objectへ追加Transform
- [Duplicate 3D](./duplicate-3d) — 連続Transform付きで複製
- [Replicate 3D](./replicate-3d) — vertices等へobjectを配置
- [Bender 3D](./bender-3d) — geometryを曲げる
- [Displace 3D](./displace-3d) — Image channelでvertex displacement
- [Weld 3D](./weld-3d) — 近接position vertexをweld
- [UV Map 3D](./uv-map-3d) — UV mappingを調整

## Sceneを組む

- [Merge 3D](./merge-3d) — Geometry / Camera / Light / sceneを統合
- [Camera 3D](./camera-3d) — 3D sceneのview / projection
- [Projector 3D](./projector-3d) — Imageをscene geometryへprojection
- [Override 3D](./override-3d) — upstream objectのVisibility / Lighting / Matte等を一括override

## Material / Light

- [OpenPBR](../materials-lights/openpbr) — PBR material
- [Directional Light](../materials-lights/directional-light) — 平行光
- [Point Light](../materials-lights/point-light) — 1点から全方向へ照射
- [Spot Light](../materials-lights/spot-light) — cone形状のlight
- [3D Material / Lightノード](../materials-lights/) — MaterialとLight全体

## 2Dへ戻す

- [Renderer 3D](./renderer-3d) — Classic 3D scene → 2D Image

3D sceneの途中で通常の2D BlurやMergeを使うのではなく、Renderer 3DでImageへ変換した後に使います。

## 関連する考え方

- [Classic 3D scene](../../learn/02-data/classic-3d)
- [データ領域を辿って診断する](../../learn/07-debugging/trace-data-domain)

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 88–90とFusion Fundamentals Chapter 84を基に整理しています。

個別Nodeの全Control、renderer差、外部file format制約は各Referenceへ分けます。
