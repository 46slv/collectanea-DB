---
title: FBX Mesh 3D
description: FBX・OBJ・3DS・DAE・DXFのpolygon geometryを1つのClassic 3D meshとして読み込むNode。
doc_type: node
term_id: fbx-mesh-3d
term_short: FBX Mesh 3Dは、外部polygon geometryをFusionのClassic 3D sceneへ読み込むNode。
verification: partial
aliases: [FBX Mesh 3D, FBX Mesh]
concepts: [classic-3d, import-3d]
nodes: [FBX Mesh 3D]
node_family: 3d
controls: [Size, FBX File, Object Name, Take Name, Wireframe]
inputs: [classic-3d, material]
outputs: [classic-3d]
tasks: [import-3d, fbx, geometry]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# FBX Mesh 3D

FBX Mesh 3Dは、FBX、OBJ、3DS、DAE、DXF等のpolygon geometryを<Term id="classic-3d">Classic 3D</Term> meshとして読み込むNodeです。

Node単体でfileを読む場合、file内geometryは1つのmesh / pivotとして扱われます。animationを保持し、camera / light / meshを個別Nodeへ分けたい場合はImport > FBX Sceneを使います。

## 入力

### Scene Input

任意のClassic 3D scene入力です。既存sceneへimport meshを追加できます。

### Material Input

2D Imageまたは3D Materialを接続し、import meshのmaterialとして使います。

## 主な設定

### Size

import geometryのscaleをFusion sceneへ合わせます。

### FBX File

読み込むfileを指定します。Node名はFBXですが、OBJ / 3DS / DAE / DXFにも対応します。

### Object Name / Take Name

Scene import時にFusionが設定し、file内object / animation takeを識別します。

### Wireframe

OpenGL Rendererでwireframe表示 / renderします。

## Scene importとの違い

FBX Mesh 3D単体はgeometryを1 meshとして読み込みます。

Fusion > Import > FBX Sceneでは、camera、light、mesh、animationを複数Nodeへ分けたsceneとして作れます。

## 最小構成

FBX Mesh 3D → Merge 3D → Renderer 3D

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 88 pp.1947–1949で、対応format、Scene / Material input、Size、Object / Take Name、Wireframe、Scene importとの差を確認しました。
