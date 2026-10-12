---
title: pFriction
description: 粒子の移動速度と回転を別々に減衰させ、指定領域を通過するときの抵抗を表現するFusionノード。
doc_type: node
term_id: pfriction
term_short: pFrictionは、粒子の移動と回転へ抵抗を加えて減速させるノード。
verification: partial
aliases: [pFriction, pFr]
concepts: [particle-data, particle-region]
nodes: [pFriction]
node_family: particles
controls: [Random Seed, Velocity Friction, Spin Friction, Conditions, Region]
inputs: [particle, region]
outputs: [particle]
tasks: [particles, friction, slow-motion]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-12"
---

# pFriction

pFrictionは、動いている粒子に抵抗を加えて、移動や回転を徐々に弱めるノードです。たとえば、空中を漂う光点がゆっくり止まる動き、液体の中へ入った粒子だけが減速する動き、回転する破片の回転だけが収まる動きを作れます。

粒子の**移動速度**と**回転**は別々に調整できます。pFriction自体は粒子を発生させず、画面に画像を描画することもしません。pEmitterなどから受け取った<Term id="particle-data">Particle set</Term>を変更し、後段のParticleノードへ渡します。

## 入力と出力

### Particle入力（オレンジ）

pEmitterなどから、各粒子の位置・速度・回転・寿命といった情報を持つParticle setを受け取ります。この端子へ普通の2D Imageを直接接続することはできません。

### Region入力（条件付き）

通常はParticle入力だけが表示されます。InspectorのRegionを**Bitmap**にすると2D Imageを受け取る入力が、**Mesh**にすると3D Meshを受け取る入力が追加されます。どちらも、粒子を減速させる**場所を指定するための入力**です。画像やMeshを粒子へ変換する入力ではありません。

Bitmapの場合は入力画像の選択したチャンネル、Meshの場合は3D形状を使って、抵抗を与える領域を定めます。Regionタブ内のCubeなどを使う場合は、追加の入力画像なしで作用する範囲を作れます。

### Particle出力

pFrictionが作用した後のParticle setを出力します。結果を2D画像で見たい場合は、pRenderのOutput Modeを2Dに設定して接続します。

```text
pEmitter → pFriction → pRender (2D) → MediaOut
```

Particle setと2D Imageの区別は[Particleノード](./index)と[Particleの基本](../../learn/02-data/particle)を参照してください。

## Inspectorの主な設定

### Velocity Friction

粒子の**移動速度**に対する抵抗の強さです。値を大きくすると、対象領域を通る粒子は強く減速します。初速が同じ粒子でも、作用範囲やほかのForceノードの設定によって、止まり方は変わります。

ここでいうVelocityは移動の速さと向きを持つ速度情報です。pFrictionは粒子が移動するための抵抗を加えるのであって、位置を直接固定するノードではありません。pDirectionalForceなどで加速を続けている場合は、減速と加速が同時に働きます。

### Spin Friction

粒子の**回転・Spin**に対する抵抗の強さです。値を大きくすると、対象粒子の回転がより強く減衰します。Velocity Frictionとは独立した調整なので、直進する速度はできるだけ残し、回転だけを落ち着かせたい場合にも使えます。

回転していない粒子には、Spin Frictionを増やしても回転の変化は見えません。まず前段で回転を与えてから比較します。

### Random Seed / Randomize

乱数を利用するParticleノードに共通するSeedの設定です。Randomizeは新しいSeedを選びます。設定の違いを比較するときはSeedを固定しておくと、乱数による変化と抵抗の変化を区別しやすくなります。

Velocity FrictionとSpin Frictionについて、内部の抵抗計算式や数値単位は21.1マニュアルの該当説明からは特定できません。値を物理的な粘性係数とみなさず、プレビューで動きを確認して調整します。

## 実際の使い方

### 1. 飛び出した光点を次第に静止させる

```text
pEmitter → pFriction → pRender (2D) → MediaOut
```

1. pEmitterで光点を複数発生させ、初速と寿命を設定します。
2. pRenderを2D出力に切り替え、時間を進めて光点が移動することを確認します。
3. pFrictionのRegionをAllにして、粒子が通る領域で抵抗が働くようにします。
4. Velocity Frictionを少しずつ上げ、速度が落ちていく様子を比較します。
5. 回転も付けた粒子なら、Spin Frictionを別に上げて回転の収まり方を調整します。

粒子の寿命が短いと、止まる前に消えてしまいます。減速の変化が分かる長さのLifespanを先に用意すると比較しやすくなります。

### 2. 床で跳ねる破片が、低い位置では動きにくくなる

