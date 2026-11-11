---
title: pDirectionalForce
description: 粒子へ一定方向の力を加え、重力・風・限定した領域での加速を作るFusionノード。
doc_type: node
term_id: pdirectionalforce
term_short: pDirectionalForceは、粒子を指定した方向へ加速させるParticleノード。
verification: partial
aliases: [pDirectionalForce, pDirectional Force, pDF]
concepts: [particle-data, particle-region]
nodes: [pDirectionalForce]
node_family: particles
controls: [Random Seed, Strength, Direction, Direction Z, Conditions, Region]
inputs: [particle, region]
outputs: [particle]
tasks: [particles, force, gravity, wind]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-13"
---

# pDirectionalForce

pDirectionalForceは、すでに発生している粒子へ**指定した方向の力を加える**ノードです。下向きに設定すれば重力のような落下、横向きにすれば風で流されるような動きを作れます。力の向きは粒子の位置から計算するのではなく、Inspectorで指定します。

粒子を新しく作るノードでも、粒子の速度を一定値に固定するノードでもありません。前段から受け取った<Term id="particle-data">Particle set</Term>（位置・速度・寿命などを持つ粒子のデータ）へ作用し、その結果を後段へ渡します。時間が進むにつれて速度と軌道が変わるため、pEmitter側で与えた初速や、ほかのForceノードとの組み合わせが見た目に影響します。

## 入力と出力

| 端子 | データ | 役割 |
| --- | --- | --- |
| Input（オレンジ） | Particle | [pEmitter](./p-emitter)などから粒子を受け取る |
| Region（条件付き） | 2D Imageまたは3D Mesh | 力をかける場所を別の画像・形状で指定する |
| Output | Particle | 力を加えた粒子のデータを次のParticleノードへ渡す |

通常はParticle入力だけが表示されます。Inspectorの**Region**で**Bitmap**または**Mesh**を選ぶと、追加のRegion入力が現れます。Bitmapは画像の選択したチャンネル、Meshは3D形状を用いて作用範囲を決めます。追加端子は選択状態に応じて緑またはマゼンタで表示されます。

Regionへつないだ画像やMeshそのものが加速したり、Particleへ変換されたりするわけではありません。**Particle入力は動かす対象、Region入力は力をかける場所**です。

## 基本の接続

```text
pEmitter → pDirectionalForce → pRender (2D) → Merge
```

1. pEmitterで粒子を発生させ、最初に初速と寿命を調整します。
2. pDirectionalForceで力の向きとStrengthを設定します。
3. [pRender](./p-render)のOutput Modeを**2D**にすると、Particleを通常の画像に変換し、Mergeで実写や背景へ重ねられます。

pDirectionalForceの出力は最後までParticleのままです。pRenderの既定出力は3Dなので、2DのMergeへ直接つなぐ場合はOutput Modeを確認してください。3Dシーンとして扱う場合は、`pRender (3D) → Merge 3D → Renderer 3D`という経路を使います。

## Inspectorの主な設定

### Strength

力の強さです。**正の値**ではDirectionとDirection Zで指定した方向へ、**負の値**では反対方向へ粒子を動かします。値を大きくすると、同じ時間を経過したときの速度や軌道の変化が大きくなります。

Strengthを指定しても、粒子がその速度で等速移動するわけではありません。pEmitterの初速、ほかのForceノード、時間の経過によって最終的な動きが変わります。風を表現するなら横向きの初速を与える方法もありますが、pDirectionalForceを使うと発生後の粒子へ継続して横向きの力を加えられます。

### Direction

**X/Y平面内での力の向き**を指定します。マニュアルでは重力を想定した既定方向が**Y軸の下向き（-90度）**と説明されています。上昇させたい場合は力の方向を変えるか、Strengthの符号を反転させます。

画面上で左右に流れる力と上下へ落ちる力を試すときは、まずDirectionを変え、Strengthを固定したまま比較すると違いを確認しやすくなります。

### Direction Z

