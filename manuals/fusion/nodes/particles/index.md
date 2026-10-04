---
title: Particleノード
description: Particle setを作る・まとめる・forceで動かす・見た目を変える・2D/3DへrenderするNodeを役割から選ぶ入口。
doc_type: index
verification: partial
product_scope: fusion
tasks: [lookup-node, particles, emit, force, render]
updated: "2026-10-04"
---

# Particleノード

Particle系Nodeは、<Term id="particle-data">Particle set</Term>を作り、途中で状態を変え、最後にpRenderで2D Imageまたは3D出力へ変換するためのNode群です。

最初に「生成」「合流」「force / behavior」「render」のどこを担当するNodeかで分けると、Particle chainを読みやすくできます。

## 最小構成

```text
pEmitter → pRender
```

pEmitterだけでは通常のImageとしてViewerへ表示できません。pRenderがparticle systemを表示可能な出力へ変換します。

## まず選ぶ

| やりたいこと | Node | 役割 |
| --- | --- | --- |
| particleを生成する | [pEmitter](./p-emitter) | 基本Emitter。数・寿命・速度・style・regionを決める |
| Imageからparticleを作る | [pImage Emitter](./pimageemitter) | pixel位置・色・Alpha等をgenerationへ使う |
| 既存particleから新しいparticleを作る | [pSpawn](./pspawn) | trail、burst等 |
| 2つのparticle streamをまとめる | [pMerge](./pmerge) | Particle set同士を合流 |
| 一方向へforceを加える | [pDirectionalForce](./pdirectionalforce) | gravity等 |
| movement / spinを減衰する | [pFriction](./pfriction) | resistance |
| 不規則なmovementを加える | [pTurbulence](./pturbulence) | smoke / dust等の揺らぎ |
| 1点へ引き寄せる・反発させる | [pPoint Force](./ppointforce) | point force |
| 渦状のmovementを作る | [pVortex](./pvortex) | vortex |
| Particle setを2D/3Dへ出す | [pRender](./p-render) | render boundary |

## Particle chainの読み方

Particle Nodeは、通常の2D Image Nodeと同じ順序で考えない方が分かりやすくなります。

```text
Generate
  ↓
Modify / Force
  ↓
Combine
  ↓
Render
```

例:

```text
pEmitter
  ↓
pDirectionalForce
  ↓
pTurbulence
  ↓
pFriction
  ↓
pRender
```

この間はParticle setのままです。Blur、Color Corrector、Merge等の2D Image処理は、pRenderを2D modeで出した後に使います。

## Generate

### pEmitter

もっとも基本的なparticle sourceです。

Number / Lifespan / Velocity / Angle / Rotation / Spinを決め、Style tabで見た目、Region tabでどこから生成するかを決めます。

### pImage Emitter

Imageのpixelを元にparticleを生成します。

image-to-particle effectや、映像の色を持つparticle gridを作る用途です。

### pSpawn

既存particle自身から新しいparticleを生成します。

火花が途中で分裂する、rocketからtrailが出る、といった「particleが別particleを生む」構成で使います。

## Combine

### pMerge

2つのParticle streamを1つへまとめます。

```text
pEmitter A ─┐
            ├─ pMerge → pRender
pEmitter B ─┘
```

pMergeには固有Controlがなく、各streamのParticle Set情報を保ったまま合流します。

## Force / behavior

### pDirectionalForce

指定方向へ一定のforceを加えます。Manualではgravityが代表例です。

### pFriction

velocityとspinを減衰します。

### pTurbulence / pVortex / pPoint Force

uniformなmotionを崩す、渦へ巻き込む、特定pointへ引き寄せる / 反発させる、といったmovementを追加します。

Force Nodeの多くはRegionやConditionsを使い、「どのparticleへ」「どの場所で」「寿命のどの範囲で」効かせるかを制限できます。

## Style

pEmitter、pSpawn、pChangeStyle、pImage Emitterには共通Style tabがあります。

Point、Bitmap等のparticle appearanceを選び、sizeやcolorを調整します。

Bitmap styleではImage inputが追加され、2D Imageをparticleの見た目として使えます。多数複製されるため、Manualは小さなsquare imageを使う例を示しています。

## Region

Region tabは、pEmitterではparticleを生成する場所、force系ではeffectが作用する場所を定義します。

2D ImageのBitmap regionや3D Mesh regionを使う場合は、追加inputがNodeへ現れます。

## Conditions / Sets

Particle系では「全particleに同じEffect」を前提にしなくても構いません。

ConditionsでProbabilityやStart / End Ageを使い、particle lifeの一部だけへEffectを適用できます。

pEmitterではSet 1–32を割り当てられ、downstream Nodeから特定Setだけを対象にできます。

## pRender

pRenderはParticle chainの終端です。

- **2D mode** → 2D Image。Merge等へ接続
- **3D mode** → 3D particle output。Merge 3D / Renderer 3Dへ接続

既定は3D modeです。

## 関連する考え方

- [パーティクル（Particle）](../../learn/02-data/particle)
- [データ領域（data domain）を辿って診断する](../../learn/07-debugging/trace-data-domain)
- [フレーム評価](../../learn/05-time/frame-evaluation)

## 関連Recipe

- [最小Particle chainを作る](../../recipes/particles/basic-particle-chain)

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 114 pp.2646–2699とFusion Fundamentals Chapter 86を基に整理しています。

このFamily OverviewはNodeの役割分けを担当します。各Force / behavior Nodeの詳細、Particle Common Controlsの全項目、実機performanceは個別Referenceへ分けます。