```text
pEmitter → pDirectionalForce → pBounce → pFriction → pRender (2D)
                                   ↑              （Region: Cubeなど）
                              床の衝突Region
```

pDirectionalForceで破片を下方へ動かし、pBounceには床の形状を衝突領域として指定します。pBounceは粒子が障害物へ当たったときの反射を担当します。一方、pFrictionには床に近い薄いCubeなどの領域を設定し、その範囲に入った粒子の移動速度と回転を弱めます。

**pFrictionは衝突判定や反射を作るノードではありません。** 単独で床を指定してもpBounceの代わりにはなりません。また、この接続は摩擦を伴う厳密な剛体物理シミュレーションではなく、跳ね返りと局所的な減速を組み合わせた表現です。詳しくは[pBounce](./pbounce)も参照してください。

### 3. ロゴを通過した光点だけを減速させる

```text
pEmitter ─────────────→ pFriction → pRender (2D)
                           ↑ Region (Bitmap)
ロゴの形を持つ2D Image ─────┘
```

pFrictionのRegionをBitmapに切り替え、追加されたRegion入力へロゴのシルエット画像をつなぎます。Regionタブで使用チャンネルを確認し、ロゴ部分に来た粒子へ抵抗が働くように設定します。これにより、画面全体の粒子を止めず、ロゴを通る部分だけ速度を弱められます。

ここで使う画像は**作用場所を指定するマスク**です。粒子をロゴの画素から発生させたい場合は[pImage Emitter](./pimageemitter)を使います。

## ConditionsとRegionの違い

pFrictionにもParticleノード共通のConditionsとRegionがあります。両者は役割が異なります。

- **Conditions / Probability**：粒子に抵抗が作用する確率です。判定は粒子ごと・フレームごとに行われます。最初に選んだ粒子へ固定的に作用し続ける設定ではありません。
- **Conditions / Start・End Age**：粒子の寿命のどの割合で抵抗を効かせるかを限定します。寿命の後半だけ減速する表現に使えます。
- **Conditions / Set Mode**：pEmitterなどで割り当てたSetをもとに、特定の粒子だけへ作用させたり除外したりします。
- **Region**：粒子が**どこにいるとき**抵抗を受けるかを指定します。Bitmap、Mesh、Cubeなどが使えます。

たとえば「寿命後半の粒子だけを、ロゴの内側で減速する」場合は、ConditionsのAgeとRegionのBitmapを併用します。Conditionsは対象となる粒子・時期、Regionは場所を指定する、と分けて考えます。

## 動きが変わらない場合の確認

| 症状 | 確認すること |
| --- | --- |
| ノードを入れても減速が見えない | pEmitterに初速があるか、Velocity Frictionが小さすぎないか、RegionやConditionsで対象を外していないかを確認します。 |
| 回転が止まらない | Spin Frictionと、前段で回転が与えられているかを確認します。移動速度の抵抗とは別です。 |
| 想定外の場所で減速する | Regionの種類・位置・サイズを見直し、Bitmapの場合は使用チャンネルを確認します。 |
| 床を通り抜ける | pFrictionは衝突用ではありません。pBounceのRegionと設定を確認します。 |
| 速度がなかなか落ちない | pDirectionalForceなど、別ノードが継続して加速していないかを確認します。 |
| 粒子自体が表示されない | pRenderの有無とOutput Mode、後段が2D Imageか3Dシーンかを確認します。 |

粒子の計算はフレームの進行に依存します。時間を大きく飛ばしたときにだけ結果が異なる場合は、[フレーム評価](../../learn/05-time/frame-evaluation)とpRenderのPre-Rollも参照してください。

## 関連ノード

- [pBounce](./pbounce)：指定した障害物で粒子を跳ね返す。衝突と減速を分けて使う場合に組み合わせます。
- [pDirectionalForce](./pdirectionalforce)：粒子を一定方向へ加速させる。減速と同時に働く力を切り分ける場合。
- [pFollow](./pfollow)：指定位置へ粒子を追従させる。移動目標を設定する目的ならこちらです。
- [pKill](./pkill)：指定条件の粒子を削除する。動きを遅くすることとは違います。
- [Particleノード一覧](./index)：pEmitterからpRenderまでの流れを確認できます。

## 出典と確認範囲

Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 114「Particle Nodes」pp.2669–2670（pFrictionの入力、Velocity Friction、Spin Friction、Regionと設定）およびpp.2697–2699（ConditionsとRegionの共通仕様）を参照しました。

入力と主なInspector設定の名称・役割は公式資料で確認しました。一方、抵抗の内部計算式、全設定の既定値・範囲、実機での演算・描画性能は未検証です。したがって`verification: partial`のままとしています。
