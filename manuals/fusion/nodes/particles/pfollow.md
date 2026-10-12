---
title: pFollow
description: 指定した3D位置へ粒子をばねのように追従させ、動く目標を追いかける流れや群れを作るFusionノード。
doc_type: node
term_id: pfollow
term_short: pFollowは、指定した位置に粒子を引き寄せ、行き過ぎや揺れを伴う追従運動を作るノード。
verification: partial
aliases: [pFollow, pFo]
concepts: [particle-data, particle-region]
nodes: [pFollow]
node_family: particles
controls: [Random Seed, Position XYZ, Spring, Dampen, Conditions, Region]
inputs: [particle, region]
outputs: [particle]
tasks: [particles, follow, swarm, motion-path]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-12"
---

# pFollow

pFollowは、粒子を指定した位置へ引き寄せ、ばねに引っ張られるような動きを作るノードです。粒子が目標地点を行き過ぎたり、再び近づいたりする動きを、SpringとDampenで調整します。目標位置をアニメーションすれば、光の粒や虫の群れが動くものを追いかける表現に使えます。

ここでいう「目標」は、pFollowのInspectorで設定する**Follow Objectの位置**です。外部の画像や3Dオブジェクトを粒子へ変換する機能ではありません。動かしたい粒子はpEmitterなどで別に用意します。

## 入力と出力

### Particle入力（オレンジ）

pEmitter、pMergeなどのParticleノードが出力する<Term id="particle-data">Particle set</Term>を受け取ります。Particle setは、各粒子の位置・速度・寿命などを持つデータです。pFollowはその移動へ作用するため、2D Imageをこの端子へ直接接続することはできません。

### Region入力（条件付き）

RegionタブでBitmapを選ぶと、領域指定に使う2D Imageの入力が現れます。Meshを選ぶと、3D Meshを受け取る入力が現れます。どちらも粒子の**追従が作用する範囲**を指定するための入力であり、Follow Objectの位置そのものを動かす入力ではありません。

Bitmapでは入力画像の指定チャンネルから、Meshでは形状から作用領域を決めます。Regionが合っていないと、Particle入力へ粒子が流れていても追従が見えない場合があります。

### Particle出力

追従の作用を受けたParticle setを次のParticleノードへ渡します。結果を2D画像として確認するには、後段にpRenderを置いてOutput Modeを2Dにします。pRenderを3Dにする場合は3Dシーンへ接続し、その後にRenderer 3Dで画像化します。

```text
pEmitter → pFollow → pRender (2D) → MediaOut
```

ParticleとImageの区別は[Particleノードの全体像](./index)と[パーティクルの基本](../../learn/02-data/particle)も参照してください。

## Inspectorの主な設定

### Position XYZ

Follow Objectの3D位置です。XYZを変更すると、Viewer内に目標位置を示すコントロールが表示されます。この値をキーフレームで動かすと、粒子が追う目的地の経路を作れます。

たとえば画面左から右へ動くようにPositionをアニメーションすると、粒子も時間をかけて右へ引かれます。**Positionの移動経路と各粒子の実際の軌跡は同じではありません。** 粒子は元の速度と追従作用を持つため、遅れたり、行き過ぎたりします。

「Path」という説明はPosition XYZを時間変化させた結果を指し、別のPath入力端子があるという意味ではありません。

### Spring

粒子が目標を行き過ぎ、戻る動きの強さを調整します。値を高くすると、目標に対するばねの伸び縮みのような動きが強くなります。公式マニュアルでは、粒子とFollow Objectの距離に応じ、寿命の経過とともにばね運動の広がりが変化することも説明されています。

Springを上げても、必ずすべての粒子が同じ円や同じ軌跡を描くわけではありません。元の粒子の速度、発生位置、目標との距離で結果が変わります。

### Dampen

Springによる往復運動を減衰させる設定です。値が低いと往復しやすく、高いと揺れが収まりやすくなります。目的地の近くで長く揺らしたいなら低め、素早く落ち着かせたいなら高めを試します。

まずPositionだけを動かして目標の位置を決め、次にSpring、最後にDampenを調整すると、それぞれが何を変えるか比較しやすくなります。

### Random Seed / Randomize

乱数を使う処理のSeedを指定します。Randomizeは別のSeedを選ぶ操作です。比較時にSeedを固定すれば、乱数の違いではなくSpringやDampenによる変化を見やすくなります。

## 実際の使い方

### 1. ひとつの目標へ光点を追従させる

```text
pEmitter → pFollow → pRender (2D) → MediaOut
```

