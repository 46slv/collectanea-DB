---
title: Vector Motion Blur
description: Motion Vector AOVまたはOptical Flowのvector mapを使い、pixelごとのX/Y movementに沿ったmotion blurを生成するNode。
doc_type: node
term_id: vector-motion-blur
verification: partial
aliases: [Vector Motion Blur, VMB]
concepts: [image-data, auxiliary-channels, motion-vectors]
nodes: [Vector Motion Blur]
node_family: blur-filter
controls: [X Channel, Y Channel, Flip Channel, Lock Scale X/Y, Scale]
inputs: [image, image, mask, mask]
outputs: [image]
tasks: [motion-blur, motion-vectors, aov]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# Vector Motion Blur

Vector Motion Blurは、pixelごとのmovementを記録したMotion Vector mapを読み、動きの方向と距離に沿って2D <Term id="image">Image</Term>をblurするNodeです。

3D rendererのMotion Vector AOVやFusionのOptical Flowからvectorを作れます。

## Motion Vectorとは

典型的には2つのfloat channelを使います。

- X vector — 横方向に何pixel動いたか
- Y vector — 縦方向に何pixel動いたか

正負の値が必要なため、Manualはfloat16 / float32 channelを前提に説明しています。

## 入力

### Input

motion blurを適用する2D Imageです。

### Vectors

必須のMotion Vector mapです。

3D rendererのAOVまたはOptical Flowから作ったvector Imageを接続します。

### Vector Mask

白色のpre-maskです。vector blur計算へ入るsourceを処理前に限定します。

### Effect Mask

青色のpost-effect Maskです。最終outputへEffectを適用する範囲を限定します。

## X / Y Channel

vector mapのどのchannelをX movement / Y movementとして使うか指定します。

rendererごとにvector channelの格納先が違う可能性があるため、source rendererのAOV仕様に合わせます。

## Flip Channel

X / Y vectorの符号を反転します。

blurが移動方向と逆へ伸びる場合に確認します。

## Scale

vector値へ倍率を掛け、motion blur lengthを調整します。

Lock Scale X/Yを外すとaxis別scaleを使えます。

## 最小構成

```text
Beauty Image ─────→ Vector Motion Blur → Output
Motion Vector AOV ─→ Vectors
```

Fusionでvectorを作る場合:

```text
Image → Optical Flow ─→ vectors
  └──────────────────→ Vector Motion Blur
```

## Directional Blurとの違い

- **Directional Blur** — Image全体へ同じdirection / center modelを適用
- **Vector Motion Blur** — pixelごとに異なるmotion vectorを使う

objectごとにmovementが違うshotではVector Motion Blurが本来のmotionに近い結果を作れます。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 92 pp.2128–2130で、Motion Vector形式、4 inputs、X/Y Channel、Flip、Scaleを確認しました。

rendererごとのvector convention / normalizationはsource renderer側の仕様確認が必要です。
