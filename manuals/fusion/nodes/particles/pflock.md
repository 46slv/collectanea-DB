---
title: pFlock
description: Particle同士のfollow・attract・repelとspacingを組み合わせ、群れのようなcollective movementを作るNode。
doc_type: node
term_id: pflock
term_short: pFlockは、particle同士の距離と追従関係から群れmovementを作るNode。
verification: partial
aliases: [pFlock, pFl]
concepts: [particle-data, particle-region]
nodes: [pFlock]
node_family: particles
controls: [Random Seed, Flock Number, Follow Strength, Attract Strength, Repel Strength, Minimum Space, Maximum Space, Conditions, Region]
inputs: [particle, region]
outputs: [particle]
tasks: [particles, flock, swarm]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# pFlock

pFlockは、<Term id="particle-data">Particle</Term>同士が「近くの仲間へ付いていく」「離れすぎたら近づく」「近すぎたら離れる」という挙動を組み合わせ、群れmovementを作るNodeです。

鳥の群れ、魚、虫、群衆的なswarm表現の基礎になります。

## 主な設定

### Flock Number

各particleが何個のneighborをfollow対象として見るかを決めます。

値を上げると大きなgroupへまとまりやすくなります。

### Follow Strength

neighborのmovementへどれだけ強く追従するかを決めます。

### Attract Strength

Maximum Spaceより離れたparticle同士を近づけるforceです。

### Repel Strength

Minimum Spaceより近づいたparticle同士を離すforceです。

### Minimum / Maximum Space

particleが保とうとする距離rangeです。

狭いrangeでは整った群れになりやすく、広いrangeでは散らばったmovementになります。

## pFollowとの組み合わせ

pFlockだけではgroup内関係を作ります。

[pFollow](./pfollow)を追加してmoving targetを与えると、群れ全体を特定pointやpathへ誘導できます。

```text
pEmitter → pFlock → pFollow → pRender
```

## 最小構成

```text
pEmitter → pFlock → pRender
```

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 114 pp.2665–2666で、Flock Number、Follow / Attract / Repel Strength、Minimum / Maximum Space、pFollowとの組み合わせを確認しました。

群れsimulation内部仕様と性能は未確認です。
