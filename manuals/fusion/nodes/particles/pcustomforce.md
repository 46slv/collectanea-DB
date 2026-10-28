---
title: pCustomForce
description: FusionのParticleに独自のForceとTorqueを与えるノード。画像・数値・位置入力、式の構成、作用範囲と制作例をResolve 21.1基準で説明する。
doc_type: node
term_id: pcustomforce
term_short: pCustomForceは、独自の式でParticleに働くForceとTorqueを計算するノード。
verification: partial
aliases: [pCustomForce, pCustom Force, pCF]
concepts: [particle-data, expressions, particle-region]
nodes: [pCustomForce]
node_family: particles
controls: [Number Inputs, Position Inputs, Setup, Intermediate, Force Expressions, Torque Expressions, Conditions, Region]
inputs: [particle, image, image, region]
outputs: [particle]
tasks: [particles, force, expressions, custom-physics]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-13"
---

# pCustomForce

pCustomForceは、粒子（<Term id="particle-data">Particle</Term>）へ働く**力（Force）と回転方向の力（Torque）**を式で決めるノードです。pEmitterで作った粒子の移動や回転を、現在位置、別の画像、数値コントロールなどに応じて変化させたいときに使います。

たとえば、動く目標点へ近づく力や、ある範囲に入ったときだけ粒子を回す力を設計できます。ただし、pCustomForceは粒子を発生させるノードでも、完成画像を出力するノードでもありません。前段の粒子に計算した力を加え、後段へParticleデータを渡します。通常の2D画像との違いは[Particleの基本](../../learn/02-data/particle)を参照してください。

## 入力・出力

| 接続 | データ | 役割 |
| --- | --- | --- |
| **Input（オレンジ）** | Particle | pEmitterや別のParticleノードから、位置・速度などを持つ粒子を受け取る |
| **Image 1（緑）** | 2D Image | 式から値を参照する1枚目の画像 |
| **Image 2（マゼンタ）** | 2D Image | 2枚目の参照画像。Image 1とは独立して使える |
| **Region（必要時）** | 2D Bitmapまたは3D Mesh | 力を作用させる場所を制限する。RegionタブでBitmapまたはMeshを選ぶと入力が現れる |
| **出力** | Particle | 力を加えた粒子を後段へ渡す |

**Image入力とRegion入力は別の役割です。** Image 1 / 2は式が画素値を読むための資料であり、Regionは式の作用範囲を指定します。たとえば画像の明るさで力の大きさを変えるなら明るさを読む画像をImage 1へ、効果をロゴの内部だけに限定するならロゴ画像をRegionへ接続します。

マニュアルの入力節はParticle、Image 1、Image 2という通常の3入力と、条件付きのRegion入力を列挙しています。一方、冒頭には「three image inputs」という記述があり、端子一覧と一致しません。本記事では具体的な**端子一覧**に従います。

## 基本の接続

```text
pEmitter ──(Particle)──→ pCustomForce ──(Particle)──→ pRender (2D) → MediaOut
                         ↑          ↑
                      Image 1    Region（必要時）
```

pEmitterが粒子と初速を作り、pCustomForceが式で求めた力を加え、pRenderが表示可能な2D Imageへ変換します。映像と合成するならpRenderの後にMergeを使います。3Dで扱う場合は[pRender](./p-render)の3D出力を3Dシーン側へ接続します。Image 1をつないだだけでは、画像に応じた力は自動生成されません。

## ForceとTorque

**Force**は粒子のXYZ方向の移動へ作用する力です。「右へ押す」「移動する点へ引き寄せる」「位置に応じて押す方向を変える」といった動きを設計します。

**Torque**は粒子のspin（回転の動き）へ作用します。移動方向の力とは独立した式を使います。Torqueは見た目の色やサイズを変える設定ではありません。

どちらも**粒子の位置・角度を式の値へ直接置き換える処理ではありません**。pEmitterで与えた初速、別のForce、時間経過も結果に影響します。位置・速度・色などの値を式で直接操作したい場合は[pCustom](./pcustom)を使い分けます。

## 式の入力を整理する

