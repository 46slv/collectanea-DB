---
title: Custom Vertex 3D
description: expressionとImage lookupを使い、3D geometryのvertex position・normal・UV・color・velocity等をper-vertexで計算する高度なNode。
doc_type: node
term_id: custom-vertex-3d
term_short: Custom Vertex 3Dは、expressionで3D meshのvertex属性を直接計算するNode。
verification: partial
aliases: [Custom Vertex 3D, 3CV]
concepts: [classic-3d, geometry, expressions]
nodes: [Custom Vertex 3D]
node_family: 3d
controls: [Vertex Expressions, Numbers 1-8, Points 1-8, LUTs 1-4, Setups 1-8, Intermediates 1-8]
inputs: [classic-3d, image, image, image]
outputs: [classic-3d]
tasks: [custom-geometry, vertex-expression, procedural-3d]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# Custom Vertex 3D

Custom Vertex 3Dは、<Term id="classic-3d">Classic 3D</Term> geometryの各vertexをexpressionで処理する高度なNodeです。

positionだけでなくnormal、texture coordinates、vertex color、vector、velocity等を式やImage lookupから計算できます。

## 入力

### Scene Input

唯一の必須入力です。加工する3D geometry / sceneを接続します。

### Image Input 1–3

任意の2D Image入力です。LUT / pixel samplingをcustom expressionの参照に使えます。

## Vertex tab

position、normal、vertex color、texture coordinates、UV tangent、velocity等の式を記述します。

Manualではpositionをpx / py / pz、normalをnx / ny / nz等のvariableとして扱います。

positionだけを変えてもnormal / tangentは自動で更新されません。surface shadingが崩れる場合は後段でReplace Normals 3Dを使います。

## 補助parameter

### Numbers 1–8

animation / Modifierを接続できる数値parameterです。式からn1〜n8として参照します。

### Points 1–8

XYZ positionを外部Controlから式へ渡します。

### LUTs 1–4

Imageをlookup tableとして式へ利用します。

### Setups / Intermediates

複数expressionから共通利用する計算を段階化します。

## 最小構成

Shape 3D → Custom Vertex 3D → Replace Normals 3D → Merge 3D

## 使う判断

単純なbend / twistならBender 3D、Imageによる高さ変位ならDisplace 3Dの方がGraphの意味を読みやすくできます。

Custom Vertex 3Dは、既存Nodeでは表現できないper-vertex algorithmが必要な場合に使います。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 88 pp.1930–1935で、4入力、vertex attributes、Numbers / Points / LUT / Setup / Intermediate、normal再計算上の注意を確認しました。

expression language全体とperformanceは未確認です。
