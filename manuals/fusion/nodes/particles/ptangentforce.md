---
title: pTangentForce
description: RegionとParticleを結ぶvectorに対して接線方向のforceを加え、region周囲を回り込むmovementを作るNode。
doc_type: node
term_id: ptangentforce
term_short: pTangentForceは、regionに対する接線方向へparticleを動かすNode。
verification: partial
aliases: [pTangentForce, pTangent Force, pTF]
concepts: [particle-data, particle-region]
nodes: [pTangentForce]
node_family: particles
controls: [Random Seed, Center Position XYZ, Center Strength XYZ, Conditions, Region]
inputs: [particle, region]
outputs: [particle]
tasks: [particles, tangent-force, orbit]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# pTangentForce

pTangentForceは、Regionと<Term id="particle-data">Particle</Term>を結ぶvectorに対して垂直な方向、つまり接線方向へforceを加えるNodeです。

particleをregionへ直接引き寄せるのではなく、その周囲を回り込むようなmovementを作れます。

## 主な設定

### Center Position XYZ

tangent forceの中心位置を指定します。

### Center Strength XYZ

各axisで接線方向forceの強さを決めます。

## 最小構成

```text
pEmitter → pTangentForce → pRender
```

Regionを設定した場合、その形に対するtangent方向へparticle movementが変化します。

## pVortexとの違い

- **pTangentForce** — region / centerとの幾何関係から接線方向forceを作る
- **pVortex** — rotational forceと中心への引き寄せを組み合わせた渦movementを作る

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 114 pp.2687–2688で、Particle / Region input、Center Position / Strength XYZを確認しました。