**Z方向の成分**を指定します。X/Y平面だけでなく奥行き方向へ粒子を動かしたいときに使います。Zの正負が画面上で「手前・奥」のどちらに見えるかはカメラや3Dシーンの配置にも依存するため、Direction Zの値だけから見かけの移動方向を決めつけないでください。

### Random Seed / Randomize

乱数を使うParticleノードで共通して現れる項目です。Seedが同じなら同じ乱数系列を使い、Randomizeで別のSeedを選べます。**この項目があるだけで、力の方向やStrengthがランダムになるわけではありません。** 方向に不規則な変化を加えたい場合は[pTurbulence](./pturbulence)などを検討します。

## ConditionsとRegionで効く対象を絞る

pDirectionalForceでは「**どの粒子へ、いつ作用するか**」をConditionsで、「**どこで作用するか**」をRegionで設定します。どちらもParticleノードに共通する機能で、pDirectionalForce固有の力の向き・強さとは別の制御です。

**Conditions**では、主に次を使います。

- **Probability**：各フレームで粒子ごとに力が作用する確率です。1.0ならすべての対象粒子、0.6なら各フレームで60%の確率です。あるフレームで選ばれた粒子が、その後ずっと選ばれる設定ではありません。
- **Start / End Age**：寿命の割合で作用する時期を限定します。たとえば0.8〜1.0なら、寿命の最後の20%にだけ力を加えます。
- **Set Mode / Set #**：粒子を発生させるノードなどで割り当てたSet番号に基づき、指定Setへ作用させるか、指定Setを除外するかを選びます。Setを使わなければIgnore Setsで区別せず扱えます。

**Region**は粒子がいる場所で作用を制限します。初期設定のように領域を制限しなければ、Particle入力から来た対象粒子全体へ力が働きます。たとえばCubeなら3D空間の一定範囲、Bitmapなら2D画像の選択チャンネル、Meshなら接続した3D形状を使えます。BitmapとMeshを選んだ場合のみ、該当する追加入力を接続します。

pEmitterのRegionは**粒子が生まれる場所**を決めますが、pDirectionalForceのRegionは**すでにある粒子に力が働く場所**を決めます。この違いが重要です。ParticleとRegionの基礎は[Particleノード一覧](./index.md)と[Particleの基本](../../learn/02-data/particle)で確認できます。

<!-- capture:S306 -->

## 実機例：粒子に方向性の力を接続する

`pEmitter` から `pDirectionalForce` を通し、`pRender` の2D出力を `MediaOut` へ接続します。Strengthを0.001、Directionを270に設定し、48フレームの光点を表示しました。

この静止画では力による移動や加速を比較していません。[接続と設定の記録](/img/fusion/captures/S306/readback.json)に条件を記載しています。

[![pEmitter、pDirectionalForce、pRender、MediaOutの接続](/img/fusion/captures/S306/graph.png)](/img/fusion/captures/S306/graph.png)

粒子をpDirectionalForceへ送り、pRenderで画像にします。

[![pDirectionalForceのStrengthとDirectionの設定](/img/fusion/captures/S306/controls.png)](/img/fusion/captures/S306/controls.png)

Strengthを0.001、Directionを270に設定します。

[![48フレームに表示された光点の粒子](/img/fusion/captures/S306/result.png)](/img/fusion/captures/S306/result.png)

pRenderの2D出力を表示しています。

[再現用Graph](/img/fusion/captures/S306/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S306/capture.json)

<!-- /capture:S306 -->

## 制作例

### 1. 上へ噴き出した光点を落下させる

```text
pEmitter → pDirectionalForce → pRender (2D) → Merge
```

pEmitterで光点を上向きの初速で発生させます。この段階では粒子は上へ移動します。pDirectionalForceを既定の下向きにしてStrengthを正にすると、上昇中の粒子にも下向きの力が加わり、徐々に上昇が弱まってから落下する軌道を作れます。

上昇しきる前に下がってしまうなら、pEmitterの初速を上げるかStrengthを下げます。逆に、なかなか落ちてこない場合はStrengthを調整します。pRenderを2Dにした結果をMergeで映像へ重ねれば、噴水状の光や上から落ちる火花の動きに利用できます。実際の重力加速度との数値上の対応は、公式マニュアルの該当節からは確認できません。

