---
title: pBounce
description: 粒子が指定領域に接触したときの反射を制御するFusionのParticleノード。Elasticity、Variance、Spin、Roughnessなどを使い分ける。
doc_type: node
term_id: pbounce
term_short: pBounceは、指定領域へ接触したParticleを反射させるノード。
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
updated: "2026-10-12"
---

# pBounce

pBounceは、<Term id="particle-data">Particle</Term>（粒子）が指定した領域に接触したとき、進行方向を変えて跳ね返すノードです。床に落ちて弾む光点や、壁に当たって散る破片を作るときに使います。

位置や速度を持つParticleデータを受け取り、反射の影響を受けたParticleデータを出力します。**pBounce自体は粒子を発生させず、2D画像にも変換しません。** データの基本は[パーティクルの基礎](../../learn/02-data/particle)を参照してください。

## 入力と出力

| 接続 | データ | 役割 |
| --- | --- | --- |
| Input（橙） | Particle | [pEmitter](./p-emitter)などから粒子を受け取る |
| Region（条件付き） | 2D Imageまたは3D Mesh | 粒子を跳ね返す面や領域を外部データで指定する |
| Output | Particle | 反射の影響を受けた粒子を後段へ渡す |

通常は橙色のParticle入力だけが表示されます。Inspectorの**Region**タブで**Bitmap**または**Mesh**を選ぶと、外部データを受け取るRegion入力が現れます。Bitmapは2D画像の選択チャンネル、Meshは3Dメッシュの形状を領域の指定に使います。端子の色は選択した種類に応じて緑またはマゼンタになります。

Region入力へ画像を接続しても、その画像から粒子が生成されるわけではありません。

## 主な設定

### Elasticity — 跳ね返る速さ

接触後にどれだけ速度を残すかを指定します。**1.0**なら接触前と同じ速さ、**0.1**なら速度が元の10%になります。床に当たるたび弱く弾ませたい場合は1.0より小さく設定します。

操作範囲は通常**0.0〜1.0**ですが、1.0より大きい値も手入力でき、衝突後の速度が増えます。負の値は入力できますが、21.1マニュアルでは有用な結果にならないと説明されています。

### Variance — 反射角のばらつき

0.0では領域の面に対して規則的な角度で反射します。値を大きくすると反射方向がばらつき、同じ方向から来た粒子でも少しずつ別の方向へ飛びます。

### Spin — 衝突時の回転

領域への接触によって粒子へ回転を加え、すでにある回転も変化させます。正の値は前方回転、負の値は後方回転を与え、絶対値を大きくすると回転が速くなります。**粒子が飛ぶ方向を直接変える設定ではありません。**

### Roughness — 方向の細かな乱れ

反射後の方向に小さなランダム変化を加えます。Varianceも反射角をばらつかせますが、Roughnessは面の粗さを思わせる不規則さを調整する値です。両方を一度に変えず、単独で動かして違いを確認すると調整しやすくなります。

### Surface Motion / Surface Motion Direction — 動く面から受ける影響

**Surface Motion**は、反射面が動いているかのような影響を接触する粒子へ与えます。**Surface Motion Direction**は、その方向を**反射面に対する角度**として指定します。

例えば動く床に当たった粒子が、接触後に横方向へ運ばれるような動きを作れます。設定だけでRegionに接続した画像やメッシュ自体が移動するわけではありません。

### Random Seed / Randomize

ランダム計算を用いるノードに共通する設定です。同じSeedで同じランダム結果を再現し、Randomizeで別のSeedを選べます。すべての跳ね返りがランダムになるという意味ではありません。

## 基本的な接続

```text
pEmitter → pDirectionalForce → pBounce → pRender［2D］→ Merge → MediaOut
                                  ↑                       ↑
                            必要ならRegion               背景映像
```

1. [pEmitter](./p-emitter)から粒子を発生させます。床へ落とす場合は[pDirectionalForce](./pdirectionalforce)で下向きに加速させます。
2. pBounceをParticleチェーンの途中に置き、Regionを粒子の通過位置へ設定します。
3. Elasticityを1.0にして反射を確認し、値を下げて跳ね返りが徐々に弱くなる状態を作ります。
4. 必要に応じてVariance、Roughness、Spinを加え、[pRender](./p-render)を2D出力にして背景へ合成します。

反射はParticleデータの段階で行います。pRenderで2D画像へ変換したあとのMergeは画像合成を行うノードであり、粒子の衝突処理は行いません。

## 制作例

### 床に落ちて弾む破片

