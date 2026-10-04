---
title: Merge 3D
description: Geometry・Camera・Light等の複数Classic 3D streamを同じ3D environmentへ統合し、scene hierarchyのhubになるNode。
doc_type: node
term_id: merge-3d
verification: partial
aliases: [Merge3D, Merge 3D, 3Mg]
concepts: [classic-3d, scene-graph]
nodes: [Merge 3D]
node_family: 3d
controls: [Pass Through Lights, Transform]
inputs: [classic-3d]
outputs: [classic-3d]
tasks: [combine-3d, scene, composite-3d]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# Merge 3D

Merge 3Dは、Geometry、Camera、Light、別scene等を同じ<Term id="classic-3d">Classic 3D environment</Term>へまとめるNodeです。

2D MergeのForeground / Background合成とは違い、3D objectを同じscene graphへ参加させます。

## 入力

接続数に上限のないdynamic Scene Inputを持ちます。

接続するたびに次の空inputが自動で追加され、Image Plane 3D、Camera 3D、Light、別Merge 3D等を同じNodeへまとめられます。

## Transform

Merge 3DのTransformを動かすと、接続されている全objectをgroupとして移動・回転・scaleできます。

この挙動がClassic 3Dのparenting / hierarchy構成の基礎です。

## Pass Through Lights

通常、LightはそのLightと同じMerge 3Dへ入ったgeometryへ作用します。

Pass Through Lightsを有効にするとLightをMerge outputへ通し、さらにdownstreamで追加されるgeometryにも作用させられます。

## 最小構成

Shape 3D / Camera 3D / Light → Merge 3D → Renderer 3D

最後のMerge 3DはRenderer 3Dへ接続して2D Imageへ変換します。

## 2D Mergeとの違い

- **Merge 3D** — 3D scene elementsを同じ空間へまとめる
- **Merge** — 2D Foregroundを2D Backgroundへ重ねる

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 88 pp.1957–1958で、dynamic Scene inputs、group Transform、Pass Through Lights、Renderer 3Dへの基本構成を確認しました。
