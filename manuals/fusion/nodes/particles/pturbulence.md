---
title: pTurbulence
description: Particleの動きに不規則な揺らぎを加えるFusionノード。軸別のStrength、粒子の寿命に応じた変化、Density、作用範囲を説明する。
doc_type: node
term_id: pturbulence
term_short: pTurbulenceは、Particleの位置や動きに不規則な変化を加えるノード。
verification: partial
aliases: [pTurbulence, pTr]
concepts: [particle-data, particle-region]
nodes: [pTurbulence]
node_family: particles
controls: [Random Seed, Randomize, X Strength, Y Strength, Z Strength, Strength Over Life, Density, Conditions, Style, Region, Settings]
inputs: [particle, region]
outputs: [particle]
tasks: [particles, turbulence, natural-motion]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-12"
---

# pTurbulence

pTurbulenceは、粒子（<Term id="particle-data">Particle</Term>）の位置に不規則な変化を加え、規則的な移動を揺らすノードです。煙の流れを少し乱したり、火の粉やほこりを一様な軌道から外したりするときに使います。

単に粒子を多く発生させる機能ではありません。前段で生成したParticleの動きに作用し、変化したParticleデータを後段へ渡します。

## 何を入力し、何が出力されるか

### Particle入力（オレンジ）

通常はオレンジ色の入力が1つあります。pEmitter、pImage Emitter、ほかのParticleノードから出る**Particleデータ**をここに接続します。映像の2D Imageをこの入力へ直接つなぐものではありません。

### Region入力（必要なときだけ）

InspectorのRegionタブでBitmapまたはMeshを選ぶと、追加のRegion入力が現れます。Regionは、乱れを**どの範囲で作用させるか**を指定するものです。

- **Bitmap**：2D Imageと、その画像の選択したチャンネルで範囲を指定します。
- **Mesh**：3D Meshを使って範囲を指定します。

マニュアルでは、追加入力は選択状態に応じて緑またはマゼンタのポートになると説明されています。Regionのための入力とParticle入力を混同しないでください。Regionを設定しなければ、追加入力を用意する必要はありません。

### Particle出力

結果もParticleデータです。pTurbulenceの出力を直接通常の2D画像処理へ渡すのではなく、pRenderで表示できる形式に変換します。pRenderの出力を2Dにすれば、Mergeなどで映像に合成できます。3D出力を選ぶ場合は、3Dシーンのノードへ渡します。

Particleのデータ形式やpRenderの役割は、[パーティクルの基礎](../../learn/02-data/particle)と[Particleノード一覧](./index)でも説明しています。

## 主な設定

### X / Y / Z Strength

各軸に沿って加える乱れの強さを調整します。たとえば上方向へ動く煙を左右に揺らしたい場合、まずX方向のStrengthから確認すると、縦方向の動きと横方向の乱れを分けて考えられます。

3D空間で前後方向にも動きを変えたいときにはZ方向を調整します。これは「粒子をどの方向へ発射するか」を決めるpEmitterの初速設定とは別です。

### Strength Over Life

粒子が生まれてから消えるまでの経過に応じて、乱れの量を変える小さなSpline Editorです。すべての粒子が同じフレームから動き始めるのではなく、**各粒子の寿命の進行度**に対して働きます。

たとえば、火の粉を飛ばした直後はほぼ直進させ、時間がたつほど散らす構成を作れます。最初から大きく揺らす場合と比べ、発生地点から離れた後に軌道が崩れる表現に向きます。

### Density

乱れを空間内でどれくらい細かく変化させるかを調整します。

- **低い値**では、近くの複数の粒子が似た変化を受けやすくなり、大きなうねりのように見えます。
- **高い値**では、粒子ごとの差が細かく現れ、不規則さが増します。

Densityは発生粒子数を指定する設定ではありません。「粒子が少ない」ときは、まずpEmitter側の生成数を確認します。動きが一塊に見えるときと、粒子が個別にばらついて見えるときの差をDensityで調整します。

### Random Seed / Randomize

Random Seedは乱数結果を再現するための値です。Randomizeボタンは別のSeedを選びます。同じ設定とSeedから同じ乱数結果を得るのに使えますが、Seedは粒子の初速やDensityの代わりに動きの強さを決める項目ではありません。

### Conditions / Style / Region / Settings

Particleノード共通のタブです。Conditionsは条件に合う粒子に処理を絞り、Regionは処理が作用する空間的な範囲を制限します。たとえば「特定のParticle Setだけ」を絞る用途と「画面の右側だけ」を絞る用途は異なります。共通設定は[Particleノードの概要](./index)を参照してください。

## 最小構成

```text
pEmitter → pTurbulence → pRender (2D) → MediaOut
```

