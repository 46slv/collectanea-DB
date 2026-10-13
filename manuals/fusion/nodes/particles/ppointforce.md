---
title: pPointForce
description: 3D空間の指定点へParticleを引き寄せる、またはそこから遠ざける力を加えるFusionのParticleノード。
doc_type: node
term_id: ppointforce
term_short: pPointForceは、3D空間の指定点を中心にParticleへ引力・斥力を加えるノード。
verification: partial
aliases: [pPointForce, pPoint Force, pPF]
concepts: [particle-data, particle-region]
nodes: [pPointForce]
node_family: particles
controls: [Random Seed, Strength, Power, Limit Force, Center XYZ, Conditions, Region]
inputs: [particle, region]
outputs: [particle]
tasks: [particles, attract, repel, point-force]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-12"
---

# pPointForce

pPointForceは、3D空間の指定した点へ<Term id="particle-data">Particle</Term>を引き寄せたり、その点から遠ざけたりする力を加えるノードです。光の粒を中心へ集める、火花を周囲へ散らす、移動する物体に粒子を追わせるといった動きを作れます。

これは粒子を発生させるノードでも、画像に直接変形をかけるノードでもありません。すでに存在するParticleの動きへ力を加え、粒子の状態を後段へ渡します。Particleは位置や速度などを保持するデータで、通常の2D画像とは異なります。基礎から確認する場合は[Particleの仕組み](../../learn/02-data/particle)を参照してください。

## 入力と出力

| 接続 | データ | 役割 |
| --- | --- | --- |
| Input（橙） | Particle | pEmitterなどが生成した粒子を受け取る |
| Region（条件付き） | 2D Imageまたは3D Mesh | この力を作用させる空間的な範囲を指定する |
| Output | Particle | 力が適用された粒子の状態を次のParticleノードへ渡す |

通常は橙のParticle入力だけが表示されます。Inspectorの**Region**で**Bitmap**または**Mesh**を選ぶと、追加のRegion入力が現れます。Bitmapでは2D画像の選択したチャンネル、Meshでは3D形状を作用範囲の判断に使用します。Regionの端子は選択状態によって緑またはマゼンタで表示され、Particle入力とは別物です。

たとえば、円形の白い領域を持つ画像をBitmap Regionへ接続すれば、その画像で指定した範囲の粒子にだけ引力を加える構成を作れます。画像を橙のParticle入力へ接続したり、画像そのものをParticleとして生成したりする機能ではありません。

## 基本の接続

```text
pEmitter → pPointForce → pRender (2D) → Merge
```

1. [pEmitter](./p-emitter)で粒子を発生させます。まず位置や初速が確認しやすい数と広がりにします。
2. pPointForceのStrengthを正の値にすると、Center Positionへ引き寄せる力が加わります。負の値では反発する力になります。
3. [pRender](./p-render)を2D出力にすると、通常の画像としてMergeで背景映像へ合成できます。

pPointForceの出力はParticleのままです。pRenderの既定は3D出力なので、2D合成につなぐ場合はOutput Modeを確認します。3Dシーンへ組み込む場合は、pRenderの3D出力をMerge 3Dなどへ渡し、Renderer 3Dで画像化します。

## 主なInspector設定

### Strength

中心点から受ける力の強さを決めます。**正の値で中心へ引き寄せ、負の値で中心から遠ざけます**。値だけで最終的な粒子の位置が決まるわけではありません。粒子の初速、Centerとの距離、ほかのParticleノードが与える力も軌道に影響します。

### Power

中心点からの距離によってStrengthがどの程度減衰するかを決めます。

- **0**：距離による力の減衰がありません。
- **値を大きくする**：離れた粒子ほど力が弱まりやすくなり、中心付近の影響が相対的に目立ちます。

Powerは力の大きさや作用範囲を画像のぼかし半径のように指定するものではありません。距離減衰の厳密な計算式はマニュアルに記載されていません。

### Limit Force

時間方向のサンプリングが粗いと、引き寄せられた粒子が1フレームの間に中心を通り越し、反対側へ大きく飛ぶことがあります。Limit Forceを大きくすると、このような行き過ぎが生じる可能性を減らせます。

**中心付近で粒子が不自然に跳ね返る場合**は、Strengthを下げることに加え、Limit ForceとpRenderのサブフレーム計算精度を確認します。Limit Forceは中心点で粒子を停止・固定するスイッチではなく、行き過ぎを完全に防ぐ保証もありません。

### X / Y / Z Center Position

引力・斥力の中心となる点の3D座標です。中心位置をアニメーションさせると、粒子を引き寄せる目標を移動させられます。カメラから見た2D画面内の位置だけでなく、奥行きのZ座標も含む点に注意してください。

### Random Seed / Randomize

ランダムな結果を使うParticleノードに共通する設定です。同じSeedならランダムな結果を再現でき、Randomizeで別のSeedを選べます。この項目があることは、pPointForceが必ずランダムな方向へ粒子を飛ばすことを意味しません。

## ConditionsとRegionで対象を絞る

