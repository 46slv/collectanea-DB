---
title: DomeLight
description: HDR / SDR Imageをscene全体へ球状にmapし、environment lightingとして使うClassic 3D Light。
doc_type: node
term_id: dome-light
term_short: DomeLightは、Imageをscene周囲へmapしてenvironment lightを作るNode。
verification: partial
aliases: [DomeLight, Dome Light, 3Do]
concepts: [classic-3d, lighting, image-data]
nodes: [DomeLight]
node_family: materials-lights
controls: [Color, Intensity, Transform]
inputs: [classic-3d, image]
outputs: [classic-3d]
tasks: [shade-3d, environment-light, hdr-light]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# DomeLight

DomeLightは、HDRまたはSDR Imageをscene周囲のsphereへmapし、environment lightingを作る<Term id="classic-3d">Classic 3D</Term> Lightです。

studio HDRIや空のImageを使って、scene全体の反射・lighting方向をImageから作りたい場合に使います。

## 入力

### Scene Input

オレンジ色の任意inputです。3D sceneを接続できます。

### Dome Texture

白色のImage inputです。environment lightingに使うHDR / SDR Imageを接続します。

## Color / Intensity

Dome Textureに加えて、Light全体のColorとIntensityを調整します。

## Transform

rotationでenvironment mapの方向を変えられます。

たとえばHDRIの明るい窓やsun方向をobjectへ向けたい場合に使います。

## 最小構成

```text
HDR Image → DomeLight ─┐
Shape 3D ──────────────┼─ Merge 3D → Renderer 3D
Camera 3D ─────────────┘
```

## 他Lightとの違い

DomeLightは1点や1方向から照らすのではなく、Imageをscene全体のenvironment lightとして使います。

reflection-richなMaterialやnatural lightingで有効です。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 89 pp.2033–2034で、Scene Input、Dome Texture、Color / Intensity、environment lightingとしての役割を確認しました。

runtime REGID、HDR color-managementの実機挙動は未確認です。
