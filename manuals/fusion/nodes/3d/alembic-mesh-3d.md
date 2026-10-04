---
title: Alembic Mesh 3D
description: Alembic (.abc)のmesh・point・UV・normal・baked animationをClassic 3D geometryとして読み込むNode。
doc_type: node
term_id: alembic-mesh-3d
term_short: Alembic Mesh 3Dは、Alembic (.abc) geometryをFusionのClassic 3D sceneへ読み込むNode。
verification: partial
aliases: [Alembic Mesh 3D, AlembicMesh3D, Abc]
concepts: [classic-3d, import-3d]
nodes: [Alembic Mesh 3D]
node_family: 3d
controls: [Filename, Object Name, Wireframe]
inputs: [classic-3d, material]
outputs: [classic-3d]
tasks: [import-3d, alembic, geometry]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# Alembic Mesh 3D

Alembic Mesh 3Dは、Alembic (.abc)に保存されたmesh、points、UV、normal、baked animationを<Term id="classic-3d">Classic 3D scene</Term>へ読み込むNodeです。

Alembicは計算済みanimationをgeometryと一緒に保存するため、Blender、Cinema 4D、Maya等から変形済みmesh animationを受け渡す用途に向きます。

## 読み込み方法

Fusionには2通りあります。

- Import > Alembic Sceneでscene全体を読み込む
- Alembic Mesh 3D Nodeを追加し、1 Nodeとして読む

Manualではscene importの方が、camera・mesh・transformを個別Nodeへ分解できるため推奨されています。Alembic Mesh 3D単体ではAlembic内geometryをまとめて1 objectとして扱います。

## 入力

### Scene Input

オレンジ色の任意入力です。既存Classic 3D sceneへAlembic geometryを追加できます。

### Material Input

緑色の任意入力です。2D Imageをtextureとして接続できます。

## 主な設定

### Filename

読み込むAlembic fileを指定します。

### Object Name

import対象mesh名を示します。Scene import経由ではFusionが設定します。空欄の場合はAlembic geometry全体を1 meshとして読み込みます。

### Wireframe

Viewer / OpenGL Rendererでwireframe表示・renderを行います。

## Alembic Scene importとの違い

Scene importではHierarchy、Camera、Points、Meshes、UV、Normals等のimport条件を選べます。

ManualではAlembic importについて、Light、Material、Curve、multiple UV、Velocityは現行実装で未対応と記載されています。light / materialが重要ならFBXを検討します。

## 最小構成

Alembic Mesh 3D → Merge 3D → Renderer 3D

## FBX Mesh 3Dとの違い

- **Alembic Mesh 3D** — baked geometry animationの受け渡しに向く
- **FBX Mesh 3D** — FBX / OBJ / 3DS / DAE / DXF geometryを読み込む。scene importではcamera / light / animationも分解可能

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 88 pp.1913–1915で、Alembic import方式、2入力、Filename / Object Name / Wireframe、対応・非対応要素を確認しました。

import元software固有metadataやruntime performanceは未確認です。
