---
title: uMerge
description: USD asset・camera・light・sceneを動的inputで同じUSD environmentへ統合し、Transformでscene全体を動かす主要Scene Node。
doc_type: node
term_id: u-merge
verification: partial
aliases: [uMerge, USD Merge, uMg]
concepts: [usd-scene, scene-graph]
nodes: [uMerge]
node_family: usd
controls: [Transform]
inputs: [usd]
outputs: [usd]
tasks: [usd, combine-3d, scene, parenting]
level: advanced
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# uMerge

uMergeは、USD object、camera、light、sceneを同じ<Term id="usd-scene">USD environment</Term>へまとめる中心Nodeです。

## 入力

初期状態では複数Scene inputがあり、接続するごとに新しいinputが追加されます。

Manualではinput数に上限を設けず、常に1つ空inputが残るdynamic inputとして説明されています。

```text
uLoader ─────┐
uShape ──────┤
uCamera ─────┼─ uMerge → uRenderer
uDome Light ─┘
```

## 出力

統合されたUSD sceneを出力します。

cameraやlightは同じuMerge environmentへ入って初めて、同じscene内のgeometryとの関係を持ちます。

## Transform

uMergeのTransformは、接続されているobject全体へ作用します。

個別objectのTransformと違い、group全体を動かすため、parenting相当の階層movementを組む基礎になります。

## 最小構成

```text
uShape ──┐
uCamera ─┼─ uMerge → uRenderer
         ┘
```

## Merge 3Dとの違い

- **uMerge** — USD scene
- **Merge 3D** — Classic 3D scene

同じ3D scene合成でも別pipelineです。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 121 pp.2905–2906で、dynamic input、scene統合、Transformによる全object操作、uRendererへの基本構成を確認しました。
