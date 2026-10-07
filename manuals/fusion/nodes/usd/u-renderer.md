---
title: uRenderer
description: USD sceneをStormで2D Imageへrenderし、Color・Depth・PrimID・Camera Depth等のAOVをlayerまたはchannelとして出力するRenderer。
doc_type: node
term_id: u-renderer
verification: partial
aliases: [uRenderer, USD Renderer, uRn]
concepts: [usd-scene, rendering, aov, image-data]
nodes: [uRenderer]
node_family: usd
controls: [Camera, Renderer Type, Output AOVs As Layers, AOV, Lighting, Enable Sky Dome, Complexity, Aux Channel Z, Film Back Fit, Max Iterations, Width, Height, Pixel Aspect, Auto Resolution, Depth, Domain Overscan, Overscan, Render Color Space]
inputs: [usd, mask]
outputs: [image]
tasks: [usd, render-3d, convert-domain, aov]
level: advanced
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# uRenderer

uRendererは、<Term id="usd-scene">USD scene</Term>を2D <Term id="image">Image</Term>へrenderするUSD pipelineの終端Nodeです。

## 入力

### Scene Input

必須のUSD scene inputです。uMergeや他USD Nodeのscene outputを接続します。

### Effect Mask

青色の任意inputです。render後のoutput範囲をMaskで限定します。

## Camera / Renderer Type

Camera menuからscene内cameraを選びます。

Defaultでは最初に見つかったcameraを使い、sceneにcameraがなければdefault perspective viewを使います。

Renderer Typeは21.1 ManualではStormのみです。

## AOV

uRendererはbeauty Colorだけでなく追加passを出せます。

Manual記載の代表AOV:

- Color
- Depth
- PrimID
- Camera Depth

Output AOVs As Layersを有効にすると、既存AOVを別layerとしてまとめて出力できます。

### DepthとCamera Depth

Depthはframeごとに正規化されたblack-white depth mapです。

Camera Depthはcameraとの実距離に基づくfloat32 depthで、見た目は黒く見える場合があります。用途が異なるため混同しません。

### Aux Channel Z

Camera DepthをZ auxiliary channelへrenderします。

## Lighting

- None — lightingなし
- Camera — default camera light
- Scene — USD scene内Light
- Enable Sky Dome — sky dome textureをrender

sceneへLightを入れただけでなく、uRenderer側のLighting modeも確認します。

## Complexity / Max Iterations

render detailとiteration数を調整します。

qualityを上げるほど重くなるため、目的に必要な設定で使います。

## Image tab

Width / Height、Pixel Aspect、Auto Resolution、Depthを設定します。

Auto ResolutionではTimeline resolutionを使います。

Domain Overscan / Overscanでdisplay / data window外のpixelもrenderでき、camera stabilizationやlens distortionの余白を確保できます。

## Color space

Render Color SpaceでLinear / sRGBを選べます。

Source Color Space / Gamma Spaceのmetadata / curve処理も持ちます。これらとGamut等の明示的colorspace変換を同じ意味として扱いません。

## 最小構成

```text
uLoader → uMerge → uRenderer → MediaOut
```

## Renderer 3Dとの違い

- **uRenderer** — USD scene
- **Renderer 3D** — Classic 3D scene

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 121 pp.2911–2914で、Scene / Effect Mask、Camera、Storm、AOV、Lighting、Complexity、Z channel、Image controls、Overscan、Color Spaceを確認しました。

Hydra / Storm内部仕様、GPU差、AOVのruntime performanceは未確認です。
