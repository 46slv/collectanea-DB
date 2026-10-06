---
title: pKill
description: Region・age・Set・probability等の条件に合うParticleをdestroyし、後段から除外するNode。
doc_type: node
term_id: pkill
term_short: pKillは、条件に合うparticleを削除するNode。
verification: partial
aliases: [pKill, pKI]
concepts: [particle-data, particle-region]
nodes: [pKill]
node_family: particles
controls: [Conditions, Region]
inputs: [particle, region]
outputs: [particle]
tasks: [particles, kill, limit-particles]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# pKill

pKillは、条件に合う<Term id="particle-data">Particle</Term>をdestroyするNodeです。

「見えなくする」だけではなく、そのparticleをParticle setから取り除きます。

## 入力

オレンジ色のParticle inputへ前段Particleを接続します。

RegionをBitmap / Meshへすると、particleを消す範囲を2D Image / 3D Meshで指定できます。

## 固有Control

pKill固有のControlはありません。

ConditionsとRegionの共通Controlで「どのparticleを消すか」を決めます。

- Regionに入ったparticle
- lifespanの特定割合に達したparticle
- 特定Set
- Probabilityで選ばれたparticle

などを対象にできます。

## 最小構成

```text
pEmitter → pKill → pRender
             ↑
           Region
```

## 運用例

一定範囲から出たparticleを消したい場合、pKillのRegionをその境界として使います。

performance目的で単に画面外particleを消したい場合は、pRenderのKill Particles That Leave the Viewも候補です。pKillはregion / age / setなど、より明示的な条件でdestroyしたい場合に使います。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 114 p.2675で、Particle / Region input、Conditions / Regionによるkillを確認しました。
