---
title: pCustom
description: expressionでParticleのposition・velocity・rotation・spin・size・RGBA等を直接計算する高度なParticle Processor。
doc_type: node
term_id: pcustom
term_short: pCustomは、expressionでparticle属性を直接計算するNode。
verification: partial
aliases: [pCustom, pCu]
concepts: [particle-data, expressions]
nodes: [pCustom]
node_family: particles
controls: [Number 1-8, Position 1-8, Setup 1-8, Intermediate 1-8, Particle Expressions, Conditions, Region]
inputs: [particle, image, image, region]
outputs: [particle]
tasks: [particles, expressions, custom-particle]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# pCustom

pCustomは、expressionを使って<Term id="particle-data">Particle</Term>の属性を直接計算する高度なProcessorです。

通常のpDirectionalForceやpFrictionでは表せない独自movement、color変化、size制御などを式で作ります。

## 入力

- **Input** — Particle set
- **Image 1 / Image 2** — expressionからpixel値を参照する2D Image
- **Region** — Bitmap / Mesh Regionを使う場合に追加される入力

Image inputは通常のcompositing用ではなく、custom calculationの参照元として使います。

## Number / Position inputs

### Number 1–8

animationやModifierへ接続できる数値Controlです。

expression側から `n1` 〜 `n8` 等として参照でき、外部ControlをpCustom式へ渡すparameterとして使います。

### Position 1–8

XYZ position Controlです。

animated pointや別Controlをexpressionへ渡す用途です。

## Setup / Intermediate

### Setup 1–8

frameごとに最初に評価される式です。

複数のParticle expressionから共通利用する値を先に計算する用途に向きます。

### Intermediate 1–8

Setup後にframeごとに評価され、Particle channel expressionから参照できます。

複雑な式を段階的に分けるための中間値として使います。

## Particle属性

Manualではposition、velocity、rotation、spin、size、RGBA、particle ID、age、lifespan、Region hit / distance / normal、Image size等がexpressionから参照可能とされています。

つまりpCustomは「画素ごとのCustom Node」のParticle版に近く、個々のparticle stateへ式を適用します。

## 最小構成

```text
pEmitter → pCustom → pRender
               ↑
          Image / Region
```

## 使う判断

既存Particle Nodeで目的を表せる場合は、pDirectionalForce / pTurbulence / pFriction等の方がGraphの意味を読みやすくできます。

pCustomは「既存Nodeの組み合わせでは足りない」「particle属性を式で明示的に計算したい」場合に使います。

## pCustomForceとの違い

- **pCustom** — particleの各属性をexpressionで操作
- **pCustomForce** — custom force / torqueの計算へ特化

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 114 pp.2653–2656で、Particle / Image / Region inputs、Number / Position、Setup / Intermediate、Particle expression variablesを確認しました。

expression syntax全体、全variableのversion差、実機性能は未確認です。