### NumberとPosition

Numberは、アニメーションやModifierで変えられる数値を式へ渡すコントロールです。21.1マニュアルのpCustom説明では、Number 1–8を `n1` ～ `n8` として参照できます。力の倍率をNumberに割り当てれば、計算の構造を変えずに強さだけを調整できます。

Positionは、目標点などの位置を式へ渡すコントロールです。参照先のpCustom説明にはXYZ位置、および `p1x`・`p1y`・`p1z` などの変数が記載されています。動く目標点をPositionに接続して式の入力にする使い方を考えられます。

ただし**Positionの個数・次元については21.1マニュアル内に不一致があります**。pCustomForceの紹介文は最大4つのXY位置入力、pCustomの説明はPosition 1–8のXYZコントロールと記載しています。pCustomForceで使える正確な個数・表示名は実機Inspectorで要確認です。

### SetupとIntermediate

pCustomForceのInspector構造はpCustomに類似するとされ、公式マニュアルはpCustomの説明へ案内しています。

- **Setup**：共通項を先に計算する場所。pCustomの説明ではフレームごとに先に評価されます。
- **Intermediate**：Setupの結果などを受け、中間計算を分けて後段の式で使うための場所。
- **Force / Torqueの式**：粒子へ加える移動方向の力、回転方向の力を定義する部分。

pCustomの資料には、位置 `px`・`py`・`pz`、速度 `vx`・`vy`・`vz`、年齢 `age`、寿命 `lifespan`、Region関連の `rgnhit`・`rgndist` なども記載されています。pCustomForceの式を設計する際の手掛かりになりますが、**すべての式欄での使用可否を実機確認したものではありません**。

<!-- capture:S320 -->

## 実機例：Force Xに定数を入力する

`pEmitter` から `pCustomForce` を通して `pRender` の2D出力へ接続し、Force Xの式欄に `0.01` を入力しました。24フレームと48フレームの粒子表示を記録しています。

評価開始条件を揃えた比較、式による加速量や軌道の因果は確認していません。Inspectorのタブはsynthetic click後に確認しました。透明市松はViewerの背景表示です。[接続と設定の記録](/img/fusion/captures/S320/readback.json)に条件を記載しています。

[![pEmitterからpCustomForceとpRenderへ接続した構成](/img/fusion/captures/S320/graph.png)](/img/fusion/captures/S320/graph.png)

粒子をpCustomForceへ入力します。

[![pCustomForceのForce Xに0.01を入力した式欄](/img/fusion/captures/S320/controls.png)](/img/fusion/captures/S320/controls.png)

Force Xに0.01を入力します。

[![48フレームの粒子表示](/img/fusion/captures/S320/result48.png)](/img/fusion/captures/S320/result48.png)

48フレームの表示です。

[![24フレームの粒子表示](/img/fusion/captures/S320/result24.png)](/img/fusion/captures/S320/result24.png)

24フレームの表示です。

[再現用Graph](/img/fusion/captures/S320/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S320/capture.json)

<!-- /capture:S320 -->

## 制作例

### 1. 動く一点へ光点を引き寄せる

```text
pEmitter → pCustomForce → pRender (2D) → Merge
                   ↑
            Position（目標点）
```

1. pEmitterで複数の光点を発生させ、初速を設定します。
2. pCustomForceのPositionを目標点として使います。
3. 各粒子の現在位置と目標位置の差から**目標へ向かう方向**を求め、Forceの式でその方向へ力を加える構成を設計します。
4. Numberを力の強さに割り当て、弱い値から調整します。
5. Positionをアニメーションさせ、pRenderで軌道の変化を確認します。

考え方は「**目標位置 − 粒子位置**から方向を求め、強さを掛ける」です。これは計算方針の説明であって、Inspectorへ貼り付ける完成式ではありません。過剰な加速を避けるには速度に応じた減衰も検討します。単純な引力だけなら、式を書くより[pPoint Force](./ppointforce)が適します。

### 2. 画像の明るさで力の強さを変える

```text
白黒の画像 ─────────→ pCustomForce (Image 1)
pEmitter ──(Particle)──→ pCustomForce ─→ pRender
```

