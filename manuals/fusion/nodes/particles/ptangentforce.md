---
title: pTangentForce
description: 粒子と基準位置・領域の位置関係に応じて接線方向の力を加え、粒子の進路を曲げるFusionのParticleノード。
doc_type: node
term_id: ptangentforce
term_short: pTangentForceは、粒子へ接線方向の力を加え、基準位置や領域の周囲へ進路を曲げるノード。
verification: partial
aliases: [pTangentForce, pTangent Force, pTF]
concepts: [particle-data, particle-region]
nodes: [pTangentForce]
node_family: particles
controls: [Random Seed, Center Position XYZ, Center Strength XYZ, Conditions, Region]
inputs: [particle, region]
outputs: [particle]
tasks: [particles, tangent-force, orbit]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-12"
---

# pTangentForce

pTangentForceは、<Term id="particle-data">Particle</Term>（粒子）に、基準位置や領域との位置関係から求めた**接線方向の力**を加えるノードです。まっすぐ移動していた光点の進路を横へ曲げ、指定した場所の周囲を回り込むような動きを作るときに使います。

粒子を新しく発生させたり、完成した画像を変形したりするノードではありません。pEmitterなどが作った粒子の運動へ力を加え、後段のParticleノードに渡します。粒子は位置や速度などを持つデータで、画像として見るには通常[pRender](./p-render)が必要です。基本的な仕組みは[Particleの基礎](../../learn/02-data/particle)を参照してください。

## 接線方向の力とは

ある粒子と基準となる位置・領域を結ぶ方向を考え、その方向に**垂直**な向きへ力を加えるのがpTangentForceの役割です。

たとえば、中心へ向かう方向に力を加えると粒子は中心へ近づきます。一方、その方向と直角に力を加えると、粒子は中心へ直行せず、横へ進路を変えようとします。これが「接線方向」という意味です。

ただし、**接線方向の力だけで必ずきれいな円軌道になるわけではありません**。粒子の発生位置・初速・ほかの力の影響を受けるため、まずpEmitterの動きと切り分けて調整します。また、Regionで指定する作用範囲と、Center Positionで指定する力の位置は同じ設定ではありません。

## 入力と出力

| 接続 | データ | 役割 |
| --- | --- | --- |
| Input（橙） | Particle | pEmitterなどから粒子を受け取る |
| Region（条件付き） | 2D Imageまたは3D Mesh | 接線方向の力を作用させる空間的な範囲を指定する |
| Output | Particle | 力の影響を受けた粒子を次のParticleノードへ渡す |

通常は橙色のParticle入力だけが表示されます。Inspectorの**Region**で**Bitmap**または**Mesh**を選ぶと、別のRegion入力が現れます。

- **Bitmap**を選んだ場合は2D画像を入力します。画像の選択したチャンネルによって、力の作用範囲を指定します。
- **Mesh**を選んだ場合は3Dメッシュを入力し、その形状を作用範囲の指定に使います。

追加端子は緑またはマゼンタで表示されます。これはParticle用の橙色の端子とは異なり、画像やメッシュを「新しい粒子」として追加する入力ではありません。

pTangentForceの出力は引き続きParticleデータです。通常のMergeへそのまま接続するのではなく、pRenderで描画可能な形式へ変換します。

## 最小構成

```text
pEmitter → pTangentForce → pRender［2D出力］→ Merge
                                                  ↑
                                               背景映像
```

1. [pEmitter](./p-emitter)で、位置と初速が確認しやすい粒子を発生させます。
2. pTangentForceを途中へ挿入し、Center Positionと各軸のCenter Strengthを調整します。
3. pRenderを**2D出力**にして、粒子を背景映像へMergeします。

pRenderの既定は3D出力です。2DのMergeにつながらないときは、pTangentForceの端子を疑う前にpRenderの出力設定を確認してください。3D空間のまま扱う場合は、pRenderの3D結果を3Dノードへ渡し、最後にRenderer 3Dで画像にします。

動きの違いを確認する際は、まずpTangentForceを一時的に無効にしてpEmitterだけの動きを見てから、有効に戻します。

## 主なInspector設定

### X / Y / Z Center Position

接線方向の力を配置する基準位置の3D座標を指定します。X・Yだけでなく、Z方向の奥行きも扱います。

画面上で粒子を回り込ませたい場所を決めるときは、まずこの位置を変えます。粒子と基準位置の距離・位置関係が変わると、接線方向の力の向きも変わり得ます。

### X / Y / Z Center Strength

各軸の接線方向の力の強さを個別に調整します。

軌道が分かりにくい場合は、いきなり3軸を同時に変更せず、X・Y・Zを一つずつ調整して粒子の進路を比較します。**値の正負が各軸の軌道を具体的にどう変えるか、既定値や数値範囲**は、参照したマニュアルだけでは確定できないため、ここでは断定しません。

### Random Seed / Randomize

ランダムな計算を使うFusionノードに共通する設定です。同じSeedでは同じランダム結果を再現でき、Randomizeで別のSeedを選べます。

これはpTangentForceが必ずランダムな方向へ力を加えるという意味ではありません。接線方向の力そのものと、ランダム結果の再現性は分けて考えます。

## ConditionsとRegionで作用対象を絞る

**Conditions**は「どの粒子に効かせるか」、**Region**は「空間のどこで効かせるか」を指定します。

Conditionsでは、粒子の寿命やグループなどで対象を制限できます。

- **Probability**：各粒子について各フレームで作用する確率を判定します。0.6なら、毎フレームそれぞれの粒子に60%の確率で作用します。一度選ばれた粒子が以後ずっと固定で選ばれるわけではありません。
- **Start / End Age**：寿命のどの区間に作用するかを割合で指定します。Startを0.8、Endを1.0にすると、寿命の最後の20%が対象です。
- **Set Mode / Set番号**：pEmitterなどで割り当てた粒子グループに応じ、作用対象を限定します。