### 2. ロゴの内側を通る光点だけ横風で流す

```text
pEmitter ───────────────→ pDirectionalForce → pRender (2D)
                             ↑ Region (Bitmap)
ロゴの白いシルエット画像 ─────┘
```

pEmitterで画面を横切る光点を発生させます。pDirectionalForceではDirectionを横向きに設定し、RegionをBitmapへ切り替えます。追加されたRegion入力へ、ロゴの内側が白く外側が黒い画像を接続し、使用チャンネルを確認します。

これにより、画像で指定した場所を通る間だけ横方向の力を受け、外側ではその力が働かない動きを作れます。Region画像は**力の作用範囲**を指定するためのもので、画像の明暗がStrengthの方向を決めるわけではありません。画像の勾配に沿う力を使いたい場合は[pGradientForce](./pgradientforce)との違いを確認してください。

### 3. 2種類の粒子を統合し、片方だけ風を受けさせる

```text
pEmitter A（紙片 / Set 1） ──┐
                              pMerge → pDirectionalForce → pRender (2D)
pEmitter B（火花 / Set 2） ──┘
```

2つのpEmitterで別々のParticle streamを作り、それぞれ異なるSetを割り当てます。[pMerge](./pmerge)で流れを一つにしてから、pDirectionalForceのConditionsで**Aに割り当てたSetだけ**が作用対象となるよう設定します。

この構成では、紙片を横風で流しながら、火花は元の初速を中心に動かすなど、同じParticle出力内で挙動を分けられます。火花にも落下を与えたい場合は、全体に作用する別のpDirectionalForceを使うと、Setごとの風と共通の重力を独立して調整できます。

## 動きが想定と違うとき

| 症状 | 確認すること |
| --- | --- |
| 力を加えたのに粒子が動かない | pEmitterが粒子を生成しているか、Strengthが0でないか、ConditionsやRegionで対象を外していないかを確認します。 |
| 上昇させたいのに落下する | DirectionとStrengthの正負を確認します。Strengthを負にすると指定方向と逆に働きます。 |
| 一部の粒子だけ不規則に加速する | Probabilityが1.0未満になっていないか確認します。判定は粒子ごと・フレームごとです。 |
| Bitmapの場所だけ作用しない | RegionがBitmapになっているか、追加されたRegion端子へ画像が接続されているか、画像のどのチャンネルを使っているかを確認します。 |
| Direction Zを変えても違いが分かりにくい | pRenderの2D / 3D Output Modeとカメラの向き、粒子の奥行き位置を確認します。 |
| 途中フレームから再生すると動きが変わる | Particleは時間の経過に沿って計算されます。[フレーム評価](../../learn/05-time/frame-evaluation)とpRenderのPre-Rollを参照してください。 |

## 似たノードとの使い分け

| ノード | 何をするか | 向いている用途 |
| --- | --- | --- |
| **pDirectionalForce** | すべての対象粒子へ同じ方向の力を加える | 重力、一定方向の風 |
| [pPointForce](./ppointforce) | 指定した点へ引き寄せる、または反発させる | 中心へ集める、爆発的に散らす |
| [pVortex](./pvortex) | 回る動きを加える | 渦、旋回 |
| [pTurbulence](./pturbulence) | 不規則な揺れや流れを加える | 煙、乱気流 |
| [pFriction](./pfriction) | 移動速度や回転を減衰させる | 加速しすぎた粒子を落ち着かせる |

## 出典・バージョンと確認範囲

- **一次資料**：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 114「Particle Nodes」pp.2658–2659（pDirectionalForceの入力、基本接続、Strength、Direction、Direction Z、Randomize）、pp.2697–2699（共通ConditionsとRegion）。
- **対象**：DaVinci Resolve 21.1のFusionページ。設定名と端子の説明はマニュアルで確認し、制作例はそれらの機能を組み合わせた例です。
- **未確認**：Forceの内部計算・数値単位、パラメータの厳密な範囲、実機での挙動・性能、Free / Studio間の差。`verification: partial`のままとします。
