---
title: pAvoid
description: 指定regionへparticleが近づく前から進行方向を変え、DistanceとStrengthで回避挙動を作るParticle Behavior Node。
doc_type: node
term_id: pavoid
term_short: pAvoidは、particleが指定regionを避けるように進行方向へforceを加えるNode。
verification: partial
aliases: [pAvoid, pAv]
concepts: [particle-data, particle-region]
nodes: [pAvoid]
node_family: particles
controls: [Random Seed, Distance, Strength, Conditions, Region]
inputs: [particle, region]
outputs: [particle]
tasks: [particles, avoid-region, motion]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# pAvoid

pAvoidは、<Term id="particle-data">Particle set</Term>へ「このregionへ入らないように進路を変える」挙動を加えるNodeです。

壁に当たって跳ね返すpBounceと違い、collisionする前からparticleの方向を変えます。

## 入力

### Input

オレンジ色のParticle inputです。pEmitterや前段のParticle Nodeを接続します。

### Region

Region tabをBitmapまたはMeshにすると、2D Imageまたは3D MeshのRegion inputが追加されます。ここで「避ける領域」を定義します。

## 主な設定

### Distance

regionからどのくらい離れた時点で回避を始めるかを決めます。

大きくするとparticleが早い段階から進路を変え、小さくするとregionの近くまで直進します。

### Strength

regionから離れる方向へどれだけ強くmovementを変えるかを決めます。

負の値では逆にregionへ向かう方向へ作用します。

## momentumとの関係

pAvoidはparticleを強制的に停止させるbarrierではありません。

particleのVelocityが大きく、Distance / Strengthが弱い場合は、回避しようとしてもmomentumに負けてregionを横切ることがあります。

「絶対に通過させたくない」collision用途なら[pBounce](./pbounce)や[pKill](./pkill)も検討します。

## 最小構成

```text
pEmitter → pAvoid → pRender
               ↑
             Region
```

## 運用例

particleがlogoや人物の周囲を避けて流れる表現を作る場合:

1. Regionで避ける形を設定します。
2. Distanceで回避開始位置を決めます。
3. Strengthを少しずつ上げます。
4. particleがregionを突き抜ける場合はVelocityとの比率を確認します。

## pBounceとの違い

- **pAvoid** — 接触前から進路を変える
- **pBounce** — regionへ接触した後に反射させる

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 114 pp.2647–2648で、Particle / Region input、Distance、Strength、momentumとの関係を確認しました。

Region共通Controlの全設定、実機性能は未確認です。
