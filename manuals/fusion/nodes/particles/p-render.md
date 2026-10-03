---
title: pRender
description: Particle setを2D Imageへrasterizeするparticle domainのRenderer Node。
doc_type: node
verification: unverified
aliases: [pRender, Particle Render, PRN]
concepts: [data-domain, particle-set, rendering]
nodes: [pRender]
node_family: particles
inputs: [particle-set]
outputs: [image]
tasks: [particles, render, convert-domain]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
---

# pRender

Particle setを2D Imageへ変換するRenderer Nodeです。

## 概要

- **分類（Family）**: Particles / Render
- **入力データ（Input domain）**: Particle set
- **出力データ（Output domain）**: 2D Image
- **関連概念（Core concepts）**: domain conversion、particle rendering
- **よく使う作業（Common tasks）**: particle chainを通常の2D 合成へ戻す

## 入力

### Particle set

pEmitterやparticle modifiersを通ったParticle setを受け取ります。

## 出力

rasterized 2D Imageを出力します。

## 主な設定項目

render 見た目、動き blur、camera / depth等に関わるcontrolがある系統ですが、正確な 21.1 UIは未検証です。

## 挙動と注意点

pRenderはParticle setを通常のImage Nodeへ直接渡すための**domain boundary**として読みます。

```text
pEmitter → pTurbulence → pRender → Merge
```

## 最小例

Particle chainをpRenderでImageへ変換し、その後2D Mergeへ接続します。

## 関連する考え方

- [データ領域（data domain）を辿って診断する](../../learn/07-debugging/trace-data-domain)

## 関連パターン

Particle Patternは今後追加します。

## 似たNode・関連Node

- Renderer 3D — Classic 3D scene → 2D Image
- uRenderer — USD scene → 2D Image

## バージョンと検証状況

pRenderの存在とParticle set → 2D Image 役割は旧版のBlackmagic Design公式Fusion資料で確認。Fusion 21.1での正確な設定項目は未検証です。
