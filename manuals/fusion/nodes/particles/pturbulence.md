---
title: pTurbulence
description: Particle movementへfrequency-basedな乱れを加え、Strength・Strength Over Life・Densityで自然な不規則motionを作るNode。
doc_type: node
term_id: pturbulence
term_short: pTurbulenceは、particleのmovementへ不規則なturbulenceを加えるNode。
verification: partial
aliases: [pTurbulence, pTr]
concepts: [particle-data, particle-region]
nodes: [pTurbulence]
node_family: particles
controls: [Random Seed, Strength XYZ, Strength Over Life, Density, Conditions, Region]
inputs: [particle, region]
outputs: [particle]
tasks: [particles, turbulence, natural-motion]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# pTurbulence

pTurbulenceは、<Term id="particle-data">Particle</Term>のmovementへfrequency-basedな乱れを加えるNodeです。

直線的すぎる煙・dust・fire等へ不規則なmotionを足すときに使います。

## 主な設定

### Strength X / Y / Z

各axisへ加えるturbulenceの強さを決めます。

特定方向だけ乱したい場合はaxisごとに調整します。

### Strength Over Life

particle ageに応じてturbulence量を変えます。

たとえば誕生直後はまっすぐ進み、寿命後半ほど煙のように乱れるmovementを作れます。

### Density

turbulence fieldの細かさを変えます。

低い値では多くのparticleがまとまって似た方向へ揺れ、高い値ではparticleごとの細かなvariationが増えます。

## 最小構成

```text
pEmitter → pTurbulence → pRender
```

## 運用例

煙のmovement:

1. pEmitterで上向きVelocityを作ります。
2. pTurbulenceのX / Y Strengthを少量追加します。
3. Densityで大きなうねりと細かな揺れの比率を調整します。
4. Strength Over Lifeで後半ほど乱れを増やします。
5. pRenderで確認します。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 114 pp.2689–2690で、Strength XYZ、Strength Over Life、Densityを確認しました。

turbulence field内部algorithmと実機performanceは未確認です。
