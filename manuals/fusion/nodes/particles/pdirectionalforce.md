---
title: pDirectionalForce
description: Particleへ一定方向のforceを加え、Strength・Direction・Direction Zでgravityやwindのようなmovementを作るNode。
doc_type: node
term_id: pdirectionalforce
term_short: pDirectionalForceは、particleへ一定方向のforceを加えるNode。
verification: partial
aliases: [pDirectionalForce, pDirectional Force, pDF]
concepts: [particle-data, particle-region]
nodes: [pDirectionalForce]
node_family: particles
controls: [Random Seed, Strength, Direction, Direction Z, Conditions, Region]
inputs: [particle, region]
outputs: [particle]
tasks: [particles, force, gravity, wind]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# pDirectionalForce

pDirectionalForceは、<Term id="particle-data">Particle</Term>へ同じ方向のforceを加えるNodeです。

最も代表的な用途はgravityで、既定方向は下向きです。horizontal windのようなmovementにも使えます。

## 入力

オレンジ色のParticle inputへ前段Particleを接続します。

RegionをBitmap / Meshにすると、forceを適用する範囲を定義する2D Image / 3D Mesh inputが追加されます。

## 主な設定

### Strength

forceの強さを決めます。

正の値は指定方向、負の値は逆方向へparticleを加速します。

### Direction

XY plane上のforce方向を決めます。

### Direction Z

Z方向、つまりcameraへ近づく / 遠ざかる成分を決めます。

## 最小構成

```text
pEmitter → pDirectionalForce → pRender
```

pEmitterのVelocityが初速、pDirectionalForceが時間とともに加わるaccelerationとして考えると、役割を分けやすくなります。

## 運用例

上へ噴き出してから落下するparticle:

1. pEmitterのVelocity / Angleで上向きの初速を作ります。
2. pDirectionalForceを下向きへ設定します。
3. Strengthを調整し、上昇から下降へ切り替わるtimingを決めます。
4. pRenderで確認します。

## pPoint Forceとの違い

- **pDirectionalForce** — scene全体またはRegion内で一定方向
- **pPoint Force** — 1点を中心にattract / repel

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 114 pp.2658–2659で、Particle / Region input、Strength、Direction、Direction Z、gravity用途を確認しました。

Forceの内部integratorや実機性能は未確認です。
