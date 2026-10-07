---
title: pVortex
description: Particleへrotational forceと中心方向のpullを加え、Strength・Power・Size・Angleで渦movementを作るNode。
doc_type: node
term_id: pvortex
term_short: pVortexは、particleを中心へ引きながら回転させるVortex force Node。
verification: partial
aliases: [pVortex, pVt]
concepts: [particle-data, particle-region]
nodes: [pVortex]
node_family: particles
controls: [Random Seed, Strength, Power, Offset XYZ, Size, Angle X, Angle Y, Conditions, Region]
inputs: [particle, region]
outputs: [particle]
tasks: [particles, vortex, spiral]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# pVortex

pVortexは、<Term id="particle-data">Particle</Term>へrotational forceを加え、中心へ引き込みながらspiral movementを作るNodeです。

渦、竜巻、吸い込み、orbital motionの基礎に使えます。

## 主な設定

### Strength

Vortex forceの強さを決めます。

### Power

distanceに応じてStrengthがどれだけfalloffするかを決めます。

### Offset X / Y / Z

Vortex centerの位置を動かします。

### Size

Vortex forceの作用scaleを調整します。

### Angle X / Y

Vortexの回転axis / orientationを調整します。

## 最小構成

```text
pEmitter → pVortex → pRender
```

## 運用例

particleを渦へ吸い込む場合:

1. pEmitterで広めのRegionからparticleを出します。
2. pVortex centerを吸い込み位置へ置きます。
3. Strengthを上げてrotationを作ります。
4. Powerで外側particleへのforce falloffを調整します。
5. Size / Angleで渦の空間方向を合わせます。

## pPointForceとの違い

- **pPointForce** — centerへ直線的にattract / repel
- **pVortex** — center方向のpullとrotationを組み合わせる

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 114 pp.2690–2691で、Strength、Power、Offset XYZ、Size、Angle X/Yを確認しました。

Vortex内部式と実機performanceは未確認です。
