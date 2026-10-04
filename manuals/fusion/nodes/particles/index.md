---
title: Particleノード
description: Particleを作る・動かす・まとめる・2D/3Dへrenderする流れと、各p* Nodeの選び分けを整理する。
doc_type: index
verification: partial
product_scope: fusion
tasks: [lookup-node, particles, emit, force, render]
updated: "2026-10-04"
---

# Particleノード

FusionのParticle系Nodeは、雨・煙・火花・群れなど、多数の要素を自動生成して動かすための仕組みです。

途中では通常の2D Imageではなく、各particleの位置・速度・寿命・回転・size・colorなどを持つ<Term id="particle-data">Particle set</Term>を扱います。最後にpRenderで2D Imageまたは3D geometryへ変換します。

## 最小構成

```text
pEmitter → pRender
```

pEmitterがparticleを生成し、pRenderが見える結果へ変換します。

## Nodeを選ぶ

| やりたいこと | Node | 何が変わるか |
| --- | --- | --- |
| particleを生成 | [pEmitter](./p-emitter) | 数、寿命、初速、region、style |
| Imageのpixelからparticleを生成 | [pImage Emitter](./pimageemitter) | pixel位置・色・Alphaをparticle generationへ利用 |
| particleからparticleを増やす | [pSpawn](./pspawn) | 既存particleをemitter化 |
| 2つのparticle streamをまとめる | [pMerge](./pmerge) | 2 streamを1 streamへ統合 |
| 一定方向へ加速 | [pDirectionalForce](./pdirectionalforce) | gravityのようなforce |
| 1点へ引き寄せる / 反発させる | [pPoint Force](./ppointforce) | point中心のattract / repel |
| 渦を作る | [pVortex](./pvortex) | rotational force |
| motionへ乱れを加える | [pTurbulence](./pturbulence) | frequency-based chaos |
| velocity / spinを減衰 | [pFriction](./pfriction) | movementやrotationをslow down |
| regionを避ける | [pAvoid](./pavoid) | regionへ近づく前に進行方向を変える |
| regionで跳ね返す | [pBounce](./pbounce) | collision-like bounce |
| targetへ追従させる | [pFollow](./pfollow) | animated follow pointへspring-likeに追従 |
| 群れ行動 | [pFlock](./pflock) | attraction / repulsion / following |
| 見た目を途中で変える | [pChangeStyle](./pchangestyle) | styleやparticle set assignmentを変更 |
| 条件で消す | [pKill](./pkill) | region / age / set等でparticleをdestroy |
| Alpha gradientでforceを作る | [pGradientForce](./pgradientforce) | ImageのAlpha gradient方向へ加速 |
| 独自式でparticle属性を変更 | [pCustom](./pcustom) | position / velocity / color等をexpressionで操作 |
| 独自式でforceを作る | [pCustomForce](./pcustomforce) | position / torqueへcustom force |
| tangent方向のforce | [pTangent Force](./ptangentforce) | regionに対する接線方向へforce |
| 最終結果をrender | [pRender](./p-render) | Particle set → 2D Image / 3D geometry |

## 「作る → 変える → render」で読む

Particle graphは3段階に分けると読みやすくなります。

```text
Generate
pEmitter
   ↓
Modify
pDirectionalForce → pTurbulence → pFriction
   ↓
Render
pRender
```

ForceやBehaviorを何個追加しても、pRenderまではParticle setのままです。

## 2Dと3D

pRenderは2D / 3DのOutput Modeを持ち、既定は3Dです。

2DならそのままMerge等の2D Image Nodeへ進みます。

```text
pEmitter → pRender (2D) → Merge
```

3DならMerge 3D等へ接続し、Renderer 3Dで最終Imageへ変換します。

```text
pEmitter → pRender (3D) → Merge 3D → Renderer 3D
```

## Common Controls

Particle Nodeの多くはConditions / Style / Region / Settings等の共通tabを持ちます。

### Conditions

Probability、particle age、Setなどを使い、「どのparticleだけにこのNodeを効かせるか」を限定します。

### Region

pEmitterではparticleを生成する範囲、Force / Behavior系では作用範囲を決めます。

Bitmapや3D MeshをRegionへ使う場合、追加inputがNodeへ現れます。

### Sets

pEmitter等でparticleへSet番号を割り当て、後段Nodeを特定Setだけへ作用させられます。

## Particleの時間

Particle systemは前frameのstateを使って現在frameを計算します。

大きくframeを飛んだとき結果が違って見える場合は、pRenderのPre-Roll / Automatic Pre-Rollを確認します。開始frameですでに煙が立っている状態などを作る場合はPre-Generate Framesを使います。

## 関連する考え方

- [パーティクル（Particle）](../../learn/02-data/particle)
- [フレーム評価](../../learn/05-time/frame-evaluation)
- [データ領域を辿って診断する](../../learn/07-debugging/trace-data-domain)

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 114 pp.2646–2703とFusion Fundamentals Chapter 86を基に整理しています。

各Node固有Controlは個別ページで説明します。内部particle representation、solver / simulation実装、実機性能は未確認です。
