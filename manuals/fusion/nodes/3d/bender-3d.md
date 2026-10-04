---
title: Bender 3D
description: Classic 3D geometryの既存vertexをbend・taper・twist・shearし、RangeやAxisで変形方向と範囲を調整するNode。
doc_type: node
term_id: bender-3d
term_short: Bender 3Dは、3D geometryをbend・taper・twist・shearするNode。
verification: partial
aliases: [Bender 3D, 3Bn]
concepts: [classic-3d, geometry]
nodes: [Bender 3D]
node_family: 3d
controls: [Bender Type, Amount, Axis, Angle, Range, Group Objects]
inputs: [classic-3d]
outputs: [classic-3d]
tasks: [deform-3d, bend, taper, twist, shear]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# Bender 3D

Bender 3Dは、<Term id="classic-3d">Classic 3D</Term> geometryをbend、taper、twist、shearするNodeです。

入力scene内のgeometryだけを変形し、Camera、Light、Materialはそのまま通過します。

## 入力と出力

オレンジ色のScene Inputへ3D object / sceneを接続し、変形後のClassic 3D sceneを出力します。

## 主な設定

### Bender Type

- Bend — 曲げる
- Taper — 先細り / 先太り
- Twist — 軸まわりにねじる
- Shear — 斜め方向へずらす

### Amount

変形量です。

### Axis / Angle

変形の基準axisと方向を決めます。AngleはBend / Shearで使用します。

### Range

geometry全体ではなく一部だけを変形します。Shearでは表示されません。

### Group Objects

入力sceneに複数objectがある場合、それらを1 groupとして共通centerから変形します。無効なら各objectを個別centerで変形します。

## Subdivisionが必要な理由

Bender 3Dは新しいvertexを追加しません。

少ないvertexしかないPlaneやTextを大きく曲げると角張るため、元Node側のSubdivisionを増やしてからBender 3Dへ渡します。

## 最小構成

Shape 3D → Bender 3D → Merge 3D → Renderer 3D

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 88 pp.1916–1918で、Scene input、4 deformation mode、Amount / Axis / Angle / Range / Group Objects、Subdivision上の注意を確認しました。
