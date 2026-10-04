---
title: Replace Normals 3D
description: 3D meshのper-vertex normal / tangentを再計算・反転し、Smoothing Angleやpre-weldでshading seamを修正するNode。
doc_type: node
term_id: replace-normals-3d
term_short: Replace Normals 3Dは、meshのnormal / tangentを再計算してsmooth / faceted shadingを調整するNode。
verification: partial
aliases: [Replace Normals 3D, ReplaceNormals, 3RpN]
concepts: [classic-3d, geometry, normals]
nodes: [Replace Normals 3D]
node_family: 3d
controls: [Pre-Weld Position Vertices, Recompute, Smoothing Angle, Ignore Smooth Groups, Flip Normals]
inputs: [classic-3d]
outputs: [classic-3d]
tasks: [normals, shading, repair-geometry]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# Replace Normals 3D

Replace Normals 3Dは、3D meshのper-vertex normal / tangentを再計算し、smooth shadingやhard edgeを調整するNodeです。

Light、Camera、Point Cloud、Locator等のnon-mesh objectは変更せず通過します。

## 入力

オレンジ色のScene Inputへ3D geometry / sceneを接続します。

## 主な設定

### Pre-Weld Position Vertices

同じpositionに重複vertexがある場合、normal計算前だけ一時的にweldして計算を安定させます。output geometryのposition vertex自体を恒久的にweldする機能ではありません。

### Recompute

- Always — 常にnormal / tangentを再計算
- If Not Present — dataがないときだけ計算
- Never — 再計算しない

### Smoothing Angle

隣接face角度がこの値より小さいedgeをsmoothにします。

0ではfaceted normalを作る用途があります。

### Ignore Smooth Groups

meshのSmooth Group境界を無視してSmoothing Angleだけでsmoothするかを決めます。

### Flip Normals

normal方向を反転します。

## Custom Vertex / Displace後で使う

Custom Vertex 3Dでpositionを変えてもnormalは自動更新されません。

Displace 3Dやcustom deformation後にlightingが不自然なら、Replace Normals 3Dで再計算する構成を検討します。

## 注意

bump mapが元normalへ依存しているassetでは、normal再計算でappearanceが変わる場合があります。必要な時だけ使います。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 88 pp.1981–1982で、Scene input、Pre-Weld、Recompute、Smoothing Angle、Smooth Group、Flip Normalsとnormal / tangent上の注意を確認しました。
