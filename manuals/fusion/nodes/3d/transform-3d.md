---
title: Transform 3D
description: Classic 3D sceneまたはobject全体へ追加のTranslation・Rotation・Pivot・Scaleを適用し、hierarchyを組むNode。
doc_type: node
term_id: transform-3d
verification: partial
aliases: [Transform 3D, Transform3D, 3XF]
concepts: [classic-3d, transform]
nodes: [Transform 3D]
node_family: 3d
controls: [Offset XYZ, Rotation Order, Rotation XYZ, Pivot XYZ, Scale XYZ, Use Target, Target Position, Import Transform]
inputs: [classic-3d]
outputs: [classic-3d]
tasks: [build-3d-scene, transform-3d, hierarchy]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# Transform 3D

Transform 3Dは、<Term id="classic-3d">Classic 3D scene</Term>または3D objectへ、追加の位置・回転・scaleを適用するNodeです。

Geometry自身のTransformを変更せず、後段で別Transformを重ねたい場合やhierarchyを作る場合に使います。

## 入力 / 出力

オレンジ色のScene Inputへ3D scene / objectを接続し、変形後のClassic 3D sceneを出力します。

```text
Shape 3D → Transform 3D → Merge 3D
```

## Translation

X / Y / Z Offsetで3D space内の位置を変更します。

## Rotation

Rotation OrderでX / Y / Zをどの順に適用するかを決めます。

同じ3軸rotation値でも順序が違えば最終orientationが変わるため、複雑なanimationではRotation Orderも設定の一部として扱います。

## Pivot

rotation / scaleの中心です。

object center以外を軸に回したい場合、Pivotをoffsetします。

## Scale

Lock X / Y / Zが有効ならuniform scale、無効ならaxisごとに別scaleを設定できます。

## Use Target

Target Positionを有効にすると、objectが指定targetを向くようにrotationを計算します。

CameraやLightのaim、常に1点を向くobject animation等に使えます。

## Hierarchy

複数Transform 3Dを直列にすると、local transformとparent-like transformを分離できます。

```text
Object
  ↓
Transform 3D  ← local motion
  ↓
Transform 3D  ← group / parent motion
  ↓
Merge 3D
```

## 2D Transformとの違い

- **Transform** — 2D Imageを同じImage domain内で変形
- **Transform 3D** — Classic 3D object / sceneを3D coordinatesで変形

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 88 pp.2007–2009とCommon Transform controls pp.2023–2025で、Offset、Rotation Order、Pivot、Scale、Use Target、hierarchical useを確認しました。

coordinate conventionの全詳細、import format差、実機performanceは未確認です。
