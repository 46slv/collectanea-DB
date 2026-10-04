---
title: Displace 3D
description: 2D Imageのchannel値を使い、Classic 3D geometryの既存vertexをnormal方向またはcamera方向へ変位させるNode。
doc_type: node
term_id: displace-3d
term_short: Displace 3Dは、Imageを高さmapとして3D meshのvertexを変位させるNode。
verification: partial
aliases: [Displace 3D, 3Di]
concepts: [classic-3d, image-data, geometry]
nodes: [Displace 3D]
node_family: 3d
controls: [Channel, Scale, Bias, Point to Camera, Camera]
inputs: [classic-3d, image]
outputs: [classic-3d]
tasks: [displace-3d, height-map, geometry]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# Displace 3D

Displace 3Dは、2D <Term id="image">Image</Term>の値を高さmapとして読み、<Term id="classic-3d">Classic 3D</Term> meshのvertexを変位させるNodeです。

通常は各vertexをsurface normal方向へ動かします。

## 入力

### Scene Input

オレンジ色の必須入力です。変位させる3D geometry / sceneを接続します。

### Image Input

緑色の2D Image入力です。どのvertexをどれだけ動かすかの参照mapになります。

## 主な設定

### Channel

displacement量として読むImage channelを選びます。

### Bias / Scale

Biasで基準値をoffsetし、その後Scaleで変位量を拡大・縮小します。

### Point to Camera

有効にするとnormal方向ではなくcamera方向へvertexを動かします。

camera image planeの見た目をcamera viewでは保ったまま、3D space上ではdepthを持たせたい場合などに使えます。

## Subdivision

Displace 3Dはvertexを追加しません。

Planeが4 cornerしか持たなければ、その4 vertexしか動かせません。細かいheight mapを表現する場合は、Shape 3D / Image Plane 3D等のSubdivisionを先に増やします。

## 最小構成

Fast Noise → Displace 3D
Shape 3D ───→ Displace 3D → Merge 3D → Renderer 3D

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 88 pp.1936–1937で、Scene / Image input、Channel、Scale / Bias、Camera Displacement、Subdivision上の制約を確認しました。
