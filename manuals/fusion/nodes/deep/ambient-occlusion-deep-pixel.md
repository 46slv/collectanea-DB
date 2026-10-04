---
title: Ambient Occlusion
description: Z-Depth・Normals・Cameraを使い、3D renderへscreen-spaceのAmbient Occlusionを追加するDeep Pixel post effect。
doc_type: node
term_id: ambient-occlusion-deep-pixel
verification: partial
aliases: [Ambient Occlusion, SSAO]
concepts: [auxiliary-channels, depth, normals, classic-3d]
nodes: [Ambient Occlusion]
node_family: deep
controls: [Output Mode, Kernel Type, Number of Samples, Kernel Radius, Lift, Gamma, Tint]
inputs: [image, camera, mask]
outputs: [image]
tasks: [ambient-occlusion, relight, auxiliary-channels]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# Ambient Occlusion

Ambient Occlusionは、3D renderに含まれるZ-DepthとNormalsを使い、接触部や入り組んだ場所を暗くするAOを2D post processとして生成するNodeです。

<Term id="deep-image">Deep Image</Term>の複数sampleを扱うNodeではありません。通常の2D Imageに付随するauxiliary channelを使います。

## 必要な入力

### Input

RGBAに加えてZ-DepthとNormalsを含む2D Imageが必要です。

Renderer 3Dを使う場合は、Z-DepthとNormalsをoutput channelとして有効にします。

### Camera

元ImageをrenderしたCamera 3Dまたはcameraを含む3D sceneを接続します。

InputとCameraのどちらかがないとAOを計算できません。

### Effect Mask

任意のMaskです。AOを適用する領域だけを限定します。

## Output Mode

- **Color** — 入力ImageへAOを適用した結果
- **AO** — AO成分だけをgrayscaleで出力

AO passを別に出し、Diffuse / Specular等と後段で組み合わせたい場合はAO modeを使います。

## Kernel Type

### Hemisphere

surface normal方向のhemisphereへsample rayを出します。Manualでは通常はこちらを推奨しています。

### Sphere

point周囲のsphereへrayを出し、よりstylizedな結果を作ります。

## Number of Samples / Kernel Radius

Number of SamplesはAO計算のsampling量です。

Kernel Radiusは3D spaceで「どの距離までoccluderを探すか」を決めます。scene scaleに強く依存するため、固定の万能値はありません。

Radiusが小さすぎると近接occlusionを拾えず、大きすぎるとquality低下を補うためSamplesを増やす必要があります。

## Lift / Gamma / Tint

AO結果をartisticに調整します。

AOの物理的な近似を作った後、合成用passとして見やすく整える用途です。

## 最小構成

```text
3D Scene → Renderer 3D ──→ Ambient Occlusion → Output
             │ Z + Normal          ↑
Camera 3D ─────────────────────────┘
```

## 注意点

Manualは次の制約を挙げています。

- transparent / translucent receiver・occluderでは制限がある
- transparent particleやanti-aliased edgeはAOと相性が悪い
- AOはviewer-space依存で、camera位置によって結果が変わり得る
- anti-aliasingを改善する場合、Renderer 3D側のZ / Normals passをHiQで出す

## Deep Imageとの違い

dMerge等は1 pixelの複数depth sampleを直接合成します。

Ambient Occlusionは2D Imageへ添付されたZ / Normals channelを読むpost effectであり、multi-sample Deep Image compositingではありません。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 96 pp.2255–2258で、Input / Camera / Mask、Output Mode、Kernel Type、Samples、Kernel Radius、AO limitationsを確認しました。

renderer別の精度・実機performanceは未確認です。
