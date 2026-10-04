---
title: pEmitter
description: Particle setを生成し、Number・Lifespan・Velocity・Rotation・Style・Regionでparticleの誕生時の状態を決める基本Emitter。
doc_type: node
term_id: p-emitter
verification: partial
aliases: [pEmitter, Particle Emitter, pEm]
concepts: [particle-data, time, data-domain]
nodes: [pEmitter]
node_family: particles
controls: [Random Seed, Number, Number Variance, Lifespan, Lifespan Variance, Color, Position Variance, Temporal Distribution, Velocity, Velocity Variance, Inherit, Angle, Angle Z, Rotation Mode, Rotation XYZ, Spin XYZ, Sets, Style, Region]
outputs: [particle]
tasks: [particles, emit, procedural-motion]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# pEmitter

pEmitterは、Fusion Particle systemの出発点になるNodeです。

新しい<Term id="particle-data">Particle set</Term>を生成し、particleの数、寿命、初速、方向、回転、見た目、発生範囲を決めます。pEmitterの出力はImageではないため、Viewerで結果を見るにはpRenderを後ろへ接続します。

## 入力

既定では入力を持ちません。

ただしStyleをBitmapにすると、particle画像として使う2D Image入力が追加されます。RegionをBitmapまたはMeshにすると、そのregionを定義する2D Image / 3D Mesh入力も追加されます。

## 出力

Particle setを出力します。

```text
pEmitter → particle modifiers / forces → pRender
```

BlurやColor Corrector等の2D Image Nodeへ直接つなぐのではなく、pRenderでdomainを変換してから使います。

## Controls tab

### Random Seed

varianceやrandom generationのseedです。

同じ設定と同じseedなら同じparticle systemを再現できます。見た目だけ別patternへ変えたい場合はRandomizeを使います。

### Number / Number Variance

1 frameごとに生成するparticle数と、そのばらつきを決めます。

Numberをanimationすると、一定期間だけparticleを発生させるburstや、一度だけ大量に生成する構成を作れます。

### Lifespan / Lifespan Variance

particleが誕生してから消えるまでのframe数です。

多くのOver Life ControlはLifespanに対する0〜100%で作用するため、Lifespanを変えるとSize Over LifeやColor Over Lifeの実時間も変わります。

### Color

Style側のColorを使うか、Bitmap Regionの色をparticleへ引き継ぐかを選びます。

Bitmap Regionを使ってImageの色からparticleを作る場合に重要です。

### Position Variance

Region境界から少し外れた位置にもparticleを生成できるようにし、発生regionのedgeをsoftにします。

### Temporal Distribution

particle birthをframe境界だけへ集中させず、subframeへ分散できます。

速いparticleが一定間隔の塊に見える場合など、time方向の発生distributionを滑らかにしたいときに使います。

## Velocity

### Velocity / Velocity Variance

誕生時のspeedと、そのばらつきを決めます。

0なら外部Forceがなければ発生位置に留まります。

### Inherit

Emitter Region自体が動いている場合、そのmovementをparticleへどの程度引き継ぐかを決めます。

### Angle / Angle Z

Velocityの進行方向をXYとZで決めます。

2Dだけでなく3D particle systemでも初期方向を持たせられます。

## Rotation / Spin

### Rotation Mode

- **Absolute Rotation** — movement directionに関係なく指定rotationを使う
- **Rotation Relative To Motion** — velocity方向を基準にparticleをorientする

矢印や葉のように「進行方向を向いてほしい」particleではRelative To Motionが候補になります。

### Rotation XYZ / Variance

誕生時のrotationとばらつきを設定します。

### Spin XYZ / Variance

誕生後、frameごとに回転を続けるspinを設定します。

## Style tab

particleの見た目を決めます。

Point、Bitmap等のStyleを選び、SizeやColor、Over Life Controlを設定します。Bitmap Styleでは2D Image inputが追加されます。

## Region tab

particleがどこから生まれるかを決めます。

Point / Line / Rectangle等のregionに加え、Bitmapや3D Meshを使える構成があります。2D pRenderでは基本的にflat plane上、3D systemではdepthを持つregionとして生成できます。

## Sets tab

particleをSet 1〜32へ割り当てます。

後段のForce / Behavior Nodeで「Set 1だけgravityを効かせる」など、同じParticle stream内で対象を分けるために使います。

## 最小構成

```text
pEmitter → pRender
```

最初はNumber、Lifespan、Velocityの3つだけで動きを作り、その後にStyle / Region / Forceを増やすと原因を追いやすくなります。

## 運用例

上向きに飛ぶ火花を作る場合:

1. Numberで発生量を決めます。
2. Lifespanで消えるまでの長さを決めます。
3. Velocityを上げます。
4. Angleで上方向へ向けます。
5. Styleで小さなPoint / Bitmapを選びます。
6. 後段にpDirectionalForceを入れ、下向きのforceで落下させます。
7. pRenderで結果を確認します。

## pImage Emitterとの違い

- **pEmitter** — RegionとEmitter Controlからparticleを生成
- **pImage Emitter** — source Imageのpixel grid自体をparticle generationへ使う

Imageの輪郭やpixel位置をparticle化したい場合はpImage Emitterを検討します。

## 関連する考え方

- [パーティクル（Particle）](../../learn/02-data/particle)
- [最小Particle chainを作る](../../recipes/particles/basic-particle-chain)

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 114 pp.2660–2664で、入力、Number / Lifespan、Velocity、Angle、Rotation、Spin、Sets、Style、Regionを確認しました。

Style / Region共通tabの全選択肢、全default / range、実機性能は未確認のため `verification: partial` としています。
