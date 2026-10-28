---
title: pFlock
description: Particle同士の追従・引力・反発と距離の条件を使い、群れの動きを作るFusionノード。
doc_type: node
term_id: pflock
term_short: pFlockは、粒子同士の追従・引力・反発を組み合わせて群れの動きを作るノード。
verification: partial
aliases: [pFlock, pFl]
concepts: [particle-data, particle-region]
nodes: [pFlock]
node_family: particles
controls: [Random Seed, Flock Number, Follow Strength, Attract Strength, Repel Strength, Minimum Space, Maximum Space, Conditions, Region]
inputs: [particle, region]
outputs: [particle]
tasks: [particles, flock, swarm]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-12"
---

# pFlock

pFlockは、複数の粒子が互いの動きを追い、離れすぎた仲間へ近づき、近づきすぎた仲間から離れるように働くノードです。鳥や魚の群れ、虫が集まって飛ぶ様子など、個々の粒子が周囲を意識して動いているような表現に使います。

ここでいう「仲間」は、同じ<Term id="particle-data">Particle set</Term>に含まれるほかの粒子です。pFlockは画像を複製するノードではなく、すでに存在する粒子の移動へ力を加えるノードです。粒子を作るpEmitter、粒子を画像や3Dへ変換するpRenderとは役割が異なります。

pFlockが組み合わせる働きは3種類あります。

| 働き | 設定 | 見た目への影響 |
| --- | --- | --- |
| 仲間の動きを追う | Follow Strength | 同じ方向へまとまって動きやすくなる |
| 離れすぎを抑える | Attract Strength / Maximum Space | 群れから離れた粒子が近づこうとする |
| 密集しすぎを抑える | Repel Strength / Minimum Space | 近すぎる粒子が互いに離れようとする |

それぞれ別の働きです。引力だけを強くすると粒子が密集しすぎることもあるため、間隔を保ちたい場合は反発力と距離の設定も合わせて調整します。

## 入力と出力

### Particle入力（オレンジ）

pEmitterやほかのParticleノードが出力したParticle setを受け取ります。位置・速度などを持つ粒子群が入力され、pFlockの作用を受けて次のParticleノードへ進みます。**通常の2D Imageを直接入力する端子ではありません。**

### Region入力（条件付き）

通常はParticle入力だけが表示されます。InspectorのRegionを**Bitmap**にすると2D Image用の入力、**Mesh**にすると3D Mesh用の入力が追加されます。選んだ種類に応じて、粒子へ群れの力を作用させる領域を限定できます。

Bitmapから作った領域を接続すれば、その画像で指定した部分だけにpFlockを作用させる構成を作れます。接続した画像そのものが粒子へ変換されるわけではありません。Particle入力に入れる粒子群と、Region入力に入れる領域指定は別のデータです。

### Particle出力

作用後のParticle setを出力します。そのままpFollowなどへつなげます。通常の2D Imageとして合成したい場合は、後段にpRenderを置き、Output Modeを2Dにします。

```text
pEmitter → pFlock → pRender (2D) → Merge
```

粒子データと画像の違いは[Particleノードの全体像](./index.md)と[パーティクルの基本](../../learn/02-data/particle)も参照してください。

## Inspectorの主な設定

### Random Seed / Randomize

乱数を使う結果の再現条件を指定します。同じ設定とSeedなら同じ乱数の結果を得られます。Randomizeは別のSeedを選ぶ操作です。設定の効果を比較するときはSeedを固定すると、偶然の分布の違いとパラメータの作用を区別しやすくなります。

### Flock Number

各粒子が追従しようとする**ほかの粒子の数**です。Particle set全体の粒子数や「必ず作られる群れの数」を指定するものではありません。

値を増やすほど粒子のまとまりが大きく見えやすくなります。ただし、必ずその個数で独立した群れができるという意味ではありません。実際の発生数やほかの力にも結果が左右されます。

### Follow Strength

周囲の粒子へ付いていこうとする働きの強さです。値を上げると仲間の動きに追従しようとする傾向が強まり、下げると群れから外れやすくなります。

