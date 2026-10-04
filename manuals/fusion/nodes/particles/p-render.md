---
title: pRender
description: Particle setを2D Imageまたは3D geometryへ変換し、Pre-Rollやsub-frame計算を管理するParticle chainの終端Node。
doc_type: node
term_id: p-render
verification: partial
aliases: [pRender, Particle Render, pRn]
concepts: [particle-data, rendering, data-domain, time]
nodes: [pRender]
node_family: particles
controls: [Output Mode, Restart, Pre-Roll, Automatic Pre-Roll, Only Render in Hi-Q, View, Blur, Glow, Sub-Frame Calculation Accuracy, Pre-Generate Frames, Kill Particles That Leave the View, Generate Z Buffer, Depth Merge Particles, Z Clip]
inputs: [particle, camera, mask]
outputs: [image, 3d-scene]
tasks: [particles, render, convert-domain]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# pRender

pRenderは、<Term id="particle-data">Particle set</Term>を見える結果へ変換するParticle chainの終端Nodeです。

2D modeでは通常の2D Imageを出力し、3D modeではClassic 3D sceneへ渡せるparticle geometryを出力します。既定は3Dです。

## 入力

### Input

オレンジ色のParticle inputです。pEmitterやparticle modifier / forceの出力を接続します。

### Camera Input

緑色の任意入力です。Camera 3Dまたはcameraを含む3D sceneを接続し、particleをrenderするviewpointを指定します。

### Effect Mask

青色の任意入力です。2D particle outputの表示範囲をMaskでcropします。

## Output Mode

### 2D

Particleを2D Imageへrenderします。

```text
pEmitter → pRender (2D) → Merge
```

2D Blur、Color Corrector、Merge等へ続けられます。

### 3D

Particleを3D scene側へ出力します。

```text
pEmitter → pRender (3D) → Merge 3D → Renderer 3D
```

他の3D objectやLightと同じsceneで扱ってからRenderer 3Dへ渡せます。

## Pre-Roll

Particle systemは前frameの状態を基準に現在frameを計算します。

frame 0から90へ直接jumpすると、間のframeを計算していないため正しくないstateになることがあります。

### Pre-Roll

render rangeの先頭から現在frameまでParticle stateだけを再計算します。

### Automatic Pre-Roll

current frameを大きく移動したとき自動でPre-Rollします。

軽いParticle systemでは有効のまま使いやすく、重いsystemでは必要な時だけ手動Pre-Rollする方が操作を軽くできる場合があります。

### Restart

現在frameでParticle systemを初期化し、それ以前のparticleを捨ててそこから再開始します。

## Sub-Frame Calculation Accuracy

frame間を何回sub-sampleしてParticle movementを計算するかを決めます。

速いmovement、collision、point force等で1 frameごとのsamplingが粗い場合にaccuracyを上げられますが、計算量も増えます。

## Pre-Generate Frames

最初の有効frameより前からParticle systemを計算します。

shot開始時点ですでに煙やparticleが画面内に存在してほしい場合に使います。

## 2D render用Control

2D modeではBlur / Glow等をpRender内で適用できます。

Manualでは、これらはpRender後にBlurを置くのと同じ結果になると説明されています。Graph上の責任を分けたい場合はpRender後へ別Nodeを置く選択もできます。

### Kill Particles That Leave the View

visible boundsを出たparticleをdestroyし、再び戻ってこないようにします。

performanceを改善できる場合がありますが、後で画面外から戻るmovementを作る構成には向きません。

### Generate Z Buffer

particleのdepthをZ channelとして生成します。

Depth BlurやZ Merge等の後段処理へ使えますが、render costは増えます。

### Depth Merge Particles

通常のlayer順ではなくdepth-aware mergeでParticleを合成します。

## View / Camera

2D modeではScene Perspective / orthographic等のViewを選べます。

Camera InputへCamera 3Dを接続すると、そのcameraがviewpointを決めます。

## 最小構成

```text
pEmitter → pRender
```

まずOutput Modeを確認し、2D Imageとして使うなら2Dへ切り替えます。

「pEmitterはあるのに何も見えない」ときは、pRenderが存在するか、Output Modeが後段domainと合っているかを最初に確認します。

## Renderer 3Dとの違い

- **pRender** — Particle setを2DまたはClassic 3Dへ変換
- **Renderer 3D** — Classic 3D scene全体を2D Imageへrender

3D Particle systemでは両方を使う構成があります。

## 関連する考え方

- [パーティクル（Particle）](../../learn/02-data/particle)
- [フレーム評価](../../learn/05-time/frame-evaluation)
- [データ領域を辿って診断する](../../learn/07-debugging/trace-data-domain)

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 114 pp.2678–2684で、3入力、2D / 3D Output Mode、Pre-Roll、Sub-Frame Calculation Accuracy、Pre-Generate Frames、2D render controls、Z Buffer等を確認しました。

全Style別render差、3D material挙動、実機performanceは未確認のため `verification: partial` としています。