床より上にpEmitterを配置し、pDirectionalForceで粒子を下向きへ加速させます。pBounceのRegionを床へ置いて、Elasticityを1より小さくすると、跳ね返るたびに速度が落ちる動きを作れます。Varianceで飛ぶ方向を少し散らし、Spinで衝突時の回転を加えます。

着地後も横方向へ滑り続ける場合は、後段の[pFriction](./pfriction)で速度や回転を減衰させられます。pFriction自体は衝突面を判定しません。

### 2Dロゴの形で光点を反射させる

ロゴを表す2D画像を用意し、pBounceのRegionを**Bitmap**へ切り替えます。追加されたRegion入力へ画像を接続し、反射に使用する画像チャンネルを選びます。pEmitterからロゴへ向かって光点を飛ばすと、画像で指定した領域と接触した粒子を跳ね返す構成を作れます。

画像の見た目と実際の反射位置が違う場合は、Regionの選択チャンネルと、画像のAlpha・明暗を確認してください。

### 3Dの障害物へ粒子を当てる

pBounceのRegionを**Mesh**にし、Shape 3Dなどのメッシュ出力をRegionへ接続します。粒子の発生位置、進行方向、メッシュの位置を合わせます。

ほかの3Dオブジェクトと一緒に描く場合は、pBounceの後でpRenderを3D出力にし、Merge 3DからRenderer 3Dへ渡します。RegionのMesh入力は**反射する面の指定**、pRenderの3D出力は**粒子の描画経路**であり、役割が異なります。

### 衝突をきっかけに色を変える

反射と同時に粒子の色を変えたい場合は、[pChangeStyle](./pchangestyle)を**pBounceより前**に置き、両ノードへ同じRegionを指定します。

```text
pEmitter → pChangeStyle → pBounce → pRender
                 ↑             ↑
               同じRegionをそれぞれに指定
```

21.1マニュアルの例では、先にpBounceで反射してしまうと粒子がRegionから離れ、後段のpChangeStyleが接触を検出できません。色の変更を先に評価する順序が重要です。

## Conditionsによる対象の制限

Particleノードに共通する**Conditions**タブは、どの粒子に作用するかを指定します。

- **Probability**：粒子ごと・フレームごとの作用確率。既定の1.0では対象の全粒子に作用します。
- **Start / End Age**：寿命のどの区間に作用するかを割合で指定します。0.8〜1.0なら寿命の後半20%です。
- **Set Mode / Set**：pEmitterなどで割り当てたSetによって、一部の粒子群だけを対象にします。

Regionが「どこで反射するか」を、Conditionsが「どの粒子に反射を適用するか」を決めます。Probabilityを下げると、面に接触しても反射処理を受けない粒子が生じる場合があります。

## pAvoid・pKillとの違い

| ノード | 領域に対する動作 | 用途 |
| --- | --- | --- |
| **pBounce** | 接触した粒子を反射させる | 壁や床で跳ね返す |
| [pAvoid](./pavoid) | 接触前から進路を変えようとする | 障害物を避ける流れ |
| [pKill](./pkill) | 条件を満たす粒子を除去する | 領域へ入った粒子を消す |

「自然に避ける」「跳ね返す」「消す」のどれを作りたいかで選びます。pBounceがあらゆる速度や形状で厳密に衝突を処理するとは、マニュアルだけでは保証できません。

## うまく動かないとき

- **反射しない**：Regionが粒子の通過位置と交わるか、Bitmap/Meshの場合は追加Region入力が接続されているか確認します。
- **すぐ止まる**：Elasticityが低すぎないか確認します。0.1では速度を90%失います。
- **全粒子が同じ方向へ飛ぶ**：VarianceまたはRoughnessを少し変えます。
- **一部が反射しない**：ConditionsのProbability、Age、Setを確認します。
- **フレームを飛ばすと結果が変わる**：[pRender](./p-render)のPre-RollとSub-Frame Calculation Accuracyを確認します。後者は精度向上と引き換えに計算量が増えます。
- **映像へ合成できない**：pBounceの出力はParticleなので、pRenderの2D/3D出力モードを後段に合わせます。

関連ノードは[Particleノード一覧](./index.md)を参照してください。

## 出典・バージョンと未確認事項

- **一次資料**：Blackmagic Design, *DaVinci Resolve 21.1 Reference Manual*（September 2026）、Chapter 114 pp.2649–2651（pBounceの入出力、Inspector）、p.2651（pChangeStyleとの順序）、pp.2697–2699（Conditions・Region）。
- **対象**：DaVinci Resolve 21.1 Fusionページ。具体例は公式記述に基づく組み合わせで、実機再現は未確認です。
- **未確認**：衝突の内部計算、形状・速度ごとの精度、REGID、Edition差、実機性能。根拠のない数値を補わず、`verification: partial`を維持します。
