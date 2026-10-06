---
title: パーティクル（Particle）
description: FusionのParticle setを、2D Imageとは別の「多数のparticle状態を保持するデータ」として理解し、pEmitterからpRenderまでの流れを読む。
doc_type: concept
term_id: particle-data
term_short: pEmitterやparticle modifierが扱い、pRenderで2D Imageまたは3D出力へ変換するparticle状態の集合。
verification: partial
aliases: [Particle, Particle set, particle data, パーティクル]
concepts: [particle-set, data-domain, frame-evaluation]
nodes: [pEmitter, pRender, pMerge]
tasks: [particles, debug, choose-node]
prerequisites: [image-data, typed-connections]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# パーティクル（Particle）

FusionのParticle setは、雨粒や火花の見た目を描いたImageそのものではありません。各particleの位置・速度・寿命・回転・size・colorなどの状態をまとめて保持し、particle系Nodeの間で受け渡すデータです。

## 基本の流れ

最小構成は次です。

```text
pEmitter → pRender
```

pEmitterがparticleを生成し、pRenderがparticle systemを2D Imageまたは3D出力へ変換します。

pEmitterとpRenderの間へforceやbehavior Nodeを追加すると、Particle setのまま動きや状態を変更できます。

```text
pEmitter → pDirectionalForce → pFriction → pRender
```

## Particle setと2D Imageの違い

pEmitterの出力はViewerへ直接表示する通常のRGBA Imageではありません。

Particle setには「どこにいるか」「どの方向へ動くか」「何frame存在するか」といった状態があります。そのため通常のBlurやColor Correctorは、pRenderでImageへ変換した後に使います。

```text
pEmitter → pTurbulence → pRender → Blur → Merge
            Particle       ↑        Image
              set          └ domain boundary
```

## Particleを作る

- **pEmitter** — Number、Lifespan、Velocity、Angle、Rotation、Spin、Style、Region等でparticleを生成する。
- **pImage Emitter** — 2D Imageのpixel情報を元にparticleを生成する。
- **pSpawn** — 既存particleから新しいparticleを生成する。

## Particleを変える

Particle setの途中へNodeを挟み、状態を変えます。

- **pDirectionalForce** — 一定方向へforceを加える。gravity用途。
- **pFriction** — velocity / spinを減衰する。
- **pTurbulence** — 不規則なmovementを加える。
- **pVortex** — 渦状のforceを加える。
- **pBounce** — regionとのinteractionでmovementを変える。

この段階ではまだ2D Imageへ変換されていません。

## Particle streamをまとめる

pMergeは2つのParticle streamを1つへまとめます。

```text
pEmitter A ─┐
            ├─ pMerge → pRender
pEmitter B ─┘
```

各Emitterで割り当てたParticle Setは保持されるため、pMerge後でもdownstream Nodeから特定Setだけを対象にできます。

## pRenderで表示可能な結果へ変える

pRenderはparticle chainのrender boundaryです。

### 2D Output

2D modeでは通常の2D Imageを出力し、Merge等へ接続できます。

```text
pEmitter → pRender (2D) → Merge
```

### 3D Output

pRenderの既定は3D outputです。3D particle systemをMerge 3D等へ渡し、Renderer 3Dで2D Imageへ変換できます。

```text
pEmitter → pRender (3D) → Merge 3D → Renderer 3D → Image
```

したがって、pRenderは必ず2D Image化するNodeではありません。2D / 3Dの出力を選ぶ境界です。

## 時間との関係

Particle systemはframeごとに状態が変化します。

particleは誕生frame、Lifespan、Velocity、force、ageなどに依存して後続frameの状態が決まります。pRenderのPre-Roll / Pre-Generate Framesは、shot開始時点ですでにparticleが存在している状態を作るときに使います。

## よくある誤解

**pEmitterをViewerへ出せば見える。**  
pEmitterはParticle setを出力するため、表示にはpRenderが必要です。

**Particleは点を描いたImageである。**  
Particle setは位置・velocity・age・rotation等の状態を持つデータで、表示用Imageはrender段階で生成されます。

## 関連Node

- [Particleノード](../../nodes/particles/)
- [pEmitter](../../nodes/particles/p-emitter)
- [pRender](../../nodes/particles/p-render)
- [pMerge](../../nodes/particles/pmerge)

## 次に読む

→ [最小Particle chainを作る](../../recipes/particles/basic-particle-chain)

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 114 pp.2646–2699とFusion Fundamentals Chapter 86で、Particle systemの基本構造、pEmitter / pRenderの役割、particle modifier / force、2D / 3D rendering、Particle Setを確認しました。

内部particle representation、全attribute、実機性能は未確認です。
