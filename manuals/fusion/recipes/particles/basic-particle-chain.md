---
title: 最小Particle chainを作る
description: pEmitterでParticle setを作り、pRenderで2D Imageへ戻す最小Graph。
doc_type: recipe
verification: partial
aliases: [basic particles, particle chain]
concepts: [particle-set, data-domain, frame-evaluation]
nodes: [pEmitter, pRender]
tasks: [particles, emit, render]
prerequisites: [data-domain]
level: intermediate
product_scope: fusion
---

# 最小Particle chainを作る

## Result

Particle setを生成し、2D ImageとしてViewer / Mergeへ渡せる最小構造を作ります。

## Requirements

- pEmitter
- pRender

## Steps

1. pEmitterを作ります。
2. pEmitterのParticle setをpRenderへ接続します。
3. pRender outputをViewerで確認します。
4. 必要ならpEmitterとpRenderの間へparticle modifier / forceを追加します。

```text
pEmitter → pRender → 2D Image
```

## Why This Works

pEmitterはParticle set domainを生成し、pRenderはそれを2D Image domainへ変換します。

## Variants / Alternatives

```text
pEmitter
  → pTurbulence
  → pFriction
  → pRender
```

のように、Particle setを保ったまま中間処理を追加できます。

## Failure Checks

- pEmitter outputを通常Image inputへ直接入れていないか。
- pRenderまでParticle set domainを維持しているか。
- current frame / timeでparticleが存在する条件になっているか。
- particle modifierを追加した直後から結果が消えていないか。

## Related Pattern

- [Last Good / First BadでGraphを切る](../../patterns/debugging/last-good-first-bad)

## Related Nodes

- [pEmitter](../../nodes/particles/p-emitter)
- [pRender](../../nodes/particles/p-render)
