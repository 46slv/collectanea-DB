---
title: pMerge
description: 2つのParticle streamを1つへ統合し、各particleのSet情報を保持したまま後段へ渡すParticle Combiner。
doc_type: node
term_id: pmerge
term_short: pMergeは、2つのParticle streamを1つへまとめるNode。
verification: partial
aliases: [pMerge, pMg]
concepts: [particle-data]
nodes: [pMerge]
node_family: particles
inputs: [particle, particle]
outputs: [particle]
tasks: [particles, merge-particles]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# pMerge

pMergeは、2つの<Term id="particle-data">Particle stream</Term>を1つにまとめるNodeです。

通常のMergeのように2D Imageを重ねるのではなく、2つのParticle setを1つのParticle setへ統合します。

## 入力

Particle 1とParticle 2の2入力を持ち、どちらもParticle Nodeの出力だけを受け取ります。

```text
pEmitter A ─┐
            ├─ pMerge → pRender
pEmitter B ─┘
```

## 出力

統合後のParticle setを出力します。

後段のForce / Behavior / pRenderからは1つのstreamとして扱われます。

## Control

pMerge固有のInspector Controlはありません。

役割はstreamの統合だけです。

## Particle Setは保持される

各Emitter等で割り当てたSet番号はpMerge後も保持されます。

たとえばEmitter AをSet 1、Emitter BをSet 2にしておけば、pMerge後のpDirectionalForceをSet 1だけへ適用する、といった分岐ができます。

## 最小構成

```text
pEmitter A ─┐
            ├─ pMerge → pRender (2D) → Merge
pEmitter B ─┘
```

「異なる見た目のparticleを同じforce fieldへ入れたい」「複数Emitterを1つのpRenderでrenderしたい」場合に使います。

## 通常のMergeとの違い

- **pMerge** — Particle set + Particle set → Particle set
- **Merge** — 2D Image + 2D Image → 2D Image
- **Merge 3D** — Classic 3D sceneをまとめる

名前は似ていますがdata domainが違います。

## 関連Node

- [pEmitter](./p-emitter)
- [pRender](./p-render)
- [Merge](../compositing/merge)
- Merge 3D

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 114 p.2676で、2 Particle入力、Controlなし、Set保持を確認しました。

実機性能は未確認のため `verification: partial` としています。
