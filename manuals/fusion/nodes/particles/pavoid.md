---
title: pAvoid
description: 粒子が指定した領域に近づくと、DistanceとStrengthに応じて進路を変えさせるFusionのParticleノード。
doc_type: node
term_id: pavoid
term_short: pAvoidは、指定した領域に近づいた粒子がその場所を避けようとする力を加えるノード。
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
updated: "2026-10-12"
---

# pAvoid

pAvoidは、<Term id="particle-data">Particle</Term>（粒子）が指定した領域に近づいたとき、その領域から遠ざかる方向へ動こうとする力を加えるノードです。光点がロゴの周囲を避けながら流れる、煙が障害物を回り込もうとする、といった動きの調整に使います。

このノードは粒子を発生させません。また、壁との衝突を完全に防ぐ機能でもありません。粒子の速度が大きいと、回避の力を受けても領域を横切ることがあります。粒子の仕組み自体は[パーティクルの基礎](../../learn/02-data/particle)を参照してください。

## 入力と出力

| 接続 | データ | 役割 |
| --- | --- | --- |
| Input（橙） | Particle | pEmitterなどが生成した粒子を受け取る |
| Region（条件付き） | 2D Imageまたは3D Mesh | 粒子が避けようとする領域を外部の画像・形状で指定する |
| Output | Particle | 回避の力の影響を受けた粒子を後段へ渡す |

通常の入力は、Particleノードをつなぐ橙色の端子だけです。Inspectorの**Region**で**Bitmap**または**Mesh**を選ぶと、緑色またはマゼンタのRegion入力が追加されます。Bitmapの場合は2D画像の選択チャンネルを、Meshの場合は3Dメッシュの形状を領域の指定に使います。Region画像をつないでも、画像のピクセルが新しい粒子として生成されるわけではありません。

出力もParticleデータです。映像と重ねるには、通常[pRender](./p-render)で2D画像にしてからMergeへ渡します。pRenderを3D出力にする構成では、3DノードとRenderer 3Dが必要です。

## 何が起こるか

pAvoidは、指定した領域へ粒子が接近すると、その領域から離れるように運動へ働きかけます。主に二つの値で調整します。

### Distance

領域からどれだけ離れた位置で回避し始めるかを決めます。大きくすると遠くから進路が変わり、小さくすると領域へ近づいてから変化します。

### Strength

領域から遠ざかる力の強さを決めます。負の値にすると作用する向きが逆になり、粒子は領域へ向かうように動きます。**負のStrengthは「回避が弱くなる」だけではありません**。

### Random Seed / Randomize

ランダム計算を使うノードに共通する設定です。同じSeedでは同じランダム結果を再現でき、Randomizeで別のSeedを選択します。pAvoidの回避方向が常にランダムになるという意味ではありません。

## 最小構成

```text
pEmitter → pAvoid → pRender［2D］→ Merge → MediaOut
               ↑                       ↑
        必要ならRegion                背景映像
```

1. [pEmitter](./p-emitter)で粒子を発生させ、向きと速さを調整します。
2. pAvoidをpEmitterとpRenderの間に挿入します。まず粒子が通る位置にRegionを設定します。
3. Distanceを変えて回避を始める距離を確認し、Strengthで曲がり方を調整します。
4. pRenderを2D出力にし、Mergeで背景映像へ合成します。

変化が分からない場合はpAvoidを無効にして粒子の元の進路を確認し、再度有効にします。粒子が領域を通り抜ける場合は、DistanceやStrengthだけでなくpEmitterの初速も確認してください。

## 制作例

### ロゴの周囲を避ける光点

まずロゴの形を表す2D画像を用意します。pAvoidのRegionを**Bitmap**に切り替え、追加されたRegion入力へその画像を接続します。Regionが使用する画像チャンネルを選び、ロゴの形が回避領域になるよう設定します。

次にpEmitterから画面横方向へ進む光点を発生させます。Distanceを大きめにしてロゴから離れた位置から曲がる状態を確認し、Strengthを徐々に上げます。最後にpRenderの2D出力を実写やグラフィックの背景とMergeします。

この方法で作れるのは「ロゴを避けようとする動き」です。ロゴの輪郭に沿う厳密な衝突判定や、すべての粒子が必ず避ける結果を保証するものではありません。

### 3Dの障害物に近づく粒子

pAvoidのRegionを**Mesh**にし、Shape 3Dなどのメッシュ出力をRegion入力へ接続します。pEmitterから障害物へ向かう粒子を流し、DistanceとStrengthで近づく前の進路変更を作ります。

pRenderを3D出力にしている場合は、粒子の結果をMerge 3Dなどへ渡し、Renderer 3Dで描画します。領域の位置と粒子の奥行きが合っていないと作用を確認しにくいため、まずシンプルな形状で試します。

### 粒子の一部にだけ回避を適用する

**Conditions**では、確率（Probability）、寿命中の区間（Start / End Age）、粒子のSetを使って作用対象を絞れます。例えばSetを分ければ、同じ発生源の粒子でも一部のグループだけが障害物を避ける動きを検討できます。

Regionは**空間のどこで作用するか**、Conditionsは**どの粒子が作用対象か**を指定します。pEmitterの粒子発生範囲とも別の設定です。

## pBounce・pKillとの使い分け

| ノード | 動作 | 向いている用途 |
| --- | --- | --- |
| **pAvoid** | 領域へ接近する粒子の進路を変えようとする | 接触前から避けるような流れを作る |
| [pBounce](./pbounce) | 領域に接触した粒子を反射させる | 床や壁への跳ね返りを作る |
| [pKill](./pkill) | 条件に合う粒子をデータから除去する | 一定領域に入った粒子を消す |

「領域を通過させたくない」場合も、この3ノードは同義ではありません。反射させたいならpBounce、消してよいならpKill、接近前から自然に曲げたいならpAvoidを選びます。いずれも形状・シミュレーション条件によって結果が変わるため、厳密な遮蔽保証が必要な場合は実際の動作を確認してください。

## うまく動かないとき

- **Region端子が表示されない**：InspectorでRegionをBitmapまたはMeshへ切り替えたか確認します。
- **光点がそのまま直進する**：pAvoidが有効か、領域の位置と粒子の通過位置が合っているか、DistanceとStrengthが小さすぎないか確認します。
- **粒子が領域を突き抜ける**：pAvoidは通過防止を保証しません。粒子の初速と回避を始める距離、力の強さを見直します。
- **指定した画像が効かない**：Bitmapに設定したRegion入力へ画像が接続されているか、使用チャンネルが目的の形状を表しているか確認します。
- **一部だけ動きが変わる**：ConditionsのProbability、Age、Setの制限を確認します。
- **映像として見えない**：Particle出力のままMergeへつないでいないか、pRenderの2D/3D出力設定が後段と合っているか確認します。

ほかの粒子ノードは[Particleノード一覧](./index.md)を参照してください。

## 出典・バージョンと未確認事項

- **一次資料**：*DaVinci Resolve 21.1 Reference Manual*（September 2026）、Chapter 114「Particle Nodes」pp.2647–2649（pAvoidの役割、入力、Distance、Strength、Randomize）、pp.2697–2699（ConditionsとRegion）。
- **対象**：DaVinci Resolve 21.1のFusionページ。接続例はマニュアル記載のノードの役割と入出力に基づく制作手順であり、実機での動作結果は未検証です。
- **未確認**：Distance・Strengthの数値範囲と既定値、内部計算式、REGID、Edition差、Bitmap/Meshの実測精度。根拠のない値は補わず、`verification: partial`を維持します。
