---
title: Point Cloud 3D
description: Camera tracking等で得た3D locator群をClassic 3D sceneで表示・選択・公開し、ground planeやobject配置の参照に使うNode。
doc_type: node
term_id: point-cloud-3d
term_short: Point Cloud 3Dは、trackingで復元した3D point群をscene内の配置基準として扱うNode。
verification: partial
aliases: [Point Cloud 3D, PointCloud 3D, 3PC]
concepts: [classic-3d, tracking-data]
nodes: [Point Cloud 3D]
node_family: 3d
controls: [Style, Lock X/Y/Z, Size X/Y/Z, Density, Color, Import Point Cloud, Make Renderable, Unseen by Camera]
inputs: [classic-3d]
outputs: [classic-3d]
tasks: [point-cloud, camera-track, align-3d]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# Point Cloud 3D

Point Cloud 3Dは、camera trackingや外部3D trackingから得た多数の3D pointを<Term id="classic-3d">Classic 3D scene</Term>で扱うNodeです。

各pointは見た目のgeometryというよりlocatorとして使われ、ground planeや実写featureに対応する位置へ3D objectを置く基準になります。

## 入力

オレンジ色のScene Inputへ3D sceneを接続できます。

Camera TrackerからExportしたPoint Cloud 3Dは、Camera 3D等とMerge 3Dへ接続して使います。

## 主な設定

### Style / Size / Density / Color

Viewerでpointをcrosshairまたはpointとして表示し、size、表示density、colorを調整します。

Densityはpoint cloud data自体を削減するのではなく、表示するpointの割合を変えます。

### Import Point Cloud

Maya .ma、3DS Max ASCII .ase、LightWave .lws、Softimage .xsi等のpoint cloudをimportできます。

### Make Renderable

OpenGL Rendererでpoint crosshair自体を最終renderへ含めます。通常はplacement guideとして使い、renderしない運用が多いNodeです。

## Pointを公開する

Viewerのcontext menuからpointをFind / Rename / Delete / Publishできます。

Publishすると、そのpointの3D位置がControlとしてInspectorへ現れ、他Nodeから参照できます。

## 最小構成

Camera 3D / Point Cloud 3D → Merge 3D → Renderer 3D

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 88 pp.1961–1964で、Scene input、display controls、point cloud import、Make Renderable、Find / Rename / Publish等を確認しました。
