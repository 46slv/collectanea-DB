---
title: CoordTransform Position
description: 3D hierarchy内でupstream objectのlocal positionをdownstream scene上のcurrent absolute positionへ変換するModifier。
doc_type: node
term_id: coord-transform-position
verification: partial
aliases: [CoordTransform Position, Coordinate Transform]
concepts: [classic-3d, coordinate-space, modifiers]
nodes: [CoordTransform Position]
node_family: modifiers
outputs: [parameter]
tasks: [3d-position, coordinate-convert, modifier]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-05"
---

# CoordTransform Position

CoordTransform Positionは、Classic 3D hierarchy内でobjectのlocal coordinateを、別位置のsceneから見たcurrent positionへ変換するModifierです。

upstream objectが後段Transformで何度も移動・回転・scaleされた後でも、最終的な位置を別parameterへ参照したい場合に使います。

## Target / Scene

Targetは元coordinateを持つobject、Scene Inputは変換後のscene hierarchyを指定します。

## 使う場面

3D object Aの最終world-like positionへ別objectや2D controlを追従させる場合に、local XYZをそのままconnectする代わりに使います。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 124 pp.2999–3000で、3D hierarchy内coordinate変換、Target / Scene inputを確認しました。