pEmitterで粒子を発生させ、pTurbulenceで軌道を乱し、pRenderで2D Imageに変換します。pRenderの2D/3Dモードに応じて後段の接続先は変わります。

動きを比較するには、同じ発生条件でpTurbulenceのStrengthを小さくした状態と大きくした状態を見比べます。乱れの量を確認してからDensityを動かすと、変化の原因を追いやすくなります。

## 運用例

### 1. 上昇する煙にまとまった揺らぎを作る

1. pEmitterで上方向への初速を持つ粒子を発生させます。
2. pTurbulenceを間に挿入し、X Strengthを少量から増やします。必要ならY Strengthも調整します。
3. Densityを低めから変え、近い粒子が似た方向へ動く大きなうねりと、細かくばらつく動きの違いを確認します。
4. Strength Over Lifeで、煙が生まれた直後よりも上昇後に強く揺れるようにします。
5. pRenderを2D出力にして、映像の上へMergeで合成します。

pTurbulenceは煙の見た目自体を生成するわけではありません。粒子の形や色、透明度はpEmitter側のStyleや後段の表現と分けて設定します。

### 2. 火の粉が飛び出した後から軌道を崩す

```text
pEmitter → pDirectionalForce → pTurbulence → pRender
```

pEmitterで火の粉に初速を与え、pDirectionalForceで一定方向の力を加えます。さらにpTurbulenceを挿入し、Strength Over Lifeで誕生直後の乱れを抑えて後半に増やします。

発射直後の方向を保ちたい場合に、最初から全期間へ強い乱れをかける方法と使い分けられます。規則的な移動と不規則な動きの役割を分けて調整する例です。

### 3. 決まった範囲に入った粒子だけを乱す

```text
pEmitter ───────────────→ pTurbulence → pRender (2D)
Bitmapの範囲指定画像 ───→ pTurbulence (Region入力)
```

RegionタブでBitmapを選び、乱れを適用したい範囲を表す2D画像を追加入力へ接続します。画像のどのチャンネルを範囲に使うかをRegion側で指定します。

画面左側では直線的に流れ、右側へ来た粒子の動きだけを乱す、といった構成を考えられます。Region入力は**作用範囲**を指定するのであって、画像の模様の向きに沿って粒子を押すための入力ではありません。その目的にはpGradientForceを検討します。

これらは21.1マニュアルで確認できる設定と接続から組み立てた制作例であり、完成映像を実機でレンダー確認した記録ではありません。

## 似たノードとの違い

| ノード | 何を変えるか | 選び方 |
| --- | --- | --- |
| [pDirectionalForce](./pdirectionalforce) | 指定方向に力を加える | 重力や風のような一方向への動き |
| [pGradientForce](./pgradientforce) | 入力画像のAlpha勾配をもとに力を加える | 画像で流れの方向を設計したいとき |
| **pTurbulence** | 粒子の位置に不規則な乱れを加える | 規則的すぎる軌道を自然に崩したいとき |
| [pVortex](./pvortex) | 渦の中心と回転を基準に力を加える | 渦巻き状の流れを作りたいとき |
| [pFriction](./pfriction) | 移動速度や回転を減衰させる | 粒子を徐々に減速させたいとき |

複数のノードを直列に接続することもできます。どれを増やしたときに動きが変化したか分かるよう、一度に一項目ずつ調整すると判断しやすくなります。

## うまく動かないとき

- **粒子が見えない**：Particle入力の接続とpRenderの有無、2D/3Dの出力先を確認します。pTurbulenceだけでは画像を描画しません。
- **軌道がほとんど変わらない**：各軸のStrengthと、Strength Over Lifeの現在の粒子年齢に対応する部分を確認します。Regionで作用範囲を狭めている場合もあります。
- **乱れが均一に見える**：StrengthだけでなくDensityを動かし、粒子群全体で似た動きになる状態と細かくばらつく状態を比較します。
- **途中フレームで想定と違う**：Particleシミュレーションは時間の経過で状態が変わります。評価開始時点とpRenderのPre-Roll設定も確認します。pTurbulenceの設定だけで説明できるとは限りません。

## 出典と確認範囲

- **Blackmagic Design, DaVinci Resolve 21.1 Reference Manual**（September 2026）、Chapter 114「Particle Nodes」pp.2689–2690。役割、Particle / Region入力、RegionのBitmap・Mesh、Strength XYZ、Strength Over Life、Density、Random Seedを確認。
- Conditions・Style・Region・Settingsについては同Chapter「The Common Controls」の説明を参照。ParticleとImageの違いは[パーティクルの基礎](../../learn/02-data/particle)にも整理しています。
- 運用例はマニュアルに記された接続・設定から構成した手順です。Resolve 21.1実機での表示結果、Strength・Densityの既定値や数値範囲、内部の乱流計算式、Edition差、処理負荷は未確認です。
