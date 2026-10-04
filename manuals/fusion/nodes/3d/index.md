---
title: Classic 3Dノード
description: FusionのClassic 3Dでgeometry・camera・scene merge・projection・render・mesh processingを目的から選ぶ入口。
doc_type: index
verification: partial
product_scope: fusion
tasks: [lookup-node, build-3d-scene, render-3d, import-3d]
updated: "2026-10-04"
---

# Classic 3Dノード

Classic 3Dは、Fusion独自の<Term id="classic-3d">3D scene</Term>を扱うNode群です。

まず「objectを作る」「sceneをまとめる」「camera / projectionを決める」「geometryを加工する」「Imageへrenderする」のどこを担当するNodeかで選びます。

## まず選ぶ

| やりたいこと | Node |
| --- | --- |
| primitive geometryを作る | [Shape 3D](./shape-3d), [Cube 3D](./cube-3d) |
| text geometryを作る | [Text 3D](./text-3d) |
| 2D Imageを3D planeへ載せる | [Image Plane 3D](./image-plane-3d) |
| FBX / Alembic geometryを読む | [FBX Mesh 3D](./fbx-mesh-3d), [Alembic Mesh 3D](./alembic-mesh-3d) |
| 2D ShapeをZ方向へextrude | [Extrude 3D](./extrude-3d) |
| 複数object / camera / lightをまとめる | [Merge 3D](./merge-3d) |
| scene全体へ追加transform | [Transform 3D](./transform-3d) |
| objectを複製 | [Duplicate 3D](./duplicate-3d) |
| destination geometry上へ大量配置 | [Replicate 3D](./replicate-3d) |
| geometryをbend / taper / twist | [Bender 3D](./bender-3d) |
| Imageでvertexを変位 | [Displace 3D](./displace-3d) |
| cameraを置く | [Camera 3D](./camera-3d) |
| Imageをgeometryへ投影 | [Projector 3D](./projector-3d) |
| Classic 3D sceneをImageへ変換 | [Renderer 3D](./renderer-3d) |

## 最小scene

Shape 3D / Camera 3D / Light → Merge 3D → Renderer 3D → 2D Image

Merge 3Dまでが3D scene、Renderer 3D以後が2D Imageです。

## geometry processing

既存geometryを加工するNodeは、元meshのvertex / normal / UVへ作用します。

- Bender 3D — bend / taper / twist / shear
- Displace 3D — reference Imageでvertex displacement
- Replace Normals 3D — normal再計算 / 置換
- UV Map 3D — UV mappingを作り直す
- Weld 3D — 近接vertexをweld
- Triangulate 3D — polygon / quadをtriangleへ変換
- Custom Vertex 3D — expressionでvertex属性を処理

Bender / Displace等はvertexを新しく増やさないため、元geometryのSubdivisionが少ないと滑らかな変形になりません。

## duplication

Duplicate 3Dは同じobjectを連続transformで複製します。

Replicate 3Dはdestination geometryのvertexやparticle位置へsource geometryを配置します。規則的な繰り返しと「別geometry上へのscatter」を分けて選びます。

## projection

Projector 3Dは2D ImageをClassic 3D geometryへ投影します。

Camera 3DにもImage projection機能があります。camera-matched projectionとして扱うか、独立Projectorをsceneへ置くかで構成が変わります。

## render

Renderer 3DでClassic 3D sceneを2D Imageへ変換します。

最終的な2D Blur / Color correction / MergeはRenderer 3Dの後ろへ置きます。

## 関連する考え方

- [Classic 3D](../../learn/02-data/classic-3d)
- [データ領域を辿って診断する](../../learn/07-debugging/trace-data-domain)

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 88 pp.1912–2026を基にしています。

各Nodeの全Inspector Controlは個別Referenceへ分けます。
