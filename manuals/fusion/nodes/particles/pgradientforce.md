---
title: pGradientForce
description: 画像のAlphaの変化を粒子に働く力へ変換するFusion Particleノード。入力画像と作用範囲の違い、Strengthの方向、制作例を説明する。
doc_type: node
term_id: pgradientforce
term_short: pGradientForceは、画像のAlphaの変化から粒子を動かす力を作るNode。
verification: partial
aliases: [pGradientForce, pGradient Force, pGF]
concepts: [particle-data, image-data, alpha, particle-region]
nodes: [pGradientForce]
node_family: particles
controls: [Random Seed, Strength, Conditions, Style, Region, Settings]
inputs: [particle, image, region]
outputs: [particle]
tasks: [particles, gradient-force, flow-field]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-12"
---

# pGradientForce

pGradientForceは、2D <Term id="image">Image</Term>の**Alpha（不透明度）が変わる方向**を読み取り、<Term id="particle-data">Particle</Term>を加速させるNodeです。画像そのものを変形するのではなく、画像を粒子の動き方を指定するための資料として使います。

たとえば、中心が不透明で周辺ほど透明になる画像を入力すると、正のStrengthでは中心から外側へ向かう力を作れます。負のStrengthでは方向が逆になり、透明な側から不透明な側へ向かう力になります。

ここでいう「勾配（gradient）」は、Alphaの値が位置によってどちらへ、どの程度変化しているかということです。マニュアルは、粒子が**高いAlphaから低いAlphaへ**加速するのを通常の方向として説明しています。

## 入力・出力

| 接続 | データ | 役割 |
| --- | --- | --- |
| **Input（オレンジ）** | Particle | pEmitterなどで作った粒子を受け取り、力を適用する |
| **Image（緑）** | 2D Image | Alphaの勾配を読み取る画像。RGBの明暗ではなくAlphaが重要 |
| **Region（条件付き）** | Bitmap Imageまたは3D Mesh | 力を作用させる範囲を限定する。RegionタブでBitmapかMeshを選ぶと入力が現れる |
| **出力** | Particle | 力の影響を受けた粒子を後段のParticleノードへ渡す |

Region入力の色は、BitmapまたはMeshを選んだ状態によってマゼンタや青緑系になります。Bitmapの場合は選択したチャンネル、Meshの場合は3D形状が作用範囲を定めます。

**Image入力とRegion入力は別の役割です。** Imageは「どちらへ動かすか」を作り、Regionは「どの範囲で働かせるか」を制限します。Regionを接続しなくても、ImageのAlphaから力を作れます。

pGradientForceの出力は画像ではありません。結果を見るには、後段で[pRender](./p-render)を使ってParticleを画像または3D形状へ変換します。

## 基本構成

```text
Ellipse Mask ──(Effect Mask)──→ Background ──(2D Image)──┐
                                                          ├─→ pGradientForce ─→ pRender
pEmitter ────────────────────────(Particle)──────────────┘
```

上段のBackgroundには、ぼかした円形のEllipse Maskを適用して、中心のAlphaが高く周辺で低くなる画像を作ります。そのBackgroundを**緑のImage入力**へ、pEmitterを**オレンジのParticle入力**へ接続します。pGradientForceをParticle処理の途中へ挟み、最後にpRenderで表示します。

### Alphaを確認する

pGradientForceが参照するのは入力画像の**Alphaチャンネル**です。RGBで白黒模様が見えていても、全体のAlphaが1で一定なら、白黒の境界を力として扱うことはできません。

Fast Noiseを使う場合も同様です。マニュアルにはFast NoiseでAlpha勾配を用意する例がありますが、RGBのノイズ模様を作っただけで済ませず、ViewerでAlphaを表示して値が変化していることを確かめます。必要なら模様からAlphaを作る処理を前段に加えます。

境界が極端に硬い画像より、Alphaが滑らかに変化する画像の方が、力の向きを段階的に作りやすくなります。

## 主な設定

### Strength

画像のAlpha勾配から得た力の強さを指定します。

- **正の値**：Alphaの高い側から低い側へ粒子を加速します。
- **負の値**：方向を反転し、Alphaの低い側から高い側へ加速します。
- **0**：このNodeが加える勾配による力をなくします。

Strengthは粒子の速度を直接指定する値ではありません。ほかのForceノードや粒子の初速も結果に影響するため、少量から増減して動きを確認します。