RegionでBitmapを選んだ場合は、たとえば一部分だけを白くした画像を入力し、その画像の選択チャンネルを作用範囲の指定に利用できます。これにより、画面全体の粒子を曲げる代わりに、特定の場所を通過する粒子だけへ力を加える構成を考えられます。

ここで指定するのは**力の作用範囲**であり、pEmitterが粒子を生み出す位置ではありません。どちらの領域も設定できるため、役割を混同しないようにします。

## 制作例

### 光点の進路を看板の周囲で曲げる

```text
pEmitter → pTangentForce → pRender［2D］→ Merge
```

pEmitterで横方向へ進む小さな光点を発生させます。看板の周囲に曲がる動きを付けたい位置へpTangentForceのCenter Positionを配置し、Center Strengthを少しずつ変えます。

最初は追加のParticleノードを置かず、接線方向の力だけで軌道がどう変わるかを確認します。粒子が大きく飛びすぎる場合は、pEmitter側の初速とCenter Strengthを分けて見直してください。

背景の実写映像とはpRenderの2D出力をMergeで合成します。**これは粒子の動きを曲げる例であり、看板の輪郭に沿って衝突判定する機能ではありません**。物体に当たって跳ね返る表現は別のParticleノードと区別します。

### Bitmap画像で一部の粒子だけを回り込ませる

```text
pEmitter ──→ pTangentForce ──→ pRender［2D］
                  ↑
        Region: Bitmap用の2D画像
```

白黒の画像を作り、接線方向の力を使いたい場所を画像で指定します。pTangentForceのRegionメニューをBitmapにして、現れたRegion入力へ画像を接続します。

pEmitterから出る粒子のうち、指定した範囲にいるものへ力を作用させる構成です。Region画像はParticle入力ではなく、**どこで作用させるか**を決めるための情報です。期待した位置で変化が出ない場合は、Regionが参照する画像チャンネルと粒子の位置を確認します。

### 旋回と引力を別々に調整する

```text
pEmitter → pTangentForce → pPointForce → pRender［2D］
```

pTangentForceで横へ曲げる力を作り、[pPointForce](./ppointforce)で特定の点へ引き寄せる力を加える構成です。光点がある場所の周囲を回りつつ集まる動きを検討するときに使えます。

pPointForceを一時的に無効にすれば、接線方向の力による動きだけを確認できます。次にpPointForceを有効にして引力を追加すると、中心へ近づく動きと横へ曲がる動きを分けて調整できます。粒子の初速や力の大きさによって結果は変わるため、特定の軌道が保証される構成ではありません。

## 似たノードとの違い

| ノード | 加える力 | 選ぶ場面 |
| --- | --- | --- |
| **pTangentForce** | 粒子と基準位置・領域の位置関係による接線方向の力 | 直進する粒子の進路を横へ曲げたい |
| [pPointForce](./ppointforce) | 指定点へ向かう引力、または離れる斥力 | 一点へ集めたい、中心から散らしたい |
| [pVortex](./pvortex) | 渦の回転方向の力 | 渦へ巻き込まれるような運動を作りたい |
| [pDirectionalForce](./pdirectionalforce) | 指定した方向へ向かう力 | 重力や風のように一定方向へ押したい |
| [pTurbulence](./pturbulence) | 不規則な揺らぎを生む力 | 煙や火の粉の動きにばらつきを付けたい |

pVortexにも回転する力がありますが、両者を同じ機能とは扱いません。pTangentForceは接線方向の力を各軸で調整し、pVortexは渦のStrength・Power・Sizeなどを使って旋回を作ります。どちらが適しているかは、粒子の進路を「横へ曲げたい」のか「渦として回したい」のかで選びます。

## うまく動かないとき

- **粒子が見えない**：pEmitterからParticleが出ているか、pRenderの出力が後段の2D・3Dノードと合っているかを確認します。
- **力の変化が分からない**：pTangentForceを無効・有効にして比較します。Center Position、各軸のCenter Strength、pEmitterの初速を順に見直します。
- **一部の粒子だけ反応する**：ConditionsのProbability、Start/End Age、Set Modeを確認します。Regionを使っている場合は作用範囲から外れていないか確認します。
- **Region入力が見つからない**：RegionメニューでBitmapまたはMeshを選ぶと条件付き入力が表示されます。
- **指定した画像が効かない**：Bitmapの画像がRegion端子へつながっているか、選択チャンネルと位置が適切かを確認します。
- **円を描くはずなのに逸れる**：接線方向の力は円軌道を保証しません。初速や併用した力を減らし、最小構成で進路の変化を確かめます。

ほかの粒子ノードは[Particleノード一覧](./index.md)を参照してください。

## 出典・バージョンと未確認事項

- **一次資料**：*DaVinci Resolve 21.1 Reference Manual*（September 2026）、Chapter 114「Particle Nodes」、pp.2687–2688（pTangent Forceの役割、入力、Center Position / Center Strength、Randomize）、pp.2697–2699（Particle共通のConditionsとRegion）。
- **対象**：DaVinci Resolve 21.1のFusionページ。接続例はマニュアルで確認できた入出力と各ノードの役割から組み立てた制作例で、実機での描画結果を確認したものではありません。
- **未確認**：接線方向の力の内部計算式、各軸設定の正負による厳密な方向変化、既定値と数値範囲、REGID、現在の実機での描画結果、Edition差。これらは推測で補わず、`verification: partial`を維持します。