**pFollowノードとは別の設定**です。こちらは粒子同士の動きを扱います。pFollowノードは、Inspectorで指定するFollow Objectの位置へ粒子を引き寄せます。

### Attract Strength

ほかの粒子との距離が**Maximum Spaceより大きい**とき、近づこうとする力の強さです。値を上げると離れた粒子が群れへ戻ろうとする作用が強くなります。

引力だけで粒子間隔が一定になるわけではありません。近すぎる粒子の調整にはRepel Strengthが関わります。

### Repel Strength

ほかの粒子との距離が**Minimum Spaceより小さい**とき、互いに離れようとする力の強さです。

粒子が密集して重なって見える場合は、この値とMinimum Spaceを確認します。値を強くしすぎると、粒子が勢いよく群れから飛び出すような結果になる場合があります。

### Minimum Space / Maximum Space

粒子同士が保とうとする距離の下限と上限です。**Minimum Spaceは近づきすぎの判定、Maximum Spaceは離れすぎの判定**に使われます。

両者を近づけると整った間隔の群れに見えやすく、離すと配置が不規則になりやすくなります。これは粒子間隔を固定する拘束ではなく、上記の力が働く距離の基準です。内部の数値単位や計算式は確認していないため断定しません。

<!-- capture:S319 -->

## 実機例：pFlockの設定を確認する

`pEmitter` から `pFlock` を通して `pRender` の2D出力へ接続します。Flock Numberを3、Follow・Attract・Repel Strengthを各0.1に設定し、24フレームと48フレームの表示を記録しました。

評価開始条件を揃えた軌道比較や、群れや間隔の挙動は確認していません。透明市松はViewerの背景表示です。[接続と設定の記録](/img/fusion/captures/S319/readback.json)に条件を記載しています。

[![pEmitterからpFlockとpRenderへ接続した構成](/img/fusion/captures/S319/graph.png)](/img/fusion/captures/S319/graph.png)

粒子をpFlockへ入力します。

[![pFlockのFlock Numberと強度、間隔の設定](/img/fusion/captures/S319/controls.png)](/img/fusion/captures/S319/controls.png)

Flock Numberを3、各Strengthを0.1に設定します。

[![48フレームの粒子表示](/img/fusion/captures/S319/result48.png)](/img/fusion/captures/S319/result48.png)

48フレームの表示です。

[![24フレームの粒子表示](/img/fusion/captures/S319/result24.png)](/img/fusion/captures/S319/result24.png)

24フレームの表示です。

[再現用Graph](/img/fusion/captures/S319/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S319/capture.json)

<!-- /capture:S319 -->

## 実際の使い方

### 1. 光点を小さな群れにまとめる

まずpFlockだけの作用が分かる構成を作ります。

```text
pEmitter → pFlock → pRender (2D) → MediaOut
```

1. pEmitterで小さな光点を複数生成し、LifespanとVelocityを設定します。粒子数が少なすぎると周囲の粒子との関係が見えません。
2. pFlockのFlock Numberを調整します。最初はFollow Strengthで光点の移動がそろう様子を確認します。
3. Attract Strengthを上げ、離れた光点がほかの光点へ戻るようにします。
4. 密集しすぎる場合はRepel StrengthとMinimum Spaceを調整します。Maximum Spaceで許容する広がりも変えます。
5. pRenderを2Dに設定し、Viewerで時間を進めて確認します。静止フレームだけでは移動の差が分かりません。

最初からすべてのStrengthを大きくすると、何が見た目を変えたのか分かりにくくなります。追従、引力、反発を分けて調整すると原因を追いやすくなります。

### 2. 群れを動く目的地へ誘導する

粒子同士がまとまる働きと、群れ全体をどこへ動かすかを別ノードで扱います。

```text
pEmitter → pFlock → pFollow → pRender (2D)
```

pFlockで粒子同士の追従と間隔を調整し、後段のpFollowでPosition XYZをアニメーションします。pFollowは指定位置へ粒子を引き寄せるため、目的地が移動すると群れも方向を変えながら追いかける表現を作れます。