### Random Seed / Randomize

Particleノードに共通する乱数の設定です。マニュアルでは、同じSeedなら乱数を使う処理の結果を再現できると説明されています。ただし、Alpha勾配そのものの向きがRandom Seedでランダム化されるという記載ではありません。

### Conditions / Style / Region / Settings

これらはParticle系で共通するタブです。Conditionsでは条件に合うParticleへの適用を絞り、Regionでは空間的な作用範囲を設定します。共通項目の全体像は[Particleノード](./index)を参照してください。pGradientForce固有の力の調整項目として、21.1マニュアルが挙げるのはStrengthです。

## 運用例

### 1. 円の中心から粒子を押し出す

1. BackgroundへSoft Edgeを付けたEllipse Maskを接続し、中央が不透明で外側へ透明になるAlpha画像を作ります。
2. pEmitterで画面中央付近から粒子を発生させます。
3. BackgroundをImage入力、pEmitterをParticle入力に接続します。
4. Strengthを正の小さな値から上げると、粒子はAlphaの低い外側へ加速する方向に影響を受けます。
5. pRenderを2D出力にして素材へ合成します。Strengthを負にすると、中心へ向かう力に切り替わります。

粒子が中心に集まる／外へ広がる表現を、固定の一点に向かう吸引設定ではなく、画像のAlpha分布を変更して制御できます。

### 2. ノイズ状の流れに煙やほこりを乗せる

1. Fast Noiseなどで不規則な模様を作り、**Alphaにもその模様が反映される画像**を用意します。
2. 画像をpGradientForceの緑入力へ、煙・ほこりのParticleをオレンジ入力へ渡します。
3. Strengthを調整すると、粒子はAlphaの高低に応じて局所的に異なる方向へ力を受けます。
4. [pTurbulence](./pturbulence)を続けて使う場合は、画像由来の大きな流れと、粒子ごとの細かな乱れを分けて調整します。

これは画像の輪郭を粒子が必ず正確になぞる処理ではありません。粒子の初速、ほかの力、Alpha分布によって軌跡は変わります。

### 3. 特定の領域だけで動きを変える

同じAlpha勾配の画像を使いながら、RegionをBitmapに設定し、別のBitmap Imageで作用範囲を指定します。たとえば画面右側だけをRegionにすると、右側でだけ勾配由来の力を作用させる構成にできます。

ここでは、**Image入力に与える画像が力の方向**、**Region入力に与える画像が有効範囲**です。Region画像をImage入力へ間違って挿すと、意図した制限ではなく別の力の分布になります。Meshを使う場合はRegionをMeshにして3D Meshを接続します。

## 関連Nodeとの使い分け

| Node | 主な違い |
| --- | --- |
| [pDirectionalForce](./pdirectionalforce) | 画像を使わず、設定した方向に一定の力を加える |
| [pPoint Force](./ppointforce) | 指定した点を基準に引力・斥力を作る |
| [pTurbulence](./pturbulence) | 不規則な変動を加える。任意の画像のAlpha勾配を読む仕組みとは異なる |
| [pVortex](./pvortex) | 渦を作る回転方向の力を加える |
| [pRender](./p-render) | 力は加えず、Particleの結果を目に見える出力へ変換する |

## 確認するときのポイント

- 粒子が動かない場合は、Particle入力にpEmitter系の出力が入っているか、Image入力の**Alphaが一定ではないか**を確認します。
- 意図と逆方向へ動く場合はStrengthの符号と、元画像のAlphaが高い場所を確認します。
- Regionを使う場合は、ImageとRegionを入れ替えていないかを確認します。
- pRenderの前では通常の2D Imageを出力しないため、画像用NodeをそのままParticle出力へつなぐことはできません。

## 出典と確認範囲

- **Blackmagic Design, DaVinci Resolve 21.1 Reference Manual**（September 2026）、Chapter 114「Particle Nodes」pp.2670–2671。Alpha勾配による力の向き、Particle / Image / Region入力、Basic Node Setup、Strengthの正負、Random Seedと共通タブを確認。
- 本文の円形Alpha・ノイズ・Regionの接続例は、上記仕様から構成した制作手順です。Resolve 21.1実機でのレンダー確認は未実施です。
- 勾配の内部計算式、Strengthの既定値・数値範囲、Editionごとの違い、実際の処理負荷は未確認です。
