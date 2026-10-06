---
title: pBounce
description: Particleを指定regionで反射させ、Elasticity・Variance・Spin・Roughness・Surface Motionで衝突後の動きを調整するNode。
doc_type: node
term_id: pbounce
term_short: pBounceは、particleを指定regionで跳ね返すNode。
verification: partial
aliases: [pBounce, pBn]
concepts: [particle-data, particle-region]
nodes: [pBounce]
node_family: particles
controls: [Random Seed, Elasticity, Variance, Spin, Roughness, Surface Motion, Surface Motion Direction, Conditions, Region]
inputs: [particle, region]
outputs: [particle]
tasks: [particles, bounce, collision]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# pBounce

pBounceは、<Term id="particle-data">Particle set</Term>が指定regionへ接触したとき、particleを反射させるNodeです。

床や壁へ当たる粒、跳ねる破片など、collision後のmovementを作るときに使います。

## 入力

オレンジ色のParticle inputへ前段Particleを接続します。

Region tabをBitmap / Meshにするとregion inputが追加され、2D Imageや3D Meshをcollision surfaceとして使えます。

## 主な設定

### Elasticity

衝突後にVelocityをどの程度残すかを決めます。

- 1.0付近: 入射前のspeedをほぼ保つ
- 小さい値: bounceのたびにspeedを失う
- 1より大きい値: 衝突後にspeedが増える

### Variance

反射角へばらつきを加えます。

規則的に同じ角度で反射する見た目を崩したい場合に使います。

### Spin

collisionによってparticleへ回転を与える、または既存Spinを変えます。

### Roughness

bounce方向へ小さなrandomnessを加え、surfaceの粗さのような挙動を作ります。

### Surface Motion / Direction

surface自体が動いているような影響をparticleへ与えます。

## 最小構成

```text
pEmitter → pBounce → pRender
                ↑
              Region
```

## 運用例

地面へ落ちて数回跳ねるparticleを作る場合:

1. pDirectionalForceで下向きに加速します。
2. pBounceのRegionを床位置へ置きます。
3. Elasticityを1未満へしてbounceごとにenergyを失わせます。
4. Roughness / Varianceを少量加えて均一な反射を崩します。
5. 必要ならpFrictionで横方向movementも減衰します。

## pAvoidとの違い

- **pBounce** — collisionした後に反射
- **pAvoid** — collision前からregionを避ける

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 114 pp.2649–2650で、Particle / Region input、Elasticity、Variance、Spin、Roughness、Surface Motionを確認しました。

collision内部実装、Region geometry別の精度差、実機性能は未確認です。