1. 明るい部分と暗い部分を持つ2D画像をImage 1へ接続します。
2. pEmitterから粒子を送ります。
3. 粒子の位置に対応する画素を式で読み、明るい場所では強く、暗い場所では弱く力が働くよう倍率へ反映します。
4. 画像を変更して、同じ粒子発生設定で軌道がどう変わるか確認します。

Image 1は力を計算するための**参照画像**です。どのチャンネルをどの座標で読むかは式に合わせて設定する必要があります。画像を接続するだけで明暗が力になるわけではありません。Alphaの変化方向そのものを力にするだけなら[pGradientForce](./pgradientforce)が簡単です。

### 3. ロゴの中に入った粒子だけ回転させる

```text
ロゴのAlpha画像 ─────→ pCustomForce (Region: Bitmap)
pEmitter ──(Particle)──→ pCustomForce ─→ pRender (2D)
```

1. ロゴの内部が不透明、それ以外が透明な2D画像を用意します。
2. RegionタブでBitmapを選び、現れたRegion入力に画像を接続します。参照するチャンネルも指定します。
3. pCustomForceでTorqueの式を設定し、対象の粒子に回転方向の力を加えます。
4. ロゴ内とロゴ外の粒子の違いを比べます。

RegionはTorqueの式を作る場所ではなく**作用範囲を限定する入力**です。3D形状で範囲を作る場合はRegionをMeshに変更して3D Meshをつなぎます。

## ConditionsとRegionの違い

Conditionsは**どの粒子に効かせるか**を絞り、Regionは**どの場所で効かせるか**を絞ります。ConditionsのProbabilityは粒子ごと・フレームごとの適用確率、Start/End Ageは寿命の割合、Set ModeはParticle Setによる対象の選択です。

「Set 2の粒子がロゴ内にいるときだけ回転させる」なら、**SetをConditions、ロゴの場所をRegion**で指定します。共通設定の詳しい説明は[Particleノード](./index.md)を参照してください。

## 関連ノードとの使い分け

| ノード | 向いている操作 |
| --- | --- |
| [pDirectionalForce](./pdirectionalforce) | 重力や風など、一定方向へ加速させる |
| [pPoint Force](./ppointforce) | 一点へ引き寄せる、または遠ざける |
| [pGradientForce](./pgradientforce) | 画像のAlpha勾配から力を作る |
| [pTurbulence](./pturbulence) | 不規則な揺らぎを加える |
| **pCustomForce** | 数値・位置・画像などを組み合わせ、独自のForceやTorqueを計算する |
| [pCustom](./pcustom) | 粒子の位置・速度・色などの属性を式で直接操作する |

## 動かないとき

- **粒子が見えない**：Particle入力とpRenderの接続、2D/3Dの出力先を確認します。
- **力が作用しない**：式の内容に加え、Number、ConditionsのAge・Set・Probability、Regionの位置を確認します。
- **画像を入力しても変わらない**：Image 1 / 2の値を読む式、参照座標、参照チャンネルを確認します。Regionとの取り違えにも注意します。
- **動きが強すぎる**：pEmitterの初速や他のForceも確認し、pCustomForceの寄与を単独で比べます。
- **途中フレームで結果が違う**：粒子の時間評価とpRenderのPre-Rollを確認します。

## 出典と確認範囲

- **Blackmagic Design, DaVinci Resolve 21.1 Reference Manual**（September 2026）、Chapter 114「Particle Nodes」pp.2657–2658。pCustomForceの役割、ForceとTorque、Particle / Image 1・2 / Region入力、基本接続、pCustomへのInspector参照を確認。
- 同Chapter pp.2653–2656（pCustom）でNumber、Position、Setup、Intermediateと粒子属性の変数を参照。pp.2697–2699でConditionsとRegionの共通設定を確認。
- 制作例は公式資料から構成した**手順案**です。式の完成コード、pCustomForceのPosition入力数の不一致、実機の表示・レンダー、Force / Torqueの式欄の正確なラベル、性能・Edition差は未検証です。
