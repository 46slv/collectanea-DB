---
title: pPointForce
description: 3D空間の1点を中心にParticleを引き寄せる/反発させ、Strength・Power・Limit Forceで距離依存のforceを作るNode。
doc_type: node
term_id: ppointforce
term_short: pPointForceは、1点を中心にparticleをattract / repelするNode。
verification: partial
aliases: [pPointForce, pPoint Force, pPF]
concepts: [particle-data, particle-region]
nodes: [pPointForce]
node_family: particles
controls: [Random Seed, Strength, Power, Limit Force, Center XYZ, Conditions, Region]
inputs: [particle, region]
outputs: [particle]
tasks: [particles, attract, repel, point-force]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# pPointForce

pPointForceは、3D spaceの1点を中心に<Term id="particle-data">Particle</Term>を引き寄せたり反発させたりするNodeです。

## 主な設定

### Strength

正の値でcenterへattract、負の値でcenterからrepelします。

### Power

distanceに応じてforceがどれだけ弱くなるかを決めます。

0ではdistanceによるfalloffがなく、値を上げるほどcenterから離れたparticleへforceが届きにくくなります。

### Limit Force

sub-frame samplingが粗い場合、particleがcenterを一気に通り越して反対側へ大きく飛ばされることがあります。

Limit Forceを上げると、そのovershootを抑えるために使えます。必要ならpRenderのSub-Frame Calculation Accuracyも合わせて確認します。

### Center XYZ

force中心の3D位置です。

animateするとmoving attractor / repellerを作れます。

## 最小構成

```text
pEmitter → pPointForce → pRender
```

## pDirectionalForceとの違い

- **pPointForce** — 1点との距離・方向でforceが変わる
- **pDirectionalForce** — 一定方向へ同じforceを加える

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 114 p.2677で、Strength、Power、Limit Force、Center XYZを確認しました。

force integrationの内部式は未確認です。
