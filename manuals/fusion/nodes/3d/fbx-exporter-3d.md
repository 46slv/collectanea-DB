---
title: FBX Exporter 3D
description: Fusion Classic 3D sceneをFBX・3DS・DAE・DXF・OBJ等へ書き出し、geometry・light・camera・animationのexport条件を設定するNode。
doc_type: node
term_id: fbx-exporter-3d
term_short: FBX Exporter 3Dは、Fusion 3D sceneを外部3D fileへ書き出すNode。
verification: partial
aliases: [FBX Exporter 3D, FBX Exporter]
concepts: [classic-3d, export-3d]
nodes: [FBX Exporter 3D]
node_family: 3d
controls: [Filename, Format, Version, Frame Rate, Scale Units By, Geometry, Lights, Cameras, Render Range, Reduce Constant Keys, File Per Frame, Sequence Start Frame]
inputs: [classic-3d]
outputs: [file]
tasks: [export-3d, fbx]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# FBX Exporter 3D

FBX Exporter 3Dは、<Term id="classic-3d">Classic 3D scene</Term>を外部3D fileへ書き出すNodeです。

FBXのほか、3DS、Collada DAE、AutoCAD DXF、OBJも扱います。Saverのようにrender操作でfileを書き出します。

## 入力

オレンジ色のScene Inputへexportしたい3D sceneを接続します。

Node treeのbranchへ接続すれば、そのbranchに含まれる3D elementsだけをexportできます。

## 主な設定

### Filename / Format / Version

保存先、file format、format versionを設定します。

OBJなど一部formatはanimationを保持できません。

### Frame Rate / Scale Units By

export sceneのfpsとunit scaleを設定します。

外部3D softwareとworld scaleが合わない場合にScale Units Byを使います。

### Geometry / Lights / Cameras

どの種類のscene elementをexportするかを選びます。

### Render Range

Fusion側のrender range情報をfileへ保存します。

### Reduce Constant Keys

隣接keyframeと値が同じkeyを削減します。

### File Per Frame

animationを1 fileへ持たせず、frameごとに別fileへ書き出します。

## 最小構成

Merge 3D / 3D object → FBX Exporter 3D

## FBX Mesh 3Dとの違い

- **FBX Exporter 3D** — Fusionから外へ書く
- **FBX Mesh 3D** — 外部geometryをFusionへ読む

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 88 pp.1945–1946で、Scene input、対応format、Filename / Format / Version、export対象、animation / sequence設定を確認しました。
