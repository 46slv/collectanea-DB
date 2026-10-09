---
title: pFollow
description: 3D positionのFollow ObjectへParticleをspring-likeに引き寄せ、animated targetへ群れやstreamを追従させるNode。
doc_type: node
term_id: pfollow
term_short: pFollowは、particleをanimated follow pointへspring-likeに追従させるNode。
verification: partial
aliases: [pFollow, pFo]
concepts: [particle-data, particle-region]
nodes: [pFollow]
node_family: particles
controls: [Random Seed, Position XYZ, Spring, Dampen, Conditions, Region]
inputs: [particle, region]
outputs: [particle]
tasks: [particles, follow, swarm, motion-path]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# pFollow

pFollowは、<Term id="particle-data">Particle</Term>を3DのFollow Objectへ引き寄せ、springのように行き過ぎたり戻ったりするmovementを作るNodeです。

Follow ObjectのPositionをanimateすると、particleをmoving targetへ追従させられます。

## 入力

オレンジ色のParticle inputへ前段Particleを接続します。

Region tabをBitmap / Meshへすると、作用範囲を限定するRegion inputが追加されます。

## 主な設定

### Position XYZ

Follow Objectの位置です。

animateするとtarget pathになり、particle群がその位置へ向かうmovementを作れます。

### Spring

targetへ向かって行き過ぎ、戻るspring actionの強さを決めます。

大きいほどelasticなoscillationが強くなります。

### Dampen

spring movementの減衰量です。

大きくすると往復movementが早く収まり、小さいとoscillationが長く残ります。

## pFlockとの組み合わせ

```text
pEmitter → pFlock → pFollow → pRender
```

pFlockがparticle同士の群れ関係を作り、pFollowが群れ全体へmoving targetを与える構成です。

## 最小構成

```text
pEmitter → pFollow → pRender
```

まずPositionだけを動かし、Spring / Dampenを後から調整するとmovementの原因を追いやすくなります。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 114 pp.2667–2668で、Particle / Region input、Position XYZ、Spring、Dampen、pFlockとの組み合わせを確認しました。

spring simulation内部式と実機性能は未確認です。
