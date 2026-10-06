---
title: pCustomForce
description: expressionでParticleへ加えるXYZ forceとTorqueを計算し、独自physics / behaviorを作る高度なParticle Force Node。
doc_type: node
term_id: pcustomforce
term_short: pCustomForceは、独自expressionでparticleへのforceとTorqueを計算するNode。
verification: partial
aliases: [pCustomForce, pCustom Force, pCF]
concepts: [particle-data, expressions]
nodes: [pCustomForce]
node_family: particles
controls: [Number Inputs, Position Inputs, Setup, Intermediate, Force Expressions, Torque Expressions, Conditions, Region]
inputs: [particle, image, image, region]
outputs: [particle]
tasks: [particles, force, expressions, custom-physics]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# pCustomForce

pCustomForceは、<Term id="particle-data">Particle set</Term>へ加えるforceをexpressionで定義するNodeです。

particleのXYZ movementとTorqueを独自計算し、既存のForce Nodeでは作れないbehaviorを組み立てます。

## 入力

- Particle input
- custom calculation用の2D Image 1 / 2
- RegionをBitmap / Meshにした場合のRegion input

さらにInspectorから数値ControlやPosition Controlをexpressionへ渡せます。

## 何を計算するか

pCustomForceでは、position方向へ加えるforceと、particleのspinへ影響するTorqueを独立した式として扱います。

pCustomと同様、Setup / Intermediateを使って共通計算を分け、Image samplingや外部parameterを参照できます。

## 最小構成

```text
pEmitter → pCustomForce → pRender
                  ↑
             Image / Region
```

## 使う判断

単純なgravityなら[pDirectionalForce](./pdirectionalforce)、attract / repelなら[pPoint Force](./ppointforce)、chaosなら[pTurbulence](./pturbulence)の方が意図を読みやすくできます。

pCustomForceは、数式でforce fieldを設計する必要がある場合に選びます。

## pCustomとの違い

- **pCustomForce** — force / torqueとしてmovementへ作用
- **pCustom** — position、velocity、color、size等のparticle属性を直接expressionで操作

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 114 p.2657で、Particle / Image / Region inputs、custom position force / Torque、Number / Position input、pCustomと共通するInspector構造を確認しました。

expression syntax全体と実機performanceは未確認です。
