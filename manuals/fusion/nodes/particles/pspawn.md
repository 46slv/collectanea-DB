---
title: pSpawn
description: 既存Particle自身をEmitterとして新しいParticleを生成し、burst・trail・firework等の二次発生を作るNode。
doc_type: node
term_id: pspawn
term_short: pSpawnは、既存particleから新しいparticleを生成するNode。
verification: partial
aliases: [pSpawn, pSp]
concepts: [particle-data, particle-region]
nodes: [pSpawn]
node_family: particles
controls: [Affect Spawned Particles, Velocity Transfer, Number, Lifespan, Style, Conditions, Region]
inputs: [particle, image, region]
outputs: [particle]
tasks: [particles, spawn, fireworks, trail]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# pSpawn

pSpawnは、既存<Term id="particle-data">Particle</Term>を小さなEmitterとして扱い、そこから新しいparticleを生成するNodeです。

rocketの先端からsparkを出す、particleが一定ageになったらburstする、といった二次発生に使います。

## 入力

オレンジ色のParticle inputへsource particleを接続します。

StyleをBitmapにするとspawned particle用Image input、RegionをBitmap / MeshにするとRegion inputが追加されます。

## pEmitterと共通するControl

Number、Lifespan、Velocity、Style等、多くのControlはpEmitterと同じ考え方でspawned particleの初期状態を決めます。

## pSpawn固有Control

### Affect Spawned Particles

spawnされたparticleも後続frameでpSpawnの対象にします。

有効にするとparticleがparticleを生み、そのparticleもさらにparticleを生むため、数が指数的に増える場合があります。必要な場合だけ使います。

### Velocity Transfer

source particleのVelocityをspawned particleへどれだけ引き継ぐかを決めます。

1.0ならsourceのmovementを100%引き継ぎます。

## Conditionsで発生timingを制限する

pSpawnは対象particleが作用条件に入っている間、継続的にparticleを生成します。

Start / End Age、Probability、Sets、Region等を使い、意図したtimingだけpSpawnが作用するよう制限します。

## 最小構成

```text
pEmitter → pSpawn → pRender
```

## 運用例

rocket → firework burst:

1. pEmitterでrocket particleを作ります。
2. pSpawnを追加します。
3. ConditionsのAgeでrocket寿命後半だけspawnするよう限定します。
4. spawned particleのNumber / Velocity / Angleを広げます。
5. pRenderで確認します。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 114 pp.2685–2686で、inputs、pEmitter共通Control、Affect Spawned Particles、Velocity Transfer、Conditionsによる制限を確認しました。

spawn growthの性能上限は実機未確認です。
