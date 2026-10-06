---
title: pFriction
description: ParticleのVelocityとSpinへ抵抗を加え、指定region内でmovementやrotationを減衰させるNode。
doc_type: node
term_id: pfriction
term_short: pFrictionは、particleのvelocityとspinを減衰するNode。
verification: partial
aliases: [pFriction, pFr]
concepts: [particle-data, particle-region]
nodes: [pFriction]
node_family: particles
controls: [Random Seed, Velocity Friction, Spin Friction, Conditions, Region]
inputs: [particle, region]
outputs: [particle]
tasks: [particles, friction, slow-motion]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# pFriction

pFrictionは、<Term id="particle-data">Particle</Term>のVelocityとSpinへ抵抗を加え、movementやrotationを時間とともに弱めるNodeです。

空気抵抗、粘性、bounce後にだんだん止まるmovementなどを作るときに使います。

## 入力

オレンジ色のParticle inputへ前段Particleを接続します。

Region tabをBitmap / Meshへすると、frictionを適用する範囲を定義するRegion inputが追加されます。

## 主な設定

### Velocity Friction

particleのVelocityへ抵抗を加えます。

値を上げるほどmovementが強く減衰し、particleが早くslow downします。

### Spin Friction

particleのRotation / Spinへ抵抗を加えます。

移動speedは保ちながら回転だけ止めたい場合など、Velocity Frictionとは別に調整します。

## 最小構成

```text
pEmitter → pFriction → pRender
```

## 運用例

床で数回bounceして止まるparticle:

```text
pEmitter → pDirectionalForce → pBounce → pFriction → pRender
```

pBounceがcollisionを作り、pFrictionが残ったVelocity / Spinを減らします。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 114 pp.2668–2669で、Particle / Region input、Velocity Friction、Spin Frictionを確認しました。

friction内部式と実機performanceは未確認です。
