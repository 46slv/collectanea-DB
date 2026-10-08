---
title: Classic 3D scene
description: FusionのClassic 3Dを、2D ImageやUSDとは別のscene domainとして理解し、geometry・camera・light・Renderer 3Dの流れを読む。
doc_type: concept
term_id: classic-3d
term_short: Shape 3DやText 3D、Camera 3D、Light等をMerge 3Dでまとめ、Renderer 3Dで2D Imageへ変換するFusion固有の3D scene domain。
verification: partial
aliases: [Classic 3D, Fusion 3D, 3D scene]
concepts: [data-domain, scene-graph, rendering]
nodes: [Merge 3D, Renderer 3D, Camera 3D, Shape 3D, Image Plane 3D, Text 3D]
tasks: [build-3d-scene, understand-domain, debug]
prerequisites: [image-data, typed-connections]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# Classic 3D scene

FusionのClassic 3Dは、Shape 3D、Text 3D、Image Plane 3D、Camera 3D、Light等を同じ3D scene内で扱うdata domainです。

2D Image、Particle set、USD sceneとは別のdomainで、最終的にRenderer 3Dを使って2D Imageへ変換します。

## 最小構成

最小限ならGeometryとRenderer 3DだけでもImageを作れます。

```text
Shape 3D → Renderer 3D → 2D Image
```

実際にはCameraやLightを含めることが多いため、次の構成が基本です。

```text
Geometry ───┐
Camera 3D ──┼─ Merge 3D → Renderer 3D → 2D Image
Light ──────┘
```

## Geometry

Classic 3D sceneへ置くobjectです。

代表例:

- Shape 3D — Plane / Cube / Sphere / Cylinder等
- Image Plane 3D — 2D Imageをcardとして3Dへ置く
- Text 3D — extrude可能な3D text
- FBX / Alembic Mesh 3D — 外部3D geometry

Geometry自身にもTransformやMaterial設定があります。

## Merge 3D

複数の3D object、camera、light、sceneを1つへまとめます。

2D Mergeと名前は似ていますが、pixelを重ねるNodeではありません。3D scene graphを統合します。

## Camera 3D

3D sceneをどこから見るかを決めます。

Renderer 3Dはscene内cameraまたはdefault perspective cameraから2D Imageを生成します。Camera 3Dは実写cameraに近いFocal Length / Film Gate等を持ち、projectionにも使えます。

## Light

Classic 3DにはAmbient / Directional / Point / Spot / Dome等のLightがあります。

Lightをsceneへ入れただけでは、ViewerやRenderer 3DでLighting / Shadowsが有効になっていない場合があります。

Merge 3DのPass Through Lightsによって、upstreamのLightをdownstream objectへ効かせるかを分けられます。

## Renderer 3D

Classic 3D sceneから2D Imageを作るdomain boundaryです。

```text
Classic 3D scene → Renderer 3D → Image
```

Software / OpenGL rendererを選べ、shadowやDepth of Field、auxiliary layers等の対応が異なります。

## USDとの違い

Fusionには別にUSD専用のu* Nodeがあります。

```text
Classic 3D: Shape 3D → Merge 3D → Renderer 3D
USD:        uShape   → uMerge   → uRenderer
```

名前や目的が似ていてもscene representationとNode familyが異なるため、同じstreamへ直接混ぜる前提にしません。

## 関連Node

- [Classic 3Dノード](../../nodes/3d/)
- [Merge 3D](../../nodes/3d/merge-3d)
- [Renderer 3D](../../nodes/3d/renderer-3d)
- [Camera 3D](../../nodes/3d/camera-3d)
- [Shape 3D](../../nodes/3d/shape-3d)
- [Image Plane 3D](../../nodes/3d/image-plane-3d)

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Fusion Fundamentals Chapter 84とReference Manual Chapter 88–90を基に、Classic 3DのGeometry / Camera / Light / Merge 3D / Renderer 3D構造を整理しています。

USDとのdomain境界、runtime REGID、rendererのhost/GPU差は別途実機確認が必要です。