pFollow側のSpringとDampenで、目的地を行き過ぎる動きや揺れの収まり方を調整できます。pFlockのFollow Strengthは**粒子同士**、pFollowのPosition XYZは**移動する目的地**を扱うと分けて考えます。詳細は[pFollow](./pfollow)を参照してください。

### 3. ロゴの領域だけで群れの動きを作る

粒子は画面内を移動させながら、ロゴの形に指定した範囲だけで集団の動きを変えたい場合です。

```text
pEmitter ──────────────→ pFlock → pRender (2D)
                            ↑ Region (Bitmap)
ロゴを表す2D Image ─────────┘
```

pFlockのRegionをBitmapに切り替え、追加されたRegion入力へロゴの形を表す2D Imageを接続します。Regionの対象チャンネルと範囲を確認し、ロゴ部分で群れの力が作用するように設定します。これによりParticle入力の粒子を生成し直さず、指定領域内の動きだけを変えられます。

pEmitterのRegionは**粒子の発生範囲**、pFlockのRegionは**群れの作用範囲**です。ロゴの画素から粒子を生成することが目的なら[pImage Emitter](./pimageemitter)を使います。

## ConditionsとRegionで作用対象を限定する

pFlockにもParticleノード共通のConditionsとRegionがあります。

- **Probability**：粒子に作用する確率。判定は粒子ごと・フレームごとに行われるため、最初に選ばれた粒子だけが最後まで作用を受ける固定選別ではありません。
- **Start / End Age**：寿命の何％に相当する期間で作用させるかを限定します。寿命の後半だけ群れへ近づけたい場合などに使えます。
- **Set Mode / Set番号**：pEmitterなどが割り当てたSetで粒子を区別します。Setを無視する、指定Setだけに作用させる、指定Setを除く、という選択肢があります。
- **Region**：粒子がどの位置にいるとき作用させるかを指定します。BitmapとMeshのほか、Regionタブの形状も利用できます。

**Conditionsは「どの粒子・どの寿命段階か」、Regionは「どの位置か」**を指定する、と分けると設定が理解しやすくなります。

## 期待した群れにならないとき

| 症状 | 確認すること |
| --- | --- |
| pFlockを置いても変化が見えない | pEmitterで十分な粒子が発生しているか、Flock Numberと各Strengthを確認します。ConditionsやRegionで作用対象を限定していないかも見ます。 |
| 全員が一点に固まる | Attract Strengthだけを強くしていないか、Repel StrengthとMinimum Spaceを見直します。 |
| 粒子が不自然に飛び散る | Repel Strengthと距離の設定を確認し、ほかのForceノードの影響を切り分けます。 |
| 群れが目的地へ向かわない | pFlockは粒子同士の関係を作るノードです。目標位置が必要ならpFollowを追加します。 |
| 何も表示されない | pRenderの有無と、Output Mode（2D/3D）が後段のデータ種別と合っているか確認します。 |

粒子シミュレーションは時間を進めて状態を評価します。大きくフレームを飛んだときだけ結果がおかしい場合は、[フレーム評価](../../learn/05-time/frame-evaluation)とpRenderのPre-Rollも確認してください。

## 関連ノードとの使い分け

- [pFollow](./pfollow)：指定したFollow Objectへ粒子を向かわせる。群れ全体の目的地を動かしたい場合。
- [pPoint Force](./ppointforce)：指定した一点を中心に引き寄せる・押し返す。粒子同士の関係は扱いません。
- [pTurbulence](./pturbulence)：移動に不規則な揺らぎを加える。群れの動きに乱れを加える場合。
- [pFriction](./pfriction)：移動速度や回転を減衰させる。動きが激しすぎる場合。

## 出典と確認範囲

Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 114「Particle Nodes」pp.2665–2667（pFlockの入力、Flock Number、Follow / Attract / Repel Strength、Minimum / Maximum Space、pFollowとの併用）およびpp.2697–2699（共通のConditions、Region）に基づきます。

入力とInspector項目はこのマニュアルで確認しました。一方、周囲の粒子を探す方法、内部計算順序、距離値の厳密な単位、全項目の既定値・範囲、実機性能は未確認です。`verification: partial`はこの範囲を表します。
