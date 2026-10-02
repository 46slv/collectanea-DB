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

## 作るもの（Result）

Particle setを生成し、2D ImageとしてViewer / Mergeへ渡せる最小構造を作ります。

## 必要なもの（Requirements）

- pEmitter
- pRender

## 手順（Steps）

1. pEmitterを作ります。
2. pEmitterのParticle setをpRenderへ接続します。
3. pRender outputをViewerで確認します。
4. 必要ならpEmitterとpRenderの間へparticle modifier / forceを追加します。

```text
pEmitter → pRender → 2D Image
```

## なぜこの構成で動くか（Why This Works）

pEmitterはParticle set domainを生成し、pRenderはそれを2D Image domainへ変換します。

## 別の方法（Variants / Alternatives）

```text
pEmitter
  → pTurbulence
  → pFriction
  → pRender
```

のように、Particle setを保ったまま中間処理を追加できます。

## うまくいかないときの確認（Failure Checks）

- pEmitter outputを通常Image inputへ直接入れていないか。
- pRenderまでParticle set domainを維持しているか。
- 現在の フレーム / timeでparticleが存在する条件になっているか。
- particle modifierを追加した直後から結果が消えていないか。

## 関連パターン（Related Pattern）

- [Last Good / First BadでGraphを切る](../../patterns/debugging/last-good-first-bad)

## 関連ノード（Related Nodes）

- [pEmitter](../../nodes/particles/p-emitter)
- [pRender](../../nodes/particles/p-render)
