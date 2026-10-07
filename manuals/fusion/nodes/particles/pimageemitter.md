---
title: pImage Emitter
description: 2D Imageのpixel gridをParticleへ変換し、pixel位置・Color・Alpha・Z channelをparticle generationへ利用するEmitter。
doc_type: node
term_id: pimageemitter
term_short: pImage Emitterは、source Imageのpixelからparticleを生成するNode。
verification: partial
aliases: [pImage Emitter, pImageEmitter, pIE]
concepts: [particle-data, image-data, alpha, depth]
nodes: [pImage Emitter]
node_family: particles
controls: [X Density, Y Density, Alpha Threshold, Lock Particle Color to Initial Frame, Create Particles Every Frame, Pivot XYZ, Use Z Channel for Particle Z]
inputs: [image, region]
outputs: [particle]
tasks: [particles, image-to-particles, pixel-particles]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# pImage Emitter

pImage Emitterは、2D <Term id="image">Image</Term>のpixel gridを元に<Term id="particle-data">Particle</Term>を生成するEmitterです。

Imageの形・色・Alphaをそのままparticle distributionへ使いたい場合に、通常のpEmitterより直接的です。

## 入力

主入力へ2D Imageを接続します。

入力Imageのpixel位置をparticleの初期位置へ使い、ColorやAlphaをparticle generationへ利用できます。

## 主な設定

### X / Y Density

pixel gridをどの密度でsampleしてparticleを作るかを決めます。

1.0は1 pixelあたり1 sampleです。小さくするとpointillisticに粗くなり、1より大きくするとpixelあたり複数particleを生成できます。

### Alpha Threshold

どのAlpha値以上のpixelからparticleを作るかを決めます。

soft Alphaを持つImageで、透明edgeから大量のparticleが生まれるのを抑えたい場合に使います。

### Lock Particle Color to Initial Frame

有効にするとparticleは誕生frameのColorを保持します。

無効ならsource Imageが時間で変化するとparticle colorも更新されます。

### Create Particles Every Frame

有効にすると毎frame新しいparticle setを生成します。

animated sourceから継続的にparticleを放出できますが、particle数が急速に増えるため注意します。

### Use Z Channel for Particle Z

source ImageにZ depth channelがある場合、pixelのdepthをparticleのZ位置へ使えます。

## 最小構成

```text
Image → pImage Emitter → pRender
```

## pEmitterとの違い

- **pEmitter** — Point / Region等を基準にparticleを生成
- **pImage Emitter** — Imageのpixel gridを直接particle distributionへ使う

logoを粒へ崩す、映像のpixelからparticle cloudを作る用途ではpImage Emitterが候補です。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 114 pp.2672–2674で、Image input、X/Y Density、Alpha Threshold、Color lock、Create Particles Every Frame、Z channel利用を確認しました。

全pEmitter共通Controlは[pEmitter](./p-emitter)を参照してください。