1. pEmitterで複数の光点を発生させ、VelocityとLifespanを設定します。
2. pFollowでPosition XYZを画面内の目標位置へ置きます。粒子が目標へ向かって動くか、Viewerで時間を進めて確認します。
3. Position XYZにキーフレームを設定し、目標を画面上で移動させます。粒子は目標の現在位置へ向かって進路を変えます。
4. Springを変えて行き過ぎ方を確認し、Dampenでその揺れを収めます。
5. pRenderのOutput Modeを2Dにして、MediaOutや後段のMergeへ接続します。

粒子がすべて同じ位置へ瞬時に移るわけではありません。移動中の遅れと揺れを利用して、ふわふわと追う光点や生き物の群れに見せられます。

### 2. 粒子同士の間隔を保ちながら追従させる

```text
pEmitter → pFlock → pFollow → pRender (2D)
```

pFlockは粒子同士が離れすぎず、近づきすぎないように作用します。pFollowは粒子同士ではなく、Inspectorで指定したFollow Objectへ引き寄せます。両方を使うと、まとまりを保とうとしながら動く目標へ追従する群れを作れます。

調整するときは、まずpFlockでFollow / Attract / Repel StrengthとMinimum / Maximum Spaceを整え、その後pFollowでPosition、Spring、Dampenを設定します。粒子が不自然に散るときは、どちらのノードが原因か一方ずつ無効化して確認します。違いは[pFlock](./pflock)を参照してください。

### 3. ロゴの内側だけで目標へ引き寄せる

```text
pEmitter ─────────────→ pFollow → pRender (2D)
                           ↑ Region (Bitmap)
ロゴを表す2D Image ────────┘
```

pFollowのRegionをBitmapに切り替え、追加されたRegion入力へロゴの形を持つ2D Imageを接続します。Regionの対象チャンネルを確認すると、ロゴ内にある粒子にだけ追従を作用させる構成を作れます。領域の外にいる粒子は、pFollowの位置へ引かれる対象から外れます。

これは**粒子をロゴの形に生成する操作ではありません**。粒子の発生場所をロゴにしたいならpEmitter側のRegion、画像の画素を発生源にしたいなら[pImage Emitter](./pimageemitter)を使います。

## ConditionsとRegionの使い分け

- **Conditions / Probability**：粒子へ作用する確率を指定します。粒子ごとに毎フレーム再判定されるため、最初に選ばれた粒子だけへ最後まで固定的に作用する仕組みではありません。
- **Conditions / Start・End Age**：粒子の寿命のどの割合で追従を効かせるかを指定します。たとえば寿命の後半だけ目標へ集められます。
- **Conditions / Set Mode**：pEmitterなどが割り当てたSetを使い、特定の粒子群だけに効かせたり除外したりします。
- **Region**：粒子の現在位置に応じて作用範囲を限定します。BitmapやMeshのほか、内蔵の形状も使えます。

Conditionsは「どの粒子へ、いつ作用するか」、Regionは「どの位置にいるとき作用するか」を主に分ける設定です。共通コントロールの具体的なUIは、21.1 Reference ManualのChapter 114「The Common Controls」にまとまっています。

## うまく追従しないとき

| 症状 | 確認すること |
| --- | --- |
| pFollowをつないでも何も映らない | pEmitterからParticle setが来ているか、pRenderが接続され、2D / 3DのOutput Modeが後段に合っているか。 |
| 目標を動かしても粒子の進路が変わらない | Position XYZがアニメーションされているか。RegionやConditionsで作用を止めていないか。 |
| 目標の周囲を大きく行き来する | Springを調整し、必要ならDampenを上げて揺れを抑える。 |
| 粒子が目標に届く前に消える | pEmitterのLifespanとVelocityを確認する。 |
| 群れがばらばらになる | pFollowは粒子間距離を直接維持しない。群れが必要ならpFlockも使う。 |

シミュレーションの結果は経過時間に依存します。フレームを大きく飛ばしたときだけ挙動が変わる場合は、[フレーム評価](../../learn/05-time/frame-evaluation)やpRenderのPre-Rollも確認します。

## 関連ノード

- [pFlock](./pflock)：粒子同士の追従、引力、反発を扱う。群れのまとまりを作る場合。
- [pPoint Force](./ppointforce)：一点から引き寄せる、または押し返す。Spring / Dampenによる往復運動を主目的にするpFollowとは異なります。
- [pFriction](./pfriction)：移動や回転を減衰させる。粒子の動きが速すぎる場合に比較します。
- [pRender](./p-render)：Particle setを表示可能な2D Imageまたは3D geometryへ変換する。

## 出典と確認範囲

Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 114「Particle Nodes」pp.2667–2668（pFollowの入力、Follow Object、Position XYZ、Spring、Dampen、pFlockとの併用）およびpp.2697–2699（ConditionsとRegionの共通設定）を参照しました。

正確な入力種別とInspector名は21.1の公式資料から確認しています。一方、内部のばね計算式、時間積分、すべてのパラメータの既定値・範囲、実機での性能は検証していません。`verification: partial`はこの意味です。