**Conditions**は「どのParticleに効かせるか」を制御します。Probabilityは各粒子について**各フレームごと**に評価されます。たとえば0.6なら、そのフレームに各粒子が力の影響を受ける確率は60%です。一度選ばれた粒子が以降も固定的に選ばれるわけではありません。

Start / End Ageでは寿命全体に対する割合で作用期間を指定できます。たとえばStartを0.8、Endを1.0にすると、寿命の最後の20%に入った粒子だけが対象になります。Set ModeとSet番号を使えば、pEmitterなどで区別した粒子のグループだけへ力を加えられます。

**Region**は「どこにいるParticleへ効かせるか」を制御します。Bitmap、Meshなどを使う場合は必要な入力を別途接続します。Conditionsは粒子の属性や寿命、Regionは空間的な作用範囲を絞る設定です。粒子を発生させる領域の指定と混同しないでください。

## 制作例

### 光点を一か所へ集める

```text
pEmitter → pPointForce → pRender (2D) → Merge
```

pEmitterで複数の光点を広い範囲に発生させます。pPointForceのCenter Positionを画面上の集合させたい位置に置き、Strengthを正にします。まずPowerを0付近にして引力の変化を確認し、遠くの粒子にも同じ程度の力をかけるか、中心付近で強くかけるかをPowerで調整します。

粒子が中心を通り過ぎて激しく往復する場合はLimit ForceやpRenderのサブフレーム計算も確認します。pRenderを2D出力にし、Mergeで実写に重ねれば、文字や人物の近くへ光が集まる演出に使えます。

### 粒子を中心から吹き飛ばす

```text
pEmitter → pPointForce → pRender (2D)
```

pEmitterで中心付近に少し広がった粒子群を発生させ、pPointForceのCenterをその近くに置きます。Strengthを負にすると、粒子は中心から離れる方向へ力を受けます。開始位置とCenterを完全に重ねる必要はなく、最初は粒子の位置を少しばらつかせる方が動きの違いを観察しやすくなります。

爆発後の破片や衝撃波に近い動きにするなら、pEmitter側の初速とpPointForceの斥力を分けて調整します。ConditionsのStart / End Ageで寿命の一部だけに作用させれば、常に外向きの力を加え続ける動きとは違う変化を作れます。

### 渦で回しながら中心へ集める

```text
pEmitter → pVortex → pPointForce → pRender (2D)
```

[pVortex](./pvortex)で粒子に旋回する力を加え、pPointForceで特定の点への引力を重ねます。pVortexだけでは求める中心へ十分に集まらないとき、力の役割を分けて調整するための構成です。

最初にpVortexを一時的に無効にして引力だけの軌道を確認し、次に有効に戻して旋回の変化を見ます。さらに煙らしい不規則な揺れが必要な場合は[pTurbulence](./pturbulence)を追加できますが、複数の力を強くしすぎないよう、各ノードを順番に確認します。

## 期待した動きにならない場合

- **粒子が表示されない**：pEmitterが粒子を発生させているか、pRenderの2D / 3D Output Modeと後段の接続が合っているかを確認します。
- **引力・斥力が見えない**：Strengthの符号、Centerの位置、粒子の初速、Powerによる距離減衰を順に確認します。ConditionsやRegionで対象から外れていないかも確認してください。
- **中心を激しく通り過ぎる**：StrengthとLimit Force、pRenderのサブフレーム計算精度を見直します。
- **一部の粒子だけ断続的に反応する**：ConditionsのProbabilityが1.0未満なら、対象はフレームごとに選び直されます。
- **Bitmap Regionで変化しない**：RegionがBitmapになっているか、追加端子へ画像を接続しているか、参照する画像チャンネルと粒子の位置が一致しているかを確認します。

## 関連ノード

| ノード | 役割 | 選ぶ場面 |
| --- | --- | --- |
| [pDirectionalForce](./pdirectionalforce) | 一定方向への力を加える | 重力や風など、中心点を必要としない動き |
| [pVortex](./pvortex) | 回転する力を加える | 渦や旋回する動き |
| [pGradientForce](./pgradientforce) | 画像のAlpha勾配を使って力を作る | 指定画像の濃淡変化に沿って粒子を導く |
| [pRender](./p-render) | Particleを2D画像または3Dの結果に変換する | 最終的に映像へ表示・合成する |

ほかのParticleノードとの関係は[Particleノード一覧](./index.md)でも確認できます。

## 出典・バージョンと未確認事項

- **一次資料**：*DaVinci Resolve 21.1 Reference Manual*（September 2026）、Chapter 114「Particle Nodes」、pp.2677–2678（pPoint Forceの入力、Strength、Power、Limit Force、Center Position）、p.2679（pRenderの2D / 3D出力）、pp.2697–2699（共通Conditions / Region）。
- **対象**：DaVinci Resolve 21.1のFusionページ。マニュアルの記述をもとに、用途と接続例を組み立てています。
- **未確認**：力の内部計算式、各設定の既定値と厳密な範囲、現在の実機での処理負荷やEdition差。実機動作を検証済みとは扱いません。
