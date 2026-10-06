---
title: Merge 3D
description: Geometry・Camera・Light・別sceneを動的inputで1つのClassic 3D sceneへまとめる3D scene hub。
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

Merge 3Dは、Geometry、Camera、Light、別の3D sceneを1つの<Term id="classic-3d">Classic 3D scene</Term>へまとめるNodeです。

2D Mergeのようにpixelを前景・背景として重ねるのではなく、3D scene graphへ複数要素を参加させます。

## 入力

Scene inputは動的に増えます。

Image Plane 3D、Shape 3D、Text 3D、Camera 3D、Light、別のMerge 3Dなどを接続でき、接続するたびに次の空inputが用意されます。

```text
Image Plane 3D ─┐
Shape 3D ───────┤
Camera 3D ──────┼─ Merge 3D → Renderer 3D
Spot Light ─────┤
                ┘
```

## 出力

統合したClassic 3D sceneを出力します。

通常の2D Imageではないため、Blurや2D Mergeへ進む前にRenderer 3Dでrenderします。

## Pass Through Lights

upstream Merge 3Dへ接続されたLightを、downstreamのsceneへ通すかを決めます。

無効なら、そのMerge 3D内のLightを局所的なlighting groupとして扱えます。

```text
Object A + Light A → Merge 3D A
                        ↓
Object B ─────────→ Merge 3D B
```

Light AをObject Bにも効かせたい場合にPass Through Lightsを使います。

## Transform

Merge 3D自身のTransformで、まとめたscene全体を移動・回転・scaleできます。

個々のobject transformとscene全体のtransformを分けたい場合に使います。

## 最小構成

```text
Shape 3D ──┐
Camera 3D ─┼─ Merge 3D → Renderer 3D → Image
Light ─────┘
```

## 使うときの判断

1 objectだけをRenderer 3Dへ直接接続することもできます。

Camera、Light、複数Geometryを扱う段階ではMerge 3Dをscene hubとして使う方が関係を読みやすくなります。

## 似たNode

- Merge — 2D Imageを合成
- pMerge — Particle streamを統合
- uMerge — USD sceneを統合
- dMerge — Deep Imageを統合

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 88 pp.1957–1958とFusion Fundamentals Chapter 84で、動的scene input、3D scene hub、Pass Through Lights、Renderer 3Dへの接続を確認しました。

内部scene representation、実機performanceは未確認です。
