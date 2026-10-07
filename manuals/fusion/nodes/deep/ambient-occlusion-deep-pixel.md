---
title: Ambient Occlusion (Deep Pixel)
description: Z・Normal・Cameraを使い、3D render後の2D Imageへscreen-space ambient occlusionを追加するpost-process Node。
doc_type: node
term_id: ambient-occlusion-deep-pixel
verification: partial
aliases: [Ambient Occlusion, SSAO, Ambient Occlusion (Deep Pixel)]
concepts: [auxiliary-channels, image-data, classic-3d]
nodes: [Ambient Occlusion]
node_family: deep
controls: [Output Mode, Kernel Type, Number of Samples, Kernel Radius, Lift, Gamma, Tint]
inputs: [image, camera, mask]
outputs: [image]
tasks: [aov, ambient-occlusion, post-process]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# Ambient Occlusion (Deep Pixel)

Ambient Occlusionは、render済み2D <Term id="image">Image</Term>に含まれるZ / NormalとCamera informationを使い、接触部や凹部を暗くするAOをpost-processで計算するNodeです。

ここでいう「Deep Pixel」は<Term id="deep-image">Deep Image</Term>のmulti-sample dataではありません。<Term id="auxiliary-channels">Auxiliary Channel / AOV</Term>付き2D Imageを扱います。

## 必要な入力

### Input

RGBAに加えてZ-DepthとNormalsを持つ2D Imageが必要です。

### Camera

そのImageをrenderしたCamera 3DまたはCameraを含む3D sceneを接続します。

InputかCameraのどちらかが欠けるとManual上はoutputをrenderしません。

### Effect Mask

AOを適用する画面範囲を限定します。

## Output Mode

- **Color** — source ImageへAOを適用した結果
- **AO** — AOだけをgrayscaleで出力

AOだけを出して別Merge / Multiplyで合成したい場合はAO modeを使います。

## Kernel Type

### Hemisphere

surface Normalを基準にhemisphereへrayを飛ばします。Manualでは通常こちらを推奨しています。

### Sphere

sample pointを中心としたsphereへrayを飛ばすstyleです。よりstylizedな結果を作れます。

## Number of Samples

sample数を増やすほどnoise / artifactを減らせますが、render timeが増えます。

## Kernel Radius

3D spaceでoccluderを探す距離です。

scene scaleに強く依存するため、AOが全く出ない / 全体が暗くなる場合はまずRadiusを調整します。

小さすぎると近傍occluderを見逃し、大きすぎるとqualityが下がり、より多くのSamplesが必要になります。

## Lift / Gamma / Tint

AO結果の見た目をartisticに調整します。

物理的なocclusion計算と最終lookを分けて考えます。

## 最小構成

```text
Renderer 3D (RGBA + Z + Normal) ──→ Ambient Occlusion → Output
Camera 3D ─────────────────────────→ Camera input
```

## 注意点

Manualはtransparent / translucent object、particle、anti-aliased edgeに制約があると説明しています。

AOはviewer-space post effectなので、cameraを動かすと同じsurfaceでもAO量が変わる場合があります。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 96 pp.2255–2258で、required inputs、Output Mode、Kernel、Samples、Radius、AO limitationsを確認しました。

実機renderer差とshot別最適値は未確認です。
