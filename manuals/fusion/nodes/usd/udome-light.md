---
title: uDome Light
description: HDR / SDR ImageをUSD scene全体へ球状にmapし、environment lightingを作るNode。Image InputでFusionの動画やGeneratorも使える。
doc_type: node
term_id: udome-light
verification: partial
aliases: [uDome Light, uDo]
concepts: [usd-scene, lighting, image-data]
nodes: [uDome Light]
node_family: usd
controls: [Override Selection, Color, Intensity, Exposure, Color Temperature, Diffuse Response, Specular Response, Normalize, Guide Radius, Texture File, Texture Format, Transform]
inputs: [usd, image]
outputs: [usd]
tasks: [usd, environment-light, hdr-light]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# uDome Light

uDome Lightは、HDR / SDR Imageをscene周囲へ球状にmapし、environment lightingを作る<Term id="usd-scene">USD Light</Term>です。

## 入力

### Scene Input

USD sceneを接続します。

### Image Input

Fusionの2D <Term id="image">Image</Term>をenvironment textureとして接続できます。

file指定よりImage Inputが優先されるため、動画やGeneratorをanimated environmentとして使えます。

## Texture

Texture Fileからfileを読み込む方法と、Image InputからFusion Nodeを接続する方法があります。

Texture FormatはLat-Long、MirrorBall、Angular、Cube Mapped Vertical Cross等に対応します。

## Guide Radius

domeをsceneに対してどのscaleで見せるか調整します。

outdoor environmentだけでなくroom sizeに近いguideへ縮める用途もManualに記載されています。

## Classic DomeLightとの違い

- **uDome Light** — USD
- **DomeLight** — Classic 3D

名前が近いためNode familyを確認します。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 121 pp.2934–2936で、Scene / Image inputs、Color / Intensity、Guide Radius、Texture File / Formatを確認しました。
