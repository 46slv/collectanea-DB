---
title: Replace Material 3D
description: Classic 3D scene内geometryのMaterialを別Materialへ置換し、RGBA channelやObject / Material IDで適用対象を限定するNode。
doc_type: node
term_id: replace-material-3d
term_short: Replace Material 3Dは、3D geometryのMaterialをまとめて差し替えるNode。
verification: partial
aliases: [Replace Material 3D, 3Rpl]
concepts: [classic-3d, material]
nodes: [Replace Material 3D]
node_family: 3d
controls: [Enable, Replace Mode, Limit by Object ID, Limit by Material ID]
inputs: [classic-3d, material]
outputs: [classic-3d]
tasks: [replace-material, material-pass, text-material]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# Replace Material 3D

Replace Material 3Dは、<Term id="classic-3d">Classic 3D scene</Term>内geometryのMaterialを、別のMaterialへ置き換えるNodeです。

LightやCameraは変更せず通過します。

## 入力

### Scene Input

置換対象の3D scene / object / Text 3Dを接続します。

### Material Input

新しく使う2D Imageまたは3D Materialを接続します。

2D Imageの場合はNode内Basic Materialのdiffuse textureとして使われ、3D Material接続時はBasic Materialが無効になります。

## Replace Mode

RGBA channelごとに次を選べます。

- Keep — 元Materialを保つ
- Replace — 新Materialへ置換
- Blend — 2つをblend
- Multiply — 2つを乗算

## Object / Material IDで限定

Limit by Object ID / Material IDを有効にすると、特定IDだけMaterialを置き換えます。

両方有効の場合、両条件を満たすobjectだけが対象です。

## Text 3DへMaterialを使う

Text 3Dには外部Material inputがないため、別shaderを適用したい場合はText 3Dの後ろへReplace Material 3Dを置きます。

## 最小構成

Text 3D → Replace Material 3D → Merge 3D → Renderer 3D

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 88 pp.1979–1980で、Scene / Material inputs、Replace Mode、Object / Material ID制限、Text 3D用途を確認しました。
