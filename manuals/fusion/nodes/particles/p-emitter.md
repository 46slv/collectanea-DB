---
title: pEmitter
description: Particle setを生成するFusion particle systemの基本Emitter Node。
doc_type: node
verification: unverified
aliases: [pEmitter, Particle Emitter]
concepts: [data-domain, particle-set, time]
nodes: [pEmitter]
node_family: particles
outputs: [particle-set]
tasks: [particles, emit, procedural-motion]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
---

# pEmitter

Particle setを生成する基本Emitter Nodeです。

## 概要（At a Glance）

- **分類（Family）**: Particles
- **出力データ（Output domain）**: Particle set
- **関連概念（Core concepts）**: particle state、time、typed data
- **よく使う作業（Common tasks）**: particle生成、particle chainの開始

## 入力（Inputs）

region / 見た目 / 参照元等の補助入力を持つ場合がありますが、正確な 21.1 port構成は未検証です。

## 出力（Output）

Particle setを出力します。

これは通常の2D Imageではありません。

## 主な設定項目（Controls）

emission rate、region、velocity、lifespan、見た目等に関わるcontrolを持つ系統ですが、正確な 21.1 label / 初期値 / 範囲は現在の資料または実機での確認待ちです。

## 挙動と注意点（Behavior / Notes）

Particle stateは位置だけでなくvelocity、age、size、見た目等を持つdataとして扱います。

```text
pEmitter
  → particle modifiers / forces
  → pRender
  → 2D Image
```

Imageを直接「点の配列」にしたものとして扱わないことが重要です。

## 最小例（Minimal Examples）

```text
pEmitter → pRender → 2D Merge
```

## 関連する考え方（Concepts）

- [データ領域（data domain）を辿って診断する](../../learn/07-debugging/trace-data-domain)
- [フレーム 評価](../../learn/05-time/frame-evaluation)

## 関連する再利用構成（Patterns）

Particle Patternは今後追加します。

## 似たNode・関連Node

- pImageEmitter
- pSpawn
- pMerge
- pTurbulence

## バージョンと検証状況

pEmitterの存在とParticle set generatorという役割は旧版のBlackmagic Design公式Fusion資料で確認。Fusion 21.1での正確な設定項目 / portsは未検証です。
