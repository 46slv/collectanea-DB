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

## At a Glance

- **Family**: Particles
- **Output domain**: Particle set
- **Core concepts**: particle state、time、typed data
- **Common tasks**: particle生成、particle chainの開始

## Inputs

region / style / source等の補助入力を持つ場合がありますが、exact 21.1 port構成は未検証です。

## Output

Particle setを出力します。

これは通常の2D Imageではありません。

## Controls

emission rate、region、velocity、lifespan、style等に関わるcontrolを持つ系統ですが、exact 21.1 label / default / rangeはcurrent verification待ちです。

## Behavior / Notes

Particle stateは位置だけでなくvelocity、age、size、style等を持つdataとして扱います。

```text
pEmitter
  → particle modifiers / forces
  → pRender
  → 2D Image
```

Imageを直接「点の配列」にしたものとして扱わないことが重要です。

## Minimal Examples

```text
pEmitter → pRender → 2D Merge
```

## Related Concepts

- [Data domainを辿って診断する](../../learn/07-debugging/trace-data-domain)
- [Frame Evaluation](../../learn/05-time/frame-evaluation)

## Related Patterns

Particle Patternは今後追加します。

## Similar / Adjacent Nodes

- pImageEmitter
- pSpawn
- pMerge
- pTurbulence

## Version / Verification Notes

pEmitterのidentityとParticle set generatorという役割はlegacy-primary Fusion referenceで確認。21.1 exact controls / portsは未検証です。
