---
title: pGradientForce
description: 2D ImageのAlpha gradientからforce fieldを作り、Particleを高いAlphaから低いAlpha方向へ加速させるNode。
doc_type: node
term_id: pgradientforce
term_short: pGradientForceは、ImageのAlpha gradientを使ってparticleへforceを加えるNode。
verification: partial
aliases: [pGradientForce, pGradient Force, pGF]
concepts: [particle-data, image-data, alpha, particle-region]
nodes: [pGradientForce]
node_family: particles
controls: [Random Seed, Strength, Conditions, Region]
inputs: [particle, image, region]
outputs: [particle]
tasks: [particles, gradient-force, flow-field]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# pGradientForce

pGradientForceは、2D <Term id="image">Image</Term>のAlpha gradientを読み、その傾きを<Term id="particle-data">Particle</Term>へforceとして適用するNodeです。

既定ではAlphaが高い場所から低い場所へ向かってparticleを加速させます。

## 入力

### Input

オレンジ色のParticle inputです。

### Image

緑色の2D Image inputです。Alpha channelのgradientをforce fieldとして使います。

### Region

Region tabをBitmap / Meshへすると、作用範囲を限定するRegion inputが追加されます。

## Strength

gradient forceの強さを決めます。

負の値にするとforce方向が反転し、Alphaが低い方から高い方へparticleを動かします。

## 最小構成

```text
Fast Noise ─────────────→ pGradientForce
                           ↑
pEmitter ──────────────────┘
             ↓
           pRender
```

Fast Noise等でAlpha gradientを作ると、particleが画像の明暗地形に沿って流れるようなmovementを作れます。

## 運用例

noise fieldに沿う煙やdust:

1. Fast Noiseでgrayscale patternを作ります。
2. Fast NoiseのAlphaをpGradientForceへ接続します。
3. Strengthを少量から上げます。
4. pTurbulenceと組み合わせる場合は、どちらがmovementの大きな流れを作るか分けて調整します。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 114 pp.2670–2671で、Particle / Image / Region inputs、Alpha gradient方向、Strength、negative Strengthの反転を確認しました。

gradient計算の内部式と実機性能は未確認です。
